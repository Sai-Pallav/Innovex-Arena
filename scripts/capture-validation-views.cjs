const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function main() {
  const prefix = process.argv[2] || 'baseline';
  const outDir = process.argv[3] || 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\c255c94e-9745-467c-b840-c586f934caf7';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

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

  async function shoot(filename, config) {
    await page.evaluate((cfg) => {
      const scene = window.__robotScene;
      const cam = scene.getCamera();
      const threeScene = scene.getScene();

      if (cfg.fov) cam.fov = cfg.fov;
      cam.position.set(cfg.cx, cfg.cy, cfg.cz);
      cam.lookAt(cfg.lx, cfg.ly, cfg.lz);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(threeScene, cam);
    }, config);

    await new Promise(r => setTimeout(r, 300));
    const fullPath = path.join(outDir, filename);
    await page.screenshot({ path: fullPath });
    console.log(`Saved ${filename}`);
  }

  // 1. FRONT VIEW — Full Torso, Shoulders, Lower Chest & Ribs
  await shoot(`${prefix}_1_front_view.png`, {
    cx: 0,
    cy: -0.26,
    cz: 1.15,
    lx: 0,
    ly: -0.26,
    lz: 0,
    fov: 30
  });

  // 2. 3/4 FRONT VIEW — Perspective view matching reference perspective view
  await shoot(`${prefix}_2_perspective_view.png`, {
    cx: 0.45,
    cy: -0.24,
    cz: 1.05,
    lx: 0,
    ly: -0.26,
    lz: 0,
    fov: 30
  });

  // 3. SIDE VIEW (Right Side profile)
  await shoot(`${prefix}_3_side_view.png`, {
    cx: 1.15,
    cy: -0.26,
    cz: 0.0,
    lx: 0,
    ly: -0.26,
    lz: 0,
    fov: 30
  });

  // 4. BACK VIEW
  await shoot(`${prefix}_4_back_view.png`, {
    cx: 0,
    cy: -0.26,
    cz: -1.15,
    lx: 0,
    ly: -0.26,
    lz: 0,
    fov: 30
  });

  // 5. LOWER CHEST CLOSEUP (framing lower chest plate, compound curve, and rib transition)
  await shoot(`${prefix}_5_lower_chest_closeup.png`, {
    cx: 0,
    cy: -0.30,
    cz: 0.50,
    lx: 0,
    ly: -0.30,
    lz: 0.03,
    fov: 28
  });

  // 6. RIGHT SHOULDER CLOSEUP FRONT (framing right shoulder hood, transition collar, and joint)
  await shoot(`${prefix}_6_right_shoulder_front.png`, {
    cx: 0.18,
    cy: -0.21,
    cz: 0.50,
    lx: 0.18,
    ly: -0.21,
    lz: 0.02,
    fov: 26
  });

  // 7. RIGHT SHOULDER CLOSEUP 3/4 (framing right shoulder hood curvature, thickness, recessed joint)
  await shoot(`${prefix}_7_right_shoulder_34.png`, {
    cx: 0.32,
    cy: -0.20,
    cz: 0.42,
    lx: 0.18,
    ly: -0.21,
    lz: 0.02,
    fov: 26
  });

  await browser.close();
  console.log(`All captures for ${prefix} complete!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
