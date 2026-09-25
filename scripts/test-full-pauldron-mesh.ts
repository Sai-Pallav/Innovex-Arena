import * as THREE from 'three';

function createSculptedPauldronGeometry(side: -1 | 1): THREE.BufferGeometry {
  const uSegs = 36; // along arch (anterior to posterior)
  const vSegs = 28; // across width (inboard to outboard)
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  function evaluatePoint(layer: 0 | 1, iu: number, iv: number): THREE.Vector3 {
    const u = iu / uSegs; // 0 = anterior (front), 0.5 = apex (top), 1.0 = posterior (rear)
    const v = iv / vSegs; // 0 = inboard (chest), 1.0 = outboard (lateral bearing)

    // 1. DYNAMIC ARCH SPAN WITH REFINED MECHANICAL CLEARANCE ARCH (Surgical Refinement 06.2)
    const clearanceArch = Math.pow(Math.sin(v * Math.PI), 2.2) * 0.072;

    // Anterior lapel: subtle horizontal shelf extension inward at flanks (v < 0.38 and v > 0.64)
    const antFlankInboard = Math.max(0, 1 - v / 0.38) * 0.058;
    const antFlankOutboard = Math.max(0, (v - 0.64) / 0.36) * 0.050;
    const antLapel = (antFlankInboard + antFlankOutboard) - clearanceArch;

    // Posterior cowl: matching subtle shelf extension and clearance
    const postFlankInboard = Math.max(0, 1 - v / 0.38) * 0.064;
    const postFlankOutboard = Math.max(0, (v - 0.64) / 0.36) * 0.054;
    const postCowl = (postFlankInboard + postFlankOutboard) - clearanceArch * 0.80;

    let startAngle = (-0.05 - antLapel) * Math.PI;
    let endAngle = (1.05 + postCowl) * Math.PI;

    // 2. INNER CAVITY RADIUS & LOCAL SHELL DEPTH/THICKNESS (Surgical Refinement 06.2)
    let rOuter = 0.0512;
    let armorThick = 0.0052;

    // SCULPTED CONVEX CROWN PROFILE ACROSS v (Outer profile unchanged to preserve silhouette)
    if (v <= 0.35) {
      const t = v / 0.35;
      rOuter = 0.0503 * (1 - t) + 0.0551 * t;
      armorThick = 0.0042 * (1 - t) + 0.0058 * t;
    } else {
      const t = (v - 0.35) / 0.65;
      rOuter = 0.0551 * (1 - t) + 0.0512 * t;
      armorThick = 0.0058 * (1 - t) + 0.0052 * t;
    }

    // Longitudinal arch crown across u
    const archCrown = 0.0016 * Math.sin(u * Math.PI);
    rOuter += archCrown;
    const rInner = rOuter - armorThick;

    // Visible rim return depth around anterior (front) and posterior (rear) mechanical opening
    let angle = startAngle * (1 - u) + endAngle * u;
    if (layer === 1) {
      if (u < 0.12) {
        const uBlend = Math.pow(1 - u / 0.12, 1.4);
        const lipAngle = 0.024 * Math.PI * uBlend;
        angle -= lipAngle;
      } else if (u > 0.88) {
        const uBlend = Math.pow((u - 0.88) / 0.12, 1.4);
        const lipAngle = 0.020 * Math.PI * uBlend;
        angle += lipAngle;
      }
    }

    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);

    // 4. LATERAL SPAN (Inboard extension to chest + Outboard wrapping with subtle flank taper)
    // Move chest-facing inner edge slightly toward torso (X = ±0.1988 in torso space)
    const xInboard = -0.0352 + 0.0018 * Math.pow(Math.abs(u - 0.5) * 2, 1.4);

    // Outboard lateral contour with subtle engineered taper (frozen outer silhouette)
    const midBulge = 0.0014 * Math.sin(u * Math.PI);
    const xOutboard = 0.0238 + midBulge - 0.0022 * Math.pow(Math.abs(u - 0.5) * 2, 1.4);
    let xSpan = xInboard * (1 - v) + xOutboard * v;

    // Subtle lateral roll smoothing transition between top and side surfaces
    if (v > 0.55) {
      const tRoll = (v - 0.55) / 0.45;
      xSpan += Math.sin(tRoll * Math.PI) * 0.0012 * Math.sin(u * Math.PI);
    }

    const radius = layer === 0 ? rOuter : rInner;
    let y = radius * sinA;
    let z = radius * cosA;
    let x = side * xSpan;

    // 5. ANTERIOR CHEVRON SCULPTED FACET (echoes futuristic chest armor aesthetic)
    if (u < 0.28 && v > 0.20) {
      const tU = (0.28 - u) / 0.28;
      const tV = Math.sin((v - 0.20) / 0.80 * Math.PI);
      const drop = Math.pow(tU, 1.3) * tV * 0.0032;
      y -= drop;
      z += tU * 0.0014;
    }

    // 6. POSTERIOR RETURN CHAMFER
    if (u > 0.72) {
      const tPost = (u - 0.72) / 0.28;
      const drop = Math.pow(tPost, 1.3) * 0.0024;
      y -= drop;
      z -= tPost * 0.0010;
    }

    // 7. OUTBOARD APERTURE CHAMFER & RECESSED INNER RIM (Frames bearing with solid depth)
    if (v > 0.82) {
      const tRim = (v - 0.82) / 0.18;
      if (layer === 1) {
        x -= side * tRim * 0.0028;
      }
    }

    return new THREE.Vector3(x, y, z);
  }

  // Generate outer (0) and inner (1) surfaces
  for (let layer = 0; layer <= 1; layer++) {
    for (let iu = 0; iu <= uSegs; iu++) {
      for (let iv = 0; iv <= vSegs; iv++) {
        const p = evaluatePoint(layer as 0 | 1, iu, iv);
        positions.push(p.x, p.y, p.z);
        uvs.push(iv / vSegs, iu / uSegs);
      }
    }
  }

  const layerStride = (uSegs + 1) * (vSegs + 1);

  // Outer surface triangles
  for (let iu = 0; iu < uSegs; iu++) {
    for (let iv = 0; iv < vSegs; iv++) {
      const a = iu * (vSegs + 1) + iv;
      const b = a + 1;
      const c = a + (vSegs + 1);
      const d = c + 1;
      if (side === 1) {
        indices.push(a, b, c);
        indices.push(b, d, c);
      } else {
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
  }

  // Inner surface triangles (reverse winding)
  for (let iu = 0; iu < uSegs; iu++) {
    for (let iv = 0; iv < vSegs; iv++) {
      const a = layerStride + iu * (vSegs + 1) + iv;
      const b = a + 1;
      const c = a + (vSegs + 1);
      const d = c + 1;
      if (side === 1) {
        indices.push(a, c, b);
        indices.push(b, c, d);
      } else {
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
  }

  // Perimeter bevel edges
  // Front edge (iu = 0)
  for (let iv = 0; iv < vSegs; iv++) {
    const oA = iv;
    const oB = iv + 1;
    const iA = layerStride + iv;
    const iB = layerStride + iv + 1;
    if (side === 1) {
      indices.push(oA, iA, oB);
      indices.push(oB, iA, iB);
    } else {
      indices.push(oA, oB, iA);
      indices.push(oB, iB, iA);
    }
  }

  // Rear edge (iu = uSegs)
  const rearOffset = uSegs * (vSegs + 1);
  for (let iv = 0; iv < vSegs; iv++) {
    const oA = rearOffset + iv;
    const oB = rearOffset + iv + 1;
    const iA = layerStride + rearOffset + iv;
    const iB = layerStride + rearOffset + iv + 1;
    if (side === 1) {
      indices.push(oA, oB, iA);
      indices.push(oB, iB, iA);
    } else {
      indices.push(oA, iA, oB);
      indices.push(oB, iA, iB);
    }
  }

  // Inboard edge (iv = 0)
  for (let iu = 0; iu < uSegs; iu++) {
    const oA = iu * (vSegs + 1);
    const oC = (iu + 1) * (vSegs + 1);
    const iA = layerStride + oA;
    const iC = layerStride + oC;
    if (side === 1) {
      indices.push(oA, oC, iA);
      indices.push(oC, iC, iA);
    } else {
      indices.push(oA, iA, oC);
      indices.push(oC, iA, iC);
    }
  }

  // Outboard edge (iv = vSegs)
  for (let iu = 0; iu < uSegs; iu++) {
    const oA = iu * (vSegs + 1) + vSegs;
    const oC = (iu + 1) * (vSegs + 1) + vSegs;
    const iA = layerStride + oA;
    const iC = layerStride + oC;
    if (side === 1) {
      indices.push(oA, iA, oC);
      indices.push(oC, iA, iC);
    } else {
      indices.push(oA, oC, iA);
      indices.push(oC, iC, iA);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const geoR = createSculptedPauldronGeometry(1);
const geoL = createSculptedPauldronGeometry(-1);

geoR.computeBoundingBox();
geoL.computeBoundingBox();

console.log('Right Pauldron Bounding Box:', geoR.boundingBox);
console.log('Left Pauldron Bounding Box:', geoL.boundingBox);
console.log('Right Pauldron Vertex Count:', geoR.attributes.position.count);
console.log('Right Pauldron Index Count:', geoR.index?.count);
