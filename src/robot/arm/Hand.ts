import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { createFinger, createThumb, FingerNodes, ThumbNodes, FingerSpec } from './Finger';

// ─────────────────────────────────────────────────────────────────────────────
// HAND MODULE — Premium Humanoid Robotic Hand & Palm Chassis
// Reference: Images 1, 2, 3
//
// Architecture:
//   WRIST MOUNTING PLATE
//         ↓
//   CARPAL DOCKING CUFF
//         ↓
//   TITANIUM PALM CHASSIS (CNC machined, structural)
//         ↓
//   SCULPTED WHITE CERAMIC DORSAL METACARPAL PLATE
//         ↓
//   PALMAR TACTILE FRICTION PADS
//         ↓
//   4 MCP TRANSVERSE HINGE PINS + METALLIC END CAPS
//         ↓
//   4 ARTICULATED FINGERS + OPPOSABLE THUMB
//
// Proportions: 56mm wide × 50mm tall × 20mm deep palm chassis.
// Fingers are longer relative to palm vs the previous version.
// ─────────────────────────────────────────────────────────────────────────────

export interface HandNodes {
  group: THREE.Group;
  palmChassis: THREE.Mesh;
  dorsalArmor: THREE.Mesh;
  carpalCuff: THREE.Mesh;
  thumb: ThumbNodes;
  indexFinger: FingerNodes;
  middleFinger: FingerNodes;
  ringFinger: FingerNodes;
  pinkyFinger: FingerNodes;
  littleFinger: FingerNodes;
  knuckles: THREE.Mesh[];
  knuckleCaps: THREE.Mesh[];
  palmarPads: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];
}

// ─────────────────────────────────────────────────────────────────────────────
// FINGER SPECIFICATIONS
// Calibrated for athletic humanoid proportions.
// Middle fingertip ≈ 95 - 100 mm from wrist virtual centre (golden ratio to forearm).
// ─────────────────────────────────────────────────────────────────────────────
const FINGER_SPECS: FingerSpec[] = [
  {
    name: 'Index',
    spreadX: -0.0145,
    offsetY: -0.035,
    offsetZ:  0.002,
    proximalLength: 0.027,
    middleLength:   0.017,
    distalLength:   0.013,
    proximalRadius: 0.0044,
    middleRadius:   0.0038,
    distalRadius:   0.0031,
  },
  {
    name: 'Middle',
    spreadX: -0.0048,
    offsetY: -0.037,
    offsetZ:  0.003,
    proximalLength: 0.029,
    middleLength:   0.018,
    distalLength:   0.014,
    proximalRadius: 0.0046,
    middleRadius:   0.0040,
    distalRadius:   0.0032,
  },
  {
    name: 'Ring',
    spreadX:  0.0048,
    offsetY: -0.036,
    offsetZ:  0.002,
    proximalLength: 0.027,
    middleLength:   0.017,
    distalLength:   0.013,
    proximalRadius: 0.0044,
    middleRadius:   0.0038,
    distalRadius:   0.0031,
  },
  {
    name: 'Little',
    spreadX:  0.0140,
    offsetY: -0.033,
    offsetZ:  0.001,
    proximalLength: 0.021,
    middleLength:   0.013,
    distalLength:   0.011,
    proximalRadius: 0.0039,
    middleRadius:   0.0033,
    distalRadius:   0.0027,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SCULPTED DORSAL METACARPAL PLATE
// Compound-camber white ceramic shield spanning the hand dorsum.
// Convex arch in both X and Y; subtle centerline ridge.
// ─────────────────────────────────────────────────────────────────────────────
function createDorsalPlate(materials: RobotMaterialPalette): THREE.Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // 7 columns × 6 rows of sculpted vertices
  const ySteps  = [-0.003, -0.009, -0.016, -0.023, -0.029, -0.034];
  const hwSteps = [ 0.016,  0.018,  0.020,  0.021,  0.021,  0.020];
  const numY = ySteps.length;
  const numX = 7;

  for (let iy = 0; iy < numY; iy++) {
    const y   = ySteps[iy];
    const hw  = hwSteps[iy];
    const v   = iy / (numY - 1);

    for (let ix = 0; ix < numX; ix++) {
      const u = ix / (numX - 1);
      const x = -hw + u * hw * 2.0;

      // Compound arch camber
      const arch = Math.cos((x / hw) * (Math.PI * 0.44)) * 0.0042;
      const z    = 0.008 + arch * (0.80 + 0.20 * Math.sin(v * Math.PI));

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  for (let iy = 0; iy < numY - 1; iy++) {
    for (let ix = 0; ix < numX - 1; ix++) {
      const a = iy * numX + ix;
      const b = (iy + 1) * numX + ix;
      const c = (iy + 1) * numX + (ix + 1);
      const d = iy * numX + (ix + 1);
      indices.push(a, b, d, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, materials.armorDoubleSide);
  mesh.name = 'HandDorsalArmor';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HAND FACTORY
// ─────────────────────────────────────────────────────────────────────────────
export function createHand(
  side: -1 | 1,
  materials: RobotMaterialPalette
): HandNodes {
  const handGroup = new THREE.Group();
  handGroup.name = side === -1 ? 'LeftHandRoot' : 'RightHandRoot';

  const ledMeshes: THREE.Mesh[] = [];
  const knuckles: THREE.Mesh[] = [];
  const knuckleCaps: THREE.Mesh[] = [];
  const palmarPads: THREE.Mesh[] = [];

  // ════════════════════════════════════════════════════════════
  // 1. CARPAL INTERFACE CUFF — mates flush with Wrist distal plate
  //    Base radius 17.5mm (35mm dia) matching the 8-bolt interface plate
  // ════════════════════════════════════════════════════════════
  const cuffFlangeGeo = new THREE.CylinderGeometry(0.0175, 0.0175, 0.0035, 24);
  const carpalCuff = new THREE.Mesh(cuffFlangeGeo, materials.joint);
  carpalCuff.name = 'HandCarpalCuff';
  carpalCuff.position.set(0, -0.0018, 0);
  carpalCuff.castShadow = true;
  handGroup.add(carpalCuff);

  // Transition carpal collar into palm chassis
  const cuffTransitGeo = new THREE.CylinderGeometry(0.0185, 0.0175, 0.0030, 20);
  const cuffRim = new THREE.Mesh(cuffTransitGeo, materials.metallic);
  cuffRim.position.set(0, -0.0045, 0);
  handGroup.add(cuffRim);

  // ════════════════════════════════════════════════════════════
  // 2. SCULPTED TITANIUM PALM CHASSIS — structural CNC core
  //    Contoured silhouette tapering from 35mm carpal width to 41mm knuckle arch
  // ════════════════════════════════════════════════════════════
  const rThumb = -side; // radial direction of thumb
  const rPinky = side;  // ulnar direction of pinky

  const palmShape = new THREE.Shape();
  const wCarpal = 0.0172;     // 34.4mm total carpal width (matches 35mm cuff)
  const wMidThumb = 0.0190;   // thenar flare
  const wMidPinky = 0.0175;   // streamlined hypothenar flank
  const wKnuckleThumb = 0.0180;
  const wKnucklePinky = 0.0175;

  palmShape.moveTo(0, 0);
  palmShape.lineTo(rPinky * wCarpal, 0);
  palmShape.lineTo(rPinky * wMidPinky, -0.016);
  palmShape.lineTo(rPinky * wKnucklePinky, -0.031);
  palmShape.lineTo(0, -0.033);
  palmShape.lineTo(rThumb * wKnuckleThumb, -0.031);
  palmShape.lineTo(rThumb * wMidThumb, -0.016);
  palmShape.lineTo(rThumb * wCarpal, 0);
  palmShape.closePath();

  const palmGeo = new THREE.ExtrudeGeometry(palmShape, {
    depth: 0.013,
    bevelEnabled: true,
    bevelThickness: 0.0014,
    bevelSize: 0.0014,
    bevelSegments: 2,
  });
  palmGeo.center();

  const palmChassis = new THREE.Mesh(palmGeo, materials.joint);
  palmChassis.name = 'PalmChassis';
  palmChassis.position.set(0, -0.017, 0.001);
  palmChassis.castShadow = true;
  palmChassis.receiveShadow = true;
  handGroup.add(palmChassis);

  // CNC weight-reduction pockets on palmar face
  for (let p = 0; p < 3; p++) {
    const pockGeo = new THREE.BoxGeometry(0.009, 0.009, 0.003);
    const pock = new THREE.Mesh(pockGeo, materials.joint);
    pock.position.set((p - 1) * 0.010, -0.018, -0.0065);
    handGroup.add(pock);
  }

  // ── Palmar Tactile Friction Grip Pads ─────────────────────────────────────
  // Thenar (thumb side) and hypothenar (pinky side) pads
  const padData = [
    { x: rThumb * 0.009, y: -0.017, h: 0.018, w: 0.012 },   // thenar
    { x: rPinky * 0.009, y: -0.019, h: 0.016, w: 0.011 },   // hypothenar
  ];
  for (const pd of padData) {
    const padGeo = new THREE.BoxGeometry(pd.w, pd.h, 0.0020);
    const pad = new THREE.Mesh(padGeo, materials.joint);
    pad.position.set(pd.x, pd.y, -0.0075);
    pad.castShadow = true;
    handGroup.add(pad);
    palmarPads.push(pad);
  }

  // ════════════════════════════════════════════════════════════
  // 3. SCULPTED WHITE CERAMIC DORSAL METACARPAL PLATE
  // ════════════════════════════════════════════════════════════
  const dorsalArmor = createDorsalPlate(materials);
  handGroup.add(dorsalArmor);

  // Precision micro-fasteners on dorsal plate corners
  for (const fX of [-0.013, 0.013]) {
    for (const fY of [-0.007, -0.029]) {
      const screwGeo = new THREE.CylinderGeometry(0.0009, 0.0009, 0.0014, 6);
      screwGeo.rotateX(Math.PI / 2);
      const screw = new THREE.Mesh(screwGeo, materials.joint);
      screw.position.set(fX, fY, 0.0115);
      handGroup.add(screw);
    }
  }

  // Signature Purple Telemetry Capsule on Dorsal Plate
  const ledBezelGeo = new THREE.BoxGeometry(0.0075, 0.0028, 0.0012);
  const ledBezel = new THREE.Mesh(ledBezelGeo, materials.metallic);
  ledBezel.position.set(0, -0.0055, 0.0120);
  handGroup.add(ledBezel);

  const ledGeo = new THREE.BoxGeometry(0.0055, 0.0014, 0.0016);
  const ledMesh = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledMesh.name = 'HandTelemetryLED';
  ledMesh.position.set(0, -0.0055, 0.0122);
  handGroup.add(ledMesh);
  ledMeshes.push(ledMesh);

  const ledBloomGeo = new THREE.BoxGeometry(0.0070, 0.0024, 0.0020);
  const ledBloom = new THREE.Mesh(ledBloomGeo, materials.purpleBloom);
  ledBloom.position.copy(ledMesh.position);
  handGroup.add(ledBloom);

  // ════════════════════════════════════════════════════════════
  // 4. METACARPOPHALANGEAL (MCP) KNUCKLE PINS
  //    Distinct dark transverse hinge pins bridging each knuckle arch.
  // ════════════════════════════════════════════════════════════
  for (const spec of FINGER_SPECS) {
    // Main knuckle barrel
    const kGeo = new THREE.CylinderGeometry(0.0036, 0.0036, 0.009, 16);
    kGeo.rotateZ(Math.PI / 2);
    const knuckle = new THREE.Mesh(kGeo, materials.joint);
    knuckle.position.set(spec.spreadX, spec.offsetY + 0.002, spec.offsetZ);
    knuckle.castShadow = true;
    handGroup.add(knuckle);
    knuckles.push(knuckle);

    // Metallic end caps & socket bezels
    for (const cSide of [-1, 1]) {
      const capGeo = new THREE.CylinderGeometry(0.0041, 0.0041, 0.0010, 14);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, materials.metallic);
      cap.position.set(
        spec.spreadX + cSide * 0.0050,
        spec.offsetY + 0.002,
        spec.offsetZ
      );
      handGroup.add(cap);
      knuckleCaps.push(cap);
    }

    // Small arc armor bridge over each MCP knuckle with metallic crest
    const bridgeGeo = new THREE.CylinderGeometry(
      0.0048, 0.0048, 0.0075, 12, 1, false,
      -Math.PI * 0.50, Math.PI * 1.0
    );
    bridgeGeo.rotateZ(Math.PI / 2);
    const bridge = new THREE.Mesh(bridgeGeo, materials.armor);
    bridge.position.set(spec.spreadX, spec.offsetY + 0.003, spec.offsetZ + 0.0015);
    handGroup.add(bridge);

    const bridgeRimGeo = new THREE.BoxGeometry(0.0075, 0.0008, 0.0012);
    const bridgeRim = new THREE.Mesh(bridgeRimGeo, materials.metallic);
    bridgeRim.position.set(spec.spreadX, spec.offsetY + 0.0055, spec.offsetZ + 0.002);
    handGroup.add(bridgeRim);
  }

  // ════════════════════════════════════════════════════════════
  // 5. FINGERS (4 × articulated with 3 segments)
  // ════════════════════════════════════════════════════════════
  const indexFinger  = createFinger(FINGER_SPECS[0], side, materials);
  const middleFinger = createFinger(FINGER_SPECS[1], side, materials);
  const ringFinger   = createFinger(FINGER_SPECS[2], side, materials);
  const littleFinger = createFinger(FINGER_SPECS[3], side, materials);

  handGroup.add(indexFinger.group);
  handGroup.add(middleFinger.group);
  handGroup.add(ringFinger.group);
  handGroup.add(littleFinger.group);

  // ════════════════════════════════════════════════════════════
  // 6. OPPOSABLE THUMB
  // ════════════════════════════════════════════════════════════
  const thumb = createThumb(side, materials);
  handGroup.add(thumb.group);

  // Store palmar pads on distal phalanges for exploded-view animation
  for (const finger of [indexFinger, middleFinger, ringFinger, littleFinger]) {
    if (finger.distal.padMesh) {
      finger.distal.padMesh.userData.baseZ = finger.distal.padMesh.position.z;
      palmarPads.push(finger.distal.padMesh);
    }
    if (finger.proximal.hingeMesh) {
      finger.proximal.hingeMesh.userData.baseZ = finger.proximal.hingeMesh.position.z;
      knuckleCaps.push(...(finger.proximal.hingeCaps ?? []));
    }
  }

  return {
    group: handGroup,
    palmChassis,
    dorsalArmor,
    carpalCuff,
    thumb,
    indexFinger,
    middleFinger,
    ringFinger,
    pinkyFinger:  littleFinger,   // alias kept for ArmAnimationController compatibility
    littleFinger,
    knuckles,
    knuckleCaps,
    palmarPads,
    ledMeshes,
  };
}
