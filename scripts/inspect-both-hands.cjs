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
  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Capture Left Hand Closeup
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const scene = sceneObj.getScene();
    const cam = sceneObj.getCamera();
    const leftHand = scene.getObjectByName('LeftHandRoot');
    if (leftHand) {
      const wp = new leftHand.position.constructor();
      leftHand.getWorldPosition(wp);
      cam.position.set(wp.x, wp.y - 0.02, wp.z + 0.28);
      cam.lookAt(wp.x, wp.y - 0.03, wp.z);
      cam.updateProjectionMatrix();
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const leftOutPath = path.join('C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\23ad34cd-6496-463b-b5c4-260010fe3978', 'left_hand_closeup.png');
  await page.screenshot({ path: leftOutPath });
  console.log('Saved left hand screenshot to:', leftOutPath);

  // 2. Capture Full Robot View
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const scene = sceneObj.getScene();
    const cam = sceneObj.getCamera();
    cam.position.set(0, 0.45, 1.35);
    cam.lookAt(0, 0.35, 0);
    cam.updateProjectionMatrix();
  });
  await new Promise(r => setTimeout(r, 800));
  const fullOutPath = path.join('C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\23ad34cd-6496-463b-b5c4-260010fe3978', 'full_robot_view.png');
  await page.screenshot({ path: fullOutPath });
  console.log('Saved full robot screenshot to:', fullOutPath);

  await browser.close();
}

main().catch(console.error);
