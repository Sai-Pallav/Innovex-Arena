import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';
import { LEG_CONFIG } from '../src/robot/leg/LegConfig';

console.log('=== FINE-TUNING EQUAL CLEARANCE AROUND KNEE BEARING ===\n');

const R_bearing = 0.022; // 22mm disc radius

// Create patella geometry to extract sample points
const width = LEG_CONFIG.knee.patella.width; // 0.028
const height = LEG_CONFIG.knee.patella.height; // 0.046
const thickness = LEG_CONFIG.knee.patella.thickness; // 0.010

const shape = new THREE.Shape();
const halfW = width * 0.5;
const halfH = height * 0.5;

shape.moveTo(0, halfH);
shape.lineTo(halfW * 0.70, halfH * 0.60);
shape.lineTo(halfW * 0.92, halfH * 0.20);
shape.lineTo(halfW, 0.0);
shape.lineTo(halfW * 0.92, -halfH * 0.20);
shape.lineTo(halfW * 0.65, -halfH * 0.65);
shape.lineTo(0, -halfH);
shape.lineTo(-halfW * 0.65, -halfH * 0.65);
shape.lineTo(-halfW * 0.92, -halfH * 0.20);
shape.lineTo(-halfW, 0.0);
shape.lineTo(-halfW * 0.92, halfH * 0.20);
shape.lineTo(-halfW * 0.70, halfH * 0.60);
shape.closePath();

const geo = new THREE.ExtrudeGeometry(shape, {
  depth: thickness,
  bevelEnabled: true,
  bevelThickness: 0.0022,
  bevelSize: 0.0016,
  bevelSegments: 4,
  curveSegments: 24,
});
geo.center();

const posAttr = geo.attributes.position;
const backFacePoints: THREE.Vector3[] = [];
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i);
  const y = posAttr.getY(i);
  const z = posAttr.getZ(i);
  // Collect vertices on the back face of the white patella cover
  if (z <= -0.002) {
    backFacePoints.push(new THREE.Vector3(x, y, z));
  }
}

function evaluate(yOffset: number, offsetZ: number, rotXDeg: number) {
  const rotXRad = (rotXDeg * Math.PI) / 180;
  const pos = new THREE.Vector3(0, yOffset, offsetZ);
  const euler = new THREE.Euler(rotXRad, 0, 0, 'XYZ');
  const quat = new THREE.Quaternion().setFromEuler(euler);
  const mat = new THREE.Matrix4().compose(pos, quat, new THREE.Vector3(1, 1, 1));

  let minClr = Infinity;
  let maxClr = -Infinity;
  const p = new THREE.Vector3();

  // Evaluate radial clearance across 5 vertical slices of the back face:
  // Top peak (y > 0.018), Upper (0.008 < y <= 0.018), Center (-0.008 <= y <= 0.008), Lower (-0.018 <= y < -0.008), Bottom point (y < -0.018)
  const sliceSums = [0, 0, 0, 0, 0];
  const sliceCounts = [0, 0, 0, 0, 0];

  for (const pt of backFacePoints) {
    p.copy(pt).applyMatrix4(mat);
    const dist = Math.sqrt(p.y * p.y + p.z * p.z);
    const clr = dist - R_bearing;

    if (clr < minClr) minClr = clr;
    if (clr > maxClr) maxClr = clr;

    if (pt.y > 0.018) { sliceSums[0] += clr; sliceCounts[0]++; }
    else if (pt.y > 0.008) { sliceSums[1] += clr; sliceCounts[1]++; }
    else if (pt.y >= -0.008) { sliceSums[2] += clr; sliceCounts[2]++; }
    else if (pt.y >= -0.018) { sliceSums[3] += clr; sliceCounts[3]++; }
    else { sliceSums[4] += clr; sliceCounts[4]++; }
  }

  const avgs = sliceSums.map((sum, idx) => (sliceCounts[idx] > 0 ? sum / sliceCounts[idx] : 0));
  const maxDiff = Math.max(...avgs) - Math.min(...avgs);

  return {
    yOffset,
    offsetZ,
    rotXDeg,
    minClrMm: minClr * 1000,
    maxClrMm: maxClr * 1000,
    sliceAvgsMm: avgs.map(a => Number((a * 1000).toFixed(2))),
    maxDiffMm: maxDiff * 1000,
  };
}

console.log('Testing candidates for equal radial clearance:');
console.log('------------------------------------------------------------------------------------------------');
console.log(' yOffset (m) | offsetZ (m) | rotX (deg) | Min Clr (mm) | Slices (Top->Btm) (mm)              | MaxDiff (mm)');
console.log('------------------------------------------------------------------------------------------------');

const candidates = [
  { y: 0.000, z: 0.0298, rx: 0 },
  { y: 0.000, z: 0.0300, rx: 0 },
  { y: 0.000, z: 0.0305, rx: 0 },
  { y: 0.000, z: 0.0310, rx: 0 },
  { y: 0.000, z: 0.0298, rx: 2 },
  { y: 0.000, z: 0.0298, rx: -2 },
  { y: 0.002, z: 0.0298, rx: -1 },
  { y: 0.000, z: 0.0302, rx: 0 },
];

for (const c of candidates) {
  const res = evaluate(c.y, c.z, c.rx);
  console.log(
    ` ${res.yOffset.toFixed(4).padStart(10)} | ${res.offsetZ.toFixed(4).padStart(11)} | ${res.rotXDeg.toString().padStart(10)} | ${res.minClrMm.toFixed(2).padStart(12)} | [${res.sliceAvgsMm.map(n => n.toFixed(1).padStart(5)).join(', ')}] | ${res.maxDiffMm.toFixed(2).padStart(11)}`
  );
}

