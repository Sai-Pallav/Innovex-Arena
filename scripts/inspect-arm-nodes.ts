import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.rotation.set(0, 0, 0);
robot.root.updateMatrixWorld(true);

const rightArm = robot.rightArmNodes!;

console.log('=== LOCAL TRANSFORMS OF RIGHT ARM CHAIN ===');
console.log('armRoot:', rightArm.root.position.toArray(), rightArm.root.rotation.toArray());
console.log('upperArm.group:', rightArm.upperArm.group.position.toArray(), rightArm.upperArm.group.rotation.toArray());
console.log('distalElbowMount:', rightArm.upperArm.distalElbowMount.position.toArray(), rightArm.upperArm.distalElbowMount.rotation.toArray());
console.log('elbow.group:', rightArm.elbow.group.position.toArray(), rightArm.elbow.group.rotation.toArray());
console.log('elbow.forearmPivot:', rightArm.elbow.forearmPivot.position.toArray(), rightArm.elbow.forearmPivot.rotation.toArray());
console.log('forearm.group:', rightArm.forearm.group.position.toArray(), rightArm.forearm.group.rotation.toArray());
console.log('distalWristMount:', rightArm.forearm.distalWristMount.position.toArray(), rightArm.forearm.distalWristMount.rotation.toArray());
console.log('wrist.group:', rightArm.wrist.group.position.toArray(), rightArm.wrist.group.rotation.toArray());

// Also inspect where the armRoot is attached in torso
const rightMount = robot.torsoNodes!.shoulderMountRight.extensionNodes?.armMount || robot.torsoNodes!.shoulderMountRight.group;
const mountWorld = new THREE.Vector3();
rightMount.getWorldPosition(mountWorld);
console.log('Shoulder armMount World pos (mm):', mountWorld.toArray().map(v => (v * 1000).toFixed(1)));

// Check shoulder foundation pos
const foundWorld = new THREE.Vector3();
robot.torsoNodes!.shoulderMountRight.group.getWorldPosition(foundWorld);
console.log('Shoulder Group World pos (mm):', foundWorld.toArray().map(v => (v * 1000).toFixed(1)));
