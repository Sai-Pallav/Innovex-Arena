const puppeteer = require('puppeteer-core');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));

  const debugInfo = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return { error: 'no scene' };
    const threeScene = scene.getScene();
    const rightArmMount = threeScene.getObjectByName('RightArmMount');
    if (!rightArmMount) return { error: 'no RightArmMount' };

    const items = [];
    rightArmMount.traverse(obj => {
      if (obj.isMesh) {
        obj.updateWorldMatrix(true, false);
        const e = obj.matrixWorld.elements;
        const wp = { x: e[12], y: e[13], z: e[14] };

        // check if near the joint interface
        if (wp.y > -0.40 && wp.y < -0.20) {
          items.push({
            name: obj.name || obj.type,
            parent: obj.parent?.name,
            geometryType: obj.geometry?.type,
            materialName: Array.isArray(obj.material) ? obj.material.map(m=>m.name) : obj.material?.name,
            wp: { x: wp.x.toFixed(4), y: wp.y.toFixed(4), z: wp.z.toFixed(4) },
            localPos: { x: obj.position.x.toFixed(4), y: obj.position.y.toFixed(4), z: obj.position.z.toFixed(4) },
            localRot: { x: (obj.rotation.x * 180 / Math.PI).toFixed(2), y: (obj.rotation.y * 180 / Math.PI).toFixed(2), z: (obj.rotation.z * 180 / Math.PI).toFixed(2) }
          });
        }
      }
    });
    return items;
  });

  console.log(JSON.stringify(debugInfo, null, 2));
  await browser.close();
}

main().catch(console.error);
