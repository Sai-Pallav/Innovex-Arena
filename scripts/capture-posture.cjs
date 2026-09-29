const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\9f13537d-b9eb-4351-a786-cf47dd57df3f';

async function captureCurrent(filename = 'current_posture_render.png') {
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

  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const scene = sceneObj.getScene();
    const cam = sceneObj.getCamera();

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
  });

  await new Promise(r => setTimeout(r, 500));
  const filePath = path.join(outDir, filename);
  await page.screenshot({ path: filePath });
  console.log(`Saved screenshot: ${filePath}`);

  // Also capture full hero view to ensure full body harmony
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const scene = sceneObj.getScene();
    const cam = sceneObj.getCamera();

    cam.position.set(0, -0.05, 1.85);
    cam.lookAt(0, -0.22, 0);
    cam.updateProjectionMatrix();

    sceneObj.getRenderer().render(scene, cam);
  });

  await new Promise(r => setTimeout(r, 400));
  const fullPath = path.join(outDir, 'full_' + filename);
  await page.screenshot({ path: fullPath });
  console.log(`Saved full screenshot: ${fullPath}`);

  await browser.close();
}

const filename = process.argv[2] || 'current_posture_render.png';
captureCurrent(filename).catch(console.error);
