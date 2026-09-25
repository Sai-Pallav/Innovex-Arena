const puppeteer = require('puppeteer-core');
const path = require('path');

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
      '--window-size=1280,1280'
    ],
    defaultViewport: { width: 1280, height: 1280 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));

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
      scene.getRenderer().setSize(1280, 1280);
      const root = scene.getScene().getObjectByName('RobotRoot');
      if (root) {
        root.rotation.set(0, 0, 0);
        root.position.set(0, -0.45, 0);
        root.scale.setScalar(1.0);
        root.updateMatrixWorld(true);
      }
    }
  });

  async function shoot(filename, cfg) {
    await page.evaluate((c) => {
      const scene = window.__robotScene;
      const cam = scene.getCamera();
      const threeScene = scene.getScene();

      if (c.fov) cam.fov = c.fov;
      cam.position.set(c.cx, c.cy, c.cz);
      cam.lookAt(c.lx, c.ly, c.lz);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(threeScene, cam);
    }, cfg);

    await new Promise(r => setTimeout(r, 300));
    const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\c255c94e-9745-467c-b840-c586f934caf7';
    const fullPath = path.join(outDir, filename);
    await page.screenshot({ path: fullPath });
    console.log(`Saved ${filename}`);
  }

  // Exact front view of right shoulder (matching user's uploaded snippet)
  await shoot('user_snippet_angle_front.png', {
    cx: 0.235,
    cy: -0.21,
    cz: 0.38,
    lx: 0.235,
    ly: -0.21,
    lz: 0.015,
    fov: 22
  });

  // 3/4 perspective view of right shoulder
  await shoot('user_snippet_angle_34.png', {
    cx: 0.35,
    cy: -0.19,
    cz: 0.34,
    lx: 0.235,
    ly: -0.21,
    lz: 0.015,
    fov: 22
  });

  // Full right shoulder assembly front view (chest, shoulder cowl, rotational ring, connector, arm)
  await shoot('shoulder_full_front.png', {
    cx: 0.21,
    cy: -0.25,
    cz: 0.65,
    lx: 0.21,
    ly: -0.25,
    lz: 0.015,
    fov: 28
  });

  // Full right shoulder assembly 3/4 view
  await shoot('shoulder_full_34.png', {
    cx: 0.38,
    cy: -0.23,
    cz: 0.58,
    lx: 0.21,
    ly: -0.25,
    lz: 0.015,
    fov: 28
  });

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
