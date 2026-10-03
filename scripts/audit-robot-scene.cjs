const puppeteer = require('puppeteer-core');

async function audit() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1536, height: 860 });

    console.log('Navigating to http://localhost:4173/...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // Wait for robot scene to be ready
    await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 15000 });
    console.log('Robot scene is ready. Waiting 1.5s for benchmark...');
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({ path: 'scripts/audit_forearm_batch.png' });
    console.log('Saved screenshot to scripts/audit_forearm_batch.png');

    const breakdown = await page.evaluate(() => {
      const scene = window.__robotScene.getScene();
      const renderer = window.__robotScene.getRenderer();
      const info = renderer.info;

      const summary = {};
      const materialsCount = {};
      const meshList = [];

      const groupBreakdown = {};
      const groupCounts = {};
      scene.traverse(obj => {
        if (obj.isMesh) {
          // get immediate parent and parent's parent
          let p = obj.parent;
          let label = p ? (p.name || p.type) : 'root';
          let pp = p && p.parent ? (p.parent.name || p.parent.type) : '';
          let key = `${pp} > ${label}`;
          groupCounts[key] = (groupCounts[key] || 0) + 1;
        }
      });
      const hubCapMeshes = [];
      scene.traverse(obj => {
        if (obj.isMesh && obj.parent && obj.parent.name && obj.parent.name.includes('HubCap')) {
          hubCapMeshes.push({ parent: obj.parent.name, name: obj.name, material: obj.material ? obj.material.name : 'none' });
        }
      });
      return {
        calls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        hubCapMeshes: hubCapMeshes.slice(0, 10),
        topGroups: Object.entries(groupCounts).sort((a,b) => b[1] - a[1]).slice(0, 25)
      };
    });

    console.log('AUDIT RESULTS:');
    console.log(JSON.stringify(breakdown, null, 2));

  } finally {
    await browser.close();
  }
}

audit().catch(console.error);
