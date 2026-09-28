const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\62d42691-7ab2-4a2b-8662-43cf88ac5647';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function main() {
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
  console.log('Navigating to http://localhost:5173/ ...');
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

    const sceneObj = window.__robotScene;
    if (sceneObj) {
      if (sceneObj.resizeObserver) {
        sceneObj.resizeObserver.disconnect();
      }
      const cam = sceneObj.getCamera();
      cam.aspect = 1600 / 1200;
      cam.updateProjectionMatrix();
      sceneObj.getRenderer().setSize(1600, 1200);
    }
  });

  // Extract kinematic data from the scene
  const armKinematics = await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return null;
    const scene = sceneObj.getScene();

    function dumpHierarchy(rootName) {
      const root = scene.getObjectByName(rootName);
      if (!root) return null;
      const nodes = [];
      root.traverse(o => {
        if (o.type === 'Group' || o.type === 'Object3D') {
          const wp = new o.position.constructor();
          o.getWorldPosition(wp);
          const wq = new o.quaternion.constructor();
          o.getWorldQuaternion(wq);
          const we = new o.rotation.constructor().setFromQuaternion(wq);
          nodes.push({
            name: o.name || 'unnamed',
            parent: o.parent ? o.parent.name : null,
            localPos: { x: +o.position.x.toFixed(4), y: +o.position.y.toFixed(4), z: +o.position.z.toFixed(4) },
            localRot: { x: +o.rotation.x.toFixed(4), y: +o.rotation.y.toFixed(4), z: +o.rotation.z.toFixed(4) },
            worldPos: { x: +wp.x.toFixed(4), y: +wp.y.toFixed(4), z: +wp.z.toFixed(4) },
            worldRot: { x: +we.x.toFixed(4), y: +we.y.toFixed(4), z: +we.z.toFixed(4) }
          });
        }
      });
      return nodes;
    }

    return {
      leftArm: dumpHierarchy('LeftRobotArmRoot'),
      rightArm: dumpHierarchy('RightRobotArmRoot')
    };
  });

  fs.writeFileSync(path.join(outDir, 'arm_full_hierarchy.json'), JSON.stringify(armKinematics, null, 2));
  console.log('Hierarchy dumped to arm_full_hierarchy.json');

  async function captureTarget(filename, targetName, camOffset, lookOffset = { x: 0, y: 0, z: 0 }, viewport = { width: 1600, height: 1200 }) {
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

    await new Promise(r => setTimeout(r, 600));
    const filePath = path.join(outDir, filename);
    await page.screenshot({ path: filePath });
    console.log(`Saved screenshot: ${filename}`);
  }

  // 1. Full Upper Body & Arms Posture (like Image 1) - 1200x1600 portrait
  await captureTarget('01_current_posture_full.png', 'chestplate', { x: 0, y: -0.22, z: 1.25 }, { x: 0, y: -0.22, z: 0 }, { width: 1200, height: 1600 });

  // 2. Entire Left Arm (robot's right arm, viewer's left - like Image 3) - vertical portrait crop
  await captureTarget('02_current_left_arm_portrait.png', 'LeftRobotArmRoot', { x: 0, y: -0.34, z: 0.95 }, { x: 0, y: -0.34, z: 0 }, { width: 600, height: 1400 });

  // 3. Entire Right Arm (robot's left arm, viewer's right - like Image 2) - vertical portrait crop
  await captureTarget('03_current_right_arm_portrait.png', 'RightRobotArmRoot', { x: 0, y: -0.34, z: 0.95 }, { x: 0, y: -0.34, z: 0 }, { width: 600, height: 1400 });

  await browser.close();
  console.log('Capture script finished!');
}

main().catch(console.error);
