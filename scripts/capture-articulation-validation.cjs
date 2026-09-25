const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

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
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2500));

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\75149416-2415-40b3-aca2-166ddabe4ec1';

  // 1. Live Web App Hero Screenshot (with UI)
  await page.screenshot({ path: path.join(outDir, 'articulation_live_hero.png') });
  console.log('Saved articulation_live_hero.png');

  // Now capture clean isolated 3D camera validation angles
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'inspect-overlay-hide';
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
      const root = scene.getScene().getObjectByName('RobotRoot');
      if (root) {
        root.rotation.set(0, 0, 0);
        root.position.set(0, -0.45, 0);
        root.scale.setScalar(1.0);
        root.updateMatrixWorld(true);
      }
    }
  });

  async function shoot(filename, config) {
    await page.evaluate(({ cx, cy, cz, lx, ly, lz, fov }) => {
      const scene = window.__robotScene;
      const cam = scene.getCamera();
      const ts = scene.getScene();
      if (fov) cam.fov = fov;
      cam.position.set(cx, cy, cz);
      cam.lookAt(lx, ly, lz);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(ts, cam);
    }, config);
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(outDir, filename) });
    console.log(`Saved ${filename}`);
  }

  // 1. FRONT VIEW: Right arm hanging with subtle flexion, symmetrical and natural
  await shoot('articulation_front_arm.png', {
    cx: 0.32, cy: -0.42, cz: 1.65,
    lx: 0.32, ly: -0.42, lz: 0.0,
    fov: 38
  });

  // 2. SIDE VIEW: Clear, subtle 15°-18° visual elbow flexion
  await shoot('articulation_side_arm.png', {
    cx: 1.70, cy: -0.42, cz: 0.0,
    lx: 0.32, ly: -0.42, lz: 0.0,
    fov: 38
  });

  // 3. 3/4 VIEW: Natural casual standing posture with visible articulation
  await shoot('articulation_three_quarter.png', {
    cx: 1.15, cy: -0.40, cz: 1.25,
    lx: 0.32, ly: -0.42, lz: 0.0,
    fov: 38
  });

  // 4. FULL FRONT VIEW: Symmetrical bilateral check showing both articulated arms
  await shoot('articulation_full_front.png', {
    cx: 0.0, cy: -0.38, cz: 2.10,
    lx: 0.0, ly: -0.38, lz: 0.0,
    fov: 40
  });

  await browser.close();
  console.log('All validation screenshots captured successfully!');
}

main().catch(console.error);
