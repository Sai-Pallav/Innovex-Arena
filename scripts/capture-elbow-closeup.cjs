const puppeteer = require('puppeteer-core');
const path = require('path');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\77de62b9-b00b-4a26-9bcb-747234c2a496';

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
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
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
      scene.stop();
      const cam = scene.getCamera();
      cam.aspect = 1600 / 1200;
      cam.updateProjectionMatrix();
      scene.getRenderer().setSize(1600, 1200);
      const root = scene.getScene().getObjectByName('RobotRoot');
      if (root) {
        root.rotation.set(0, 0, 0);
        root.position.set(0, -0.45, 0);
        root.scale.setScalar(1.0);
        root.updateMatrixWorld(true);
      }
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

    await new Promise(r => setTimeout(r, 300));
    const filePath = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: filePath });
    console.log(`Saved: ${filePath}`);
  }

  // Exact elbow center is at y ~ -0.22, x ~ ±0.40
  const leftElbow = { x: -0.40, y: -0.23, z: 0.05 };
  const rightElbow = { x: 0.40, y: -0.23, z: 0.05 };

  // 1. Screen-left elbow: direct front zoom
  await snap('elbow_closeup_front_left',
    { x: leftElbow.x, y: leftElbow.y, z: leftElbow.z + 0.42 },
    leftElbow
  );

  // 2. Screen-left elbow: lateral side zoom (shows actuator disc and purple halo)
  await snap('elbow_closeup_lateral_left',
    { x: leftElbow.x - 0.38, y: leftElbow.y, z: leftElbow.z },
    leftElbow
  );

  // 3. Screen-left elbow: 3/4 perspective zoom
  await snap('elbow_closeup_perspective_left',
    { x: leftElbow.x - 0.28, y: leftElbow.y + 0.08, z: leftElbow.z + 0.30 },
    leftElbow
  );

  // 4. Screen-right elbow: direct front zoom
  await snap('elbow_closeup_front_right',
    { x: rightElbow.x, y: rightElbow.y, z: rightElbow.z + 0.42 },
    rightElbow
  );

  // 5. Screen-right elbow: lateral side zoom
  await snap('elbow_closeup_lateral_right',
    { x: rightElbow.x + 0.38, y: rightElbow.y, z: rightElbow.z },
    rightElbow
  );

  // 6. Posterior elbow zoom (shows olecranon armor tip and damper from behind)
  await snap('elbow_closeup_posterior_right',
    { x: rightElbow.x, y: rightElbow.y, z: rightElbow.z - 0.38 },
    rightElbow
  );

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
