const puppeteer = require('puppeteer-core');

const routes = [
  '/',
  '/about',
  '/classes',
  '/services',
  '/products',
  '/events',
  '/careers',
  '/interns',
  '/contact',
  '/gallery',
  '/blog',
  '/admin/login',
  '/blueprint',
];

async function validateRoutes() {
  console.log('Starting Route Validation on http://localhost:5173 ...\n');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  const results = [];

  for (const route of routes) {
    const url = `http://localhost:5173${route}`;
    const pageErrors = [];
    const consoleErrors = [];

    const onError = (err) => pageErrors.push(err.message || String(err));
    const onConsole = (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    };

    page.on('pageerror', onError);
    page.on('console', onConsole);

    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise((r) => setTimeout(r, 600));

      const status = response ? response.status() : null;
      const title = await page.title();
      const bodyContentLength = await page.evaluate(() => document.body.innerText.trim().length);
      const hasRoot = await page.evaluate(() => !!document.getElementById('root') && document.getElementById('root').children.length > 0);

      // Special check for robot on homepage
      let robotStatus = 'N/A';
      if (route === '/') {
        await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 10000 });
        const isRobotReady = await page.evaluate(() => window.__robotScene && window.__robotScene.isReady);
        robotStatus = isRobotReady ? 'READY (Procedural)' : 'FAILED';
      }

      const passed = status === 200 && hasRoot && bodyContentLength > 0 && pageErrors.length === 0;

      results.push({
        route,
        status,
        passed,
        title,
        bodyContentLength,
        hasRoot,
        robotStatus,
        pageErrors,
        consoleErrors
      });

      console.log(`[${passed ? 'PASS' : 'FAIL'}] Route ${route.padEnd(14)} -> HTTP ${status} | Body text: ${bodyContentLength} chars | Root populated: ${hasRoot} | Robot: ${robotStatus} | Console errors: ${consoleErrors.length}`);
    } catch (err) {
      results.push({
        route,
        passed: false,
        error: err.message,
        pageErrors,
        consoleErrors
      });
      console.error(`[FAIL] Route ${route} -> ERROR:`, err.message);
    } finally {
      page.off('pageerror', onError);
      page.off('console', onConsole);
    }
  }

  await browser.close();

  const allPassed = results.every((r) => r.passed);
  console.log(`\n========================================`);
  console.log(`Route Validation Summary: ${allPassed ? 'ALL 13 ROUTES PASSED' : 'FAILURES DETECTED'}`);
  console.log(`========================================\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

validateRoutes().catch((err) => {
  console.error('Fatal error during route validation:', err);
  process.exit(1);
});
