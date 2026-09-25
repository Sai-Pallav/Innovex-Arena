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

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\4a4e932d-2d4b-4eeb-9994-3f52d520ea5a';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const jointPos = await page.evaluate(() => {
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

      const armMount = scene.getScene().getObjectByName('RightArmMount') || scene.getScene().getObjectByName('RightUpperArmAssembly');
      if (armMount) {
        armMount.updateWorldMatrix(true, false);
        const e = armMount.matrixWorld.elements;
        return { x: e[12], y: e[13], z: e[14] };
      }
    }
    return { x: 0.28, y: -0.10, z: 0.0 };
  });

  console.log('Joint World Position:', jointPos);

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

    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(outDir, filename) });
    console.log(`Saved ${filename}`);
  }

  // 1. Extreme Close-up FRONT VIEW of Rotatory & Upper Arm Connectivity
  await shoot('rotatory_connectivity_front.png', {
    cx: jointPos.x, cy: jointPos.y - 0.06, cz: jointPos.z + 0.32,
    lx: jointPos.x, ly: jointPos.y - 0.06, lz: jointPos.z,
    fov: 24
  });

  // 2. Extreme Close-up 3/4 Perspective VIEW
  await shoot('rotatory_connectivity_34.png', {
    cx: jointPos.x + 0.20, cy: jointPos.y - 0.04, cz: jointPos.z + 0.25,
    lx: jointPos.x, ly: jointPos.y - 0.06, lz: jointPos.z,
    fov: 24
  });

  // 3. Close-up Lateral Side VIEW
  await shoot('rotatory_connectivity_side.png', {
    cx: jointPos.x + 0.32, cy: jointPos.y - 0.06, cz: jointPos.z,
    lx: jointPos.x, ly: jointPos.y - 0.06, lz: jointPos.z,
    fov: 24
  });

  // 4. Slightly wider context view showing shoulder down into bicep
  await shoot('rotatory_connectivity_context.png', {
    cx: jointPos.x + 0.15, cy: jointPos.y - 0.08, cz: jointPos.z + 0.50,
    lx: jointPos.x, ly: jointPos.y - 0.08, lz: jointPos.z,
    fov: 30
  });

  await browser.close();
  console.log('Capture complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
