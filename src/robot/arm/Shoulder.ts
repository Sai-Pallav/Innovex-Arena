import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface ShoulderNodes {
  group: THREE.Group;                  // ShoulderPivot root
  jointGroup: THREE.Group;             // ShoulderJoint rotating assembly
  armorGroup: THREE.Group;             // ShoulderArmor assembly
  shoulderArmor: THREE.Mesh;           // White outer protective shell (solid volumetric)
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
 * Creates a solid volumetric 3D deltoid pauldron with real physical thickness (5mm),
 * continuous smooth aerodynamic curvature, and an anatomical rim contour.
 * Eliminates paper-thin open boundaries and jagged cutaway holes.
 */
function createSolidPauldronGeo(side: -1 | 1): THREE.BufferGeometry {
  const radialSegs = 36;
  const heightSegs = 18;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const R_out = 0.068;
  const thickness = 0.0052; // 5.2mm solid ceramic plate thickness
  const R_in = R_out - thickness;

  const maxTheta = Math.PI * 0.50; // Covers crown and drapes over joint

  // Deltoid anatomical contour scalers
  const scaleX = 1.15;
  const scaleY = 0.90;
  const scaleZ = 1.08;

  // Layer 0: Outer surface
  for (let iy = 0; iy <= heightSegs; iy++) {
    const v = iy / heightSegs;
    const theta = v * maxTheta;

    for (let ix = 0; ix <= radialSegs; ix++) {
      const u = ix / radialSegs;
      const phi = u * Math.PI * 2;

      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      // Anatomical deltoid scallop:
      // Slightly higher in anterior/medial quadrant for arm clearance,
      // draping lower on lateral deltoid flank to protect the joint.
      const isLateral = (sinPhi * side) > 0;
      const lateralDrop = isLateral ? 0.006 * Math.sin(theta) : 0;
      const anteriorRise = (cosPhi > 0.2) ? 0.004 * v : 0;

      const x = R_out * scaleX * sinTheta * sinPhi;
      const y = R_out * scaleY * cosTheta - lateralDrop + anteriorRise;
      const z = R_out * scaleZ * sinTheta * cosPhi;

      positions.push(x, y, z);
      uvs.push(u, v * 0.5);
    }
  }

  // Layer 1: Inner surface
  for (let iy = 0; iy <= heightSegs; iy++) {
    const v = iy / heightSegs;
    const theta = v * maxTheta;

    for (let ix = 0; ix <= radialSegs; ix++) {
      const u = ix / radialSegs;
      const phi = u * Math.PI * 2;

      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const isLateral = (sinPhi * side) > 0;
      const lateralDrop = isLateral ? 0.006 * Math.sin(theta) : 0;
      const anteriorRise = (cosPhi > 0.2) ? 0.004 * v : 0;

      const x = R_in * scaleX * sinTheta * sinPhi;
      const y = R_in * scaleY * cosTheta - lateralDrop + anteriorRise;
      const z = R_in * scaleZ * sinTheta * cosPhi;

      positions.push(x, y, z);
      uvs.push(u, 0.5 + v * 0.5);
    }
  }

  const numRing = radialSegs + 1;
  const innerOffset = (heightSegs + 1) * numRing;

  // Outer surface quads (facing outward)
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = iy * numRing + ix;
      const b = (iy + 1) * numRing + ix;
      const c = (iy + 1) * numRing + (ix + 1);
      const d = iy * numRing + (ix + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Inner surface quads (facing inward)
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = innerOffset + iy * numRing + ix;
      const b = innerOffset + (iy + 1) * numRing + ix;
      const c = innerOffset + (iy + 1) * numRing + (ix + 1);
      const d = innerOffset + iy * numRing + (ix + 1);

      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  // Bottom rim quads joining outer and inner surfaces
  const outerRimBase = heightSegs * numRing;
  const innerRimBase = innerOffset + heightSegs * numRing;
  for (let ix = 0; ix < radialSegs; ix++) {
    const o1 = outerRimBase + ix;
    const o2 = outerRimBase + (ix + 1);
    const i1 = innerRimBase + ix;
    const i2 = innerRimBase + (ix + 1);

    indices.push(o1, i1, o2);
    indices.push(o2, i1, i2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the high-fidelity sculpted robotic shoulder assembly:
 * - Solid volumetric white ceramic deltoid pauldron with real 5mm wall thickness
 * - Flush integrated cybernetic LED channel along the front-lateral ridge
 * - Posterior heat exhaust louvers
 * - Compact, beautifully nested cycloidal drive & large circular bearing
 * - Concentric purple emissive accent ring recessed cleanly inside bearing race
 * - Heavy titanium structural gimbal yoke and hydraulic assist strut
 * - Precision dual-clevis upper arm connector
 */
export function createShoulder(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ShoulderNodes {
  // 1. Root ShoulderPivot
  const shoulderGroup = new THREE.Group();
  shoulderGroup.name = side === -1 ? 'LeftShoulderPivot' : 'RightShoulderPivot';

  const ledMeshes: THREE.Mesh[] = [];

  // ==============================================================
  // 2. SCULPTED SOLID DELTOID PAULDRON ARMOR
  // ==============================================================
  const armorGroup = new THREE.Group();
  armorGroup.name = side === -1 ? 'LeftShoulderArmor' : 'RightShoulderArmor';
  armorGroup.position.set(side * 0.008, 0.012, 0.001);
  shoulderGroup.add(armorGroup);

  const pauldronGeo = createSolidPauldronGeo(side);
  const shoulderArmor = new THREE.Mesh(pauldronGeo, materials.armor);
  shoulderArmor.name = side === -1 ? 'LeftShoulderArmorShell' : 'RightShoulderArmorShell';
  shoulderArmor.rotation.z = -side * 0.12;
  shoulderArmor.rotation.x = 0.04;
  shoulderArmor.castShadow = true;
  shoulderArmor.receiveShadow = true;
  armorGroup.add(shoulderArmor);

  // A. Flush Cybernetic LED Light Channel on Anterior-Lateral Ridge
  // Follows the sleek aerodynamic chamfer of the pauldron surface
  const ledPathPoints = [
    new THREE.Vector3(side * 0.016, 0.046, 0.042),
    new THREE.Vector3(side * 0.036, 0.034, 0.036),
    new THREE.Vector3(side * 0.052, 0.018, 0.024),
    new THREE.Vector3(side * 0.062, -0.002, 0.008),
  ];
  const ledCurve = new THREE.CatmullRomCurve3(ledPathPoints);

  // Recessed dark titanium mounting bezel
  const bezelGeo = new THREE.TubeGeometry(ledCurve, 20, 0.0030, 8, false);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.joint);
  shoulderArmor.add(bezelMesh);

  // Glowing purple emissive light strip
  const ledGeo = new THREE.TubeGeometry(ledCurve, 20, 0.0018, 8, false);
  const pauldronAccent = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  pauldronAccent.name = 'PauldronAccentLed';
  shoulderArmor.add(pauldronAccent);
  ledMeshes.push(pauldronAccent);

  // B. Secondary lateral accent notch (horizontal slit framing deltoid skirt)
  const flankCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.060, 0.004, -0.018),
    new THREE.Vector3(side * 0.064, -0.002, 0.004),
    new THREE.Vector3(side * 0.060, -0.008, 0.024),
  ]);
  const flankLedGeo = new THREE.TubeGeometry(flankCurve, 14, 0.0014, 6, false);
  const flankLed = new THREE.Mesh(flankLedGeo, materials.purpleEmissive);
  shoulderArmor.add(flankLed);
  ledMeshes.push(flankLed);

  // C. Posterior Heat Exhaust Louvers on Pauldron Crown
  for (let l = 0; l < 3; l++) {
    const louverGeo = new THREE.BoxGeometry(0.018, 0.0028, 0.006);
    const louver = new THREE.Mesh(louverGeo, materials.joint);
    louver.position.set(-side * 0.004, 0.030 + l * 0.0065, -0.044);
    louver.rotation.x = -Math.PI / 4;
    shoulderArmor.add(louver);
  }

  // D. Flush M3 Hex Fasteners on Pauldron Stanchions
  for (const bAngle of [-0.8, 0.6, 2.2]) {
    const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0025, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    const bRad = 0.056;
    bolt.position.set(
      Math.sin(bAngle) * bRad * side,
      0.032,
      Math.cos(bAngle) * bRad
    );
    shoulderArmor.add(bolt);
  }

  // ==============================================================
  // 3. STRUCTURAL GIMBAL YOKE & BRACKET
  // ==============================================================
  const gimbalYoke = new THREE.Group();
  gimbalYoke.name = side === -1 ? 'LeftGimbalYoke' : 'RightGimbalYoke';
  shoulderGroup.add(gimbalYoke);

  const tempYoke = new THREE.Group();

  // Primary structural bracket arm
  const bracketArmGeo = new THREE.BoxGeometry(0.016, 0.028, 0.046);
  const bracketArm = new THREE.Mesh(bracketArmGeo, materials.joint);
  bracketArm.position.set(-side * 0.006, 0.012, 0.000);
  bracketArm.rotation.z = side * 0.16;
  tempYoke.add(bracketArm);

  // Titanium C-frame yoke spine
  const yokeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-side * 0.010, 0.006, -0.022),
    new THREE.Vector3(-side * 0.004, 0.028, -0.010),
    new THREE.Vector3(side * 0.006, 0.034, 0.000),
    new THREE.Vector3(side * 0.018, 0.026, 0.010),
    new THREE.Vector3(side * 0.022, 0.008, 0.016),
  ]);
  const yokeSpineGeo = new THREE.TubeGeometry(yokeCurve, 16, 0.0055, 8, false);
  const yokeSpine = new THREE.Mesh(yokeSpineGeo, materials.joint);
  tempYoke.add(yokeSpine);

  const yokeMerged = mergeGroupMeshesByMaterial(tempYoke, materials.joint, 'GimbalYoke_Merged')!;
  tempYoke.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  gimbalYoke.add(yokeMerged);

  // ==============================================================
  // 4. HYDRAULIC ASSIST ACTUATOR STRUT
  // ==============================================================
  const damperActuator = new THREE.Group();
  damperActuator.name = side === -1 ? 'LeftDamperActuator' : 'RightDamperActuator';
  damperActuator.position.set(side * 0.002, 0.028, -0.018);
  damperActuator.rotation.x = -0.22;
  damperActuator.rotation.z = side * 0.24;
  shoulderGroup.add(damperActuator);

  const tempDamper = new THREE.Group();

  const cylGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.032, 16);
  const damperCylinder = new THREE.Mesh(cylGeo, materials.joint);
  damperCylinder.position.set(0, 0.008, 0);
  tempDamper.add(damperCylinder);

  const damperCollarGeo = new THREE.TorusGeometry(0.0068, 0.0014, 6, 16);
  const damperCollar = new THREE.Mesh(damperCollarGeo, materials.purpleEmissive);
  damperCollar.rotation.x = Math.PI / 2;
  damperCollar.position.set(0, 0.002, 0);
  damperActuator.add(damperCollar);
  ledMeshes.push(damperCollar);

  const pistonGeo = new THREE.CylinderGeometry(0.0040, 0.0040, 0.034, 16);
  const damperPiston = new THREE.Mesh(pistonGeo, materials.joint);
  damperPiston.position.set(0, -0.016, 0);
  tempDamper.add(damperPiston);

  const eyeletGeo = new THREE.SphereGeometry(0.0052, 12, 12);
  const eyelet = new THREE.Mesh(eyeletGeo, materials.joint);
  eyelet.position.set(0, -0.032, 0);
  tempDamper.add(eyelet);

  const damperMerged = mergeGroupMeshesByMaterial(tempDamper, materials.joint, 'DamperActuator_Merged')!;
  tempDamper.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  damperActuator.add(damperMerged);

  // ==============================================================
  // 5. LARGE CIRCULAR SHOULDER BEARING & CYCLOIDAL DRIVE
  // Elegantly proportioned to sit nestled inside the shoulder cavity
  // ==============================================================
  const jointGroup = new THREE.Group();
  jointGroup.name = side === -1 ? 'LeftShoulderJoint' : 'RightShoulderJoint';
  jointGroup.rotation.y = -side * 0.04;
  shoulderGroup.add(jointGroup);

  const tempJointCore = new THREE.Group();

  // A. Torso Mount Trunnion Collar
  const mountPlateGeo = new THREE.CylinderGeometry(0.042, 0.040, 0.016, 28);
  const torsoMountPlate = new THREE.Mesh(mountPlateGeo, materials.joint);
  torsoMountPlate.name = side === -1 ? 'LeftTorsoMountPlate' : 'RightTorsoMountPlate';
  torsoMountPlate.rotation.z = Math.PI / 2;
  torsoMountPlate.position.set(-side * 0.006, 0, 0);
  tempJointCore.add(torsoMountPlate);

  // 6 Perimeter M4 Fasteners on Mounting Flange
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.0035, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(-side * 0.004, Math.sin(angle) * 0.035, Math.cos(angle) * 0.035);
    tempJointCore.add(bolt);
  }

  // B. Machined Bearing Outer Race (Radius 0.042 - nested with clean clearance)
  const outerRaceGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.018, 32);
  const outerRace = new THREE.Mesh(outerRaceGeo, materials.joint);
  outerRace.rotation.z = Math.PI / 2;
  outerRace.position.set(side * 0.006, 0, 0);
  tempJointCore.add(outerRace);

  // Outer Beveled Retaining Ring
  const outerBezelGeo = new THREE.TorusGeometry(0.0425, 0.0024, 8, 32);
  const outerBezel = new THREE.Mesh(outerBezelGeo, materials.joint);
  outerBezel.rotation.y = Math.PI / 2;
  outerBezel.position.set(side * 0.014, 0, 0);
  tempJointCore.add(outerBezel);

  // C. Dark Synthetic Nitrile Rubber Seal
  const rubberSealGeo = new THREE.TorusGeometry(0.037, 0.0022, 8, 28);
  const rubberSeal = new THREE.Mesh(rubberSealGeo, materials.joint);
  rubberSeal.rotation.y = Math.PI / 2;
  rubberSeal.position.set(side * 0.0145, 0, 0);
  tempJointCore.add(rubberSeal);

  // D. Inner Bearing Race Ring
  const innerRaceGeo = new THREE.TorusGeometry(0.032, 0.0025, 8, 28);
  const innerRace = new THREE.Mesh(innerRaceGeo, materials.joint);
  innerRace.rotation.y = Math.PI / 2;
  innerRace.position.set(side * 0.0152, 0, 0);
  tempJointCore.add(innerRace);

  // E. Solid Cross-Axis Rotational Axle
  const axlePinGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.042, 24);
  const axlePin = new THREE.Mesh(axlePinGeo, materials.joint);
  axlePin.rotation.z = Math.PI / 2;
  axlePin.position.set(side * 0.004, 0, 0);
  tempJointCore.add(axlePin);

  const jointCoreMerged = mergeGroupMeshesByMaterial(tempJointCore, materials.joint, 'ShoulderCore_Merged')!;
  tempJointCore.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  jointGroup.add(jointCoreMerged);

  // F. Stator Ring & Harmonic Drive Core
  const innerStructure = new THREE.Group();
  innerStructure.name = side === -1 ? 'LeftInnerStructure' : 'RightInnerStructure';
  innerStructure.position.set(side * 0.008, 0, 0);
  jointGroup.add(innerStructure);

  const statorBaseGeo = new THREE.CylinderGeometry(0.039, 0.039, 0.012, 28);
  const statorBase = new THREE.Mesh(statorBaseGeo, materials.joint);
  statorBase.rotation.z = Math.PI / 2;

  const tempStator = new THREE.Group();
  tempStator.add(statorBase);

  // 12 Radial Stator Teeth
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.010, 0.0028, 0.0055);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      0,
      Math.sin(angle) * 0.040,
      Math.cos(angle) * 0.040
    );
    tooth.rotation.x = angle;
    tempStator.add(tooth);
  }

  const statorMerged = mergeGroupMeshesByMaterial(tempStator, materials.joint, 'StatorStructure_Merged')!;
  tempStator.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  innerStructure.add(statorMerged);

  // G. Cycloidal Planetary Drive Ring
  const cycloidalDrive = new THREE.Group();
  cycloidalDrive.name = side === -1 ? 'LeftCycloidalDrive' : 'RightCycloidalDrive';
  cycloidalDrive.position.set(side * 0.011, 0, 0);
  jointGroup.add(cycloidalDrive);

  const gearRingGeo = new THREE.TorusGeometry(0.035, 0.0028, 8, 28);
  const gearRing = new THREE.Mesh(gearRingGeo, materials.joint);
  gearRing.rotation.y = Math.PI / 2;

  const tempDrive = new THREE.Group();
  tempDrive.add(gearRing);

  // 14 Cycloidal drive roller pins
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const pinGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.0040, 8);
    const pin = new THREE.Mesh(pinGeo, materials.joint);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(
      0,
      Math.sin(angle) * 0.033,
      Math.cos(angle) * 0.033
    );
    tempDrive.add(pin);
  }

  const driveMerged = mergeGroupMeshesByMaterial(tempDrive, materials.joint, 'CycloidalDrive_Merged')!;
  tempDrive.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  cycloidalDrive.add(driveMerged);

  // H. Concentric Purple Emissive Accent Ring (Recessed flush inside bearing face)
  const tempShoulderAccents = new THREE.Group();
  const accentGeo = new THREE.TorusGeometry(0.027, 0.0016, 8, 28);
  const accentRingRaw = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRingRaw.rotation.y = Math.PI / 2;
  accentRingRaw.position.set(side * 0.0158, 0, 0);
  tempShoulderAccents.add(accentRingRaw);

  const accentRing = mergeGroupMeshesByMaterial(
    tempShoulderAccents,
    materials.purpleEmissive,
    side === -1 ? 'LeftShoulderAccentRing' : 'RightShoulderAccentRing',
    false,
    false
  ) || accentRingRaw;
  accentRing.name = side === -1 ? 'LeftShoulderAccentRing' : 'RightShoulderAccentRing';
  jointGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // Inner machined titanium ring
  const innerRingGeo = new THREE.TorusGeometry(0.021, 0.0018, 6, 20);
  const innerRing = new THREE.Mesh(innerRingGeo, materials.joint);
  innerRing.name = side === -1 ? 'LeftInnerRing' : 'RightInnerRing';
  innerRing.rotation.y = Math.PI / 2;
  innerRing.position.set(side * 0.0165, 0, 0);
  jointGroup.add(innerRing);

  // I. Precision Billet Faceplate Hub & Fasteners
  const faceplateHub = new THREE.Group();
  faceplateHub.name = side === -1 ? 'LeftFaceplateHub' : 'RightFaceplateHub';
  faceplateHub.position.set(side * 0.0175, 0, 0);
  jointGroup.add(faceplateHub);

  const tempFaceplate = new THREE.Group();

  // Outer beveled retaining casing ring
  const outerRingGeo = new THREE.TorusGeometry(0.036, 0.0028, 8, 28);
  const outerRing = new THREE.Mesh(outerRingGeo, materials.joint);
  outerRing.name = side === -1 ? 'LeftOuterRing' : 'RightOuterRing';
  outerRing.rotation.y = Math.PI / 2;
  tempFaceplate.add(outerRing);

  // Stepped recessed faceplate disc
  const steppedFaceGeo = new THREE.CylinderGeometry(0.033, 0.033, 0.0035, 24);
  const steppedFace = new THREE.Mesh(steppedFaceGeo, materials.joint);
  steppedFace.rotation.z = Math.PI / 2;
  steppedFace.position.set(side * 0.001, 0, 0);
  tempFaceplate.add(steppedFace);

  // 6 Perimeter Hex Fasteners
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0028, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(
      side * 0.0028,
      Math.sin(angle) * 0.030,
      Math.cos(angle) * 0.030
    );
    tempFaceplate.add(bolt);
  }

  // Central Rotational Core Hub
  const coreDiscGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.0045, 20);
  const rotationalCore = new THREE.Mesh(coreDiscGeo, materials.joint);
  rotationalCore.name = side === -1 ? 'LeftRotationalCore' : 'RightRotationalCore';
  rotationalCore.rotation.z = Math.PI / 2;
  rotationalCore.position.set(side * 0.004, 0, 0);
  tempFaceplate.add(rotationalCore);

  // Central axle cap boss
  const centerPinGeo = new THREE.CylinderGeometry(0.0065, 0.0075, 0.0035, 16);
  const centerPin = new THREE.Mesh(centerPinGeo, materials.joint);
  centerPin.rotation.z = Math.PI / 2;
  centerPin.position.set(side * 0.0062, 0, 0);
  tempFaceplate.add(centerPin);

  const faceplateMerged = mergeGroupMeshesByMaterial(tempFaceplate, materials.joint, 'FaceplateHub_Merged')!;
  tempFaceplate.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  faceplateHub.add(faceplateMerged);

  // Purple LED center jewel
  const jewelGeo = new THREE.SphereGeometry(0.0026, 10, 10);
  const jewel = new THREE.Mesh(jewelGeo, materials.purpleEmissive);
  jewel.position.set(side * 0.0082, 0, 0);
  faceplateHub.add(jewel);
  ledMeshes.push(jewel);

  // ==============================================================
  // 6. ARTICULATED UPPER ARM CONNECTOR & CLEVIS
  // ==============================================================
  const upperArmConnector = new THREE.Group();
  upperArmConnector.name = side === -1 ? 'LeftUpperArmConnector' : 'RightUpperArmConnector';
  jointGroup.add(upperArmConnector);

  const tempConnector = new THREE.Group();

  // Dual-cheek articulated clevis housing
  const clevisGeo = new THREE.CylinderGeometry(0.026, 0.028, 0.018, 20);
  const clevis = new THREE.Mesh(clevisGeo, materials.joint);
  clevis.position.set(side * 0.002, -0.014, 0);
  tempConnector.add(clevis);

  // Transverse pivot pin with beveled bolt caps
  const pivotPinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.038, 16);
  const pivotPin = new THREE.Mesh(pivotPinGeo, materials.joint);
  pivotPin.rotation.z = Math.PI / 2;
  pivotPin.position.set(side * 0.002, -0.014, 0);
  tempConnector.add(pivotPin);

  // Connector stem linking down to upper arm frame
  const stemGeo = new THREE.CylinderGeometry(0.032, 0.034, 0.015, 24);
  const stem = new THREE.Mesh(stemGeo, materials.joint);
  stem.position.set(side * 0.002, -0.023, 0);
  tempConnector.add(stem);

  // Lower seating flange ring mating flush with upper arm frame collar
  const flangeGeo = new THREE.TorusGeometry(0.034, 0.0024, 8, 24);
  const flange = new THREE.Mesh(flangeGeo, materials.joint);
  flange.rotation.x = Math.PI / 2;
  flange.position.set(side * 0.002, -0.028, 0);
  tempConnector.add(flange);

  // Twin cybernetic braided conduit lines linking joint into upper arm
  for (let c = -1; c <= 1; c += 2) {
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.010, -0.006, c * 0.015),
      new THREE.Vector3(side * 0.005, -0.018, c * 0.017),
      new THREE.Vector3(side * 0.002, -0.030, c * 0.014),
    ]);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 10, 0.0018, 6, false);
    const cable = new THREE.Mesh(cableGeo, materials.joint);
    tempConnector.add(cable);
  }

  const connectorMerged = mergeGroupMeshesByMaterial(tempConnector, materials.joint, 'UpperArmConnector_Merged')!;
  tempConnector.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
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
