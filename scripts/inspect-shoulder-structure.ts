import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.rotation.set(0, 0, 0);
robot.root.position.set(0, 0, 0);
robot.root.updateMatrixWorld(true);

const torso = robot.torsoNodes!;
const rMount = torso.shoulderMountRight;
const rArm = robot.rightArmNodes!;

console.log('=== SHOULDER COMPONENT MAPPING AUDIT ===');

function dumpStructure(node: THREE.Object3D, depth: number = 0) {
  const wp = new THREE.Vector3();
  node.getWorldPosition(wp);
  const mesh = (node as THREE.Mesh).isMesh ? ` [MESH geo=${(node as THREE.Mesh).geometry?.type}]` : ' [GROUP]';
  const prefix = '  '.repeat(depth);
  console.log(`${prefix}- ${node.name || 'unnamed'}${mesh} (children: ${node.children.length}) WP: [${wp.x.toFixed(3)}, ${wp.y.toFixed(3)}, ${wp.z.toFixed(3)}]`);
  
  // if children are many unnamed bolts, summarize
  const namedChildren = node.children.filter(c => c.name && c.name !== 'unnamed');
  const unnamedChildren = node.children.filter(c => !c.name || c.name === 'unnamed');
  
  for (const c of namedChildren) {
    dumpStructure(c, depth + 1);
  }
  if (unnamedChildren.length > 0) {
    console.log(`${prefix}  [+ ${unnamedChildren.length} unnamed decorative/hardware children]`);
  }
}

console.log('\n--- Right Shoulder Mount Structure ---');
dumpStructure(rMount.group);

console.log('\n--- Right Arm Root Structure ---');
dumpStructure(rArm.root);

console.log('\n--- Chest & Clavicle Area Structure ---');
dumpStructure(torso.chestArmor.group);
