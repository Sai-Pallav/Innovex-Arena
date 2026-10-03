const puppeteer = require('puppeteer-core');

async function testVisualFeatures() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });

  console.log('Testing Exploded View...');
  await page.evaluate(() => {
    window.__robotScene.toggleExplodedView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scripts/p1_exploded_screenshot.png' });
  console.log('Saved scripts/p1_exploded_screenshot.png');

  // Toggle back
  await page.evaluate(() => {
    window.__robotScene.toggleExplodedView();
  });
  await new Promise(r => setTimeout(r, 400));

  console.log('Testing Wireframe Debug Mode...');
  await page.evaluate(() => {
    window.__robotScene.toggleDebugMode();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scripts/p1_wireframe_screenshot.png' });
  console.log('Saved scripts/p1_wireframe_screenshot.png');

  await browser.close();
}

testVisualFeatures().catch(console.error);
