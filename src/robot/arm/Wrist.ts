import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// WRIST MODULE — High-Precision Ergonomic Humanoid Robotic Gauntlet Cuff
// Re-engineered to strictly match reference photos (Reference Images 1 & 2):
//
// Key Architectural Features:
//   1. Sculpted dark titanium / gunmetal ergonomic squircle gauntlet cuff (superellipse)
//      with smooth filleted corners, continuous G2 curvature, and zero sharp box edges.
//   2. Ultra-flush polished chrome upper forearm-docking and lower carpal-docking trim rims.
//   3. Signature Cybernetic Purple OLED capsule display sunken flush on the dorsal face.
//   4. Precision lateral and medial styloid process rotary bearing hubs with hex fasteners.
//   5. Compact internal 2-DOF transverse axle pin & clevis trunnion with zero neck gap.
// ─────────────────────────────────────────────────────────────────────────────

export interface WristNodes {
  group: THREE.Group;
  wristPivot: THREE.Group;
  trunnionPivot: THREE.Group;
  distalHandMount: THREE.Group;
  swivelCollar: THREE.Mesh;
  accentRing: THREE.Mesh;
  pivotPin: THREE.Mesh;
  distalClevis: THREE.Mesh;
  ribbedRings: THREE.Mesh[];
  styloidCaps: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];
  styloidArmorLeft: THREE.Mesh;
  styloidArmorRight: THREE.Mesh;
  dorsalCowl: THREE.Mesh;
  rotaryCore: THREE.Mesh;
  distalSocket: THREE.Mesh;
}

/**
 * Creates an ergonomic squircle (superellipse) gauntlet cuff geometry.
 * Continuously curved, filleted quad-mesh with top and bottom chamfers.
 */
function createSquircleCuffGeometry(
  width: number = 0.0432,
  depth: number = 0.0332,
  height: number = 0.0135,
  power: number = 3.2
): THREE.BufferGeometry {
  const radialSegments = 48;
  const a = width * 0.5;
  const b = depth * 0.5;

  // Longitudinal profile definitions (y, scale)
  const profile = [
    { y:  0.0000, scale: 0.92 }, // Top lid inner rim
    { y: -0.0008, scale: 0.985 }, // Top chamfer
    { y: -0.0024, scale: 1.00 }, // Upper flank
    { y: -0.0068, scale: 1.015 }, // Mid organic convex crown
    { y: -0.0112, scale: 1.00 }, // Lower flank
    { y: -0.0127, scale: 0.985 }, // Bottom chamfer
    { y: -0.0135, scale: 0.93 }, // Bottom lid inner rim
  ];

  const heightSegments = profile.length - 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= heightSegments; j++) {
    const p = profile[j];
    const curA = a * p.scale;
    const curB = b * p.scale;
    const v = j / heightSegments;

    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments;
      const theta = u * Math.PI * 2;

      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const sX = Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / power);
      const sZ = Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / power);

      positions.push(curA * sX, p.y, curB * sZ);
      uvs.push(u, v);
    }
  }

  // Quads between profile rings
  for (let j = 0; j < heightSegments; j++) {
    for (let i = 0; i < radialSegments; i++) {
      const p1 = j * (radialSegments + 1) + i;
      const p2 = p1 + 1;
      const p3 = (j + 1) * (radialSegments + 1) + i;
      const p4 = p3 + 1;

      indices.push(p1, p3, p2);
      indices.push(p2, p3, p4);
    }
  }

  // Top cap center vertex
  const topCenterIndex = positions.length / 3;
  positions.push(0, 0, 0);
  uvs.push(0.5, 0.5);

  for (let i = 0; i < radialSegments; i++) {
    indices.push(topCenterIndex, i, i + 1);
  }

  // Bottom cap center vertex
  const botCenterIndex = positions.length / 3;
  positions.push(0, -height, 0);
  uvs.push(0.5, 0.5);

  const botRingStart = heightSegments * (radialSegments + 1);
  for (let i = 0; i < radialSegments; i++) {
    indices.push(botCenterIndex, botRingStart + i + 1, botRingStart + i);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a precision squircle trim ring ribbon conforming to the cuff perimeter.
 */
function createSquircleRingGeometry(
  width: number,
  depth: number,
  height: number = 0.0010,
  power: number = 3.2
): THREE.BufferGeometry {
  const radialSegments = 48;
  const a = width * 0.5;
  const b = depth * 0.5;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= 1; j++) {
    const y = -j * height;
    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments;
      const theta = u * Math.PI * 2;

      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const sX = Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / power);
      const sZ = Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / power);

      positions.push(a * sX, y, b * sZ);
      uvs.push(u, j);
    }
  }

  for (let i = 0; i < radialSegments; i++) {
    const p1 = i;
    const p2 = i + 1;
    const p3 = (radialSegments + 1) + i;
    const p4 = p3 + 1;

    indices.push(p1, p3, p2);
    indices.push(p2, p3, p4);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function createWrist(
  side: -1 | 1,
  materials: RobotMaterialPalette
): WristNodes {
  const wristGroup = new THREE.Group();
  wristGroup.name = side === -1 ? 'LeftWristPivot' : 'RightWristPivot';

  const ledMeshes: THREE.Mesh[] = [];
  const ribbedRings: THREE.Mesh[] = [];
  const styloidCaps: THREE.Mesh[] = [];

  const mechanicsGroup = new THREE.Group();
  mechanicsGroup.name = 'WristMechanics';
  wristGroup.add(mechanicsGroup);

  // ════════════════════════════════════════════════════════════
  // 1. SCULPTED ERGONOMIC GAUNTLET CUFF (SUPER-ELLIPSE GEOMETRY)
  //    Dark titanium chamfered body with continuous G2 curvature
  // ════════════════════════════════════════════════════════════
  const cuffW = 0.0448; // 44.8 mm wide (seamless taper with forearm & carpal profile)
  const cuffD = 0.0340; // 34.0 mm deep
  const cuffH = 0.0135; // 13.5 mm compact athletic height

  const cuffGeo = createSquircleCuffGeometry(cuffW, cuffD, cuffH, 3.2);
  const swivelCollar = new THREE.Mesh(cuffGeo, materials.joint);
  swivelCollar.name = 'WristSmartCuff';
  swivelCollar.position.set(0, 0, 0);
  swivelCollar.castShadow = true;
  swivelCollar.receiveShadow = true;
  mechanicsGroup.add(swivelCollar);

  // ════════════════════════════════════════════════════════════
  // 2. POLISHED METALLIC TRIM BEZELS (Upper Forearm & Lower Carpal)
  // ════════════════════════════════════════════════════════════
  // Upper trim docking with forearm gauntlet collar (zero air gap)
  const topTrimGeo = createSquircleRingGeometry(cuffW * 1.006, cuffD * 1.006, 0.0010, 3.2);
  const topTrim = new THREE.Mesh(topTrimGeo, materials.metallic);
  topTrim.position.set(0, 0.0001, 0);
  mechanicsGroup.add(topTrim);
  ribbedRings.push(topTrim);

  // Lower trim docking with carpal hand base
  const botTrimGeo = createSquircleRingGeometry(cuffW * 0.970, cuffD * 0.970, 0.0010, 3.2);
  const botTrim = new THREE.Mesh(botTrimGeo, materials.metallic);
  botTrim.position.set(0, -cuffH + 0.0006, 0);
  mechanicsGroup.add(botTrim);
  ribbedRings.push(botTrim);

  // ════════════════════════════════════════════════════════════
  // 3. SIGNATURE DORSAL CYBERNETIC PURPLE OLED CAPSULE DISPLAY
  //    Sleek, pill-shaped horizontal slot recessed flush into dorsal face
  // ════════════════════════════════════════════════════════════
  const slotRadius = 0.0013;
  const slotLength = 0.0145;
  const slotY = -cuffH * 0.50;
  const slotZ = (cuffD * 0.50) * 1.015 - 0.0002;

  // Recessed dark backing tray
  const trayGeo = new THREE.BoxGeometry(slotLength + 0.0046, slotRadius * 2.8, 0.0010);
  const slotTray = new THREE.Mesh(trayGeo, materials.joint);
  slotTray.position.set(0, slotY, slotZ - 0.0004);
  mechanicsGroup.add(slotTray);

  // Precision polished chrome capsule bezel frame
  const bezelGeo = new THREE.CapsuleGeometry(slotRadius * 1.35, slotLength, 8, 16);
  bezelGeo.rotateZ(Math.PI / 2);
  const slotBezel = new THREE.Mesh(bezelGeo, materials.metallic);
  slotBezel.position.set(0, slotY, slotZ - 0.0001);
  mechanicsGroup.add(slotBezel);

  // Glowing Cybernetic Purple Emissive Element
  const ledGeo = new THREE.CapsuleGeometry(slotRadius, slotLength * 0.95, 8, 16);
  ledGeo.rotateZ(Math.PI / 2);
  const accentRing = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  accentRing.name = 'WristPurpleEmissiveSlot';
  accentRing.position.set(0, slotY, slotZ + 0.0002);
  mechanicsGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // Soft Purple Bloom Aura
  const bloomGeo = new THREE.CapsuleGeometry(slotRadius * 1.5, slotLength * 1.05, 8, 16);
  bloomGeo.rotateZ(Math.PI / 2);
  const bloomMesh = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomMesh.position.copy(accentRing.position);
  mechanicsGroup.add(bloomMesh);

  // Micro sensor apertures flanking display (Reference Image 1)
  for (const sX of [-0.0118, 0.0118]) {
    const sensorGeo = new THREE.CylinderGeometry(0.0005, 0.0005, 0.0008, 8);
    sensorGeo.rotateX(Math.PI / 2);
    const sensor = new THREE.Mesh(sensorGeo, materials.metallic);
    sensor.position.set(sX, slotY, slotZ - 0.0002);
    mechanicsGroup.add(sensor);
  }

  // ════════════════════════════════════════════════════════════
  // 4. TRANSVERSE FLEXION AXLE PIN & STYLOID BEARING HUBS
  //    True anatomical wrist pivot axis at Y = -0.0110m
  // ════════════════════════════════════════════════════════════
  const pivotY = -0.0110;

  const coreGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.0090, 20);
  const rotaryCore = new THREE.Mesh(coreGeo, materials.joint);
  rotaryCore.name = 'WristRotaryCore';
  rotaryCore.position.set(0, pivotY, 0);
  rotaryCore.castShadow = true;
  mechanicsGroup.add(rotaryCore);

  const pinGeo = new THREE.CylinderGeometry(0.0036, 0.0036, cuffW + 0.0016, 18);
  pinGeo.rotateZ(Math.PI / 2);
  const pivotPin = new THREE.Mesh(pinGeo, materials.metallic);
  pivotPin.name = 'WristPivotPin';
  pivotPin.position.set(0, pivotY, 0);
  pivotPin.castShadow = true;
  mechanicsGroup.add(pivotPin);

  // Lateral & Medial styloid rotary bearing hubs on pivot axis
  for (const pSide of [-1, 1]) {
    const hubX = pSide * (cuffW * 0.50 + 0.0002);

    // Bearing race outer collar
    const collarGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.0012, 16);
    collarGeo.rotateZ(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, materials.joint);
    collar.position.set(hubX, pivotY, 0);
    mechanicsGroup.add(collar);
    styloidCaps.push(collar);

    // Polished chrome accent ring
    const ringGeo = new THREE.TorusGeometry(0.0036, 0.0004, 6, 16);
    ringGeo.rotateY(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, materials.metallic);
    ring.position.set(hubX + pSide * 0.0006, pivotY, 0);
    mechanicsGroup.add(ring);

    // Central axle cap with hex socket
    const boltGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.0014, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.metallic);
    bolt.position.set(hubX + pSide * 0.0008, pivotY, 0);
    mechanicsGroup.add(bolt);
  }

  // ════════════════════════════════════════════════════════════
  // 5. COMPATIBILITY PROXIES (Exploded View Nodes)
  // ════════════════════════════════════════════════════════════
  const dummyArmorGeo = new THREE.BufferGeometry();
  const styloidArmorLeft = new THREE.Mesh(dummyArmorGeo, materials.armor);
  styloidArmorLeft.visible = false;
  mechanicsGroup.add(styloidArmorLeft);

  const styloidArmorRight = new THREE.Mesh(dummyArmorGeo, materials.armor);
  styloidArmorRight.visible = false;
  mechanicsGroup.add(styloidArmorRight);

  const dorsalCowl = new THREE.Mesh(dummyArmorGeo, materials.armor);
  dorsalCowl.visible = false;
  mechanicsGroup.add(dorsalCowl);

  // ════════════════════════════════════════════════════════════
  // 6. ARTICULATED DISTAL TRUNNION ASSEMBLY
  //    Articulates around transverse axle pin at Y = pivotY (-0.0100m)
  // ════════════════════════════════════════════════════════════
  const trunnionPivot = new THREE.Group();
  trunnionPivot.name = side === -1 ? 'LeftWristTrunnion' : 'RightWristTrunnion';
  trunnionPivot.position.set(0, pivotY, 0);
  mechanicsGroup.add(trunnionPivot);

  // Dual-shear titanium clevis yoke embracing axle pin
  for (const cSide of [-1, 1]) {
    const earGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.0020, 16);
    earGeo.rotateZ(Math.PI / 2);
    const ear = new THREE.Mesh(earGeo, materials.joint);
    ear.position.set(cSide * 0.0130, 0, 0);
    ear.castShadow = true;
    trunnionPivot.add(ear);
  }

  // Clevis bridge base linking ears
  const bridgeGeo = new THREE.BoxGeometry(0.0260, 0.0024, 0.0130);
  const distalClevis = new THREE.Mesh(bridgeGeo, materials.joint);
  distalClevis.name = 'WristDistalClevis';
  distalClevis.position.set(0, -0.0016, 0);
  distalClevis.castShadow = true;
  distalClevis.receiveShadow = true;
  trunnionPivot.add(distalClevis);

  // Precision centering carpal socket collar
  const socketGeo = new THREE.CylinderGeometry(0.0135, 0.0145, 0.0018, 24);
  const distalSocket = new THREE.Mesh(socketGeo, materials.joint);
  distalSocket.position.set(0, -0.0020, 0);
  trunnionPivot.add(distalSocket);

  // Dedicated Distal Mounting Anchor (flush docking against cuff bottom rim)
  const distalHandMount = new THREE.Group();
  distalHandMount.name = side === -1 ? 'LeftDistalHandMount' : 'RightDistalHandMount';
  distalHandMount.position.set(0, -0.0025, 0);
  trunnionPivot.add(distalHandMount);

  // Natural athletic resting flexion: subtle forward tilt (~2.5°)
  trunnionPivot.rotation.set(0.042, 0, 0);

  return {
    group: wristGroup,
    wristPivot: wristGroup,
    trunnionPivot,
    distalHandMount,
    swivelCollar,
    accentRing,
    pivotPin,
    distalClevis,
    ribbedRings,
    styloidCaps,
    ledMeshes,
    styloidArmorLeft,
    styloidArmorRight,
    dorsalCowl,
    rotaryCore,
    distalSocket,
  };
}
