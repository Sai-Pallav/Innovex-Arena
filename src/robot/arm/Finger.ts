import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// FINGER / THUMB MODULE — Ultra-Realistic Humanoid Robotic Digits
// Meticulously engineered from CAD Blueprint Panels 7, 8, 9 & High-End Mecha Reference:
//
// Features:
//   - Proportioned Humanoid Scale (increased size with authentic athletic body, not skinny)
//   - True Anatomical Length Ratios (Middle > Ring > Index > Little)
//   - Sculpted Ceramic Composite Dorsal Cowls with Precision Chamfered Flanks & Tendon Channels
//   - Dark Titanium Structural Spaceframe Bone Cores with CNC Lightening Slots
//   - Precision Dual-Shear Mechanical Hinge Joints (PIP & DIP) with Concentric Bearing Caps & Axle Pins
//   - Multi-Segmented Palmar Elastomer Friction Grip Pads with Micro-Tread Texturing
//   - Ergonomic Rounded Fingertips with Tactile Sensor Pads & Dorsal Sensor Plates
//   - High-Mounted Opposable Robotic Thumb with Precision Rotary Actuator Trunnion (NO BUBBLE!)
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
// High-fidelity CAD cross-section with aerodynamic crowned dorsal arch,
// precision lateral bevels, tendon guide trough, and ergonomic rounded tip.
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

  const segY = isDistalTip ? 20 : 14;
  const hw = width * 0.5;
  const hd = depth * 0.5;
  const numX = 10; // 10 cross-section contour points per ring

  for (let iy = 0; iy <= segY; iy++) {
    const v = iy / segY;
    let y = -v * length;

    // Smooth progressive taper toward distal joint
    let wF = 1.0;
    let dF = 1.0;

    if (v < 0.14) {
      // Gentle flare and proximal bevel relief for collision-free 100° flexion
      const t = v / 0.14;
      wF = 0.93 + 0.07 * t;
      dF = 0.86 + 0.14 * t;
    } else if (v > 0.55) {
      const tEnd = (v - 0.55) / 0.45;
      if (isDistalTip) {
        // Ergonomic organic taper towards fingertip
        wF = 1.0 - 0.30 * Math.pow(tEnd, 1.4);
        dF = 1.0 - 0.42 * Math.pow(tEnd, 1.2);
      } else {
        // Sculpted knuckle hood taper with clearance for child segment articulation
        wF = 1.0 - 0.10 * tEnd;
        dF = 1.0 - 0.12 * Math.pow(tEnd, 1.5);
      }
    }

    let tipZOff = 0;
    let tipYOff = 0;

    // Distal rounded fingertip curvature (dorsal wrap-around)
    if (isDistalTip && v > 0.60) {
      const tTip = (v - 0.60) / 0.40;
      // Ergonomic anatomical curvature: curls gently downward and inward
      tipYOff = -Math.sin(tTip * Math.PI * 0.5) * (hd * 0.28);
      tipZOff = -Math.pow(tTip, 1.6) * (hd * 0.52);
      y += tipYOff;
    }

    const curW = hw * wF;
    const curD = hd * dF;

    // 10-Point Sculpted Cross-Section:
    const grooveDepth = (v > 0.10 && v < 0.85) ? 0.00035 : 0.0;
    const dorsalArch = curD * 0.22 * Math.sin(v * Math.PI * 0.92);

    const row: [number, number][] = [
      [ -curW * 0.86,  -curD * 0.32 + tipZOff * 0.4 ], // 0: Palmar-lateral L
      [ -curW * 1.00,   curD * 0.10 + tipZOff * 0.6 ], // 1: Lateral flank L
      [ -curW * 0.82,   curD * 0.72 + tipZOff ],       // 2: Dorsal chamfer L
      [ -curW * 0.42,   curD * 0.96 + dorsalArch + tipZOff ], // 3: Dorsal ridge L
      [  0.0,           curD * 1.04 + dorsalArch - grooveDepth + tipZOff ], // 4: Dorsal center apex
      [  curW * 0.42,   curD * 0.96 + dorsalArch + tipZOff ], // 5: Dorsal ridge R
      [  curW * 0.82,   curD * 0.72 + tipZOff ],       // 6: Dorsal chamfer R
      [  curW * 1.00,   curD * 0.10 + tipZOff * 0.6 ], // 7: Lateral flank R
      [  curW * 0.86,  -curD * 0.32 + tipZOff * 0.4 ], // 8: Palmar-lateral R
      [  0.0,          -curD * 0.48 + tipZOff * 0.3 ], // 9: Palmar center inset
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
// Sized with 10% clearance at each joint margin to ensure zero pad collision on deep flexion.
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
  const slabLength = length * 0.78;
  const slabGeo = new THREE.BoxGeometry(width, slabLength, thickness);
  const basePad = new THREE.Mesh(slabGeo, materials.joint);
  basePad.castShadow = true;
  padGroup.add(basePad);

  // Micro-grip friction ribs across the pad surface
  const ribCount = isDistalTip ? 4 : 3;
  const ribSpacing = (slabLength * 0.75) / (ribCount + 1);
  const ribStartY = (slabLength * 0.38);

  for (let r = 0; r < ribCount; r++) {
    const ry = ribStartY - (r + 1) * ribSpacing;
    const ribW = width * (isDistalTip ? (0.85 - r * 0.08) : 0.88);
    const ribGeo = new THREE.BoxGeometry(ribW, 0.0010, thickness * 0.45);
    const rib = new THREE.Mesh(ribGeo, materials.jointDoubleSide);
    rib.position.set(0, ry, -thickness * 0.52);
    padGroup.add(rib);
  }

  // Fingertip wrap cap if distal
  if (isDistalTip) {
    const tipCushionGeo = new THREE.SphereGeometry(
      width * 0.44, 14, 10, 0, Math.PI, 0, Math.PI * 0.65
    );
    tipCushionGeo.rotateX(Math.PI);
    const tipCushion = new THREE.Mesh(tipCushionGeo, materials.joint);
    tipCushion.position.set(0, -slabLength * 0.50, -thickness * 0.20);
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
    pinRadius * 1.02, pinRadius * 1.02, spanWidth * 0.62, 22
  );
  barrelGeo.rotateZ(Math.PI / 2);
  const hingePin = new THREE.Mesh(barrelGeo, materials.joint);
  hingePin.castShadow = true;
  group.add(hingePin);

  // High-tensile stainless steel axle pin (core)
  const axleGeo = new THREE.CylinderGeometry(
    pinRadius * 0.68, pinRadius * 0.68, spanWidth * 0.94, 18
  );
  axleGeo.rotateZ(Math.PI / 2);
  const axle = new THREE.Mesh(axleGeo, materials.metallic);
  group.add(axle);

  // Precision CNC end caps with concentric bearing retainers (flush with armor profile)
  for (const cSide of [-1, 1]) {
    const capX = cSide * spanWidth * 0.31;

    // Polished outer bearing bezel
    const capGeo = new THREE.CylinderGeometry(
      pinRadius * 0.96, pinRadius * 0.96, 0.0008, 20
    );
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, materials.metallic);
    cap.position.set(capX, 0, 0);
    cap.castShadow = true;
    group.add(cap);
    caps.push(cap);

    // Inner dark titanium hub with micro hex socket
    const hubGeo = new THREE.CylinderGeometry(
      pinRadius * 0.60, pinRadius * 0.60, 0.0010, 16
    );
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, materials.joint);
    hub.position.set(capX + cSide * 0.0001, 0, 0);
    group.add(hub);

    // Concentric micro accent ring
    const ringGeo = new THREE.TorusGeometry(pinRadius * 0.80, 0.0002, 6, 18);
    ringGeo.rotateY(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, materials.metallic);
    ring.position.set(capX, 0, 0);
    group.add(ring);
  }

  // Mechanical joint extension limit stop tab (recessed for maximum flexion range)
  const stopGeo = new THREE.BoxGeometry(spanWidth * 0.48, pinRadius * 0.50, pinRadius * 0.35);
  const stopMesh = new THREE.Mesh(stopGeo, materials.joint);
  stopMesh.position.set(0, pinRadius * 0.80, pinRadius * 0.25);
  group.add(stopMesh);

  return { group, hingePin, caps };
}

// ─────────────────────────────────────────────────────────────────────────────
// PHALANX SEGMENT BUILDER
// Shared segment constructor for Proximal, Middle, and Distal phalanges.
// Collars and armor are beveled for 0°–100° universal collision-free articulation.
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

  // 1. Dark Titanium Internal Structural Bone Core
  const boneGeo = new THREE.CylinderGeometry(
    radius * 0.48, radius * 0.40, length, 16
  );
  const boneMesh = new THREE.Mesh(boneGeo, materials.joint);
  boneMesh.name = `${name}_BoneCore`;
  boneMesh.position.set(0, -length * 0.5, 0);
  boneMesh.castShadow = true;
  group.add(boneMesh);

  // CNC Metallic structural spine intersecting the core
  const spineGeo = new THREE.BoxGeometry(radius * 0.25, length * 0.45, radius * 1.05);
  const spine = new THREE.Mesh(spineGeo, materials.metallic);
  spine.position.set(0, -length * 0.50, 0);
  group.add(spine);

  // 2. Proximal Joint Interface Collar Ring (beveled for free pivot articulation)
  const collarH = Math.max(0.0024, length * 0.08);
  const collarR = radius * 0.94;
  const proxCollarGeo = new THREE.CylinderGeometry(collarR, collarR * 0.94, collarH, 22);
  const proxCollar = new THREE.Mesh(proxCollarGeo, materials.joint);
  proxCollar.position.set(0, -collarH * 0.5, 0);
  proxCollar.castShadow = true;
  group.add(proxCollar);

  // Polished chrome collar retainer trim ring
  const proxTrimGeo = new THREE.TorusGeometry(collarR, 0.00035, 6, 22);
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

    const distTrimGeo = new THREE.TorusGeometry(collarR * 0.92, 0.00035, 6, 22);
    distTrimGeo.rotateX(Math.PI / 2);
    const distTrim = new THREE.Mesh(distTrimGeo, materials.metallic);
    distTrim.position.set(0, -length + collarH * 0.5, 0);
    group.add(distTrim);
  }

  // 4. Sculpted White Ceramic Dorsal Armor Shell
  const armorW = radius * 2.05;
  const armorD = radius * 1.88;
  const armorStartY = isDistal ? collarH * 0.75 : collarH * 0.85;
  const armorLen = isDistal ? (length - armorStartY) : (length - collarH * 1.70);
  const armorGeo = createPhalanxArmorGeo(armorW, armorLen, armorD, isDistal);
  const armorMesh = new THREE.Mesh(armorGeo, materials.armorDoubleSide);
  armorMesh.name = `${name}_ArmorShell`;
  armorMesh.position.set(0, -armorStartY, 0);
  armorMesh.castShadow = true;
  armorMesh.receiveShadow = true;
  group.add(armorMesh);

  // 5. Dorsal Sensor Nail Plate on Distal Phalanx (High-Tech Detail)
  if (isDistal) {
    const nailGeo = new THREE.BoxGeometry(armorW * 0.50, length * 0.30, 0.0008);
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
    armorW * 0.70, length * 0.66, 0.0024, isDistal, materials
  );
  padGroup.position.set(0, -length * 0.50, -armorD * 0.28);
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
  // Authentic cascading athletic resting angles matching Reference Images 1 & 2:
  // Index: graceful forward extension | Middle: progressive curve | Ring: deeper curl | Little: tucked cascade
  const restPoses: Record<string, { prox: number; mid: number; dist: number; splay: number }> = {
    Index:  { prox: 0.40, mid: 0.58, dist: 0.38, splay: -0.025 },
    Middle: { prox: 0.50, mid: 0.72, dist: 0.45, splay:  0.000 },
    Ring:   { prox: 0.60, mid: 0.88, dist: 0.52, splay:  0.032 },
    Little: { prox: 0.70, mid: 1.05, dist: 0.60, splay:  0.065 },
  };

  const radial = -side;
  const pose = restPoses[spec.name] ?? { prox: 0.16, mid: 0.28, dist: 0.20, splay: 0 };
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
// 1. Organic white ceramic thenar eminence flowing from palm chassis
// 2. Semi-recessed dark titanium rotary actuator with flush chrome bezel
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

  // 1. HIGH-MOUNTED THENAR ANCHOR:
  // Positioned flush with the radial corner of the carpal-palmar margin
  thumbGroup.position.set(radial * 0.0210, -0.0140, 0.0050);

  // Natural Humanoid Resting Stance:
  // - rotation.x: forward palmar abduction (~0.42 rad / ~24°)
  // - rotation.y: medial opposition rotation toward index (-radial * 0.28 rad)
  // - rotation.z: slight clearance angle (radial * 0.14 rad)
  thumbGroup.rotation.set(0.42, -radial * 0.28, radial * 0.14);

  // ── 1. THENAR HOUSING & COMPACT CMC ACTUATOR ──────────────────────────────
  // Sculpted White Ceramic Thenar Fairing blending into the palm
  const thenarBracketGeo = new THREE.BoxGeometry(0.0130, 0.0160, 0.0110);
  const thenarBracket = new THREE.Mesh(thenarBracketGeo, materials.armor);
  thenarBracket.name = 'ThumbThenarBracket';
  thenarBracket.position.set(-radial * 0.0015, 0.0020, -0.0010);
  thenarBracket.castShadow = true;
  thenarBracket.receiveShadow = true;
  thumbGroup.add(thenarBracket);

  // Compact dark titanium cylindrical actuator core (flush within bracket)
  const trunnionGeo = new THREE.CylinderGeometry(0.0068, 0.0068, 0.0080, 22);
  trunnionGeo.rotateZ(Math.PI / 2);
  const baseBall = new THREE.Mesh(trunnionGeo, materials.joint);
  baseBall.name = 'ThumbCMCActuatorHousing';
  baseBall.castShadow = true;
  thumbGroup.add(baseBall);

  // Flush chrome bezel ring
  const baseRingGeo = new THREE.TorusGeometry(0.0068, 0.0006, 6, 22);
  baseRingGeo.rotateY(Math.PI / 2);
  const baseRing = new THREE.Mesh(baseRingGeo, materials.metallic);
  baseRing.position.set(radial * 0.0038, 0, 0);
  thumbGroup.add(baseRing);

  // Precision metallic bearing disc
  const discGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.0008, 20);
  discGeo.rotateZ(Math.PI / 2);
  const bearingDisc = new THREE.Mesh(discGeo, materials.metallic);
  bearingDisc.position.set(radial * 0.0041, 0, 0);
  thumbGroup.add(bearingDisc);

  // Swivel mounting collar interface
  const collarGeo = new THREE.CylinderGeometry(0.0068, 0.0072, 0.0035, 20);
  const baseCollar = new THREE.Mesh(collarGeo, materials.joint);
  baseCollar.name = 'ThumbSwivelCollar';
  baseCollar.position.set(0, -0.0055, 0);
  baseCollar.castShadow = true;
  thumbGroup.add(baseCollar);

  // ── 2. PROXIMAL PHALANX ───────────────────────────────────────────────────
  const proxLen = 0.0380;
  const proxRad = 0.0072;
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
  const distLen = 0.0280;
  const distRad = 0.0060;
  const distSeg = buildSegment('ThumbDistal', distRad, distLen, true, materials);
  distSeg.group.position.set(0, -proxLen, 0);
  proxSeg.group.add(distSeg.group);

  // ── 4. NATURAL RESTING POSE (MATCHING REFERENCE IMAGES) ───────────────────
  // Thumb rests gracefully alongside the index finger in gentle natural opposition
  proxSeg.group.rotation.x = 0.42; // gentle forward opposition angle
  proxSeg.group.rotation.z = 0;
  distSeg.group.rotation.x = 0.48; // natural relaxed inward curl
  distSeg.group.rotation.z = -radial * 0.08; // inward return towards index finger

  // Purple telemetry accent strip on lateral distal thumb
  const thumbLedGeo = new THREE.BoxGeometry(0.0008, 0.0045, 0.0008);
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
