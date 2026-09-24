import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createChestShoulderExtension } from '../src/robot/shoulder/ChestShoulderExtension';

const materials = createRobotMaterials();
const ext = createChestShoulderExtension(-1, materials);
ext.group.updateMatrixWorld(true);

const upperLink = ext.multiAxisJoint?.upperLink;
if (upperLink) {
  const wp = new THREE.Vector3();
  upperLink.getWorldPosition(wp);
  console.log('upperLink worldPos:', wp);
  console.log('upperLink localPos:', upperLink.position);
  console.log('upperLink rotation:', upperLink.rotation);
  console.log('upperLink scale:', upperLink.scale);
  console.log('upperLink visible:', upperLink.visible);
  
  upperLink.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      const mwp = new THREE.Vector3();
      m.getWorldPosition(mwp);
      console.log('  Child Mesh:', m.name || 'unnamed', 'wp:', mwp, 'visible:', m.visible);
      m.geometry.computeBoundingBox();
      console.log('    bbox:', m.geometry.boundingBox);
    }
  });
} else {
  console.log('upperLink not found');
}
