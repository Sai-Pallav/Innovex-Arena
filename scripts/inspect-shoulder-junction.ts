import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.rotation.set(0, 0, 0);
robot.root.position.set(0, 0, 0);
robot.root.updateMatrixWorld(true);

const extLeft = robot.torsoNodes.shoulderMountLeft.extensionNodes!;
const armLeft = robot.leftArmNodes!;

console.log('=== LEFT SHOULDER EXTENSION MESHES ===');
extLeft.group.traverse(o => {
  if ((o as THREE.Mesh).isMesh) {
    const b = new THREE.Box3().setFromObject(o);
    const pos = new THREE.Vector3();
    o.getWorldPosition(pos);
    console.log(`[${o.name || o.type}] WPos: [${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}] BoxX: [${b.min.x.toFixed(3)}..${b.max.x.toFixed(3)}] BoxY: [${b.min.y.toFixed(3)}..${b.max.y.toFixed(3)}] BoxZ: [${b.min.z.toFixed(3)}..${b.max.z.toFixed(3)}]`);
  }
});

console.log('\n=== LEFT UPPER ARM ROOT & ADAPTER MESHES ===');
armLeft.root.traverse(o => {
  if ((o as THREE.Mesh).isMesh) {
    const b = new THREE.Box3().setFromObject(o);
    const pos = new THREE.Vector3();
    o.getWorldPosition(pos);
    // Only print objects with Y > -0.05 (near shoulder)
    if (b.max.y > 0.05) {
      console.log(`[${o.name || o.type}] WPos: [${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}] BoxX: [${b.min.x.toFixed(3)}..${b.max.x.toFixed(3)}] BoxY: [${b.min.y.toFixed(3)}..${b.max.y.toFixed(3)}] BoxZ: [${b.min.z.toFixed(3)}..${b.max.z.toFixed(3)}]`);
    }
  }
});
