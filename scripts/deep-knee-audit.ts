/**
 * DEEP SPATIAL AUDIT — Knee bearing + white patella component alignment.
 * Measures:
 *  A) Bearing center in leg-root world space
 *  B) Patella bounding-box center in leg-root world space
 *  C) Radial clearance of every patella back-face vertex from the bearing cylinder axis
 *  D) Gaps to thigh armor bottom and shin armor top (world Y)
 *  E) Whether the patella face-normal points the same direction as the leg forward (+Z)
 */
import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';
import { LEG_CONFIG } from '../src/robot/leg/LegConfig';

const robot = createProceduralRobot();
robot.root.updateMatrixWorld(true);

const ll = robot.leftLegNodes!;
const rl = robot.rightLegNodes!;

const cfg  = LEG_CONFIG.knee;
const R    = cfg.discRadius;          // 0.022 m

function auditSide(label: string, leg: typeof ll) {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║  ${label} KNEE AUDIT`);
  console.log(`╚══════════════════════════════════════════╝`);

  const kneeGrp   = leg.knee.group;
  const patella   = leg.knee.patellaShield;
  const patellaLed = leg.knee.patellaLed;

  // ── A. Bearing centre in world space ────────────────────────────────────────
  const bearingWorldPos = new THREE.Vector3();
  kneeGrp.getWorldPosition(bearingWorldPos);
  console.log(`Bearing world centre : [${bearingWorldPos.x.toFixed(4)}, ${bearingWorldPos.y.toFixed(4)}, ${bearingWorldPos.z.toFixed(4)}]`);

  // ── B. Patella bounding-box centre in world space ───────────────────────────
  const pBox = new THREE.Box3().setFromObject(patella);
  const pCen = pBox.getCenter(new THREE.Vector3());
  console.log(`Patella world centre : [${pCen.x.toFixed(4)}, ${pCen.y.toFixed(4)}, ${pCen.z.toFixed(4)}]`);

  const worldOffset = pCen.clone().sub(bearingWorldPos);
  console.log(`Offset (patella − bearing) : dx=${(worldOffset.x*1000).toFixed(2)}mm  dy=${(worldOffset.y*1000).toFixed(2)}mm  dz=${(worldOffset.z*1000).toFixed(2)}mm`);

  // ── C. Patella local position / rotation ───────────────────────────────────
  console.log(`Patella local pos    : [${patella.position.x.toFixed(5)}, ${patella.position.y.toFixed(5)}, ${patella.position.z.toFixed(5)}]`);
  const rx = patella.rotation.x * 180/Math.PI;
  const ry = patella.rotation.y * 180/Math.PI;
  const rz = patella.rotation.z * 180/Math.PI;
  console.log(`Patella local rot    : rx=${rx.toFixed(2)}°  ry=${ry.toFixed(2)}°  rz=${rz.toFixed(2)}°`);

  // ── D. Radial clearance from bearing cylinder axis (world X axis through bearing centre) ──
  // In kneeGroup local space the bearing axis = X axis through (0,0,0).
  // So in kneeGroup local space, radial distance in YZ plane from origin.
  const geo = patella.geometry;
  const pos = geo.attributes.position;
  const mat = patella.matrix;           // local-to-kneeGroup

  let minClr = Infinity, maxClr = -Infinity;
  // Slice clearances: top (y>0.015), mid (|y|<0.005), bottom (y< -0.015)
  const buckets = [[0,0],[0,0],[0,0]];  // [sum, count]
  const p = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).applyMatrix4(mat);
    const ryz = Math.sqrt(p.y*p.y + p.z*p.z);
    const clr = ryz - R;
    if (clr < minClr) minClr = clr;
    if (clr > maxClr) maxClr = clr;
    if (p.y >  0.015) { buckets[0][0] += clr; buckets[0][1]++; }
    if (Math.abs(p.y) < 0.005) { buckets[1][0] += clr; buckets[1][1]++; }
    if (p.y < -0.015) { buckets[2][0] += clr; buckets[2][1]++; }
  }

  const avgTop = buckets[0][1] ? buckets[0][0]/buckets[0][1] : 0;
  const avgMid = buckets[1][1] ? buckets[1][0]/buckets[1][1] : 0;
  const avgBot = buckets[2][1] ? buckets[2][0]/buckets[2][1] : 0;

  console.log(`Radial clearance min : ${(minClr*1000).toFixed(2)} mm`);
  console.log(`Radial clearance max : ${(maxClr*1000).toFixed(2)} mm`);
  console.log(`Avg clearance TOP    : ${(avgTop*1000).toFixed(2)} mm`);
  console.log(`Avg clearance MID    : ${(avgMid*1000).toFixed(2)} mm`);
  console.log(`Avg clearance BOT    : ${(avgBot*1000).toFixed(2)} mm`);
  console.log(`Clearance imbalance  : ${(Math.max(Math.abs(avgTop-avgMid), Math.abs(avgBot-avgMid))*1000).toFixed(2)} mm`);

  // ── E. X-axis centering (lateral / medial symmetry) ─────────────────────────
  const pBoxKnee = new THREE.Box3();
  for (let i = 0; i < pos.count; i++) {
    pBoxKnee.expandByPoint(p.fromBufferAttribute(pos,i).applyMatrix4(mat));
  }
  const pCenX = (pBoxKnee.min.x + pBoxKnee.max.x) * 0.5;
  console.log(`Patella centreX (kneeGrp) : ${(pCenX*1000).toFixed(2)} mm  (want 0.00)`);

  // ── F. Gaps to thigh armor and shin armor in world Y ─────────────────────────
  const pWorldBox = new THREE.Box3().setFromObject(patella);
  const thighBox  = new THREE.Box3().setFromObject(leg.thigh.anteriorArmor);
  const shinBox   = new THREE.Box3().setFromObject(leg.shin.anteriorKeelArmor);

  const gapAbove = thighBox.min.y  - pWorldBox.max.y;   // + = real gap
  const gapBelow = pWorldBox.min.y - shinBox.max.y;      // + = real gap

  console.log(`Gap above (thigh bottom → patella top)  : ${(gapAbove*1000).toFixed(2)} mm  ${gapAbove>0?'✓':'✗ OVERLAPPING!'}`);
  console.log(`Gap below (patella bottom → shin top)   : ${(gapBelow*1000).toFixed(2)} mm  ${gapBelow>0?'✓':'✗ OVERLAPPING!'}`);
  console.log(`Gap balance (above − below)             : ${((gapAbove-gapBelow)*1000).toFixed(2)} mm  (want near 0)`);

  // ── G. Face-normal direction ─────────────────────────────────────────────────
  const faceNormal = new THREE.Vector3(0,0,1).applyEuler(patella.rotation);
  console.log(`Patella face-normal  : [${faceNormal.x.toFixed(3)}, ${faceNormal.y.toFixed(3)}, ${faceNormal.z.toFixed(3)}]  (want 0,0,1)`);

  return { gapAbove, gapBelow, avgTop, avgMid, avgBot, minClr, pCenX };
}

const leftAudit  = auditSide('LEFT',  ll);
const rightAudit = auditSide('RIGHT', rl);

console.log('\n╔══════════════════════════════════════════╗');
console.log('║  SUMMARY — What needs to be fixed        ║');
console.log('╚══════════════════════════════════════════╝');

const issues: string[] = [];

if (leftAudit.minClr < 0) issues.push(`LEFT: patella penetrates bearing by ${(-leftAudit.minClr*1000).toFixed(2)} mm`);
if (rightAudit.minClr < 0) issues.push(`RIGHT: patella penetrates bearing by ${(-rightAudit.minClr*1000).toFixed(2)} mm`);

const imbalL = Math.abs(leftAudit.avgTop - leftAudit.avgBot)*1000;
const imbalR = Math.abs(rightAudit.avgTop - rightAudit.avgBot)*1000;
if (imbalL > 1) issues.push(`LEFT: radial clearance imbalance ${imbalL.toFixed(2)} mm`);
if (imbalR > 1) issues.push(`RIGHT: radial clearance imbalance ${imbalR.toFixed(2)} mm`);

if (leftAudit.gapAbove < 0.003)  issues.push(`LEFT: gap above too small (${(leftAudit.gapAbove*1000).toFixed(1)} mm)`);
if (leftAudit.gapBelow < 0.003)  issues.push(`LEFT: gap below too small (${(leftAudit.gapBelow*1000).toFixed(1)} mm)`);

const gapBalL = Math.abs(leftAudit.gapAbove - leftAudit.gapBelow)*1000;
const gapBalR = Math.abs(rightAudit.gapAbove - rightAudit.gapBelow)*1000;
if (gapBalL > 5) issues.push(`LEFT: gaps above/below unbalanced by ${gapBalL.toFixed(1)} mm`);
if (gapBalR > 5) issues.push(`RIGHT: gaps above/below unbalanced by ${gapBalR.toFixed(1)} mm`);

if (Math.abs(leftAudit.pCenX) > 0.0002) issues.push(`LEFT: X not centred on bearing (off by ${(leftAudit.pCenX*1000).toFixed(2)} mm)`);
if (Math.abs(rightAudit.pCenX) > 0.0002) issues.push(`RIGHT: X not centred on bearing`);

if (issues.length === 0) {
  console.log('ALL GOOD — no issues detected.');
} else {
  issues.forEach(i => console.log('  ✗ ' + i));
}
