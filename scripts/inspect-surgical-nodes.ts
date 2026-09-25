import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';

const robot = createProceduralRobot();
robot.root.rotation.set(0, 0, 0);
robot.root.position.set(0, 0, 0);
robot.root.updateMatrixWorld(true);

function inspectObject(obj: THREE.Object3D | null | undefined, label: string) {
  if (!obj) {
    console.log(`[${label}] NOT FOUND`);
    return;
  }
  const wp = new THREE.Vector3();
  obj.getWorldPosition(wp);
  const wr = new THREE.Euler().setFromRotationMatrix(obj.matrixWorld);
  console.log(`=== ${label} ===`);
  console.log(`  Name: "${obj.name}"`);
  console.log(`  Type: ${obj.type}`);
  console.log(`  Parent: "${obj.parent?.name || 'none'}"`);
  console.log(`  Local Pos: [${obj.position.x.toFixed(4)}, ${obj.position.y.toFixed(4)}, ${obj.position.z.toFixed(4)}]`);
  console.log(`  Local Rot: [${obj.rotation.x.toFixed(4)}, ${obj.rotation.y.toFixed(4)}, ${obj.rotation.z.toFixed(4)}]`);
  console.log(`  Local Scl: [${obj.scale.x.toFixed(4)}, ${obj.scale.y.toFixed(4)}, ${obj.scale.z.toFixed(4)}]`);
  console.log(`  World Pos: [${wp.x.toFixed(4)}, ${wp.y.toFixed(4)}, ${wp.z.toFixed(4)}]`);
  console.log(`  World Rot: [${wr.x.toFixed(4)}, ${wr.y.toFixed(4)}, ${wr.z.toFixed(4)}]`);
  
  if ((obj as THREE.Mesh).isMesh) {
    const mesh = obj as THREE.Mesh;
    const geo = mesh.geometry;
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    if (bb) {
      console.log(`  Geo Bounds: min=[${bb.min.x.toFixed(4)}, ${bb.min.y.toFixed(4)}, ${bb.min.z.toFixed(4)}], max=[${bb.max.x.toFixed(4)}, ${bb.max.y.toFixed(4)}, ${bb.max.z.toFixed(4)}]`);
    }
    const mat = Array.isArray(mesh.material) ? mesh.material.map(m => m.name || m.type) : (mesh.material?.name || mesh.material?.type);
    console.log(`  Material: ${JSON.stringify(mat)}`);
  }
  console.log(`  Children count: ${obj.children.length}`);
  if (obj.children.length > 0 && obj.children.length <= 10) {
    console.log(`  Children names: ${obj.children.map(c => `"${c.name || c.type}"`).join(', ')}`);
  }
}

const torso = robot.torsoNodes!;
const chestArmor = torso.chestArmor;
const upperTorsoFrame = torso.upperTorsoFrame;
const lMount = torso.shoulderMountLeft;
const rMount = torso.shoulderMountRight;
const stomach = torso.stomach;

console.log('----------------------------------------------------');
console.log('SURGICAL INSPECTION OF EXISTING HIERARCHY NODES');
console.log('----------------------------------------------------');

// A. White shoulder armor
inspectObject(lMount.extensionNodes?.upperShoulderShell, 'A1. Left Upper Shoulder Shell (Group)');
inspectObject(robot.root.getObjectByName('LeftUpperShoulderHood'), 'A2. Left Upper Shoulder Hood (Mesh)');
inspectObject(rMount.extensionNodes?.upperShoulderShell, 'B1. Right Upper Shoulder Shell (Group)');
inspectObject(robot.root.getObjectByName('RightUpperShoulderHood'), 'B2. Right Upper Shoulder Hood (Mesh)');
inspectObject(robot.root.getObjectByName('LeftChestTransitionPanel'), 'A3. Left Chest Transition Panel (Mesh)');
inspectObject(robot.root.getObjectByName('RightChestTransitionPanel'), 'B3. Right Chest Transition Panel (Mesh)');

// C & D. Shoulder joints
inspectObject(robot.root.getObjectByName('MultiAxisShoulderJoint_L') || lMount.extensionNodes?.multiAxisJoint?.shoulderJoint, 'C. Left Shoulder Joint');
inspectObject(robot.root.getObjectByName('MultiAxisShoulderJoint_R') || rMount.extensionNodes?.multiAxisJoint?.shoulderJoint, 'D. Right Shoulder Joint');

// E. Lower chest armor
inspectObject(chestArmor.group, 'E1. Chest Armor Group');
inspectObject(chestArmor.centerPanel, 'E2. Chest Central Panel');
inspectObject(chestArmor.leftPanel, 'E3. Chest Left Panel');
inspectObject(chestArmor.rightPanel, 'E4. Chest Right Panel');
inspectObject(chestArmor.flankArmorLeft, 'E5. Chest Flank Armor Left');
inspectObject(chestArmor.flankArmorRight, 'E6. Chest Flank Armor Right');
inspectObject(upperTorsoFrame.lowerFrame, 'E7. UpperTorsoFrame Lower Frame Group');

// F. Rib / abdominal mechanism immediately below lower chest
inspectObject(stomach.group, 'F1. Stomach / Abdomen Group');
inspectObject(stomach.rings[0]?.group, 'F2. Stomach Ring 01 (Top Rib)');
