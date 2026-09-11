import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

/**
 * CRITICAL CHANGE #3: PROMINENT MAJOR ROBOTIC ELBOW JOINT
 * Architecture:
 * UPPER ARM -> CLEVIS BRACKET -> LARGE BEARING (◉) -> CENTRAL AXLE -> ACTUATOR -> LOWER CLEVIS -> FOREARM
 *
 * - Substantial circular bearing housings with outer/inner races and 6 M4 bolts
 * - Dual structural side clevis plates grasping the joint from the upper arm
 * - High-pressure hydraulic flexion actuator ram with chrome telescopic rod
 * - Mechanical stop lugs with synthetic rubber dampening pads
 * - Dark mechanical seals between articulating knuckles
 * - 14mm+ visible mechanical clearance gap between upper arm and forearm armor
 */
export const ELBOW_CONFIG = {
  // Transverse Axis & Core Dimensions (meters) - Substantial prominent joint
  hingeRadius: 0.0335,          // Central hinge core outer radius
  hingeWidth: 0.076,            // Total transverse span along X-axis
  coreRadius: 0.029,            // Inner cylindrical core radius
  knuckleWidth: 0.015,          // Width of individual upper clevis knuckles
  clevisGap: 0.0016,            // Clearance between interlocking knuckles
  centerKnuckleWidth: 0.028,    // Width of lower center knuckle (rotates with forearm)
  
  // Central Hinge Pin (Axle)
  axlePinRadius: 0.0135,        // Central axle pin radius
  axleBoreRadius: 0.0060,       // Hollow core bore radius
  axlePinLength: 0.082,         // Total length of central pin spanning side to side
  
  // Dual Side Rotational Bearing Discs
  discOuterRadius: 0.0360,      // Outer beveled ring radius
  discThickness: 0.0065,        // Thickness of side cover
  discOffsetX: 0.0385,          // Lateral & medial X offsets from joint center
  emissiveRingRadius: 0.0240,   // Purple accent ring radius
  emissiveRingTube: 0.0018,     // Purple accent ring tube thickness
  innerCapRadius: 0.0130,       // Recessed central metallic hub cap radius
  
  // Upper Joint Housing (Stationary with Upper Arm)
  upperHousingRadius: 0.0360,   // Upper mechanical collar radius
  upperHousingHeight: 0.028,    // Vertical height extending into upper arm socket
  upperHousingOffsetY: 0.016,   // Center Y position relative to elbow origin
  
  // Lower Joint Housing (Articulates on forearmPivot with Forearm)
  lowerHousingRadius: 0.0345,   // Lower mechanical collar radius
  lowerHousingHeight: 0.026,    // Vertical height extending into forearm gauntlet
  lowerHousingOffsetY: -0.014,  // Center Y position relative to forearm pivot
  
  // Angular Limits (radians)
  neutralAngle: 0.0,            // 0° (extended straight)
  minBend: 0.05,                // Slight hyperextension tolerance
  maxBend: -2.05,               // ~117.5° max bend
  restingBend: -0.48,           // ~-27.5° default posed bend
  
  // Armor Clearances
  armorClearanceGap: 0.0045,    // Generous mechanical safety clearance
} as const;

export interface ElbowDiscNodes {
  group: THREE.Group;
  outerBezel: THREE.Group;
  bearingRace: THREE.Group;
  accentRing: THREE.Mesh;
  innerDisc: THREE.Mesh;
  hubCap: THREE.Group;
}

export interface ElbowNodes {
  group: THREE.Group;              // Stationary root anchored under UpperArm
  forearmPivot: THREE.Group;       // Rotating hinge pivot at [0, 0, 0] carrying forearm & lowerHousing
  upperConnector: THREE.Mesh;      // Upper stem mounting into upper arm
  upperHousing: THREE.Group;       // Stationary upper clevis housing & knuckles
  hingeCore: THREE.Group;          // Central transverse hinge barrel & stator
  centralPin: THREE.Group;         // Axle passing through the joint
  lateralDisc: THREE.Group;        // Lateral side cover with purple emissive ring
  medialDisc: THREE.Group;         // Medial side cover with purple emissive ring
  lowerHousing: THREE.Group;       // Articulating lower clevis housing on forearmPivot
  accentRing: THREE.Mesh;          // Primary lateral emissive ring (for backwards compat)
  medialAccentRing: THREE.Mesh;    // Medial emissive ring
  ledMeshes: THREE.Mesh[];         // All emissive accent rings

  // High-Precision Mechanical Open View Nodes:
  hydraulicRam: THREE.Group;       // Posterior hydraulic flexion ram
  ramPiston: THREE.Mesh;           // Telescopic chrome piston shaft
  ramCylinder: THREE.Mesh;         // Pressure cylinder
  olecranonMesh: THREE.Mesh;       // Posterior olecranon shield
  lateralDiscNodes: ElbowDiscNodes;
  medialDiscNodes: ElbowDiscNodes;

  setAngle: (angle: number) => void;
  getAngle: () => number;
  // Backwards compatibility aliases
  mainHingeBarrel: THREE.Mesh;
  lateralHub: THREE.Mesh;
  medialHub: THREE.Mesh;
  olecranonArmor: THREE.Mesh;
  upperClevis: THREE.Mesh;
  lowerClevis: THREE.Mesh;
}

/**
 * 1. UPPER ARM CLEVIS BRACKET & STATIONARY HOUSING
 * Heavy titanium clevis bracket with dual cheek plates grasping the bearing hubs.
 */
function createUpperHousing(materials: RobotMaterialPalette): {
  group: THREE.Group;
  connector: THREE.Mesh;
  upperClevisMesh: THREE.Mesh;
} {
  const upperGroup = new THREE.Group();
  upperGroup.name = 'ElbowUpperHousing';

  const tempUpper = new THREE.Group();

  // Upper mounting connector collar inserting into upper arm frame
  const connectorGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.upperHousingRadius * 0.94,
    ELBOW_CONFIG.upperHousingRadius,
    ELBOW_CONFIG.upperHousingHeight,
    24
  );
  const connector = new THREE.Mesh(connectorGeo, materials.joint);
  connector.name = 'UpperArmConnector';
  connector.position.set(0, ELBOW_CONFIG.upperHousingOffsetY + 0.004, 0);
  tempUpper.add(connector);

  // Beveled collar rim transition
  const rimGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.upperHousingRadius * 0.98,
    0.0022,
    6,
    24
  );
  const collarRim = new THREE.Mesh(rimGeo, materials.joint);
  collarRim.rotation.x = Math.PI / 2;
  collarRim.position.set(0, ELBOW_CONFIG.upperHousingOffsetY + ELBOW_CONFIG.upperHousingHeight * 0.5, 0);
  tempUpper.add(collarRim);

  // Dual downward-reaching clevis knuckles (Left and Right along X)
  const knuckleRadius = ELBOW_CONFIG.hingeRadius * 0.96;
  const knuckleGeo = new THREE.CylinderGeometry(
    knuckleRadius,
    knuckleRadius,
    ELBOW_CONFIG.knuckleWidth,
    24
  );
  knuckleGeo.rotateZ(Math.PI / 2);

  const leftKnuckleX = -(ELBOW_CONFIG.centerKnuckleWidth * 0.5 + ELBOW_CONFIG.clevisGap + ELBOW_CONFIG.knuckleWidth * 0.5);
  const rightKnuckleX = ELBOW_CONFIG.centerKnuckleWidth * 0.5 + ELBOW_CONFIG.clevisGap + ELBOW_CONFIG.knuckleWidth * 0.5;

  const leftKnuckle = new THREE.Mesh(knuckleGeo, materials.joint);
  leftKnuckle.position.set(leftKnuckleX, 0, 0);
  tempUpper.add(leftKnuckle);

  const rightKnuckle = new THREE.Mesh(knuckleGeo, materials.joint);
  rightKnuckle.position.set(rightKnuckleX, 0, 0);
  tempUpper.add(rightKnuckle);

  // Heavy Clevis Cheek Plates (Side structural plates clutching outer discs)
  for (const sX of [leftKnuckleX - ELBOW_CONFIG.knuckleWidth * 0.45, rightKnuckleX + ELBOW_CONFIG.knuckleWidth * 0.45]) {
    const cheekPlateGeo = new THREE.BoxGeometry(0.0045, 0.038, knuckleRadius * 1.6);
    const cheekPlate = new THREE.Mesh(cheekPlateGeo, materials.joint);
    cheekPlate.position.set(sX, ELBOW_CONFIG.upperHousingOffsetY * 0.5, -0.004);
    tempUpper.add(cheekPlate);
  }

  // Structural vertical support brackets connecting collar to each knuckle
  const bracketGeo = new THREE.BoxGeometry(
    ELBOW_CONFIG.knuckleWidth * 0.90,
    ELBOW_CONFIG.upperHousingOffsetY + 0.004,
    knuckleRadius * 1.45
  );

  const leftBracket = new THREE.Mesh(bracketGeo, materials.joint);
  leftBracket.position.set(leftKnuckleX, (ELBOW_CONFIG.upperHousingOffsetY + 0.004) * 0.5, -0.002);
  tempUpper.add(leftBracket);

  const rightBracket = new THREE.Mesh(bracketGeo, materials.joint);
  rightBracket.position.set(rightKnuckleX, (ELBOW_CONFIG.upperHousingOffsetY + 0.004) * 0.5, -0.002);
  tempUpper.add(rightBracket);

  // Mechanical Hard-Stop Lugs (prevents hyperextension beyond limits)
  for (const sX of [leftKnuckleX, rightKnuckleX]) {
    const stopLugGeo = new THREE.BoxGeometry(0.006, 0.008, 0.008);
    const stopLug = new THREE.Mesh(stopLugGeo, materials.joint);
    stopLug.position.set(sX, -knuckleRadius * 0.70, knuckleRadius * 0.65);
    tempUpper.add(stopLug);

    // Synthetic rubber buffer pad on stop lug
    const rubberPadGeo = new THREE.BoxGeometry(0.0055, 0.003, 0.007);
    const rubberPad = new THREE.Mesh(rubberPadGeo, materials.joint);
    rubberPad.position.set(sX, -knuckleRadius * 0.70 + 0.004, knuckleRadius * 0.65);
    tempUpper.add(rubberPad);
  }

  // Posterior mechanical spine rib joining the two brackets
  const ribGeo = new THREE.BoxGeometry(
    Math.abs(leftKnuckleX - rightKnuckleX) + ELBOW_CONFIG.knuckleWidth,
    0.014,
    0.007
  );
  const spineRib = new THREE.Mesh(ribGeo, materials.joint);
  spineRib.position.set(0, ELBOW_CONFIG.upperHousingOffsetY * 0.7, -knuckleRadius * 0.72);
  tempUpper.add(spineRib);

  // Upper Actuator Anchor Lug (Receives top of hydraulic flexion ram)
  const lugGeo = new THREE.BoxGeometry(0.012, 0.014, 0.014);
  const upperLug = new THREE.Mesh(lugGeo, materials.joint);
  upperLug.position.set(0, ELBOW_CONFIG.upperHousingOffsetY * 0.6, -knuckleRadius * 0.95);
  tempUpper.add(upperLug);

  const upperMerged = mergeGroupMeshesByMaterial(tempUpper, materials.joint, 'UpperHousing_Joint')!;
  tempUpper.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  upperGroup.add(upperMerged);

  return {
    group: upperGroup,
    connector: upperMerged,
    upperClevisMesh: upperMerged,
  };
}

/**
 * 2. CENTRAL HINGE CORE & TRANSVERSE ROTATIONAL AXLE
 * Heavy-duty horizontal axle along X-axis with gear sector and seals.
 */
function createCentralHingeCore(materials: RobotMaterialPalette): {
  coreGroup: THREE.Group;
  pinGroup: THREE.Group;
  barrelMesh: THREE.Mesh;
} {
  const coreGroup = new THREE.Group();
  coreGroup.name = 'ElbowHingeCore';

  // Transverse cylindrical stator sleeve / core barrel
  const barrelGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.coreRadius,
    ELBOW_CONFIG.coreRadius,
    ELBOW_CONFIG.hingeWidth,
    28
  );
  barrelGeo.rotateZ(Math.PI / 2);

  const barrelMesh = new THREE.Mesh(barrelGeo, materials.joint);
  barrelMesh.name = 'CentralHingeBarrel';

  // Precision Spur Gear Sector (12 radial teeth showing mechanical transmission)
  const gearSector = new THREE.Group();
  gearSector.name = 'ElbowSpurGearSector';
  for (let i = 0; i < 12; i++) {
    const angle = ((i - 5.5) / 12) * (Math.PI * 0.60) + Math.PI * 0.5;
    const toothGeo = new THREE.BoxGeometry(0.026, 0.0030, 0.0050);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      0,
      Math.sin(angle) * (ELBOW_CONFIG.coreRadius + 0.002),
      Math.cos(angle) * (ELBOW_CONFIG.coreRadius + 0.002)
    );
    tooth.rotation.x = angle;
    gearSector.add(tooth);
  }

  // Dark Mechanical Rubber Seals between knuckles
  const tempSeals = new THREE.Group();
  for (const sX of [-0.015, 0.015]) {
    const sealGeo = new THREE.TorusGeometry(ELBOW_CONFIG.coreRadius * 0.98, 0.0018, 6, 24);
    sealGeo.rotateY(Math.PI / 2);
    const seal = new THREE.Mesh(sealGeo, materials.joint);
    seal.position.set(sX, 0, 0);
    tempSeals.add(seal);
  }

  const tempCore = new THREE.Group();
  tempCore.add(barrelMesh);
  tempCore.add(gearSector);
  tempCore.add(tempSeals);

  const coreMerged = mergeGroupMeshesByMaterial(tempCore, materials.joint, 'CentralCore_Merged')!;
  tempCore.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  coreGroup.add(coreMerged);

  // Central Transverse Axle Pin
  const pinGroup = new THREE.Group();
  pinGroup.name = 'ElbowCentralPin';

  const axleGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.axlePinRadius,
    ELBOW_CONFIG.axlePinRadius,
    ELBOW_CONFIG.axlePinLength,
    24
  );
  axleGeo.rotateZ(Math.PI / 2);
  const axlePin = new THREE.Mesh(axleGeo, materials.joint);
  axlePin.name = 'CentralAxlePinShaft';

  // Hollow center bore ring
  const boreGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.axleBoreRadius,
    ELBOW_CONFIG.axleBoreRadius,
    ELBOW_CONFIG.axlePinLength + 0.002,
    16
  );
  boreGeo.rotateZ(Math.PI / 2);
  const boreMesh = new THREE.Mesh(boreGeo, materials.joint);

  const tempPin = new THREE.Group();
  tempPin.add(axlePin);
  tempPin.add(boreMesh);

  const pinMerged = mergeGroupMeshesByMaterial(tempPin, materials.joint, 'CentralPin_Merged')!;
  tempPin.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  pinGroup.add(pinMerged);

  return { coreGroup, pinGroup, barrelMesh: coreMerged };
}

/**
 * 3. LARGE CIRCULAR ROTATIONAL BEARING DISC
 * Substantial machined bearing housing with outer/inner race and 6 perimeter hex bolts.
 */
function createRotationalDisc(
  side: 'lateral' | 'medial',
  armSide: -1 | 1,
  materials: RobotMaterialPalette
): {
  discGroup: THREE.Group;
  discNodes: ElbowDiscNodes;
  accentRing: THREE.Mesh;
  outerDisc: THREE.Mesh;
} {
  const isLateral = side === 'lateral';
  const sign = (isLateral ? -armSide : armSide);

  const discName = isLateral ? 'LateralDisc' : 'MedialDisc';
  const discGroup = new THREE.Group();
  discGroup.name = `Elbow${discName}`;
  discGroup.position.set(sign * ELBOW_CONFIG.discOffsetX, 0, 0);

  // A. Outer Bezel & Machined Housing
  const outerBezel = new THREE.Group();
  outerBezel.name = `${discName}_OuterBezel`;
  discGroup.add(outerBezel);

  const outerDiscGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discThickness,
    28
  );
  outerDiscGeo.rotateZ(Math.PI / 2);

  const outerDisc = new THREE.Mesh(outerDiscGeo, materials.joint);
  outerDisc.name = `${discName}_OuterHousing`;

  // Beveled outer rim
  const beveledRimGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.discOuterRadius * 0.94,
    0.0024,
    8,
    28
  );
  beveledRimGeo.rotateY(Math.PI / 2);
  const beveledRim = new THREE.Mesh(beveledRimGeo, materials.joint);
  beveledRim.position.set(sign * (ELBOW_CONFIG.discThickness * 0.35), 0, 0);

  // 6 Perimeter Hex Socket Fasteners
  const tempBezel = new THREE.Group();
  tempBezel.add(outerDisc);
  tempBezel.add(beveledRim);
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.0028, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      sign * (ELBOW_CONFIG.discThickness * 0.48),
      Math.sin(angle) * (ELBOW_CONFIG.discOuterRadius * 0.82),
      Math.cos(angle) * (ELBOW_CONFIG.discOuterRadius * 0.82)
    );
    tempBezel.add(bolt);
  }

  const bezelMerged = mergeGroupMeshesByMaterial(tempBezel, materials.joint, `${discName}_OuterBezel_Merged`)!;
  tempBezel.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  outerBezel.add(bezelMerged);

  // B. Roller Bearing Race Group
  const bearingRace = new THREE.Group();
  bearingRace.name = `${discName}_BearingRace`;
  discGroup.add(bearingRace);

  const raceRingGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.emissiveRingRadius * 1.08,
    0.0020,
    6,
    24
  );
  raceRingGeo.rotateY(Math.PI / 2);
  const raceRing = new THREE.Mesh(raceRingGeo, materials.joint);
  raceRing.position.set(sign * (ELBOW_CONFIG.discThickness * 0.28), 0, 0);

  const tempRace = new THREE.Group();
  tempRace.add(raceRing);
  // 12 micro-roller bearing cylinders
  for (let r = 0; r < 12; r++) {
    const angle = (r / 12) * Math.PI * 2;
    const rollerGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.0035, 8);
    rollerGeo.rotateZ(Math.PI / 2);
    const roller = new THREE.Mesh(rollerGeo, materials.joint);
    roller.position.set(
      sign * (ELBOW_CONFIG.discThickness * 0.30),
      Math.sin(angle) * (ELBOW_CONFIG.emissiveRingRadius * 1.08),
      Math.cos(angle) * (ELBOW_CONFIG.emissiveRingRadius * 1.08)
    );
    tempRace.add(roller);
  }

  const raceMerged = mergeGroupMeshesByMaterial(tempRace, materials.joint, `${discName}_BearingRace_Merged`)!;
  tempRace.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  bearingRace.add(raceMerged);

  // C. Concentric Purple Emissive Accent Ring
  const accentGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.emissiveRingRadius,
    ELBOW_CONFIG.emissiveRingTube,
    6,
    28
  );
  accentGeo.rotateY(Math.PI / 2);

  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.name = `${discName}_AccentRing`;
  accentRing.position.set(sign * (ELBOW_CONFIG.discThickness * 0.45), 0, 0);
  discGroup.add(accentRing);

  // D. Inner Stepped Disc Cover
  const innerDiscGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.innerCapRadius * 1.35,
    ELBOW_CONFIG.innerCapRadius * 1.35,
    ELBOW_CONFIG.discThickness * 0.45,
    20
  );
  innerDiscGeo.rotateZ(Math.PI / 2);
  const innerDisc = new THREE.Mesh(innerDiscGeo, materials.joint);
  innerDisc.name = `${discName}_InnerDisc`;
  innerDisc.position.set(sign * (ELBOW_CONFIG.discThickness * 0.42), 0, 0);
  discGroup.add(innerDisc);

  // E. Central Hub Cap & Axle Retainer
  const hubCapGroup = new THREE.Group();
  hubCapGroup.name = `${discName}_HubCap`;
  discGroup.add(hubCapGroup);

  const capGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.innerCapRadius,
    ELBOW_CONFIG.innerCapRadius * 0.90,
    ELBOW_CONFIG.discThickness * 0.35,
    16
  );
  capGeo.rotateZ(Math.PI / 2);
  const capMesh = new THREE.Mesh(capGeo, materials.joint);
  capMesh.position.set(sign * (ELBOW_CONFIG.discThickness * 0.52), 0, 0);
  hubCapGroup.add(capMesh);

  // Center purple jewel
  const jewelGeo = new THREE.SphereGeometry(0.0034, 10, 10);
  const coreJewel = new THREE.Mesh(jewelGeo, materials.purpleEmissive);
  coreJewel.position.set(sign * (ELBOW_CONFIG.discThickness * 0.60), 0, 0);
  hubCapGroup.add(coreJewel);

  const discNodes: ElbowDiscNodes = {
    group: discGroup,
    outerBezel,
    bearingRace,
    accentRing,
    innerDisc,
    hubCap: hubCapGroup,
  };

  return { discGroup, discNodes, accentRing, outerDisc: bezelMerged };
}

/**
 * 4. LOWER CLEVIS HOUSING & FOREARM CRANK
 * Articulating center clevis knuckle mounted to `forearmPivot`.
 */
function createLowerHousing(materials: RobotMaterialPalette): {
  group: THREE.Group;
  lowerClevisMesh: THREE.Mesh;
} {
  const lowerGroup = new THREE.Group();
  lowerGroup.name = 'ElbowLowerHousing';

  const knuckleRadius = ELBOW_CONFIG.hingeRadius * 0.94;
  const knuckleGeo = new THREE.CylinderGeometry(
    knuckleRadius,
    knuckleRadius,
    ELBOW_CONFIG.centerKnuckleWidth,
    24
  );
  knuckleGeo.rotateZ(Math.PI / 2);

  const lowerKnuckle = new THREE.Mesh(knuckleGeo, materials.joint);
  lowerKnuckle.name = 'LowerClevisKnuckle';
  lowerKnuckle.position.set(0, 0, 0);

  // Downward mechanical stem inserting into forearm gauntlet
  const stemGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.lowerHousingRadius,
    ELBOW_CONFIG.lowerHousingRadius * 0.92,
    ELBOW_CONFIG.lowerHousingHeight,
    24
  );
  const stemMesh = new THREE.Mesh(stemGeo, materials.joint);
  stemMesh.name = 'LowerJointStem';
  stemMesh.position.set(0, ELBOW_CONFIG.lowerHousingOffsetY, 0);

  // Anterior servo wire conduit groove
  const conduitGeo = new THREE.BoxGeometry(0.016, ELBOW_CONFIG.lowerHousingHeight * 0.85, 0.006);
  const conduitMesh = new THREE.Mesh(conduitGeo, materials.joint);
  conduitMesh.position.set(0, ELBOW_CONFIG.lowerHousingOffsetY, ELBOW_CONFIG.lowerHousingRadius * 0.85);

  // Posterior reinforcement strut linking knuckle to gauntlet mount
  const strutGeo = new THREE.BoxGeometry(
    ELBOW_CONFIG.centerKnuckleWidth * 0.85,
    Math.abs(ELBOW_CONFIG.lowerHousingOffsetY) + 0.004,
    0.012
  );
  const strutMesh = new THREE.Mesh(strutGeo, materials.joint);
  strutMesh.position.set(0, ELBOW_CONFIG.lowerHousingOffsetY * 0.6, -knuckleRadius * 0.55);

  // Lower Actuator Anchor Lug (Receives bottom rod of hydraulic flexion ram)
  const lowerLugGeo = new THREE.BoxGeometry(0.012, 0.014, 0.014);
  const lowerLug = new THREE.Mesh(lowerLugGeo, materials.joint);
  lowerLug.position.set(0, -0.018, -knuckleRadius * 0.80);

  const tempLower = new THREE.Group();
  tempLower.add(lowerKnuckle);
  tempLower.add(stemMesh);
  tempLower.add(conduitMesh);
  tempLower.add(strutMesh);
  tempLower.add(lowerLug);

  const lowerMerged = mergeGroupMeshesByMaterial(tempLower, materials.joint, 'LowerHousing_Merged')!;
  tempLower.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  lowerGroup.add(lowerMerged);

  return {
    group: lowerGroup,
    lowerClevisMesh: lowerMerged,
  };
}

/**
 * 5. HYDRAULIC FLEXION RAM ACTUATOR
 * Prominent hydraulic ram bridging upper housing and lower clevis.
 */
function createHydraulicRam(materials: RobotMaterialPalette): {
  group: THREE.Group;
  ramCylinder: THREE.Mesh;
  ramPiston: THREE.Mesh;
} {
  const ramGroup = new THREE.Group();
  ramGroup.name = 'ElbowHydraulicRam';
  ramGroup.position.set(0, 0.015, -ELBOW_CONFIG.hingeRadius * 0.92);
  ramGroup.rotation.x = -0.20;

  // Cylinder body (Dark gunmetal)
  const cylGeo = new THREE.CylinderGeometry(0.0070, 0.0070, 0.028, 16);
  const ramCylinder = new THREE.Mesh(cylGeo, materials.joint);
  ramCylinder.position.set(0, 0.008, 0);
  ramCylinder.castShadow = true;
  ramGroup.add(ramCylinder);

  // Anodized violet collar ring
  const collarGeo = new THREE.TorusGeometry(0.0075, 0.0015, 6, 16);
  const ramCollar = new THREE.Mesh(collarGeo, materials.purpleEmissive);
  ramCollar.rotation.x = Math.PI / 2;
  ramCollar.position.set(0, 0.002, 0);
  ramGroup.add(ramCollar);

  // Polished chrome telescopic piston shaft
  const pistonGeo = new THREE.CylinderGeometry(0.0042, 0.0042, 0.032, 16);
  const ramPiston = new THREE.Mesh(pistonGeo, materials.joint);
  ramPiston.position.set(0, -0.016, 0);
  ramPiston.castShadow = true;
  ramGroup.add(ramPiston);

  // Lower rod eyelet
  const eyeletGeo = new THREE.SphereGeometry(0.0048, 10, 10);
  const eyelet = new THREE.Mesh(eyeletGeo, materials.joint);
  eyelet.position.set(0, -0.030, 0);
  ramGroup.add(eyelet);

  return { group: ramGroup, ramCylinder, ramPiston };
}

/**
 * 6. POSTERIOR OLECRANON ARMOR SHIELD (White Ceramic Cup)
 * Cups the stationary upper clevis without interfering with rotation.
 */
function createOlecranonArmor(materials: RobotMaterialPalette): THREE.Mesh {
  const oleShape = new THREE.Shape();
  oleShape.moveTo(-0.022, 0.024);
  oleShape.quadraticCurveTo(0, 0.026, 0.022, 0.024);
  oleShape.quadraticCurveTo(0.024, 0.006, 0.018, -0.018);
  oleShape.quadraticCurveTo(0, -0.020, -0.018, -0.018);
  oleShape.quadraticCurveTo(-0.024, 0.006, -0.022, 0.024);
  oleShape.closePath();

  const oleGeo = new THREE.ExtrudeGeometry(oleShape, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.0020,
    bevelSegments: 3,
  });
  oleGeo.center();

  const oleMesh = new THREE.Mesh(oleGeo, materials.armor);
  oleMesh.name = 'OlecranonArmorShield';
  oleMesh.position.set(0, 0.010, -ELBOW_CONFIG.hingeRadius * 1.08);
  oleMesh.castShadow = true;
  oleMesh.receiveShadow = true;
  return oleMesh;
}

/**
 * Complete Reconstructed Robotic Elbow Assembly
 */
export function createElbow(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ElbowNodes {
  const elbowGroup = new THREE.Group();
  elbowGroup.name = side === -1 ? 'LeftElbowGroup' : 'RightElbowGroup';

  const ledMeshes: THREE.Mesh[] = [];

  // 1. Stationary Upper Clevis Housing
  const upper = createUpperHousing(materials);
  elbowGroup.add(upper.group);

  // 2. Central Hinge Core & Transverse Axle Pin
  const core = createCentralHingeCore(materials);
  elbowGroup.add(core.coreGroup);
  elbowGroup.add(core.pinGroup);

  // 3. Dual Large Rotational Bearing Discs
  const lateral = createRotationalDisc('lateral', side, materials);
  elbowGroup.add(lateral.discGroup);
  ledMeshes.push(lateral.accentRing);

  const medial = createRotationalDisc('medial', side, materials);
  elbowGroup.add(medial.discGroup);
  ledMeshes.push(medial.accentRing);

  // 4. Posterior Hydraulic Flexion Ram Actuator
  const ram = createHydraulicRam(materials);
  elbowGroup.add(ram.group);

  // 5. Posterior Olecranon Armor Shield
  const olecranonMesh = createOlecranonArmor(materials);
  elbowGroup.add(olecranonMesh);

  // 6. Rotating Forearm Pivot
  const forearmPivot = new THREE.Group();
  forearmPivot.name = side === -1 ? 'LeftForearmPivot' : 'RightForearmPivot';
  forearmPivot.position.set(0, 0, 0);
  elbowGroup.add(forearmPivot);

  // 7. Lower Clevis Housing attached to forearmPivot
  const lower = createLowerHousing(materials);
  forearmPivot.add(lower.group);

  // Dynamic flexion angle control helper
  let currentAngle = 0;
  const setAngle = (angleRad: number) => {
    const clamped = THREE.MathUtils.clamp(angleRad, ELBOW_CONFIG.maxBend, ELBOW_CONFIG.minBend);
    forearmPivot.rotation.x = clamped;
    currentAngle = clamped;
    ram.group.rotation.x = -0.20 + clamped * 0.35;
  };
  const getAngle = () => currentAngle;

  return {
    group: elbowGroup,
    forearmPivot,
    upperConnector: upper.connector,
    upperHousing: upper.group,
    hingeCore: core.coreGroup,
    centralPin: core.pinGroup,
    lateralDisc: lateral.discGroup,
    medialDisc: medial.discGroup,
    lowerHousing: lower.group,
    accentRing: lateral.accentRing,
    medialAccentRing: medial.accentRing,
    ledMeshes,

    hydraulicRam: ram.group,
    ramPiston: ram.ramPiston,
    ramCylinder: ram.ramCylinder,
    olecranonMesh,
    lateralDiscNodes: lateral.discNodes,
    medialDiscNodes: medial.discNodes,

    setAngle,
    getAngle,
    mainHingeBarrel: core.barrelMesh,
    lateralHub: lateral.outerDisc,
    medialHub: medial.outerDisc,
    olecranonArmor: olecranonMesh,
    upperClevis: upper.upperClevisMesh,
    lowerClevis: lower.lowerClevisMesh,
  };
}
