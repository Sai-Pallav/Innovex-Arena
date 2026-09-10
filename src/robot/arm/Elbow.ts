import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

/**
 * PRODUCTION-GRADE ROBOT ELBOW CONFIGURATION
 * Centralized dimensions, clearances, and angular limits.
 */
export const ELBOW_CONFIG = {
  // Transverse Axis & Core Dimensions (meters)
  hingeRadius: 0.032,           // Central hinge core outer radius
  hingeWidth: 0.076,            // Total transverse span along X-axis
  coreRadius: 0.027,            // Inner cylindrical core radius
  knuckleWidth: 0.015,          // Width of individual upper clevis knuckles
  clevisGap: 0.0015,            // Clearance between interlocking knuckles
  centerKnuckleWidth: 0.028,    // Width of lower center knuckle (rotates with forearm)
  
  // Central Hinge Pin (Axle)
  axlePinRadius: 0.0135,        // Central axle pin radius
  axleBoreRadius: 0.0060,       // Hollow core bore radius
  axlePinLength: 0.082,         // Total length of central pin spanning side to side
  
  // Dual Side Rotational Discs
  discOuterRadius: 0.0345,      // Outer beveled ring radius
  discThickness: 0.0065,        // Thickness of side cover
  discOffsetX: 0.0385,          // Lateral & medial X offsets from joint center
  emissiveRingRadius: 0.0235,   // Purple accent ring radius
  emissiveRingTube: 0.0020,     // Purple accent ring tube thickness
  innerCapRadius: 0.0125,       // Recessed central metallic hub cap radius
  
  // Upper Joint Housing (Stationary with Upper Arm)
  upperHousingRadius: 0.0355,   // Upper mechanical collar radius
  upperHousingHeight: 0.028,    // Vertical height extending into upper arm socket
  upperHousingOffsetY: 0.016,   // Center Y position relative to elbow origin
  
  // Lower Joint Housing (Articulates on forearmPivot with Forearm)
  lowerHousingRadius: 0.0340,   // Lower mechanical collar radius
  lowerHousingHeight: 0.026,    // Vertical height extending into forearm gauntlet
  lowerHousingOffsetY: -0.014,  // Center Y position relative to forearm pivot
  
  // Angular Limits (radians)
  // Flexion is negative rotation around X-axis (-X)
  neutralAngle: 0.0,            // 0° (fully extended straight arm)
  minBend: 0.05,                // ~+3° slight hyperextension tolerance
  maxBend: -2.05,               // ~-117.5° (~115°-120° maximum practical bend)
  restingBend: -0.48,           // ~-27.5° default posed bend
  
  // Armor Clearances
  armorClearanceGap: 0.0035,    // 3.5mm safety clearance between armor and moving parts
} as const;

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
 * Remains completely stationary under upperArm during elbow flexion.
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
    20
  );
  const connector = new THREE.Mesh(connectorGeo, materials.joint);
  connector.name = 'UpperArmConnector';
  connector.position.set(0, ELBOW_CONFIG.upperHousingOffsetY + 0.004, 0);
  connector.castShadow = true;
  connector.receiveShadow = true;
  upperGroup.add(connector);

  // Beveled collar rim transition
  const rimGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.upperHousingRadius * 0.98,
    0.0022,
    6,
    20
  );
  const collarRim = new THREE.Mesh(rimGeo, materials.joint);
  collarRim.rotation.x = Math.PI / 2;
  collarRim.position.set(0, ELBOW_CONFIG.upperHousingOffsetY + ELBOW_CONFIG.upperHousingHeight * 0.5, 0);
  upperGroup.add(collarRim);

  // Dual downward-reaching clevis knuckles (Left and Right along X)
  // Straddles the center knuckle and holds the central axle pin
  const knuckleRadius = ELBOW_CONFIG.hingeRadius * 0.96;
  const knuckleGeo = new THREE.CylinderGeometry(
    knuckleRadius,
    knuckleRadius,
    ELBOW_CONFIG.knuckleWidth,
    18
  );
  // Knuckles have transverse rotation (cylinder length along X)
  knuckleGeo.rotateZ(Math.PI / 2);

  const leftKnuckleX = -(ELBOW_CONFIG.centerKnuckleWidth * 0.5 + ELBOW_CONFIG.clevisGap + ELBOW_CONFIG.knuckleWidth * 0.5);
  const rightKnuckleX = ELBOW_CONFIG.centerKnuckleWidth * 0.5 + ELBOW_CONFIG.clevisGap + ELBOW_CONFIG.knuckleWidth * 0.5;

  // Left clevis knuckle
  const leftKnuckle = new THREE.Mesh(knuckleGeo, materials.joint);
  leftKnuckle.name = 'UpperClevisKnuckle_Left';
  leftKnuckle.position.set(leftKnuckleX, 0, 0);
  leftKnuckle.castShadow = true;
  leftKnuckle.receiveShadow = true;
  upperGroup.add(leftKnuckle);

  // Right clevis knuckle
  const rightKnuckle = new THREE.Mesh(knuckleGeo, materials.joint);
  rightKnuckle.name = 'UpperClevisKnuckle_Right';
  rightKnuckle.position.set(rightKnuckleX, 0, 0);
  rightKnuckle.castShadow = true;
  rightKnuckle.receiveShadow = true;
  upperGroup.add(rightKnuckle);

  // Structural vertical support brackets connecting collar to each knuckle
  const bracketGeo = new THREE.BoxGeometry(
    ELBOW_CONFIG.knuckleWidth * 0.90,
    ELBOW_CONFIG.upperHousingOffsetY + 0.004,
    knuckleRadius * 1.45
  );

  const leftBracket = new THREE.Mesh(bracketGeo, materials.joint);
  leftBracket.position.set(leftKnuckleX, (ELBOW_CONFIG.upperHousingOffsetY + 0.004) * 0.5, -0.002);
  leftBracket.castShadow = true;
  upperGroup.add(leftBracket);

  const rightBracket = new THREE.Mesh(bracketGeo, materials.joint);
  rightBracket.position.set(rightKnuckleX, (ELBOW_CONFIG.upperHousingOffsetY + 0.004) * 0.5, -0.002);
  rightBracket.castShadow = true;
  upperGroup.add(rightBracket);

  // Posterior mechanical spine rib joining the two brackets
  const ribGeo = new THREE.BoxGeometry(
    Math.abs(leftKnuckleX - rightKnuckleX) + ELBOW_CONFIG.knuckleWidth,
    0.012,
    0.006
  );
  const spineRib = new THREE.Mesh(ribGeo, materials.joint);
  spineRib.position.set(0, ELBOW_CONFIG.upperHousingOffsetY * 0.7, -knuckleRadius * 0.72);
  spineRib.castShadow = true;
  upperGroup.add(spineRib);

  return {
    group: upperGroup,
    connector,
    upperClevisMesh: leftKnuckle,
  };
}

/**
 * 2. CENTRAL HINGE CORE & CENTRAL PIN
 * Heavy-duty horizontal axle along X-axis connecting both sides of the hinge.
 * Precision-stepped diameters with flanged collars and center bore.
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
    20
  );
  barrelGeo.rotateZ(Math.PI / 2);

  const barrelMesh = new THREE.Mesh(barrelGeo, materials.joint);
  barrelMesh.name = 'CentralHingeBarrel';
  barrelMesh.castShadow = true;
  barrelMesh.receiveShadow = true;
  coreGroup.add(barrelMesh);

  // Concentric bearing spacer rings on either side of the knuckles
  const spacerGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.coreRadius * 1.04,
    0.0016,
    5,
    18
  );
  spacerGeo.rotateY(Math.PI / 2);

  const leftSpacer = new THREE.Mesh(spacerGeo, materials.joint);
  leftSpacer.position.set(-ELBOW_CONFIG.centerKnuckleWidth * 0.5, 0, 0);
  coreGroup.add(leftSpacer);

  const rightSpacer = new THREE.Mesh(spacerGeo, materials.joint);
  rightSpacer.position.set(ELBOW_CONFIG.centerKnuckleWidth * 0.5, 0, 0);
  coreGroup.add(rightSpacer);

  // Central Hinge Pin / Axle ("Central Hinge Pin" in exploded view)
  const pinGroup = new THREE.Group();
  pinGroup.name = 'CentralHingePin';

  // Main axle shaft passing through all knuckles
  const shaftGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.axlePinRadius,
    ELBOW_CONFIG.axlePinRadius,
    ELBOW_CONFIG.axlePinLength,
    18
  );
  shaftGeo.rotateZ(Math.PI / 2);

  const shaftMesh = new THREE.Mesh(shaftGeo, materials.joint);
  shaftMesh.name = 'AxlePinShaft';
  shaftMesh.castShadow = true;
  pinGroup.add(shaftMesh);

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
  pinGroup.add(leftShoulder);

  const rightShoulder = new THREE.Mesh(shoulderGeo, materials.joint);
  rightShoulder.position.set(ELBOW_CONFIG.discOffsetX * 0.88, 0, 0);
  pinGroup.add(rightShoulder);

  return { coreGroup, pinGroup, barrelMesh };
}

/**
 * 3. SIDE ROTATIONAL DISC (Lateral or Medial)
 * Concentric multi-ring cover with recessed center and purple emissive ring.
 * Based directly on "Rotational Disc Detail" and "Exploded View".
 */
function createRotationalDisc(
  side: -1 | 1,
  isLateral: boolean,
  materials: RobotMaterialPalette
): {
  discGroup: THREE.Group;
  accentRing: THREE.Mesh;
  outerDisc: THREE.Mesh;
} {
  const discGroup = new THREE.Group();
  const discName = isLateral ? 'LateralRotationalDisc' : 'MedialRotationalDisc';
  discGroup.name = discName;

  // Sign determines which side of the elbow (+X or -X)
  // For right arm: lateral is +X, medial is -X.
  // For left arm: lateral is -X, medial is +X.
  const sign = isLateral ? (side === 1 ? 1 : -1) : (side === 1 ? -1 : 1);
  const posX = sign * ELBOW_CONFIG.discOffsetX;
  discGroup.position.set(posX, 0, 0);

  // 1. Outer Housing Flange
  const outerDiscGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discThickness,
    20
  );
  outerDiscGeo.rotateZ(Math.PI / 2);

  const outerDisc = new THREE.Mesh(outerDiscGeo, materials.joint);
  outerDisc.name = `${discName}_OuterHousing`;
  outerDisc.position.set(0, 0, 0);
  outerDisc.castShadow = true;
  outerDisc.receiveShadow = true;
  discGroup.add(outerDisc);

  // 2. Beveled Outer Ring (Torus)
  const beveledRimGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.discOuterRadius * 0.94,
    0.0022,
    5,
    18
  );
  beveledRimGeo.rotateY(Math.PI / 2);

  const beveledRim = new THREE.Mesh(beveledRimGeo, materials.joint);
  beveledRim.position.set(sign * (ELBOW_CONFIG.discThickness * 0.35), 0, 0);
  discGroup.add(beveledRim);

  // 3. Signature Circular Purple Emissive Accent Ring
  const accentGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.emissiveRingRadius,
    ELBOW_CONFIG.emissiveRingTube,
    5,
    18
  );
  accentGeo.rotateY(Math.PI / 2);

  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.name = `${discName}_AccentRing`;
  accentRing.position.set(sign * (ELBOW_CONFIG.discThickness * 0.45), 0, 0);
  discGroup.add(accentRing);

  // 4. Recessed Inner Metallic Disc Face
  const innerDiscGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.emissiveRingRadius * 0.88,
    ELBOW_CONFIG.emissiveRingRadius * 0.88,
    0.0035,
    18
  );
  innerDiscGeo.rotateZ(Math.PI / 2);

  const innerDisc = new THREE.Mesh(innerDiscGeo, materials.joint);
  innerDisc.position.set(sign * (ELBOW_CONFIG.discThickness * 0.25), 0, 0);
  discGroup.add(innerDisc);

  // 5. Central Raised Hub Cap with Chamfered Edge
  const capGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.innerCapRadius,
    ELBOW_CONFIG.innerCapRadius * 1.10,
    0.0045,
    16
  );
  capGeo.rotateZ(Math.PI / 2);

  const hubCap = new THREE.Mesh(capGeo, materials.joint);
  hubCap.position.set(sign * (ELBOW_CONFIG.discThickness * 0.50), 0, 0);
  discGroup.add(hubCap);

  // 6. Central Hex/Circular Bore Dimple
  const boreGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.0025, 12);
  boreGeo.rotateZ(Math.PI / 2);

  const centerBore = new THREE.Mesh(boreGeo, materials.joint);
  centerBore.position.set(sign * (ELBOW_CONFIG.discThickness * 0.54), 0, 0);
  discGroup.add(centerBore);

  return { discGroup, accentRing, outerDisc };
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
    18
  );
  knuckleGeo.rotateZ(Math.PI / 2);

  const lowerKnuckle = new THREE.Mesh(knuckleGeo, materials.joint);
  lowerKnuckle.name = 'LowerClevisKnuckle';
  lowerKnuckle.position.set(0, 0, 0);
  lowerKnuckle.castShadow = true;
  lowerKnuckle.receiveShadow = true;
  lowerGroup.add(lowerKnuckle);

  // Downward mechanical stem / saddle inserting into forearm gauntlet
  const stemGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.lowerHousingRadius,
    ELBOW_CONFIG.lowerHousingRadius * 0.92,
    ELBOW_CONFIG.lowerHousingHeight,
    20
  );
  const stemMesh = new THREE.Mesh(stemGeo, materials.joint);
  stemMesh.name = 'LowerJointStem';
  stemMesh.position.set(0, ELBOW_CONFIG.lowerHousingOffsetY, 0);
  stemMesh.castShadow = true;
  stemMesh.receiveShadow = true;
  lowerGroup.add(stemMesh);

  // Anterior recessed servo wire conduit / mechanical groove
  const conduitGeo = new THREE.BoxGeometry(0.014, ELBOW_CONFIG.lowerHousingHeight * 0.85, 0.005);
  const conduitMesh = new THREE.Mesh(conduitGeo, materials.joint);
  conduitMesh.position.set(0, ELBOW_CONFIG.lowerHousingOffsetY, ELBOW_CONFIG.lowerHousingRadius * 0.85);
  lowerGroup.add(conduitMesh);

  // Posterior reinforcement strut linking knuckle to gauntlet mount
  const strutGeo = new THREE.BoxGeometry(
    ELBOW_CONFIG.centerKnuckleWidth * 0.80,
    Math.abs(ELBOW_CONFIG.lowerHousingOffsetY),
    0.010
  );
  const strutMesh = new THREE.Mesh(strutGeo, materials.joint);
  strutMesh.position.set(0, ELBOW_CONFIG.lowerHousingOffsetY * 0.6, -knuckleRadius * 0.55);
  strutMesh.castShadow = true;
  lowerGroup.add(strutMesh);

  return {
    group: lowerGroup,
    lowerClevisMesh: lowerKnuckle,
  };
}

/**
 * 5. POSTERIOR OLECRANON ARMOR SHIELD (Curved White Ceramic Cup)
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
    bevelSegments: 1,
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
 * CREATES THE COMPLETE PRODUCTION-GRADE ROBOT ELBOW
 *
 * Visual hierarchy:
 * UPPER ARM
 *     ↓
 * Upper-Arm Connector
 *     ↓
 * Mechanical Hinge (Stationary Upper Clevis + Axle Pin + Dual Side Discs)
 *     ↓
 * Central Elbow Axis (ForearmPivot at [0, 0, 0])
 *     ↓
 * Lower Joint Housing (Rotating Center Clevis Knuckle)
 *     ↓
 * FOREARM
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

  // 4. Posterior Olecranon Armor Shield (Stationary with upper housing)
  const olecranonMesh = createOlecranonArmor(materials);
  elbowGroup.add(olecranonMesh);

  // 5. DEDICATED FOREARM ROTATION PIVOT (The Hinge Axis at [0, 0, 0])
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
