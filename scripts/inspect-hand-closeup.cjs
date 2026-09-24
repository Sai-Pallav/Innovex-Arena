const puppeteer = require('puppeteer-core');
const path = require('path');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--window-size=1200,1200'
    ],
    defaultViewport: { width: 1200, height: 1200 }
  });

  const page = await browser.newPage();
  console.log('Navigating...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));

  const tree = await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return { error: 'No __robotScene' };
    const scene = sceneObj.getScene();
    
    function dumpObj(o, depth = 0) {
      const res = { name: o.name, type: o.type, children: [] };
      if (depth < 6) {
        for (const c of o.children) {
          res.children.push(dumpObj(c, depth + 1));
        }
      }
      return res;
    }
    
    const leftArm = scene.getObjectByName('LeftRobotArmRoot');
    const rightArm = scene.getObjectByName('RightRobotArmRoot');
    return {
      leftArm: leftArm ? dumpObj(leftArm) : null,
      rightArm: rightArm ? dumpObj(rightArm) : null
    };
  });
  console.log('Arm tree:', JSON.stringify(tree, null, 2));

  // Frame specifically on RightHandRoot / RightWristInterface
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return;
    const scene = sceneObj.getScene();
    const cam = sceneObj.getCamera();
    
    // Find right hand
    let targetObj = scene.getObjectByName('RightHandRoot') || scene.getObjectByName('RightWristInterface');
    if (!targetObj) {
      scene.traverse(o => {
        if (!targetObj && o.name && o.name.toLowerCase().includes('righthand')) targetObj = o;
      });
    }

    if (targetObj) {
      const wp = new targetObj.position.constructor();
      targetObj.getWorldPosition(wp);
      console.log('Hand world position:', wp.x, wp.y, wp.z);
      
      cam.position.set(wp.x, wp.y - 0.02, wp.z + 0.28);
      cam.lookAt(wp.x, wp.y - 0.03, wp.z);
      cam.updateProjectionMatrix();
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  const outPath = path.join('C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\23ad34cd-6496-463b-b5c4-260010fe3978', 'current_hand_closeup.png');
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot to:', outPath);

  await browser.close();
}

main().catch(console.error);
