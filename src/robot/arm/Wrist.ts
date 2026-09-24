/**
 * ============================================================================
 * WRIST MODULE — DEDICATED HOUSING & ROTATIONAL ASSEMBLY
 * ============================================================================
 *
 * Implements a dedicated, structural wrist housing module:
 * - Dedicated Wrist Housing: Faceted CNC-machined titanium enclosure block
 *   with chamfered corners, bilateral styloid trunnion ears, and inspection cutouts.
 * - Rotational Assembly: Integrated nested crossed-roller bearing stack,
 *   harmonic drive collar, transverse axle pin, and signature purple emissive accent ring.
 * - Precision End-Effector Interface: 8-bolt titanium mounting plate with central bore.
 * - Absolute Stop Condition: No hands, fingers, or grippers.
 * ============================================================================
 */

import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

export interface WristNodes {
  group: THREE.Group;
  wristPivot: THREE.Group;
  swivelCollar: THREE.Mesh;
  accentRing: THREE.Mesh;
  pivotPin: THREE.Mesh;
  distalInterfacePlate: THREE.Mesh;
  ribbedRings: THREE.Mesh[];
  styloidCaps: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];
  styloidArmorLeft: THREE.Mesh;
  styloidArmorRight: THREE.Mesh;
  dorsalCowl: THREE.Mesh;
  rotaryCore: THREE.Mesh;
  distalSocket: THREE.Mesh;
  distalHandMount: THREE.Group;
  // Compatibility alias
  distalClevis: THREE.Mesh;
  dedicatedWristHousing?: THREE.Group;
}

export function createWrist(
  side: -1 | 1,
  materials: RobotMaterialPalette
): WristNodes {
  const wristGroup = new THREE.Group();
  wristGroup.name = side === -1 ? 'LeftWristInterface' : 'RightWristInterface';

  const ledMeshes: THREE.Mesh[] = [];
  const ribbedRings: THREE.Mesh[] = [];
  const styloidCaps: THREE.Mesh[] = [];

  // ════════════════════════════════════════════════════════════
  // 1. DEDICATED STRUCTURAL WRIST HOUSING BLOCK
  //    Stationary relative to forearm distal mount.
  //    Faceted enclosure with chamfers, bilateral styloid bosses, and internal bore.
  // ════════════════════════════════════════════════════════════
  const dedicatedWristHousing = new THREE.Group();
  dedicatedWristHousing.name = 'DedicatedWristHousing';
  wristGroup.add(dedicatedWristHousing);

  // Main faceted housing block (36mm wide, 22mm high, 32mm deep)
  const housingBodyGeo = new THREE.BoxGeometry(0.036, 0.022, 0.032);
  const housingBody = new THREE.Mesh(housingBodyGeo, materials.joint);
  housingBody.name = 'WristHousingMainBody';
  housingBody.position.set(0, -0.011, 0);
  housingBody.castShadow = true;
  housingBody.receiveShadow = true;
  dedicatedWristHousing.add(housingBody);

  // Top docking collar (seats inside forearm gauntlet distal socket)
  const topDockGeo = new THREE.CylinderGeometry(0.0185, 0.0195, 0.008, 28);
  const topDock = new THREE.Mesh(topDockGeo, materials.joint);
  topDock.position.set(0, 0.002, 0);
  topDock.castShadow = true;
  dedicatedWristHousing.add(topDock);

  const topDockRimGeo = new THREE.TorusGeometry(0.0190, 0.0010, 6, 28);
  topDockRimGeo.rotateX(Math.PI / 2);
  const topDockRim = new THREE.Mesh(topDockRimGeo, materials.metallic);
  topDockRim.position.set(0, 0.004, 0);
  dedicatedWristHousing.add(topDockRim);
  ribbedRings.push(topDockRim);

  // Bilateral Chamfered Corner Reinforcements
  for (const cSide of [-1, 1]) {
    const cornerGeo = new THREE.BoxGeometry(0.005, 0.020, 0.030);
    const corner = new THREE.Mesh(cornerGeo, materials.joint);
    corner.position.set(cSide * 0.017, -0.011, 0);
    dedicatedWristHousing.add(corner);

    // Bilateral Styloid Trunnion Bosses (Anatomical styloid process mecha equivalents)
    const styloidBossGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.0028, 20);
    styloidBossGeo.rotateZ(Math.PI / 2);
    const styloidBoss = new THREE.Mesh(styloidBossGeo, materials.joint);
    styloidBoss.position.set(cSide * 0.0190, -0.011, 0);
    styloidBoss.castShadow = true;
    dedicatedWristHousing.add(styloidBoss);

    const styloidRimGeo = new THREE.TorusGeometry(0.0072, 0.0008, 6, 20);
    styloidRimGeo.rotateY(Math.PI / 2);
    const styloidRim = new THREE.Mesh(styloidRimGeo, materials.metallic);
    styloidRim.position.set(cSide * (0.0190 + 0.0016), -0.011, 0);
    dedicatedWristHousing.add(styloidRim);

    // Chrome central pivot bolt
    const boltGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.0026, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.metallic);
    bolt.position.set(cSide * (0.0190 + 0.0022), -0.011, 0);
    dedicatedWristHousing.add(bolt);
    styloidCaps.push(bolt);
  }

  // Anterior & Posterior Inspection Cutouts (Reveals internal bearing and accent ring)
  for (const cutZ of [-0.015, 0.015]) {
    const cutBezelGeo = new THREE.BoxGeometry(0.020, 0.009, 0.0018);
    const cutBezel = new THREE.Mesh(cutBezelGeo, materials.metallic);
    cutBezel.position.set(0, -0.011, cutZ);
    dedicatedWristHousing.add(cutBezel);
  }

  // ════════════════════════════════════════════════════════════
  // 2. DEDICATED ROTATIONAL PIVOT & MECHANICS ASSEMBLY
  //    Integrated directly inside the dedicated housing.
  // ════════════════════════════════════════════════════════════
  const wristPivot = new THREE.Group();
  wristPivot.name = side === -1 ? 'LeftWristPivot' : 'RightWristPivot';
  wristPivot.position.set(0, -0.012, 0);
  wristGroup.add(wristPivot);

  const mechanicsGroup = new THREE.Group();
  mechanicsGroup.name = 'WristMechanics';
  wristPivot.add(mechanicsGroup);

  // Rotational Harmonic Drive Collar
  const collarGeo = new THREE.CylinderGeometry(0.0165, 0.0175, 0.012, 28);
  const swivelCollar = new THREE.Mesh(collarGeo, materials.joint);
  swivelCollar.name = 'WristSwivelCollar';
  swivelCollar.position.set(0, 0, 0);
  swivelCollar.castShadow = true;
  swivelCollar.receiveShadow = true;
  mechanicsGroup.add(swivelCollar);

  // Precision Metallic Crossed-Roller Bearing Race Ring
  const outerRaceGeo = new THREE.TorusGeometry(0.0168, 0.0011, 8, 30);
  outerRaceGeo.rotateX(Math.PI / 2);
  const outerRace = new THREE.Mesh(outerRaceGeo, materials.metallic);
  outerRace.position.set(0, 0.002, 0);
  mechanicsGroup.add(outerRace);
  ribbedRings.push(outerRace);

  // Signature Purple Emissive Accent Ring (Nestled in housing inspection window)
  const accentGeo = new THREE.TorusGeometry(0.0170, 0.0013, 8, 32);
  accentGeo.rotateX(Math.PI / 2);
  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.name = 'WristPurpleEmissiveRing';
  accentRing.position.set(0, 0, 0);
  mechanicsGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // High-intensity Bloom Ring
  const bloomGeo = new THREE.TorusGeometry(0.0170, 0.0030, 8, 28);
  bloomGeo.rotateX(Math.PI / 2);
  const bloomMesh = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomMesh.position.copy(accentRing.position);
  mechanicsGroup.add(bloomMesh);

  // Transverse Axle Pin
  const pinGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.038, 16);
  pinGeo.rotateZ(Math.PI / 2);
  const pivotPin = new THREE.Mesh(pinGeo, materials.metallic);
  pivotPin.name = 'WristPivotPin';
  pivotPin.position.set(0, 0, 0);
  pivotPin.castShadow = true;
  mechanicsGroup.add(pivotPin);

  // Actuator Rotary Core
  const coreGeo = new THREE.CylinderGeometry(0.0140, 0.0150, 0.012, 20);
  const rotaryCore = new THREE.Mesh(coreGeo, materials.joint);
  rotaryCore.name = 'WristRotaryCore';
  rotaryCore.position.set(0, -0.005, 0);
  rotaryCore.castShadow = true;
  mechanicsGroup.add(rotaryCore);

  // ════════════════════════════════════════════════════════════
  // 3. PRECISION CNC-MACHINED WRIST MOUNTING INTERFACE PLATE
  //    8 M2.5 hex socket screws on pitch circle + central wiring bore.
  // ════════════════════════════════════════════════════════════
  const plateRadius = 0.0175;
  const plateThickness = 0.0042;
  const centralBoreR = 0.0050;

  const plateShape = new THREE.Shape();
  plateShape.absarc(0, 0, plateRadius, 0, Math.PI * 2, false);
  const borePath = new THREE.Path();
  borePath.absarc(0, 0, centralBoreR, 0, Math.PI * 2, true);
  plateShape.holes.push(borePath);

  const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
    depth: plateThickness,
    bevelEnabled: true,
    bevelThickness: 0.0008,
    bevelSize: 0.0008,
    bevelSegments: 2,
    curveSegments: 32,
  });
  plateGeo.center();

  const distalInterfacePlate = new THREE.Mesh(plateGeo, materials.joint);
  distalInterfacePlate.name = 'WristDistalInterfacePlate';
  distalInterfacePlate.rotation.x = Math.PI / 2;
  distalInterfacePlate.position.set(0, -0.014, 0);
  distalInterfacePlate.castShadow = true;
  distalInterfacePlate.receiveShadow = true;
  mechanicsGroup.add(distalInterfacePlate);

  // Metallic Outer Flange Rim
  const flangeRimGeo = new THREE.TorusGeometry(plateRadius * 0.98, 0.0009, 6, 28);
  flangeRimGeo.rotateX(Math.PI / 2);
  const flangeRim = new THREE.Mesh(flangeRimGeo, materials.metallic);
  flangeRim.position.set(0, -0.014 - plateThickness * 0.45, 0);
  mechanicsGroup.add(flangeRim);

  // 8 M2.5 Precision Hex Socket Cap Screws on Pitch Circle (R = 0.0125m)
  const boltCount = 8;
  const boltPitchR = 0.0125;
  for (let b = 0; b < boltCount; b++) {
    const angle = (b / boltCount) * Math.PI * 2;
    const socketGeo = new THREE.CylinderGeometry(0.0011, 0.0011, 0.0018, 10);
    const socketMesh = new THREE.Mesh(socketGeo, materials.metallic);
    socketMesh.position.set(
      Math.sin(angle) * boltPitchR,
      -0.014 - plateThickness * 0.40,
      Math.cos(angle) * boltPitchR
    );
    mechanicsGroup.add(socketMesh);

    const boltGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.0022, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      Math.sin(angle) * boltPitchR,
      -0.014 - plateThickness * 0.48,
      Math.cos(angle) * boltPitchR
    );
    mechanicsGroup.add(bolt);
  }

  // Central Wiring Conduit Bore Tube extending upward
  const conduitBoreGeo = new THREE.CylinderGeometry(centralBoreR * 0.95, centralBoreR * 0.95, 0.012, 16, 1, true);
  const conduitBore = new THREE.Mesh(conduitBoreGeo, materials.joint);
  conduitBore.position.set(0, -0.008, 0);
  mechanicsGroup.add(conduitBore);

  // Dedicated Hand Mounting Anchor (at the outer face of the 8-bolt plate)
  const distalHandMount = new THREE.Group();
  distalHandMount.name = side === -1 ? 'LeftDistalHandMount' : 'RightDistalHandMount';
  distalHandMount.position.set(0, -0.014 - plateThickness * 0.50, 0);
  mechanicsGroup.add(distalHandMount);

  // Compatibility proxies
  const styloidArmorLeft = housingBody;
  const styloidArmorRight = housingBody;
  const dorsalCowl = housingBody;
  const distalSocket = distalInterfacePlate;
  const distalClevis = distalInterfacePlate;

  return {
    group: wristGroup,
    wristPivot,
    swivelCollar,
    accentRing,
    pivotPin,
    distalInterfacePlate,
    distalHandMount,
    ribbedRings,
    styloidCaps,
    ledMeshes,
    styloidArmorLeft,
    styloidArmorRight,
    dorsalCowl,
    rotaryCore,
    distalSocket,
    distalClevis,
    dedicatedWristHousing,
  };
}
