import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createMultiAxisShoulderJoint } from '../src/robot/shoulder/MultiAxisShoulderJoint';
import { createChestShoulderExtension } from '../src/robot/shoulder/ChestShoulderExtension';

const materials = createRobotMaterials();
const ledMeshes: THREE.Mesh[] = [];

const rightJoint = createMultiAxisShoulderJoint(1, materials, ledMeshes);
const rightExtension = createChestShoulderExtension(1, materials, ledMeshes);

console.log('--- Right Shoulder Joint Objects ---');
rightJoint.foundation.traverse((obj) => {
  if (obj instanceof THREE.Mesh) {
    obj.geometry.computeBoundingBox();
    const bb = obj.geometry.boundingBox;
    console.log(`Mesh: ${obj.name || 'unnamed'}, pos: [${obj.position.toArray().map(n => n.toFixed(4))}], boundsX: [${bb?.min.x.toFixed(4)}, ${bb?.max.x.toFixed(4)}], boundsY: [${bb?.min.y.toFixed(4)}, ${bb?.max.y.toFixed(4)}]`);
  }
});

console.log('--- Right Chest Shoulder Extension (Pauldron) ---');
rightExtension.group.traverse((obj) => {
  if (obj instanceof THREE.Mesh && obj.name.includes('Shoulder')) {
    obj.geometry.computeBoundingBox();
    const bb = obj.geometry.boundingBox;
    console.log(`Mesh: ${obj.name || 'unnamed'}, pos: [${obj.position.toArray().map(n => n.toFixed(4))}], boundsX: [${bb?.min.x.toFixed(4)}, ${bb?.max.x.toFixed(4)}], boundsY: [${bb?.min.y.toFixed(4)}, ${bb?.max.y.toFixed(4)}]`);
  }
});
