import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { createFinger, createThumb, FingerNodes, ThumbNodes, FingerSpec } from './Finger';

// ─────────────────────────────────────────────────────────────────────────────
// HAND MODULE — Premium Humanoid Robotic Hand & Metacarpal Architecture
// Meticulously refined to match Reference Blueprint Image:
//
// Architecture:
//   WRIST MOUNTING INTERFACE
//         ↓
//   CARPAL DOCKING CUFF & TRANSITION COLLAR
//         ↓
//   SCULPTED WHITE CERAMIC METACARPAL DORSAL SHELL
//     - Contoured carpal-to-knuckle taper (35mm carpal → 45mm knuckle arch)
//     - Compound-camber aerodynamic dorsal arch
//     - Beveled wrap-around flanks enclosing internal mechanics
//     - Precision micro-fasteners at corners
//     - Cybernetic purple telemetry status capsule
//         ↓
//   PROMINENT DARK SPHERICAL THENAR KNUCKLE JOINT (radial thumb base)
//         ↓
//   4 MCP TRANSVERSE HINGE PINS + METALLIC END CAPS
//         ↓
//   4 ARTICULATED WHITE FINGERS (natural athletic resting cascade)
//         ↓
//   OPPOSABLE ARTICULATED THUMB
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
// FINGER SPECIFICATIONS — Athletic Humanoid Scale
// Calibrated so middle finger tip extends ~128mm from carpal joint.
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// FINGER SPECIFICATIONS BUILDER — Athletic Humanoid Scale
// Calibrated with bilateral symmetry: radial (+X for left, -X for right)
// ─────────────────────────────────────────────────────────────────────────────
function getFingerSpecs(side: -1 | 1): FingerSpec[] {
  // Radial sign: for side=1 (right hand), radial/thumb is at -X, so radialSign = -1.
  // For side=-1 (left hand), radial/thumb is at +X, so radialSign = +1.
  const radial = -side;

  return [
    {
      name: 'Index',
      spreadX: radial * 0.0185,
      offsetY: -0.0405,
      offsetZ:  0.0022,
      proximalLength: 0.035,
      middleLength:   0.023,
      distalLength:   0.017,
      proximalRadius: 0.0054,  // Refined: reduced from 0.0060 for slimmer appearance
      middleRadius:   0.0047,  // Refined: reduced from 0.0052
      distalRadius:   0.0040,  // Refined: reduced from 0.0044
    },
    {
      name: 'Middle',
      spreadX: radial * 0.0062,
      offsetY: -0.0425,
      offsetZ:  0.0030,
      proximalLength: 0.039,
      middleLength:   0.026,
      distalLength:   0.018,
      proximalRadius: 0.0058,  // Refined: reduced from 0.0064
      middleRadius:   0.0050,  // Refined: reduced from 0.0055
      distalRadius:   0.0042,  // Refined: reduced from 0.0046
    },
    {
      name: 'Ring',
      spreadX: -radial * 0.0062,
      offsetY: -0.0415,
      offsetZ:  0.0024,
      proximalLength: 0.036,
      middleLength:   0.024,
      distalLength:   0.017,
      proximalRadius: 0.0054,  // Refined: reduced from 0.0060
      middleRadius:   0.0047,  // Refined: reduced from 0.0052
      distalRadius:   0.0040,  // Refined: reduced from 0.0044
    },
    {
      name: 'Little',
      spreadX: -radial * 0.0185,
      offsetY: -0.0390,
      offsetZ:  0.0016,
      proximalLength: 0.028,
      middleLength:   0.019,
      distalLength:   0.014,
      proximalRadius: 0.0048,  // Refined: reduced from 0.0053
      middleRadius:   0.0041,  // Refined: reduced from 0.0045
      distalRadius:   0.0036,  // Refined: reduced from 0.0039
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCULPTED DORSAL METACARPAL SHELL
// Compound-camber white ceramic shield wrapping seamlessly over the hand dorsum.
// Tapers from 41mm carpal neck to 52mm knuckle arch with scalloped knuckle hoods
// and a sculpted thenar socket cutout cradling the radial thumb base.
// ─────────────────────────────────────────────────────────────────────────────
function createDorsalPlate(side: -1 | 1, materials: RobotMaterialPalette): THREE.Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const numY = 14;
  const numX = 13;

  for (let iy = 0; iy < numY; iy++) {
    const v = iy / (numY - 1);

    // Dynamic width taper: starts at 41mm at wrist, expands to 52mm at knuckles
    const baseHw = 0.0205 + 0.0055 * Math.sin(v * Math.PI * 0.72);

    for (let ix = 0; ix < numX; ix++) {
      const u = ix / (numX - 1);
      // Normalized span across width [-1, 1]
      const nx = (u - 0.5) * 2.0;

      // Inverted radial coordinate: +1 is ALWAYS the radial (index/thumb) flank, -1 is ulnar (pinky) flank
      const r = -side * nx;

      // Sculpted thenar contour on radial margin
      let socketNotch = 0;
      if (r > 0.65 && v > 0.20 && v < 0.60) {
        const socketPhase = (v - 0.20) / (0.60 - 0.20);
        socketNotch = -Math.sin(socketPhase * Math.PI) * 0.0018;
      }

      const hw = baseHw + (r > 0 ? socketNotch : 0);
      const x = nx * hw;

      // Knuckle line at the distal edge (v = 1.0)
      // Balanced athletic proportions matching blueprint
      const baseKnuckleY = -0.0380 - 0.0016 * Math.cos(r * 1.35) + 0.0005 * r;
      // Scalloped knuckle hoods: 4 subtle arches conforming smoothly over the 4 finger MCP knuckles
      const scallop = -0.0010 * Math.cos(nx * 3.8 * Math.PI) * (1.0 - 0.25 * nx * nx);
      const knuckleY = baseKnuckleY + scallop;

      // Continuous, smooth interpolation from carpal collar (-0.004m) to knuckle margin
      const y = -0.0040 + v * (knuckleY - (-0.0040));

      // Aerodynamic compound-camber dorsal arch
      const arch = Math.cos(nx * Math.PI * 0.46) * 0.0048;
      // Flank curvature curling smoothly along Z toward palmar side
      const flankDrop = Math.pow(Math.abs(nx), 2.6) * 0.0084;

      // Z depth profile: crowned dorsum falling off to side flanks
      const z = 0.0092 + arch * (0.84 + 0.16 * Math.sin(v * Math.PI)) - flankDrop;

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
  // 1. CARPAL INTERFACE BRACKET & COLLAR
  //    Distinct dark titanium mechanical socket breaking wrist & hand
  // ════════════════════════════════════════════════════════════
  const cuffGeo = new THREE.CylinderGeometry(0.0210, 0.0218, 0.005, 28);
  const carpalCuff = new THREE.Mesh(cuffGeo, materials.joint);
  carpalCuff.name = 'HandCarpalCuff';
  carpalCuff.position.set(0, -0.0025, 0);
  carpalCuff.castShadow = true;
  handGroup.add(carpalCuff);

  const cuffRimGeo = new THREE.TorusGeometry(0.0215, 0.0009, 6, 28);
  cuffRimGeo.rotateX(Math.PI / 2);
  const cuffRim = new THREE.Mesh(cuffRimGeo, materials.metallic);
  cuffRim.position.set(0, -0.0025, 0);
  handGroup.add(cuffRim);

  // White ceramic carpal mantle ring
  const carpalMantleGeo = new THREE.CylinderGeometry(0.0212, 0.0220, 0.003, 28);
  const carpalMantle = new THREE.Mesh(carpalMantleGeo, materials.armor);
  carpalMantle.position.set(0, -0.0040, 0.001);
  handGroup.add(carpalMantle);

  // ════════════════════════════════════════════════════════════
  // 2. INTERNAL TITANIUM CHASSIS CORE & TRANSVERSE KNUCKLE BAR
  //    Refined for more elegant proportions
  // ════════════════════════════════════════════════════════════
  const palmGeo = new THREE.BoxGeometry(0.036, 0.030, 0.011);  // Refined: slightly narrower and slimmer
  const palmChassis = new THREE.Mesh(palmGeo, materials.joint);
  palmChassis.name = 'PalmChassis';
  palmChassis.position.set(0, -0.020, -0.001);
  palmChassis.castShadow = true;
  palmChassis.receiveShadow = true;
  handGroup.add(palmChassis);

  // Refined Transverse Knuckle Chassis Bar - slimmer and more elegant
  const knuckleBarGeo = new THREE.BoxGeometry(0.046, 0.0052, 0.009);  // Refined dimensions
  const knuckleBar = new THREE.Mesh(knuckleBarGeo, materials.joint);
  knuckleBar.name = 'TransverseKnuckleBar';
  knuckleBar.position.set(0, -0.0380, 0.0018);
  knuckleBar.castShadow = true;
  handGroup.add(knuckleBar);

  // Refined CNC weight-reduction pockets - smaller and more subtle
  for (let p = 0; p < 3; p++) {
    const pockGeo = new THREE.BoxGeometry(0.008, 0.010, 0.0028);  // Refined: smaller pockets
    const pock = new THREE.Mesh(pockGeo, materials.joint);
    pock.position.set((p - 1) * 0.010, -0.020, -0.0068);
    handGroup.add(pock);
  }

  // ── Palmar Tactile Friction Grip Pads ─────────────────────────────────────
  const rThumb = -side;
  const rPinky = side;
  const padData = [
    { x: rThumb * 0.010, y: -0.019, h: 0.020, w: 0.015 }, // thenar pad
    { x: rPinky * 0.010, y: -0.022, h: 0.018, w: 0.014 }, // hypothenar pad
  ];
  for (const pd of padData) {
    const padGeo = new THREE.BoxGeometry(pd.w, pd.h, 0.0024);
    const pad = new THREE.Mesh(padGeo, materials.joint);
    pad.position.set(pd.x, pd.y, -0.0075);
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
    { x: -0.0150, y: -0.008, z: 0.0108 },
    { x:  0.0150, y: -0.008, z: 0.0108 },
    { x: -0.0165, y: -0.031, z: 0.0100 },
    { x:  0.0165, y: -0.031, z: 0.0100 },
  ];
  for (const f of fastenerCoords) {
    const screwGeo = new THREE.CylinderGeometry(0.0009, 0.0009, 0.0016, 6);
    screwGeo.rotateX(Math.PI / 2);
    const screw = new THREE.Mesh(screwGeo, materials.joint);
    screw.position.set(f.x, f.y, f.z);
    handGroup.add(screw);

    const washerGeo = new THREE.TorusGeometry(0.0012, 0.0003, 6, 12);
    washerGeo.rotateX(Math.PI / 2);
    const washer = new THREE.Mesh(washerGeo, materials.metallic);
    washer.position.copy(screw.position);
    handGroup.add(washer);
  }

  // Signature Purple Telemetry Status Capsule on upper dorsum
  const ledBezelGeo = new THREE.BoxGeometry(0.008, 0.0025, 0.0012);
  const ledBezel = new THREE.Mesh(ledBezelGeo, materials.metallic);
  ledBezel.position.set(0, -0.008, 0.0124);
  handGroup.add(ledBezel);

  const ledGeo = new THREE.BoxGeometry(0.006, 0.0012, 0.0016);
  const ledMesh = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledMesh.name = 'HandTelemetryLED';
  ledMesh.position.set(0, -0.008, 0.0127);
  handGroup.add(ledMesh);
  ledMeshes.push(ledMesh);

  // ════════════════════════════════════════════════════════════
  // 4. METACARPOPHALANGEAL (MCP) KNUCKLE PINS
  //    Refined for more elegant mechanical appearance
  // ════════════════════════════════════════════════════════════
  const fingerSpecs = getFingerSpecs(side);

  for (const spec of fingerSpecs) {
    // Refined main knuckle barrel - slimmer profile
    const kGeo = new THREE.CylinderGeometry(0.0036, 0.0036, 0.0090, 20);  // Refined dimensions
    kGeo.rotateZ(Math.PI / 2);
    const knuckle = new THREE.Mesh(kGeo, materials.joint);
    knuckle.position.set(spec.spreadX, spec.offsetY + 0.0010, spec.offsetZ);
    knuckle.castShadow = true;
    handGroup.add(knuckle);
    knuckles.push(knuckle);

    // Refined precision metallic end caps - more subtle
    for (const cSide of [-1, 1]) {
      const capGeo = new THREE.CylinderGeometry(0.0044, 0.0044, 0.0008, 18);  // Refined
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, materials.metallic);
      cap.position.set(
        spec.spreadX + cSide * 0.0048,
        spec.offsetY + 0.0010,
        spec.offsetZ
      );
      handGroup.add(cap);
      knuckleCaps.push(cap);

      // Refined inner titanium cap hub
      const capHubGeo = new THREE.CylinderGeometry(0.0023, 0.0023, 0.0010, 14);  // Refined
      capHubGeo.rotateZ(Math.PI / 2);
      const capHub = new THREE.Mesh(capHubGeo, materials.joint);
      capHub.position.copy(cap.position);
      handGroup.add(capHub);
    }
  }

  // ════════════════════════════════════════════════════════════
  // 5. FINGERS (4 × articulated with 3 segments)
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
  // 6. OPPOSABLE ARTICULATED THUMB
  //    Nestled into thenar margin with prominent spherical knuckle
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
