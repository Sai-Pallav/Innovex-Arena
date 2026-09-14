import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createRobotArm } from '../src/robot/arm/RobotArm';
import { ELBOW_CONFIG } from '../src/robot/arm/Elbow';

console.log('================================================================');
console.log('       DEEP ANALYSIS: SHOULDER TO HANDS SIZING & INTERFACES     ');
console.log('================================================================\n');

const materials = createRobotMaterials();
const arm = createRobotArm(-1, materials);

// Update all matrices in the hierarchy
arm.root.updateMatrixWorld(true);

function getBox(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  return { box, size, center, min: box.min, max: box.max };
}

// 1. SHOULDER ANALYSIS
console.log('=== 1. SHOULDER MODULE ===');
const sGroup = getBox(arm.shoulder.group);
const sJoint = getBox(arm.shoulder.jointGroup);
const sArmor = getBox(arm.shoulder.armorGroup);
const sFaceplate = getBox(arm.shoulder.faceplateHub);
const sConn = getBox(arm.shoulder.upperArmConnector);

console.log('Shoulder Group bounds:', sGroup.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Shoulder Armor bounds:', sArmor.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Shoulder Faceplate bounds:', sFaceplate.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Shoulder Connector bounds:', sConn.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Shoulder Connector center:', sConn.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));

// 2. UPPER ARM ANALYSIS
console.log('\n=== 2. UPPER ARM (HUMERUS) MODULE ===');
const uGroup = getBox(arm.upperArm.group);
const uArmor = getBox(arm.upperArm.bicepSubGroup);
const uCollar = getBox(arm.upperArm.upperCollar);
const uCore = getBox(arm.upperArm.armatureCore);
const uCuff = getBox(arm.upperArm.elbowSocketCuff);

console.log('UpperArm Group bounds:', uGroup.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('UpperArm Armor bounds:', uArmor.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('UpperArm Top Collar size:', uCollar.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('UpperArm Bottom Cuff size:', uCuff.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('UpperArm Bottom Cuff center:', uCuff.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));

// 3. ELBOW ANALYSIS
console.log('\n=== 3. ELBOW JOINT MODULE ===');
const eGroup = getBox(arm.elbow.group);
const eUpperConn = getBox(arm.elbow.upperConnector);
const eUpperHousing = getBox(arm.elbow.upperHousing);
const eLatDisc = getBox(arm.elbow.lateralDisc);
const eMedDisc = getBox(arm.elbow.medialDisc);
const ePivot = getBox(arm.elbow.forearmPivot);

console.log('Elbow Group bounds:', eGroup.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Elbow Upper Connector size:', eUpperConn.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Elbow Upper Connector center:', eUpperConn.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Elbow Lateral Disc size:', eLatDisc.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Elbow Lateral Disc center:', eLatDisc.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Elbow Forearm Pivot bounds:', ePivot.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));

// 4. FOREARM ANALYSIS
console.log('\n=== 4. FOREARM (GAUNTLET) MODULE ===');
const fGroup = getBox(arm.forearm.group);
const fArmor = getBox(arm.forearm.armorGroup);
const fSocketCollar = getBox(arm.forearm.elbowSocketCollar);
const fSpine = getBox(arm.forearm.innerSleeve);
const fCuff = getBox(arm.forearm.wristCuff);

console.log('Forearm Group bounds:', fGroup.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Forearm Armor bounds:', fArmor.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Forearm Elbow Socket Collar size:', fSocketCollar.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Forearm Elbow Socket Collar center:', fSocketCollar.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Forearm Wrist Cuff size:', fCuff.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Forearm Wrist Cuff center:', fCuff.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));

// 5. WRIST ANALYSIS
console.log('\n=== 5. WRIST MODULE ===');
const wGroup = getBox(arm.wrist.group);
const wCollar = getBox(arm.wrist.swivelCollar);
const wRing = getBox(arm.wrist.accentRing);
const wCore = getBox(arm.wrist.rotaryCore);
const wDistalClevis = getBox(arm.wrist.distalClevis);

console.log('Wrist Group bounds:', wGroup.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Wrist Swivel Collar size:', wCollar.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Wrist Swivel Collar center:', wCollar.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Wrist Accent Ring size:', wRing.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Wrist Distal Clevis size:', wDistalClevis.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Wrist Distal Clevis center:', wDistalClevis.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));

// 6. HAND & PALM ANALYSIS
console.log('\n=== 6. HAND & PALM MODULE ===');
const hGroup = getBox(arm.hand.group);
const hCuff = getBox(arm.hand.carpalCuff);
const hChassis = getBox(arm.hand.palmChassis);
const hDorsal = getBox(arm.hand.dorsalArmor);
const hThumb = getBox(arm.hand.thumb.group);
const hIndex = getBox(arm.hand.indexFinger.group);
const hMiddle = getBox(arm.hand.middleFinger.group);
const hRing = getBox(arm.hand.ringFinger.group);
const hLittle = getBox(arm.hand.littleFinger.group);

console.log('Hand Total bounds:', hGroup.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Hand Carpal Cuff size:', hCuff.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Hand Carpal Cuff center:', hCuff.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Palm Chassis size:', hChassis.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Palm Chassis center:', hChassis.center.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Dorsal Armor size:', hDorsal.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Thumb bounds:', hThumb.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Index Finger bounds:', hIndex.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Middle Finger bounds:', hMiddle.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Ring Finger bounds:', hRing.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));
console.log('Little Finger bounds:', hLittle.size.toArray().map(v => (v * 1000).toFixed(1) + 'mm'));

// 7. INTERFACE MISMATCH AUDIT
console.log('\n=== 7. INTERFACE SIZING & FIT AUDIT ===');
console.log('A. Shoulder to Upper Arm Interface:');
console.log(`   Shoulder connector diameter: ${(sConn.size.x * 1000).toFixed(1)}mm x ${(sConn.size.z * 1000).toFixed(1)}mm`);
console.log(`   Upper arm top collar diameter: ${(uCollar.size.x * 1000).toFixed(1)}mm x ${(uCollar.size.z * 1000).toFixed(1)}mm`);
console.log(`   Y-offset gap: ${((uCollar.center.y - sConn.center.y) * 1000).toFixed(1)}mm`);

console.log('\nB. Upper Arm to Elbow Interface:');
console.log(`   Upper arm bottom cuff diameter: ${(uCuff.size.x * 1000).toFixed(1)}mm x ${(uCuff.size.z * 1000).toFixed(1)}mm`);
console.log(`   Elbow upper connector size: ${(eUpperConn.size.x * 1000).toFixed(1)}mm x ${(eUpperConn.size.z * 1000).toFixed(1)}mm`);
console.log(`   Elbow hinge width: ${(ELBOW_CONFIG.hingeWidth * 1000).toFixed(1)}mm`);
console.log(`   Elbow total width (including discs): ${(eGroup.size.x * 1000).toFixed(1)}mm`);
console.log(`   Upper arm armor bottom width: ${(uArmor.size.x * 1000).toFixed(1)}mm`);
console.log(`   Y-offset: Cuff center Y=${(uCuff.center.y * 1000).toFixed(1)}mm, Elbow conn center Y=${(eUpperConn.center.y * 1000).toFixed(1)}mm`);

console.log('\nC. Elbow to Forearm Interface:');
console.log(`   Forearm elbow socket collar diameter: ${(fSocketCollar.size.x * 1000).toFixed(1)}mm x ${(fSocketCollar.size.z * 1000).toFixed(1)}mm`);
console.log(`   Forearm gauntlet top width: ${(fArmor.size.x * 1000).toFixed(1)}mm`);
console.log(`   Elbow hinge center Y vs Forearm origin Y`);

console.log('\nD. Forearm to Wrist Interface:');
console.log(`   Forearm wrist cuff diameter: ${(fCuff.size.x * 1000).toFixed(1)}mm x ${(fCuff.size.z * 1000).toFixed(1)}mm`);
console.log(`   Wrist swivel collar diameter: ${(wCollar.size.x * 1000).toFixed(1)}mm x ${(wCollar.size.z * 1000).toFixed(1)}mm`);
console.log(`   Wrist accent ring diameter: ${(wRing.size.x * 1000).toFixed(1)}mm`);
console.log(`   Y-offset: Forearm cuff center Y=${(fCuff.center.y * 1000).toFixed(1)}mm, Wrist collar center Y=${(wCollar.center.y * 1000).toFixed(1)}mm`);

console.log('\nE. Wrist to Hand Interface:');
console.log(`   Wrist distal clevis size: ${(wDistalClevis.size.x * 1000).toFixed(1)}mm x ${(wDistalClevis.size.z * 1000).toFixed(1)}mm`);
console.log(`   Hand carpal cuff size: ${(hCuff.size.x * 1000).toFixed(1)}mm x ${(hCuff.size.z * 1000).toFixed(1)}mm`);
console.log(`   Palm chassis width: ${(hChassis.size.x * 1000).toFixed(1)}mm x depth ${(hChassis.size.z * 1000).toFixed(1)}mm`);
console.log(`   Dorsal armor width: ${(hDorsal.size.x * 1000).toFixed(1)}mm x height ${(hDorsal.size.y * 1000).toFixed(1)}mm`);
console.log(`   Y-offset: Wrist clevis center Y=${(wDistalClevis.center.y * 1000).toFixed(1)}mm, Hand cuff center Y=${(hCuff.center.y * 1000).toFixed(1)}mm`);

console.log('\nF. Overall Limb Proportions:');
console.log(`   Upper Arm Length: ${(uGroup.size.y * 1000).toFixed(1)}mm`);
console.log(`   Forearm Length: ${(fGroup.size.y * 1000).toFixed(1)}mm`);
console.log(`   Hand Length: ${(hGroup.size.y * 1000).toFixed(1)}mm`);
console.log(`   Total Arm Length (Shoulder to Fingertip): ${((sGroup.max.y - hGroup.min.y) * 1000).toFixed(1)}mm`);
