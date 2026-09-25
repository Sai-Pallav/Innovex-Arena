const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function main() {
  const prefix = process.argv[2] || 'baseline';
  const outDir = process.argv[3] || 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\b5cc54e8-6985-4d65-9ec9-feb6abfec87e';
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
  await new Promise(r => setTimeout(r, 3000));

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

  async function shoot(filename, getCamConfig) {
    await page.evaluate((configFnStr) => {
      const scene = window.__robotScene;
      const cam = scene.getCamera();
      const threeScene = scene.getScene();

      const rightJoint = threeScene.getObjectByName('RightShoulderJoint') || threeScene.getObjectByName('RightShoulderFoundation');
      let rPos = { x: 0.222, y: 0.103, z: 0.015 };

      if (rightJoint) {
        rightJoint.updateWorldMatrix(true, false);
        const e = rightJoint.matrixWorld.elements;
        rPos = { x: e[12], y: e[13], z: e[14] };
      }

      const fn = new Function('rPos', 'return (' + configFnStr + ')(rPos)');
      const { cx, cy, cz, lx, ly, lz, fov } = fn(rPos);

      if (fov) cam.fov = fov;
      cam.position.set(cx, cy, cz);
      cam.lookAt(lx, ly, lz);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(threeScene, cam);
    }, getCamConfig.toString());

    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, filename) });
    console.log(`Saved ${filename}`);
  }

  // 1. FRONT VIEW of Right Shoulder
  await shoot(`${prefix}_front.png`, ((rPos) => ({
    cx: rPos.x,
    cy: rPos.y - 0.06,
    cz: rPos.z + 0.44,
    lx: rPos.x,
    ly: rPos.y - 0.06,
    lz: rPos.z,
    fov: 30
  })).toString());

  // 2. 3/4 FRONT VIEW
  await shoot(`${prefix}_34_front.png`, ((rPos) => ({
    cx: rPos.x + 0.18,
    cy: rPos.y - 0.04,
    cz: rPos.z + 0.42,
    lx: rPos.x - 0.02,
    ly: rPos.y - 0.06,
    lz: rPos.z,
    fov: 30
  })).toString());

  // 3. OUTER SIDE VIEW
  await shoot(`${prefix}_outer_side.png`, ((rPos) => ({
    cx: rPos.x + 0.46,
    cy: rPos.y - 0.06,
    cz: rPos.z,
    lx: rPos.x,
    ly: rPos.y - 0.06,
    lz: rPos.z,
    fov: 30
  })).toString());

  // 4. BACK VIEW
  await shoot(`${prefix}_back.png`, ((rPos) => ({
    cx: rPos.x,
    cy: rPos.y - 0.06,
    cz: rPos.z - 0.44,
    lx: rPos.x,
    ly: rPos.y - 0.06,
    lz: rPos.z,
    fov: 30
  })).toString());

  // 5. BOTH SHOULDERS FRONT OVERVIEW
  await shoot(`${prefix}_symmetry_front.png`, ((rPos) => ({
    cx: 0,
    cy: rPos.y - 0.06,
    cz: 0.95,
    lx: 0,
    ly: rPos.y - 0.06,
    lz: 0,
    fov: 32
  })).toString());

  await browser.close();
  console.log(`Capture of ${prefix} views complete!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
