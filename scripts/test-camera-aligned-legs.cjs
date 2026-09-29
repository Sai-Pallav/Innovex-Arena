const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\9f13537d-b9eb-4351-a786-cf47dd57df3f\\experiments';

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
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 3000));

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

  async function test(name, lYaw, rYaw, lRoll = 0.088, rRoll = 0.088, pitch = -0.085, kPitch = 0.165) {
    await page.evaluate(({ lYaw, rYaw, lRoll, rRoll, pitch, kPitch }) => {
      const sceneObj = window.__robotScene;
      if (!sceneObj) return;
      sceneObj.stop(); // Stop animation loop from overwriting our test rotations
      const scene = sceneObj.getScene();
      const cam = sceneObj.getCamera();

      // Temporarily stop animation loop from overriding hips
      const leftHip = scene.getObjectByName('LeftHip');
      const rightHip = scene.getObjectByName('RightHip');
      const leftKnee = scene.getObjectByName('LeftShinPivot');
      const rightKnee = scene.getObjectByName('RightShinPivot');

      if (leftHip && rightHip) {
        leftHip.rotation.set(pitch, lYaw, -lRoll);
        rightHip.rotation.set(pitch, rYaw, rRoll);
      }
      if (leftKnee && rightKnee) {
        leftKnee.rotation.x = kPitch;
        rightKnee.rotation.x = kPitch;
      }

      const pelvic = scene.getObjectByName('PelvicShieldPlate');
      let targetY = -0.4;
      if (pelvic) {
        const pos = pelvic.position.clone();
        pelvic.getWorldPosition(pos);
        targetY = pos.y;
      }

      cam.position.set(0, targetY - 0.11, 1.05);
      cam.lookAt(0, targetY - 0.13, 0);
      cam.updateProjectionMatrix();

      sceneObj.getRenderer().render(scene, cam);
    }, { lYaw, rYaw, lRoll, rRoll, pitch, kPitch });

    await new Promise(r => setTimeout(r, 400));
    const filePath = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: filePath });
    console.log(`Saved ${name}.png`);
  }

  // Baseline was: Left localRot.y = -0.03, Right localRot.y = +0.03
  // Test 1: Symmetrical relative to root (lYaw = -0.065, rYaw = 0.088)
  await test('cam_test1_root_symmetric', -0.065, 0.088);

  // Test 2: Camera-facing neutral (root yaw is -0.1745, so to face camera: lYaw = +0.13, rYaw = +0.21)
  await test('cam_test2_both_face_camera', 0.12, 0.18);

  // Test 3: Gentle bilateral flare from camera center (lYaw = +0.06, rYaw = +0.12)
  await test('cam_test3_gentle_camera_flare', 0.06, 0.12);

  // Test 4: True anatomical stance (lYaw = -0.04, rYaw = 0.05, slightly narrower roll 0.075)
  await test('cam_test4_athletic_clean', -0.04, 0.05, 0.076, 0.076, -0.075, 0.145);

  // Test 5: Heroic Grounded (lYaw = -0.02, rYaw = 0.06, roll 0.082)
  await test('cam_test5_heroic_balanced', -0.02, 0.06, 0.082, 0.082, -0.080, 0.155);

  await browser.close();
  console.log('Camera alignment tests complete!');
}

main().catch(console.error);
