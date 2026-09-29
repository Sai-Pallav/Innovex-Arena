import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// FINGER / THUMB MODULE — Ultra-Realistic Humanoid Robotic Digits
// Precision CAD-engineered from authoritative Reference Images 1 & 2:
//
// Key Refinements:
//   - Preserves 100% existing athletic mecha scale, finger lengths, and silhouette
//   - Seamless black structural spaceframe bone cores & CNC titanium spines
//   - Sculpted ceramic composite dorsal cowls with aerodynamic crowned arch,
//     precision chamfered flanks, and solid closed geometry (zero paper-thin sheets)
//   - Dual-shear mechanical knuckle hinges (MCP, PIP, DIP, IP) with chamfered
//     bearing bezels, concentric micro-accent rings, and recessed hex axle pins
//   - Flush ergonomic palmar tactile friction pads with micro-grip ridges
//     (Zero bulbous protruding buttons or spherical bubbles)
//   - Ergonomic rounded fingertips with dorsal telemetry sensor nail plates
//   - Opposable robotic thumb with recessed thenar socket & rotary actuator trunnion
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
// SCULPTED PHALANX ARMOR COWL GEOMETRY
// Fully closed CAD solid geometry with aerodynamic crowned dorsal arch,
// precision chamfered lateral flanks, and ergonomic rounded fingertip dome.
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

  const segY = isDistalTip ? 22 : 16;
  const hw = width * 0.5;
  const hd = depth * 0.5;
  const numX = 12; // 12 contour points around the cross-section

  for (let iy = 0; iy <= segY; iy++) {
    const v = iy / segY;
    let y = -v * length;

    // Smooth progressive taper toward distal joint
    let wF = 1.0;
    let dF = 1.0;

    if (v < 0.12) {
      // Proximal knuckle relief for collision-free 105° flexion
      const t = v / 0.12;
      wF = 0.94 + 0.06 * t;
      dF = 0.88 + 0.12 * t;
    } else if (v > 0.55) {
      const tEnd = (v - 0.55) / 0.45;
      if (isDistalTip) {
        // Ergonomic organic taper towards fingertip dome
        wF = 1.0 - 0.38 * Math.pow(tEnd, 1.3);
        dF = 1.0 - 0.46 * Math.pow(tEnd, 1.2);
      } else {
        // Sculpted knuckle hood taper with clearance for child segment articulation
        wF = 1.0 - 0.08 * tEnd;
        dF = 1.0 - 0.10 * Math.pow(tEnd, 1.4);
      }
    }

    let tipZOff = 0;
    let tipYOff = 0;

    // Distal rounded fingertip dome curvature (wraps smoothly to tip)
    if (isDistalTip && v > 0.65) {
      const tTip = (v - 0.65) / 0.35;
      tipYOff = -Math.sin(tTip * Math.PI * 0.5) * (hd * 0.22);
      tipZOff = -Math.pow(tTip, 1.5) * (hd * 0.48);
      y += tipYOff;
    }

    const curW = hw * wF;
    const curD = hd * dF;

    // 12-Point Sculpted Cross-Section with chamfered flanks and crowned dorsal arch:
    const dorsalCrown = curD * 0.18 * Math.sin(v * Math.PI * 0.92);
    const grooveDepth = (v > 0.12 && v < 0.82) ? 0.0003 : 0.0;

    // Last ring of distal tip closes down to apex
    const isTipApex = isDistalTip && iy === segY;
    const scaleApex = isTipApex ? 0.08 : 1.0;

    const row: [number, number][] = [
      [ -curW * 0.82 * scaleApex, -curD * 0.55 * scaleApex + tipZOff * 0.4 ], // 0: Palmar-lateral L
      [ -curW * 0.98 * scaleApex,  curD * 0.08 * scaleApex + tipZOff * 0.6 ], // 1: Mid-lateral L
      [ -curW * 0.88 * scaleApex,  curD * 0.52 * scaleApex + tipZOff * 0.8 ], // 2: Dorsal-lateral chamfer L
      [ -curW * 0.58 * scaleApex,  curD * 0.84 * scaleApex + tipZOff ],       // 3: Dorsal shoulder L
      [ -curW * 0.26 * scaleApex,  curD * 1.00 * scaleApex + dorsalCrown + tipZOff ], // 4: Dorsal ridge L
      [  0.0,                      curD * 1.06 * scaleApex + dorsalCrown - grooveDepth + tipZOff ], // 5: Dorsal center apex
      [  curW * 0.26 * scaleApex,  curD * 1.00 * scaleApex + dorsalCrown + tipZOff ], // 6: Dorsal ridge R
      [  curW * 0.58 * scaleApex,  curD * 0.84 * scaleApex + tipZOff ],       // 7: Dorsal shoulder R
      [  curW * 0.88 * scaleApex,  curD * 0.52 * scaleApex + tipZOff * 0.8 ], // 8: Dorsal-lateral chamfer R
      [  curW * 0.98 * scaleApex,  curD * 0.08 * scaleApex + tipZOff * 0.6 ], // 9: Mid-lateral R
      [  curW * 0.82 * scaleApex, -curD * 0.55 * scaleApex + tipZOff * 0.4 ], // 10: Palmar-lateral R
      [  0.0,                     -curD * 0.68 * scaleApex + tipZOff * 0.3 ], // 11: Palmar center inset
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
    // Close the cross-section loop
    const a = iy * stride + (numX - 1);
    const b = (iy + 1) * stride + (numX - 1);
    const c = (iy + 1) * stride + 0;
    const d = iy * stride + 0;
    indices.push(a, b, d, b, c, d);
  }

  // Proximal end-cap (closes top rim cleanly)
  const proxCenterIdx = positions.length / 3;
  positions.push(0, 0, 0.002);
  uvs.push(0.5, 0);
  for (let ix = 0; ix < numX; ix++) {
    const next = (ix + 1) % numX;
    indices.push(proxCenterIdx, next, ix);
  }

  // Distal end-cap for distal tip dome
  if (isDistalTip) {
    const distCenterIdx = positions.length / 3;
    const lastRowBase = segY * stride;
    positions.push(0, -length - hd * 0.15, -hd * 0.25);
    uvs.push(0.5, 1);
    for (let ix = 0; ix < numX; ix++) {
      const next = (ix + 1) % numX;
      indices.push(distCenterIdx, lastRowBase + ix, lastRowBase + next);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─────────────────────────────────────────────────────────────────────────────
// PALMAR TACTILE FRICTION GRIP PAD
// Multi-slotted high-density dark elastomer pad for dexterous object manipulation.
// Contours flush into the segment with zero bulbous button protrusions.
// ─────────────────────────────────────────────────────────────────────────────
function createPalmarPad(
  width: number,
  length: number,
  thickness: number,
  isDistalTip: boolean,
  materials: RobotMaterialPalette
): THREE.Group {
  const padGroup = new THREE.Group();
  padGroup.name = 'PalmarTactileGripPad';

  // Base elastomer cushion slab with joint margin clearance
  const slabLength = isDistalTip ? length * 0.85 : length * 0.78;
  const slabGeo = new THREE.BoxGeometry(width, slabLength, thickness);
  const basePad = new THREE.Mesh(slabGeo, materials.joint);
  basePad.castShadow = true;
  padGroup.add(basePad);

  // Micro-grip friction ribs across the pad surface
  const ribCount = isDistalTip ? 4 : 3;
  const ribSpacing = (slabLength * 0.72) / (ribCount + 1);
  const ribStartY = (slabLength * 0.36);

  for (let r = 0; r < ribCount; r++) {
    const ry = ribStartY - (r + 1) * ribSpacing;
    const ribW = width * (isDistalTip ? (0.88 - r * 0.08) : 0.88);
    const ribGeo = new THREE.BoxGeometry(ribW, 0.0009, thickness * 0.40);
    const rib = new THREE.Mesh(ribGeo, materials.jointDoubleSide);
    rib.position.set(0, ry, -thickness * 0.52);
    padGroup.add(rib);
  }

  // Smooth flush tactile pulp cushion (anatomical, flush with white armor)
  if (isDistalTip) {
    const tipCushionGeo = new THREE.CylinderGeometry(
      width * 0.42, width * 0.28, length * 0.22, 16
    );
    tipCushionGeo.rotateX(Math.PI / 2);
    const tipCushion = new THREE.Mesh(tipCushionGeo, materials.joint);
    tipCushion.position.set(0, -slabLength * 0.48, -thickness * 0.15);
    padGroup.add(tipCushion);
  }

  return padGroup;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRECISION INTERPHALANGEAL MECHANICAL HINGE ASSEMBLY
// Transverse axle pin, dark titanium bearing barrel, dual chrome pivot caps with
// micro concentric grooves, and mechanical rotation limit stops.
// ─────────────────────────────────────────────────────────────────────────────
function createKnuckleHinge(
  pinRadius: number,
  spanWidth: number,
  materials: RobotMaterialPalette
): { group: THREE.Group; hingePin: THREE.Mesh; caps: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.name = 'KnuckleHingeAssembly';
  const caps: THREE.Mesh[] = [];

  // Central dark titanium bearing housing barrel
  const barrelGeo = new THREE.CylinderGeometry(
    pinRadius * 1.00, pinRadius * 1.00, spanWidth * 0.64, 22
  );
  barrelGeo.rotateZ(Math.PI / 2);
  const hingePin = new THREE.Mesh(barrelGeo, materials.joint);
  hingePin.castShadow = true;
  group.add(hingePin);

  // High-tensile stainless steel axle pin (core)
  const axleGeo = new THREE.CylinderGeometry(
    pinRadius * 0.68, pinRadius * 0.68, spanWidth * 0.96, 18
  );
  axleGeo.rotateZ(Math.PI / 2);
  const axle = new THREE.Mesh(axleGeo, materials.metallic);
  group.add(axle);

  // Precision CNC end caps with concentric bearing retainers (flush with armor profile)
  for (const cSide of [-1, 1]) {
    const capX = cSide * spanWidth * 0.32;

    // Chamfered outer bearing bezel
    const capGeo = new THREE.CylinderGeometry(
      pinRadius * 0.95, pinRadius * 0.90, 0.0009, 20
    );
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, materials.metallic);
    cap.position.set(capX, 0, 0);
    cap.castShadow = true;
    group.add(cap);
    caps.push(cap);

    // Inner dark titanium hub with micro hex socket
    const hubGeo = new THREE.CylinderGeometry(
      pinRadius * 0.55, pinRadius * 0.55, 0.0011, 16
    );
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, materials.joint);
    hub.position.set(capX + cSide * 0.0001, 0, 0);
    group.add(hub);

    // Concentric micro accent ring
    const ringGeo = new THREE.TorusGeometry(pinRadius * 0.78, 0.0002, 6, 18);
    ringGeo.rotateY(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, materials.metallic);
    ring.position.set(capX, 0, 0);
    group.add(ring);
  }

  // Mechanical joint extension limit stop tab (recessed for maximum flexion range)
  const stopGeo = new THREE.BoxGeometry(spanWidth * 0.50, pinRadius * 0.45, pinRadius * 0.32);
  const stopMesh = new THREE.Mesh(stopGeo, materials.joint);
  stopMesh.position.set(0, pinRadius * 0.78, pinRadius * 0.22);
  group.add(stopMesh);

  return { group, hingePin, caps };
}

// ─────────────────────────────────────────────────────────────────────────────
// PHALANX SEGMENT BUILDER
// Shared segment constructor for Proximal, Middle, and Distal phalanges.
// Collars and armor are beveled for 0°–105° universal collision-free articulation.
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

  // 1. Dark Titanium Internal Structural Bone Core (strictly internal)
  const boneGeo = new THREE.CylinderGeometry(
    radius * 0.25, radius * 0.22, length * 0.85, 16
  );
  const boneMesh = new THREE.Mesh(boneGeo, materials.joint);
  boneMesh.name = `${name}_BoneCore`;
  boneMesh.position.set(0, -length * 0.5, 0);
  boneMesh.castShadow = true;
  group.add(boneMesh);

  // CNC Metallic structural spine intersecting the core (strictly internal)
  const spineGeo = new THREE.BoxGeometry(radius * 0.18, length * 0.45, radius * 0.35);
  const spine = new THREE.Mesh(spineGeo, materials.metallic);
  spine.position.set(0, -length * 0.50, 0);
  group.add(spine);

  // 2. Proximal Joint Interface Collar Ring (beveled for free pivot articulation)
  const collarH = Math.max(0.0022, length * 0.075);
  const collarR = radius * 0.94;
  const proxCollarGeo = new THREE.CylinderGeometry(collarR, collarR * 0.94, collarH, 22);
  const proxCollar = new THREE.Mesh(proxCollarGeo, materials.joint);
  proxCollar.position.set(0, -collarH * 0.5, 0);
  proxCollar.castShadow = true;
  group.add(proxCollar);

  // Polished chrome collar retainer trim ring
  const proxTrimGeo = new THREE.TorusGeometry(collarR, 0.00030, 6, 22);
  proxTrimGeo.rotateX(Math.PI / 2);
  const proxTrim = new THREE.Mesh(proxTrimGeo, materials.metallic);
  proxTrim.position.set(0, -collarH * 0.5, 0);
  group.add(proxTrim);

  // 3. Distal Joint Collar (on non-distal segments)
  if (!isDistal) {
    const distCollarGeo = new THREE.CylinderGeometry(collarR * 0.92, collarR * 0.94, collarH, 22);
    const distCollar = new THREE.Mesh(distCollarGeo, materials.joint);
    distCollar.position.set(0, -length + collarH * 0.5, 0);
    distCollar.castShadow = true;
    group.add(distCollar);

    const distTrimGeo = new THREE.TorusGeometry(collarR * 0.92, 0.00030, 6, 22);
    distTrimGeo.rotateX(Math.PI / 2);
    const distTrim = new THREE.Mesh(distTrimGeo, materials.metallic);
    distTrim.position.set(0, -length + collarH * 0.5, 0);
    group.add(distTrim);
  }

  // 4. Sculpted White Ceramic Dorsal Armor Shell
  const armorW = radius * 2.05;
  const armorD = radius * 1.88;
  const armorStartY = 0.0005; // Anchored flush with proximal collar margin
  const armorLen = isDistal ? length : (length - collarH * 0.65);
  const armorGeo = createPhalanxArmorGeo(armorW, armorLen, armorD, isDistal);
  const armorMesh = new THREE.Mesh(armorGeo, materials.armor);
  armorMesh.name = `${name}_ArmorShell`;
  armorMesh.position.set(0, -armorStartY, 0);
  armorMesh.castShadow = true;
  armorMesh.receiveShadow = true;
  group.add(armorMesh);

  // 5. Dorsal Sensor Nail Plate on Distal Phalanx (High-Tech Detail)
  if (isDistal) {
    const nailGeo = new THREE.BoxGeometry(armorW * 0.50, length * 0.28, 0.0008);
    const nailMesh = new THREE.Mesh(nailGeo, materials.joint);
    nailMesh.name = `${name}_SensorNailPlate`;
    nailMesh.position.set(0, -length * 0.68, armorD * 0.44);
    group.add(nailMesh);

    // Micro optical sensor jewel with bloom
    const dotGeo = new THREE.SphereGeometry(0.0007, 10, 8);
    const dotMesh = new THREE.Mesh(dotGeo, materials.purpleEmissive);
    dotMesh.position.set(0, -length * 0.72, armorD * 0.44 + 0.0004);
    group.add(dotMesh);

    const dotBloomGeo = new THREE.SphereGeometry(0.0011, 8, 6);
    const dotBloomMesh = new THREE.Mesh(dotBloomGeo, materials.purpleBloom);
    dotBloomMesh.position.copy(dotMesh.position);
    group.add(dotBloomMesh);
  }

  // 6. Palmar Tactile Elastomer Friction Pad
  const padGroup = createPalmarPad(
    armorW * 0.72, length * 0.68, 0.0022, isDistal, materials
  );
  padGroup.position.set(0, -length * 0.50, -armorD * 0.35);
  group.add(padGroup);

  const padMesh = padGroup.children[0] as THREE.Mesh;
  return { group, boneMesh, armorMesh, padMesh };
}

// ─────────────────────────────────────────────────────────────────────────────
// FINGER FACTORY
// Assembles 3-phalanx articulated digit with anatomical resting cascade.
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

  // PIP Hinge at distal end of proximal phalanx
  const pipHinge = createKnuckleHinge(
    spec.proximalRadius * 0.95,
    spec.proximalRadius * 2.10,
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

  // DIP Hinge at distal end of middle phalanx
  const dipHinge = createKnuckleHinge(
    spec.middleRadius * 0.95,
    spec.middleRadius * 2.05,
    materials
  );
  dipHinge.group.position.set(0, -spec.middleLength, 0);
  midSeg.group.add(dipHinge.group);
  midSeg.hingeMesh = dipHinge.hingePin;
  midSeg.hingeCaps  = dipHinge.caps;

  // ── DISTAL PHALANX & ERGONOMIC FINGERTIP ──────────────────────────────────
  const distSeg = buildSegment(
    `${spec.name}Distal`,
    spec.distalRadius, spec.distalLength,
    true, materials
  );
  distSeg.group.position.set(0, -spec.middleLength, 0);
  midSeg.group.add(distSeg.group);

  // ── ANATOMICAL RESTING ATHLETIC CASCADE (MATCHING REFERENCE IMAGES 1 & 2) ─
  // Authentic open relaxed athletic resting angles matching Reference Images 1 & 2:
  // Clean downward extension with subtle ergonomic forward cascade (~15°–25° total)
  const restPoses: Record<string, { prox: number; mid: number; dist: number; splay: number }> = {
    Index:  { prox: 0.08, mid: 0.10, dist: 0.08, splay: -0.015 },
    Middle: { prox: 0.10, mid: 0.12, dist: 0.10, splay:  0.000 },
    Ring:   { prox: 0.12, mid: 0.14, dist: 0.12, splay:  0.015 },
    Little: { prox: 0.15, mid: 0.16, dist: 0.14, splay:  0.030 },
  };

  const radial = -side;
  const pose = restPoses[spec.name] ?? { prox: 0.10, mid: 0.12, dist: 0.10, splay: 0 };
  proxSeg.group.rotation.x = pose.prox;
  midSeg.group.rotation.x  = pose.mid;
  distSeg.group.rotation.x = pose.dist;
  proxSeg.group.rotation.z = radial * pose.splay;

  return {
    group:   fingerGroup,
    proximal: proxSeg,
    middle:   midSeg,
    distal:   distSeg,
    tipMesh:  distSeg.armorMesh,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OPPOSABLE ARTICULATED ROBOTIC THUMB (RE-ENGINEERED TO MATCH REFERENCE DESIGN)
//
// 1. Recessed dark titanium thenar socket cradling the rotary actuator
// 2. High-precision cylindrical rotary actuator with flush chrome bezel ring
// 3. Natural palmar abduction and opposition resting gracefully beside index
// ─────────────────────────────────────────────────────────────────────────────
export function createThumb(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ThumbNodes {
  const thumbGroup = new THREE.Group();
  thumbGroup.name = 'Thumb';

  // Radial direction: for right hand (side = 1), medial thumb is at -X.
  // For left hand (side = -1), medial thumb is at +X.
  const radial = -side;

  // 1. HIGH-MOUNTED THENAR ANCHOR (SIDE OF PALM):
  // Positioned on the lateral/radial flank matching Reference Images 1 & 2
  thumbGroup.position.set(radial * 0.0215, -0.0170, 0.0038);

  // Natural Humanoid Resting Stance:
  // - rotation.z: outward abduction angle (radial * 0.40 rad ≈ 23°)
  // - rotation.x: gentle forward tilt (0.22 rad ≈ 12.6°)
  // - rotation.y: slight opposition rotation toward palm (-radial * 0.16 rad ≈ 9°)
  thumbGroup.rotation.set(0.22, -radial * 0.16, radial * 0.40);

  // ── 1. THENAR HOUSING & COMPACT CMC ACTUATOR ──────────────────────────────
  // Sleek mounting socket recessed in the palm radial flank
  const thenarSocketGeo = new THREE.CylinderGeometry(0.0062, 0.0068, 0.0040, 18);
  thenarSocketGeo.rotateZ(Math.PI / 2);
  const thenarSocket = new THREE.Mesh(thenarSocketGeo, materials.joint);
  thenarSocket.name = 'ThumbThenarSocket';
  thenarSocket.position.set(-radial * 0.0018, 0.0009, -0.0014);
  thenarSocket.castShadow = true;
  thumbGroup.add(thenarSocket);

  // Compact dark titanium cylindrical actuator core (flush within socket)
  const trunnionGeo = new THREE.CylinderGeometry(0.0064, 0.0064, 0.0078, 22);
  trunnionGeo.rotateZ(Math.PI / 2);
  const baseBall = new THREE.Mesh(trunnionGeo, materials.joint);
  baseBall.name = 'ThumbCMCActuatorHousing';
  baseBall.castShadow = true;
  thumbGroup.add(baseBall);

  // Flush chrome bezel ring
  const baseRingGeo = new THREE.TorusGeometry(0.0064, 0.0006, 6, 22);
  baseRingGeo.rotateY(Math.PI / 2);
  const baseRing = new THREE.Mesh(baseRingGeo, materials.metallic);
  baseRing.position.set(radial * 0.0036, 0, 0);
  thumbGroup.add(baseRing);

  // Precision metallic bearing disc
  const discGeo = new THREE.CylinderGeometry(0.0052, 0.0052, 0.0007, 20);
  discGeo.rotateZ(Math.PI / 2);
  const bearingDisc = new THREE.Mesh(discGeo, materials.metallic);
  bearingDisc.position.set(radial * 0.0039, 0, 0);
  thumbGroup.add(bearingDisc);

  // Swivel mounting collar interface
  const collarGeo = new THREE.CylinderGeometry(0.0062, 0.0068, 0.0034, 20);
  const baseCollar = new THREE.Mesh(collarGeo, materials.joint);
  baseCollar.name = 'ThumbSwivelCollar';
  baseCollar.position.set(0, -0.0048, 0);
  baseCollar.castShadow = true;
  thumbGroup.add(baseCollar);

  // ── 2. PROXIMAL PHALANX ───────────────────────────────────────────────────
  const proxLen = 0.0295;
  const proxRad = 0.0064;
  const proxSeg = buildSegment('ThumbProximal', proxRad, proxLen, false, materials);
  thumbGroup.add(proxSeg.group);

  // Interphalangeal (IP) Mechanical Knuckle Hinge
  const ipHinge = createKnuckleHinge(
    proxRad * 0.90,
    proxRad * 2.05,
    materials
  );
  ipHinge.group.position.set(0, -proxLen, 0);
  proxSeg.group.add(ipHinge.group);
  proxSeg.hingeMesh = ipHinge.hingePin;
  proxSeg.hingeCaps  = ipHinge.caps;

  // ── 3. DISTAL PHALANX & OPPOSABLE THUMBTIP ────────────────────────────────
  const distLen = 0.0220;
  const distRad = 0.0054;
  const distSeg = buildSegment('ThumbDistal', distRad, distLen, true, materials);
  distSeg.group.position.set(0, -proxLen, 0);
  proxSeg.group.add(distSeg.group);

  // ── 4. NATURAL RESTING POSE (MATCHING REFERENCE IMAGES) ───────────────────
  // Thumb rests gracefully alongside the index finger in gentle natural opposition
  proxSeg.group.rotation.x = 0.14; // gentle forward angle
  proxSeg.group.rotation.z = radial * 0.04;
  distSeg.group.rotation.x = 0.18; // gentle natural relaxed curl
  distSeg.group.rotation.z = -radial * 0.06; // inward return towards index finger

  // Purple telemetry accent strip on lateral distal thumb
  const thumbLedGeo = new THREE.BoxGeometry(0.0007, 0.0036, 0.0007);
  const thumbLed = new THREE.Mesh(thumbLedGeo, materials.purpleEmissive);
  thumbLed.position.set(radial * (distRad * 0.88), -distLen * 0.50, distRad * 0.20);
  distSeg.group.add(thumbLed);

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
