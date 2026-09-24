/**
 * PRECISE ALIGNMENT COMPUTATION
 * Transforms thigh-armor-bottom and shin-armor-top into kneeGroup LOCAL space
 * to find the exact yOffset needed for balanced gaps.
 */
import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';
import { LEG_CONFIG } from '../src/robot/leg/LegConfig';

const robot = createProceduralRobot();
robot.root.updateMatrixWorld(true);
const leg = robot.leftLegNodes!;
const cfg = LEG_CONFIG.knee;

// kneeGroup world-to-local matrix
const kneeGrp = leg.knee.group;
const kneeWorldToLocal = kneeGrp.matrixWorld.clone().invert();

function worldBoxToLocalY(mesh: THREE.Mesh, w2l: THREE.Matrix4): { minY: number; maxY: number } {
  mesh.updateMatrixWorld(true);
  const geo = mesh.geometry;
  const posAttr = geo.attributes.position;
  let minY = Infinity, maxY = -Infinity;
  const v = new THREE.Vector3();
  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i).applyMatrix4(mesh.matrixWorld).applyMatrix4(w2l);
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }
  return { minY, maxY };
}

// Thigh anterior armor — bottom edge in kneeGroup local Y
const thighLocal = worldBoxToLocalY(leg.thigh.anteriorArmor, kneeWorldToLocal);
// Shin anterior keel armor — top edge in kneeGroup local Y
const shinLocal  = worldBoxToLocalY(leg.shin.anteriorKeelArmor, kneeWorldToLocal);

console.log(`Thigh armor in kneeGrp local Y:  min=${(thighLocal.minY*1000).toFixed(2)}mm  max=${(thighLocal.maxY*1000).toFixed(2)}mm`);
console.log(`Shin armor in kneeGrp local Y:   min=${(shinLocal.minY*1000).toFixed(2)}mm  max=${(shinLocal.maxY*1000).toFixed(2)}mm`);

// The thigh BOTTOM in kneeGrp local is thighLocal.minY (most negative)
// The shin TOP in kneeGrp local is shinLocal.maxY (most positive)
const thighBottomLocal = thighLocal.minY;   // upper constraint (above patella)
const shinTopLocal     = shinLocal.maxY;    // lower constraint (below patella)

console.log(`\nThigh bottom (kneeGrp local Y): ${(thighBottomLocal*1000).toFixed(2)} mm`);
console.log(`Shin top     (kneeGrp local Y): ${(shinTopLocal*1000).toFixed(2)} mm`);

// Patella half-height in Y
const patellaHalfH = 0.025165;  // from bounding box audit

// Space available between thigh bottom and shin top
const availableSpace = thighBottomLocal - shinTopLocal;
console.log(`Available vertical space:        ${(availableSpace*1000).toFixed(2)} mm`);
console.log(`Patella height (full):           ${(patellaHalfH*2*1000).toFixed(2)} mm`);
console.log(`Slack (space minus patella):     ${((availableSpace - patellaHalfH*2)*1000).toFixed(2)} mm`);

// Ideal center: midpoint between thigh bottom and shin top
const idealCenterY = (thighBottomLocal + shinTopLocal) / 2.0;
console.log(`\nIdeal patella center Y:          ${(idealCenterY*1000).toFixed(2)} mm`);
console.log(`=> New yOffset should be:        ${idealCenterY.toFixed(5)} m`);

// At this yOffset, what are the gaps?
const gapAbove = thighBottomLocal - (idealCenterY + patellaHalfH);
const gapBelow = (idealCenterY - patellaHalfH) - shinTopLocal;
console.log(`\nGap above at ideal center:  ${(gapAbove*1000).toFixed(2)} mm ${gapAbove>0?'✓ CLEAR':'✗ OVERLAP'}`);
console.log(`Gap below at ideal center:  ${(gapBelow*1000).toFixed(2)} mm ${gapBelow>0?'✓ CLEAR':'✗ OVERLAP'}`);
console.log(`Gap balance (should be 0):  ${((gapAbove-gapBelow)*1000).toFixed(2)} mm`);

// Also check: what offsetZ is needed to properly sit just forward of the bearing outer surface?
// The bearing disc radius = 0.022m. The patella back face (in local) is at z ≈ -thickness/2 = -0.005
// At offsetZ, patella back face = offsetZ - 0.005
// For clearance c from bearing outer surface: offsetZ - patellaHalfThick = R + c
// => offsetZ = R + c + patellaHalfThick
const R = cfg.discRadius;      // 0.022
const c = 0.001;               // 1mm clearance from bearing surface
const patellaHalfThick = 0.005; // half of thickness=0.010
const idealOffsetZ = R + c + patellaHalfThick;
console.log(`\nIdeal offsetZ (1mm clear from bearing, face forward): ${idealOffsetZ.toFixed(5)} m = ${(idealOffsetZ*1000).toFixed(1)} mm`);
console.log(`Current offsetZ: ${cfg.patella.offsetZ} m`);

// Summary of changes needed
console.log('\n═══════════════════════════════════════');
console.log('CHANGES REQUIRED TO LegConfig.ts:');
console.log('═══════════════════════════════════════');
console.log(`patella.yOffset:  ${cfg.patella.yOffset} → ${idealCenterY.toFixed(5)}`);
console.log(`patella.offsetZ:  ${cfg.patella.offsetZ} → ${idealOffsetZ.toFixed(5)}`);
console.log(`patella.rotX:     no rotation needed (shape already vertical in local space)`);
