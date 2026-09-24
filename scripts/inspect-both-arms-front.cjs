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

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\23ad34cd-6496-463b-b5c4-260010fe3978';

  // 1. Both Arms Full Chain View (Shoulder to Hands)
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const cam = sceneObj.getCamera();
    cam.position.set(0, 0.05, 1.40);
    cam.lookAt(0, -0.05, 0);
    cam.updateProjectionMatrix();
  });
  await new Promise(r => setTimeout(r, 800));
  const fullChainPath = path.join(outDir, 'both_arms_full_chain.png');
  await page.screenshot({ path: fullChainPath });
  console.log('Saved both arms full chain screenshot to:', fullChainPath);

  // 2. Right Arm Complete Chain (Shoulder down to Fingers)
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const cam = sceneObj.getCamera();
    cam.position.set(0.26, -0.05, 0.85);
    cam.lookAt(0.25, -0.10, 0);
    cam.updateProjectionMatrix();
  });
  await new Promise(r => setTimeout(r, 800));
  const rightChainPath = path.join(outDir, 'right_arm_full_chain.png');
  await page.screenshot({ path: rightChainPath });
  console.log('Saved right arm full chain screenshot to:', rightChainPath);

  // 3. Left Arm Complete Chain (Shoulder down to Fingers)
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const cam = sceneObj.getCamera();
    cam.position.set(-0.26, -0.05, 0.85);
    cam.lookAt(-0.25, -0.10, 0);
    cam.updateProjectionMatrix();
  });
  await new Promise(r => setTimeout(r, 800));
  const leftChainPath = path.join(outDir, 'left_arm_full_chain.png');
  await page.screenshot({ path: leftChainPath });
  console.log('Saved left arm full chain screenshot to:', leftChainPath);

  // 4. Exact Reference Framing of Arm (Shoulder down to Hand Pose)
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const cam = sceneObj.getCamera();
    cam.position.set(0.31, -0.08, 0.70);
    cam.lookAt(0.30, -0.11, 0);
    cam.updateProjectionMatrix();
  });
  await new Promise(r => setTimeout(r, 800));
  const poseCropPath = path.join(outDir, 'arm_pose_comparison.png');
  await page.screenshot({
    path: poseCropPath,
    clip: { x: 420, y: 80, width: 360, height: 1040 }
  });
  console.log('Saved arm pose comparison screenshot to:', poseCropPath);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
