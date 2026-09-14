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
// Middle fingertip ≈ 130 mm from wrist virtual centre.
// ─────────────────────────────────────────────────────────────────────────────
const FINGER_SPECS: FingerSpec[] = [
  {
    name: 'Index',
    spreadX: -0.0208,
    offsetY: -0.050,
    offsetZ:  0.003,
    proximalLength: 0.040,
    middleLength:   0.025,
    distalLength:   0.018,
    proximalRadius: 0.0056,
    middleRadius:   0.0048,
    distalRadius:   0.0040,
  },
  {
    name: 'Middle',
    spreadX: -0.0069,
    offsetY: -0.053,
    offsetZ:  0.004,
    proximalLength: 0.044,
    middleLength:   0.028,
    distalLength:   0.019,
    proximalRadius: 0.0060,
    middleRadius:   0.0052,
    distalRadius:   0.0044,
  },
  {
    name: 'Ring',
    spreadX:  0.0069,
    offsetY: -0.051,
    offsetZ:  0.003,
    proximalLength: 0.041,
    middleLength:   0.025,
    distalLength:   0.018,
    proximalRadius: 0.0056,
    middleRadius:   0.0048,
    distalRadius:   0.0040,
  },
  {
    name: 'Little',
    spreadX:  0.0208,
    offsetY: -0.046,
    offsetZ:  0.001,
    proximalLength: 0.032,
    middleLength:   0.020,
    distalLength:   0.015,
    proximalRadius: 0.0050,
    middleRadius:   0.0042,
    distalRadius:   0.0035,
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
  const ySteps  = [-0.006, -0.014, -0.024, -0.034, -0.042, -0.050];
  const hwSteps = [ 0.020,  0.024,  0.026,  0.027,  0.026,  0.023];
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
      const arch = Math.cos((x / hw) * (Math.PI * 0.44)) * 0.0052;
      const z    = 0.010 + arch * (0.80 + 0.20 * Math.sin(v * Math.PI));

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
  // 1. CARPAL INTERFACE CUFF — mates with Wrist distal plate
  // ════════════════════════════════════════════════════════════
  const cuffGeo = new THREE.BoxGeometry(0.042, 0.007, 0.024);
  const carpalCuff = new THREE.Mesh(cuffGeo, materials.joint);
  carpalCuff.name = 'HandCarpalCuff';
  carpalCuff.position.set(0, -0.004, 0);
  carpalCuff.castShadow = true;
  handGroup.add(carpalCuff);

  // Carpal cuff rim
  const cuffRimGeo = new THREE.BoxGeometry(0.0444, 0.0028, 0.0264);
  const cuffRim = new THREE.Mesh(cuffRimGeo, materials.joint);
  cuffRim.position.set(0, -0.006, 0);
  handGroup.add(cuffRim);

  // ════════════════════════════════════════════════════════════
  // 2. TITANIUM PALM CHASSIS — structural CNC core
  //    56 mm wide × 50 mm tall × 20 mm deep
  // ════════════════════════════════════════════════════════════
  const palmGeo = new THREE.BoxGeometry(0.056, 0.050, 0.020);
  const palmChassis = new THREE.Mesh(palmGeo, materials.joint);
  palmChassis.name = 'PalmChassis';
  palmChassis.position.set(0, -0.030, 0);
  palmChassis.castShadow = true;
  palmChassis.receiveShadow = true;
  handGroup.add(palmChassis);

  // CNC weight-reduction pockets on palmar face
  for (let p = 0; p < 3; p++) {
    const pockGeo = new THREE.BoxGeometry(0.016, 0.014, 0.005);
    const pock = new THREE.Mesh(pockGeo, materials.joint);
    pock.position.set((p - 1) * 0.017, -0.026, -0.009);
    handGroup.add(pock);
  }

  // ── Palmar Tactile Friction Grip Pads ─────────────────────────────────────
  // Thenar (thumb side) and hypothenar (pinky side) pads
  const padData = [
    { x: -0.015, y: -0.028, h: 0.028, w: 0.018 },   // thenar
    { x:  0.015, y: -0.032, h: 0.024, w: 0.016 },   // hypothenar
  ];
  for (const pd of padData) {
    const padGeo = new THREE.BoxGeometry(pd.w, pd.h, 0.0026);
    const pad = new THREE.Mesh(padGeo, materials.joint);
    pad.position.set(pd.x, pd.y, -0.011);
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
  for (const fX of [-0.018, 0.018]) {
    for (const fY of [-0.010, -0.044]) {
      const screwGeo = new THREE.CylinderGeometry(0.0011, 0.0011, 0.0015, 6);
      screwGeo.rotateX(Math.PI / 2);
      const screw = new THREE.Mesh(screwGeo, materials.joint);
      screw.position.set(fX, fY, 0.014);
      handGroup.add(screw);
    }
  }

  // ════════════════════════════════════════════════════════════
  // 4. METACARPOPHALANGEAL (MCP) KNUCKLE PINS
  //    Distinct dark transverse hinge pins bridging each knuckle arch.
  // ════════════════════════════════════════════════════════════
  for (const spec of FINGER_SPECS) {
    // Main knuckle barrel
    const kGeo = new THREE.CylinderGeometry(0.0044, 0.0044, 0.012, 18);
    kGeo.rotateZ(Math.PI / 2);
    const knuckle = new THREE.Mesh(kGeo, materials.joint);
    knuckle.position.set(spec.spreadX, spec.offsetY + 0.003, spec.offsetZ);
    knuckle.castShadow = true;
    handGroup.add(knuckle);
    knuckles.push(knuckle);

    // Metallic end caps
    for (const cSide of [-1, 1]) {
      const capGeo = new THREE.CylinderGeometry(0.0050, 0.0050, 0.0012, 16);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, materials.metallic);
      cap.position.set(
        spec.spreadX + cSide * 0.0066,
        spec.offsetY + 0.003,
        spec.offsetZ
      );
      handGroup.add(cap);
      knuckleCaps.push(cap);
    }

    // Small arc armor bridge over each MCP knuckle
    const bridgeGeo = new THREE.CylinderGeometry(
      0.0058, 0.0058, 0.009, 14, 1, false,
      -Math.PI * 0.50, Math.PI * 1.0
    );
    bridgeGeo.rotateZ(Math.PI / 2);
    const bridge = new THREE.Mesh(bridgeGeo, materials.armor);
    bridge.position.set(spec.spreadX, spec.offsetY + 0.004, spec.offsetZ + 0.002);
    handGroup.add(bridge);
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
