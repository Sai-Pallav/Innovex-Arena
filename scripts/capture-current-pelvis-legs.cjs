const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\9f13537d-b9eb-4351-a786-cf47dd57df3f';
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
  });

  await new Promise(r => setTimeout(r, 1000));

  // Capture full home page view
  await page.screenshot({ path: path.join(outDir, '00_current_full_home.png') });
  console.log('Saved 00_current_full_home.png');

  // Now focus camera directly on waist, hips, thighs, knees
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const scene = sceneObj.getScene();
    const cam = sceneObj.getCamera();

    // Look for pelvic plate or waist or hip
    let pelvic = scene.getObjectByName('PelvicShieldPlate');
    let targetY = -0.4;
    if (pelvic) {
      const pos = pelvic.position.clone();
      pelvic.getWorldPosition(pos);
      targetY = pos.y;
    }

    // Set camera to frame from waist down to knees
    cam.position.set(0, targetY - 0.12, 1.15);
    cam.lookAt(0, targetY - 0.14, 0);
    cam.updateProjectionMatrix();

    sceneObj.getRenderer().render(scene, cam);
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, '01_current_pelvis_legs_closeup.png') });
  console.log('Saved 01_current_pelvis_legs_closeup.png');

  // Let's also extract transform and angle data of hips, thighs, knees, shins
  const legTransforms = await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return null;
    const scene = sceneObj.getScene();

    function getInfo(name) {
      const obj = scene.getObjectByName(name);
      if (!obj) return null;
      const wp = obj.position.clone();
      obj.getWorldPosition(wp);
      const wq = obj.quaternion.clone();
      obj.getWorldQuaternion(wq);
      const we = obj.rotation.clone().setFromQuaternion(wq);
      return {
        name,
        localPos: { x: +obj.position.x.toFixed(4), y: +obj.position.y.toFixed(4), z: +obj.position.z.toFixed(4) },
        localRot: { x: +obj.rotation.x.toFixed(4), y: +obj.rotation.y.toFixed(4), z: +obj.rotation.z.toFixed(4) },
        worldPos: { x: +wp.x.toFixed(4), y: +wp.y.toFixed(4), z: +wp.z.toFixed(4) },
        worldRot: { x: +we.x.toFixed(4), y: +we.y.toFixed(4), z: +we.z.toFixed(4) }
      };
    }

    return {
      leftHipPivot: getInfo('LeftHipPivot'),
      rightHipPivot: getInfo('RightHipPivot'),
      leftLegRoot: getInfo('LeftLegRoot'),
      rightLegRoot: getInfo('RightLegRoot'),
      leftHip: getInfo('LeftHip'),
      rightHip: getInfo('RightHip'),
      thighMount_L: getInfo('ThighMount_L'),
      thighMount_R: getInfo('ThighMount_R'),
      leftThigh: getInfo('LeftThigh'),
      rightThigh: getInfo('RightThigh'),
      kneePivot_L: getInfo('KneePivot_L'),
      kneePivot_R: getInfo('KneePivot_R'),
      leftKnee: getInfo('LeftKnee'),
      rightKnee: getInfo('RightKnee'),
      patellaShield_L: getInfo('PatellaShield_L'),
      patellaShield_R: getInfo('PatellaShield_R'),
      leftShinPivot: getInfo('LeftShinPivot'),
      rightShinPivot: getInfo('RightShinPivot'),
      pelvicShieldPlate: getInfo('PelvicShieldPlate'),
      robotRoot: getInfo('RobotRoot')
    };
  });

  fs.writeFileSync(path.join(outDir, 'leg_transforms.json'), JSON.stringify(legTransforms, null, 2));
  console.log('Saved leg_transforms.json');

  await browser.close();
}

main().catch(console.error);
