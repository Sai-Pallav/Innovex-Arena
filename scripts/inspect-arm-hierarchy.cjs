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

  const hierarchyInfo = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return { error: 'no __robotScene' };
    const threeScene = scene.getScene();

    function dumpNode(node, depth = 0) {
      const info = {
        name: node.name || node.type,
        type: node.type,
        pos: { x: +node.position.x.toFixed(4), y: +node.position.y.toFixed(4), z: +node.position.z.toFixed(4) },
        rot: {
          x: +(node.rotation.x * 180 / Math.PI).toFixed(2),
          y: +(node.rotation.y * 180 / Math.PI).toFixed(2),
          z: +(node.rotation.z * 180 / Math.PI).toFixed(2)
        },
        childrenCount: node.children.length
      };

      // if it looks like an arm joint or relevant node, recurse
      if (depth < 6) {
        info.children = node.children
          .filter(c => !c.isMesh || c.name.toLowerCase().includes('pivot') || c.name.toLowerCase().includes('mount') || c.name.toLowerCase().includes('arm') || c.name.toLowerCase().includes('elbow') || c.name.toLowerCase().includes('wrist') || c.name.toLowerCase().includes('forearm'))
          .map(c => dumpNode(c, depth + 1));
      }
      return info;
    }

    const leftArmMount = threeScene.getObjectByName('LeftArmMount');
    const rightArmMount = threeScene.getObjectByName('RightArmMount');

    const anim = scene.animationController || window.__anim;

    return {
      leftArm: leftArmMount ? dumpNode(leftArmMount) : null,
      rightArm: rightArmMount ? dumpNode(rightArmMount) : null
    };
  });

  console.log(JSON.stringify(hierarchyInfo, null, 2));
  await browser.close();
}

main().catch(console.error);
