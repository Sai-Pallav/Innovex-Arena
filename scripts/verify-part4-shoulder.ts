import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createChestShoulderExtension } from '../src/robot/shoulder/ChestShoulderExtension';

const materials = createRobotMaterials();

const leftExtension = createChestShoulderExtension(-1, materials);
const rightExtension = createChestShoulderExtension(1, materials);

console.log('=== PART 4 MULTI-AXIS SHOULDER JOINT AUDIT ===');

function auditSide(sideName: string, ext: ReturnType<typeof createChestShoulderExtension>) {
  console.log(`\n--- ${sideName} Shoulder Extension ---`);
  console.log(`Joint Group: ${ext.shoulderMountPivot?.name} at position:`, ext.shoulderMountPivot?.position);
  console.log(`Primary Axis Pivot: ${ext.primaryAxisPivot?.name}`);
  console.log(`Secondary Axis Carrier: ${ext.secondaryAxisCarrier?.name}`);
  console.log(`Secondary Axis Pivot: ${ext.secondaryAxisPivot?.name}`);
  console.log(`Arm Mount: ${ext.armMount?.name} at position:`, ext.armMount?.position);
  console.log(`Arm Mounting Flange: ${ext.armMountingFlange?.name}`);

  let totalTriangles = 0;
  let totalMeshes = 0;
  ext.group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      totalMeshes++;
      const m = obj as THREE.Mesh;
      if (m.geometry) {
        const count = m.geometry.index ? m.geometry.index.count / 3 : m.geometry.attributes.position.count / 3;
        totalTriangles += count;
      }
    }
  });

  console.log(`Total Meshes: ${totalMeshes}, Total Triangles: ${Math.round(totalTriangles)}`);
}

auditSide('Left', leftExtension);
auditSide('Right', rightExtension);

// Verify Bilateral Symmetry
const leftPos = leftExtension.shoulderMountPivot.position;
const rightPos = rightExtension.shoulderMountPivot.position;

console.log('\n--- Symmetry Verification ---');
console.log(`X: Left = ${leftPos.x.toFixed(4)}, Right = ${rightPos.x.toFixed(4)}, Sum = ${(leftPos.x + rightPos.x).toFixed(6)}`);
console.log(`Y: Left = ${leftPos.y.toFixed(4)}, Right = ${rightPos.y.toFixed(4)}, Diff = ${Math.abs(leftPos.y - rightPos.y).toFixed(6)}`);
console.log(`Z: Left = ${leftPos.z.toFixed(4)}, Right = ${rightPos.z.toFixed(4)}, Diff = ${Math.abs(leftPos.z - rightPos.z).toFixed(6)}`);

if (Math.abs(leftPos.x + rightPos.x) < 1e-5 && Math.abs(leftPos.y - rightPos.y) < 1e-5 && Math.abs(leftPos.z - rightPos.z) < 1e-5) {
  console.log('>>> BILATERAL SYMMETRY CONFIRMED: PERFECT COAXIAL ALIGNMENT <<<');
} else {
  console.error('>>> SYMMETRY MISMATCH! <<<');
  process.exit(1);
}
