import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// WRIST MODULE — Premium Humanoid Robotic Wrist Joint Assembly
// Reference: Images 1, 2, 3
//
// Architecture (proximal → distal):
//   Forearm wrist cuff (external)
//     ↓  tapered rotational collar  (compact, visibly smaller than forearm)
//     ↓  metallic bearing race stack
//     ↓  purple emissive accent ring  (signature technology accent)
//     ↓  compact actuator core housing
//     ↓  transverse flexion/extension axle pin (X-axis)
//     ↓  white ceramic styloid armor guards (lateral/medial)
//     ↓  distal palm mounting plate  (feeds into Hand)
//
// Key dimension: wrist collar r≈0.024 — visibly narrower than forearm r≈0.040
// ─────────────────────────────────────────────────────────────────────────────

export interface WristNodes {
  group: THREE.Group;
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
  // 1. TAPERED ROTATIONAL WRIST COLLAR
  //    Compact — visibly smaller than forearm cuff (r 0.022–0.025)
  //    Dark titanium to read as a separate mechanical zone.
  // ════════════════════════════════════════════════════════════
  const collarGeo = new THREE.CylinderGeometry(0.0218, 0.0248, 0.010, 30);
  const swivelCollar = new THREE.Mesh(collarGeo, materials.joint);
  swivelCollar.name = 'WristSwivelCollar';
  swivelCollar.position.set(0, -0.005, 0);
  swivelCollar.castShadow = true;
  swivelCollar.receiveShadow = true;
  mechanicsGroup.add(swivelCollar);

  // Machined retaining micro-rim at proximal face
  const rimGeo = new THREE.TorusGeometry(0.0232, 0.0013, 6, 30);
  rimGeo.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, materials.joint);
  rimMesh.position.set(0, -0.001, 0);
  mechanicsGroup.add(rimMesh);
  ribbedRings.push(rimMesh);

  // ════════════════════════════════════════════════════════════
  // 2. PRECISION BEARING STACK
  //    Two-ring metallic race + inner precision track.
  // ════════════════════════════════════════════════════════════
  // Outer metallic race
  const outerRaceGeo = new THREE.TorusGeometry(0.0225, 0.0016, 8, 34);
  outerRaceGeo.rotateX(Math.PI / 2);
  const outerRace = new THREE.Mesh(outerRaceGeo, materials.metallic);
  outerRace.position.set(0, -0.008, 0);
  mechanicsGroup.add(outerRace);
  ribbedRings.push(outerRace);

  // Inner precision track
  const innerRaceGeo = new THREE.TorusGeometry(0.0198, 0.0013, 8, 34);
  innerRaceGeo.rotateX(Math.PI / 2);
  const innerRace = new THREE.Mesh(innerRaceGeo, materials.metallic);
  innerRace.position.set(0, -0.010, 0);
  mechanicsGroup.add(innerRace);
  ribbedRings.push(innerRace);

  // ════════════════════════════════════════════════════════════
  // 3. PURPLE EMISSIVE ACCENT RING — Signature Technology Accent
  //    Concentric with the bearing — reads as an illuminated
  //    rotary encoder or optical sensor ring.
  // ════════════════════════════════════════════════════════════
  const accentGeo = new THREE.TorusGeometry(0.0235, 0.0018, 10, 38);
  accentGeo.rotateX(Math.PI / 2);
  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.name = 'WristPurpleEmissiveRing';
  accentRing.position.set(0, -0.009, 0);
  mechanicsGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // Lower dark spacer ring
  const lowerRingGeo = new THREE.TorusGeometry(0.0210, 0.0013, 6, 30);
  lowerRingGeo.rotateX(Math.PI / 2);
  const lowerRing = new THREE.Mesh(lowerRingGeo, materials.joint);
  lowerRing.position.set(0, -0.013, 0);
  mechanicsGroup.add(lowerRing);
  ribbedRings.push(lowerRing);

  // ════════════════════════════════════════════════════════════
  // 4. COMPACT ACTUATOR CORE HOUSING
  //    Central barrel housing the harmonic/cycloidal wrist drive.
  //    Significantly smaller than the bearing stack above.
  // ════════════════════════════════════════════════════════════
  const coreGeo = new THREE.CylinderGeometry(0.0180, 0.0188, 0.014, 26);
  const rotaryCore = new THREE.Mesh(coreGeo, materials.joint);
  rotaryCore.name = 'WristRotaryCore';
  rotaryCore.position.set(0, -0.020, 0);
  rotaryCore.castShadow = true;
  mechanicsGroup.add(rotaryCore);

  // Housing collar rings
  for (const cOff of [-0.004, 0.004]) {
    const hRingGeo = new THREE.TorusGeometry(0.0184, 0.0012, 6, 22);
    hRingGeo.rotateX(Math.PI / 2);
    const hRing = new THREE.Mesh(hRingGeo, materials.metallic);
    hRing.position.set(0, -0.020 + cOff, 0);
    mechanicsGroup.add(hRing);
  }

  // ════════════════════════════════════════════════════════════
  // 5. TRANSVERSE FLEXION/EXTENSION AXLE PIN (X-axis)
  //    Chrome axle visible at both lateral/medial faces.
  // ════════════════════════════════════════════════════════════
  const pinGeo = new THREE.CylinderGeometry(0.0068, 0.0068, 0.044, 22);
  pinGeo.rotateZ(Math.PI / 2);
  const pivotPin = new THREE.Mesh(pinGeo, materials.metallic);
  pivotPin.name = 'WristPivotPin';
  pivotPin.position.set(0, -0.020, 0);
  pivotPin.castShadow = true;
  mechanicsGroup.add(pivotPin);

  // Machined titanium flange caps at axle ends
  for (const pSide of [-1, 1]) {
    const capGeo = new THREE.CylinderGeometry(0.0092, 0.0092, 0.0028, 18);
    capGeo.rotateZ(Math.PI / 2);
    const endCap = new THREE.Mesh(capGeo, materials.joint);
    endCap.position.set(pSide * 0.0228, -0.020, 0);
    mechanicsGroup.add(endCap);
    styloidCaps.push(endCap);

    // Micro fastener at cap face
    const boltGeo = new THREE.CylinderGeometry(0.0011, 0.0011, 0.0018, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(pSide * 0.0242, -0.020, 0);
    mechanicsGroup.add(bolt);
  }

  // ════════════════════════════════════════════════════════════
  // 6. WHITE CERAMIC STYLOID ARMOR GUARDS
  //    Sleek compound-curve protectors at lateral & medial faces.
  //    Wrap around the axle pin ends, protecting the bearing zone.
  // ════════════════════════════════════════════════════════════
  const armorGroup = new THREE.Group();
  armorGroup.name = 'WristArmorGroup';
  wristGroup.add(armorGroup);

  // Lateral styloid cowl (compound-curved panel)
  const styloidGeoL = new THREE.CylinderGeometry(
    0.0112, 0.0128, 0.020, 18, 1, false,
    -Math.PI * 0.55, Math.PI * 1.10
  );
  styloidGeoL.rotateZ(Math.PI / 2);
  const styloidArmorLeft = new THREE.Mesh(styloidGeoL, materials.armor);
  styloidArmorLeft.name = 'WristStyloidArmorLeft';
  styloidArmorLeft.position.set(-0.0210, -0.018, 0);
  styloidArmorLeft.castShadow = true;
  armorGroup.add(styloidArmorLeft);

  const styloidGeoR = new THREE.CylinderGeometry(
    0.0112, 0.0128, 0.020, 18, 1, false,
    -Math.PI * 0.55, Math.PI * 1.10
  );
  styloidGeoR.rotateZ(Math.PI / 2);
  const styloidArmorRight = new THREE.Mesh(styloidGeoR, materials.armor);
  styloidArmorRight.name = 'WristStyloidArmorRight';
  styloidArmorRight.position.set(0.0210, -0.018, 0);
  styloidArmorRight.castShadow = true;
  armorGroup.add(styloidArmorRight);

  // Dorsal wrist cowl — bridges lateral/medial guards across the dorsum
  const cowlGeo = new THREE.BoxGeometry(0.030, 0.008, 0.007);
  const dorsalCowl = new THREE.Mesh(cowlGeo, materials.armor);
  dorsalCowl.name = 'WristDorsalCowl';
  dorsalCowl.position.set(0, -0.014, 0.018);
  dorsalCowl.rotation.x = 0.10;
  armorGroup.add(dorsalCowl);

  // Palmar cover strip
  const palmarCowlGeo = new THREE.BoxGeometry(0.030, 0.006, 0.006);
  const palmarCowl = new THREE.Mesh(palmarCowlGeo, materials.armor);
  palmarCowl.position.set(0, -0.016, -0.016);
  palmarCowl.rotation.x = -0.08;
  armorGroup.add(palmarCowl);

  // ════════════════════════════════════════════════════════════
  // 7. DISTAL PALM MOUNTING PLATE & CONNECTOR SOCKET
  //    Interfaces seamlessly with Hand.ts carpal cuff.
  // ════════════════════════════════════════════════════════════
  const plateGeo = new THREE.BoxGeometry(0.040, 0.005, 0.024);
  const distalClevis = new THREE.Mesh(plateGeo, materials.joint);
  distalClevis.name = 'WristDistalClevis';
  distalClevis.position.set(0, -0.026, 0);
  distalClevis.castShadow = true;
  distalClevis.receiveShadow = true;
  mechanicsGroup.add(distalClevis);

  const socketGeo = new THREE.CylinderGeometry(0.0156, 0.0168, 0.005, 22);
  const distalSocket = new THREE.Mesh(socketGeo, materials.joint);
  distalSocket.position.set(0, -0.028, 0);
  mechanicsGroup.add(distalSocket);

  // Mounting plate edge rim
  const plateRimGeo = new THREE.BoxGeometry(0.0420, 0.0022, 0.0260);
  const plateRim = new THREE.Mesh(plateRimGeo, materials.joint);
  plateRim.position.set(0, -0.028, 0);
  mechanicsGroup.add(plateRim);

  return {
    group: wristGroup,
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
