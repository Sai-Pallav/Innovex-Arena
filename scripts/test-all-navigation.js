import puppeteer from 'puppeteer-core';

async function testAllNavigation() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  const routes = ['/', '/about', '/services', '/products', '/classes', '/events', '/careers', '/internships', '/contact'];

  const results = [];

  for (const route of routes) {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const start = performance.now();
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 200));
    const loadTime = performance.now() - start;

    results.push({
      route,
      loadTimeMs: loadTime.toFixed(1),
      errorsCount: errors.length,
      errors: errors.slice(0, 3)
    });
  }

  console.log('All Navigation Results:', JSON.stringify(results, null, 2));
  await browser.close();
}

testAllNavigation().catch(console.error);
