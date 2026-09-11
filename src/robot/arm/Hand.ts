import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { createFinger, createThumb, FingerNodes, ThumbNodes, FingerSpec } from './Finger';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

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

/**
 * Calibrated anatomical finger specs for athletic humanoid proportions:
 * - Wide, athletic knuckle arch with clean 2.5mm clearance gaps
 * - Proportional finger lengths matching compact athletic palm (no elongated chopsticks)
 * - Muscular phalanx radii giving substantial mechanical volume
 */
const ANATOMICAL_FINGER_SPECS: FingerSpec[] = [
  {
    name: 'Index',
    spreadX: -0.0180,
    offsetY: -0.038,
    offsetZ: 0.002,
    proximalLength: 0.024,
    middleLength: 0.017,
    distalLength: 0.013,
    proximalRadius: 0.0052,
    middleRadius: 0.0046,
    distalRadius: 0.0040,
  },
  {
    name: 'Middle',
    spreadX: -0.0060,
    offsetY: -0.041,
    offsetZ: 0.004,
    proximalLength: 0.026,
    middleLength: 0.019,
    distalLength: 0.014,
    proximalRadius: 0.0055,
    middleRadius: 0.0048,
    distalRadius: 0.0042,
  },
  {
    name: 'Ring',
    spreadX: 0.0060,
    offsetY: -0.039,
    offsetZ: 0.002,
    proximalLength: 0.0245,
    middleLength: 0.0175,
    distalLength: 0.013,
    proximalRadius: 0.0052,
    middleRadius: 0.0046,
    distalRadius: 0.0040,
  },
  {
    name: 'Little',
    spreadX: 0.0180,
    offsetY: -0.036,
    offsetZ: -0.001,
    proximalLength: 0.020,
    middleLength: 0.014,
    distalLength: 0.011,
    proximalRadius: 0.0046,
    middleRadius: 0.0040,
    distalRadius: 0.0034,
  },
];

/**
 * Generates a wide, sculpted white ceramic dorsal metacarpal shield with:
 * - Compound 3D camber (convex arch across X and Y)
 * - Sharp specular longitudinal spine ridge catching brilliant highlights
 * - Wide lateral chamfer flanks wrapping over the titanium chassis sides
 * - Knuckle arch margin following the natural anatomical finger roots
 * - Recessed central light channel for signature violet LED slit
 */
function createSculptedDorsalArmor(material: THREE.Material): THREE.Mesh {
  const positions: number[] = [];
  const normals: number[] = [];

  // Lengthwise slices from proximal carpal border to distal knuckle arch
  const ySteps = [-0.003, -0.010, -0.018, -0.025, -0.032, -0.037];
  const numY = ySteps.length;

  // Broad width profile along Y (flares out across the wide palm to 48mm span)
  const halfWidths = [0.0175, 0.0195, 0.0220, 0.0240, 0.0240, 0.0225];

  // Distal arch offsets (Middle knuckle projects most distal, sides curve back)
  const getDistalY = (normX: number): number => {
    return -0.040 + 0.005 * Math.pow(normX, 2);
  };

  // Helper to add a quad (2 triangles) with computed face normal
  const addQuad = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    p4: [number, number, number]
  ) => {
    const vA = new THREE.Vector3(...p1);
    const vB = new THREE.Vector3(...p2);
    const vC = new THREE.Vector3(...p3);
    const vD = new THREE.Vector3(...p4);

    const cb1 = new THREE.Vector3().subVectors(vC, vB);
    const ab1 = new THREE.Vector3().subVectors(vA, vB);
    cb1.cross(ab1).normalize();

    const cb2 = new THREE.Vector3().subVectors(vD, vC);
    const ab2 = new THREE.Vector3().subVectors(vA, vC);
    cb2.cross(ab2).normalize();

    // Tri 1
    positions.push(...p1, ...p2, ...p3);
    normals.push(cb1.x, cb1.y, cb1.z, cb1.x, cb1.y, cb1.z, cb1.x, cb1.y, cb1.z);

    // Tri 2
    positions.push(...p1, ...p3, ...p4);
    normals.push(cb2.x, cb2.y, cb2.z, cb2.x, cb2.y, cb2.z, cb2.x, cb2.y, cb2.z);
  };

  // Build lengthwise quad strips
  for (let i = 0; i < numY - 1; i++) {
    const y0 = ySteps[i];
    const y1 = i === numY - 2 ? -0.036 : ySteps[i + 1];
    const w0 = halfWidths[i];
    const w1 = halfWidths[i + 1];

    // Longitudinal profile height (peaks at mid-metacarpals)
    const zBase0 = 0.0075 + 0.0022 * Math.sin((i / (numY - 1)) * Math.PI);
    const zBase1 = 0.0075 + 0.0022 * Math.sin(((i + 1) / (numY - 1)) * Math.PI);

    // X coordinates across hand cross-section:
    // Flank skirt (0), Flank bevel (1), Dorsal flat (2), Center trench lip (3)
    const x0 = [-w0, -w0 * 0.78, -w0 * 0.38, -0.0024];
    const x1 = [-w1, -w1 * 0.78, -w1 * 0.38, -0.0024];

    // Corresponding Z heights wrapping deeply over chassis sides
    const z0 = [-0.0060, zBase0 * 0.40, zBase0 * 0.88, zBase0];
    const z1 = [-0.0060, zBase1 * 0.40, zBase1 * 0.88, zBase1];

    // Left side strips (from flank to center)
    for (let c = 0; c < 3; c++) {
      const p1: [number, number, number] = [x0[c], y0, z0[c]];
      const p2: [number, number, number] = [x1[c], y1, z1[c]];
      const p3: [number, number, number] = [x1[c + 1], y1, z1[c + 1]];
      const p4: [number, number, number] = [x0[c + 1], y0, z0[c + 1]];
      addQuad(p1, p2, p3, p4);
    }

    // Right side strips (mirrored from center to flank)
    const rx0 = [0.0024, w0 * 0.38, w0 * 0.78, w0];
    const rx1 = [0.0024, w1 * 0.38, w1 * 0.78, w1];
    const rz0 = [zBase0, zBase0 * 0.88, zBase0 * 0.40, -0.0060];
    const rz1 = [zBase1, zBase1 * 0.88, zBase1 * 0.40, -0.0060];

    for (let c = 0; c < 3; c++) {
      const p1: [number, number, number] = [rx0[c], y0, rz0[c]];
      const p2: [number, number, number] = [rx1[c], y1, rz1[c]];
      const p3: [number, number, number] = [rx1[c + 1], y1, rz1[c + 1]];
      const p4: [number, number, number] = [rx0[c + 1], y0, rz0[c + 1]];
      addQuad(p1, p2, p3, p4);
    }

    // Recessed center groove floor (-0.0024 to +0.0024)
    const floorZ0 = zBase0 - 0.0024;
    const floorZ1 = zBase1 - 0.0024;
    addQuad(
      [-0.0024, y0, floorZ0],
      [-0.0024, y1, floorZ1],
      [0.0024, y1, floorZ1],
      [0.0024, y0, floorZ0]
    );

    // Left groove wall
    addQuad(
      [-0.0024, y0, floorZ0],
      [-0.0024, y0, zBase0],
      [-0.0024, y1, zBase1],
      [-0.0024, y1, floorZ1]
    );

    // Right groove wall
    addQuad(
      [0.0024, y0, zBase0],
      [0.0024, y0, floorZ0],
      [0.0024, y1, floorZ1],
      [0.0024, y1, zBase1]
    );
  }

  // Proximal carpal bevel cap (closing proximal face)
  const pZ = 0.0075;
  const pW = halfWidths[0];
  addQuad(
    [-pW, ySteps[0], -0.0060],
    [pW, ySteps[0], -0.0060],
    [pW * 0.6, ySteps[0], pZ * 0.6],
    [-pW * 0.6, ySteps[0], pZ * 0.6]
  );

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

  const mesh = new THREE.Mesh(geo, material);
  mesh.name = 'DorsalArmorPlate';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * REFINED ROBOTIC HAND ASSEMBLY
 * Transforms previous chunky boxy hands into museum-grade cybernetic mecha hands:
 * - Wide, athletic palm proportion (42mm wide x 34mm long)
 * - Sculpted white ceramic dorsal metacarpal shield with compound 3D camber & central spine ridge
 * - Signature violet emissive neon slit recessed flush into dorsal spine
 * - Seamless carpal transition collar locking directly into wrist clevis
 * - Broad anatomical knuckle arch with cylindrical hinge pins and sculpted ceramic visor cowls
 * - Ergonomic dark palmar traction grip pads (thenar, hypothenar, metacarpals)
 * - Articulated opposable thumb with streamlined thenar swivel bracket
 * - 4 articulated fingers with multi-faceted ceramic armor and natural progressive resting curl
 */
export function createHand(
  side: -1 | 1,
  materials: RobotMaterialPalette
): HandNodes {
  const handGroup = new THREE.Group();
  handGroup.name = side === -1 ? 'LeftHand' : 'RightHand';

  // Full 1.0 scale matching athletic humanoid robot anatomy
  const HAND_SCALE = 1.0;
  handGroup.scale.set(HAND_SCALE, HAND_SCALE, HAND_SCALE);

  const ledMeshes: THREE.Mesh[] = [];
  const knuckles: THREE.Mesh[] = [];
  const knuckleCaps: THREE.Mesh[] = [];
  const palmarPads: THREE.Mesh[] = [];
  const palmJointGroup = new THREE.Group();

  // ==========================================
  // 1. DARK TITANIUM PALM CHASSIS (Wide Athletic Monocoque)
  // ==========================================
  // Widths calibrated to knuckle arch: 35mm at carpal, 46mm at knuckles, 34mm length
  const chassisShape = new THREE.Shape();
  const topW = 0.0175;
  const botW = 0.0230;
  const len = 0.034;

  chassisShape.moveTo(-topW, 0);
  chassisShape.lineTo(topW, 0);
  chassisShape.lineTo(botW, -len);
  chassisShape.lineTo(-botW, -len);
  chassisShape.closePath();

  const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, {
    depth: 0.015,
    bevelEnabled: true,
    bevelThickness: 0.0020,
    bevelSize: 0.0015,
    bevelSegments: 2,
  });
  chassisGeo.center();

  const palmChassis = new THREE.Mesh(chassisGeo, materials.joint);
  palmChassis.name = 'Palm';
  palmChassis.position.set(0, -0.021, -0.002);
  palmChassis.castShadow = true;
  palmChassis.receiveShadow = true;
  palmJointGroup.add(palmChassis);

  // ==========================================
  // 2. SCULPTED CERAMIC DORSAL SHIELD WITH COMPOUND 3D CAMBER
  // ==========================================
  const dorsalArmor = createSculptedDorsalArmor(materials.armor);
  dorsalArmor.position.set(0, 0, 0.003);
  handGroup.add(dorsalArmor);

  // ==========================================
  // 3. SIGNATURE VIOLET EMISSIVE LED ACCENT SLIT
  // (Flush mounted in sculpted dorsal armor channel)
  // ==========================================
  const dorsalLedGeo = new THREE.BoxGeometry(0.0022, 0.022, 0.0022);
  const dorsalLed = new THREE.Mesh(dorsalLedGeo, materials.purpleEmissive);
  dorsalLed.name = 'DorsalLed';
  dorsalLed.position.set(0, -0.019, 0.0088);
  handGroup.add(dorsalLed);
  ledMeshes.push(dorsalLed);

  // Titanium bezel end-brackets for the LED slit
  for (const bY of [-0.008, -0.030]) {
    const bezelGeo = new THREE.BoxGeometry(0.0032, 0.0022, 0.0024);
    const bezel = new THREE.Mesh(bezelGeo, materials.joint);
    bezel.position.set(0, bY, 0.0088);
    palmJointGroup.add(bezel);
  }

  // ==========================================
  // 4. INTEGRATED CARPAL WRIST TRANSITION COLLAR & SPIGOT
  // (Seamless transition from wrist clevis into wide palm)
  // ==========================================
  // Structural carpal spigot inserting firmly into wrist clevis socket
  const carpalStemGeo = new THREE.CylinderGeometry(0.019, 0.021, 0.014, 24);
  const carpalStem = new THREE.Mesh(carpalStemGeo, materials.joint);
  carpalStem.position.set(0, 0.005, 0.000);
  carpalStem.castShadow = true;
  palmJointGroup.add(carpalStem);

  // Beveled elliptical carpal cuff collar
  const cuffGeo = new THREE.CylinderGeometry(0.020, 0.022, 0.008, 28);
  const carpalCuff = new THREE.Mesh(cuffGeo, materials.joint);
  carpalCuff.scale.set(1.0, 1.0, 0.76);
  carpalCuff.position.set(0, -0.002, 0.001);
  carpalCuff.castShadow = true;
  palmJointGroup.add(carpalCuff);

  // Concentric mechanical transition trim ring
  const carpalTrimGeo = new THREE.TorusGeometry(0.0195, 0.0014, 8, 28);
  const carpalTrim = new THREE.Mesh(carpalTrimGeo, materials.joint);
  carpalTrim.scale.set(1.0, 0.76, 1.0);
  carpalTrim.rotation.x = Math.PI / 2;
  carpalTrim.position.set(0, -0.001, 0.001);
  palmJointGroup.add(carpalTrim);

  // ==========================================
  // 5. SEGMENTED DARK PALMAR TRACTION GRIP PADS (-Z Face)
  // ==========================================
  const palmarPadsTemp = new THREE.Group();

  // A. Thenar Eminence Pad (Medial thumb base cushion)
  const thenarGeo = new THREE.BoxGeometry(0.013, 0.018, 0.0030);
  const thenarPad = new THREE.Mesh(thenarGeo, materials.joint);
  thenarPad.position.set(-side * 0.010, -0.018, -0.0095);
  thenarPad.rotation.z = -side * 0.14;
  palmarPadsTemp.add(thenarPad);

  // B. Hypothenar Eminence Pad (Lateral palm runner)
  const hypoGeo = new THREE.BoxGeometry(0.011, 0.022, 0.0030);
  const hypoPad = new THREE.Mesh(hypoGeo, materials.joint);
  hypoPad.position.set(side * 0.011, -0.021, -0.0095);
  hypoPad.rotation.z = side * 0.06;
  palmarPadsTemp.add(hypoPad);

  // C. Metacarpal Grip Cushion Tiles (Under each knuckle base)
  ANATOMICAL_FINGER_SPECS.forEach((spec) => {
    const posX = side * spec.spreadX;
    const mcpPadGeo = new THREE.BoxGeometry(0.0075, 0.0075, 0.0026);
    const mcpPad = new THREE.Mesh(mcpPadGeo, materials.joint);
    mcpPad.position.set(posX, spec.offsetY + 0.009, -0.0095);
    palmarPadsTemp.add(mcpPad);
  });

  const mergedPalmarPads = mergeGroupMeshesByMaterial(palmarPadsTemp, materials.joint, 'PalmarPads_Merged', false);
  if (mergedPalmarPads) {
    handGroup.add(mergedPalmarPads);
    palmarPads.push(mergedPalmarPads);
  }

  // ==========================================
  // 6. MCP KNUCKLE HINGES & SCULPTED PROTECTOR HOODS (True Anatomical Arch)
  // ==========================================
  const knuckleCapsTemp = new THREE.Group();

  ANATOMICAL_FINGER_SPECS.forEach((spec) => {
    const posX = side * spec.spreadX;

    // Flush titanium MCP hinge pin along transverse X axis
    const pinRad = spec.proximalRadius * 0.82;
    const pinLen = spec.proximalRadius * 1.50;
    const knuckleGeo = new THREE.CylinderGeometry(pinRad, pinRad, pinLen, 14);
    const knuckleMesh = new THREE.Mesh(knuckleGeo, materials.joint);
    knuckleMesh.rotation.z = Math.PI / 2;
    knuckleMesh.position.set(posX, spec.offsetY, spec.offsetZ);
    knuckleMesh.castShadow = true;
    palmJointGroup.add(knuckleMesh);
    knuckles.push(knuckleMesh);

    // Flush lateral micro-bolt caps on MCP hinge pin ends
    for (const bEnd of [-1, 1]) {
      const capEndGeo = new THREE.CylinderGeometry(pinRad * 0.85, pinRad * 0.85, 0.0004, 10);
      const capEndMesh = new THREE.Mesh(capEndGeo, materials.joint);
      capEndMesh.rotation.z = Math.PI / 2;
      capEndMesh.position.set(posX + bEnd * (pinLen * 0.5 + 0.0002), spec.offsetY, spec.offsetZ);
      palmJointGroup.add(capEndMesh);
    }

    // Sculpted ceramic knuckle protector cowl over dorsal face (+Z)
    // Curvature wraps over the hinge gap seamlessly continuing the dorsal shield
    const cowlRadius = spec.proximalRadius * 1.10;
    const cowlGeo = new THREE.CylinderGeometry(
      cowlRadius,
      cowlRadius * 0.94,
      spec.proximalRadius * 1.50,
      12,
      1,
      false,
      0,
      Math.PI
    );
    const capMesh = new THREE.Mesh(cowlGeo, materials.armor);
    capMesh.rotation.z = Math.PI / 2;
    capMesh.rotation.x = -Math.PI * 0.28;
    capMesh.position.set(posX, spec.offsetY + 0.0015, spec.offsetZ + spec.proximalRadius * 0.32);
    capMesh.castShadow = true;
    knuckleCapsTemp.add(capMesh);
  });

  const mergedKnuckleCaps = mergeGroupMeshesByMaterial(knuckleCapsTemp, materials.armor, 'KnuckleCaps_Merged', false);
  if (mergedKnuckleCaps) {
    mergedKnuckleCaps.castShadow = true;
    handGroup.add(mergedKnuckleCaps);
    knuckleCaps.push(mergedKnuckleCaps);
  }

  // Merge static titanium palm skeleton / chassis components
  const mergedPalmJoint = mergeGroupMeshesByMaterial(palmJointGroup, materials.joint, 'PalmJoint_Merged', false);
  if (mergedPalmJoint) {
    mergedPalmJoint.castShadow = true;
    mergedPalmJoint.receiveShadow = true;
    handGroup.add(mergedPalmJoint);
  }

  // ==========================================
  // 7. STREAMLINED OPPOSABLE THUMB ASSEMBLY
  // ==========================================
  const thumb = createThumb(side, materials);
  handGroup.add(thumb.group);

  // ==========================================
  // 8. ARTICULATED FINGERS (Mounted on Anatomical Knuckle Arch)
  // ==========================================
  const fingers = [
    { spec: ANATOMICAL_FINGER_SPECS[0], node: createFinger(ANATOMICAL_FINGER_SPECS[0], side, materials) },
    { spec: ANATOMICAL_FINGER_SPECS[1], node: createFinger(ANATOMICAL_FINGER_SPECS[1], side, materials) },
    { spec: ANATOMICAL_FINGER_SPECS[2], node: createFinger(ANATOMICAL_FINGER_SPECS[2], side, materials) },
    { spec: ANATOMICAL_FINGER_SPECS[3], node: createFinger(ANATOMICAL_FINGER_SPECS[3], side, materials) },
  ];

  fingers.forEach(({ spec, node }) => {
    const posX = side * spec.spreadX;
    node.group.position.set(posX, spec.offsetY, spec.offsetZ);
    handGroup.add(node.group);
  });

  const indexFinger = fingers[0].node;
  const middleFinger = fingers[1].node;
  const ringFinger = fingers[2].node;
  const littleFinger = fingers[3].node;

  return {
    group: handGroup,
    palmChassis,
    dorsalArmor,
    carpalCuff,
    thumb,
    indexFinger,
    middleFinger,
    ringFinger,
    littleFinger,
    pinkyFinger: littleFinger,
    knuckles,
    knuckleCaps,
    palmarPads,
    ledMeshes,
  };
}

