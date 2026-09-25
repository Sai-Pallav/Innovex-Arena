import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.rotation.set(0, 0, 0);
robot.root.position.set(0, 0, 0);
robot.root.updateMatrixWorld(true);

const torso = robot.torsoNodes!;
const rMount = torso.shoulderMountRight;
const rArm = robot.rightArmNodes!;

console.log('====================================================');
console.log('EXACT HIERARCHY TREE FOR RIGHT SHOULDER & ARM ROOT');
console.log('====================================================');

function printTree(node: THREE.Object3D, indent: string = '') {
  const wp = new THREE.Vector3();
  node.getWorldPosition(wp);
  const wr = new THREE.Euler().setFromRotationMatrix(node.matrixWorld);
  const lp = node.position;
  const lr = node.rotation;
  const meshInfo = (node as THREE.Mesh).isMesh ? ` [MESH geo=${(node as THREE.Mesh).geometry.type}]` : ' [GROUP]';
  console.log(`${indent}├─ "${node.name || 'unnamed'}"${meshInfo}`);
  console.log(`${indent}│   LocalPos: [${lp.x.toFixed(4)}, ${lp.y.toFixed(4)}, ${lp.z.toFixed(4)}] LocalRot: [${lr.x.toFixed(3)}, ${lr.y.toFixed(3)}, ${lr.z.toFixed(3)}]`);
  console.log(`${indent}│   WorldPos: [${wp.x.toFixed(4)}, ${wp.y.toFixed(4)}, ${wp.z.toFixed(4)}] WorldRot: [${wr.x.toFixed(3)}, ${wr.y.toFixed(3)}, ${wr.z.toFixed(3)}]`);
  
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    // don't descend deeply into distal arm (beyond upper arm)
    if (child.name?.includes('Elbow') || child.name?.includes('Forearm')) {
      console.log(`${indent}│  ├─ "${child.name}" [SKIPPED SUBTREE]`);
      continue;
    }
    printTree(child, indent + '│  ');
  }
}

console.log('\n--- RIGHT SHOULDER MOUNT GROUP ---');
printTree(rMount.group);

console.log('\n--- RIGHT ARM ROOT ---');
printTree(rArm.root);
