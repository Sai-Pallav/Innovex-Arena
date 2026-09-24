import puppeteer from 'puppeteer-core';

async function captureVisuals() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const routes = [
    { path: '/', name: 'visual_home.png', wait: 1200 },
    { path: '/services', name: 'visual_services.png', wait: 500 },
    { path: '/about', name: 'visual_about.png', wait: 500 },
    { path: '/products', name: 'visual_products.png', wait: 500 }
  ];

  for (const r of routes) {
    await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle0' });
    await new Promise(res => setTimeout(res, r.wait));
    await page.screenshot({ path: `scripts/${r.name}` });
    console.log(`Captured ${r.name}`);
  }

  await browser.close();
}

captureVisuals().catch(console.error);
