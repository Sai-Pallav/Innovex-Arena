import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// WRIST MODULE — Sleek Humanoid Robotic Wrist Joint Assembly
// Exact match to Reference Blueprint Image:
//
// Architecture (proximal → distal):
//   Forearm gauntlet docking rim
//     ↓  Vibrant Purple Emissive LED Ring Collar (signature cybernetic accent)
//     ↓  Segmented Dark Titanium Cylindrical Wrist Sleeve with Chrome Inset Flutes
//     ↓  Polished Metallic Retaining Ring
//     ↓  Precision Internal Flexion Axle Pin & Bearing Races
//     ↓  Stepped Carpal Transition Collar
//     ↓  Distal Hand Mount (Interfaces flush with Hand.ts carpal cuff)
// ─────────────────────────────────────────────────────────────────────────────

export interface WristNodes {
  group: THREE.Group;
  wristPivot: THREE.Group;
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
  //    With Chrome/Metallic Vertical Inset Splines (matching reference)
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
  // 4. TRANSVERSE FLEXION/EXTENSION AXLE PIN & BEARING FLANGES
  // ════════════════════════════════════════════════════════════
  const coreGeo = new THREE.CylinderGeometry(0.0210, 0.0218, 0.010, 24);
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
  // 5. STEPPED CARPAL DOCKING COLLAR & DISTAL HAND MOUNT
  // ════════════════════════════════════════════════════════════
  const transitGeo = new THREE.CylinderGeometry(0.0215, 0.0205, 0.006, 26);
  const transitCollar = new THREE.Mesh(transitGeo, materials.joint);
  transitCollar.position.set(0, -0.024, 0);
  transitCollar.castShadow = true;
  mechanicsGroup.add(transitCollar);

  const transitRimGeo = new THREE.TorusGeometry(0.0210, 0.0009, 6, 26);
  transitRimGeo.rotateX(Math.PI / 2);
  const transitRim = new THREE.Mesh(transitRimGeo, materials.metallic);
  transitRim.position.set(0, -0.0265, 0);
  mechanicsGroup.add(transitRim);

  const plateGeo = new THREE.BoxGeometry(0.040, 0.003, 0.026);
  const distalClevis = new THREE.Mesh(plateGeo, materials.joint);
  distalClevis.name = 'WristDistalClevis';
  distalClevis.position.set(0, -0.027, 0);
  mechanicsGroup.add(distalClevis);

  const socketGeo = new THREE.CylinderGeometry(0.0175, 0.0185, 0.003, 20);
  const distalSocket = new THREE.Mesh(socketGeo, materials.joint);
  distalSocket.position.set(0, -0.028, 0);
  mechanicsGroup.add(distalSocket);

  // Dedicated Hand Mounting Anchor (at the outer face of the distal socket)
  const distalHandMount = new THREE.Group();
  distalHandMount.name = side === -1 ? 'LeftDistalHandMount' : 'RightDistalHandMount';
  distalHandMount.position.set(0, -0.028, 0);
  mechanicsGroup.add(distalHandMount);

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
