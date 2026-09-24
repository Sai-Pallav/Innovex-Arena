import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';
import { LEG_CONFIG } from '../src/robot/leg/LegConfig';

console.log('=== KNEE BEARING & PATELLA ALIGNMENT VERIFICATION AUDIT ===\n');

const robot = createProceduralRobot();
const leftLeg = robot.leftLegNodes!;
const rightLeg = robot.rightLegNodes!;

const cfg = LEG_CONFIG.knee;

for (const leg of [leftLeg, rightLeg]) {
  console.log(`Checking ${leg.side === -1 ? 'Left' : 'Right'} Knee Alignment:`);
  const kneeGroup = leg.knee.group;
  const patella = leg.knee.patellaShield;
  const patellaLed = leg.knee.patellaLed;

  kneeGroup.updateMatrixWorld(true);

  console.log(`  Patella Position: [${patella.position.x.toFixed(4)}, ${patella.position.y.toFixed(4)}, ${patella.position.z.toFixed(4)}]`);
  console.log(`  Patella Rotation (Pitch rotX): ${patella.rotation.x.toFixed(4)} rad`);

  const patellaBox = new THREE.Box3().setFromObject(patella);
  const patellaCenter = patellaBox.getCenter(new THREE.Vector3());
  console.log(`  Patella World/Group Center: [${patellaCenter.x.toFixed(4)}, ${patellaCenter.y.toFixed(4)}, ${patellaCenter.z.toFixed(4)}]`);

  // Calculate distance of vertices on the back face of patellaShield from bearing axis (0,0) in Y-Z plane
  const posAttr = patella.geometry.attributes.position;
  let minClr = Infinity;
  let maxClr = -Infinity;
  const p = new THREE.Vector3();

  for (let i = 0; i < posAttr.count; i++) {
    p.fromBufferAttribute(posAttr, i);
    p.applyMatrix4(patella.matrix);
    const distYZ = Math.sqrt(p.y * p.y + p.z * p.z);
    const clr = distYZ - cfg.discRadius;
    if (clr < minClr) minClr = clr;
    if (clr > maxClr) maxClr = clr;
  }

  console.log(`  Bearing disc radius: ${(cfg.discRadius * 1000).toFixed(2)} mm`);
  console.log(`  Minimum radial clearance to bearing outer surface: ${(minClr * 1000).toFixed(2)} mm`);
  console.log(`  Maximum radial clearance to bearing outer surface: ${(maxClr * 1000).toFixed(2)} mm`);

  if (minClr > 0) {
    console.log(`  ✓ PERFECT: Positive clearance (${(minClr * 1000).toFixed(2)}mm), zero collision/clipping with bearing!`);
  } else {
    console.error(`  ✗ ERROR: Collision detected (${(minClr * 1000).toFixed(2)}mm)!`);
    process.exit(1);
  }

  // Check X centering relative to bearing outer discs (X = ±0.025)
  const xSpanMin = patellaBox.min.x;
  const xSpanMax = patellaBox.max.x;
  const leftSideClr = 0.020 - Math.abs(xSpanMin);
  const rightSideClr = 0.020 - Math.abs(xSpanMax);

  console.log(`  Patella X span: [${xSpanMin.toFixed(4)}, ${xSpanMax.toFixed(4)}] (width = ${((xSpanMax - xSpanMin) * 1000).toFixed(2)} mm)`);
  console.log(`  Lateral/Medial side clearances: Left = ${(leftSideClr * 1000).toFixed(2)} mm, Right = ${(rightSideClr * 1000).toFixed(2)} mm`);

  if (Math.abs(leftSideClr - rightSideClr) < 0.0001) {
    console.log(`  ✓ PERFECT: Perfectly centered along X axis between lateral and medial bearing discs!`);
  } else {
    console.error(`  ✗ ERROR: Asymmetric X alignment!`);
    process.exit(1);
  }

  console.log('');
}

console.log('================================================================');
console.log('  ALL KNEE BEARING ALIGNMENT AUDIT CHECKS PASSED SUCCESSFULLY!');
console.log('================================================================');
