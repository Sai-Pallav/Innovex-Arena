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
  await new Promise(r => setTimeout(r, 4000));

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\6448688f-82e5-403e-b4e9-381594e93bf0';
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

      // Find right shoulder joint
      const rightJoint = threeScene.getObjectByName('RightShoulderJoint') || threeScene.getObjectByName('RightShoulderFoundation');
      const leftJoint = threeScene.getObjectByName('LeftShoulderJoint') || threeScene.getObjectByName('LeftShoulderFoundation');

      let rPos = { x: 0.222, y: 0.103, z: 0.015 };
      let lPos = { x: -0.222, y: 0.103, z: 0.015 };

      if (rightJoint) {
        rightJoint.updateWorldMatrix(true, false);
        const e = rightJoint.matrixWorld.elements;
        rPos = { x: e[12], y: e[13], z: e[14] };
      }
      if (leftJoint) {
        leftJoint.updateWorldMatrix(true, false);
        const e = leftJoint.matrixWorld.elements;
        lPos = { x: e[12], y: e[13], z: e[14] };
      }

      const fn = new Function('rPos', 'lPos', 'return (' + configFnStr + ')(rPos, lPos)');
      const { cx, cy, cz, lx, ly, lz, fov } = fn(rPos, lPos);

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

  // 1. Hero 3/4 view of Right Shoulder matching the reference image angle!
  // In reference image: chest on left, right arm going down, bearing facing right, viewed from front-right
  await shoot('shoulder_34_current.png', ((rPos) => ({
    cx: rPos.x + 0.12,
    cy: rPos.y - 0.06,
    cz: rPos.z + 0.46,
    lx: rPos.x + 0.01,
    ly: rPos.y - 0.08,
    lz: rPos.z,
    fov: 32
  })).toString());

  // 2. Direct Front view of Right Shoulder
  await shoot('shoulder_front_current.png', ((rPos) => ({
    cx: rPos.x,
    cy: rPos.y - 0.07,
    cz: rPos.z + 0.48,
    lx: rPos.x,
    ly: rPos.y - 0.07,
    lz: rPos.z,
    fov: 32
  })).toString());

  // 3. Lateral Side view of Right Shoulder showing circular bearing & black plate
  await shoot('shoulder_side_current.png', ((rPos) => ({
    cx: rPos.x + 0.48,
    cy: rPos.y - 0.07,
    cz: rPos.z,
    lx: rPos.x,
    ly: rPos.y - 0.07,
    lz: rPos.z,
    fov: 32
  })).toString());

  await browser.close();
  console.log('Capture complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
