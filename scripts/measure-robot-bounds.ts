import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.updateMatrixWorld(true);

const box = new THREE.Box3().setFromObject(robot.root);
const size = new THREE.Vector3();
box.getSize(size);
const center = new THREE.Vector3();
box.getCenter(center);

console.log('Robot Bounding Box:');
console.log(`  Min: [${box.min.x.toFixed(3)}, ${box.min.y.toFixed(3)}, ${box.min.z.toFixed(3)}]`);
console.log(`  Max: [${box.max.x.toFixed(3)}, ${box.max.y.toFixed(3)}, ${box.max.z.toFixed(3)}]`);
console.log(`  Size: [Width: ${size.x.toFixed(3)}, Height: ${size.y.toFixed(3)}, Depth: ${size.z.toFixed(3)}]`);
console.log(`  Center: [${center.x.toFixed(3)}, ${center.y.toFixed(3)}, ${center.z.toFixed(3)}]`);
