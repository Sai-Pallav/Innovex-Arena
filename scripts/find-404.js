import puppeteer from 'puppeteer-core';

async function find404s() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const failedRequests = [];

  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push({ url: response.url(), status: response.status() });
    }
  });

  page.on('requestfailed', request => {
    failedRequests.push({ url: request.url(), failure: request.failure()?.errorText });
  });

  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });

  console.log('Failed Requests on /about:');
  console.log(failedRequests);

  await browser.close();
}

find404s().catch(console.error);
