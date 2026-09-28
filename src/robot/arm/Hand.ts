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
      spreadX: radial * 0.0225,
      offsetY: -0.0502,
      offsetZ:  0.0022,
      proximalLength: 0.0415,
      middleLength:   0.0268,
      distalLength:   0.0198,
      proximalRadius: 0.0064,
      middleRadius:   0.0056,
      distalRadius:   0.0048,
    },
    {
      name: 'Middle',
      spreadX: radial * 0.0070,
      offsetY: -0.0532,
      offsetZ:  0.0035,
      proximalLength: 0.0485,
      middleLength:   0.0318,
      distalLength:   0.0232,
      proximalRadius: 0.0068,
      middleRadius:   0.0060,
      distalRadius:   0.0051,
    },
    {
      name: 'Ring',
      spreadX: -radial * 0.0085,
      offsetY: -0.0514,
      offsetZ:  0.0025,
      proximalLength: 0.0442,
      middleLength:   0.0286,
      distalLength:   0.0208,
      proximalRadius: 0.0063,
      middleRadius:   0.0055,
      distalRadius:   0.0047,
    },
    {
      name: 'Little',
      spreadX: -radial * 0.0235,
      offsetY: -0.0465,
      offsetZ:  0.0010,
      proximalLength: 0.0332,
      middleLength:   0.0206,
      distalLength:   0.0152,
      proximalRadius: 0.0054,
      middleRadius:   0.0046,
      distalRadius:   0.0039,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCULPTED DORSAL METACARPAL ARMOR SHELL
// Aerodynamic ceramic shield with true anatomical transverse arch,
// 4 metacarpal ray ridges, protective knuckle hoods, and high thenar trunnion cradle.
// ─────────────────────────────────────────────────────────────────────────────
function getKnuckleMarginY(r: number): number {
  // Continuous smooth anatomical metacarpal arch:
  // Peaks at middle finger (r ≈ 0.18), gently sloping to index on radial side and pinky on ulnar side
  // Zero jagged notches or sawteeth!
  const base = -0.0495;
  const arch = 0.0035 * Math.cos(r * Math.PI * 0.42);
  return base + arch;
}

function createDorsalPlate(side: -1 | 1, materials: RobotMaterialPalette): THREE.Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const numY = 24; // longitudinal rings from carpal collar to knuckles
  const numX = 22; // transverse contour points per row

  for (let iy = 0; iy < numY; iy++) {
    const v = iy / (numY - 1);

    // Dynamic width taper: starts at 48mm at carpal collar, smoothly flares to 56mm at knuckles
    const baseHw = 0.0240 + 0.0045 * Math.sin(v * Math.PI * 0.75);

    for (let ix = 0; ix < numX; ix++) {
      const u = ix / (numX - 1);
      // Normalized span across width [-1, 1]
      const nx = (u - 0.5) * 2.0;

      // Inverted radial coordinate: +1 is ALWAYS the radial (thumb/index) flank, -1 is ulnar (pinky) flank
      const r = -side * nx;

      // Precision thenar socket clearance on radial flank (v in [0.08, 0.42])
      let socketNotch = 0;
      if (r > 0.55 && v > 0.08 && v < 0.42) {
        const socketPhase = (v - 0.08) / (0.42 - 0.08);
        socketNotch = -Math.sin(socketPhase * Math.PI) * 0.0022;
      }

      const hw = baseHw + (r > 0 ? socketNotch : 0);
      const x = nx * hw;

      // True anatomical distal knuckle margin (calibrated to finger MCP heights)
      const knuckleY = getKnuckleMarginY(r);

      // Continuous interpolation from carpal collar (-0.0010m) to knuckle margin
      const y = -0.0010 + v * (knuckleY - (-0.0010));

      // Subtle Metacarpal Ray Crests (gentle organic ridges leading to each finger)
      const ray1 = Math.exp(-Math.pow((r - 0.75) / 0.20, 2)) * 0.0006; // Index ray
      const ray2 = Math.exp(-Math.pow((r - 0.20) / 0.20, 2)) * 0.0008; // Middle ray
      const ray3 = Math.exp(-Math.pow((r - (-0.28)) / 0.20, 2)) * 0.0007; // Ring ray
      const ray4 = Math.exp(-Math.pow((r - (-0.80)) / 0.20, 2)) * 0.0005; // Little ray
      const metacarpalRays = (ray1 + ray2 + ray3 + ray4) * Math.sin(v * Math.PI * 0.85);

      // Aerodynamic compound-camber dorsal arch
      const crownArch = Math.cos(nx * Math.PI * 0.44) * 0.0050;
      // Flank curvature curling smoothly toward the palmar side
      const flankDrop = Math.pow(Math.abs(nx), 2.5) * 0.0085;

      // Z depth profile: crowned dorsum falling off to side flanks
      const z = 0.0120 + crownArch * (0.88 + 0.12 * Math.sin(v * Math.PI)) + metacarpalRays - flankDrop;

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
  // 4. METACARPOPHALANGEAL (MCP) KNUCKLE ASSEMBLIES
  //    Semi-recessed dark titanium joint barrels nested beneath dorsal shield
  // ════════════════════════════════════════════════════════════
  const fingerSpecs = getFingerSpecs(side);

  for (const spec of fingerSpecs) {
    const kRadius = spec.proximalRadius * 0.70;
    const kWidth = spec.proximalRadius * 1.76;

    // Transverse knuckle barrel
    const kGeo = new THREE.CylinderGeometry(kRadius, kRadius, kWidth, 20);
    kGeo.rotateZ(Math.PI / 2);
    const knuckle = new THREE.Mesh(kGeo, materials.joint);
    knuckle.position.set(spec.spreadX, spec.offsetY, spec.offsetZ);
    knuckle.castShadow = true;
    handGroup.add(knuckle);
    knuckles.push(knuckle);

    // Precision flush metallic pivot caps with micro hex detail
    const capRadius = spec.proximalRadius * 0.72;
    const capX = kWidth * 0.50 + 0.0003;
    for (const cSide of [-1, 1]) {
      const capGeo = new THREE.CylinderGeometry(capRadius, capRadius, 0.0007, 18);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, materials.metallic);
      cap.position.set(
        spec.spreadX + cSide * capX,
        spec.offsetY,
        spec.offsetZ
      );
      handGroup.add(cap);
      knuckleCaps.push(cap);

      // Inner micro hub pin
      const capHubGeo = new THREE.CylinderGeometry(capRadius * 0.48, capRadius * 0.48, 0.0009, 12);
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
