const puppeteer = require('puppeteer-core');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const report = await page.evaluate(() => {
    const s = window.__robotScene;
    if (!s || !s.robotNodes) return { error: 'no scene/nodes' };

    const nodes = s.robotNodes;
    const lMount = nodes.torsoNodes.shoulderMountLeft;
    const lArm = nodes.leftArmNodes;

    function dumpHierarchy(obj, depth = 0) {
      if (depth > 6) return [];
      const e = obj.matrixWorld.elements;
      const res = [{
        name: obj.name || obj.type,
        type: obj.type,
        pos: [obj.position.x, obj.position.y, obj.position.z].map(v => +v.toFixed(4)),
        rot: [obj.rotation.x, obj.rotation.y, obj.rotation.z].map(v => +v.toFixed(4)),
        worldPos: [e[12], e[13], e[14]].map(v => +v.toFixed(4)),
        parent: obj.parent ? (obj.parent.name || obj.parent.type) : null,
        childrenCount: obj.children.length
      }];

      for (const child of obj.children) {
        // Skip geometry children that are just meshes if not important, or keep them
        res.push(...dumpHierarchy(child, depth + 1));
      }
      return res;
    }

    return {
      shoulderGroup: dumpHierarchy(lMount.group, 0).filter(item => 
        /mount|shoulder|pivot|joint|arm|flange|bearing|hub|housing/i.test(item.name)
      ),
      armRoot: dumpHierarchy(lArm.root, 0).slice(0, 15)
    };
  });

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch(console.error);
