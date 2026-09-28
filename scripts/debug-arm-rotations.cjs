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

  const report = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return { error: 'No __robotScene' };

    const targets = [
      'LeftShoulderModule', 'RightShoulderModule',
      'LeftArmMount', 'RightArmMount',
      'LeftRobotArmRoot', 'RightRobotArmRoot',
      'LeftUpperArmAssembly', 'RightUpperArmAssembly',
      'LeftElbowRoot', 'RightElbowRoot',
      'LeftForearmPivot', 'RightForearmPivot',
      'LeftForearmAssembly', 'RightForearmAssembly',
      'LeftWristPivot', 'RightWristPivot',
      'LeftHandRoot', 'RightHandRoot'
    ];

    const result = {};
    const THREE = window.THREE || (scene.getCamera().constructor.name === 'PerspectiveCamera' ? scene.getCamera().position.constructor : null);

    targets.forEach(t => {
      const obj = scene.getScene().getObjectByName(t);
      if (obj) {
        const wp = new obj.position.constructor();
        obj.getWorldPosition(wp);
        const wq = new obj.quaternion.constructor();
        obj.getWorldQuaternion(wq);
        const we = new obj.rotation.constructor();
        we.setFromQuaternion(wq);

        result[t] = {
          localRotDeg: {
            x: +(obj.rotation.x * 180 / Math.PI).toFixed(2),
            y: +(obj.rotation.y * 180 / Math.PI).toFixed(2),
            z: +(obj.rotation.z * 180 / Math.PI).toFixed(2),
          },
          worldRotDeg: {
            x: +(we.x * 180 / Math.PI).toFixed(2),
            y: +(we.y * 180 / Math.PI).toFixed(2),
            z: +(we.z * 180 / Math.PI).toFixed(2),
          },
          worldPos: {
            x: +wp.x.toFixed(3),
            y: +wp.y.toFixed(3),
            z: +wp.z.toFixed(3)
          }
        };
      } else {
        result[t] = 'NOT_FOUND';
      }
    });

    return result;
  });

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
