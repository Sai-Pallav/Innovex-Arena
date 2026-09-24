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
  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  // Simulate mouse movements across canvas to test interaction tracking and animation loop
  for (let x = 200; x <= 1000; x += 150) {
    await page.mouse.move(x, 400);
    await new Promise(r => setTimeout(r, 100));
  }

  // Check FPS and ensure scene is running
  const stats = await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return { error: 'No __robotScene' };
    return {
      isReady: sceneObj.isReady,
      hasLeftArm: !!sceneObj.getScene().getObjectByName('LeftHandRoot'),
      hasRightArm: !!sceneObj.getScene().getObjectByName('RightHandRoot'),
    };
  });

  console.log('Interaction test stats:', stats);
  console.log('Errors caught during interaction:', errors);

  await browser.close();

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
