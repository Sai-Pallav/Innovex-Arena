import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { createFinger, createThumb, FingerNodes, ThumbNodes, FingerSpec } from './Finger';

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
 * Finger specs with true anatomical knuckle arch:
 * - Middle finger is most prominent / distal
 * - Index and Ring are slightly recessed
 * - Little finger is most recessed
 * - Radii scaled for clean robotic readability and mechanical presence
 */
const ANATOMICAL_FINGER_SPECS: FingerSpec[] = [
  {
    name: 'Index',
    spreadX: -0.017,
    offsetY: -0.060,
    offsetZ: 0.002,
    proximalLength: 0.030,
    middleLength: 0.021,
    distalLength: 0.015,
    proximalRadius: 0.0056,
    middleRadius: 0.0048,
    distalRadius: 0.0040,
  },
  {
    name: 'Middle',
    spreadX: -0.006,
    offsetY: -0.063,
    offsetZ: 0.004,
    proximalLength: 0.034,
    middleLength: 0.024,
    distalLength: 0.017,
    proximalRadius: 0.0058,
    middleRadius: 0.0050,
    distalRadius: 0.0042,
  },
  {
    name: 'Ring',
    spreadX: 0.006,
    offsetY: -0.061,
    offsetZ: 0.002,
    proximalLength: 0.031,
    middleLength: 0.022,
    distalLength: 0.016,
    proximalRadius: 0.0056,
    middleRadius: 0.0048,
    distalRadius: 0.0040,
  },
  {
    name: 'Little',
    spreadX: 0.017,
    offsetY: -0.057,
    offsetZ: -0.001,
    proximalLength: 0.025,
    middleLength: 0.018,
    distalLength: 0.013,
    proximalRadius: 0.0050,
    middleRadius: 0.0042,
    distalRadius: 0.0036,
  },
];

/**
 * REFINED ROBOTIC HAND ASSEMBLY
 * Adheres strictly to athletic cybernetic humanoid proportions:
 * - Hand scaled to 0.88 for harmonious proportion with forearm and torso
 * - Sculpted white ceramic dorsal metacarpal shield with chamfered bevels
 * - Signature violet emissive LED slit down the dorsal shield
 * - Anatomical knuckle arch with 4 articulated MCP knuckle pins & ceramic caps
 * - Segmented dark palmar friction grip pads (thenar, hypothenar, metacarpal)
 * - Opposable articulated thumb with thenar swivel assembly
 * - 4 independently articulated 3-segment fingers in relaxed resting pose
 */
export function createHand(
  side: -1 | 1,
  materials: RobotMaterialPalette
): HandNodes {
  const handGroup = new THREE.Group();
  handGroup.name = side === -1 ? 'LeftHand' : 'RightHand';

  // Proportional scale matching athletic humanoid robot anatomy
  const HAND_SCALE = 0.88;
  handGroup.scale.set(HAND_SCALE, HAND_SCALE, HAND_SCALE);

  const ledMeshes: THREE.Mesh[] = [];
  const knuckles: THREE.Mesh[] = [];
  const knuckleCaps: THREE.Mesh[] = [];
  const palmarPads: THREE.Mesh[] = [];

  // ==========================================
  // 1. DARK TITANIUM PALM CHASSIS (Ergonomic Tapered Shell)
  // ==========================================
  const chassisShape = new THREE.Shape();
  const topW = 0.020;
  const botW = 0.026;
  const len = 0.056;

  chassisShape.moveTo(-topW, 0);
  chassisShape.lineTo(topW, 0);
  chassisShape.lineTo(botW, -len);
  chassisShape.lineTo(-botW, -len);
  chassisShape.closePath();

  const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.002,
    bevelSegments: 2,
  });
  chassisGeo.center();

  const palmChassis = new THREE.Mesh(chassisGeo, materials.joint);
  palmChassis.name = 'Palm';
  palmChassis.position.set(0, -0.034, 0);
  palmChassis.castShadow = true;
  palmChassis.receiveShadow = true;
  handGroup.add(palmChassis);

  // ==========================================
  // 2. SCULPTED WHITE CERAMIC DORSAL METACARPAL SHIELD
  // (+Z face with automotive chamfers)
  // ==========================================
  const dorsalShape = new THREE.Shape();
  const dTopW = 0.021;
  const dBotW = 0.027;
  const dLen = 0.054;
  const dR = 0.003;

  dorsalShape.moveTo(-dTopW + dR, 0);
  dorsalShape.lineTo(dTopW - dR, 0);
  dorsalShape.quadraticCurveTo(dTopW, 0, dTopW, -dR);
  dorsalShape.lineTo(dBotW, -dLen + dR);
  dorsalShape.quadraticCurveTo(dBotW, -dLen, dBotW - dR, -dLen);
  dorsalShape.lineTo(-dBotW + dR, -dLen);
  dorsalShape.quadraticCurveTo(-dBotW, -dLen, -dBotW, -dLen + dR);
  dorsalShape.lineTo(-dTopW, -dR);
  dorsalShape.quadraticCurveTo(-dTopW, 0, -dTopW + dR, 0);

  const dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.0032,
    bevelSize: 0.0024,
    bevelSegments: 3,
  });
  dorsalGeo.center();

  const dorsalArmor = new THREE.Mesh(dorsalGeo, materials.armor);
  dorsalArmor.position.set(0, -0.034, 0.010);
  dorsalArmor.castShadow = true;
  dorsalArmor.receiveShadow = true;
  handGroup.add(dorsalArmor);

  // 3. Signature Violet Emissive LED Accent Slit on Dorsal Shield
  const dorsalLedGeo = new THREE.BoxGeometry(0.0028, 0.036, 0.0035);
  const dorsalLed = new THREE.Mesh(dorsalLedGeo, materials.purpleEmissive);
  dorsalLed.position.set(0, -0.034, 0.0145);
  handGroup.add(dorsalLed);
  ledMeshes.push(dorsalLed);

  // 4. Proximal Carpal Collar & Connecting Stem (Connecting wrist to palm)
  const carpalGeo = new THREE.TorusGeometry(0.030, 0.0035, 12, 28);
  const carpalCuff = new THREE.Mesh(carpalGeo, materials.joint);
  carpalCuff.rotation.x = Math.PI / 2;
  carpalCuff.position.set(0, -0.008, 0.002);
  carpalCuff.castShadow = true;
  handGroup.add(carpalCuff);

  // Structural carpal stem linking palm chassis directly into wrist clevis
  const carpalStemGeo = new THREE.CylinderGeometry(0.022, 0.024, 0.024, 24);
  const carpalStem = new THREE.Mesh(carpalStemGeo, materials.joint);
  carpalStem.position.set(0, 0.006, 0.002);
  carpalStem.castShadow = true;
  handGroup.add(carpalStem);

  // ==========================================
  // 5. SEGMENTED PALMAR DARK GRIP PADS (Inner Palm on -Z Face)
  // ==========================================
  // A. Thenar Eminence Pad
  const thenarGeo = new THREE.BoxGeometry(0.014, 0.026, 0.0038);
  const thenarPad = new THREE.Mesh(thenarGeo, materials.joint);
  thenarPad.position.set(-side * 0.014, -0.028, -0.011);
  thenarPad.rotation.z = -side * 0.12;
  handGroup.add(thenarPad);
  palmarPads.push(thenarPad);

  // B. Hypothenar Eminence Pad
  const hypoGeo = new THREE.BoxGeometry(0.013, 0.030, 0.0038);
  const hypoPad = new THREE.Mesh(hypoGeo, materials.joint);
  hypoPad.position.set(side * 0.015, -0.032, -0.011);
  hypoPad.rotation.z = side * 0.08;
  handGroup.add(hypoPad);
  palmarPads.push(hypoPad);

  // C. Metacarpal Grip Cushion Tiles (4 individual friction pads under each knuckle base)
  ANATOMICAL_FINGER_SPECS.forEach((spec) => {
    const posX = side * spec.spreadX;
    const mcpPadGeo = new THREE.BoxGeometry(0.009, 0.009, 0.0035);
    const mcpPad = new THREE.Mesh(mcpPadGeo, materials.joint);
    mcpPad.position.set(posX, spec.offsetY + 0.013, -0.011);
    handGroup.add(mcpPad);
    palmarPads.push(mcpPad);
  });

  // ==========================================
  // 6. MCP KNUCKLE HINGES & PROTECTOR CAPS (True Anatomical Arch)
  // ==========================================
  ANATOMICAL_FINGER_SPECS.forEach((spec) => {
    const posX = side * spec.spreadX;
    // Cylindrical titanium hinge barrel along transverse X axis
    const knuckleGeo = new THREE.CylinderGeometry(
      spec.proximalRadius * 1.05,
      spec.proximalRadius * 1.05,
      spec.proximalRadius * 2.2,
      14
    );
    const knuckleMesh = new THREE.Mesh(knuckleGeo, materials.joint);
    knuckleMesh.rotation.z = Math.PI / 2;
    knuckleMesh.position.set(posX, spec.offsetY, spec.offsetZ);
    knuckleMesh.castShadow = true;
    handGroup.add(knuckleMesh);
    knuckles.push(knuckleMesh);

    // Beveled ceramic knuckle protector cap over dorsal face (+Z)
    const capGeo = new THREE.SphereGeometry(spec.proximalRadius * 1.15, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const capMesh = new THREE.Mesh(capGeo, materials.armor);
    capMesh.position.set(posX, spec.offsetY, spec.offsetZ + spec.proximalRadius * 0.35);
    capMesh.scale.set(0.90, 1.0, 0.70);
    capMesh.castShadow = true;
    handGroup.add(capMesh);
    knuckleCaps.push(capMesh);
  });

  // ==========================================
  // 7. OPPOSABLE THUMB ASSEMBLY
  // ==========================================
  const thumb = createThumb(side, materials);
  handGroup.add(thumb.group);

  // ==========================================
  // 8. ARTICULATED FINGERS (Mounted on Knuckle Arch)
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
