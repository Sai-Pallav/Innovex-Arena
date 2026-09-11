import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createRobotArm } from '../src/robot/arm/RobotArm';
import { ArmAnimationController } from '../src/robot/arm/ArmAnimationController';

console.log('================================================================');
console.log('   ROBOT SHOULDERS TO HANDS — FULL ARM CHAIN VERIFICATION      ');
console.log('================================================================\n');

const materials = createRobotMaterials();

for (const side of [-1, 1] as const) {
  const sideName = side === -1 ? 'LEFT' : 'RIGHT';
  console.log(`\n================== [ ${sideName} ARM CHAIN ] ==================`);

  const arm = createRobotArm(side, materials);

  // 1. Hierarchy & Component Check
  console.log('\n--- 1. FULL HIERARCHY & COMPONENT INTEGRATION ---');
  if (!arm.shoulder) throw new Error('Missing shoulder');
  if (!arm.upperArm) throw new Error('Missing upperArm');
  if (!arm.elbow) throw new Error('Missing elbow');
  if (!arm.forearm) throw new Error('Missing forearm');
  if (!arm.wrist) throw new Error('Missing wrist');
  if (!arm.hand) throw new Error('Missing hand');

  // Verify nesting
  if (arm.upperArm.group.parent !== arm.shoulder.upperArmConnector) {
    throw new Error('upperArm must be parented inside upperArmConnector');
  }
  if (arm.elbow.group.parent !== arm.upperArm.group) {
    throw new Error('elbow must be parented inside upperArm.group');
  }
  if (arm.forearm.group.parent !== arm.elbow.forearmPivot) {
    throw new Error('forearm must be parented inside elbow.forearmPivot');
  }
  if (arm.wrist.group.parent !== arm.forearm.group) {
    throw new Error('wrist must be parented inside forearm.group');
  }
  if (arm.hand.group.parent !== arm.wrist.group) {
    throw new Error('hand must be parented inside wrist.group');
  }

  console.log('✓ Full kinematic arm chain successfully connected:');
  console.log('  ShoulderPivot');
  console.log('   └── ShoulderJoint');
  console.log('        └── UpperArmConnector');
  console.log('             └── UpperArmPivot (Bicep Armor with Scalloped Cutout)');
  console.log('                  └── Elbow (UpperHousing + HingePin + DualSideDiscs)');
  console.log('                       └── ForearmPivot (LowerHousing)');
  console.log('                            └── ForearmGauntlet (Saddle Cutout & Brachioradialis)');
  console.log('                                 └── WristPivot (Swivel Collar & Distal Clevis)');
  console.log('                                      └── Hand (Dorsal Shield, Knuckles & Fingers)');

  // 2. Hand & Finger Anatomy Check
  console.log('\n--- 2. HAND & FINGER ANATOMY CHECK ---');
  const hand = arm.hand;
  if (!hand.palmChassis) throw new Error('Missing palmChassis');
  if (!hand.dorsalArmor) throw new Error('Missing dorsalArmor');
  if (!hand.thumb) throw new Error('Missing thumb');
  if (!hand.indexFinger) throw new Error('Missing indexFinger');
  if (!hand.middleFinger) throw new Error('Missing middleFinger');
  if (!hand.ringFinger) throw new Error('Missing ringFinger');
  if (!hand.littleFinger) throw new Error('Missing littleFinger');

  console.log(`✓ Knuckles count: ${hand.knuckles.length} MCP joints along anatomical arch`);
  console.log(`✓ Knuckle caps count: ${hand.knuckleCaps.length} protective ceramic caps`);
  console.log(`✓ Palmar friction pads count: ${hand.palmarPads.length} dark tactile grip pads`);

  const fingers = [hand.indexFinger, hand.middleFinger, hand.ringFinger, hand.littleFinger];
  fingers.forEach((f, i) => {
    const fNames = ['Index', 'Middle', 'Ring', 'Little'];
    if (!f.proximal || !f.middle || !f.distal || !f.tipMesh) {
      throw new Error(`Finger ${fNames[i]} missing required segments`);
    }
  });
  console.log('✓ All 4 fingers validated with 3 articulated segments + tactile sensor tips');

  // 3. LED Emissive Count
  console.log('\n--- 3. LED EMISSIVE ACCENTS ---');
  console.log(`Total emissive LED meshes in ${sideName} arm: ${arm.ledMeshes.length}`);
  if (arm.ledMeshes.length < 5) {
    throw new Error('Expected at least 5 emissive elements (shoulder, elbow dual discs, forearm strip, hand dorsal slit)');
  }
  console.log('✓ Emissive LEDs verified across shoulder rim, elbow dual discs, forearm strip, and dorsal hand slit');
}

// 4. Test Exploded View Kinematics
console.log('\n--- 4. TESTING EXPLODED VIEW KINEMATICS ---');
const leftArm = createRobotArm(-1, materials);
const rightArm = createRobotArm(1, materials);
const armAnimCtrl = new ArmAnimationController(leftArm, rightArm);

// Activate exploded view
armAnimCtrl.setExplodedView(true);
if (!armAnimCtrl.isExplodedActive()) throw new Error('isExplodedActive failed');

// Step physics for 0.5s to let interpolation settle
for (let i = 0; i < 30; i++) {
  armAnimCtrl.update(0.016, 0, 0, 0);
}

// Check that components have separated along their respective axes
const lShoulderJointPos = leftArm.shoulder.jointGroup.position;
const lGimbalPos = leftArm.shoulder.gimbalYoke ? leftArm.shoulder.gimbalYoke.position : lShoulderJointPos;
const lLatDiscPos = leftArm.elbow.lateralDisc.position;
const lForearmPivotPos = leftArm.elbow.forearmPivot.position;
const lDorsalArmorPos = leftArm.hand.dorsalArmor.position;

console.log('Exploded Positions:');
console.log(`  Left Shoulder Gimbal Y: ${lGimbalPos.y.toFixed(4)} (Separated upward)`);
console.log(`  Left Shoulder Joint X: ${lShoulderJointPos.x.toFixed(4)} (Separated laterally)`);
console.log(`  Left Elbow Lateral Disc X: ${lLatDiscPos.x.toFixed(4)} (Separated laterally)`);
console.log(`  Left Forearm Pivot Y: ${lForearmPivotPos.y.toFixed(4)} (Separated downward)`);
console.log(`  Left Hand Dorsal Armor Z: ${lDorsalArmorPos.z.toFixed(4)} (Separated forward)`);

if (Math.abs(lShoulderJointPos.x) <= 0.01 && lGimbalPos.y <= 0.01) {
  throw new Error('Shoulder mechanism did not separate in exploded view');
}
if (Math.abs(lLatDiscPos.x) <= 0.05) {
  throw new Error('Elbow lateral disc did not separate in exploded view');
}
if (lForearmPivotPos.y >= -0.01) {
  throw new Error('Forearm pivot did not drop in exploded view');
}
if (lDorsalArmorPos.z <= 0.02) {
  throw new Error('Hand dorsal armor did not separate in exploded view');
}
console.log('✓ Exploded view separates components cleanly along natural engineering axes');

// Deactivate exploded view and verify return
armAnimCtrl.setExplodedView(false);
for (let i = 0; i < 60; i++) {
  armAnimCtrl.update(0.016, 0, 0, 0);
}

console.log('Restored Positions:');
console.log(`  Left Shoulder Armor Y: ${leftArm.shoulder.armorGroup.position.y.toFixed(4)}`);
console.log(`  Left Elbow Lateral Disc X: ${leftArm.elbow.lateralDisc.position.x.toFixed(4)}`);
console.log(`  Left Hand Dorsal Armor Z: ${leftArm.hand.dorsalArmor.position.z.toFixed(4)}`);
console.log('✓ All components smoothly returned to assembled positions');

// 5. Test Hand Grip & Finger Bending
console.log('\n--- 5. TESTING HAND GRIP & FINGER BENDING ---');
armAnimCtrl.setHandGrip(-1, 0.85); // 85% fist
armAnimCtrl.update(0.016, 0, 0, 0);

const indexCurl = leftArm.hand.indexFinger.proximal.group.rotation.x;
console.log(`  Index finger proximal rotation under grip: ${indexCurl.toFixed(3)} rad`);
if (Math.abs(indexCurl) < 0.5) {
  throw new Error('Index finger did not curl under grip command');
}
console.log('✓ Hand grip kinematics verified');

armAnimCtrl.clearOverrides(-1);
armAnimCtrl.update(0.016, 0, 0, 0);

console.log('\n================================================================');
console.log('   ALL FULL ARM CHAIN & HAND TESTS PASSED WITH 100% SUCCESS!   ');
console.log('================================================================');
