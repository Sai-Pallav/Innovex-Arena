import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createChestAssembly } from '../src/robot/torso/ChestAssembly';

const mats = createRobotMaterials();
const chest = createChestAssembly(mats);

console.log('--- CHEST NODES AUDIT ---');
function printBounds(name: string, obj: THREE.Object3D) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  console.log(`${name}:`);
  console.log(`  min: [${box.min.x.toFixed(4)}, ${box.min.y.toFixed(4)}, ${box.min.z.toFixed(4)}]`);
  console.log(`  max: [${box.max.x.toFixed(4)}, ${box.max.y.toFixed(4)}, ${box.max.z.toFixed(4)}]`);
  console.log(`  size: [${(box.max.x - box.min.x).toFixed(4)}, ${(box.max.y - box.min.y).toFixed(4)}, ${(box.max.z - box.min.z).toFixed(4)}]`);
}

printBounds('ChestArmor.centerPanel', chest.chestArmor.centerPanel);
printBounds('ChestArmor.leftPanel', chest.chestArmor.leftPanel);
printBounds('ChestArmor.rightPanel', chest.chestArmor.rightPanel);
if (chest.chestArmor.leftLightStrip) printBounds('ChestArmor.leftLightStrip', chest.chestArmor.leftLightStrip);
if (chest.chestArmor.flankArmorLeft) printBounds('ChestArmor.flankArmorLeft', chest.chestArmor.flankArmorLeft);
printBounds('UpperTorsoFrame', chest.upperTorsoFrame.group);
printBounds('ShoulderMountLeft', chest.shoulderMountLeft.group);
printBounds('ShoulderMountRight', chest.shoulderMountRight.group);
