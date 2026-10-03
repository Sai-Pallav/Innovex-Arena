const puppeteer = require('puppeteer-core');

async function audit() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });

  const auditData = await page.evaluate(() => {
    const scene = window.__robotScene.getScene();
    const renderer = window.__robotScene.getRenderer();
    const root = window.__robotScene.robotNodes.root;

    const breakdown = {};
    const geometriesMap = new Map();
    const materialsMap = new Map();
    let totalMeshes = 0;

    function getSubsystem(obj) {
      let curr = obj;
      while (curr && curr !== root) {
        const name = (curr.name || '').toLowerCase();
        if (name.includes('ringfinger') || name.includes('middlefinger') || name.includes('indexfinger') || name.includes('littlefinger') || name.includes('pinkyfinger') || name.includes('thumb') || name.includes('finger') || name.includes('phalanx')) return 'Fingers';
        if (name.includes('hand') || name.includes('palm') || name.includes('wrist') || name.includes('carpal')) return 'Hands';
        if (name.includes('shoulder') || name.includes('deltoid') || name.includes('clavicle') || name.includes('pauldron')) return 'Shoulders';
        if (name.includes('arm') || name.includes('elbow') || name.includes('forearm') || name.includes('bicep') || name.includes('tricep') || name.includes('brachio')) return 'Arms';
        if (name.includes('head') || name.includes('neck') || name.includes('visor') || name.includes('eye') || name.includes('jaw') || name.includes('ear') || name.includes('cranium')) return 'Head';
        if (name.includes('torso') || name.includes('chest') || name.includes('abdomen') || name.includes('stomach') || name.includes('rib') || name.includes('spine') || name.includes('pectoral') || name.includes('sternum')) return 'Torso';
        if (name.includes('waist') || name.includes('pelvis') || name.includes('hip')) return 'Waist';
        if (name.includes('leg') || name.includes('thigh') || name.includes('shin') || name.includes('knee') || name.includes('femur') || name.includes('tibia') || name.includes('calf') || name.includes('patella')) return 'Legs';
        if (name.includes('foot') || name.includes('feet') || name.includes('ankle') || name.includes('toe') || name.includes('heel') || name.includes('sole') || name.includes('tarsal')) return 'Feet';
        curr = curr.parent;
      }
      return 'Other';
    }

    const meshList = [];

    scene.traverse((obj) => {
      if (obj.isMesh) {
        totalMeshes++;
        const subsystem = getSubsystem(obj);
        breakdown[subsystem] = (breakdown[subsystem] || 0) + 1;

        const geoId = obj.geometry.id;
        const geoUuid = obj.geometry.uuid;
        geometriesMap.set(geoId, (geometriesMap.get(geoId) || 0) + 1);

        const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        const matName = mat ? (mat.name || mat.type) : 'unknown';
        materialsMap.set(matName, (materialsMap.get(matName) || 0) + 1);

        meshList.push({
          name: obj.name || 'unnamed',
          parentName: obj.parent ? obj.parent.name : 'root',
          subsystem,
          geoId,
          matName,
          polyCount: obj.geometry.index ? obj.geometry.index.count / 3 : obj.geometry.attributes.position.count / 3,
          isInstanced: !!obj.isInstancedMesh,
          instanceCount: obj.count || 1
        });
      }
    });

    return {
      totalMeshes,
      uniqueGeometries: geometriesMap.size,
      drawCalls: renderer.info.render.calls,
      breakdown,
      materials: Object.fromEntries(materialsMap),
      meshListSample: meshList.slice(0, 30),
      meshListAll: meshList
    };
  });

  console.log('AUDIT SUMMARY:');
  console.log('Total Meshes:', auditData.totalMeshes);
  console.log('Unique Geometries:', auditData.uniqueGeometries);
  console.log('Draw calls:', auditData.drawCalls);
  console.log('Subsystem Breakdown:', auditData.breakdown);
  console.log('Materials:', auditData.materials);

  const fs = require('fs');
  fs.writeFileSync('scripts/audit_mesh_list.json', JSON.stringify(auditData, null, 2));
  console.log('Saved full mesh list to scripts/audit_mesh_list.json');

  await browser.close();
}

audit().catch(console.error);
