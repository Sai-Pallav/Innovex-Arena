import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';
import { createHand } from '../src/robot/arm/Hand';
import { RobotMaterialPalette, createRobotMaterials } from '../src/robot/materials/RobotMaterials';

const materials = createRobotMaterials();
const hand = createHand(1, materials);

console.log('=== HAND NODE AUDIT ===');
const box = new THREE.Box3().setFromObject(hand.group);
const size = new THREE.Vector3();
box.getSize(size);
console.log(`Hand Size (mm): Width=${(size.x * 1000).toFixed(1)}, Height=${(size.y * 1000).toFixed(1)}, Depth=${(size.z * 1000).toFixed(1)}`);
console.log(`Hand Bounds (mm): X=[${(box.min.x * 1000).toFixed(1)}, ${(box.max.x * 1000).toFixed(1)}], Y=[${(box.min.y * 1000).toFixed(1)}, ${(box.max.y * 1000).toFixed(1)}], Z=[${(box.min.z * 1000).toFixed(1)}, ${(box.max.z * 1000).toFixed(1)}]`);

const palmBox = new THREE.Box3().setFromObject(hand.palmChassis);
const palmSize = new THREE.Vector3();
palmBox.getSize(palmSize);
console.log(`Palm Chassis Size (mm): Width=${(palmSize.x * 1000).toFixed(1)}, Height=${(palmSize.y * 1000).toFixed(1)}, Depth=${(palmSize.z * 1000).toFixed(1)}`);

const cuffBox = new THREE.Box3().setFromObject(hand.carpalCuff);
const cuffSize = new THREE.Vector3();
cuffBox.getSize(cuffSize);
console.log(`Carpal Cuff Size (mm): Width=${(cuffSize.x * 1000).toFixed(1)}, Height=${(cuffSize.y * 1000).toFixed(1)}, Depth=${(cuffSize.z * 1000).toFixed(1)}`);
