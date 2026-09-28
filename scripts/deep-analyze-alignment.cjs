const puppeteer = require('puppeteer-core');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2500));

  const analysis = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) return { error: 'no scene' };
    const nodes = scene.robotNodes;
    if (!nodes) return { error: 'no nodes' };

    function getChainData(arm, shoulderMount, sideName, sideSign) {
      function getPose(obj) {
        if (!obj) return null;
        obj.updateWorldMatrix(true, false);
        const pos = obj.position.clone();
        obj.getWorldPosition(pos);
        const quat = obj.quaternion.clone();
        obj.getWorldQuaternion(quat);
        const euler = obj.rotation.clone().setFromQuaternion(quat, 'XYZ');
        return {
          pos: { x: +pos.x.toFixed(4), y: +pos.y.toFixed(4), z: +pos.z.toFixed(4) },
          rotDeg: { x: +(euler.x * 180 / Math.PI).toFixed(2), y: +(euler.y * 180 / Math.PI).toFixed(2), z: +(euler.z * 180 / Math.PI).toFixed(2) },
          localRotDeg: { x: +(obj.rotation.x * 180 / Math.PI).toFixed(2), y: +(obj.rotation.y * 180 / Math.PI).toFixed(2), z: +(obj.rotation.z * 180 / Math.PI).toFixed(2) },
          localPos: { x: +obj.position.x.toFixed(4), y: +obj.position.y.toFixed(4), z: +obj.position.z.toFixed(4) }
        };
      }

      // Hinge axis in world coordinates:
      let hingeAxisWorld = { x: 0, y: 0, z: 0 };
      if (arm.elbow && arm.elbow.group) {
        arm.elbow.group.updateWorldMatrix(true, false);
        const v = arm.elbow.group.position.clone().set(1, 0, 0);
        v.transformDirection(arm.elbow.group.matrixWorld);
        hingeAxisWorld = { x: +v.x.toFixed(4), y: +v.y.toFixed(4), z: +v.z.toFixed(4) };
      }

      // Forearm bend direction:
      let forearmDirWorld = { x: 0, y: 0, z: 0 };
      if (arm.elbow && arm.elbow.forearmPivot) {
        arm.elbow.forearmPivot.updateWorldMatrix(true, false);
        const v = arm.elbow.forearmPivot.position.clone().set(0, -1, 0);
        v.transformDirection(arm.elbow.forearmPivot.matrixWorld);
        forearmDirWorld = { x: +v.x.toFixed(4), y: +v.y.toFixed(4), z: +v.z.toFixed(4) };
      }

      // Wrist dorsal normal:
      let dorsalNormalWorld = { x: 0, y: 0, z: 0 };
      if (arm.wrist && arm.wrist.group) {
        arm.wrist.group.updateWorldMatrix(true, false);
        const v = arm.wrist.group.position.clone().set(0, 0, 1);
        v.transformDirection(arm.wrist.group.matrixWorld);
        dorsalNormalWorld = { x: +v.x.toFixed(4), y: +v.y.toFixed(4), z: +v.z.toFixed(4) };
      }

      // Palm normal vector:
      let palmNormalWorld = { x: 0, y: 0, z: 0 };
      if (arm.hand && arm.hand.group) {
        arm.hand.group.updateWorldMatrix(true, false);
        const v = arm.hand.group.position.clone().set(0, 0, -1);
        v.transformDirection(arm.hand.group.matrixWorld);
        palmNormalWorld = { x: +v.x.toFixed(4), y: +v.y.toFixed(4), z: +v.z.toFixed(4) };
      }

      // Fingers world positions
      const fingerTips = {};
      if (arm.hand) {
        const fingers = ['indexFinger', 'middleFinger', 'ringFinger', 'littleFinger'];
        fingers.forEach(fName => {
          const f = arm.hand[fName];
          if (f && f.distal && f.distal.group) {
            f.distal.group.updateWorldMatrix(true, false);
            const p = f.distal.group.position.clone();
            f.distal.group.getWorldPosition(p);
            fingerTips[fName] = { x: +p.x.toFixed(4), y: +p.y.toFixed(4), z: +p.z.toFixed(4) };
          }
        });

        if (arm.hand.thumb && arm.hand.thumb.distal && arm.hand.thumb.distal.group) {
          arm.hand.thumb.distal.group.updateWorldMatrix(true, false);
          const p = arm.hand.thumb.distal.group.position.clone();
          arm.hand.thumb.distal.group.getWorldPosition(p);
          fingerTips.thumb = { x: +p.x.toFixed(4), y: +p.y.toFixed(4), z: +p.z.toFixed(4) };
        }
      }

      return {
        sideName,
        shoulderMount: getPose(shoulderMount?.group),
        armRoot: getPose(arm.root),
        upperArm: getPose(arm.upperArm?.group),
        distalElbowMount: getPose(arm.upperArm?.distalElbowMount),
        elbowGroup: getPose(arm.elbow?.group),
        elbowForearmPivot: getPose(arm.elbow?.forearmPivot),
        forearmGroup: getPose(arm.forearm?.group),
        distalWristMount: getPose(arm.forearm?.distalWristMount),
        wristGroup: getPose(arm.wrist?.group),
        wristTrunnion: getPose(arm.wrist?.trunnionPivot),
        handGroup: getPose(arm.hand?.group),
        hingeAxisWorld: { x: +hingeAxisWorld.x.toFixed(4), y: +hingeAxisWorld.y.toFixed(4), z: +hingeAxisWorld.z.toFixed(4) },
        forearmDirWorld: { x: +forearmDirWorld.x.toFixed(4), y: +forearmDirWorld.y.toFixed(4), z: +forearmDirWorld.z.toFixed(4) },
        dorsalNormalWorld: { x: +dorsalNormalWorld.x.toFixed(4), y: +dorsalNormalWorld.y.toFixed(4), z: +dorsalNormalWorld.z.toFixed(4) },
        palmNormalWorld: { x: +palmNormalWorld.x.toFixed(4), y: +palmNormalWorld.y.toFixed(4), z: +palmNormalWorld.z.toFixed(4) },
        fingerTips
      };
    }

    const leftData = getChainData(nodes.leftArmNodes, nodes.torsoNodes?.shoulderMountLeft, 'LEFT (side=-1, screen-right)', -1);
    const rightData = getChainData(nodes.rightArmNodes, nodes.torsoNodes?.shoulderMountRight, 'RIGHT (side=1, screen-left)', 1);

    return { left: leftData, right: rightData };
  });

  console.log(JSON.stringify(analysis, null, 2));
  await browser.close();
}

main().catch(console.error);
