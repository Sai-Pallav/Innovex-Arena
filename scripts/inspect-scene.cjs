const puppeteer = require('puppeteer-core');

async function inspect() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 15000 });

    const meshHierarchy = await page.evaluate(() => {
      const scene = window.__robotScene.getScene();
      const groupCounts = {};

      scene.traverse(obj => {
        if (obj.isMesh) {
          // get top parent group or immediate parent
          let p = obj.parent;
          let chain = [];
          while (p && p !== scene) {
            chain.unshift(p.name || p.type);
            p = p.parent;
          }
          if (chain.includes('LeftSecondaryAxisCarrier')) {
            const idx = chain.indexOf('LeftSecondaryAxisCarrier');
            const groupPath = chain.slice(idx, idx + 3).join(' > ');
            groupCounts[groupPath] = (groupCounts[groupPath] || 0) + 1;
          }
        }
      });

      return groupCounts;
    });

    console.log('--- MESH DISTRIBUTION ACROSS GROUPS ---');
    const sorted = Object.entries(meshHierarchy).sort((a, b) => b[1] - a[1]);
    for (const [group, count] of sorted) {
      console.log(`${count.toString().padStart(4, ' ')} meshes : ${group}`);
    }
  } finally {
    await browser.close();
  }
}

inspect().catch(console.error);
