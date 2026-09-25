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
  await new Promise(r => setTimeout(r, 3000));

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\df402aac-f482-4bb1-8ae2-f12d88cbfeb3';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

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
      const threeScene = scene.getScene();

      if (fov) cam.fov = fov;
      cam.position.set(cx, cy, cz);
      cam.lookAt(lx, ly, lz);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(threeScene, cam);
    }, config);

    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, filename) });
    console.log(`Saved ${filename}`);
  }

  // 1. FRONT VIEW of complete right arm: shoulder down to hand
  await shoot('arm_proportions_front.png', {
    cx: 0.28, cy: -0.25, cz: 1.35,
    lx: 0.28, ly: -0.25, lz: 0.0,
    fov: 36
  });

  // 2. 3/4 FRONT VIEW of complete right arm
  await shoot('arm_proportions_34_front.png', {
    cx: 0.85, cy: -0.22, cz: 1.05,
    lx: 0.28, ly: -0.25, lz: 0.0,
    fov: 36
  });

  // 3. OUTER SIDE VIEW of complete right arm
  await shoot('arm_proportions_side.png', {
    cx: 1.35, cy: -0.25, cz: 0.0,
    lx: 0.28, ly: -0.25, lz: 0.0,
    fov: 36
  });

  // 4. FULL FRONT VIEW showing torso and bilateral symmetry of both arms
  await shoot('arm_proportions_symmetry_front.png', {
    cx: 0.0, cy: -0.25, cz: 1.95,
    lx: 0.0, ly: -0.25, lz: 0.0,
    fov: 38
  });

  await browser.close();
  console.log('Capture of arm proportions complete!');
}

main().catch(console.error);
