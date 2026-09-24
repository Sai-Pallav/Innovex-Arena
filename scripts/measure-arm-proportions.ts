import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
// Set neutral rotation for pure anatomical measurement
robot.root.rotation.set(0, 0, 0);
robot.root.updateMatrixWorld(true);

function getBox(obj: THREE.Object3D, name: string) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  console.log(`[${name}]`);
  console.log(`  Size (mm): X(w)=${(size.x * 1000).toFixed(1)}, Y(h)=${(size.y * 1000).toFixed(1)}, Z(d)=${(size.z * 1000).toFixed(1)}`);
  console.log(`  Center (mm): X=${(center.x * 1000).toFixed(1)}, Y=${(center.y * 1000).toFixed(1)}, Z=${(center.z * 1000).toFixed(1)}`);
  console.log(`  Bounds (mm): X=[${(box.min.x * 1000).toFixed(1)}, ${(box.max.x * 1000).toFixed(1)}], Y=[${(box.min.y * 1000).toFixed(1)}, ${(box.max.y * 1000).toFixed(1)}], Z=[${(box.min.z * 1000).toFixed(1)}, ${(box.max.z * 1000).toFixed(1)}]`);
  return { box, size, center };
}

console.log('=== TORSO MEASUREMENTS ===');
getBox(robot.torso, 'Torso Root');
if (robot.torsoNodes) {
  getBox(robot.torsoNodes.chestArmor.group, 'Chest Armor Group');
  getBox(robot.torsoNodes.upperTorsoFrame.group, 'Upper Torso Frame');
}

console.log('\n=== RIGHT ARM HIERARCHY & BOUNDS ===');
getBox(robot.rightShoulder, 'Right Shoulder Group');
getBox(robot.rightUpperArm, 'Right Upper Arm Group');
getBox(robot.rightForearm, 'Right Forearm (Elbow forearmPivot)');
getBox(robot.rightHand, 'Right Wrist / Hand Mount');

if (robot.rightArmNodes) {
  console.log('\n--- RIGHT ARM DETAILED NODES ---');
  getBox(robot.rightArmNodes.upperArm.armorGroup, 'Upper Arm Armor Group');
  getBox(robot.rightArmNodes.upperArm.anteriorArmor, 'Upper Arm Anterior Armor');
  getBox(robot.rightArmNodes.upperArm.posteriorArmor, 'Upper Arm Posterior Armor');
  getBox(robot.rightArmNodes.upperArm.mechanicalCore, 'Upper Arm Mechanical Core');
  getBox(robot.rightArmNodes.elbow.group, 'Elbow Group');
  getBox(robot.rightArmNodes.elbow.lateralDisc, 'Elbow Lateral Disc');
  getBox(robot.rightArmNodes.elbow.medialDisc, 'Elbow Medial Disc');
  getBox(robot.rightArmNodes.forearm.armorGroup, 'Forearm Armor Group');
  getBox(robot.rightArmNodes.forearm.anteriorArmor, 'Forearm Anterior Armor');
  getBox(robot.rightArmNodes.forearm.posteriorArmor, 'Forearm Posterior Armor');
  getBox(robot.rightArmNodes.forearm.mechanicalCore, 'Forearm Mechanical Core');
  getBox(robot.rightArmNodes.wrist.group, 'Wrist Group');
  getBox(robot.rightArmNodes.hand.group, 'Right Hand Group');
  getBox(robot.rightArmNodes.hand.palmChassis, 'Right Palm Chassis');
  getBox(robot.rightArmNodes.hand.dorsalArmor, 'Right Dorsal Armor');
  getBox(robot.rightArmNodes.hand.thumb.group, 'Right Thumb');
  getBox(robot.rightArmNodes.hand.middleFinger.group, 'Right Middle Finger');

  const shoulderPivotWorld = new THREE.Vector3();
  robot.rightShoulder.getWorldPosition(shoulderPivotWorld);
  const elbowPivotWorld = new THREE.Vector3();
  robot.rightArmNodes.elbow.forearmPivot.getWorldPosition(elbowPivotWorld);
  const wristPivotWorld = new THREE.Vector3();
  robot.rightArmNodes.wrist.wristPivot.getWorldPosition(wristPivotWorld);

  console.log('\n=== CENTERLINE (WORLD MM) ===');
  console.log(`Shoulder Pivot: X=${(shoulderPivotWorld.x * 1000).toFixed(1)}, Y=${(shoulderPivotWorld.y * 1000).toFixed(1)}, Z=${(shoulderPivotWorld.z * 1000).toFixed(1)}`);
  console.log(`Elbow Pivot:    X=${(elbowPivotWorld.x * 1000).toFixed(1)}, Y=${(elbowPivotWorld.y * 1000).toFixed(1)}, Z=${(elbowPivotWorld.z * 1000).toFixed(1)}`);
  console.log(`Wrist Pivot:    X=${(wristPivotWorld.x * 1000).toFixed(1)}, Y=${(wristPivotWorld.y * 1000).toFixed(1)}, Z=${(wristPivotWorld.z * 1000).toFixed(1)}`);
}

console.log('\n=== LEFT ARM HIERARCHY & BOUNDS ===');
getBox(robot.leftShoulder, 'Left Shoulder Group');
getBox(robot.leftUpperArm, 'Left Upper Arm Group');
getBox(robot.leftForearm, 'Left Forearm (Elbow forearmPivot)');
getBox(robot.leftHand, 'Left Wrist / Hand Mount');
if (robot.leftArmNodes) {
  getBox(robot.leftArmNodes.hand.group, 'Left Hand Group');
  getBox(robot.leftArmNodes.hand.palmChassis, 'Left Palm Chassis');
  getBox(robot.leftArmNodes.hand.dorsalArmor, 'Left Dorsal Armor');
  getBox(robot.leftArmNodes.hand.thumb.group, 'Left Thumb');
  getBox(robot.leftArmNodes.hand.middleFinger.group, 'Left Middle Finger');
}
