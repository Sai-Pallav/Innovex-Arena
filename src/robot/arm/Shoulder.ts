import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface ShoulderNodes {
  group: THREE.Group;                  // ShoulderPivot root
  jointGroup: THREE.Group;             // ShoulderJoint rotating assembly
  armorGroup: THREE.Group;             // ShoulderArmor assembly (dummy/safe)
  shoulderArmor: THREE.Mesh;           // White outer protective shell (invisible)
  rotationalCore: THREE.Mesh;          // Central rotational disc / core hub
  outerRing: THREE.Mesh;               // Outer black ring framing joint
  innerRing: THREE.Mesh;               // Inner black ring towards torso
  innerStructure: THREE.Group;         // Segmented mechanical stator / gear ring
  upperArmConnector: THREE.Group;      // Articulated black connector
  accentRing: THREE.Mesh;              // Purple emissive accent ring
  torsoMountPlate: THREE.Mesh;         // Shoulder mounting plate
  ledMeshes: THREE.Mesh[];             // Emissive meshes for lighting

  // Mechanical Open / Exploded Hierarchy Nodes:
  gimbalYoke: THREE.Group;             // Arching structural titanium yoke
  cycloidalDrive: THREE.Group;         // Planetary gear drive & roller bearings
  faceplateHub: THREE.Group;           // Precision billet faceplate & fasteners
  damperActuator: THREE.Group;         // Hydraulic damper strut assembly
  damperPiston: THREE.Mesh;            // Telescopic chrome piston rod
  damperCylinder: THREE.Mesh;          // Damper pressure cylinder

  // Backwards compatibility aliases
  rotatingHub: THREE.Mesh;
  ballJoint: THREE.Mesh;
  pauldronCowl: THREE.Mesh;
  socketApertureRim: THREE.Mesh;
}

/**
 * RECONSTRUCTED HIGH-PRECISION ROBOTIC SHOULDER MECHANISM
 * Precision industrial robotic gimbal joint:
 * - Structural Cast Titanium Clavicle Yoke capping the joint with chamfered truss ribs
 * - Hydraulic Assist Damper Strut with chrome telescopic piston
 * - Multi-stage Rotary Core with Harmonic Cycloidal Planetary Drive & 16 drive pins
 * - Concentric Machined Titanium Bearing Rings with Dual Purple LED Halos
 * - Billet Faceplate with 8 precision hex-socket fasteners and knurled magnetic hub
 * - Articulated Dual-Clevis & Trunnion Stem seamlessly mating with bicep socket cup
 * - Discrete concentric hierarchy nodes for CAD mechanical exploded inspection
 */
export function createShoulder(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ShoulderNodes {
  // 1. Root ShoulderPivot
  const shoulderGroup = new THREE.Group();
  shoulderGroup.name = side === -1 ? 'LeftShoulderPivot' : 'RightShoulderPivot';

  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 2. SCULPTED WHITE CERAMIC PAULDRON COWL
  // Full anatomical deltoid armor shell wrapping the shoulder joint crown,
  // anterior face, and lateral deltoid contour, eliminating exposed pipe look
  // ==========================================
  const armorGroup = new THREE.Group();
  armorGroup.name = side === -1 ? 'LeftShoulderArmor' : 'RightShoulderArmor';
  armorGroup.position.set(side * 0.008, 0.012, 0);
  shoulderGroup.add(armorGroup);

  // Form-fitting aerodynamic deltoid pauldron cowl
  const pauldronGeo = new THREE.SphereGeometry(
    0.064,
    32,
    22,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.54
  );
  // Athletic deltoid curvature
  pauldronGeo.scale(1.12, 0.88, 1.06);

  const shoulderArmor = new THREE.Mesh(pauldronGeo, materials.armorDoubleSide);
  shoulderArmor.name = side === -1 ? 'LeftShoulderArmorShell' : 'RightShoulderArmorShell';
  shoulderArmor.rotation.z = -side * 0.16;
  shoulderArmor.rotation.x = 0.04;
  shoulderArmor.castShadow = true;
  shoulderArmor.receiveShadow = true;
  armorGroup.add(shoulderArmor);

  // Pauldron lower chamfer rim gasket
  const pauldronRimGeo = new THREE.TorusGeometry(0.062, 0.0028, 8, 32);
  const pauldronRim = new THREE.Mesh(pauldronRimGeo, materials.joint);
  pauldronRim.rotation.x = Math.PI / 2;
  pauldronRim.position.set(0, -0.024, 0);
  armorGroup.add(pauldronRim);

  // Pauldron recessed purple accent slit along deltoid line
  const pauldronAccentGeo = new THREE.TorusGeometry(0.056, 0.0016, 6, 28, Math.PI * 0.75);
  const pauldronAccent = new THREE.Mesh(pauldronAccentGeo, materials.purpleEmissive);
  pauldronAccent.rotation.z = side * 0.25;
  pauldronAccent.position.set(side * 0.004, 0.004, 0.028);
  armorGroup.add(pauldronAccent);
  ledMeshes.push(pauldronAccent);

  // ==========================================
  // 3. STRUCTURAL GIMBAL YOKE (Chassis Frame)
  // Arches over the joint from the chest frame, giving the shoulder a solid,
  // engineered industrial skeleton integrated into the torso socket
  // ==========================================
  const gimbalYoke = new THREE.Group();
  gimbalYoke.name = side === -1 ? 'LeftGimbalYoke' : 'RightGimbalYoke';
  shoulderGroup.add(gimbalYoke);

  // Heavy-duty C-shaped cast titanium truss yoke wrapping the joint
  const yokeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-side * 0.010, 0.006, -0.020),
    new THREE.Vector3(-side * 0.004, 0.032, -0.010),
    new THREE.Vector3(side * 0.010, 0.038, 0.000),
    new THREE.Vector3(side * 0.024, 0.028, 0.010),
    new THREE.Vector3(side * 0.028, 0.008, 0.016),
  ]);
  const yokeSpineGeo = new THREE.TubeGeometry(yokeCurve, 18, 0.0058, 8, false);
  const yokeSpine = new THREE.Mesh(yokeSpineGeo, materials.joint);

  // Structural cross-ribs & weight-reduction gussets
  const ribGeo = new THREE.BoxGeometry(0.010, 0.022, 0.006);
  const yokeRib = new THREE.Mesh(ribGeo, materials.joint);
  yokeRib.position.set(side * 0.006, 0.026, 0.000);
  yokeRib.rotation.z = side * 0.25;

  const tempYoke = new THREE.Group();
  tempYoke.add(yokeSpine);
  tempYoke.add(yokeRib);
  const yokeMerged = mergeGroupMeshesByMaterial(tempYoke, materials.joint, 'GimbalYoke_Joint')!;
  tempYoke.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  gimbalYoke.add(yokeMerged);

  // ==========================================
  // 4. HYDRAULIC DAMPER ACTUATOR
  // Industrial servo assist strut linking clavicle chassis down to joint yoke
  // ==========================================
  const damperActuator = new THREE.Group();
  damperActuator.name = side === -1 ? 'LeftDamperActuator' : 'RightDamperActuator';
  damperActuator.position.set(side * 0.004, 0.038, 0.016);
  damperActuator.rotation.x = 0.28;
  damperActuator.rotation.z = side * 0.32;
  shoulderGroup.add(damperActuator);

  // Industrial servo assist strut linking clavicle chassis down to joint yoke
  const tempDamper = new THREE.Group();

  // Main high-pressure pressure cylinder
  const cylGeo = new THREE.CylinderGeometry(0.0068, 0.0068, 0.032, 16);
  const damperCylinder = new THREE.Mesh(cylGeo, materials.joint);
  damperCylinder.position.set(0, 0.010, 0);
  tempDamper.add(damperCylinder);

  // Anodized violet collar ring on damper cylinder
  const damperCollarGeo = new THREE.TorusGeometry(0.0072, 0.0016, 6, 16);
  const damperCollar = new THREE.Mesh(damperCollarGeo, materials.purpleEmissive);
  damperCollar.rotation.x = Math.PI / 2;
  damperCollar.position.set(0, 0.002, 0);
  damperActuator.add(damperCollar);
  ledMeshes.push(damperCollar);

  // Mirror-chrome telescopic piston shaft + lower eyelet
  const pistonGeo = new THREE.CylinderGeometry(0.0042, 0.0042, 0.036, 16);
  const damperPiston = new THREE.Mesh(pistonGeo, materials.joint);
  damperPiston.position.set(0, -0.018, 0);
  tempDamper.add(damperPiston);

  const eyeletGeo = new THREE.SphereGeometry(0.0055, 12, 12);
  const eyelet = new THREE.Mesh(eyeletGeo, materials.joint);
  eyelet.position.set(0, -0.034, 0);
  tempDamper.add(eyelet);

  const damperMerged = mergeGroupMeshesByMaterial(tempDamper, materials.joint, 'DamperActuator_Merged')!;
  tempDamper.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  damperActuator.add(damperMerged);

  // ==========================================
  // 5. SHOULDER JOINT ROTATIONAL CORE
  // ==========================================
  const jointGroup = new THREE.Group();
  jointGroup.name = side === -1 ? 'LeftShoulderJoint' : 'RightShoulderJoint';
  jointGroup.rotation.y = -side * 0.06;
  shoulderGroup.add(jointGroup);

  // A. Medial Docking Face & Inward Collar (Mates with Chest Socket)
  const mountPlateGeo = new THREE.CylinderGeometry(0.046, 0.044, 0.016, 24);
  const torsoMountPlate = new THREE.Mesh(mountPlateGeo, materials.joint);
  torsoMountPlate.name = side === -1 ? 'LeftTorsoMountPlate' : 'RightTorsoMountPlate';
  torsoMountPlate.rotation.z = Math.PI / 2;
  torsoMountPlate.position.set(-side * 0.008, 0, 0);

  const inwardRimGeo = new THREE.TorusGeometry(0.046, 0.0035, 6, 24);
  const inwardRim = new THREE.Mesh(inwardRimGeo, materials.joint);
  inwardRim.rotation.y = Math.PI / 2;
  inwardRim.position.set(-side * 0.010, 0, 0);

  // Main Dark Titanium Spherical Ball Joint Core (Blueprint Panel 3)
  const sphereBallGeo = new THREE.SphereGeometry(0.046, 28, 22);
  const sphereBall = new THREE.Mesh(sphereBallGeo, materials.joint);
  sphereBall.position.set(side * 0.008, 0, 0);

  // Concentric bearing race collar
  const coreHousingGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.024, 28);
  const coreHousing = new THREE.Mesh(coreHousingGeo, materials.joint);
  coreHousing.rotation.z = Math.PI / 2;
  coreHousing.position.set(side * 0.008, 0, 0);

  // Machined bevel ring around core housing
  const coreBevelGeo = new THREE.TorusGeometry(0.046, 0.0028, 8, 28);
  const coreBevel = new THREE.Mesh(coreBevelGeo, materials.joint);
  coreBevel.rotation.y = Math.PI / 2;
  coreBevel.position.set(side * 0.004, 0, 0);

  const tempJointCore = new THREE.Group();
  tempJointCore.add(torsoMountPlate);
  tempJointCore.add(inwardRim);
  tempJointCore.add(sphereBall);
  tempJointCore.add(coreHousing);
  tempJointCore.add(coreBevel);

  // 6 M4 Socket Cap Fasteners on Torso Mount Flange
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.003, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(-side * 0.006, Math.sin(angle) * 0.038, Math.cos(angle) * 0.038);
    tempJointCore.add(bolt);
  }

  const jointCoreMerged = mergeGroupMeshesByMaterial(tempJointCore, materials.joint, 'ShoulderCore_Merged')!;
  tempJointCore.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  jointGroup.add(jointCoreMerged);

  // B. Stator Ring & Harmonic Core
  const innerStructure = new THREE.Group();
  innerStructure.name = side === -1 ? 'LeftInnerStructure' : 'RightInnerStructure';
  innerStructure.position.set(side * 0.010, 0, 0);
  jointGroup.add(innerStructure);

  const statorBaseGeo = new THREE.CylinderGeometry(0.047, 0.047, 0.016, 24);
  const statorBase = new THREE.Mesh(statorBaseGeo, materials.joint);
  statorBase.rotation.z = Math.PI / 2;

  const tempStator = new THREE.Group();
  tempStator.add(statorBase);
  // 12 radial stator teeth
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.014, 0.0032, 0.0060);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      0,
      Math.sin(angle) * 0.0485,
      Math.cos(angle) * 0.0485
    );
    tooth.rotation.x = angle;
    tempStator.add(tooth);
  }

  const statorMerged = mergeGroupMeshesByMaterial(tempStator, materials.joint, 'StatorStructure_Merged')!;
  tempStator.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  innerStructure.add(statorMerged);

  // C. Cycloidal Planetary Drive Ring (Exploded Stage 4)
  const cycloidalDrive = new THREE.Group();
  cycloidalDrive.name = side === -1 ? 'LeftCycloidalDrive' : 'RightCycloidalDrive';
  cycloidalDrive.position.set(side * 0.014, 0, 0);
  jointGroup.add(cycloidalDrive);

  // Planetary ring body
  const gearRingGeo = new THREE.TorusGeometry(0.042, 0.0032, 8, 24);
  const gearRing = new THREE.Mesh(gearRingGeo, materials.joint);
  gearRing.rotation.y = Math.PI / 2;

  const tempDrive = new THREE.Group();
  tempDrive.add(gearRing);
  // 16 Cycloidal drive roller pins around perimeter
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const pinGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0040, 8);
    const pin = new THREE.Mesh(pinGeo, materials.joint);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(
      0,
      Math.sin(angle) * 0.038,
      Math.cos(angle) * 0.038
    );
    tempDrive.add(pin);
  }

  const driveMerged = mergeGroupMeshesByMaterial(tempDrive, materials.joint, 'CycloidalDrive_Merged')!;
  tempDrive.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  cycloidalDrive.add(driveMerged);

  // D. Precision Concentric Bearing Race & LED Halo (Exploded Stage 5)
  const tempShoulderAccents = new THREE.Group();

  // Signature Concentric Purple Emissive Accent Ring (Concentric within bearing)
  const accentGeo = new THREE.TorusGeometry(0.032, 0.0022, 8, 28);
  const accentRingRaw = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRingRaw.rotation.y = Math.PI / 2;
  accentRingRaw.position.set(side * 0.017, 0, 0);
  tempShoulderAccents.add(accentRingRaw);

  // Secondary inner concentric halo line
  const innerHaloGeo = new THREE.TorusGeometry(0.020, 0.0015, 6, 20);
  const innerHalo = new THREE.Mesh(innerHaloGeo, materials.purpleEmissive);
  innerHalo.rotation.y = Math.PI / 2;
  innerHalo.position.set(side * 0.018, 0, 0);
  tempShoulderAccents.add(innerHalo);

  const accentRing = mergeGroupMeshesByMaterial(tempShoulderAccents, materials.purpleEmissive, side === -1 ? 'LeftShoulderAccentRing' : 'RightShoulderAccentRing', false, false) || accentRingRaw;
  accentRing.name = side === -1 ? 'LeftShoulderAccentRing' : 'RightShoulderAccentRing';
  jointGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // Stepped inner machined titanium ring
  const innerRingGeo = new THREE.TorusGeometry(0.025, 0.0022, 6, 20);
  const innerRing = new THREE.Mesh(innerRingGeo, materials.joint);
  innerRing.name = side === -1 ? 'LeftInnerRing' : 'RightInnerRing';
  innerRing.rotation.y = Math.PI / 2;
  innerRing.position.set(side * 0.0185, 0, 0);
  jointGroup.add(innerRing);

  // E. Precision Billet Faceplate & Fasteners (Exploded Stage 6)
  const faceplateHub = new THREE.Group();
  faceplateHub.name = side === -1 ? 'LeftFaceplateHub' : 'RightFaceplateHub';
  faceplateHub.position.set(side * 0.020, 0, 0);
  jointGroup.add(faceplateHub);

  // Outer beveled retaining casing ring
  const outerRingGeo = new THREE.TorusGeometry(0.043, 0.0034, 8, 28);
  const outerRing = new THREE.Mesh(outerRingGeo, materials.joint);
  outerRing.name = side === -1 ? 'LeftOuterRing' : 'RightOuterRing';
  outerRing.rotation.y = Math.PI / 2;

  // Stepped recessed faceplate disc
  const steppedFaceGeo = new THREE.CylinderGeometry(0.040, 0.040, 0.0040, 24);
  const steppedFace = new THREE.Mesh(steppedFaceGeo, materials.joint);
  steppedFace.rotation.z = Math.PI / 2;
  steppedFace.position.set(side * 0.001, 0, 0);

  const tempFaceplate = new THREE.Group();
  tempFaceplate.add(outerRing);
  tempFaceplate.add(steppedFace);

  // 8 Perimeter Hex-Socket Cap Fasteners
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0030, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(
      side * 0.0035,
      Math.sin(angle) * 0.036,
      Math.cos(angle) * 0.036
    );
    tempFaceplate.add(bolt);
  }

  // Rotational Core: Raised central circular disc / magnetic core hub
  const coreDiscGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.0050, 24);
  const rotationalCore = new THREE.Mesh(coreDiscGeo, materials.joint);
  rotationalCore.name = side === -1 ? 'LeftRotationalCore' : 'RightRotationalCore';
  rotationalCore.rotation.z = Math.PI / 2;
  rotationalCore.position.set(side * 0.005, 0, 0);
  tempFaceplate.add(rotationalCore);

  // Central magnetic pivot boss cap
  const centerPinGeo = new THREE.CylinderGeometry(0.007, 0.008, 0.0040, 16);
  const centerPin = new THREE.Mesh(centerPinGeo, materials.joint);
  centerPin.rotation.z = Math.PI / 2;
  centerPin.position.set(side * 0.0075, 0, 0);
  tempFaceplate.add(centerPin);

  const faceplateMerged = mergeGroupMeshesByMaterial(tempFaceplate, materials.joint, 'FaceplateHub_Merged')!;
  tempFaceplate.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  faceplateHub.add(faceplateMerged);

  // Purple LED jewel
  const jewelGeo = new THREE.SphereGeometry(0.0032, 10, 10);
  const jewel = new THREE.Mesh(jewelGeo, materials.purpleEmissive);
  jewel.position.set(side * 0.0098, 0, 0);
  faceplateHub.add(jewel);
  ledMeshes.push(jewel);

  // ==========================================
  // 6. ARTICULATED UPPER ARM CONNECTOR & CLEVIS
  // Heavy-duty cast titanium clevis yoke articulating with underside of joint
  // and seating smoothly into the bicep socket cup
  // ==========================================
  const upperArmConnector = new THREE.Group();
  upperArmConnector.name = side === -1 ? 'LeftUpperArmConnector' : 'RightUpperArmConnector';
  jointGroup.add(upperArmConnector);

  // Dual-cheek articulated clevis housing
  const clevisGeo = new THREE.CylinderGeometry(0.028, 0.030, 0.018, 20);
  const clevis = new THREE.Mesh(clevisGeo, materials.joint);
  clevis.position.set(side * 0.002, -0.016, 0);

  // Transverse pivot axis pin with beveled bolt caps
  const pivotPinGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.040, 16);
  const pivotPin = new THREE.Mesh(pivotPinGeo, materials.joint);
  pivotPin.rotation.z = Math.PI / 2;
  pivotPin.position.set(side * 0.002, -0.016, 0);

  // Connector stem linking down to upper arm bicep socket
  const stemGeo = new THREE.CylinderGeometry(0.034, 0.036, 0.014, 24);
  const stem = new THREE.Mesh(stemGeo, materials.joint);
  stem.position.set(side * 0.002, -0.024, 0);

  // Lower seating flange ring mating flush with bicep socket cup
  const flangeGeo = new THREE.TorusGeometry(0.036, 0.0026, 8, 24);
  const flange = new THREE.Mesh(flangeGeo, materials.joint);
  flange.rotation.x = Math.PI / 2;
  flange.position.set(side * 0.002, -0.028, 0);

  const tempConnector = new THREE.Group();
  tempConnector.add(clevis);
  tempConnector.add(pivotPin);
  tempConnector.add(stem);
  tempConnector.add(flange);

  // Twin cybernetic braided conduit lines linking joint into upper arm
  for (let c = -1; c <= 1; c += 2) {
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.010, -0.008, c * 0.016),
      new THREE.Vector3(side * 0.004, -0.020, c * 0.018),
      new THREE.Vector3(side * 0.002, -0.032, c * 0.014),
    ]);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 10, 0.0020, 6, false);
    const cable = new THREE.Mesh(cableGeo, materials.joint);
    tempConnector.add(cable);
  }

  const connectorMerged = mergeGroupMeshesByMaterial(tempConnector, materials.joint, 'UpperArmConnector_Merged')!;
  tempConnector.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  upperArmConnector.add(connectorMerged);

  return {
    group: shoulderGroup,
    jointGroup,
    armorGroup,
    shoulderArmor,
    rotationalCore: faceplateMerged,
    outerRing: faceplateMerged,
    innerRing,
    innerStructure,
    upperArmConnector,
    accentRing,
    torsoMountPlate: jointCoreMerged,
    ledMeshes,

    // High-Precision Mechanical Nodes:
    gimbalYoke,
    cycloidalDrive,
    faceplateHub,
    damperActuator,
    damperPiston: damperMerged,
    damperCylinder: damperMerged,

    // Backwards compatibility aliases
    rotatingHub: faceplateMerged,
    ballJoint: jointCoreMerged,
    pauldronCowl: shoulderArmor,
    socketApertureRim: faceplateMerged,
  };
}

