import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));

  const info = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return { error: 'No robot scene' };

    const threeScene = scene.getScene();
    const results = [];

    threeScene.traverse(obj => {
      if (
        obj.name && (
          obj.name.includes('Shoulder') ||
          obj.name.includes('Arm') ||
          obj.name.includes('Elbow') ||
          obj.name.includes('Forearm') ||
          obj.name.includes('Bearing') ||
          obj.name.includes('Chest')
        )
      ) {
        const box = new window.THREE.Box3().setFromObject(obj);
        const worldPos = new window.THREE.Vector3();
        obj.getWorldPosition(worldPos);
        results.push({
          name: obj.name,
          type: obj.type,
          visible: obj.visible,
          parent: obj.parent ? obj.parent.name : null,
          localPos: { x: obj.position.x.toFixed(4), y: obj.position.y.toFixed(4), z: obj.position.z.toFixed(4) },
          worldPos: { x: worldPos.x.toFixed(4), y: worldPos.y.toFixed(4), z: worldPos.z.toFixed(4) },
          box: {
            min: { x: box.min.x.toFixed(3), y: box.min.y.toFixed(3), z: box.min.z.toFixed(3) },
            max: { x: box.max.x.toFixed(3), y: box.max.y.toFixed(3), z: box.max.z.toFixed(3) },
            size: {
              x: (box.max.x - box.min.x).toFixed(3),
              y: (box.max.y - box.min.y).toFixed(3),
              z: (box.max.z - box.min.z).toFixed(3),
            }
          }
        });
      }
    });

    return results;
  });

  console.log(JSON.stringify(info.slice(0, 40), null, 2));
  await browser.close();
}

main().catch(err => console.error(err));
