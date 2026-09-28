const puppeteer = require('puppeteer-core');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));

  const info = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return { error: 'no scene' };
    const nodes = scene.robotNodes;
    if (!nodes) return { error: 'no nodes' };

    const lArm = nodes.leftArmNodes;
    const rArm = nodes.rightArmNodes;

    return {
      left: {
        upperArmRot: { x: lArm.upperArm.group.rotation.x, y: lArm.upperArm.group.rotation.y, z: lArm.upperArm.group.rotation.z },
        elbowPivotRot: { x: lArm.elbow.forearmPivot.rotation.x, y: lArm.elbow.forearmPivot.rotation.y, z: lArm.elbow.forearmPivot.rotation.z },
        forearmRot: { x: lArm.forearm.group.rotation.x, y: lArm.forearm.group.rotation.y, z: lArm.forearm.group.rotation.z },
        wristRot: { x: lArm.wrist.group.rotation.x, y: lArm.wrist.group.rotation.y, z: lArm.wrist.group.rotation.z },
        indexProxRot: lArm.hand?.indexFinger?.proximal?.group?.rotation?.x,
        thumbProxRot: lArm.hand?.thumb?.proximal?.group?.rotation?.x,
      },
      right: {
        upperArmRot: { x: rArm.upperArm.group.rotation.x, y: rArm.upperArm.group.rotation.y, z: rArm.upperArm.group.rotation.z },
        elbowPivotRot: { x: rArm.elbow.forearmPivot.rotation.x, y: rArm.elbow.forearmPivot.rotation.y, z: rArm.elbow.forearmPivot.rotation.z },
        forearmRot: { x: rArm.forearm.group.rotation.x, y: rArm.forearm.group.rotation.y, z: rArm.forearm.group.rotation.z },
        wristRot: { x: rArm.wrist.group.rotation.x, y: rArm.wrist.group.rotation.y, z: rArm.wrist.group.rotation.z },
        indexProxRot: rArm.hand?.indexFinger?.proximal?.group?.rotation?.x,
        thumbProxRot: rArm.hand?.thumb?.proximal?.group?.rotation?.x,
      }
    };
  });

  console.log('ARM ANGLES:', JSON.stringify(info, null, 2));
  await browser.close();
}

main().catch(console.error);
