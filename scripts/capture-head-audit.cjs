const puppeteer = require('puppeteer-core');
const path = require('path');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\baf31030-62ab-4bf2-9f86-6e36dc0805b5';

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
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

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
      const cam = scene.getCamera();
      cam.aspect = 1600 / 1200;
      cam.updateProjectionMatrix();
      scene.getRenderer().setSize(1600, 1200);
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

    await new Promise(r => setTimeout(r, 400));
    const filePath = path.join(outDir, name);
    await page.screenshot({ path: filePath });
    console.log(`Saved: ${filePath}`);
  }

  // Head close up matching user's view (viewing right side of head from slight angle)
  // Robot head is at y ≈ 0.170, scaled 0.88. In world space, neck + torso height...
  // Let's find world position of RobotHead
  const headPos = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return null;
    const obj = scene.getScene().getObjectByName('RobotHead');
    if (!obj) return null;
    const v = scene.getCamera().position.clone();
    obj.getWorldPosition(v);
    return { x: v.x, y: v.y, z: v.z };
  });

  console.log('Head world pos:', headPos);

  const hy = headPos ? headPos.y : 0.65;
  const hx = headPos ? headPos.x : 0;
  const hz = headPos ? headPos.z : 0;

  await snap('head_angle_right_ear.png', 
    { x: hx - 0.35, y: hy + 0.05, z: hz + 0.35 }, 
    { x: hx - 0.05, y: hy, z: hz }
  );
  await snap('head_angle_left_ear.png', 
    { x: hx + 0.35, y: hy + 0.05, z: hz + 0.35 }, 
    { x: hx + 0.05, y: hy, z: hz }
  );
  await snap('head_front.png', 
    { x: hx, y: hy, z: hz + 0.62 }, 
    { x: hx, y: hy, z: hz }
  );
  await snap('head_side_right.png', 
    { x: hx - 0.45, y: hy, z: hz }, 
    { x: hx, y: hy, z: hz }
  );

  await browser.close();
}

main().catch(console.error);
