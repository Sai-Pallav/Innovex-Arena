const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\16ef16c4-f38d-4171-9e7c-1998eb33a257';

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
  await new Promise(r => setTimeout(r, 3000));

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

    const scene = window.__robotScene;
    if (scene) {
      const cam = scene.getCamera();
      cam.aspect = 1600 / 1200;
      cam.updateProjectionMatrix();
      scene.getRenderer().setSize(1600, 1200);
    }
  });

  async function captureView(filename, camPos, lookTarget, waitMs = 500) {
    await page.evaluate(({ camPos, lookTarget }) => {
      const scene = window.__robotScene;
      if (!scene) return;
      const cam = scene.getCamera();
      cam.position.set(camPos.x, camPos.y, camPos.z);
      cam.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(scene.getScene(), cam);
    }, { camPos, lookTarget });

    await new Promise(r => setTimeout(r, waitMs));
    const filePath = path.join(outDir, filename);
    await page.screenshot({ path: filePath });
    console.log(`Saved: ${filename}`);
  }

  // 1. Full Body Front
  await captureView('01_full_body_front.png', { x: 0, y: 0.15, z: 2.2 }, { x: 0, y: 0, z: 0 });

  // 2. Both Arms & Chest Overview (Shoulder to Hands)
  await captureView('02_shoulders_to_hands_overview.png', { x: 0, y: -0.05, z: 1.45 }, { x: 0, y: -0.15, z: 0 });

  // 3. Right Arm (Robot's right = screen left or robot's right?)
  // Robot's right is x > 0 in standard Three.js or x < 0? Let's check both sides.
  await captureView('03_robot_right_arm.png', { x: 0.35, y: -0.12, z: 0.95 }, { x: 0.30, y: -0.18, z: 0 });
  await captureView('04_robot_left_arm.png', { x: -0.35, y: -0.12, z: 0.95 }, { x: -0.30, y: -0.18, z: 0 });

  // 5. Hand Closeups
  await captureView('05_robot_right_hand.png', { x: 0.35, y: -0.32, z: 0.55 }, { x: 0.34, y: -0.32, z: 0 });
  await captureView('06_robot_left_hand.png', { x: -0.35, y: -0.32, z: 0.55 }, { x: -0.34, y: -0.32, z: 0 });

  // 7. 3/4 Perspective View
  await captureView('07_three_quarter_view.png', { x: 0.8, y: 0.1, z: 1.6 }, { x: 0.1, y: -0.1, z: 0 });

  await browser.close();
  console.log('Capture complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
