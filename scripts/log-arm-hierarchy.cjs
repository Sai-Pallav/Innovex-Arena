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

  const info = await page.evaluate(() => {
    const s = window.__robotScene;
    if (!s || !s.robotNodes) return { error: 'no scene/nodes' };

    function getChain(arm) {
      const list = [
        { name: 'root', obj: arm.root },
        { name: 'upperArm.group', obj: arm.upperArm.group },
        { name: 'distalElbowMount', obj: arm.upperArm.distalElbowMount },
        { name: 'elbow.group', obj: arm.elbow.group },
        { name: 'elbow.forearmPivot', obj: arm.elbow.forearmPivot },
        { name: 'forearm.group', obj: arm.forearm.group },
        { name: 'distalWristMount', obj: arm.forearm.distalWristMount },
        { name: 'wrist.group', obj: arm.wrist.group },
        { name: 'distalHandMount', obj: arm.wrist.distalHandMount },
        { name: 'hand.group', obj: arm.hand.group }
      ];

      return list.map(item => {
        const o = item.obj;
        if (!o) return { name: item.name, missing: true };
        const e = o.matrixWorld.elements;
        return {
          name: item.name,
          pos: [o.position.x, o.position.y, o.position.z].map(v => +v.toFixed(4)),
          rot: [o.rotation.x, o.rotation.y, o.rotation.z].map(v => +(v * 180 / Math.PI).toFixed(2)),
          worldPos: [e[12], e[13], e[14]].map(v => +v.toFixed(4))
        };
      });
    }

    return {
      left: getChain(s.robotNodes.leftArmNodes),
      right: getChain(s.robotNodes.rightArmNodes)
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

main().catch(console.error);
