const puppeteer = require('puppeteer-core');
const path = require('path');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\3f665f50-084c-40fe-8671-b8d7263b93ee';

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
      '--window-size=1200,1200'
    ],
    defaultViewport: { width: 1200, height: 1200 }
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
      cam.aspect = 1.0;
      cam.updateProjectionMatrix();
      scene.getRenderer().setSize(1200, 1200);
    }
  });

  const headInfo = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return null;
    const head = scene.getScene().getObjectByName('RobotHead');
    const rightEar = scene.getScene().getObjectByName('RightSideModule');
    const leftEar = scene.getScene().getObjectByName('LeftSideModule');
    const cam = scene.getCamera();
    const hp = cam.position.clone();
    const rp = cam.position.clone();
    const lp = cam.position.clone();
    if (head) head.getWorldPosition(hp);
    if (rightEar) rightEar.getWorldPosition(rp);
    if (leftEar) leftEar.getWorldPosition(lp);
    return {
      head: { x: hp.x, y: hp.y, z: hp.z },
      rightEar: { x: rp.x, y: rp.y, z: rp.z },
      leftEar: { x: lp.x, y: lp.y, z: lp.z },
    };
  });

  console.log('Head info:', headInfo);
  const h = headInfo.head;
  const le = headInfo.leftEar;

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

  // 1. User Image 1: Side view of ear (looking from lateral X)
  await snap('user_view_1_side_ear.png',
    { x: le.x - 0.22, y: le.y, z: le.z },
    { x: le.x + 0.05, y: le.y, z: le.z }
  );

  // 2. User Image 2: Three-quarters view from rear/side
  await snap('user_view_2_quarter_ear.png',
    { x: le.x - 0.20, y: le.y + 0.01, z: le.z - 0.12 },
    { x: le.x + 0.02, y: le.y, z: le.z + 0.02 }
  );

  // 3. User Image 3: Direct frontal view of head
  await snap('user_view_3_front_head.png',
    { x: h.x, y: h.y + 0.01, z: h.z + 0.38 },
    { x: h.x, y: h.y, z: h.z }
  );

  await browser.close();
}

main().catch(console.error);
