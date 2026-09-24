import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.rotation.set(0, 0, 0);
robot.root.position.set(0, 0, 0);
robot.root.updateMatrixWorld(true);

const rightArm = robot.rightArmNodes!;
const shoulderExt = robot.torsoNodes!.shoulderMountRight.extensionNodes!;

function inspectObj(obj: THREE.Object3D, name: string) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const worldPos = new THREE.Vector3();
  obj.getWorldPosition(worldPos);
  const worldQuat = new THREE.Quaternion();
  obj.getWorldQuaternion(worldQuat);
  const worldEuler = new THREE.Euler().setFromQuaternion(worldQuat, 'XYZ');

  console.log(`\n--- [${name}] ---`);
  console.log(`  Local Pos:   [${obj.position.x.toFixed(4)}, ${obj.position.y.toFixed(4)}, ${obj.position.z.toFixed(4)}]`);
  console.log(`  Local Rot:   [${obj.rotation.x.toFixed(4)}, ${obj.rotation.y.toFixed(4)}, ${obj.rotation.z.toFixed(4)}]`);
  console.log(`  World Pos:   X=${(worldPos.x * 1000).toFixed(1)}, Y=${(worldPos.y * 1000).toFixed(1)}, Z=${(worldPos.z * 1000).toFixed(1)} mm`);
  console.log(`  World Rot°:  X=${THREE.MathUtils.radToDeg(worldEuler.x).toFixed(1)}°, Y=${THREE.MathUtils.radToDeg(worldEuler.y).toFixed(1)}°, Z=${THREE.MathUtils.radToDeg(worldEuler.z).toFixed(1)}°`);
  console.log(`  BBox Center: X=${(center.x * 1000).toFixed(1)}, Y=${(center.y * 1000).toFixed(1)}, Z=${(center.z * 1000).toFixed(1)} mm`);
  console.log(`  BBox Size:   W(x)=${(size.x * 1000).toFixed(1)}, H(y)=${(size.y * 1000).toFixed(1)}, D(z)=${(size.z * 1000).toFixed(1)} mm`);
}

console.log('====================================================');
console.log('1. SHOULDER MODULE COMPONENTS');
console.log('====================================================');
inspectObj(shoulderExt.group, 'Shoulder Module Group');
inspectObj(shoulderExt.upperShoulderShell, 'Upper Shoulder Shell (Pauldron Cowl)');
inspectObj(shoulderExt.outerShoulderShell, 'Outer Shoulder Shell (Panels B, C, E)');
inspectObj(shoulderExt.recessHousing, 'Shoulder Mounting Bulkhead');
if (shoulderExt.multiAxisJoint) {
  inspectObj(shoulderExt.multiAxisJoint.foundation, 'Shoulder Joint Foundation');
  inspectObj(shoulderExt.multiAxisJoint.shoulderJoint, 'Shoulder Active Joint');
  inspectObj(shoulderExt.multiAxisJoint.bearingHousing, 'Shoulder Circular Bearing Housing');
  inspectObj(shoulderExt.multiAxisJoint.accentRing, 'Shoulder Purple Energy Ring');
  inspectObj(shoulderExt.multiAxisJoint.armMount, 'Shoulder armMount');
}

console.log('====================================================');
console.log('2. UPPER ARM MODULE COMPONENTS');
console.log('====================================================');
inspectObj(rightArm.root, 'Right Arm Root');
inspectObj(rightArm.upperArm.group, 'Upper Arm Assembly Group');
inspectObj(rightArm.upperArm.adapterGroup, 'Upper Arm Shoulder Adapter');
inspectObj(rightArm.upperArm.mechanicalCore, 'Upper Arm Mechanical Core');
inspectObj(rightArm.upperArm.armatureSpar, 'Upper Arm Titanium I-Beam Spar');
inspectObj(rightArm.upperArm.armorGroup, 'Upper Arm Armor Group');
inspectObj(rightArm.upperArm.anteriorArmor, 'Upper Arm Anterior Armor');
inspectObj(rightArm.upperArm.posteriorArmor, 'Upper Arm Posterior Armor');
inspectObj(rightArm.upperArm.ledStrip, 'Upper Arm Purple LED Strip');
inspectObj(rightArm.upperArm.distalElbowMount, 'Upper Arm Distal Elbow Mount');

console.log('====================================================');
console.log('3. ELBOW MODULE COMPONENTS');
console.log('====================================================');
inspectObj(rightArm.elbow.group, 'Elbow Group');
inspectObj(rightArm.elbow.upperHousing, 'Elbow Upper Housing (Clevis)');
inspectObj(rightArm.elbow.hingeCore, 'Elbow Hinge Core (Barrel)');
inspectObj(rightArm.elbow.lateralDisc, 'Elbow Lateral Disc');
inspectObj(rightArm.elbow.medialDisc, 'Elbow Medial Disc');
inspectObj(rightArm.elbow.forearmPivot, 'Elbow forearmPivot');
const olec = rightArm.elbow.lowerHousing.getObjectByName('ElbowOlecranonArmor');
if (olec) inspectObj(olec, 'Elbow Olecranon Armor Shield');

console.log('====================================================');
console.log('4. FOREARM MODULE COMPONENTS');
console.log('====================================================');
inspectObj(rightArm.forearm.group, 'Forearm Group');
inspectObj(rightArm.forearm.mechanicalCore, 'Forearm Mechanical Core');
inspectObj(rightArm.forearm.armatureSpine, 'Forearm Titanium Spine');
inspectObj(rightArm.forearm.armorGroup, 'Forearm Armor Group');
inspectObj(rightArm.forearm.anteriorArmor, 'Forearm Anterior Armor');
inspectObj(rightArm.forearm.posteriorArmor, 'Forearm Posterior Armor');
inspectObj(rightArm.forearm.ledStrip, 'Forearm Purple LED Strip');
inspectObj(rightArm.forearm.distalWristMount, 'Forearm Distal Wrist Mount');

console.log('====================================================');
console.log('5. WRIST MODULE COMPONENTS');
console.log('====================================================');
inspectObj(rightArm.wrist.group, 'Wrist Group');
inspectObj(rightArm.wrist.wristPivot, 'Wrist Pivot');
inspectObj(rightArm.wrist.distalInterfacePlate, 'Wrist 8-Bolt Interface Plate');
inspectObj(rightArm.wrist.accentRing, 'Wrist Purple Emissive Ring');
inspectObj(rightArm.wrist.distalHandMount, 'Wrist Distal Hand Mount');
