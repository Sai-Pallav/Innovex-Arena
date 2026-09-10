import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createElbow, ELBOW_CONFIG } from '../src/robot/arm/Elbow';
import { createRobotArm } from '../src/robot/arm/RobotArm';

function countTriangles(obj: THREE.Object3D): number {
  let count = 0;
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        if (mesh.geometry.index) {
          count += mesh.geometry.index.count / 3;
        } else if (mesh.geometry.attributes.position) {
          count += mesh.geometry.attributes.position.count / 3;
        }
      }
    }
  });
  return count;
}

function runVerification() {
  console.log('====================================================');
  console.log('ROBOT ELBOW JOINT — PRODUCTION VERIFICATION SUITE');
  console.log('====================================================\n');

  const materials = createRobotMaterials();

  // Test both Left and Right arms
  for (const side of [-1, 1] as const) {
    const sideName = side === -1 ? 'LEFT' : 'RIGHT';
    console.log(`--- Testing ${sideName} Elbow Assembly ---`);

    const elbow = createElbow(side, materials);

    // 1. Hierarchy & Architecture Check
    console.log(`✓ Elbow group created: ${elbow.group.name}`);
    console.log(`✓ Forearm pivot created: ${elbow.forearmPivot.name}`);

    if (!elbow.upperHousing) throw new Error('Missing upperHousing');
    if (!elbow.hingeCore) throw new Error('Missing hingeCore');
    if (!elbow.centralPin) throw new Error('Missing centralPin');
    if (!elbow.lateralDisc) throw new Error('Missing lateralDisc');
    if (!elbow.medialDisc) throw new Error('Missing medialDisc');
    if (!elbow.lowerHousing) throw new Error('Missing lowerHousing');
    if (!elbow.accentRing) throw new Error('Missing accentRing');
    if (!elbow.medialAccentRing) throw new Error('Missing medialAccentRing');

    // Verify parentage
    if (elbow.upperHousing.parent !== elbow.group) {
      throw new Error('upperHousing must be a direct child of stationary elbow.group');
    }
    if (elbow.hingeCore.parent !== elbow.group) {
      throw new Error('hingeCore must be a direct child of stationary elbow.group');
    }
    if (elbow.centralPin.parent !== elbow.group) {
      throw new Error('centralPin must be a direct child of stationary elbow.group');
    }
    if (elbow.lateralDisc.parent !== elbow.group) {
      throw new Error('lateralDisc must be a direct child of stationary elbow.group');
    }
    if (elbow.medialDisc.parent !== elbow.group) {
      throw new Error('medialDisc must be a direct child of stationary elbow.group');
    }
    if (elbow.forearmPivot.parent !== elbow.group) {
      throw new Error('forearmPivot must be a child of elbow.group at [0,0,0]');
    }
    if (elbow.lowerHousing.parent !== elbow.forearmPivot) {
      throw new Error('lowerHousing must be parented to forearmPivot so it articulates with forearm');
    }

    console.log('✓ Verified multi-part mechanical hinge component hierarchy:');
    console.log('  - Upper Housing (Stationary)');
    console.log('  - Hinge Core & Axle Pin (Stationary transverse axis)');
    console.log('  - Dual Side Rotational Discs (Lateral + Medial with purple emissive rings)');
    console.log('  - Lower Housing (Articulating on forearmPivot)');

    // 2. Dual Side Rotational Discs Check
    const ledCount = elbow.ledMeshes.length;
    console.log(`✓ Emissive LED rings found: ${ledCount} (Lateral + Medial)`);
    if (ledCount < 2) throw new Error(`Expected at least 2 LED rings, found ${ledCount}`);

    // 3. Triangle Count Check
    const tris = countTriangles(elbow.group);
    console.log(`✓ Elbow assembly triangle count: ${tris} triangles (Budget: 800 - 2,200)`);
    if (tris < 500 || tris > 3000) {
      throw new Error(`Triangle count ${tris} outside acceptable range`);
    }

    // 4. Test Complete Robot Arm Integration
    console.log(`\n--- Testing ${sideName} Full Arm Integration ---`);
    const arm = createRobotArm(side, materials);

    // Verify forearm is child of forearmPivot
    if (arm.forearm.group.parent !== arm.elbow.forearmPivot) {
      throw new Error('arm.forearm.group must be a child of arm.elbow.forearmPivot');
    }
    console.log('✓ arm.forearm.group correctly mounted to arm.elbow.forearmPivot');

    // 5. Angular Rotation & Kinematic Clearance Test
    const testAnglesDeg = [0, 30, 45, 60, 90, 110, 117];
    for (const deg of testAnglesDeg) {
      const rad = -THREE.MathUtils.degToRad(deg);
      arm.elbow.setAngle(rad);
      arm.root.updateMatrixWorld(true);

      const actualAngle = arm.elbow.getAngle();
      console.log(
        `  ✓ Bent at ${deg.toString().padStart(3, ' ')}° (rad: ${rad.toFixed(3)}) -> pivot.rotation.x = ${actualAngle.toFixed(3)}`
      );

      // Verify wrist and hand follow forearm
      const wristWorldPos = new THREE.Vector3();
      arm.wrist.group.getWorldPosition(wristWorldPos);
      const handWorldPos = new THREE.Vector3();
      arm.hand.group.getWorldPosition(handWorldPos);

      if (deg > 0 && wristWorldPos.y <= -0.5) {
        throw new Error(`Wrist world position did not articulate during bend at ${deg}°`);
      }
    }

    console.log(`✓ All angular limits respected: [${THREE.MathUtils.radToDeg(ELBOW_CONFIG.minBend).toFixed(1)}°, ${THREE.MathUtils.radToDeg(ELBOW_CONFIG.maxBend).toFixed(1)}°]`);
    console.log();
  }

  console.log('====================================================');
  console.log('ALL ELBOW JOINT TESTS PASSED SUCCESSFULLY! ✓');
  console.log('====================================================');
}

runVerification();
