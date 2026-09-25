const puppeteer = require('puppeteer-core');
const fs = require('fs');

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
      // Find objects right near the rotatory/upper arm interface
      if (obj.isMesh && (obj.name.includes('Collar') || obj.name.includes('Flange') || obj.name.includes('Plate') || obj.name.includes('Ring') || obj.name.includes('Armor') || obj.name.includes('Adapter') || obj.name.includes('Led'))) {
        obj.updateWorldMatrix(true, false);
        const e = obj.matrixWorld.elements;
        items.push({
          name: obj.name,
          parent: obj.parent?.name,
          geometryType: obj.geometry?.type,
          wp: { x: e[12].toFixed(4), y: e[13].toFixed(4), z: e[14].toFixed(4) },
          localPos: { x: obj.position.x.toFixed(4), y: obj.position.y.toFixed(4), z: obj.position.z.toFixed(4) },
          localRot: { x: (obj.rotation.x * 180 / Math.PI).toFixed(2), y: (obj.rotation.y * 180 / Math.PI).toFixed(2), z: (obj.rotation.z * 180 / Math.PI).toFixed(2) }
        });
      }
    });
    return items;
  });

  fs.writeFileSync('C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\4a4e932d-2d4b-4eeb-9994-3f52d520ea5a\\interface_meshes.json', JSON.stringify(debugInfo, null, 2));
  console.log('Saved interface_meshes.json');
  await browser.close();
}

main().catch(console.error);
