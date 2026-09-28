const puppeteer = require('puppeteer-core');
const path = require('path');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\f9e25bc4-8063-4023-9eec-3fe4c89de1cb';

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
  await new Promise(r => setTimeout(r, 2500));

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

  async function snap(name, camPos, lookAtPos) {
    await page.evaluate(({ camPos, lookAtPos }) => {
      const scene = window.__robotScene;
      if (!scene) return;
      const cam = scene.getCamera();
      cam.position.set(camPos.x, camPos.y, camPos.z);
      cam.lookAt(lookAtPos.x, lookAtPos.y, lookAtPos.z);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(scene.getScene(), cam);
    }, { camPos, lookAtPos });

    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, name) });
    console.log(`Saved: ${name}`);
  }

  // 1. Right Wrist & Hand Close-up
  await snap('fixed_01_right_wrist_hand.png', { x: -0.32, y: -0.42, z: 0.55 }, { x: -0.31, y: -0.44, z: 0.25 });
  // 2. Left Wrist & Hand Close-up
  await snap('fixed_02_left_wrist_hand.png', { x: 0.32, y: -0.42, z: 0.55 }, { x: 0.31, y: -0.44, z: 0.25 });

  // 3. Right Elbow Joint Close-up
  await snap('fixed_03_right_elbow.png', { x: -0.38, y: -0.22, z: 0.65 }, { x: -0.36, y: -0.23, z: 0.1 });
  // 4. Left Elbow Joint Close-up
  await snap('fixed_04_left_elbow.png', { x: 0.38, y: -0.22, z: 0.65 }, { x: 0.36, y: -0.23, z: 0.1 });

  // 5. Full Torso + Both Arms Frontal Overview
  await snap('fixed_05_arms_full_frontal.png', { x: 0.0, y: -0.15, z: 1.25 }, { x: 0.0, y: -0.20, z: 0.0 });

  // 6. Complete Hero Stance
  await snap('fixed_06_hero_default.png', { x: 0.0, y: 0.1, z: 1.85 }, { x: 0.0, y: -0.1, z: 0.0 });

  await browser.close();
  console.log('All verification captures completed!');
}

main().catch(console.error);
