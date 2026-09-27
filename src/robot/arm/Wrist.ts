import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// WRIST MODULE — High-Precision Humanoid Robotic Wrist Joint Assembly
// Architectural Refinement & True Trunnion Articulation:
//
// Proximal (Forearm docking) → Distal (Hand interface):
//   1. Forearm gauntlet docking rim & metallic retainer ring (Y = -0.001m)
//   2. Signature Purple Emissive LED Ring Collar (Y = -0.004m)
//   3. Segmented Dark Titanium Cylindrical Wrist Sleeve with Chrome Inset Flutes (Y = -0.0105m)
//   4. Precision Transverse Flexion Axle Pin & Styloid Bearing Endcaps (Y = -0.020m)
//   5. Articulated Trunnion Assembly (Pivot at Y = -0.020m):
//      - Dual-shear dark titanium clevis yoke embracing the axle pin
//      - Precision rotary core with bearing races
//      - Machined distal interface flange with centering socket (Y = -0.030m global)
//      - 8-bolt titanium interface cap pattern
//      - Flush distalHandMount (Y = -0.030m global)
//      - Natural resting athletic flexion: articulates about the true mechanical axis!
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
  // 1. FOREARM DOCKING COLLAR & UPPER RETAINER RIM
  // ════════════════════════════════════════════════════════════
  const upperCollarGeo = new THREE.CylinderGeometry(0.0238, 0.0250, 0.004, 32);
  const upperCollar = new THREE.Mesh(upperCollarGeo, materials.joint);
  upperCollar.position.set(0, -0.001, 0);
  mechanicsGroup.add(upperCollar);

  const upperRimGeo = new THREE.TorusGeometry(0.0252, 0.0010, 8, 32);
  upperRimGeo.rotateX(Math.PI / 2);
  const upperRim = new THREE.Mesh(upperRimGeo, materials.metallic);
  upperRim.position.set(0, -0.001, 0);
  mechanicsGroup.add(upperRim);
  ribbedRings.push(upperRim);

  // ════════════════════════════════════════════════════════════
  // 2. SIGNATURE PURPLE GLOWING LED RING COLLAR
  //    Bright circular halo right below the forearm gauntlet cuff
  // ════════════════════════════════════════════════════════════
  const accentGeo = new THREE.TorusGeometry(0.0255, 0.0020, 12, 38);
  accentGeo.rotateX(Math.PI / 2);
  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.name = 'WristPurpleEmissiveRing';
  accentRing.position.set(0, -0.004, 0);
  mechanicsGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // Soft purple bloom aura
  const bloomGeo = new THREE.TorusGeometry(0.0258, 0.0030, 8, 32);
  bloomGeo.rotateX(Math.PI / 2);
  const bloomRing = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomRing.position.copy(accentRing.position);
  mechanicsGroup.add(bloomRing);

  // ════════════════════════════════════════════════════════════
  // 3. SEGMENTED DARK TITANIUM CYLINDRICAL WRIST SLEEVE
  //    With Chrome/Metallic Vertical Inset Splines
  // ════════════════════════════════════════════════════════════
  const collarHeight = 0.011;
  const collarR = 0.0246;
  const collarGeo = new THREE.CylinderGeometry(collarR, collarR, collarHeight, 32);
  const swivelCollar = new THREE.Mesh(collarGeo, materials.joint);
  swivelCollar.name = 'WristSwivelCollar';
  swivelCollar.position.set(0, -0.0105, 0);
  swivelCollar.castShadow = true;
  swivelCollar.receiveShadow = true;
  mechanicsGroup.add(swivelCollar);

  // Vertical Polished Chrome Inset Flutes/Plates around sleeve
  const fluteCount = 10;
  for (let i = 0; i < fluteCount; i++) {
    const angle = (i / fluteCount) * Math.PI * 2;
    const fluteGeo = new THREE.BoxGeometry(0.0036, collarHeight * 0.75, 0.0015);
    const flute = new THREE.Mesh(fluteGeo, materials.metallic);
    flute.position.set(
      Math.sin(angle) * (collarR + 0.0004),
      -0.0105,
      Math.cos(angle) * (collarR + 0.0004)
    );
    flute.rotation.y = angle;
    mechanicsGroup.add(flute);
  }

  // Lower Metallic Retaining Ring
  const lowerRimGeo = new THREE.TorusGeometry(collarR + 0.0006, 0.0011, 8, 32);
  lowerRimGeo.rotateX(Math.PI / 2);
  const lowerRim = new THREE.Mesh(lowerRimGeo, materials.metallic);
  lowerRim.position.set(0, -0.016, 0);
  mechanicsGroup.add(lowerRim);
  ribbedRings.push(lowerRim);

  // ════════════════════════════════════════════════════════════
  // 4. TRANSVERSE FLEXION/EXTENSION AXLE PIN & BEARING STYLOID CAPS
  //    True anatomical wrist pivot axis at Y = -0.020m
  // ════════════════════════════════════════════════════════════
  const coreGeo = new THREE.CylinderGeometry(0.0210, 0.0218, 0.009, 24);
  const rotaryCore = new THREE.Mesh(coreGeo, materials.joint);
  rotaryCore.name = 'WristRotaryCore';
  rotaryCore.position.set(0, -0.020, 0);
  rotaryCore.castShadow = true;
  mechanicsGroup.add(rotaryCore);

  const pinGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.046, 18);
  pinGeo.rotateZ(Math.PI / 2);
  const pivotPin = new THREE.Mesh(pinGeo, materials.metallic);
  pivotPin.name = 'WristPivotPin';
  pivotPin.position.set(0, -0.020, 0);
  pivotPin.castShadow = true;
  mechanicsGroup.add(pivotPin);

  // Lateral & Medial flush bearing endcaps
  for (const pSide of [-1, 1]) {
    const capGeo = new THREE.CylinderGeometry(0.0090, 0.0090, 0.0020, 16);
    capGeo.rotateZ(Math.PI / 2);
    const endCap = new THREE.Mesh(capGeo, materials.joint);
    endCap.position.set(pSide * 0.0236, -0.020, 0);
    mechanicsGroup.add(endCap);
    styloidCaps.push(endCap);

    const boltGeo = new THREE.CylinderGeometry(0.0013, 0.0013, 0.0024, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.metallic);
    bolt.position.set(pSide * 0.0248, -0.020, 0);
    mechanicsGroup.add(bolt);
  }

  // ════════════════════════════════════════════════════════════
  // 5. ARTICULATED DISTAL TRUNNION ASSEMBLY
  //    Centered at Y = -0.020m (exact center of axle pin!)
  //    Carries the distal clevis, interface flange, bolts, and hand together!
  // ════════════════════════════════════════════════════════════
  const trunnionPivot = new THREE.Group();
  trunnionPivot.name = side === -1 ? 'LeftWristTrunnion' : 'RightWristTrunnion';
  trunnionPivot.position.set(0, -0.020, 0);
  mechanicsGroup.add(trunnionPivot);

  // A. Dual-Shear Titanium Clevis Yoke (rotates around the pivot pin)
  // Two vertical clevis ears embracing the axle pin
  for (const cSide of [-1, 1]) {
    const earGeo = new THREE.CylinderGeometry(0.0088, 0.0088, 0.0032, 18);
    earGeo.rotateZ(Math.PI / 2);
    const ear = new THREE.Mesh(earGeo, materials.joint);
    ear.position.set(cSide * 0.0210, 0, 0);
    ear.castShadow = true;
    trunnionPivot.add(ear);

    // Polished bronze/metallic bearing bushing ring
    const bushGeo = new THREE.TorusGeometry(0.0070, 0.0006, 6, 18);
    bushGeo.rotateY(Math.PI / 2);
    const bush = new THREE.Mesh(bushGeo, materials.metallic);
    bush.position.set(cSide * 0.0227, 0, 0);
    trunnionPivot.add(bush);
  }

  // Clevis bridge base linking the ears
  const bridgeGeo = new THREE.BoxGeometry(0.042, 0.0045, 0.023);
  const distalClevis = new THREE.Mesh(bridgeGeo, materials.joint);
  distalClevis.name = 'WristDistalClevis';
  distalClevis.position.set(0, -0.0065, 0);
  distalClevis.castShadow = true;
  distalClevis.receiveShadow = true;
  trunnionPivot.add(distalClevis);

  // Precision centering socket collar (mates with hand carpal spigot)
  const socketGeo = new THREE.CylinderGeometry(0.0175, 0.0185, 0.0025, 24);
  const distalSocket = new THREE.Mesh(socketGeo, materials.joint);
  distalSocket.position.set(0, -0.0085, 0);
  trunnionPivot.add(distalSocket);

  // Precision Machined Distal Interface Faceplate (flush at Y = -0.010m relative to pivot)
  const endPlateGeo = new THREE.CylinderGeometry(0.0170, 0.0175, 0.0018, 24);
  const endPlate = new THREE.Mesh(endPlateGeo, materials.metallic);
  endPlate.position.set(0, -0.0095, 0);
  endPlate.castShadow = true;
  trunnionPivot.add(endPlate);

  // Central recessed trunnion bore
  const trunnionCoreGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.0020, 16);
  const trunnionCore = new THREE.Mesh(trunnionCoreGeo, materials.joint);
  trunnionCore.position.set(0, -0.010, 0);
  trunnionPivot.add(trunnionCore);

  // 8 Machined Titanium Bolt Pattern around the distal interface
  const boltR = 0.0125;
  for (let b = 0; b < 8; b++) {
    const angle = (b / 8) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0010, 0.0010, 0.0016, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      Math.sin(angle) * boltR,
      -0.010,
      Math.cos(angle) * boltR
    );
    trunnionPivot.add(bolt);
  }

  // Dedicated Distal Mounting Anchor (at Y = -0.010m relative to trunnion pivot,
  // which equals Y = -0.030m global in wrist space!)
  const distalHandMount = new THREE.Group();
  distalHandMount.name = side === -1 ? 'LeftDistalHandMount' : 'RightDistalHandMount';
  distalHandMount.position.set(0, -0.010, 0);
  trunnionPivot.add(distalHandMount);

  // Natural athletic resting flexion applied to the wrist trunnion:
  // Rotates cleanly around the transverse axle pin (0, -0.020, 0)
  // Subtle forward flexion (~2.8°) + natural carrying yaw
  trunnionPivot.rotation.set(0.048, 0, -side * 0.015);

  // Interface compatibility dummies (invisible/empty to avoid visual intrusion)
  const dummyArmorGeo = new THREE.BufferGeometry();
  const styloidArmorLeft = new THREE.Mesh(dummyArmorGeo, materials.armor);
  styloidArmorLeft.visible = false;
  const styloidArmorRight = new THREE.Mesh(dummyArmorGeo, materials.armor);
  styloidArmorRight.visible = false;
  const dorsalCowl = new THREE.Mesh(dummyArmorGeo, materials.armor);
  dorsalCowl.visible = false;

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
