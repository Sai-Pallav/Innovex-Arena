import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// FINGER / THUMB MODULE — Premium Humanoid Robotic Hand Digits
// Reference: Images 1, 2, 3
//
// Each finger: 3 articulated phalanx segments with mechanical hinge joints.
//   PROXIMAL PHALANX → PIP hinge → MIDDLE PHALANX → DIP hinge → DISTAL PHALANX → FINGERTIP
//
// Thumb: independent base swivel + PROXIMAL + IP hinge + DISTAL
//
// Every segment:
//   - White ceramic sculpted dorsal armor cowl  (armorDoubleSide)
//   - Dark titanium bone core cylinder  (joint)
//   - Palmar friction pad  (joint)
//   - Mechanical hinge pin + side caps between segments  (metallic / joint)
// ─────────────────────────────────────────────────────────────────────────────

export interface FingerSegmentNodes {
  group: THREE.Group;
  boneMesh: THREE.Mesh;
  armorMesh: THREE.Mesh;
  padMesh?: THREE.Mesh;
  hingeMesh?: THREE.Mesh;
  hingeCaps?: THREE.Mesh[];
}

export interface FingerNodes {
  group: THREE.Group;
  proximal: FingerSegmentNodes;
  middle: FingerSegmentNodes;
  distal: FingerSegmentNodes;
  tipMesh: THREE.Mesh;
}

export interface ThumbNodes {
  group: THREE.Group;
  baseBall: THREE.Mesh;
  baseCollar: THREE.Mesh;
  proximal: FingerSegmentNodes;
  middle?: FingerSegmentNodes;
  distal: FingerSegmentNodes;
  tipMesh: THREE.Mesh;
  proximalGroup?: THREE.Group;
  distalGroup?: THREE.Group;
}

export interface FingerSpec {
  name: string;
  spreadX: number;
  offsetY: number;
  offsetZ: number;
  proximalLength: number;
  middleLength: number;
  distalLength: number;
  proximalRadius: number;
  middleRadius: number;
  distalRadius: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHALANX ARMOR COWL GEOMETRY
// Sculpted cross-section: dorsal arch ridge, chamfered flanks,
// palmar concavity, and rounded distal wrap for fingertip.
// ─────────────────────────────────────────────────────────────────────────────
function createPhalanxArmorGeo(
  width: number,
  length: number,
  depth: number,
  isDistalTip: boolean = false
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const segY = isDistalTip ? 16 : 12;
  const hw = width * 0.5;
  const hd = depth * 0.5;
  const numX = 8;   // cross-section vertices per row

  for (let iy = 0; iy <= segY; iy++) {
    const v = iy / segY;
    let y = -v * length;

    // Taper factor — slight narrowing toward distal end
    let wF = 1.0;
    if (v < 0.12) {
      wF = 0.94 + 0.06 * (v / 0.12);
    } else if (v > 0.60) {
      wF = 1.0 - (isDistalTip ? 0.38 : 0.14) * ((v - 0.60) / 0.40);
    }
    const curW = hw * wF;

    let dF = 1.0 - 0.14 * v;
    let tipZOff = 0;

    // Distal rounded wrap — curls around fingertip
    if (isDistalTip && v > 0.58) {
      const tTip = (v - 0.58) / 0.42;
      y     -= tTip * 0.0026;
      tipZOff = -Math.sin(tTip * Math.PI * 0.50) * (hd * 0.90);
      dF    *= (1.0 - tTip * 0.32);
      wF    *= (1.0 - tTip * 0.24);
    }
    const curD = hd * dF;

    // 8-point cross-section:
    // 0,7 = lateral flanks at mid-depth
    // 1,6 = dorsal corners
    // 2,5 = dorsal crown (with arch)
    // 3,4 = dorsal apex ridge
    const archH = curD * 0.16 * Math.sin(v * Math.PI * 0.88);
    const W = curW * wF;
    const row: [number, number][] = [
      [ -W * 0.92,  -curD * 0.30 ],          // 0 lateral-palmar L
      [ -W * 1.00,   curD * 0.18 ],           // 1 lateral L
      [ -W * 0.62,   curD * 0.86 ],           // 2 dorsal-lateral L
      [  0.0,        curD + archH + tipZOff ], // 3 dorsal apex
      [  W * 0.62,   curD * 0.86 ],           // 4 dorsal-lateral R
      [  W * 1.00,   curD * 0.18 ],           // 5 lateral R
      [  W * 0.92,  -curD * 0.30 ],           // 6 lateral-palmar R
      [  0.0,       -curD * 0.68 + tipZOff ], // 7 palmar centre
    ];

    for (let ix = 0; ix < numX; ix++) {
      positions.push(row[ix][0], y, row[ix][1]);
      uvs.push(ix / (numX - 1), v);
    }
  }

  const stride = numX;
  for (let iy = 0; iy < segY; iy++) {
    for (let ix = 0; ix < numX - 1; ix++) {
      const a = iy * stride + ix;
      const b = (iy + 1) * stride + ix;
      const c = (iy + 1) * stride + (ix + 1);
      const d = iy * stride + (ix + 1);
      indices.push(a, b, d, b, c, d);
    }
    // Close the loop between last and first vertex
    const a = iy * stride + (numX - 1);
    const b = (iy + 1) * stride + (numX - 1);
    const c = (iy + 1) * stride + 0;
    const d = iy * stride + 0;
    indices.push(a, b, d, b, c, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─────────────────────────────────────────────────────────────────────────────
// PALMAR FRICTION PAD
// Subtle flat dark-titanium pad on the palmar (inside) face.
// ─────────────────────────────────────────────────────────────────────────────
function createPalmarPad(
  width: number,
  length: number,
  thickness: number,
  materials: RobotMaterialPalette
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(width, length, thickness);
  // Round off corners via scale — just a flat chamfered slab
  const mesh = new THREE.Mesh(geo, materials.joint);
  mesh.name = 'PalmarPad';
  return mesh;
}

// ─────────────────────────────────────────────────────────────────────────────
// KNUCKLE HINGE ASSEMBLY
// Mechanical pin + 2 side caps — visible at the PIP/DIP joints.
// ─────────────────────────────────────────────────────────────────────────────
function createKnuckleHinge(
  pinRadius: number,
  spanWidth: number,
  materials: RobotMaterialPalette
): { group: THREE.Group; hingePin: THREE.Mesh; caps: THREE.Mesh[] } {
  const group = new THREE.Group();
  const caps: THREE.Mesh[] = [];

  // Central hinge barrel
  const barrelGeo = new THREE.CylinderGeometry(
    pinRadius * 1.10, pinRadius * 1.10,
    spanWidth * 0.52, 14
  );
  barrelGeo.rotateZ(Math.PI / 2);
  const hingePin = new THREE.Mesh(barrelGeo, materials.joint);
  hingePin.castShadow = true;
  group.add(hingePin);

  // Axle pin (metallic, protrudes slightly past barrel)
  const axleGeo = new THREE.CylinderGeometry(
    pinRadius * 0.62, pinRadius * 0.62,
    spanWidth * 0.82, 10
  );
  axleGeo.rotateZ(Math.PI / 2);
  const axleMesh = new THREE.Mesh(axleGeo, materials.metallic);
  group.add(axleMesh);

  // Side caps
  for (const cSide of [-1, 1]) {
    const capGeo = new THREE.CylinderGeometry(
      pinRadius * 1.22, pinRadius * 1.22,
      0.0012, 14
    );
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, materials.metallic);
    cap.position.set(cSide * spanWidth * 0.28, 0, 0);
    cap.castShadow = true;
    group.add(cap);
    caps.push(cap);
  }

  return { group, hingePin, caps };
}

// ─────────────────────────────────────────────────────────────────────────────
// FINGER SEGMENT BUILDER (shared by all 3 phalanges)
// ─────────────────────────────────────────────────────────────────────────────
function buildSegment(
  name: string,
  radius: number,
  length: number,
  isDistal: boolean,
  materials: RobotMaterialPalette
): FingerSegmentNodes {
  const group = new THREE.Group();
  group.name = name;

  // Dark titanium bone core
  const boneGeo = new THREE.CylinderGeometry(
    radius * 0.45, radius * 0.38, length, 12
  );
  const boneMesh = new THREE.Mesh(boneGeo, materials.joint);
  boneMesh.position.set(0, -length * 0.5, 0);
  boneMesh.castShadow = true;
  group.add(boneMesh);

  // Miniature internal tendon conduit (chrome metallic)
  const tendonGeo = new THREE.CylinderGeometry(
    radius * 0.12, radius * 0.12, length * 0.88, 8
  );
  const tendonMesh = new THREE.Mesh(tendonGeo, materials.metallic);
  tendonMesh.position.set(0, -length * 0.5, -radius * 0.32);
  group.add(tendonMesh);

  // White ceramic dorsal armor cowl
  const armorW = radius * 2.10;
  const armorD = radius * 1.90;
  const armorGeo = createPhalanxArmorGeo(armorW, length * 0.96, armorD, isDistal);
  const armorMesh = new THREE.Mesh(armorGeo, materials.armorDoubleSide);
  armorMesh.position.set(0, -length * 0.02, 0);
  armorMesh.castShadow = true;
  armorMesh.receiveShadow = true;
  group.add(armorMesh);

  // Palmar friction pad (tactile elastomeric grip)
  const padMesh = createPalmarPad(
    armorW * 0.68, length * 0.72, 0.0018, materials
  );
  padMesh.position.set(0, -length * 0.50, -armorD * 0.30);
  group.add(padMesh);

  // Micro-fastener on dorsal armor plate
  if (!isDistal) {
    const screwGeo = new THREE.CylinderGeometry(0.0006, 0.0006, 0.0010, 6);
    screwGeo.rotateX(Math.PI / 2);
    const screw = new THREE.Mesh(screwGeo, materials.metallic);
    screw.position.set(0, -length * 0.32, armorD * 0.52);
    group.add(screw);
  } else {
    // Fingertip capacitive sensor pad on distal tip
    const sensorCapGeo = new THREE.SphereGeometry(radius * 0.42, 10, 8);
    const sensorCap = new THREE.Mesh(sensorCapGeo, materials.joint);
    sensorCap.position.set(0, -length * 0.94, -radius * 0.15);
    sensorCap.scale.set(1.0, 0.6, 0.8);
    group.add(sensorCap);

    const sensorRimGeo = new THREE.TorusGeometry(radius * 0.42, 0.0004, 6, 16);
    sensorRimGeo.rotateX(Math.PI / 2);
    const sensorRim = new THREE.Mesh(sensorRimGeo, materials.metallic);
    sensorRim.position.copy(sensorCap.position);
    group.add(sensorRim);
  }

  return { group, boneMesh, armorMesh, padMesh };
}

// ─────────────────────────────────────────────────────────────────────────────
// FINGER FACTORY
// ─────────────────────────────────────────────────────────────────────────────
export function createFinger(
  spec: FingerSpec,
  side: -1 | 1,
  materials: RobotMaterialPalette
): FingerNodes {
  const fingerGroup = new THREE.Group();
  fingerGroup.name = `${spec.name}Finger`;
  fingerGroup.position.set(spec.spreadX, spec.offsetY, spec.offsetZ);

  // ── PROXIMAL PHALANX ──────────────────────────────────────────────────────
  const proxSeg = buildSegment(
    `${spec.name}Proximal`,
    spec.proximalRadius, spec.proximalLength,
    false, materials
  );
  fingerGroup.add(proxSeg.group);

  // PIP hinge at distal end of proximal
  const pipHinge = createKnuckleHinge(
    spec.proximalRadius * 0.50,
    spec.proximalRadius * 2.10 * 0.90,
    materials
  );
  pipHinge.group.position.set(0, -spec.proximalLength, 0);
  proxSeg.group.add(pipHinge.group);
  proxSeg.hingeMesh = pipHinge.hingePin;
  proxSeg.hingeCaps  = pipHinge.caps;

  // ── MIDDLE PHALANX ────────────────────────────────────────────────────────
  const midSeg = buildSegment(
    `${spec.name}Middle`,
    spec.middleRadius, spec.middleLength,
    false, materials
  );
  midSeg.group.position.set(0, -spec.proximalLength, 0);
  proxSeg.group.add(midSeg.group);

  // DIP hinge at distal end of middle
  const dipHinge = createKnuckleHinge(
    spec.middleRadius * 0.48,
    spec.middleRadius * 2.05 * 0.88,
    materials
  );
  dipHinge.group.position.set(0, -spec.middleLength, 0);
  midSeg.group.add(dipHinge.group);
  midSeg.hingeMesh = dipHinge.hingePin;
  midSeg.hingeCaps  = dipHinge.caps;

  // ── DISTAL PHALANX & FINGERTIP ────────────────────────────────────────────
  const distSeg = buildSegment(
    `${spec.name}Distal`,
    spec.distalRadius, spec.distalLength,
    true, materials
  );
  distSeg.group.position.set(0, -spec.middleLength, 0);
  midSeg.group.add(distSeg.group);

  // ── RESTING POSE ──────────────────────────────────────────────────────────
  const restAngles: Record<string, { prox: number; mid: number; dist: number; splay: number }> = {
    Index:  { prox: 0.34, mid: 0.48, dist: 0.28, splay:  0.036 },
    Middle: { prox: 0.42, mid: 0.55, dist: 0.32, splay:  0.008 },
    Ring:   { prox: 0.50, mid: 0.62, dist: 0.36, splay: -0.022 },
    Little: { prox: 0.58, mid: 0.70, dist: 0.42, splay: -0.050 },
  };
  const a = restAngles[spec.name] ?? { prox: 0.35, mid: 0.50, dist: 0.30, splay: 0 };
  proxSeg.group.rotation.x = a.prox;
  midSeg.group.rotation.x  = a.mid;
  distSeg.group.rotation.x = a.dist;
  proxSeg.group.rotation.z = -side * a.splay;

  return {
    group:   fingerGroup,
    proximal: proxSeg,
    middle:   midSeg,
    distal:   distSeg,
    tipMesh:  distSeg.armorMesh,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// THUMB FACTORY
// Independent base swivel + 2-segment articulated thumb.
// Originates from the thenar eminence (medial-anterior palm margin).
// Orientated in true opposition toward index/middle fingers.
// ─────────────────────────────────────────────────────────────────────────────
export function createThumb(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ThumbNodes {
  const thumbGroup = new THREE.Group();
  thumbGroup.name = 'Thumb';

  // Thenar origin on palm margin (radial side)
  thumbGroup.position.set(-side * 0.019, -0.018, 0.005);
  // Resting opposition: pitched forward, rotated medially toward palm, rolled inward
  thumbGroup.rotation.set(0.30, -side * 0.38, -side * 0.25);

  // ── Thenar Base Swivel Knuckle ─────────────────────────────────────────────
  const ballGeo = new THREE.SphereGeometry(0.0068, 16, 12);
  const baseBall = new THREE.Mesh(ballGeo, materials.joint);
  baseBall.castShadow = true;
  thumbGroup.add(baseBall);

  // White ceramic thenar cowl (partial sphere, open toward fingers)
  const cowlGeo = new THREE.SphereGeometry(
    0.0080, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52
  );
  const thenarCowl = new THREE.Mesh(cowlGeo, materials.armor);
  thenarCowl.position.set(0, 0, 0.0014);
  thenarCowl.scale.set(0.90, 0.94, 0.70);
  thenarCowl.castShadow = true;
  thenarCowl.receiveShadow = true;
  thumbGroup.add(thenarCowl);

  // Swivel collar bracket
  const collarGeo = new THREE.CylinderGeometry(0.0060, 0.0060, 0.0055, 16);
  const baseCollar = new THREE.Mesh(collarGeo, materials.joint);
  baseCollar.position.set(0, -0.004, 0);
  baseCollar.castShadow = true;
  thumbGroup.add(baseCollar);

  // ── PROXIMAL PHALANX ──────────────────────────────────────────────────────
  const proxLen = 0.021;
  const proxRad = 0.0046;
  const proxSeg = buildSegment('ThumbProximal', proxRad, proxLen, false, materials);
  thumbGroup.add(proxSeg.group);

  // IP hinge
  const ipHinge = createKnuckleHinge(
    proxRad * 0.50, proxRad * 2.10 * 0.90, materials
  );
  ipHinge.group.position.set(0, -proxLen, 0);
  proxSeg.group.add(ipHinge.group);
  proxSeg.hingeMesh = ipHinge.hingePin;
  proxSeg.hingeCaps  = ipHinge.caps;

  // ── DISTAL PHALANX & THUMBTIP ─────────────────────────────────────────────
  const distLen = 0.016;
  const distRad = 0.0040;
  const distSeg = buildSegment('ThumbDistal', distRad, distLen, true, materials);
  distSeg.group.position.set(0, -proxLen, 0);
  proxSeg.group.add(distSeg.group);

  // Resting opposition curl
  proxSeg.group.rotation.x = 0.28;
  distSeg.group.rotation.x = 0.32;

  return {
    group:    thumbGroup,
    baseBall,
    baseCollar,
    proximal:  proxSeg,
    distal:    distSeg,
    tipMesh:   distSeg.armorMesh,
    proximalGroup: proxSeg.group,
    distalGroup:   distSeg.group,
  };
}
