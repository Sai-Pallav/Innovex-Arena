const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function auditMaterials() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1000));

  const result = await page.evaluate(() => {
    const rs = window.__robotScene;
    const scene = rs.getScene();

    const matMap = new Map();

    scene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          if (!matMap.has(m.uuid)) {
            matMap.set(m.uuid, {
              uuid: m.uuid,
              name: m.name || 'unnamed',
              type: m.type,
              color: m.color ? '#' + m.color.getHexString() : null,
              roughness: m.roughness !== undefined ? m.roughness : null,
              metalness: m.metalness !== undefined ? m.metalness : null,
              clearcoat: m.clearcoat !== undefined ? m.clearcoat : null,
              clearcoatRoughness: m.clearcoatRoughness !== undefined ? m.clearcoatRoughness : null,
              sheen: m.sheen !== undefined ? m.sheen : null,
              sheenColor: m.sheenColor ? '#' + m.sheenColor.getHexString() : null,
              reflectivity: m.reflectivity !== undefined ? m.reflectivity : null,
              ior: m.ior !== undefined ? m.ior : null,
              emissive: m.emissive ? '#' + m.emissive.getHexString() : null,
              transparent: m.transparent,
              opacity: m.opacity,
              side: m.side === 0 ? 'FrontSide' : (m.side === 1 ? 'BackSide' : 'DoubleSide'),
              toneMapped: m.toneMapped,
              wireframe: m.wireframe,
              depthTest: m.depthTest,
              depthWrite: m.depthWrite,
              meshCount: 0,
              meshSamples: []
            });
          }
          const entry = matMap.get(m.uuid);
          entry.meshCount++;
          if (entry.meshSamples.length < 10) {
            let path = obj.name || 'unnamed';
            let curr = obj.parent;
            while (curr && curr !== scene) {
              if (curr.name) path = curr.name + ' -> ' + path;
              curr = curr.parent;
            }
            entry.meshSamples.push({ meshName: obj.name, path });
          }
        }
      }
    });

    return Array.from(matMap.values());
  });

  console.log(JSON.stringify(result, null, 2));
  fs.writeFileSync('scripts/materials_inventory.json', JSON.stringify(result, null, 2));
  await browser.close();
}

auditMaterials().catch(console.error);
