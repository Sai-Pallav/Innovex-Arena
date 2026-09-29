const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\ba1b4369-2623-4fa8-ac3b-25ef92c54af4';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function main() {
  console.log('Launching browser to audit arm proportions...');
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
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 4000));

  // Extract detailed measurements of the arm chain
  const armAnalysis = await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (!sceneObj) return { error: 'No __robotScene found' };
    const scene = sceneObj.getScene();

    const THREE = window.THREE || (scene.children[0] && scene.children[0].position.constructor.prototype);

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

    function getBBox(obj) {
      if (!obj) return null;
      // create Box3
      const box = new obj.position.constructor().clone();
      // Three.js Box3
      const Box3 = obj.parent ? (obj.parent.position.constructor.name === 'Vector3' ? window.THREE?.Box3 : null) : null;
      // We can compute bounding box manually across meshes
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      obj.traverse(child => {
        if (child.isMesh && child.geometry) {
          if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
          const gb = child.geometry.boundingBox;
          if (gb) {
            const corners = [
              new child.position.constructor(gb.min.x, gb.min.y, gb.min.z),
              new child.position.constructor(gb.max.x, gb.min.y, gb.min.z),
              new child.position.constructor(gb.min.x, gb.max.y, gb.min.z),
              new child.position.constructor(gb.max.x, gb.max.y, gb.min.z),
              new child.position.constructor(gb.min.x, gb.min.y, gb.max.z),
              new child.position.constructor(gb.max.x, gb.min.y, gb.max.z),
              new child.position.constructor(gb.min.x, gb.max.y, gb.max.z),
              new child.position.constructor(gb.max.x, gb.max.y, gb.max.z)
            ];
            corners.forEach(c => {
              c.applyMatrix4(child.matrixWorld);
              if (c.x < minX) minX = c.x;
              if (c.y < minY) minY = c.y;
              if (c.z < minZ) minZ = c.z;
              if (c.x > maxX) maxX = c.x;
              if (c.y > maxY) maxY = c.y;
              if (c.z > maxZ) maxZ = c.z;
            });
          }
        }
      });
      if (minX === Infinity) return null;
      return {
        min: { x: +minX.toFixed(4), y: +minY.toFixed(4), z: +minZ.toFixed(4) },
        max: { x: +maxX.toFixed(4), y: +maxY.toFixed(4), z: +maxZ.toFixed(4) },
        size: {
          x: +(maxX - minX).toFixed(4),
          y: +(maxY - minY).toFixed(4),
          z: +(maxZ - minZ).toFixed(4)
        }
      };
    }

    function dist(p1, p2) {
      if (!p1 || !p2) return 0;
      const dx = p1.x - p2.x, dy = p1.y - p2.y, dz = p1.z - p2.z;
      return +Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(4);
    }

    // Nodes along Right Arm (Viewer's Right, side = 1)
    const rightShoulder = getObj('RightShoulderFoundation') || getObj('RightShoulderModule');
    const rightArmMount = getObj('RightArmMount');
    const rightArmRoot = getObj('RightRobotArmRoot');
    const rightUpperArmGroup = rightArmRoot ? rightArmRoot.children[0] : null;
    const rightDistalElbow = getObj('RightDistalElbowMount');
    const rightElbowPivot = getObj('RightForearmPivot');
    const rightForearmGroup = rightElbowPivot ? rightElbowPivot.children[0] : null;
    const rightDistalWrist = getObj('RightDistalWristMount');
    const rightWristGroup = rightDistalWrist ? rightDistalWrist.children.find(c => c.name?.includes('Wrist') || c.type === 'Group') : null;
    const rightWristTrunnion = getObj('RightWristTrunnion');
    const rightDistalHand = getObj('RightDistalHandMount');
    const rightHandRoot = getObj('RightHandRoot');
    
    // Left Arm (Viewer's Left, side = -1)
    const leftShoulder = getObj('LeftShoulderFoundation') || getObj('LeftShoulderModule');
    const leftArmMount = getObj('LeftArmMount');
    const leftArmRoot = getObj('LeftRobotArmRoot');
    const leftUpperArmGroup = leftArmRoot ? leftArmRoot.children[0] : null;
    const leftDistalElbow = getObj('LeftDistalElbowMount');
    const leftElbowPivot = getObj('LeftForearmPivot');
    const leftDistalWrist = getObj('LeftDistalWristMount');
    const leftWristTrunnion = getObj('LeftWristTrunnion');
    const leftDistalHand = getObj('LeftDistalHandMount');
    const leftHandRoot = getObj('LeftHandRoot');

    // Right hand fingers (scoped strictly to right hand root)
    function getChild(parent, name) {
      if (!parent) return null;
      let found = null;
      parent.traverse(o => {
        if (!found && o.name && o.name.toLowerCase() === name.toLowerCase()) found = o;
      });
      return found;
    }

    const rightMiddleKnuckle = getChild(rightHandRoot, 'MetacarpalKnuckleBed');
    const rightIndexTip = getChild(rightHandRoot, 'IndexDistal');
    const rightMiddleTip = getChild(rightHandRoot, 'MiddleDistal');
    const rightRingTip = getChild(rightHandRoot, 'RingDistal');
    const rightLittleTip = getChild(rightHandRoot, 'LittleDistal');
    const rightThumbTip = getChild(rightHandRoot, 'ThumbDistal');

    const pShoulder = getWP(rightShoulder);
    const pArmMount = getWP(rightArmMount);
    const pElbow = getWP(rightDistalElbow);
    const pForearmPivot = getWP(rightElbowPivot);
    const pWrist = getWP(rightDistalWrist);
    const pWristTrunnion = getWP(rightWristTrunnion);
    const pHand = getWP(rightDistalHand);
    const pMiddleTip = getWP(rightMiddleTip);
    const pThumbTip = getWP(rightThumbTip);

    // Segment lengths (Euclidean distance between joint centers)
    const upperArmLength = dist(pArmMount, pElbow);
    const forearmLength = dist(pForearmPivot, pWrist);
    const wristLength = dist(pWrist, pHand);
    const handLength = dist(pHand, pMiddleTip);
    const totalArmReach = dist(pArmMount, pMiddleTip);

    return {
      positions: {
        shoulder: pShoulder,
        armMount: pArmMount,
        elbowMount: pElbow,
        forearmPivot: pForearmPivot,
        wristMount: pWrist,
        wristTrunnion: pWristTrunnion,
        handMount: pHand,
        middleTip: pMiddleTip,
        thumbTip: pThumbTip
      },
      lengths: {
        upperArm: upperArmLength,
        forearm: forearmLength,
        wrist: wristLength,
        hand: handLength,
        totalArmReach: totalArmReach
      },
      ratios: {
        forearm_to_upperArm: +(forearmLength / upperArmLength).toFixed(3),
        hand_to_forearm: +(handLength / forearmLength).toFixed(3),
        hand_to_upperArm: +(handLength / upperArmLength).toFixed(3),
        hand_to_totalArm: +(handLength / totalArmReach).toFixed(3),
        upperArm_to_totalArm: +(upperArmLength / totalArmReach).toFixed(3),
        forearm_to_totalArm: +(forearmLength / totalArmReach).toFixed(3)
      },
      boundingBoxes: {
        upperArm: getBBox(rightUpperArmGroup),
        elbow: getBBox(getObj('LateralActuatorDisc') || rightDistalElbow),
        forearm: getBBox(rightForearmGroup),
        hand: getBBox(rightHandRoot)
      }
    };
  });

  fs.writeFileSync(path.join(outDir, 'post_correction_audit.json'), JSON.stringify(armAnalysis, null, 2));
  console.log('Saved post_correction_audit.json:', JSON.stringify(armAnalysis.lengths, null, 2));
  console.log('Ratios:', JSON.stringify(armAnalysis.ratios, null, 2));

  // Hide UI text/overlays for clean 3D capture
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
  });

  // Pause automatic animation loop so camera overrides are deterministic
  await page.evaluate(() => {
    const sceneObj = window.__robotScene;
    if (sceneObj && sceneObj.animFrameId) {
      cancelAnimationFrame(sceneObj.animFrameId);
    }
  });

  async function captureTarget(filename, targetName, camOffset, lookOffset = { x: 0, y: 0, z: 0 }, viewport = { width: 1400, height: 1600 }) {
    await page.setViewport(viewport);
    await page.evaluate(({ targetName, camOffset, lookOffset, viewport }) => {
      const sceneObj = window.__robotScene;
      if (!sceneObj) return;
      const scene = sceneObj.getScene();

      let wp = new (window.THREE?.Vector3 || scene.children[0]?.position?.constructor)(0, 0, 0);
      if (targetName === 'FullRobot') {
        let rArm = scene.getObjectByName('RightRobotArmRoot');
        let lArm = scene.getObjectByName('LeftRobotArmRoot');
        if (rArm && lArm) {
          const wpR = wp.clone();
          const wpL = wp.clone();
          rArm.getWorldPosition(wpR);
          lArm.getWorldPosition(wpL);
          wp.set((wpR.x + wpL.x) * 0.5, (wpR.y + wpL.y) * 0.5, (wpR.z + wpL.z) * 0.5);
        }
      } else {
        let target = scene.getObjectByName(targetName);
        if (!target) {
          scene.traverse(o => {
            if (!target && o.name && o.name.toLowerCase() === targetName.toLowerCase()) target = o;
          });
        }
        if (!target) return;
        target.getWorldPosition(wp);
      }

      const cam = sceneObj.getCamera();
      cam.aspect = viewport.width / viewport.height;
      cam.near = 0.01;
      cam.position.set(wp.x + camOffset.x, wp.y + camOffset.y, wp.z + camOffset.z);
      cam.lookAt(wp.x + lookOffset.x, wp.y + lookOffset.y, wp.z + lookOffset.z);
      cam.updateProjectionMatrix();
      sceneObj.getRenderer().setSize(viewport.width, viewport.height);
      sceneObj.getRenderer().render(scene, cam);
    }, { targetName, camOffset, lookOffset, viewport });

    const filePath = path.join(outDir, filename);
    await page.screenshot({ path: filePath });
    console.log(`Saved screenshot: ${filename}`);
  }

  // 1. Full Body & Arms (Frontal Heroic View)
  await captureTarget('post_correction_full_robot_arms.png', 'FullRobot', { x: 0, y: -0.28, z: 1.55 }, { x: 0, y: -0.28, z: 0 }, { width: 1500, height: 1600 });

  // 2. Right Arm Chain (Shoulder to Hand)
  await captureTarget('post_correction_right_arm_chain.png', 'RightRobotArmRoot', { x: 0.05, y: -0.28, z: 0.95 }, { x: 0.05, y: -0.28, z: 0 }, { width: 900, height: 1600 });

  // 3. Left Arm Chain (Shoulder to Hand)
  await captureTarget('post_correction_left_arm_chain.png', 'LeftRobotArmRoot', { x: -0.05, y: -0.28, z: 0.95 }, { x: -0.05, y: -0.28, z: 0 }, { width: 900, height: 1600 });

  // 4. Hand and Wrist Detail
  await captureTarget('post_correction_hand_wrist_detail.png', 'RightHandRoot', { x: 0, y: 0, z: 0.45 }, { x: 0, y: 0, z: 0 }, { width: 1000, height: 1200 });

  // 5. Hand Close-up (Dorsal & Knuckles)
  await captureTarget('post_correction_hand_close.png', 'RightHandRoot', { x: 0.02, y: -0.01, z: 0.28 }, { x: 0.02, y: -0.01, z: 0 }, { width: 1000, height: 1000 });

  await browser.close();
  console.log('Audit complete!');
}

main().catch(console.error);
