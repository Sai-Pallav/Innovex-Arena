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

  const views = [
    {
      name: 'view_hand_detail.png',
      camPos: [0.34, -0.50, 0.52],
      lookAt: [0.28, -0.52, 0.16]
    },
    {
      name: 'view_arm_side_detail.png',
      camPos: [1.10, -0.22, 0.05],
      lookAt: [0.30, -0.25, 0.05]
    },
    {
      name: 'view_arm_front_detail.png',
      camPos: [0.30, -0.20, 1.05],
      lookAt: [0.30, -0.25, 0.05]
    }
  ];

  for (const v of views) {
    await page.evaluate(({ camPos, lookAt }) => {
      const sceneObj = window.__robotScene;
      if (!sceneObj) return;
      const cam = sceneObj.getCamera();
      cam.position.set(...camPos);
      cam.lookAt(...lookAt);
      cam.updateProjectionMatrix();
    }, v);
    await new Promise(r => setTimeout(r, 600));
    const outPath = path.join(outDir, v.name);
    await page.screenshot({ path: outPath });
    console.log(`Saved ${v.name}`);
  }

  await browser.close();
  console.log('Capture complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
