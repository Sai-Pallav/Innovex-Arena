import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.rotation.set(0, 0, 0);
robot.root.position.set(0, 0, 0);
robot.root.updateMatrixWorld(true);

const torso = robot.torsoNodes!;
const rMount = torso.shoulderMountRight;

function dumpDetailed(node: THREE.Object3D, depth: number = 0) {
  const wp = new THREE.Vector3();
  node.getWorldPosition(wp);
  const wr = new THREE.Euler().setFromRotationMatrix(node.matrixWorld);
  const mesh = (node as THREE.Mesh).isMesh ? ` [MESH geo=${(node as THREE.Mesh).geometry?.type}]` : ' [GROUP]';
  const prefix = '  '.repeat(depth);
  console.log(`${prefix}- "${node.name || 'unnamed'}"${mesh} LP:[${node.position.x.toFixed(4)}, ${node.position.y.toFixed(4)}, ${node.position.z.toFixed(4)}] LR:[${node.rotation.x.toFixed(3)}, ${node.rotation.y.toFixed(3)}, ${node.rotation.z.toFixed(3)}] WP:[${wp.x.toFixed(3)}, ${wp.y.toFixed(3)}, ${wp.z.toFixed(3)}]`);
  
  for (const c of node.children) {
    if (c.name?.includes('ArmRoot') || c.name?.includes('ArmAssembly')) {
      console.log(`${prefix}  -> [Attached Arm Root: ${c.name}]`);
      continue;
    }
    dumpDetailed(c, depth + 1);
  }
}

console.log('--- RIGHT SHOULDER MOUNT DETAILED DUMP ---');
dumpDetailed(rMount.group);
