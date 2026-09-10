import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.scale.setScalar(1.0); // Normal scale
robot.root.position.set(0, 0, 0); // Normal position
robot.root.updateMatrixWorld(true);

const box = new THREE.Box3().setFromObject(robot.root);

console.log('Unscaled Robot box min.y:', box.min.y.toFixed(3), 'max.y:', box.max.y.toFixed(3));

// Parametric sweep: we want the robot to be noticeably bigger (Height > 1.70 in NDC)
// and moved down (Head < 0.78, Foot between -0.96 and -1.02)
const scales = [1.22, 1.26, 1.30, 1.34];
const posYs = [-0.08, -0.10, -0.12, -0.14];
const targetYs = [-0.10, -0.12, -0.14];
const dists = [2.10, 2.20];

const aspect = 1.25; // Standard desktop aspect for robot canvas

console.log('Searching optimal configurations:');
const testConfigs = [
  { name: 'Sweet Spot 1 (scale 1.20, pos -0.06, target -0.17, dist 2.25)', scale: 1.20, posY: -0.06, targetY: -0.17, dist: 2.25 },
  { name: 'Sweet Spot 2 (scale 1.22, pos -0.07, target -0.17, dist 2.25)', scale: 1.22, posY: -0.07, targetY: -0.17, dist: 2.25 },
  { name: 'Sweet Spot 3 (scale 1.24, pos -0.07, target -0.16, dist 2.22)', scale: 1.24, posY: -0.07, targetY: -0.16, dist: 2.22 },
  { name: 'Sweet Spot 4 (scale 1.22, pos -0.06, target -0.16, dist 2.20)', scale: 1.22, posY: -0.06, targetY: -0.16, dist: 2.20 },
];

for (const cfg of testConfigs) {
  robot.root.scale.setScalar(cfg.scale);
  robot.root.position.set(0, cfg.posY, 0);
  robot.root.updateMatrixWorld(true);
  const currentBox = new THREE.Box3().setFromObject(robot.root);

  const cam = new THREE.PerspectiveCamera(45, 1.25, 0.1, 50);
  cam.position.set(0, cfg.targetY, cfg.dist);
  cam.lookAt(new THREE.Vector3(0, cfg.targetY, 0));
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();

  const pHead = new THREE.Vector3(0, currentBox.max.y, 0).project(cam);
  const pFoot = new THREE.Vector3(0, currentBox.min.y, 0).project(cam);

  console.log(
    `${cfg.name} => Head: ${pHead.y.toFixed(2)}, Foot: ${pFoot.y.toFixed(2)}, Height: ${(pHead.y - pFoot.y).toFixed(2)}`
  );
}







