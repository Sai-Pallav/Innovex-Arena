const puppeteer = require('puppeteer-core');
const path = require('path');

async function testPose(angles) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1200 });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate((cfg) => {
    const s = window.__robotScene;
    if (!s || !s.robotNodes) return { error: 'no robotNodes' };

    // Apply test angles to animation controller / base poses
    if (s.controller && s.controller.animationController) {
      const animCtrl = s.controller.animationController;
      // We can inspect or override poses
    }
    return { success: true };
  }, angles);

  await browser.close();
}

testPose({});
