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
 * Middle = longest (97mm)
 * Ring = slightly shorter (88mm)
 * Index = slightly shorter than middle (85mm)
 * Little = shortest (71mm)
 * Clear mechanical taper from knuckle to fingertip.
 */
const ANATOMICAL_FINGER_SPECS: FingerSpec[] = [
  {
    name: 'Index',
    spreadX: -0.0240,
    offsetY: -0.054,
    offsetZ: 0.003,
    proximalLength: 0.040,
    middleLength: 0.026,
    distalLength: 0.019,
    proximalRadius: 0.0078,
    middleRadius: 0.0068,
    distalRadius: 0.0056,
  },
  {
    name: 'Middle',
    spreadX: -0.0080,
    offsetY: -0.058,
    offsetZ: 0.005,
    proximalLength: 0.045,
    middleLength: 0.030,
    distalLength: 0.022,
    proximalRadius: 0.0082,
    middleRadius: 0.0072,
    distalRadius: 0.0060,
  },
  {
    name: 'Ring',
    spreadX: 0.0085,
    offsetY: -0.055,
    offsetZ: 0.003,
    proximalLength: 0.041,
    middleLength: 0.027,
    distalLength: 0.020,
    proximalRadius: 0.0078,
    middleRadius: 0.0068,
    distalRadius: 0.0056,
  },
  {
    name: 'Little',
    spreadX: 0.0245,
    offsetY: -0.050,
    offsetZ: -0.001,
    proximalLength: 0.033,
    middleLength: 0.022,
    distalLength: 0.016,
    proximalRadius: 0.0070,
    middleRadius: 0.0060,
    distalRadius: 0.0048,
  },
];

/**
 * Sculpted white ceramic dorsal metacarpal shield with:
 * - Compound 3D camber (convex arch across X and Y)
 * - Sharp specular longitudinal spine ridge
 * - Wide lateral chamfer flanks
 * - Knuckle arch margin following the natural anatomical finger roots
 * - Recessed central light channel for signature violet LED slit
 */
function createSculptedDorsalArmor(material: THREE.Material): THREE.Mesh {
  const positions: number[] = [];
  const normals: number[] = [];

  const ySteps = [-0.004, -0.014, -0.026, -0.038, -0.048, -0.055];
  const numY = ySteps.length;
  const halfWidths = [0.0240, 0.0270, 0.0300, 0.0325, 0.0325, 0.0305];

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

    positions.push(...p1, ...p2, ...p3);
    normals.push(cb1.x, cb1.y, cb1.z, cb1.x, cb1.y, cb1.z, cb1.x, cb1.y, cb1.z);

    positions.push(...p1, ...p3, ...p4);
    normals.push(cb2.x, cb2.y, cb2.z, cb2.x, cb2.y, cb2.z, cb2.x, cb2.y, cb2.z);
  };

  for (let i = 0; i < numY - 1; i++) {
    const y0 = ySteps[i];
    const y1 = i === numY - 2 ? -0.036 : ySteps[i + 1];
    const w0 = halfWidths[i];
    const w1 = halfWidths[i + 1];

    const zBase0 = 0.0088 + 0.0032 * Math.sin(((y0 + 0.004) / -0.051) * Math.PI);
    const zBase1 = 0.0088 + 0.0032 * Math.sin(((y1 + 0.004) / -0.051) * Math.PI);

    const x0 = [-w0, -w0 * 0.78, -w0 * 0.38, -0.0024];
    const x1 = [-w1, -w1 * 0.78, -w1 * 0.38, -0.0024];
    const z0 = [-0.0060, zBase0 * 0.40, zBase0 * 0.88, zBase0];
    const z1 = [-0.0060, zBase1 * 0.40, zBase1 * 0.88, zBase1];

    for (let c = 0; c < 3; c++) {
      const p1: [number, number, number] = [x0[c], y0, z0[c]];
      const p2: [number, number, number] = [x1[c], y1, z1[c]];
      const p3: [number, number, number] = [x1[c + 1], y1, z1[c + 1]];
      const p4: [number, number, number] = [x0[c + 1], y0, z0[c + 1]];
      addQuad(p1, p2, p3, p4);
    }

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

    const floorZ0 = zBase0 - 0.0024;
    const floorZ1 = zBase1 - 0.0024;
    addQuad(
      [-0.0024, y0, floorZ0],
      [-0.0024, y1, floorZ1],
      [0.0024, y1, floorZ1],
      [0.0024, y0, floorZ0]
    );

    addQuad(
      [-0.0024, y0, floorZ0],
      [-0.0024, y0, zBase0],
      [-0.0024, y1, zBase1],
      [-0.0024, y1, floorZ1]
    );

    addQuad(
      [0.0024, y0, zBase0],
      [0.0024, y0, floorZ0],
      [0.0024, y1, floorZ1],
      [0.0024, y1, zBase1]
    );
  }

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
 * CRITICAL CHANGE #6: REBUILT ROBOTIC PALM CHASSIS & CORE
 * Structure:
 * PALM OUTER SHELL -> PALM STRUCTURAL FRAME -> METACARPAL SUPPORTS -> FINGER JOINTS
 *
 * - Heavy CNC 7075-T6 titanium central chassis monocoque
 * - Left/right structural cheek plates with fastener screws
 * - 5 distinct digit mounting locations (4 MCP transverse knuckle clevises + 1 thenar bracket)
 * - Thumb base swivel mechanism with thenar anchor
 * - Internal actuator & tendon routing channels
 * - Removable ceramic dorsal shield with visible standoff bosses
 */
export function createHand(
  side: -1 | 1,
  materials: RobotMaterialPalette
): HandNodes {
  const handGroup = new THREE.Group();
  handGroup.name = side === -1 ? 'LeftHand' : 'RightHand';

  const ledMeshes: THREE.Mesh[] = [];
  const knuckles: THREE.Mesh[] = [];
  const knuckleCaps: THREE.Mesh[] = [];
  const palmarPads: THREE.Mesh[] = [];
  const palmJointGroup = new THREE.Group();

  // ==========================================
  // 1. CENTRAL CNC TITANIUM PALM CHASSIS (Mechanical Core)
  // ==========================================
  const chassisShape = new THREE.Shape();
  const topW = 0.0240;
  const botW = 0.0320;
  const len = 0.052;

  chassisShape.moveTo(-topW, 0);
  chassisShape.lineTo(topW, 0);
  chassisShape.lineTo(botW, -len);
  chassisShape.lineTo(-botW, -len);
  chassisShape.closePath();

  const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, {
    depth: 0.020,
    bevelEnabled: true,
    bevelThickness: 0.0024,
    bevelSize: 0.0018,
    bevelSegments: 2,
  });
  chassisGeo.center();

  const palmChassis = new THREE.Mesh(chassisGeo, materials.joint);
  palmChassis.name = 'Palm';
  palmChassis.position.set(0, -0.030, -0.002);
  palmChassis.castShadow = true;
  palmChassis.receiveShadow = true;
  palmJointGroup.add(palmChassis);

  // Left and Right Structural Cheek Plates (bolted to flanks)
  for (const pSide of [-1, 1]) {
    const plateGeo = new THREE.BoxGeometry(0.0035, 0.046, 0.016);
    const plateMesh = new THREE.Mesh(plateGeo, materials.joint);
    plateMesh.position.set(pSide * (botW * 0.94), -0.030, -0.002);
    palmJointGroup.add(plateMesh);

    // M2.5 fastener screws on cheek plates
    for (const bY of [-0.016, -0.032, -0.046]) {
      const boltGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0018, 6);
      boltGeo.rotateZ(Math.PI / 2);
      const bolt = new THREE.Mesh(boltGeo, materials.joint);
      bolt.position.set(pSide * (botW * 0.96), bY, -0.002);
      palmJointGroup.add(bolt);
    }
  }

  // Internal Tendon Routing & Metacarpal Support Struts
  for (let r = 0; r < 4; r++) {
    const spec = ANATOMICAL_FINGER_SPECS[r];
    const posX = side * spec.spreadX;

    // Longitudinal tendon channel guide tube
    const tubeGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.038, 8);
    const tube = new THREE.Mesh(tubeGeo, materials.joint);
    tube.position.set(posX * 0.82, -0.032, -0.007);
    palmJointGroup.add(tube);
  }

  // Transverse Knuckle Header Plate (Structural CNC titanium bar supporting 4 fingers)
  const headerGeo = new THREE.BoxGeometry(0.064, 0.008, 0.018);
  const headerMesh = new THREE.Mesh(headerGeo, materials.joint);
  headerMesh.position.set(0, -0.052, 0.001);
  palmJointGroup.add(headerMesh);

  // Dedicated Thenar Mounting Bracket for Thumb Base (Medial flank)
  const thenarMountGeo = new THREE.BoxGeometry(0.014, 0.018, 0.016);
  const thenarMount = new THREE.Mesh(thenarMountGeo, materials.joint);
  thenarMount.position.set(-side * 0.026, -0.024, 0.006);
  palmJointGroup.add(thenarMount);

  // ==========================================
  // 2. SCULPTED CERAMIC DORSAL METACARPAL SHIELD
  // ==========================================
  const dorsalArmor = createSculptedDorsalArmor(materials.armor);
  dorsalArmor.position.set(0, 0, 0.003);
  handGroup.add(dorsalArmor);

  // Visible Armor Mounting Standoff Bosses with Hex Fasteners
  for (const bY of [-0.014, -0.040]) {
    for (const bSide of [-0.020, 0.020]) {
      const standoffGeo = new THREE.CylinderGeometry(0.0025, 0.0028, 0.006, 8);
      const standoff = new THREE.Mesh(standoffGeo, materials.joint);
      standoff.position.set(bSide, bY, 0.008);
      palmJointGroup.add(standoff);

      const boltGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0018, 6);
      const bolt = new THREE.Mesh(boltGeo, materials.joint);
      bolt.position.set(bSide, bY, 0.011);
      palmJointGroup.add(bolt);
    }
  }

  // ==========================================
  // 3. SIGNATURE VIOLET EMISSIVE LED ACCENT SLIT
  // ==========================================
  const dorsalLedGeo = new THREE.BoxGeometry(0.0024, 0.028, 0.0024);
  const dorsalLed = new THREE.Mesh(dorsalLedGeo, materials.purpleEmissive);
  dorsalLed.name = 'DorsalLed';
  dorsalLed.position.set(0, -0.024, 0.0092);
  handGroup.add(dorsalLed);
  ledMeshes.push(dorsalLed);

  for (const bY of [-0.010, -0.038]) {
    const bezelGeo = new THREE.BoxGeometry(0.0034, 0.0024, 0.0026);
    const bezel = new THREE.Mesh(bezelGeo, materials.joint);
    bezel.position.set(0, bY, 0.0092);
    palmJointGroup.add(bezel);
  }

  // ==========================================
  // 4. CARPAL TRANSITION COLLAR & DOCKING SPIGOT
  // ==========================================
  const carpalStemGeo = new THREE.CylinderGeometry(0.020, 0.022, 0.014, 24);
  const carpalStem = new THREE.Mesh(carpalStemGeo, materials.joint);
  carpalStem.position.set(0, 0.005, 0.000);
  carpalStem.castShadow = true;
  palmJointGroup.add(carpalStem);

  const cuffGeo = new THREE.CylinderGeometry(0.021, 0.023, 0.008, 28);
  const carpalCuff = new THREE.Mesh(cuffGeo, materials.joint);
  carpalCuff.scale.set(1.0, 1.0, 0.76);
  carpalCuff.position.set(0, -0.002, 0.001);
  carpalCuff.castShadow = true;
  palmJointGroup.add(carpalCuff);

  const carpalTrimGeo = new THREE.TorusGeometry(0.0205, 0.0014, 8, 28);
  const carpalTrim = new THREE.Mesh(carpalTrimGeo, materials.joint);
  carpalTrim.scale.set(1.0, 0.76, 1.0);
  carpalTrim.rotation.x = Math.PI / 2;
  carpalTrim.position.set(0, -0.001, 0.001);
  palmJointGroup.add(carpalTrim);

  // ==========================================
  // 5. SEGMENTED DARK PALMAR TRACTION GRIP PADS (-Z Face)
  // ==========================================
  const palmarPadsTemp = new THREE.Group();

  // Thenar Pad
  const thenarGeo = new THREE.BoxGeometry(0.015, 0.024, 0.0030);
  const thenarPad = new THREE.Mesh(thenarGeo, materials.joint);
  thenarPad.position.set(-side * 0.015, -0.026, -0.0115);
  thenarPad.rotation.z = -side * 0.14;
  palmarPadsTemp.add(thenarPad);

  // Hypothenar Pad
  const hypoGeo = new THREE.BoxGeometry(0.015, 0.030, 0.0032);
  const hypoPad = new THREE.Mesh(hypoGeo, materials.joint);
  hypoPad.position.set(side * 0.016, -0.028, -0.0115);
  hypoPad.rotation.z = side * 0.06;
  palmarPadsTemp.add(hypoPad);

  // Metacarpal Cushion Tiles
  ANATOMICAL_FINGER_SPECS.forEach((spec) => {
    const posX = side * spec.spreadX;
    const mcpPadGeo = new THREE.BoxGeometry(0.010, 0.010, 0.0028);
    const mcpPad = new THREE.Mesh(mcpPadGeo, materials.joint);
    mcpPad.position.set(posX, spec.offsetY + 0.011, -0.0115);
    palmarPadsTemp.add(mcpPad);
  });

  const mergedPalmarPads = mergeGroupMeshesByMaterial(palmarPadsTemp, materials.joint, 'PalmarPads_Merged', false);
  if (mergedPalmarPads) {
    handGroup.add(mergedPalmarPads);
    palmarPads.push(mergedPalmarPads);
  }

  // ==========================================
  // 6. MCP KNUCKLE HINGES & KNUCKLE HOODS
  // ==========================================
  const knuckleCapsTemp = new THREE.Group();

  ANATOMICAL_FINGER_SPECS.forEach((spec) => {
    const posX = side * spec.spreadX;

    // Transverse titanium MCP hinge pin
    const pinRad = spec.proximalRadius * 0.82;
    const pinLen = spec.proximalRadius * 1.50;
    const knuckleGeo = new THREE.CylinderGeometry(pinRad, pinRad, pinLen, 16);
    const knuckleMesh = new THREE.Mesh(knuckleGeo, materials.joint);
    knuckleMesh.rotation.z = Math.PI / 2;
    knuckleMesh.position.set(posX, spec.offsetY, spec.offsetZ);
    knuckleMesh.castShadow = true;
    palmJointGroup.add(knuckleMesh);
    knuckles.push(knuckleMesh);

    // Clevis Cheek Flanges for Knuckle
    for (const bEnd of [-1, 1]) {
      const cheekGeo = new THREE.BoxGeometry(0.0020, 0.012, 0.012);
      const cheek = new THREE.Mesh(cheekGeo, materials.joint);
      cheek.position.set(posX + bEnd * (pinLen * 0.5 + 0.0015), spec.offsetY + 0.003, spec.offsetZ);
      palmJointGroup.add(cheek);

      const capEndGeo = new THREE.CylinderGeometry(pinRad * 0.88, pinRad * 0.88, 0.0006, 10);
      const capEndMesh = new THREE.Mesh(capEndGeo, materials.joint);
      capEndMesh.rotation.z = Math.PI / 2;
      capEndMesh.position.set(posX + bEnd * (pinLen * 0.5 + 0.0025), spec.offsetY, spec.offsetZ);
      palmJointGroup.add(capEndMesh);
    }

    // Knuckle protector cowl hood
    const cowlRadius = spec.proximalRadius * 1.10;
    const cowlGeo = new THREE.CylinderGeometry(
      cowlRadius,
      cowlRadius * 0.94,
      spec.proximalRadius * 1.50,
      14,
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

  // Merge static titanium palm skeleton components
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
