const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\35d32577-543d-4a84-baa5-bb7d94aaae1c\\hand_captures';
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
      '--window-size=1600,1400'
    ],
    defaultViewport: { width: 1600, height: 1400 }
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
      const cam = sceneObj.getCamera();
      cam.aspect = 1600 / 1400;
      cam.updateProjectionMatrix();
      sceneObj.getRenderer().setSize(1600, 1400);
    }
  });

  // Extract world coordinates of hands
  const handData = await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return null;
    const scene = sceneObj.getScene();

    const leftHand = scene.getObjectByName('LeftHandRoot');
    const rightHand = scene.getObjectByName('RightHandRoot');

    function getCoords(obj) {
      if (!obj) return null;
      const wp = obj.position.clone();
      obj.getWorldPosition(wp);
      return { x: wp.x, y: wp.y, z: wp.z };
    }

    return {
      leftHand: getCoords(leftHand),
      rightHand: getCoords(rightHand)
    };
  });

  console.log('Hand coordinates:', handData);

  async function captureTarget(filename, targetName, camOffset, lookOffset = { x: 0, y: 0, z: 0 }) {
    await page.evaluate(({ targetName, camOffset, lookOffset }) => {
      const sceneObj = window.__robotScene;
      if (!sceneObj) return;
      const scene = sceneObj.getScene();
      const target = scene.getObjectByName(targetName);
      if (!target) return;

      const wp = target.position.clone();
      target.getWorldPosition(wp);

      const cam = sceneObj.getCamera();
      cam.near = 0.01;
      cam.position.set(wp.x + camOffset.x, wp.y + camOffset.y, wp.z + camOffset.z);
      cam.lookAt(wp.x + lookOffset.x, wp.y + lookOffset.y, wp.z + lookOffset.z);
      cam.updateProjectionMatrix();
      sceneObj.getRenderer().render(scene, cam);
    }, { targetName, camOffset, lookOffset });

    await new Promise(r => setTimeout(r, 600));
    const filePath = path.join(outDir, filename);
    await page.screenshot({ path: filePath });
    console.log(`Saved screenshot: ${filename}`);
  }

  // Capture Right Hand (matches user reference image 1)
  // 1. Right Hand Front / Dorsal (matching uploaded image 1)
  await captureTarget('01_right_hand_dorsal_front.png', 'RightHandRoot', { x: 0.0, y: -0.015, z: 0.28 }, { x: 0, y: -0.04, z: 0 });
  // 2. Right Hand Palm / Underside
  await captureTarget('02_right_hand_palmar.png', 'RightHandRoot', { x: 0.0, y: -0.015, z: -0.28 }, { x: 0, y: -0.04, z: 0 });
  // 3. Right Hand Thumb side
  await captureTarget('03_right_hand_thumb_profile.png', 'RightHandRoot', { x: -0.28, y: -0.03, z: 0.05 }, { x: 0, y: -0.04, z: 0 });
  // 4. Right Hand Pinky side
  await captureTarget('04_right_hand_pinky_profile.png', 'RightHandRoot', { x: 0.28, y: -0.03, z: 0.05 }, { x: 0, y: -0.04, z: 0 });
  // 5. Right Hand 3/4 perspective (dorsal-thumb angle)
  await captureTarget('05_right_hand_three_quarter.png', 'RightHandRoot', { x: -0.18, y: 0.08, z: 0.22 }, { x: 0, y: -0.04, z: 0 });
  // 6. Right Hand Close-up Knuckles & PIP Joints
  await captureTarget('06_right_hand_knuckles_pip.png', 'RightHandRoot', { x: 0.0, y: -0.045, z: 0.20 }, { x: 0, y: -0.05, z: 0 });
  // 7. Right Hand Fingertips & Distal Pads
  await captureTarget('07_right_hand_fingertips.png', 'RightHandRoot', { x: 0.0, y: -0.125, z: 0.20 }, { x: 0, y: -0.125, z: 0 });

  // Capture Left Hand (matches user reference image 2)
  // 8. Left Hand Front / Dorsal
  await captureTarget('08_left_hand_dorsal_front.png', 'LeftHandRoot', { x: 0.0, y: -0.015, z: 0.28 }, { x: 0, y: -0.04, z: 0 });
  // 9. Left Hand Thumb side
  await captureTarget('09_left_hand_thumb_profile.png', 'LeftHandRoot', { x: 0.28, y: -0.03, z: 0.05 }, { x: 0, y: -0.04, z: 0 });
  // 10. Left Hand 3/4 perspective
  await captureTarget('10_left_hand_three_quarter.png', 'LeftHandRoot', { x: 0.18, y: 0.08, z: 0.22 }, { x: 0, y: -0.04, z: 0 });

  await browser.close();
  console.log('All captures complete!');
}

main().catch(console.error);
