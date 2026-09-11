import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface WristNodes {
  group: THREE.Group;
  swivelCollar: THREE.Mesh;
  accentRing: THREE.Mesh;
  pivotPin: THREE.Mesh;
  distalClevis: THREE.Mesh;
  ribbedRings: THREE.Mesh[];
  styloidCaps: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];

  // Discrete nodes for mechanical & shell hierarchy / exploded view
  styloidArmorLeft: THREE.Mesh;
  styloidArmorRight: THREE.Mesh;
  dorsalCowl: THREE.Mesh;
  rotaryCore: THREE.Mesh;
  distalSocket: THREE.Mesh;
}

/**
 * CRITICAL CHANGE #5: REBUILT ROBOTIC WRIST TRANSMISSION
 * FOREARM -> BEARING -> ROTATIONAL COLLAR -> WRIST MOTOR -> WRIST AXLE -> PALM MOUNT
 *
 * Visually separates the hand from the forearm:
 * - Circular bearing interface with beveled titanium race
 * - Rotational pronation/supination collar with precision micro-splines
 * - Compact transverse cylindrical motor housing with radial cooling ribs
 * - Transverse flexion/extension axle pin with beveled bolt caps
 * - Tendon cable ring & actuator pulley
 * - Distal palm mounting plate with 4 M3 socket head fasteners
 * - Ergonomic ceramic styloid armor guards that leave the core mechanisms visible
 */
export function createWrist(
  side: -1 | 1,
  materials: RobotMaterialPalette
): WristNodes {
  const wristGroup = new THREE.Group();
  wristGroup.name = side === -1 ? 'LeftWristPivot' : 'RightWristPivot';

  const ledMeshes: THREE.Mesh[] = [];
  const ribbedRings: THREE.Mesh[] = [];
  const styloidCaps: THREE.Mesh[] = [];
  const wristStaticMechanics = new THREE.Group();

  // ==============================================================
  // 1. CIRCULAR BEARING & FOREARM INTERFACE FLANGE
  // ==============================================================
  const bearingFlangeGeo = new THREE.CylinderGeometry(0.038, 0.039, 0.008, 32);
  const bearingFlange = new THREE.Mesh(bearingFlangeGeo, materials.joint);
  bearingFlange.position.set(0, -0.004, 0);
  wristStaticMechanics.add(bearingFlange);

  const bearingRaceGeo = new THREE.TorusGeometry(0.0375, 0.0020, 8, 32);
  const bearingRace = new THREE.Mesh(bearingRaceGeo, materials.joint);
  bearingRace.rotation.x = Math.PI / 2;
  bearingRace.position.set(0, -0.002, 0);
  wristStaticMechanics.add(bearingRace);

  // ==============================================================
  // 2. ROTATIONAL PRONATION / SUPINATION COLLAR (Rotational Structure #1)
  // ==============================================================
  const swivelGeo = new THREE.CylinderGeometry(0.036, 0.034, 0.016, 32);
  const swivelCollar = new THREE.Mesh(swivelGeo, materials.joint);
  swivelCollar.name = 'WristSwivelCollar';
  swivelCollar.position.set(0, -0.012, 0);
  swivelCollar.castShadow = true;
  swivelCollar.receiveShadow = true;
  wristGroup.add(swivelCollar);

  // Ribbed mechanical rings with micro-grooves
  for (const wY of [-0.008, -0.016]) {
    const wRingGeo = new THREE.TorusGeometry(0.0362, 0.0016, 8, 32);
    const wRing = new THREE.Mesh(wRingGeo, materials.joint);
    wRing.rotation.x = Math.PI / 2;
    wRing.position.set(0, wY, 0);
    wristStaticMechanics.add(wRing);
    ribbedRings.push(wRing);
  }

  // Micro-spline teeth around rotational collar perimeter
  const splineCount = 16;
  for (let i = 0; i < splineCount; i++) {
    const angle = (i / splineCount) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.0020, 0.010, 0.0020);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      Math.cos(angle) * 0.0355,
      -0.012,
      Math.sin(angle) * 0.0355
    );
    tooth.rotation.y = -angle;
    wristStaticMechanics.add(tooth);
  }

  // Signature Concentric Purple Emissive Accent Ring
  const tempWristAccents = new THREE.Group();
  const accentGeo = new THREE.TorusGeometry(0.0365, 0.0016, 8, 36);
  const accentRingRaw = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRingRaw.rotation.x = Math.PI / 2;
  accentRingRaw.position.set(0, -0.012, 0);
  tempWristAccents.add(accentRingRaw);

  // ==============================================================
  // 3. COMPACT WRIST MOTOR & TRANSVERSE AXLE (Rotational Structure #2)
  // ==============================================================
  const coreHousingGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.014, 24);
  const rotaryCore = new THREE.Mesh(coreHousingGeo, materials.joint);
  rotaryCore.name = 'WristRotaryCore';
  rotaryCore.position.set(0, -0.022, 0);
  rotaryCore.castShadow = true;
  wristStaticMechanics.add(rotaryCore);

  // Motor cooling fin ribs
  for (let f = 0; f < 8; f++) {
    const angle = (f / 8) * Math.PI * 2;
    const finGeo = new THREE.BoxGeometry(0.0016, 0.012, 0.004);
    const fin = new THREE.Mesh(finGeo, materials.joint);
    fin.position.set(Math.cos(angle) * 0.027, -0.022, Math.sin(angle) * 0.027);
    fin.rotation.y = -angle;
    wristStaticMechanics.add(fin);
  }

  // Transverse Flexion/Extension Axle Pin (X-axis)
  const pinGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.052, 24);
  const pivotPin = new THREE.Mesh(pinGeo, materials.joint);
  pivotPin.name = 'WristPivotPin';
  pivotPin.rotation.z = Math.PI / 2;
  pivotPin.position.set(0, -0.022, 0);
  pivotPin.castShadow = true;
  wristStaticMechanics.add(pivotPin);

  // Machined Titanium Flange Caps at pin ends
  for (const s of [-1, 1]) {
    const endCapGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.003, 16);
    const endCap = new THREE.Mesh(endCapGeo, materials.joint);
    endCap.rotation.z = Math.PI / 2;
    endCap.position.set(s * 0.0265, -0.022, 0);
    wristStaticMechanics.add(endCap);
  }

  // Tendon Cable Ring & Actuator Pulley
  const cableRingGeo = new THREE.TorusGeometry(0.020, 0.0016, 6, 20);
  const cableRing = new THREE.Mesh(cableRingGeo, materials.joint);
  cableRing.rotation.x = Math.PI / 2;
  cableRing.position.set(0, -0.026, 0);
  wristStaticMechanics.add(cableRing);

  // ==============================================================
  // 4. DUAL-FORK CLEVIS YOKE & PALM MOUNTING PLATE
  // ==============================================================
  const clevisShape = new THREE.Shape();
  clevisShape.moveTo(-0.020, 0.014);
  clevisShape.lineTo(0.020, 0.014);
  clevisShape.lineTo(0.016, -0.014);
  clevisShape.lineTo(0.010, -0.016);
  clevisShape.lineTo(0.010, -0.004);
  clevisShape.lineTo(-0.010, -0.004);
  clevisShape.lineTo(-0.010, -0.016);
  clevisShape.lineTo(-0.016, -0.014);
  clevisShape.closePath();

  const clevisHole = new THREE.Path();
  clevisHole.moveTo(-0.008, 0.008);
  clevisHole.lineTo(0.008, 0.008);
  clevisHole.lineTo(0.006, 0.001);
  clevisHole.lineTo(-0.006, 0.001);
  clevisHole.closePath();
  clevisShape.holes.push(clevisHole);

  const clevisGeo = new THREE.ExtrudeGeometry(clevisShape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.0022,
    bevelSize: 0.0018,
    bevelSegments: 2,
  });
  clevisGeo.center();

  const distalClevis = new THREE.Mesh(clevisGeo, materials.joint);
  distalClevis.name = 'WristDistalClevis';
  distalClevis.position.set(0, -0.026, 0);
  distalClevis.castShadow = true;
  distalClevis.receiveShadow = true;
  wristGroup.add(distalClevis);

  // Distal Palm Mounting Plate (Separates hand from forearm!)
  const socketGeo = new THREE.CylinderGeometry(0.026, 0.028, 0.008, 24);
  const distalSocket = new THREE.Mesh(socketGeo, materials.joint);
  distalSocket.name = 'WristDistalSocket';
  distalSocket.position.set(0, -0.034, 0);
  distalSocket.castShadow = true;
  distalSocket.receiveShadow = true;
  wristStaticMechanics.add(distalSocket);

  // 4 M3 socket screws on palm mounting plate
  for (let b = 0; b < 4; b++) {
    const angle = (b / 4) * Math.PI * 2 + Math.PI / 4;
    const boltGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.0024, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(Math.cos(angle) * 0.021, -0.038, Math.sin(angle) * 0.021);
    wristStaticMechanics.add(bolt);
  }

  // Merge static mechanical components of the wrist
  const mergedWristMechanics = mergeGroupMeshesByMaterial(wristStaticMechanics, materials.joint, 'WristCoreMechanics_Merged', false);
  if (mergedWristMechanics) {
    mergedWristMechanics.castShadow = true;
    mergedWristMechanics.receiveShadow = true;
    wristGroup.add(mergedWristMechanics);
  }

  // Concentric purple accent ring at carpal socket interface
  const carpalAccentGeo = new THREE.TorusGeometry(0.026, 0.0014, 8, 24);
  const carpalAccent = new THREE.Mesh(carpalAccentGeo, materials.purpleEmissive);
  carpalAccent.rotation.x = Math.PI / 2;
  carpalAccent.position.set(0, -0.034, 0);
  tempWristAccents.add(carpalAccent);

  const accentRing = mergeGroupMeshesByMaterial(tempWristAccents, materials.purpleEmissive, 'WristAccentRing', false, false) || accentRingRaw;
  accentRing.name = 'WristAccentRing';
  wristGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // ==============================================================
  // 5. OUTER CERAMIC STYLOID ARMOR GUARDS
  // Flank the wrist pivot without hiding the central mechanics
  // ==============================================================
  function createStyloidCowl(cowlSide: -1 | 1): THREE.Mesh {
    const sShape = new THREE.Shape();
    sShape.moveTo(0, 0.016);
    sShape.quadraticCurveTo(0.009, 0.012, 0.010, 0.000);
    sShape.quadraticCurveTo(0.008, -0.014, 0.000, -0.018);
    sShape.quadraticCurveTo(-0.008, -0.014, -0.010, 0.000);
    sShape.quadraticCurveTo(-0.009, 0.012, 0, 0.016);
    sShape.closePath();

    const sGeo = new THREE.ExtrudeGeometry(sShape, {
      depth: 0.0065,
      bevelEnabled: true,
      bevelThickness: 0.0020,
      bevelSize: 0.0016,
      bevelSegments: 2,
    });
    sGeo.center();

    const mesh = new THREE.Mesh(sGeo, materials.armor);
    mesh.name = cowlSide === -1 ? 'WristStyloidArmor_L' : 'WristStyloidArmor_R';
    mesh.position.set(cowlSide * 0.028, -0.022, 0);
    mesh.rotation.y = cowlSide * (Math.PI / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Fastener hub
    const boltGeo = new THREE.CylinderGeometry(0.0040, 0.0040, 0.008, 12);
    const boltMesh = new THREE.Mesh(boltGeo, materials.joint);
    boltMesh.rotation.x = Math.PI / 2;
    mesh.add(boltMesh);

    return mesh;
  }

  const styloidArmorLeft = createStyloidCowl(-1);
  wristGroup.add(styloidArmorLeft);
  styloidCaps.push(styloidArmorLeft);

  const styloidArmorRight = createStyloidCowl(1);
  wristGroup.add(styloidArmorRight);
  styloidCaps.push(styloidArmorRight);

  // Dorsal ceramic cowl bridging forearm cuff to metacarpal base
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(-0.016, 0.008);
  dorsalShape.quadraticCurveTo(0, 0.010, 0.016, 0.008);
  dorsalShape.lineTo(0.013, -0.012);
  dorsalShape.quadraticCurveTo(0, -0.014, -0.013, -0.012);
  dorsalShape.closePath();

  const dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, {
    depth: 0.0045,
    bevelEnabled: true,
    bevelThickness: 0.0018,
    bevelSize: 0.0014,
    bevelSegments: 2,
  });
  dorsalGeo.center();

  const dorsalCowl = new THREE.Mesh(dorsalGeo, materials.armor);
  dorsalCowl.name = 'WristDorsalBridgeCowl';
  dorsalCowl.position.set(0, -0.020, 0.018);
  dorsalCowl.rotation.x = 0.08;
  dorsalCowl.castShadow = true;
  dorsalCowl.receiveShadow = true;
  wristGroup.add(dorsalCowl);

  // Recessed violet optical sensor slit in dorsal bridge cowl
  const slitGeo = new THREE.BoxGeometry(0.016, 0.0018, 0.002);
  const slitMesh = new THREE.Mesh(slitGeo, materials.purpleEmissive);
  slitMesh.name = 'WristDorsalOpticalSlit';
  slitMesh.position.set(0, 0, 0.0032);
  dorsalCowl.add(slitMesh);
  ledMeshes.push(slitMesh);

  return {
    group: wristGroup,
    swivelCollar,
    accentRing,
    pivotPin,
    distalClevis,
    ribbedRings,
    styloidCaps,
    ledMeshes,

    // Discrete nodes
    styloidArmorLeft,
    styloidArmorRight,
    dorsalCowl,
    rotaryCore,
    distalSocket,
  };
}
