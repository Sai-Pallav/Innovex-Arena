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

  const results = await page.evaluate(() => {
    const s = window.__robotScene;
    if (!s || !s.robotNodes) return { error: 'no nodes' };

    const arm = s.robotNodes.leftArmNodes;
    const eUpper = arm.upperArm.group.matrixWorld.elements;
    const eElbow = arm.elbow.group.matrixWorld.elements;
    const eWrist = arm.wrist.group.matrixWorld.elements;

    const shoulderWorld = [eUpper[12], eUpper[13], eUpper[14]];
    const elbowWorld = [eElbow[12], eElbow[13], eElbow[14]];
    const wristWorld = [eWrist[12], eWrist[13], eWrist[14]];

    // Upper arm vector: shoulder -> elbow
    const vUpper = [
      elbowWorld[0] - shoulderWorld[0],
      elbowWorld[1] - shoulderWorld[1],
      elbowWorld[2] - shoulderWorld[2]
    ];

    // Forearm vector: elbow -> wrist
    const vForearm = [
      wristWorld[0] - elbowWorld[0],
      wristWorld[1] - elbowWorld[1],
      wristWorld[2] - elbowWorld[2]
    ];

    // Angle of upper arm relative to vertical (-Y)
    const upperPitchDeg = Math.atan2(vUpper[2], -vUpper[1]) * 180 / Math.PI;
    const upperRollDeg = Math.atan2(vUpper[0], -vUpper[1]) * 180 / Math.PI;

    // Angle of forearm relative to vertical (-Y)
    const forearmPitchDeg = Math.atan2(vForearm[2], -vForearm[1]) * 180 / Math.PI;
    const forearmRollDeg = Math.atan2(vForearm[0], -vForearm[1]) * 180 / Math.PI;

    // Angle between upper arm and forearm vectors
    const lenU = Math.sqrt(vUpper[0]**2 + vUpper[1]**2 + vUpper[2]**2);
    const lenF = Math.sqrt(vForearm[0]**2 + vForearm[1]**2 + vForearm[2]**2);
    const dot = (vUpper[0]*vForearm[0] + vUpper[1]*vForearm[1] + vUpper[2]*vForearm[2]) / (lenU * lenF);
    const angleBetweenDeg = Math.acos(Math.min(1, Math.max(-1, dot))) * 180 / Math.PI;

    return {
      shoulderWorld,
      elbowWorld,
      wristWorld,
      upperArmPitchDeg: +upperPitchDeg.toFixed(2),
      upperArmRollDeg: +upperRollDeg.toFixed(2),
      forearmPitchDeg: +forearmPitchDeg.toFixed(2),
      forearmRollDeg: +forearmRollDeg.toFixed(2),
      elbowAngleBetweenDeg: +angleBetweenDeg.toFixed(2)
    };
  });

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch(console.error);
