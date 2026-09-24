import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.rotation.set(0, 0, 0);
robot.rightArmNodes!.upperArm.group.rotation.set(0.025, 1 * 0.12, 1 * 0.10);
robot.root.updateMatrixWorld(true);

const arm = robot.rightArmNodes!;
const boxUpper = new THREE.Box3().setFromObject(arm.upperArm.armorGroup);
const sizeUpper = new THREE.Vector3();
boxUpper.getSize(sizeUpper);

const boxElbow = new THREE.Box3().setFromObject(arm.elbow.lateralDisc).union(new THREE.Box3().setFromObject(arm.elbow.medialDisc));
const sizeElbow = new THREE.Vector3();
boxElbow.getSize(sizeElbow);

const boxFore = new THREE.Box3().setFromObject(arm.forearm.armorGroup);
const sizeFore = new THREE.Vector3();
boxFore.getSize(sizeFore);

const boxWrist = new THREE.Box3().setFromObject(arm.wrist.distalInterfacePlate);
const sizeWrist = new THREE.Vector3();
boxWrist.getSize(sizeWrist);

console.log('Upper Arm Armor World Width (mm):', (sizeUpper.x * 1000).toFixed(1));
console.log('Elbow Discs World Width (mm):     ', (sizeElbow.x * 1000).toFixed(1));
console.log('Forearm Armor World Width (mm):   ', (sizeFore.x * 1000).toFixed(1));
console.log('Wrist Plate World Width (mm):     ', (sizeWrist.x * 1000).toFixed(1));
