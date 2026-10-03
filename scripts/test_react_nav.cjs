const puppeteer = require('puppeteer-core');

async function testReactNav() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });
  console.log('Home loaded, scene ready.');

  // Click About link
  const t0 = performance.now();
  await page.evaluate(() => {
    const link = document.querySelector('a[href="/about"]');
    if (link) link.click();
    else console.error('No about link');
  });

  // Wait for RobotCanvas to unmount
  await page.waitForFunction(() => !window.__robotScene, { timeout: 5000 });
  const tUnmount = performance.now();
  console.log('Unmounted in:', (tUnmount - t0).toFixed(2), 'ms');

  // Click Home link
  const tHomeStart = performance.now();
  await page.evaluate(() => {
    // Look for Home link (href="/" or link text Home)
    const links = Array.from(document.querySelectorAll('a'));
    const homeLink = links.find(l => l.getAttribute('href') === '/' || l.textContent.trim() === 'Home');
    if (homeLink) homeLink.click();
    else console.error('No home link');
  });

  // Wait for RobotScene to be recreated and ready
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 10000 });
  const tHomeReady = performance.now();
  console.log('Home remounted and scene isReady in:', (tHomeReady - tHomeStart).toFixed(2), 'ms');

  await browser.close();
}

testReactNav().catch(console.error);
