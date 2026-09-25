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

  const data = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return { error: 'no scene' };
    const root = scene.getScene().getObjectByName('RobotRoot');
    root.rotation.set(0, 0, 0);
    root.position.set(0, -0.45, 0);
    root.updateMatrixWorld(true);

    const names = [
      'RobotRoot',
      'RobotTorso',
      'ChestArmor',
      'ChestPlate_Central',
      'ChestSidePanel_Right',
      'RightUpperShoulderHood',
      'RightShoulderJoint',
      'LowerChestFrame',
      'SubSternalChassisGirdle',
      'VertebraModule_01'
    ];

    const results = {};
    for (const name of names) {
      const obj = scene.getScene().getObjectByName(name);
      if (obj) {
        const e = obj.matrixWorld.elements;
        results[name] = { x: +e[12].toFixed(4), y: +e[13].toFixed(4), z: +e[14].toFixed(4) };
      } else {
        results[name] = 'NOT_FOUND';
      }
    }
    return results;
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

main().catch(console.error);
