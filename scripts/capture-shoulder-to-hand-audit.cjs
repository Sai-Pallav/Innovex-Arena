const puppeteer = require('puppeteer-core');
const path = require('path');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\d0165bcb-f2b5-4024-9912-f9a9324597a7';

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
        // keep root at default position or (0,0,0)
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
    await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
    console.log(`Saved ${filename}`);
  }

  // 1. Both arms and chest front overview (Framing shoulders all the way to fingertips)
  await snap('audit_shoulders_to_hands_full.png', 'chestplate', { x: 0, y: -0.25, z: 1.48 });
  await snap('audit_arms_front_overview.png', 'chestplate', { x: 0, y: -0.15, z: 0.95 });

  // 2. Left arm (viewer's left or robot's left)
  await snap('audit_left_arm_full.png', 'leftrobotarmroot', { x: 0, y: -0.15, z: 0.65 });

  // 3. Right arm
  await snap('audit_right_arm_full.png', 'rightrobotarmroot', { x: 0, y: -0.15, z: 0.65 });

  // 4. Shoulder Closeup Left
  await snap('audit_shoulder_closeup_left.png', 'leftshouldermodule', { x: 0, y: 0, z: 0.38 });

  // 5. Shoulder Closeup Right
  await snap('audit_shoulder_closeup_right.png', 'rightshouldermodule', { x: 0, y: 0, z: 0.38 });

  // 6. Elbow Closeup Left
  await snap('audit_elbow_closeup_left.png', 'leftelbow', { x: 0, y: 0, z: 0.32 });

  // 7. Hand Closeup Left Front/Palmar
  await snap('audit_hand_left_front.png', 'lefthand', { x: 0, y: -0.02, z: 0.28 });

  // 8. Hand Closeup Right Front/Palmar
  await snap('audit_hand_right_front.png', 'righthand', { x: 0, y: -0.02, z: 0.28 });

  // 9. Hand Closeup Left 3/4 perspective
  await snap('audit_hand_left_34.png', 'lefthand', { x: 0.15, y: 0.05, z: 0.22, lookOffset: { x: 0, y: -0.02, z: 0 } });

  // 10. Hand Closeup Right 3/4 perspective
  await snap('audit_hand_right_34.png', 'righthand', { x: -0.15, y: 0.05, z: 0.22, lookOffset: { x: 0, y: -0.02, z: 0 } });

  await browser.close();
  console.log('All audit captures complete!');
}

main().catch(err => {
  console.error('Audit capture failed:', err);
  process.exit(1);
});
