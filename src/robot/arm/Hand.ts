import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { createFinger, createThumb, FingerNodes, ThumbNodes, FingerSpec } from './Finger';

// ─────────────────────────────────────────────────────────────────────────────
// HAND MODULE — Ultra-Realistic Humanoid Robotic Hand & Metacarpal Architecture
// Re-engineered from CAD Blueprint Panels 7 & 8, Reference Images & True Biomechanics:
//
// Refinements:
//   - Corrected Hand & Finger Scale: Tasteful, authentic athletic volume (+15% scale)
//   - Corrected Thumb Placement: High-mounted origin directly under the carpal collar (Y = -0.0095m)
//   - Zero Spherical Bubbles: Precision cylindrical rotary actuator trunnion with metallic bearing disc
//   - 3D Transverse Knuckle Arch: Middle finger highest/most distal, Little finger lowest
//   - 4 Scalloped Protective Knuckle Hoods & Longitudinal Metacarpal Ray Crests
//   - Seamless Carpal Docking Cuff bridging cleanly into Wrist Module
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
// FINGER SPECIFICATIONS BUILDER — Proportioned Humanoid Mecha Scale (+18%)
// Calibrated with bilateral radial symmetry: radial (+X for left hand, -X for right)
// ─────────────────────────────────────────────────────────────────────────────
function getFingerSpecs(side: -1 | 1): FingerSpec[] {
  // Radial sign: for side=1 (right hand), radial/thumb is at -X, so radial = -1.
  // For side=-1 (left hand), radial/thumb is at +X, so radial = +1.
  const radial = -side;

  return [
    {
      name: 'Index',
      spreadX: radial * 0.0242,
      offsetY: -0.0513,
      offsetZ:  0.0028,
      proximalLength: 0.0436,
      middleLength:   0.0277,
      distalLength:   0.0206,
      proximalRadius: 0.0068,
      middleRadius:   0.0059,
      distalRadius:   0.0051,
    },
    {
      name: 'Middle',
      spreadX: radial * 0.0073,
      offsetY: -0.0543,
      offsetZ:  0.0038,
      proximalLength: 0.0507,
      middleLength:   0.0330,
      distalLength:   0.0242,
      proximalRadius: 0.0073,
      middleRadius:   0.0064,
      distalRadius:   0.0054,
    },
    {
      name: 'Ring',
      spreadX: -radial * 0.0092,
      offsetY: -0.0525,
      offsetZ:  0.0031,
      proximalLength: 0.0460,
      middleLength:   0.0295,
      distalLength:   0.0218,
      proximalRadius: 0.0067,
      middleRadius:   0.0058,
      distalRadius:   0.0050,
    },
    {
      name: 'Little',
      spreadX: -radial * 0.0254,
      offsetY: -0.0466,
      offsetZ:  0.0017,
      proximalLength: 0.0342,
      middleLength:   0.0212,
      distalLength:   0.0159,
      proximalRadius: 0.0057,
      middleRadius:   0.0048,
      distalRadius:   0.0041,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCULPTED DORSAL METACARPAL ARMOR SHELL
// Aerodynamic ceramic shield with true anatomical transverse arch,
// 4 metacarpal ray ridges, protective knuckle hoods, and high thenar trunnion cradle.
// ─────────────────────────────────────────────────────────────────────────────
function getKnuckleMarginY(r: number): number {
  // Base anatomical transverse slope calibrated to scaled finger roots
  const base = -0.0484 + (r < 0.23 ? 0.0073 * Math.pow((0.23 - r) / 1.05, 1.4) : 0.0033 * Math.pow((r - 0.23) / 0.55, 1.3));

  // 4 Scalloped Knuckle Hoods protruding over each MCP knuckle
  const hood0 = Math.exp(-Math.pow((r - 0.75) / 0.16, 2)) * 0.0041; // Index hood -> -0.0496
  const hood1 = Math.exp(-Math.pow((r - 0.23) / 0.17, 2)) * 0.0045; // Middle hood -> -0.0528
  const hood2 = Math.exp(-Math.pow((r - (-0.28)) / 0.16, 2)) * 0.0042; // Ring hood -> -0.0508
  const hood3 = Math.exp(-Math.pow((r - (-0.80)) / 0.15, 2)) * 0.0038; // Little hood -> -0.0449

  // Inter-digital scallops / notches receding proximally between knuckles
  const notch1 = Math.exp(-Math.pow((r - 0.49) / 0.12, 2)) * 0.0030;
  const notch2 = Math.exp(-Math.pow((r - (-0.03)) / 0.13, 2)) * 0.0033;
  const notch3 = Math.exp(-Math.pow((r - (-0.54)) / 0.12, 2)) * 0.0028;

  return base - (hood0 + hood1 + hood2 + hood3) + (notch1 + notch2 + notch3);
}

function createDorsalPlate(side: -1 | 1, materials: RobotMaterialPalette): THREE.Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const numY = 24; // longitudinal rings from carpal collar to knuckles
  const numX = 22; // transverse contour points per row

  for (let iy = 0; iy < numY; iy++) {
    const v = iy / (numY - 1);

    // Dynamic width taper: starts at 52mm at carpal collar, smoothly flares to 63mm at knuckles
    const baseHw = 0.0260 + 0.0056 * Math.sin(v * Math.PI * 0.75);

    for (let ix = 0; ix < numX; ix++) {
      const u = ix / (numX - 1);
      // Normalized span across width [-1, 1]
      const nx = (u - 0.5) * 2.0;

      // Inverted radial coordinate: +1 is ALWAYS the radial (thumb/index) flank, -1 is ulnar (pinky) flank
      const r = -side * nx;

      // Precision circular thenar socket clearance on radial flank (v in [0.08, 0.42])
      let socketNotch = 0;
      if (r > 0.55 && v > 0.08 && v < 0.42) {
        const socketPhase = (v - 0.08) / (0.42 - 0.08);
        socketNotch = -Math.sin(socketPhase * Math.PI) * 0.0026;
      }

      const hw = baseHw + (r > 0 ? socketNotch : 0);
      const x = nx * hw;

      // True anatomical distal knuckle margin (calibrated to finger MCP heights)
      const knuckleY = getKnuckleMarginY(r);

      // Continuous interpolation from carpal collar (-0.0010m) to knuckle margin
      const y = -0.0010 + v * (knuckleY - (-0.0010));

      // 4 Metacarpal Ray Crests (longitudinal structural ridges leading to each knuckle hood)
      const ray1 = Math.exp(-Math.pow((r - 0.75) / 0.16, 2)) * 0.0009; // Index ray
      const ray2 = Math.exp(-Math.pow((r - 0.23) / 0.16, 2)) * 0.0012; // Middle ray
      const ray3 = Math.exp(-Math.pow((r - (-0.28)) / 0.16, 2)) * 0.0011;  // Ring ray
      const ray4 = Math.exp(-Math.pow((r - (-0.80)) / 0.15, 2)) * 0.0008;  // Little ray
      const metacarpalRays = (ray1 + ray2 + ray3 + ray4) * Math.sin(v * Math.PI * 0.85);

      // Aerodynamic compound-camber dorsal arch
      const crownArch = Math.cos(nx * Math.PI * 0.44) * 0.0056;
      // Flank curvature curling smoothly toward the palmar side
      const flankDrop = Math.pow(Math.abs(nx), 2.5) * 0.0102;

      // Z depth profile: crowned dorsum falling off to side flanks
      const z = 0.0124 + crownArch * (0.86 + 0.14 * Math.sin(v * Math.PI)) + metacarpalRays - flankDrop;

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  const stride = numX;
  for (let iy = 0; iy < numY - 1; iy++) {
    for (let ix = 0; ix < numX - 1; ix++) {
      const a = iy * stride + ix;
      const b = (iy + 1) * stride + ix;
      const c = (iy + 1) * stride + (ix + 1);
      const d = iy * stride + (ix + 1);
      indices.push(a, b, d, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
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
  // 1. CARPAL INTERFACE BRACKET & TRANSITION COLLAR
  //    Seamlessly transitions from the wrist trunnion (45mm diameter)
  //    Stage 5 Locked: flush structural integration with wrist faceplate
  // ════════════════════════════════════════════════════════════
  const cuffGeo = new THREE.CylinderGeometry(0.0215, 0.0245, 0.0040, 30);
  const carpalCuff = new THREE.Mesh(cuffGeo, materials.joint);
  carpalCuff.name = 'HandCarpalCuff';
  carpalCuff.position.set(0, -0.0020, 0);
  carpalCuff.castShadow = true;
  handGroup.add(carpalCuff);

  const cuffRimGeo = new THREE.TorusGeometry(0.0240, 0.0009, 6, 30);
  cuffRimGeo.rotateX(Math.PI / 2);
  const cuffRim = new THREE.Mesh(cuffRimGeo, materials.metallic);
  cuffRim.position.set(0, -0.0010, 0);
  handGroup.add(cuffRim);

  // White ceramic carpal mantle ring
  const carpalMantleGeo = new THREE.CylinderGeometry(0.0220, 0.0248, 0.0026, 30);
  const carpalMantle = new THREE.Mesh(carpalMantleGeo, materials.armor);
  carpalMantle.position.set(0, -0.0020, 0.0007);
  handGroup.add(carpalMantle);

  // ════════════════════════════════════════════════════════════
  // 2. INTERNAL TITANIUM CHASSIS CORE & PALMAR PALETTE
  // ════════════════════════════════════════════════════════════
  const palmGeo = new THREE.BoxGeometry(0.0472, 0.0401, 0.0130);
  const palmChassis = new THREE.Mesh(palmGeo, materials.joint);
  palmChassis.name = 'PalmChassis';
  palmChassis.position.set(0, -0.0230, -0.0010);
  palmChassis.castShadow = true;
  palmChassis.receiveShadow = true;
  handGroup.add(palmChassis);

  // Arched Transverse Knuckle Chassis Bar
  const knuckleBarGeo = new THREE.BoxGeometry(0.0590, 0.0060, 0.0112);
  const knuckleBar = new THREE.Mesh(knuckleBarGeo, materials.joint);
  knuckleBar.name = 'TransverseKnuckleBar';
  knuckleBar.position.set(0, -0.0478, 0.0022);
  knuckleBar.castShadow = true;
  handGroup.add(knuckleBar);

  // CNC Weight-reduction pockets along palm chassis
  for (let p = 0; p < 3; p++) {
    const pockGeo = new THREE.BoxGeometry(0.0100, 0.0130, 0.0033);
    const pock = new THREE.Mesh(pockGeo, materials.joint);
    pock.position.set((p - 1) * 0.0130, -0.0248, -0.0080);
    handGroup.add(pock);
  }

  // ── Palmar Tactile Friction Grip Pads (Thenar + Hypothenar) ────────────────
  const rThumb = -side;
  const rPinky = side;
  const padData = [
    { x: rThumb * 0.0135, y: -0.0236, h: 0.0260, w: 0.0188 }, // Thenar pad
    { x: rPinky * 0.0135, y: -0.0270, h: 0.0236, w: 0.0175 }, // Hypothenar pad
    { x: 0,               y: -0.0442, h: 0.0082, w: 0.0448 }, // Transverse MCP palm pad
  ];
  for (const pd of padData) {
    const padGeo = new THREE.BoxGeometry(pd.w, pd.h, 0.0028);
    const pad = new THREE.Mesh(padGeo, materials.joint);
    pad.position.set(pd.x, pd.y, -0.0089);
    pad.castShadow = true;
    handGroup.add(pad);
    palmarPads.push(pad);
  }

  // ════════════════════════════════════════════════════════════
  // 3. SCULPTED WHITE CERAMIC DORSAL METACARPAL SHELL
  // ════════════════════════════════════════════════════════════
  const dorsalArmor = createDorsalPlate(side, materials);
  handGroup.add(dorsalArmor);

  // Precision micro-fasteners on dorsal plate corners (4 hex screws + chrome washers)
  const fastenerCoords = [
    { x: -0.0188, y: -0.0094, z: 0.0135 },
    { x:  0.0188, y: -0.0094, z: 0.0135 },
    { x: -0.0212, y: -0.0401, z: 0.0127 },
    { x:  0.0212, y: -0.0401, z: 0.0127 },
  ];
  for (const f of fastenerCoords) {
    const screwGeo = new THREE.CylinderGeometry(0.0010, 0.0010, 0.0018, 6);
    screwGeo.rotateX(Math.PI / 2);
    const screw = new THREE.Mesh(screwGeo, materials.joint);
    screw.position.set(f.x, f.y, f.z);
    handGroup.add(screw);

    const washerGeo = new THREE.TorusGeometry(0.0014, 0.00035, 6, 12);
    washerGeo.rotateX(Math.PI / 2);
    const washer = new THREE.Mesh(washerGeo, materials.metallic);
    washer.position.copy(screw.position);
    handGroup.add(washer);
  }

  // Signature Cybernetic Purple Telemetry Status Capsule on upper dorsum (Longitudinal Slit matching Reference Image 1)
  const ledX = -side * 0.0041;
  const ledY = -0.0124;
  const ledZ = 0.0178;

  const ledBezelGeo = new THREE.BoxGeometry(0.0026, 0.0104, 0.0014);
  const ledBezel = new THREE.Mesh(ledBezelGeo, materials.metallic);
  ledBezel.position.set(ledX, ledY, ledZ);
  handGroup.add(ledBezel);

  const ledGeo = new THREE.BoxGeometry(0.0014, 0.0085, 0.0016);
  const ledMesh = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledMesh.name = 'HandTelemetryLED';
  ledMesh.position.set(ledX, ledY, ledZ + 0.0003);
  handGroup.add(ledMesh);
  ledMeshes.push(ledMesh);

  // Subtle bloom aura for telemetry LED
  const bloomGeo = new THREE.BoxGeometry(0.0022, 0.0095, 0.0020);
  const bloomMesh = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomMesh.position.copy(ledMesh.position);
  handGroup.add(bloomMesh);

  // Micro sensor dot / fastener adjacent to telemetry capsule (as seen in Reference Image 1)
  const dotX = -side * 0.0092;
  const dotY = -0.0130;
  const dotGeo = new THREE.CylinderGeometry(0.0009, 0.0009, 0.0012, 12);
  dotGeo.rotateX(Math.PI / 2);
  const dotMesh = new THREE.Mesh(dotGeo, materials.joint);
  dotMesh.position.set(dotX, dotY, ledZ + 0.0001);
  handGroup.add(dotMesh);

  const dotPinGeo = new THREE.CylinderGeometry(0.00045, 0.00045, 0.0014, 8);
  dotPinGeo.rotateX(Math.PI / 2);
  const dotPin = new THREE.Mesh(dotPinGeo, materials.metallic);
  dotPin.position.copy(dotMesh.position);
  handGroup.add(dotPin);

  // ════════════════════════════════════════════════════════════
  // 4. METACARPOPHALANGEAL (MCP) KNUCKLE PINS
  //    True 3D Transverse Arch with Metallic Bearing Retainers
  // ════════════════════════════════════════════════════════════
  const fingerSpecs = getFingerSpecs(side);

  for (const spec of fingerSpecs) {
    const kRadius = spec.proximalRadius * 0.72;
    const kWidth = spec.proximalRadius * 1.82;

    // Transverse knuckle barrel
    const kGeo = new THREE.CylinderGeometry(kRadius, kRadius, kWidth, 20);
    kGeo.rotateZ(Math.PI / 2);
    const knuckle = new THREE.Mesh(kGeo, materials.joint);
    knuckle.position.set(spec.spreadX, spec.offsetY, spec.offsetZ);
    knuckle.castShadow = true;
    handGroup.add(knuckle);
    knuckles.push(knuckle);

    // Precision MCP Knuckle Mounting Clevis / Chassis Socket (Stage 1 Mechanical Mount)
    const clevisH = Math.max(0.0040, (-0.0454) - spec.offsetY);
    const clevisGeo = new THREE.BoxGeometry(kWidth * 0.90, clevisH, kRadius * 2.10);
    const clevis = new THREE.Mesh(clevisGeo, materials.joint);
    clevis.name = `MCP_${spec.name}_Clevis`;
    clevis.position.set(
      spec.spreadX,
      spec.offsetY + clevisH * 0.5,
      spec.offsetZ - 0.0007
    );
    clevis.castShadow = true;
    handGroup.add(clevis);

    // Lateral clevis fork cheeks / bearing flanges flanking each knuckle
    const cheekThick = 0.0010;
    const cheekOffset = kWidth * 0.46;
    for (const cSide of [-1, 1]) {
      const cheekGeo = new THREE.BoxGeometry(cheekThick, clevisH * 1.15, kRadius * 2.05);
      const cheek = new THREE.Mesh(cheekGeo, materials.joint);
      cheek.position.set(
        spec.spreadX + cSide * cheekOffset,
        spec.offsetY + clevisH * 0.4,
        spec.offsetZ
      );
      cheek.castShadow = true;
      handGroup.add(cheek);
    }

    // Precision metallic end caps with concentric micro-detailing
    const capRadius = spec.proximalRadius * 0.82;
    const capX = kWidth * 0.50 + 0.0005;
    for (const cSide of [-1, 1]) {
      const capGeo = new THREE.CylinderGeometry(capRadius, capRadius, 0.0010, 18);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, materials.metallic);
      cap.position.set(
        spec.spreadX + cSide * capX,
        spec.offsetY,
        spec.offsetZ
      );
      handGroup.add(cap);
      knuckleCaps.push(cap);

      // Inner dark titanium hub
      const capHubGeo = new THREE.CylinderGeometry(capRadius * 0.52, capRadius * 0.52, 0.0012, 14);
      capHubGeo.rotateZ(Math.PI / 2);
      const capHub = new THREE.Mesh(capHubGeo, materials.joint);
      capHub.position.copy(cap.position);
      handGroup.add(capHub);
    }
  }

  // ════════════════════════════════════════════════════════════
  // 5. ARTICULATED FINGERS (4 × articulated digits)
  // ════════════════════════════════════════════════════════════
  const indexFinger  = createFinger(fingerSpecs[0], side, materials);
  const middleFinger = createFinger(fingerSpecs[1], side, materials);
  const ringFinger   = createFinger(fingerSpecs[2], side, materials);
  const littleFinger = createFinger(fingerSpecs[3], side, materials);

  handGroup.add(indexFinger.group);
  handGroup.add(middleFinger.group);
  handGroup.add(ringFinger.group);
  handGroup.add(littleFinger.group);

  // ════════════════════════════════════════════════════════════
  // 6. OPPOSABLE ARTICULATED ROBOTIC THUMB
  //    High-mounted origin (Y = -0.0095m) with rotary actuator trunnion
  // ════════════════════════════════════════════════════════════
  const thumb = createThumb(side, materials);
  handGroup.add(thumb.group);

  // Store palmar pads & knuckle caps for exploded-view animations
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
    pinkyFinger:  littleFinger,
    littleFinger,
    knuckles,
    knuckleCaps,
    palmarPads,
    ledMeshes,
  };
}
