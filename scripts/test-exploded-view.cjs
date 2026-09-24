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
      '--window-size=1200,1200'
    ],
    defaultViewport: { width: 1200, height: 1200 }
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate(async () => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return { error: 'No __robotScene' };
    const active = sceneObj.toggleExplodedView();
    return { success: true, active };
  });

  console.log('Exploded view trigger result:', result);

  // Let animation run for a few frames
  await new Promise(r => setTimeout(r, 1200));

  // Focus camera on Right Arm / Wrist / Hand in exploded state
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const scene = sceneObj.getScene();
    const cam = sceneObj.getCamera();
    const hand = scene.getObjectByName('RightHandRoot');
    if (hand) {
      const wp = new hand.position.constructor();
      hand.getWorldPosition(wp);
      cam.position.set(wp.x, wp.y - 0.02, wp.z + 0.32);
      cam.lookAt(wp.x, wp.y - 0.03, wp.z);
      cam.updateProjectionMatrix();
    }
  });

  await new Promise(r => setTimeout(r, 800));
  const outPath = path.join('C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\23ad34cd-6496-463b-b5c4-260010fe3978', 'exploded_hand_view.png');
  await page.screenshot({ path: outPath });
  console.log('Saved exploded view screenshot to:', outPath);

  await browser.close();
}

main().catch(console.error);
