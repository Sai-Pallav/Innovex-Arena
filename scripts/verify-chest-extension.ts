import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createChestShoulderExtension } from '../src/robot/shoulder/ChestShoulderExtension';

const mats = createRobotMaterials();
const leftExt = createChestShoulderExtension(-1, mats);
const rightExt = createChestShoulderExtension(1, mats);

console.log('=== CHEST SHOULDER EXTENSION VERIFICATION ===\n');

// 1. Check Mount Pivot Coaxial Alignment
const leftPivot = leftExt.shoulderMountPivot.position;
const rightPivot = rightExt.shoulderMountPivot.position;

console.log(`Left Mount Pivot:   [${leftPivot.x.toFixed(4)}, ${leftPivot.y.toFixed(4)}, ${leftPivot.z.toFixed(4)}]`);
console.log(`Right Mount Pivot:  [${rightPivot.x.toFixed(4)}, ${rightPivot.y.toFixed(4)}, ${rightPivot.z.toFixed(4)}]`);

const yDiff = Math.abs(leftPivot.y - rightPivot.y);
const zDiff = Math.abs(leftPivot.z - rightPivot.z);
const xSymmetry = Math.abs(leftPivot.x + rightPivot.x);

console.log(`\nCoaxial Alignment Checks:`);
console.log(`- Y Level Alignment (diff = 0): ${yDiff === 0 ? '✓ PASS' : '✗ FAIL'} (${yDiff.toFixed(6)} m)`);
console.log(`- Z Depth Alignment (diff = 0): ${zDiff === 0 ? '✓ PASS' : '✗ FAIL'} (${zDiff.toFixed(6)} m)`);
console.log(`- Bilateral X Symmetry (sum = 0): ${xSymmetry === 0 ? '✓ PASS' : '✗ FAIL'} (${xSymmetry.toFixed(6)} m)`);

// 2. Bounding Box & Volume Analysis
function getBounds(name: string, obj: THREE.Object3D) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  console.log(`\n${name} Bounds:`);
  console.log(`  X: [${box.min.x.toFixed(4)}, ${box.max.x.toFixed(4)}] (span: ${(box.max.x - box.min.x).toFixed(4)} m)`);
  console.log(`  Y: [${box.min.y.toFixed(4)}, ${box.max.y.toFixed(4)}] (span: ${(box.max.y - box.min.y).toFixed(4)} m)`);
  console.log(`  Z: [${box.min.z.toFixed(4)}, ${box.max.z.toFixed(4)}] (span: ${(box.max.z - box.min.z).toFixed(4)} m)`);
  return box;
}

const leftBox = getBounds('Left Extension Assembly', leftExt.group);
const rightBox = getBounds('Right Extension Assembly', rightExt.group);

console.log(`\nTotal Torso Width with Shoulder Extensions: ${(rightBox.max.x - leftBox.min.x).toFixed(4)} m (~${((rightBox.max.x - leftBox.min.x) * 1000).toFixed(1)} mm)`);

// 3. LED Meshes Count
console.log(`\nLED Systems Audit:`);
console.log(`- Left Extension LEDs: ${leftExt.ledMeshes.length} meshes (Accent Ring + Underside LED Bar)`);
console.log(`- Right Extension LEDs: ${rightExt.ledMeshes.length} meshes (Accent Ring + Underside LED Bar)`);

// 4. Geometry Vertex Normal & NaN Check
let nanFound = false;
let totalVertices = 0;
[leftExt.group, rightExt.group].forEach((grp) => {
  grp.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const geo = (child as THREE.Mesh).geometry;
      if (geo && geo.attributes.position) {
        const pos = geo.attributes.position;
        totalVertices += pos.count;
        for (let i = 0; i < pos.count; i++) {
          if (isNaN(pos.getX(i)) || isNaN(pos.getY(i)) || isNaN(pos.getZ(i))) {
            nanFound = true;
          }
        }
      }
    }
  });
});

console.log(`\nGeometry Health Audit:`);
console.log(`- NaN vertices detected: ${nanFound ? '✗ FAIL (NaN found)' : '✓ PASS (None)'}`);
console.log(`- Total Vertices in Extension Systems: ${totalVertices}`);

console.log('\n=== END OF AUDIT ===');
