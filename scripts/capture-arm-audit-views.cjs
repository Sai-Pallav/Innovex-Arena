const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\3f2b093d-70ea-4bac-ad62-5340769ae47f';

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
      '--window-size=1920,1080'
    ],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  // Hide UI overlays, freeze loop
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      header, nav, footer, h1, h2, h3, p, button, a, .badge, .grid, [class*="hero"], [class*="stats"] {
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

    const scene = window.__robotScene;
    if (scene) {
      scene.stop();
      if (scene.resizeObserver) {
        scene.resizeObserver.disconnect();
      }
      scene.getRenderer().setSize(1920, 1080);
      const cam = scene.getCamera();
      cam.aspect = 1920 / 1080;
      cam.updateProjectionMatrix();

      const root = scene.getScene().getObjectByName('RobotRoot');
      if (root) {
        root.rotation.set(0, 0, 0);
        root.position.set(0, 0, 0);
        root.scale.setScalar(1.0);
        root.updateMatrixWorld(true);
      }
    }
  });

  async function snap(filename, targetSelector, camOffset) {
    await page.evaluate(({ targetSelector, camOffset }) => {
      const scene = window.__robotScene;
      if (!scene) return;
      const cam = scene.getCamera();
      let targetObj = null;

      scene.getScene().traverse(o => {
        if (!targetObj && o.name && o.name.toLowerCase().includes(targetSelector.toLowerCase())) {
          targetObj = o;
        }
      });

      const wp = new cam.position.constructor();
      if (targetObj) {
        targetObj.getWorldPosition(wp);
      } else {
        wp.set(0, 0.4, 0);
      }

      cam.position.set(wp.x + camOffset.x, wp.y + camOffset.y, wp.z + camOffset.z);
      cam.lookAt(wp.x + (camOffset.lookOffset?.x || 0), wp.y + (camOffset.lookOffset?.y || 0), wp.z + (camOffset.lookOffset?.z || 0));
      cam.updateProjectionMatrix();
      scene.getRenderer().render(scene.getScene(), cam);
    }, { targetSelector, camOffset });

    await new Promise(r => setTimeout(r, 400));
    const targetFile = path.join(outDir, filename);
    await page.screenshot({ path: targetFile, fullPage: false });
    console.log(`Saved ${filename}`);
  }

  // 1. Full front view (upper body and both arms from shoulder to fingertips)
  await snap('01_full_front_view.png', 'RobotRoot', { x: 0, y: 0.12, z: 1.45, lookOffset: { x: 0, y: 0.10, z: 0 } });

  // 2. 3/4 front view (full upper body and both arms)
  await snap('02_three_quarter_view.png', 'RobotRoot', { x: 0.65, y: 0.14, z: 1.30, lookOffset: { x: 0, y: 0.10, z: 0 } });

  // 3. Side profile view of Left Arm
  await snap('03_side_view.png', 'LeftUpperArmGroup', { x: -0.85, y: -0.06, z: 0.0, lookOffset: { x: 0, y: -0.06, z: 0 } });

  // 4. Shoulder close-up (Left shoulder module & torso transition)
  await snap('04_shoulder_closeup.png', 'LeftShoulderModule', { x: -0.22, y: 0.02, z: 0.42, lookOffset: { x: 0, y: 0, z: 0 } });

  // 5. Upper-arm close-up (Left upper arm & transitions)
  await snap('05_upper_arm_closeup.png', 'LeftUpperArmGroup', { x: -0.15, y: -0.06, z: 0.38, lookOffset: { x: 0, y: -0.06, z: 0 } });

  // 6. Elbow close-up (Left elbow articulation)
  await snap('06_elbow_closeup.png', 'LeftElbowRoot', { x: -0.12, y: 0.0, z: 0.30, lookOffset: { x: 0, y: 0, z: 0 } });

  // 7. Forearm close-up (Left forearm gauntlet & taper)
  await snap('07_forearm_closeup.png', 'LeftForearmGroup', { x: -0.10, y: -0.04, z: 0.32, lookOffset: { x: 0, y: -0.04, z: 0 } });

  // 8. Wrist close-up (Left wrist mechanical interface)
  await snap('08_wrist_closeup.png', 'LeftWristRoot', { x: -0.08, y: 0.0, z: 0.22, lookOffset: { x: 0, y: 0, z: 0 } });

  // 9. Palm close-up (Left hand dorsal plate, knuckles, thumb)
  await snap('09_palm_closeup.png', 'LeftHandRoot', { x: -0.06, y: -0.02, z: 0.20, lookOffset: { x: 0, y: -0.02, z: 0 } });

  // 10. Finger close-up (Left hand digits articulation)
  await snap('10_finger_closeup.png', 'LeftHandRoot', { x: -0.04, y: -0.05, z: 0.16, lookOffset: { x: 0, y: -0.05, z: 0 } });

  await browser.close();
  console.log('All snapshots complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
