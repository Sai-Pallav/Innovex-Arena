const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:/Users/kotas/.gemini/antigravity-ide/brain/35d32577-543d-4a84-baa5-bb7d94aaae1c';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function main() {
  console.log('Connecting to browser and running full arm audit...');
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
      '--window-size=1600,1200'
    ],
    defaultViewport: { width: 1600, height: 1200 }
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3500));

  // Extract comprehensive hierarchy, transforms, and joint coordinates
  const auditData = await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return { error: 'No __robotScene found' };
    const scene = sceneObj.getScene();

    function getObj(name) {
      let found = scene.getObjectByName(name);
      if (!found) {
        scene.traverse(o => {
          if (!found && o.name && o.name.toLowerCase() === name.toLowerCase()) found = o;
        });
      }
      return found;
    }

    function getWP(obj) {
      if (!obj) return null;
      const v = new obj.position.constructor();
      obj.getWorldPosition(v);
      return { x: +v.x.toFixed(4), y: +v.y.toFixed(4), z: +v.z.toFixed(4) };
    }

    function getWR(obj) {
      if (!obj) return null;
      const q = new obj.quaternion.constructor();
      obj.getWorldQuaternion(q);
      const e = new obj.rotation.constructor();
      e.setFromQuaternion(q);
      return {
        x: +(e.x * 180 / Math.PI).toFixed(2),
        y: +(e.y * 180 / Math.PI).toFixed(2),
        z: +(e.z * 180 / Math.PI).toFixed(2)
      };
    }

    function getLocal(obj) {
      if (!obj) return null;
      return {
        pos: { x: +obj.position.x.toFixed(4), y: +obj.position.y.toFixed(4), z: +obj.position.z.toFixed(4) },
        rotDeg: {
          x: +(obj.rotation.x * 180 / Math.PI).toFixed(2),
          y: +(obj.rotation.y * 180 / Math.PI).toFixed(2),
          z: +(obj.rotation.z * 180 / Math.PI).toFixed(2)
        },
        scale: { x: +obj.scale.x.toFixed(3), y: +obj.scale.y.toFixed(3), z: +obj.scale.z.toFixed(3) }
      };
    }

    function dist(p1, p2) {
      if (!p1 || !p2) return 0;
      const dx = p1.x - p2.x, dy = p1.y - p2.y, dz = p1.z - p2.z;
      return +Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(4);
    }

    // Inspect Key Chain Nodes for both arms
    const sides = [
      { prefix: 'Right', side: 1 },
      { prefix: 'Left', side: -1 }
    ];

    const arms = {};

    for (const { prefix, side } of sides) {
      const shoulderFound = getObj(`${prefix}ShoulderFoundation`);
      const shoulderJoint = getObj(`${prefix}ShoulderJoint`);
      const armMount = getObj(`${prefix}ArmMount`);
      const armRoot = getObj(`${prefix}RobotArmRoot`);
      const upperArm = getObj(`${prefix}UpperArmAssembly`);
      const elbowMount = getObj(`${prefix}DistalElbowMount`);
      const elbowRoot = getObj(`${prefix}ElbowRoot`);
      const forearmPivot = getObj(`${prefix}ForearmPivot`);
      const forearm = getObj(`${prefix}ForearmAssembly`);
      const wristMount = getObj(`${prefix}DistalWristMount`);
      const wristPivot = getObj(`${prefix}WristPivot`);
      const wristTrunnion = getObj(`${prefix}WristTrunnion`);
      const handMount = getObj(`${prefix}DistalHandMount`);
      const handRoot = getObj(`${prefix}HandRoot`);
      const knuckleBed = handRoot ? getObj('MetacarpalKnuckleBed') : null;

      // LED / Accent lines
      const upperLed = upperArm ? upperArm.getObjectByName('UpperArmPurpleLEDAccent') : null;
      const elbowRing = elbowRoot ? elbowRoot.getObjectByName('LateralActuatorDisc_PurpleEmissiveRing') : null;
      const forearmLed = forearm ? forearm.getObjectByName('ForearmPurpleLEDAccent') : null;
      const wristLed = wristPivot ? wristPivot.getObjectByName('WristPurpleEmissiveSlot') : null;
      const handLed = handRoot ? handRoot.getObjectByName('HandTelemetryLED') : null;

      // Finger Tips
      function getDigitTip(dName) {
        if (!handRoot) return null;
        let tip = null;
        handRoot.traverse(o => {
          if (!tip && o.name && o.name.toLowerCase().includes(dName.toLowerCase()) && o.name.toLowerCase().includes('distal')) {
            tip = o;
          }
        });
        return tip;
      }

      const indexTip = getDigitTip('Index');
      const middleTip = getDigitTip('Middle');
      const ringTip = getDigitTip('Ring');
      const littleTip = getDigitTip('Little');
      const thumbTip = getDigitTip('Thumb');

      const pShoulder = getWP(shoulderJoint);
      const pArmMount = getWP(armMount);
      const pUpperArm = getWP(upperArm);
      const pElbowMount = getWP(elbowMount);
      const pForearmPivot = getWP(forearmPivot);
      const pWristMount = getWP(wristMount);
      const pWristTrunnion = getWP(wristTrunnion);
      const pHandMount = getWP(handMount);
      const pMiddleTip = getWP(middleTip);

      const upperArmLen = dist(pArmMount, pElbowMount);
      const forearmLen = dist(pForearmPivot, pWristMount);
      const wristLen = dist(pWristMount, pHandMount);
      const handLen = dist(pHandMount, pMiddleTip);
      const totalReach = dist(pArmMount, pMiddleTip);

      arms[prefix] = {
        side,
        transforms: {
          shoulderFoundation: getLocal(shoulderFound),
          shoulderJoint: getLocal(shoulderJoint),
          armMount: getLocal(armMount),
          armRoot: getLocal(armRoot),
          upperArm: getLocal(upperArm),
          elbowMount: getLocal(elbowMount),
          elbowRoot: getLocal(elbowRoot),
          forearmPivot: getLocal(forearmPivot),
          forearm: getLocal(forearm),
          wristMount: getLocal(wristMount),
          wristPivot: getLocal(wristPivot),
          wristTrunnion: getLocal(wristTrunnion),
          handMount: getLocal(handMount),
          handRoot: getLocal(handRoot)
        },
        worldPositions: {
          shoulderJoint: pShoulder,
          armMount: pArmMount,
          upperArm: pUpperArm,
          distalElbowMount: pElbowMount,
          forearmPivot: pForearmPivot,
          distalWristMount: pWristMount,
          wristTrunnion: pWristTrunnion,
          distalHandMount: pHandMount,
          middleTip: pMiddleTip,
          thumbTip: getWP(thumbTip),
          indexTip: getWP(indexTip),
          ringTip: getWP(ringTip),
          littleTip: getWP(littleTip)
        },
        worldRotations: {
          upperArm: getWR(upperArm),
          forearm: getWR(forearm),
          wrist: getWR(wristPivot),
          hand: getWR(handRoot)
        },
        lengths: {
          upperArm: upperArmLen,
          forearm: forearmLen,
          wrist: wristLen,
          hand: handLen,
          totalReach: totalReach
        },
        accentLines: {
          upperLed: { wp: getWP(upperLed), local: getLocal(upperLed) },
          elbowRing: { wp: getWP(elbowRing), local: getLocal(elbowRing) },
          forearmLed: { wp: getWP(forearmLed), local: getLocal(forearmLed) },
          wristLed: { wp: getWP(wristLed), local: getLocal(wristLed) },
          handLed: { wp: getWP(handLed), local: getLocal(handLed) }
        }
      };
    }

    return arms;
  });

  fs.writeFileSync(path.join(outDir, 'arm_hierarchy_initial_audit.json'), JSON.stringify(auditData, null, 2));
  console.log('Saved arm_hierarchy_initial_audit.json');

  // Prepare page styling for clean screenshots
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      header, nav, footer, h1, h2, h3, p, button, a, .badge, .grid, [class*="hero"], [class*="stats"], [class*="atmosphere"] {
        display: none !important;
      }
      #home-hero > div > div:first-child {
        display: none !important;
      }
      #home-hero > div > div:last-child {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 999999 !important;
      }
    `;
    document.head.appendChild(style);

    const sceneObj = window.__robotScene;
    if (sceneObj) {
      if (sceneObj.animFrameId) cancelAnimationFrame(sceneObj.animFrameId);
      sceneObj.stop();
      const root = sceneObj.getScene().getObjectByName('RobotRoot');
      if (root) {
        root.rotation.set(0, 0, 0);
        root.position.set(0, -0.45, 0);
        root.scale.setScalar(1.0);
        root.updateMatrixWorld(true);
      }
    }
  });

  async function captureTarget(filename, camPos, lookAtPos, viewport = { width: 1400, height: 1400 }) {
    await page.setViewport(viewport);
    await page.evaluate(({ camPos, lookAtPos, viewport }) => {
      const sceneObj = window.__robotScene;
      if (!sceneObj) return;
      const scene = sceneObj.getScene();
      const cam = sceneObj.getCamera();

      cam.aspect = viewport.width / viewport.height;
      cam.near = 0.01;
      cam.far = 100;
      cam.position.set(camPos.x, camPos.y, camPos.z);
      cam.lookAt(lookAtPos.x, lookAtPos.y, lookAtPos.z);
      cam.updateProjectionMatrix();

      sceneObj.getRenderer().setSize(viewport.width, viewport.height);
      sceneObj.getRenderer().render(scene, cam);
    }, { camPos, lookAtPos, viewport });

    await new Promise(r => setTimeout(r, 200));
    const filePath = path.join(outDir, filename);
    await page.screenshot({ path: filePath });
    console.log(`Saved screenshot: ${filename}`);
  }

  // 10 Authoritative Validation Views specified in Section 28:
  // 1. Full front view
  await captureTarget('01_full_front_view.png', { x: 0, y: -0.28, z: 1.65 }, { x: 0, y: -0.28, z: 0 }, { width: 1400, height: 1600 });

  // 2. 3/4 front view
  await captureTarget('02_three_quarter_front_view.png', { x: 0.85, y: -0.25, z: 1.35 }, { x: 0, y: -0.28, z: 0 }, { width: 1400, height: 1600 });

  // 3. Left side view (Viewer's left / Robot's right arm)
  await captureTarget('03_left_side_view.png', { x: -1.25, y: -0.28, z: 0.10 }, { x: -0.30, y: -0.28, z: 0 }, { width: 1200, height: 1600 });

  // 4. Right side view (Viewer's right / Robot's left arm)
  await captureTarget('04_right_side_view.png', { x: 1.25, y: -0.28, z: 0.10 }, { x: 0.30, y: -0.28, z: 0 }, { width: 1200, height: 1600 });

  // 5. Shoulder close-up (Right shoulder)
  await captureTarget('05_shoulder_closeup.png', { x: 0.28, y: 0.05, z: 0.45 }, { x: 0.24, y: 0.03, z: 0.02 }, { width: 1200, height: 1200 });

  // 6. Upper-arm close-up
  await captureTarget('06_upperarm_closeup.png', { x: 0.38, y: -0.11, z: 0.45 }, { x: 0.33, y: -0.11, z: 0.02 }, { width: 1200, height: 1200 });

  // 7. Elbow close-up
  await captureTarget('07_elbow_closeup.png', { x: 0.44, y: -0.23, z: 0.42 }, { x: 0.38, y: -0.23, z: 0.03 }, { width: 1200, height: 1200 });

  // 8. Forearm close-up
  await captureTarget('08_forearm_closeup.png', { x: 0.38, y: -0.34, z: 0.42 }, { x: 0.34, y: -0.34, z: 0.04 }, { width: 1200, height: 1200 });

  // 9. Wrist/hand close-up
  await captureTarget('09_wrist_hand_closeup.png', { x: 0.40, y: -0.47, z: 0.42 }, { x: 0.38, y: -0.47, z: 0.12 }, { width: 1200, height: 1200 });

  // 10. Finger close-up
  await captureTarget('10_finger_closeup.png', { x: 0.36, y: -0.60, z: 0.45 }, { x: 0.35, y: -0.60, z: 0.14 }, { width: 1200, height: 1200 });

  await browser.close();
  console.log('Capture & initial inspection complete!');
}

main().catch(console.error);
