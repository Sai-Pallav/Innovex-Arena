import puppeteer from 'puppeteer-core';
import path from 'path';

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
  await new Promise(r => setTimeout(r, 4500));

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\f66ee6c4-79e8-4781-a668-da45845bcbf7';

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
      const root = scene.getScene().getObjectByName('RobotRoot');
      if (root) {
        root.rotation.set(0, 0, 0);
        root.position.set(0, -0.45, 0);
        root.scale.setScalar(1.0);
        root.updateMatrixWorld(true);
      }
    }
  });

  // Focus camera directly on viewer's right (robot's left shoulder: X = -0.222, Y = 0.172 - 0.45 = -0.278)
  async function shoot(filename, camX, camY, camZ, lookX, lookY, lookZ) {
    await page.evaluate(({ cx, cy, cz, lx, ly, lz }) => {
      const scene = window.__robotScene;
      const cam = scene.getCamera();
      cam.position.set(cx, cy, cz);
      cam.lookAt(lx, ly, lz);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(scene.getScene(), cam);
    }, { cx: camX, cy: camY, cz: camZ, lx: lookX, ly: lookY, lz: lookZ });

    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(outDir, filename) });
    console.log(`Saved ${filename}`);
  }

  // Exact close-up matching the user's crop:
  // Robot's left shoulder (viewer's right)
  await shoot('shoulder_junction_closeup_front.png', -0.225, -0.275, 0.42, -0.225, -0.275, 0.015);
  // Slight 3/4 angle
  await shoot('shoulder_junction_closeup_34.png', -0.32, -0.27, 0.35, -0.225, -0.275, 0.015);

  await browser.close();
  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
