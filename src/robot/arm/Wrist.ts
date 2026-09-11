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
 * Creates an engineered multi-axis robotic wrist joint that physically bridges the forearm to the hand:
 * 1. Outer Ceramic Shell Layer:
 *    - Left & Right sculpted white ceramic styloid process armor cowls with beveled chamfers
 *    - Dorsal ceramic bridge cowl with recessed violet optical sensor slit
 * 2. Precision Mechanical Core Layer:
 *    - Rotational dark titanium swivel collar sleeve
 *    - Concentric purple emissive accent ring
 *    - Cycloidal / harmonic drive bearing race with micro-stator teeth
 *    - Heavy-duty transverse hinge pin with machined flange caps
 *    - Machined dual-fork clevis yoke with lightening cutouts
 *    - Distal carpal socket clasping the palm root
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

  // ==============================================================
  // 1. ROTARY SWIVEL COLLAR SLEEVE (Receives Forearm Gauntlet)
  // ==============================================================
  const swivelGeo = new THREE.CylinderGeometry(0.043, 0.039, 0.020, 32);
  const swivelCollar = new THREE.Mesh(swivelGeo, materials.joint);
  swivelCollar.name = 'WristSwivelCollar';
  swivelCollar.position.set(0, -0.004, 0);
  swivelCollar.castShadow = true;
  swivelCollar.receiveShadow = true;
  wristGroup.add(swivelCollar);

  const wristStaticMechanics = new THREE.Group();

  // Concentric Ribbed Mechanical Rings (Layered dark metal detailing)
  for (const wY of [-0.002, -0.009]) {
    const wRingGeo = new THREE.TorusGeometry(0.041, 0.0025, 10, 32);
    const wRing = new THREE.Mesh(wRingGeo, materials.joint);
    wRing.rotation.x = Math.PI / 2;
    wRing.position.set(0, wY, 0);
    wRing.castShadow = true;
    wristStaticMechanics.add(wRing);
    ribbedRings.push(wRing);
  }

  const tempWristAccents = new THREE.Group();

  // Signature Purple Emissive Accent Ring (Concentric glowing band around swivel collar)
  const accentGeo = new THREE.TorusGeometry(0.0418, 0.0018, 10, 36);
  const accentRingRaw = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRingRaw.rotation.x = Math.PI / 2;
  accentRingRaw.position.set(0, -0.006, 0);
  tempWristAccents.add(accentRingRaw);

  // ==============================================================
  // 2. ROTARY CORE & HARMONIC DRIVE BEARING RACE
  // ==============================================================
  const coreHousingGeo = new THREE.CylinderGeometry(0.033, 0.031, 0.012, 28);
  const rotaryCore = new THREE.Mesh(coreHousingGeo, materials.joint);
  rotaryCore.name = 'WristRotaryCore';
  rotaryCore.position.set(0, -0.012, 0);
  rotaryCore.castShadow = true;
  rotaryCore.receiveShadow = true;
  wristStaticMechanics.add(rotaryCore);

  // Perimeter micro-stator spline teeth around harmonic drive
  const splineCount = 14;
  for (let i = 0; i < splineCount; i++) {
    const angle = (i / splineCount) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.0022, 0.008, 0.0025);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      Math.cos(angle) * 0.033,
      -0.012,
      Math.sin(angle) * 0.031
    );
    tooth.rotation.y = -angle;
    tooth.castShadow = true;
    wristStaticMechanics.add(tooth);
  }

  // ==============================================================
  // 3. FLEXION/EXTENSION CROSS-AXIS PIVOT PIN (Transverse Hinge)
  // ==============================================================
  const pinGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.048, 24);
  const pivotPin = new THREE.Mesh(pinGeo, materials.joint);
  pivotPin.name = 'WristPivotPin';
  pivotPin.rotation.z = Math.PI / 2;
  pivotPin.position.set(0, -0.014, 0);
  pivotPin.castShadow = true;
  pivotPin.receiveShadow = true;
  wristStaticMechanics.add(pivotPin);

  // Machined Titanium Flange Caps at pin ends
  for (const s of [-1, 1]) {
    const endCapGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.003, 16);
    const endCap = new THREE.Mesh(endCapGeo, materials.joint);
    endCap.rotation.z = Math.PI / 2;
    endCap.position.set(s * 0.0245, -0.014, 0);
    endCap.castShadow = true;
    wristStaticMechanics.add(endCap);
  }

  // ==============================================================
  // 4. MACHINED DUAL-FORK CLEVIS YOKE (Clasps Carpal Stem)
  // ==============================================================
  // True dual-fork clevis shape with lightening window
  const clevisShape = new THREE.Shape();
  clevisShape.moveTo(-0.019, 0.012);
  clevisShape.lineTo(0.019, 0.012);
  clevisShape.lineTo(0.015, -0.013);
  clevisShape.lineTo(0.009, -0.015);
  clevisShape.lineTo(0.009, -0.004);
  clevisShape.lineTo(-0.009, -0.004);
  clevisShape.lineTo(-0.009, -0.015);
  clevisShape.lineTo(-0.015, -0.013);
  clevisShape.closePath();

  // Central lightening hole
  const clevisHole = new THREE.Path();
  clevisHole.moveTo(-0.008, 0.007);
  clevisHole.lineTo(0.008, 0.007);
  clevisHole.lineTo(0.006, 0.000);
  clevisHole.lineTo(-0.006, 0.000);
  clevisHole.closePath();
  clevisShape.holes.push(clevisHole);

  const clevisGeo = new THREE.ExtrudeGeometry(clevisShape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.0020,
    bevelSegments: 2,
  });
  clevisGeo.center();

  const distalClevis = new THREE.Mesh(clevisGeo, materials.joint);
  distalClevis.name = 'WristDistalClevis';
  distalClevis.position.set(0, -0.018, 0);
  distalClevis.castShadow = true;
  distalClevis.receiveShadow = true;
  wristGroup.add(distalClevis);

  // Distal Carpal Socket Collar (Mating ring for the hand)
  const socketGeo = new THREE.CylinderGeometry(0.023, 0.025, 0.008, 24);
  const distalSocket = new THREE.Mesh(socketGeo, materials.joint);
  distalSocket.name = 'WristDistalSocket';
  distalSocket.position.set(0, -0.024, 0);
  distalSocket.castShadow = true;
  distalSocket.receiveShadow = true;
  wristStaticMechanics.add(distalSocket);

  // Merge static mechanical components of the wrist
  const mergedWristMechanics = mergeGroupMeshesByMaterial(wristStaticMechanics, materials.joint, 'WristCoreMechanics_Merged', false);
  if (mergedWristMechanics) {
    mergedWristMechanics.castShadow = true;
    mergedWristMechanics.receiveShadow = true;
    wristGroup.add(mergedWristMechanics);
  }

  // Concentric purple accent ring at carpal socket interface
  const carpalAccentGeo = new THREE.TorusGeometry(0.024, 0.0014, 8, 24);
  const carpalAccent = new THREE.Mesh(carpalAccentGeo, materials.purpleEmissive);
  carpalAccent.rotation.x = Math.PI / 2;
  carpalAccent.position.set(0, -0.024, 0);
  tempWristAccents.add(carpalAccent);

  const accentRing = mergeGroupMeshesByMaterial(tempWristAccents, materials.purpleEmissive, 'WristAccentRing', false, false) || accentRingRaw;
  accentRing.name = 'WristAccentRing';
  wristGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // ==============================================================
  // 5. OUTER SHELL: SCULPTED WHITE CERAMIC STYLOID COWLS
  // ==============================================================
  // Left and Right ergonomic styloid armor guards wrapping the pivot
  function createStyloidCowl(cowlSide: -1 | 1): THREE.Mesh {
    const sShape = new THREE.Shape();
    sShape.moveTo(0, 0.018);
    sShape.quadraticCurveTo(0.010, 0.014, 0.011, 0.000);
    sShape.quadraticCurveTo(0.009, -0.016, 0.000, -0.020);
    sShape.quadraticCurveTo(-0.009, -0.016, -0.011, 0.000);
    sShape.quadraticCurveTo(-0.010, 0.014, 0, 0.018);
    sShape.closePath();

    const sGeo = new THREE.ExtrudeGeometry(sShape, {
      depth: 0.0075,
      bevelEnabled: true,
      bevelThickness: 0.0022,
      bevelSize: 0.0018,
      bevelSegments: 3,
      curveSegments: 16,
    });
    sGeo.center();

    const mesh = new THREE.Mesh(sGeo, materials.armor);
    mesh.name = cowlSide === -1 ? 'WristStyloidArmor_L' : 'WristStyloidArmor_R';
    mesh.position.set(cowlSide * 0.0265, -0.014, 0);
    mesh.rotation.y = cowlSide * (Math.PI / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Embedded dark titanium pivot fastener hub in the cowl center
    const boltGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.0085, 12);
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

  // ==============================================================
  // 6. OUTER SHELL: SCULPTED DORSAL BRIDGE COWL
  // ==============================================================
  // Ceramic dorsal cowl bridging forearm cuff to metacarpal base
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(-0.018, 0.008);
  dorsalShape.quadraticCurveTo(0, 0.010, 0.018, 0.008);
  dorsalShape.lineTo(0.015, -0.012);
  dorsalShape.quadraticCurveTo(0, -0.014, -0.015, -0.012);
  dorsalShape.closePath();

  const dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, {
    depth: 0.005,
    bevelEnabled: true,
    bevelThickness: 0.0020,
    bevelSize: 0.0016,
    bevelSegments: 2,
    curveSegments: 16,
  });
  dorsalGeo.center();

  const dorsalCowl = new THREE.Mesh(dorsalGeo, materials.armor);
  dorsalCowl.name = 'WristDorsalBridgeCowl';
  dorsalCowl.position.set(0, -0.013, 0.018);
  dorsalCowl.rotation.x = 0.08;
  dorsalCowl.castShadow = true;
  dorsalCowl.receiveShadow = true;
  wristGroup.add(dorsalCowl);

  // Recessed violet optical sensor slit in dorsal bridge cowl
  const slitGeo = new THREE.BoxGeometry(0.018, 0.0020, 0.002);
  const slitMesh = new THREE.Mesh(slitGeo, materials.purpleEmissive);
  slitMesh.name = 'WristDorsalOpticalSlit';
  slitMesh.position.set(0, 0, 0.0035);
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
