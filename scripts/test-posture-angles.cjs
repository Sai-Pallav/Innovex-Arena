const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\62d42691-7ab2-4a2b-8662-43cf88ac5647\\experiments';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function testAngles(config, label) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--window-size=1600,1200'
    ],
    defaultViewport: { width: 1600, height: 1200 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 3500));

  // Hide UI text/overlays for clean 3D capture
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      header, nav, footer, h1, h2, h3, p, button, a, .badge, .grid, [class*="hero"], [class*="stats"], [class*="atmosphere"] {
        display: none !important;
      }
      #home-hero > div > div:first-child {
        display: none !important;
      }
      #home-hero > div > div:last-child {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 999999 !important;
      }
    `;
    document.head.appendChild(style);
  });

  await page.evaluate((cfg) => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;

    // Apply test angles to robot controllers if available
    const root = sceneObj.getScene().getObjectByName('RobotRoot');
    const controller = sceneObj.getController ? sceneObj.getController() : null;
    const armCtrl = controller && controller.getArmController ? controller.getArmController() : null;

    if (armCtrl) {
      if (cfg.handPose) {
        armCtrl.setHandPose('both', cfg.handPose, 0);
      }
      if (cfg.leftOverrides) {
        armCtrl.setPoseOverrides('left', cfg.leftOverrides);
      }
      if (cfg.rightOverrides) {
        armCtrl.setPoseOverrides('right', cfg.rightOverrides);
      }
    }
  }, config);

  await new Promise(r => setTimeout(r, 500));

  async function capture(filename, targetName, camOffset, lookOffset = { x: 0, y: 0, z: 0 }, viewport = { width: 1200, height: 1600 }) {
    await page.setViewport(viewport);
    await page.evaluate(({ targetName, camOffset, lookOffset, viewport }) => {
      const sceneObj = window.__robotScene;
      if (!sceneObj) return;
      const scene = sceneObj.getScene();
      let target = scene.getObjectByName(targetName);
      if (!target) {
        scene.traverse(o => {
          if (!target && o.name && o.name.toLowerCase() === targetName.toLowerCase()) target = o;
        });
      }
      if (!target) return;

      const wp = target.position.clone();
      target.getWorldPosition(wp);

      const cam = sceneObj.getCamera();
      cam.aspect = viewport.width / viewport.height;
      cam.near = 0.01;
      cam.position.set(wp.x + camOffset.x, wp.y + camOffset.y, wp.z + camOffset.z);
      cam.lookAt(wp.x + lookOffset.x, wp.y + lookOffset.y, wp.z + lookOffset.z);
      cam.updateProjectionMatrix();
      sceneObj.getRenderer().setSize(viewport.width, viewport.height);
      sceneObj.getRenderer().render(scene, cam);
    }, { targetName, camOffset, lookOffset, viewport });

    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, `${label}_${filename}`) });
  }

  await capture('full.png', 'chestplate', { x: 0, y: -0.22, z: 1.25 }, { x: 0, y: -0.22, z: 0 }, { width: 1200, height: 1600 });
  await capture('left_arm.png', 'LeftRobotArmRoot', { x: 0, y: -0.28, z: 0.95 }, { x: 0, y: -0.28, z: 0 }, { width: 600, height: 1400 });
  await capture('right_arm.png', 'RightRobotArmRoot', { x: 0, y: -0.28, z: 0.95 }, { x: 0, y: -0.28, z: 0 }, { width: 600, height: 1400 });

  await browser.close();
  console.log(`Experiment ${label} captured!`);
}

async function run() {
  // Test baseline with symmetric upper arm yaw (0.14 instead of 0.22)
  // and more natural semi-pronated wrist roll (-0.78 vs +0.78)
  // and natural elbow bend (-0.42)
  await testAngles({
    leftOverrides: {
      upperArm: { x: -0.14, y: 0.14, z: -0.185 },
      elbowBend: -0.42,
      wrist: { roll: -0.32, pitch: 0.0, yaw: 0.0 }
    },
    rightOverrides: {
      upperArm: { x: -0.14, y: -0.14, z: 0.185 },
      elbowBend: -0.42,
      wrist: { roll: 0.32, pitch: 0.0, yaw: 0.0 }
    }
  }, 'exp1_sym_elbow42_roll32');
}

run().catch(console.error);
