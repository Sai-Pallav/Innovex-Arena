const puppeteer = require('puppeteer-core');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return { error: 'No __robotScene' };

    const info = {};
    ['Left', 'Right'].forEach(sideStr => {
      const handName = `${sideStr}HandRoot`;
      const hand = scene.getScene().getObjectByName(handName);
      if (!hand) {
        info[sideStr] = 'Hand not found';
        return;
      }
      info[sideStr] = { handRot: { x: hand.rotation.x, y: hand.rotation.y, z: hand.rotation.z }, fingers: {} };

      hand.traverse(child => {
        if (child.name && (child.name.includes('Proximal') || child.name.includes('Middle') || child.name.includes('Distal') || child.name.includes('Thumb'))) {
          info[sideStr].fingers[child.name] = {
            rotDeg: {
              x: +(child.rotation.x * 180 / Math.PI).toFixed(2),
              y: +(child.rotation.y * 180 / Math.PI).toFixed(2),
              z: +(child.rotation.z * 180 / Math.PI).toFixed(2),
            }
          };
        }
      });
    });

    return info;
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
