import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

/**
 * PRODUCTION-GRADE ROBOT ELBOW CONFIGURATION
 * Centralized dimensions, clearances, and angular limits.
 */
export const ELBOW_CONFIG = {
  // Transverse Axis & Core Dimensions (meters) - Calibrated to arm width
  hingeRadius: 0.029,           // Central hinge core outer radius
  hingeWidth: 0.066,            // Total transverse span along X-axis
  coreRadius: 0.025,            // Inner cylindrical core radius
  knuckleWidth: 0.013,          // Width of individual upper clevis knuckles
  clevisGap: 0.0015,            // Clearance between interlocking knuckles
  centerKnuckleWidth: 0.024,    // Width of lower center knuckle (rotates with forearm)
  
  // Central Hinge Pin (Axle)
  axlePinRadius: 0.0120,        // Central axle pin radius
  axleBoreRadius: 0.0055,       // Hollow core bore radius
  axlePinLength: 0.070,         // Total length of central pin spanning side to side
  
  // Dual Side Rotational Discs
  discOuterRadius: 0.0310,      // Outer beveled ring radius flush with arm flanks
  discThickness: 0.0055,        // Thickness of side cover
  discOffsetX: 0.0330,          // Lateral & medial X offsets from joint center
  emissiveRingRadius: 0.0210,   // Purple accent ring radius
  emissiveRingTube: 0.0016,     // Purple accent ring tube thickness
  innerCapRadius: 0.0110,       // Recessed central metallic hub cap radius
  
  // Upper Joint Housing (Stationary with Upper Arm)
  upperHousingRadius: 0.0335,   // Upper mechanical collar radius
  upperHousingHeight: 0.026,    // Vertical height extending into upper arm socket
  upperHousingOffsetY: 0.015,   // Center Y position relative to elbow origin
  
  // Lower Joint Housing (Articulates on forearmPivot with Forearm)
  lowerHousingRadius: 0.0325,   // Lower mechanical collar radius
  lowerHousingHeight: 0.024,    // Vertical height extending into forearm gauntlet
  lowerHousingOffsetY: -0.013,  // Center Y position relative to forearm pivot
  
  // Angular Limits (radians)
  // Flexion is negative rotation around X-axis (-X)
  neutralAngle: 0.0,            // 0° (fully extended straight arm)
  minBend: 0.05,                // ~+3° slight hyperextension tolerance
  maxBend: -2.05,               // ~-117.5° (~115°-120° maximum practical bend)
  restingBend: -0.48,           // ~-27.5° default posed bend
  
  // Armor Clearances
  armorClearanceGap: 0.0035,    // 3.5mm safety clearance between armor and moving parts
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
 * 1. UPPER ARM HOUSING & UPPER JOINT BLOCK
 * Dark titanium mechanical collar and dual downward clevis knuckles.
 * Remains stationary under upperArm during elbow flexion.
 */
function createUpperHousing(materials: RobotMaterialPalette): {
  group: THREE.Group;
  connector: THREE.Mesh;
  upperClevisMesh: THREE.Mesh;
} {
  const upperGroup = new THREE.Group();
  upperGroup.name = 'ElbowUpperHousing';

  // Upper mounting connector collar inserting into upper arm socket
  const connectorGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.upperHousingRadius * 0.94,
    ELBOW_CONFIG.upperHousingRadius,
    ELBOW_CONFIG.upperHousingHeight,
    24
  );
  const connector = new THREE.Mesh(connectorGeo, materials.joint);
  connector.name = 'UpperArmConnector';
  connector.position.set(0, ELBOW_CONFIG.upperHousingOffsetY + 0.004, 0);

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

  // Dual downward-reaching clevis knuckles (Left and Right along X)
  const knuckleRadius = ELBOW_CONFIG.hingeRadius * 0.96;
  const knuckleGeo = new THREE.CylinderGeometry(
    knuckleRadius,
    knuckleRadius,
    ELBOW_CONFIG.knuckleWidth,
    20
  );
  knuckleGeo.rotateZ(Math.PI / 2);

  const leftKnuckleX = -(ELBOW_CONFIG.centerKnuckleWidth * 0.5 + ELBOW_CONFIG.clevisGap + ELBOW_CONFIG.knuckleWidth * 0.5);
  const rightKnuckleX = ELBOW_CONFIG.centerKnuckleWidth * 0.5 + ELBOW_CONFIG.clevisGap + ELBOW_CONFIG.knuckleWidth * 0.5;

  // Left clevis knuckle with chamfers
  const leftKnuckle = new THREE.Mesh(knuckleGeo, materials.joint);
  leftKnuckle.name = 'UpperClevisKnuckle_Left';
  leftKnuckle.position.set(leftKnuckleX, 0, 0);

  // Right clevis knuckle with chamfers
  const rightKnuckle = new THREE.Mesh(knuckleGeo, materials.joint);
  rightKnuckle.name = 'UpperClevisKnuckle_Right';
  rightKnuckle.position.set(rightKnuckleX, 0, 0);

  // Structural vertical support brackets connecting collar to each knuckle
  const bracketGeo = new THREE.BoxGeometry(
    ELBOW_CONFIG.knuckleWidth * 0.90,
    ELBOW_CONFIG.upperHousingOffsetY + 0.004,
    knuckleRadius * 1.45
  );

  const leftBracket = new THREE.Mesh(bracketGeo, materials.joint);
  leftBracket.position.set(leftKnuckleX, (ELBOW_CONFIG.upperHousingOffsetY + 0.004) * 0.5, -0.002);

  const rightBracket = new THREE.Mesh(bracketGeo, materials.joint);
  rightBracket.position.set(rightKnuckleX, (ELBOW_CONFIG.upperHousingOffsetY + 0.004) * 0.5, -0.002);

  // Posterior mechanical spine rib joining the two brackets
  const ribGeo = new THREE.BoxGeometry(
    Math.abs(leftKnuckleX - rightKnuckleX) + ELBOW_CONFIG.knuckleWidth,
    0.012,
    0.006
  );
  const spineRib = new THREE.Mesh(ribGeo, materials.joint);
  spineRib.position.set(0, ELBOW_CONFIG.upperHousingOffsetY * 0.7, -knuckleRadius * 0.72);

  // Upper Actuator Anchor Lug (Receives top of hydraulic flexion ram)
  const lugGeo = new THREE.BoxGeometry(0.010, 0.012, 0.012);
  const upperLug = new THREE.Mesh(lugGeo, materials.joint);
  upperLug.position.set(0, ELBOW_CONFIG.upperHousingOffsetY * 0.6, -knuckleRadius * 0.92);

  const tempUpper = new THREE.Group();
  tempUpper.add(connector);
  tempUpper.add(collarRim);
  tempUpper.add(leftKnuckle);
  tempUpper.add(rightKnuckle);
  tempUpper.add(leftBracket);
  tempUpper.add(rightBracket);
  tempUpper.add(spineRib);
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
 * 2. CENTRAL HINGE CORE, GEAR SECTOR & AXLE PIN
 * Heavy-duty horizontal axle along X-axis with high-torque gear sector.
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
    24
  );
  barrelGeo.rotateZ(Math.PI / 2);

  const barrelMesh = new THREE.Mesh(barrelGeo, materials.joint);
  barrelMesh.name = 'CentralHingeBarrel';

  // Precision Spur Gear Sector (10 radial teeth on anterior face showing mechanical drive)
  const gearSector = new THREE.Group();
  gearSector.name = 'ElbowSpurGearSector';
  for (let i = 0; i < 10; i++) {
    const angle = ((i - 4.5) / 10) * (Math.PI * 0.55) + Math.PI * 0.5;
    const toothGeo = new THREE.BoxGeometry(0.024, 0.0028, 0.0045);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      0,
      Math.sin(angle) * (ELBOW_CONFIG.coreRadius + 0.002),
      Math.cos(angle) * (ELBOW_CONFIG.coreRadius + 0.002)
    );
    tooth.rotation.x = angle;
    gearSector.add(tooth);
  }

  // Concentric bearing spacer rings on either side of the knuckles
  const spacerGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.coreRadius * 1.04,
    0.0016,
    6,
    20
  );
  spacerGeo.rotateY(Math.PI / 2);

  const leftSpacer = new THREE.Mesh(spacerGeo, materials.joint);
  leftSpacer.position.set(-ELBOW_CONFIG.centerKnuckleWidth * 0.5, 0, 0);

  const rightSpacer = new THREE.Mesh(spacerGeo, materials.joint);
  rightSpacer.position.set(ELBOW_CONFIG.centerKnuckleWidth * 0.5, 0, 0);

  const tempCore = new THREE.Group();
  tempCore.add(barrelMesh);
  tempCore.add(gearSector);
  tempCore.add(leftSpacer);
  tempCore.add(rightSpacer);

  const coreMerged = mergeGroupMeshesByMaterial(tempCore, materials.joint, 'CentralHingeBarrel_Merged')!;
  tempCore.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  coreGroup.add(coreMerged);

  // Central Hinge Pin / Axle ("Central Hinge Pin" in exploded view)
  const pinGroup = new THREE.Group();
  pinGroup.name = 'CentralHingePin';

  // Main axle shaft passing through all knuckles
  const shaftGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.axlePinRadius,
    ELBOW_CONFIG.axlePinRadius,
    ELBOW_CONFIG.axlePinLength,
    20
  );
  shaftGeo.rotateZ(Math.PI / 2);

  const shaftMesh = new THREE.Mesh(shaftGeo, materials.joint);
  shaftMesh.name = 'AxlePinShaft';

  // Stepped shoulder sleeves near outer ends
  const shoulderGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.axlePinRadius * 1.18,
    ELBOW_CONFIG.axlePinRadius * 1.18,
    0.008,
    16
  );
  shoulderGeo.rotateZ(Math.PI / 2);

  const leftShoulder = new THREE.Mesh(shoulderGeo, materials.joint);
  leftShoulder.position.set(-ELBOW_CONFIG.discOffsetX * 0.88, 0, 0);

  const rightShoulder = new THREE.Mesh(shoulderGeo, materials.joint);
  rightShoulder.position.set(ELBOW_CONFIG.discOffsetX * 0.88, 0, 0);

  const tempPin = new THREE.Group();
  tempPin.add(shaftMesh);
  tempPin.add(leftShoulder);
  tempPin.add(rightShoulder);

  const pinMerged = mergeGroupMeshesByMaterial(tempPin, materials.joint, 'AxlePinShaft_Merged')!;
  tempPin.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  pinGroup.add(pinMerged);

  return { coreGroup, pinGroup, barrelMesh: coreMerged };
}

/**
 * 3. MULTI-STAGE CONCENTRIC SIDE ROTATIONAL DISC (Lateral or Medial)
 * Multi-layer concentric architecture for precision CAD exploded inspection:
 * - Outer Retaining Bezel with 6 hex bolts and laser tick marks
 * - Roller Bearing Race with 10 micro-rollers
 * - Purple LED Reactor Halo
 * - Machined Titanium Disc Face
 * - Central Magnetic Hub Cap with knurled grip & socket bolt head
 */
function createRotationalDisc(
  side: -1 | 1,
  isLateral: boolean,
  materials: RobotMaterialPalette
): {
  discGroup: THREE.Group;
  discNodes: ElbowDiscNodes;
  accentRing: THREE.Mesh;
  outerDisc: THREE.Mesh;
} {
  const discGroup = new THREE.Group();
  const discName = isLateral ? 'LateralRotationalDisc' : 'MedialRotationalDisc';
  discGroup.name = discName;

  const sign = isLateral ? (side === 1 ? 1 : -1) : (side === 1 ? -1 : 1);
  const posX = sign * ELBOW_CONFIG.discOffsetX;
  discGroup.position.set(posX, 0, 0);

  // A. Outer Retaining Bezel Group (Exploded Level)
  const outerBezel = new THREE.Group();
  outerBezel.name = `${discName}_OuterBezel`;
  discGroup.add(outerBezel);

  const outerDiscGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discThickness,
    24
  );
  outerDiscGeo.rotateZ(Math.PI / 2);

  const outerDisc = new THREE.Mesh(outerDiscGeo, materials.joint);
  outerDisc.name = `${discName}_OuterHousing`;

  // Beveled outer rim
  const beveledRimGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.discOuterRadius * 0.94,
    0.0022,
    6,
    24
  );
  beveledRimGeo.rotateY(Math.PI / 2);
  const beveledRim = new THREE.Mesh(beveledRimGeo, materials.joint);
  beveledRim.position.set(sign * (ELBOW_CONFIG.discThickness * 0.35), 0, 0);

  // 6 Perimeter Titanium Hex Socket Cap Screws
  const tempBezel = new THREE.Group();
  tempBezel.add(outerDisc);
  tempBezel.add(beveledRim);
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.0024, 6);
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

  // B. Roller Bearing Race Group (Exploded Level)
  const bearingRace = new THREE.Group();
  bearingRace.name = `${discName}_BearingRace`;
  discGroup.add(bearingRace);

  const raceRingGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.emissiveRingRadius * 1.08,
    0.0018,
    6,
    20
  );
  raceRingGeo.rotateY(Math.PI / 2);
  const raceRing = new THREE.Mesh(raceRingGeo, materials.joint);
  raceRing.position.set(sign * (ELBOW_CONFIG.discThickness * 0.28), 0, 0);

  const tempRace = new THREE.Group();
  tempRace.add(raceRing);
  // 10 micro-roller bearing cylinders around the race
  for (let r = 0; r < 10; r++) {
    const angle = (r / 10) * Math.PI * 2;
    const rollerGeo = new THREE.CylinderGeometry(0.0014, 0.0014, 0.0030, 8);
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

  // C. Signature Circular Purple Emissive Accent Ring
  const accentGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.emissiveRingRadius,
    ELBOW_CONFIG.emissiveRingTube,
    6,
    24
  );
  accentGeo.rotateY(Math.PI / 2);

  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.name = `${discName}_AccentRing`;
  accentRing.position.set(sign * (ELBOW_CONFIG.discThickness * 0.45), 0, 0);
  discGroup.add(accentRing);

  // D. Recessed Inner Metallic Disc Face
  const innerDiscGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.emissiveRingRadius * 0.88,
    ELBOW_CONFIG.emissiveRingRadius * 0.88,
    0.0035,
    20
  );
  innerDiscGeo.rotateZ(Math.PI / 2);

  const innerDisc = new THREE.Mesh(innerDiscGeo, materials.joint);
  innerDisc.position.set(sign * (ELBOW_CONFIG.discThickness * 0.25), 0, 0);
  discGroup.add(innerDisc);

  // E. Central Raised Hub Cap with Knurled Grip & Socket Bolt Head
  const hubCapGroup = new THREE.Group();
  hubCapGroup.name = `${discName}_HubCapGroup`;
  discGroup.add(hubCapGroup);

  const capGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.innerCapRadius,
    ELBOW_CONFIG.innerCapRadius * 1.10,
    0.0045,
    20
  );
  capGeo.rotateZ(Math.PI / 2);

  const hubCap = new THREE.Mesh(capGeo, materials.joint);
  hubCap.position.set(sign * (ELBOW_CONFIG.discThickness * 0.50), 0, 0);

  // Central Hex/Circular Bore Dimple
  const boreGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.0030, 6);
  boreGeo.rotateZ(Math.PI / 2);
  const centerBore = new THREE.Mesh(boreGeo, materials.joint);
  centerBore.position.set(sign * (ELBOW_CONFIG.discThickness * 0.56), 0, 0);

  const tempHub = new THREE.Group();
  tempHub.add(hubCap);
  tempHub.add(centerBore);
  const hubMerged = mergeGroupMeshesByMaterial(tempHub, materials.joint, `${discName}_HubCap_Merged`)!;
  tempHub.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  hubCapGroup.add(hubMerged);

  // Core purple LED jewel dot
  const jewelGeo = new THREE.SphereGeometry(0.0025, 8, 8);
  const coreJewel = new THREE.Mesh(jewelGeo, materials.purpleEmissive);
  coreJewel.position.set(sign * (ELBOW_CONFIG.discThickness * 0.58), 0, 0);
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
 * 4. LOWER JOINT HOUSING & INTERNAL HINGE BLOCK
 * Articulating clevis knuckle that interlocks between the upper knuckles.
 * Mounted directly to `forearmPivot` so it rotates naturally with the forearm.
 */
function createLowerHousing(materials: RobotMaterialPalette): {
  group: THREE.Group;
  lowerClevisMesh: THREE.Mesh;
} {
  const lowerGroup = new THREE.Group();
  lowerGroup.name = 'ElbowLowerHousing';

  // Central clevis knuckle (width 0.028 along X, rotating around X at Y = 0)
  const knuckleRadius = ELBOW_CONFIG.hingeRadius * 0.94;
  const knuckleGeo = new THREE.CylinderGeometry(
    knuckleRadius,
    knuckleRadius,
    ELBOW_CONFIG.centerKnuckleWidth,
    20
  );
  knuckleGeo.rotateZ(Math.PI / 2);

  const lowerKnuckle = new THREE.Mesh(knuckleGeo, materials.joint);
  lowerKnuckle.name = 'LowerClevisKnuckle';
  lowerKnuckle.position.set(0, 0, 0);

  // Downward mechanical stem / saddle inserting into forearm gauntlet
  const stemGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.lowerHousingRadius,
    ELBOW_CONFIG.lowerHousingRadius * 0.92,
    ELBOW_CONFIG.lowerHousingHeight,
    24
  );
  const stemMesh = new THREE.Mesh(stemGeo, materials.joint);
  stemMesh.name = 'LowerJointStem';
  stemMesh.position.set(0, ELBOW_CONFIG.lowerHousingOffsetY, 0);

  // Anterior recessed servo wire conduit / mechanical groove
  const conduitGeo = new THREE.BoxGeometry(0.014, ELBOW_CONFIG.lowerHousingHeight * 0.85, 0.005);
  const conduitMesh = new THREE.Mesh(conduitGeo, materials.joint);
  conduitMesh.position.set(0, ELBOW_CONFIG.lowerHousingOffsetY, ELBOW_CONFIG.lowerHousingRadius * 0.85);

  // Posterior reinforcement strut linking knuckle to gauntlet mount
  const strutGeo = new THREE.BoxGeometry(
    ELBOW_CONFIG.centerKnuckleWidth * 0.80,
    Math.abs(ELBOW_CONFIG.lowerHousingOffsetY),
    0.010
  );
  const strutMesh = new THREE.Mesh(strutGeo, materials.joint);
  strutMesh.position.set(0, ELBOW_CONFIG.lowerHousingOffsetY * 0.6, -knuckleRadius * 0.55);

  // Lower Actuator Anchor Lug (Receives bottom rod of hydraulic flexion ram)
  const lowerLugGeo = new THREE.BoxGeometry(0.010, 0.012, 0.012);
  const lowerLug = new THREE.Mesh(lowerLugGeo, materials.joint);
  lowerLug.position.set(0, -0.016, -knuckleRadius * 0.75);

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
 * Robotic servo assist damper bridging upper housing and lower housing.
 */
function createHydraulicRam(materials: RobotMaterialPalette): {
  group: THREE.Group;
  ramCylinder: THREE.Mesh;
  ramPiston: THREE.Mesh;
} {
  const ramGroup = new THREE.Group();
  ramGroup.name = 'ElbowHydraulicRam';
  ramGroup.position.set(0, 0.014, -ELBOW_CONFIG.hingeRadius * 0.90);
  ramGroup.rotation.x = -0.18; // Angled along posterior line of flexion

  // Cylinder body (Dark titanium)
  const cylGeo = new THREE.CylinderGeometry(0.0058, 0.0058, 0.024, 16);
  const ramCylinder = new THREE.Mesh(cylGeo, materials.joint);
  ramCylinder.position.set(0, 0.006, 0);
  ramCylinder.castShadow = true;
  ramGroup.add(ramCylinder);

  // Anodized violet collar ring
  const collarGeo = new THREE.TorusGeometry(0.0062, 0.0014, 6, 16);
  const ramCollar = new THREE.Mesh(collarGeo, materials.purpleEmissive);
  ramCollar.rotation.x = Math.PI / 2;
  ramCollar.position.set(0, 0.001, 0);
  ramGroup.add(ramCollar);

  // Polished chrome telescopic piston shaft
  const pistonGeo = new THREE.CylinderGeometry(0.0034, 0.0034, 0.028, 16);
  const ramPiston = new THREE.Mesh(pistonGeo, materials.joint); // High metallic
  ramPiston.position.set(0, -0.015, 0);
  ramPiston.castShadow = true;
  ramGroup.add(ramPiston);

  // Lower rod eyelet
  const eyeletGeo = new THREE.SphereGeometry(0.0042, 10, 10);
  const eyelet = new THREE.Mesh(eyeletGeo, materials.joint);
  eyelet.position.set(0, -0.028, 0);
  ramGroup.add(eyelet);

  return { group: ramGroup, ramCylinder, ramPiston };
}

/**
 * 6. POSTERIOR OLECRANON ARMOR SHIELD (Curved White Ceramic Cup)
 * Preserves the robot's white armor language.
 * Cleanly cups the stationary upper clevis without interfering with rotation.
 */
function createOlecranonArmor(materials: RobotMaterialPalette): THREE.Mesh {
  const oleShape = new THREE.Shape();
  oleShape.moveTo(-0.020, 0.022);
  oleShape.quadraticCurveTo(0, 0.024, 0.020, 0.022);
  oleShape.quadraticCurveTo(0.022, 0.005, 0.016, -0.016);
  oleShape.quadraticCurveTo(0, -0.018, -0.016, -0.016);
  oleShape.quadraticCurveTo(-0.022, 0.005, -0.020, 0.022);
  oleShape.closePath();

  const oleGeo = new THREE.ExtrudeGeometry(oleShape, {
    depth: 0.010,
    bevelEnabled: true,
    bevelThickness: 0.0028,
    bevelSize: 0.0024,
    bevelSegments: 2,
  });
  oleGeo.center();

  // Cylindrical curvature along X to cleanly wrap around the hinge barrel
  const posAttr = oleGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    posAttr.setZ(i, z - (x * x) * 2.0);
  }
  oleGeo.computeVertexNormals();

  const oleMesh = new THREE.Mesh(oleGeo, materials.armor);
  oleMesh.name = 'OlecranonArmorShield';
  oleMesh.position.set(0, 0.008, -0.032);
  oleMesh.castShadow = true;
  oleMesh.receiveShadow = true;
  return oleMesh;
}

/**
 * CREATES THE COMPLETE HIGH-PRECISION ROBOT ELBOW
 */
export function createElbow(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ElbowNodes {
  const elbowGroup = new THREE.Group();
  elbowGroup.name = side === -1 ? 'LeftElbow' : 'RightElbow';

  const ledMeshes: THREE.Mesh[] = [];

  // 1. Upper Housing & Mounting Connector (Stationary)
  const { group: upperHousingGroup, connector, upperClevisMesh } = createUpperHousing(materials);
  elbowGroup.add(upperHousingGroup);

  // 2. Central Hinge Core & Axle Pin (Stationary transverse axis)
  const { coreGroup, pinGroup, barrelMesh } = createCentralHingeCore(materials);
  elbowGroup.add(coreGroup);
  elbowGroup.add(pinGroup);

  // 3. Dual Side Rotational Discs (Lateral and Medial)
  const lateral = createRotationalDisc(side, true, materials);
  elbowGroup.add(lateral.discGroup);
  ledMeshes.push(lateral.accentRing);

  const medial = createRotationalDisc(side, false, materials);
  elbowGroup.add(medial.discGroup);
  ledMeshes.push(medial.accentRing);

  // 4. Hydraulic Flexion Ram Actuator (Stationary upper, connects to lower)
  const hydraulic = createHydraulicRam(materials);
  elbowGroup.add(hydraulic.group);

  // 5. Posterior Olecranon Armor Shield (Stationary with upper housing)
  const olecranonMesh = createOlecranonArmor(materials);
  elbowGroup.add(olecranonMesh);

  // 6. Anterior Cybernetic Conduits across Flexion Fold
  const tempCables = new THREE.Group();
  for (let c = -1; c <= 1; c += 2) {
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(c * 0.014, 0.018, 0.024),
      new THREE.Vector3(c * 0.016, 0.000, 0.028),
      new THREE.Vector3(c * 0.012, -0.018, 0.022),
    ]);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 10, 0.0018, 6, false);
    const cable = new THREE.Mesh(cableGeo, materials.joint);
    tempCables.add(cable);
  }
  const mergedCables = mergeGroupMeshesByMaterial(tempCables, materials.joint, 'ElbowCables_Merged')!;
  tempCables.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  elbowGroup.add(mergedCables);

  // 7. DEDICATED FOREARM ROTATION PIVOT (The Hinge Axis at [0, 0, 0])
  const forearmPivot = new THREE.Group();
  forearmPivot.name = side === -1 ? 'LeftForearmPivot' : 'RightForearmPivot';
  forearmPivot.position.set(0, 0, 0);
  elbowGroup.add(forearmPivot);

  // Lower clevis housing attaches to forearmPivot so it articulates with forearm
  const { group: lowerHousingGroup, lowerClevisMesh } = createLowerHousing(materials);
  forearmPivot.add(lowerHousingGroup);

  // Kinematic control helper
  const setAngle = (angle: number) => {
    const clamped = THREE.MathUtils.clamp(angle, ELBOW_CONFIG.maxBend, ELBOW_CONFIG.minBend);
    forearmPivot.rotation.x = clamped;
  };

  const getAngle = () => forearmPivot.rotation.x;

  return {
    group: elbowGroup,
    forearmPivot,
    upperConnector: connector,
    upperHousing: upperHousingGroup,
    hingeCore: coreGroup,
    centralPin: pinGroup,
    lateralDisc: lateral.discGroup,
    medialDisc: medial.discGroup,
    lowerHousing: lowerHousingGroup,
    accentRing: lateral.accentRing,
    medialAccentRing: medial.accentRing,
    ledMeshes,

    // High-Precision Mechanical Open View Nodes:
    hydraulicRam: hydraulic.group,
    ramPiston: hydraulic.ramPiston,
    ramCylinder: hydraulic.ramCylinder,
    olecranonMesh,
    lateralDiscNodes: lateral.discNodes,
    medialDiscNodes: medial.discNodes,

    setAngle,
    getAngle,
    // Backwards compatibility aliases
    mainHingeBarrel: barrelMesh,
    lateralHub: lateral.outerDisc,
    medialHub: medial.outerDisc,
    olecranonArmor: olecranonMesh,
    upperClevis: upperClevisMesh,
    lowerClevis: lowerClevisMesh,
  };
}
