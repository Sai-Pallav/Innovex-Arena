import puppeteer from 'puppeteer-core';

async function inspectClickTargets() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  page.on('console', msg => console.log('LOG:', msg.text()));

  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });

  const analysis = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a, input'));
    const report = [];

    buttons.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const text = (el.innerText || el.getAttribute('aria-label') || el.tagName).trim().substring(0, 30);
      
      // Scroll into view to test real elementFromPoint
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const viewRect = el.getBoundingClientRect();
      const centerX = viewRect.left + viewRect.width / 2;
      const centerY = viewRect.top + viewRect.height / 2;

      let topElement = null;
      let isObscured = false;
      let topElInfo = '';

      if (centerX >= 0 && centerX <= window.innerWidth && centerY >= 0 && centerY <= window.innerHeight) {
        topElement = document.elementFromPoint(centerX, centerY);
        isObscured = topElement !== el && !el.contains(topElement);
        if (topElement) {
          topElInfo = `${topElement.tagName}.${Array.from(topElement.classList).join('.')}`;
        }
      }

      report.push({
        index,
        tag: el.tagName,
        text,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        isObscured,
        topElInfo: isObscured ? topElInfo : 'OK (Directly clickable)'
      });
    });

    return report;
  });

  console.log('--- CLICK TARGET AUDIT ON /about ---');
  let obscuredCount = 0;
  analysis.forEach(item => {
    if (item.isObscured) {
      obscuredCount++;
      console.log(`[BLOCKED/OBSCURED] #${item.index} <${item.tag}> "${item.text}" is covered by: ${item.topElInfo}`);
    } else {
      console.log(`[CLICKABLE] #${item.index} <${item.tag}> "${item.text}"`);
    }
  });

  console.log(`\nTotal checked: ${analysis.length}, Obscured/Blocked: ${obscuredCount}`);

  await browser.close();
}

inspectClickTargets().catch(console.error);
