import puppeteer from 'puppeteer-core';

async function checkConsoleAndEvents() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('\n--- LOADING /about ---');
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });

  // Let's test clicking on buttons on /about
  console.log('Testing clicks on buttons...');
  const buttons = await page.$$('button');
  console.log(`Found ${buttons.length} buttons on /about`);

  for (let i = 0; i < Math.min(buttons.length, 5); i++) {
    const btn = buttons[i];
    const text = await page.evaluate(el => el.innerText || el.getAttribute('aria-label') || 'unnamed', btn);
    const t0 = performance.now();
    await btn.hover();
    const tHover = performance.now() - t0;
    const t1 = performance.now();
    await btn.click();
    const tClick = performance.now() - t1;
    console.log(`Button "${text.trim()}": hover took ${tHover.toFixed(1)}ms, click took ${tClick.toFixed(1)}ms`);
    // Close modal if opened
    const closeBtn = await page.$('button[aria-label="Close modal"], button:has-text("✕")');
    if (closeBtn) await closeBtn.click();
  }

  console.log('\n--- LOADING /services ---');
  await page.goto('http://localhost:5173/services', { waitUntil: 'networkidle0' });
  const svcButtons = await page.$$('button');
  console.log(`Found ${svcButtons.length} buttons on /services`);

  console.log('\n--- LOADING / ---');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  const homeButtons = await page.$$('button');
  console.log(`Found ${homeButtons.length} buttons on /`);

  await browser.close();
}

checkConsoleAndEvents().catch(console.error);
