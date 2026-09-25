import * as THREE from 'three';

const uSegs = 32;
const vSegs = 24;

function evaluatePoint(layer: 0 | 1, iu: number, iv: number, side: -1 | 1 = 1): THREE.Vector3 {
  const u = iu / uSegs; // 0 (anterior) -> 0.5 (apex) -> 1.0 (posterior)
  const v = iv / vSegs; // 0 (inboard/chest) -> 1.0 (outboard/lateral bearing)

  // 1. DYNAMIC ARCH ANGLE WITH LOWER CLEARANCE TAPER
  // Inboard: slightly higher clearance near chest transition
  // Mid-crest: wraps down further anteriorly & posteriorly to form protective shell
  // Outboard: arches cleanly around circular bearing
  const crestWeight = Math.sin(v * Math.PI); // peaks at v = 0.5
  const antDrop = 0.08 * Math.pow(Math.sin(v * Math.PI * 0.9 + 0.1), 1.2);
  const postDrop = 0.08 * Math.pow(Math.sin(v * Math.PI * 0.9 + 0.1), 1.2);

  const startAngle = (-0.08 - antDrop) * Math.PI;
  const endAngle = (1.08 + postDrop) * Math.PI;
  const angle = startAngle * (1 - u) + endAngle * u;

  const sinA = Math.sin(angle);
  const cosA = Math.cos(angle);

  // 2. INNER CAVITY RADIUS & CLEARANCE
  // Bearing outer radius is 0.0450 - 0.0465m.
  // Base clearance: 0.0485m (guarantees >= 2.0mm clearance everywhere)
  // Subtle crown along arch
  const archCrown = 0.0018 * Math.sin(u * Math.PI);
  const rBase = 0.0488 + archCrown;

  // 3. OUTER CERAMIC ARMOR THICKNESS & SCULPTED TOP CROWN
  // Thickness varies from 4.0mm to 5.8mm:
  // - thickest at central shoulder ridge (v ≈ 0.45, u ≈ 0.5)
  // - sleek tapered chamfer at perimeter edges
  const edgeTaperU = Math.min(u / 0.12, (1 - u) / 0.12, 1.0);
  const edgeTaperV = Math.min(v / 0.12, 1.0);
  const armorThickness = 0.0038 + 0.0018 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI * 0.9);

  // 4. TOP CONVEX CROWN (Breaking the flat horizontal ceiling in front view!)
  // Inboard (v=0): starts lower to meet chest slope (-2.5mm)
  // Crest (v=0.45): peaks smoothly (+1.5mm)
  // Lateral roll (v=0.85): curves down over joint (-2.0mm)
  // Lateral outer flank (v=1.0): drops down around bearing rim (-7.5mm)
  let yCrown = 0;
  if (v <= 0.45) {
    const t = v / 0.45;
    yCrown = -0.0028 * (1 - t) + 0.0016 * Math.sin(t * Math.PI * 0.5);
  } else {
    const t = (v - 0.45) / 0.55;
    // Smooth convex drop over the lateral shoulder corner
    yCrown = 0.0016 * (1 - Math.pow(t, 2.2)) - 0.0075 * Math.pow(t, 1.8);
  }

  // 5. LATERAL SPAN (X-axis)
  // Inboard (v=0) extends inward to X = -0.026 to seamlessly meet the chest collar!
  // Mid-crest arches outward
  // Outboard (v=1) wraps over lateral bearing to X = +0.0265
  const xInboard = -0.0255 + 0.0025 * Math.pow(Math.abs(u - 0.5) * 2, 1.5);
  const xOutboard = 0.0265 - 0.0020 * Math.pow(Math.abs(u - 0.5) * 2, 1.2);
  let xSpan = xInboard * (1 - v) + xOutboard * v;

  // Lateral wrapping: outer edge curves downward and slightly inward at lower front/back
  if (v > 0.65) {
    const tOuter = (v - 0.65) / 0.35;
    // Subtle lateral bulge at apex, tucking in at bottom
    xSpan += Math.sin(tOuter * Math.PI) * 0.0018 * Math.sin(u * Math.PI);
  }

  // Calculate base coordinates
  const radius = layer === 0 ? (rBase + armorThickness) : rBase;
  let y = radius * sinA + (layer === 0 ? yCrown : yCrown * 0.6);
  let z = radius * cosA;
  let x = side * xSpan;

  // 6. ANTERIOR CHEVRON FACET (Sculpted hard-surface facet echoing chest geometry)
  if (u < 0.32 && v > 0.25) {
    const tU = (0.32 - u) / 0.32;
    const tV = Math.sin((v - 0.25) / 0.75 * Math.PI);
    const drop = Math.pow(tU, 1.3) * tV * 0.0042;
    y -= drop;
    z += tU * 0.0015;
  }

  // 7. POSTERIOR RETURN CHAMFER
  if (u > 0.75) {
    const tPost = (u - 0.75) / 0.25;
    const drop = Math.pow(tPost, 1.4) * 0.0028;
    y -= drop;
    z -= tPost * 0.0012;
  }

  return new THREE.Vector3(x, y, z);
}

// Test generation
const p00 = evaluatePoint(0, 0, 0);
const pApex = evaluatePoint(0, uSegs / 2, vSegs / 2);
const pOut = evaluatePoint(0, uSegs / 2, vSegs);
console.log('Front-Inboard (u=0, v=0):', p00);
console.log('Apex Crest (u=0.5, v=0.5):', pApex);
console.log('Outboard Rim (u=0.5, v=1.0):', pOut);
