import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { TORSO_CONFIG } from './TorsoConfig';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface HipConnectionNodes {
  group: THREE.Group;
  bracketArm: THREE.Mesh;
  rotaryHub: THREE.Mesh;
  accentRing: THREE.Mesh;
  hipCowl: THREE.Mesh;
  iliacCrestArmor?: THREE.Mesh;
  flankLight?: THREE.Mesh;
  ledMeshes: THREE.Mesh[];
}

export interface WaistActuatorNodes {
  group: THREE.Group;
  cylinder: THREE.Mesh;
  piston: THREE.Mesh;
  upperMount: THREE.Mesh;
  lowerMount: THREE.Mesh;
}

export interface WaistAssemblyNodes {
  group: THREE.Group;
  waistPivot: THREE.Group;
  upperWaistRing: THREE.Mesh;
  waistCore: THREE.Group;
  waistCoreHousing: THREE.Mesh;
  rotationalRing: THREE.Mesh;
  statorTeeth: THREE.Mesh[];
  lowerWaistRing: THREE.Mesh;
  leftActuator?: WaistActuatorNodes;
  rightActuator?: WaistActuatorNodes;
  hipConnection: THREE.Group;
  leftHipPivot: THREE.Group;
  rightHipPivot: THREE.Group;
  leftHip: HipConnectionNodes;
  rightHip: HipConnectionNodes;
  pelvicPlate: THREE.Mesh;
  pelvicAccentLight?: THREE.Mesh;
  ledMeshes: THREE.Mesh[];

  // Discrete nodes for mechanical & shell hierarchy / exploded view
  pelvicIntakePocket?: THREE.Mesh;
  inguinalFlapLeft?: THREE.Mesh;
  inguinalFlapRight?: THREE.Mesh;
  subPelvisCradle?: THREE.Mesh;

  // Backward compatibility aliases
  waistCollar: THREE.Mesh;
  waistRing01: THREE.Mesh;
  waistRing02: THREE.Mesh;
  pelvicCore: THREE.Mesh;
}

/**
 * Creates smooth continuous collar contour geometry for the waist rings.
 * Eliminates polygonal faceted edges, using compound spline curves and bevels.
 */
function createWaistCollarGeometry(
  rx: number,
  rz: number,
  height: number,
  thickness: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const frontW = rx * 0.55;
  const sideCornerX = rx * 0.90;
  const sideCornerZ = rz * 0.42;

  // Smooth continuous outer contour with central crest and curved flanks
  shape.moveTo(0, rz);
  shape.quadraticCurveTo(frontW * 0.40, rz * 0.99, frontW * 0.65, rz * 0.92);
  shape.quadraticCurveTo(sideCornerX * 0.92, sideCornerZ * 1.10, sideCornerX, sideCornerZ);
  shape.quadraticCurveTo(rx * 1.02, 0, rx * 0.96, -rz * 0.30);
  shape.quadraticCurveTo(rx * 0.85, -rz * 0.68, rx * 0.45, -rz * 0.86);
  // Rear spine slot
  shape.lineTo(0.024, -rz * 0.88);
  shape.quadraticCurveTo(0.012, -rz * 0.72, 0, -rz * 0.72);
  shape.quadraticCurveTo(-0.012, -rz * 0.72, -0.024, -rz * 0.88);
  // Symmetrical return left
  shape.lineTo(-rx * 0.45, -rz * 0.86);
  shape.quadraticCurveTo(-rx * 0.85, -rz * 0.68, -rx * 0.96, -rz * 0.30);
  shape.quadraticCurveTo(-rx * 1.02, 0, -sideCornerX, sideCornerZ);
  shape.quadraticCurveTo(-sideCornerX * 0.92, sideCornerZ * 1.10, -frontW * 0.65, rz * 0.92);
  shape.quadraticCurveTo(-frontW * 0.40, rz * 0.99, 0, rz);
  shape.closePath();

  // Internal bore hole
  const hole = new THREE.Path();
  const irx = rx - thickness;
  const irz = rz - thickness;
  const ifrontW = frontW * 0.72;

  hole.moveTo(0, irz);
  hole.quadraticCurveTo(-ifrontW * 0.50, irz * 0.96, -irx * 0.82, irz * 0.35);
  hole.quadraticCurveTo(-irx * 0.95, -irz * 0.10, -irx * 0.78, -irz * 0.60);
  hole.lineTo(-0.018, -irz * 0.80);
  hole.lineTo(0.018, -irz * 0.80);
  hole.quadraticCurveTo(irx * 0.78, -irz * 0.60, irx * 0.95, -irz * 0.10);
  hole.quadraticCurveTo(irx * 0.82, irz * 0.35, ifrontW * 0.50, irz * 0.96);
  hole.closePath();
  shape.holes.push(hole);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.0040,
    bevelSize: 0.0035,
    bevelSegments: 3,
    curveSegments: 32,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

/**
 * Creates an engineered hip connection point:
 * - Structural dark titanium bracket arm extending from lower waist
 * - Dual-bearing rotary joint hub with bevels
 * - Concentric purple emissive accent ring
 * - Sculpted white ceramic hip cowl shield with smooth curved bevels
 */
export function createSingleHipConnection(
  side: -1 | 1,
  materials: RobotMaterialPalette
): HipConnectionNodes {
  const group = new THREE.Group();
  group.name = side === -1 ? 'LeftHipPivot' : 'RightHipPivot';
  const cfg = TORSO_CONFIG.waist.hipConnector;
  group.position.set(side * cfg.mountX, cfg.mountY, cfg.mountZ);

  const ledMeshes: THREE.Mesh[] = [];

  // 1. Structural wishbone mounting bracket connecting lower waist collar to hip socket
  const bracketShape = new THREE.Shape();
  bracketShape.moveTo(-side * 0.016, 0.022);
  bracketShape.lineTo(side * 0.010, 0.018);
  bracketShape.lineTo(side * 0.008, -0.012);
  bracketShape.lineTo(-side * 0.015, -0.014);
  bracketShape.closePath();

  // Central circular lightening hole in wishbone bracket
  const bracketHole = new THREE.Path();
  bracketHole.absarc(0, 0.003, 0.005, 0, Math.PI * 2, false);
  bracketShape.holes.push(bracketHole);

  const bracketGeo = new THREE.ExtrudeGeometry(bracketShape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.0028,
    bevelSize: 0.0022,
    bevelSegments: 2,
  });
  bracketGeo.center();

  const hipJointGroup = new THREE.Group();

  const bracketArm = new THREE.Mesh(bracketGeo, materials.joint);
  bracketArm.name = side === -1 ? 'HipBracket_L' : 'HipBracket_R';
  bracketArm.position.set(0, 0.010, 0);
  bracketArm.castShadow = true;
  bracketArm.receiveShadow = true;
  hipJointGroup.add(bracketArm);

  // 2. Pelvic Hip Receiving Socket Collar (Dark Titanium Dual-Bearing Mechanism)
  const collarGeo = new THREE.CylinderGeometry(
    cfg.hubRadius * 1.15,
    cfg.hubRadius * 1.10,
    0.015,
    32
  );
  const rotaryHub = new THREE.Mesh(collarGeo, materials.joint);
  rotaryHub.name = side === -1 ? 'HipRotaryHub_L' : 'HipRotaryHub_R';
  rotaryHub.position.set(0, 0.004, 0);
  rotaryHub.castShadow = true;
  rotaryHub.receiveShadow = true;
  hipJointGroup.add(rotaryHub);

  // Outer stepped bearing bevel ring
  const bearingRingGeo = new THREE.TorusGeometry(cfg.hubRadius * 1.08, 0.0018, 8, 32);
  const bearingRing = new THREE.Mesh(bearingRingGeo, materials.joint);
  bearingRing.rotation.x = Math.PI / 2;
  bearingRing.position.set(0, 0.009, 0);
  hipJointGroup.add(bearingRing);

  const hipJointMerged = mergeGroupMeshesByMaterial(hipJointGroup, materials.joint, `${group.name}_JointMerged`, false);
  if (hipJointMerged) {
    hipJointMerged.castShadow = true;
    hipJointMerged.receiveShadow = true;
    group.add(hipJointMerged);
  }

  // 3. Concentric Purple Emissive Accent Ring inside Socket Collar
  const ringGeo = new THREE.TorusGeometry(cfg.accentRingRadius, 0.0018, 8, 32);
  const accentRing = new THREE.Mesh(ringGeo, materials.purpleEmissive);
  accentRing.name = side === -1 ? 'HipAccentRing_L' : 'HipAccentRing_R';
  accentRing.rotation.x = Math.PI / 2;
  accentRing.position.set(0, 0.010, 0);
  group.add(accentRing);
  ledMeshes.push(accentRing);

  // 4. Integrated White Ceramic Hip Cowl Flange
  const cowlFlangeGeo = new THREE.CylinderGeometry(cfg.hubRadius * 1.06, cfg.hubRadius * 1.16, 0.0045, 32);
  const hipCowl = new THREE.Mesh(cowlFlangeGeo, materials.armor);
  hipCowl.name = side === -1 ? 'LeftHipArmor' : 'RightHipArmor';
  hipCowl.position.set(0, 0.013, 0);
  hipCowl.castShadow = true;
  group.add(hipCowl);

  // 5. Sculpted White Ceramic Iliac Crest Armor (Flank Shield)
  // Pauldron-style sculpted shield wrapping over the outer pelvic rim flush with waist
  const cowlShape = new THREE.Shape();
  cowlShape.moveTo(-0.018, 0.024);
  cowlShape.quadraticCurveTo(0, 0.028, 0.018, 0.022);
  cowlShape.quadraticCurveTo(0.022, 0.002, 0.014, -0.022);
  cowlShape.quadraticCurveTo(0, -0.026, -0.014, -0.020);
  cowlShape.quadraticCurveTo(-0.020, 0.002, -0.018, 0.024);
  cowlShape.closePath();

  const cowlGeo = new THREE.ExtrudeGeometry(cowlShape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.0020,
    bevelSegments: 2,
    curveSegments: 20,
  });
  cowlGeo.center();

  const iliacCrestArmor = new THREE.Mesh(cowlGeo, materials.armor);
  iliacCrestArmor.name = side === -1 ? 'LeftIliacCrestArmor' : 'RightIliacCrestArmor';
  iliacCrestArmor.position.set(side * 0.008, 0.018, 0.002);
  iliacCrestArmor.rotation.y = -side * 0.15;
  iliacCrestArmor.castShadow = true;
  iliacCrestArmor.receiveShadow = true;
  group.add(iliacCrestArmor);

  // Subtle lateral violet emissive slit on the iliac crest armor
  const flankLightGeo = new THREE.BoxGeometry(0.0020, 0.014, 0.0016);
  const flankLight = new THREE.Mesh(flankLightGeo, materials.purpleEmissive);
  flankLight.name = side === -1 ? 'LeftHipFlankLight' : 'RightHipFlankLight';
  flankLight.position.set(side * 0.012, 0.018, 0.004);
  group.add(flankLight);
  ledMeshes.push(flankLight);

  return {
    group,
    bracketArm,
    rotaryHub,
    accentRing,
    hipCowl,
    iliacCrestArmor,
    flankLight,
    ledMeshes,
  };
}

/**
 * Creates an engineered linear hydraulic stabilization actuator for the waist:
 * - Upper rod-end clevis mounted to UpperWaistCollar
 * - Dark titanium cylinder barrel
 * - Polished chrome telescoping piston rod
 * - Lower rod-end clevis anchored to LowerWaistCollar / Hip Bracket
 */
export function createSingleWaistActuator(
  side: -1 | 1,
  materials: RobotMaterialPalette
): WaistActuatorNodes {
  const group = new THREE.Group();
  group.name = side === -1 ? 'LeftWaistActuator' : 'RightWaistActuator';

  const cfg = TORSO_CONFIG.waist.actuator;
  const start = new THREE.Vector3(side * cfg.mountX, cfg.mountY, cfg.mountZ);
  const end = new THREE.Vector3(side * cfg.targetX, cfg.targetY, cfg.targetZ);
  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();

  group.position.copy(start);

  // Orientation aiming down toward target
  const up = new THREE.Vector3(0, -1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  group.quaternion.copy(quat);

  // 1. Upper mounting bracket / clevis
  const uMountGeo = new THREE.CylinderGeometry(cfg.cylinderRadius * 1.35, cfg.cylinderRadius * 1.35, 0.006, 16);
  const upperMount = new THREE.Mesh(uMountGeo, materials.joint);
  upperMount.rotation.x = Math.PI / 2;

  // Upper pivot pin
  const pinGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.014, 12);
  const upperPin = new THREE.Mesh(pinGeo, materials.joint);
  upperPin.rotation.z = Math.PI / 2;

  // 2. Outer cylinder barrel (dark titanium)
  const cylLen = len * 0.55;
  const cylGeo = new THREE.CylinderGeometry(cfg.cylinderRadius, cfg.cylinderRadius, cylLen, 18);
  const cylinder = new THREE.Mesh(cylGeo, materials.joint);
  cylinder.position.set(0, -cylLen * 0.5, 0);

  // Cylinder end collar gasket
  const collarGeo = new THREE.CylinderGeometry(cfg.cylinderRadius * 1.15, cfg.cylinderRadius * 1.15, 0.003, 18);
  const collar = new THREE.Mesh(collarGeo, materials.joint);
  collar.position.set(0, -cylLen + 0.0015, 0);

  // 3. Telescoping Piston Rod (Polished metallic)
  const pistLen = len * 0.50;
  const pistGeo = new THREE.CylinderGeometry(cfg.pistonRadius, cfg.pistonRadius, pistLen, 16);
  const piston = new THREE.Mesh(pistGeo, materials.joint);
  piston.position.set(0, -cylLen - pistLen * 0.5 + 0.004, 0);

  // 4. Lower Rod-end eyelet & clevis
  const lMountGeo = new THREE.CylinderGeometry(cfg.pistonRadius * 1.45, cfg.pistonRadius * 1.45, 0.005, 14);
  const lowerMount = new THREE.Mesh(lMountGeo, materials.joint);
  lowerMount.position.set(0, -len, 0);
  lowerMount.rotation.x = Math.PI / 2;

  const tempActuator = new THREE.Group();
  tempActuator.add(upperMount);
  tempActuator.add(upperPin);
  tempActuator.add(cylinder);
  tempActuator.add(collar);
  tempActuator.add(piston);
  tempActuator.add(lowerMount);

  const actMerged = mergeGroupMeshesByMaterial(tempActuator, materials.joint, `${group.name}_Merged`)!;
  tempActuator.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  group.add(actMerged);

  return {
    group,
    cylinder: actMerged,
    piston: actMerged,
    upperMount: actMerged,
    lowerMount: actMerged,
  };
}

/**
 * PRIORITY 3: REBUILT WAIST CORE & MECHANISM
 * - Central waist core: solid dark titanium mechanical hub with rotational bearing races
 * - Upper waist collar: receives lower abdomen
 * - Rotational mechanical ring: distinct engineered bearing race between upper and lower collars
 * - Lower waist collar: distributes load into the hip connectors
 * - Left & Right Functional Hip Connectors
 * - Pelvic Armor Shield: curved white ceramic center plate
 */
export function createWaistAssembly(materials: RobotMaterialPalette): WaistAssemblyNodes {
  const waistGroup = new THREE.Group();
  waistGroup.name = 'WaistAssembly';

  const waistPivot = new THREE.Group();
  waistPivot.name = 'WaistPivot';
  waistGroup.add(waistPivot);

  const cfg = TORSO_CONFIG.waist;
  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 1. UPPER WAIST COLLAR
  // ==========================================
  // 1. CENTRAL MECHANICAL WAIST CORE & COLLARS
  // ==========================================
  const waistCoreGroup = new THREE.Group();
  waistCoreGroup.name = 'WaistCore';
  waistPivot.add(waistCoreGroup);

  const tempWaistCore = new THREE.Group();

  // Upper Waist Collar
  const urx = cfg.upperWaistRing.radiusX;
  const urz = cfg.upperWaistRing.radiusZ;
  const uGeo = createWaistCollarGeometry(urx, urz, cfg.upperWaistRing.height, 0.022);
  const upperWaistRing = new THREE.Mesh(uGeo, materials.joint);
  upperWaistRing.name = 'UpperWaistCollar';
  upperWaistRing.position.set(0, cfg.upperWaistRing.yOffset, -0.004);
  upperWaistRing.rotation.x = Math.PI / 2;
  tempWaistCore.add(upperWaistRing);

  // Lower Waist Collar
  const lrx = cfg.lowerWaistRing.radiusX;
  const lrz = cfg.lowerWaistRing.radiusZ;
  const lGeo = createWaistCollarGeometry(lrx, lrz, cfg.lowerWaistRing.height, 0.024);
  const lowerWaistRing = new THREE.Mesh(lGeo, materials.joint);
  lowerWaistRing.name = 'LowerWaistCollar';
  lowerWaistRing.position.set(0, cfg.lowerWaistRing.yOffset, -0.004);
  lowerWaistRing.rotation.x = Math.PI / 2;
  tempWaistCore.add(lowerWaistRing);

  // Stepped Conical Outer Housing (Smooth 36 segments)
  const coreHousingGeo = new THREE.CylinderGeometry(
    cfg.waistCore.upperRadius,
    cfg.waistCore.lowerRadius,
    cfg.waistCore.height,
    36
  );
  const waistCoreHousing = new THREE.Mesh(coreHousingGeo, materials.joint);
  waistCoreHousing.name = 'WaistCoreHousing';
  waistCoreHousing.position.set(0, cfg.waistCore.yOffset, -0.004);
  waistCoreHousing.scale.set(1.04, 1.0, 0.88);
  tempWaistCore.add(waistCoreHousing);

  // Rotational Mechanical Bearing Ring
  const rotRingGeo = new THREE.TorusGeometry(cfg.waistCore.upperRadius * 1.05, 0.0040, 12, 36);
  const rotationalRing = new THREE.Mesh(rotRingGeo, materials.joint);
  rotationalRing.name = 'WaistRotationalRing';
  rotationalRing.position.set(0, cfg.waistCore.yOffset, -0.004);
  rotationalRing.rotation.x = Math.PI / 2;
  rotationalRing.scale.set(1.04, 0.88, 1.0);
  tempWaistCore.add(rotationalRing);

  // 18 Radial Stator Teeth around the rotational bearing ring
  const toothCount = 18;
  const statorR = cfg.waistCore.upperRadius * 1.05;
  for (let i = 0; i < toothCount; i++) {
    const angle = (i / toothCount) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.0030, cfg.waistCore.height * 0.35, 0.0032);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      Math.cos(angle) * statorR * 1.04,
      cfg.waistCore.yOffset,
      -0.004 + Math.sin(angle) * statorR * 0.88
    );
    tooth.rotation.y = -angle;
    tempWaistCore.add(tooth);
  }

  // Vertical Mechanical Struts bridging upper collar to lower collar
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const sx = Math.cos(angle) * (cfg.waistCore.upperRadius * 0.94);
    const sz = Math.sin(angle) * (cfg.waistCore.upperRadius * 0.82);
    const strutGeo = new THREE.CylinderGeometry(0.0035, 0.0035, cfg.waistCore.height * 1.15, 12);
    const strut = new THREE.Mesh(strutGeo, materials.joint);
    strut.position.set(sx, cfg.waistCore.yOffset, -0.004 + sz);
    tempWaistCore.add(strut);
  }

  // Central cylindrical inner pass-through spine
  const innerBoreGeo = new THREE.CylinderGeometry(
    cfg.waistCore.innerBoreRadius,
    cfg.waistCore.innerBoreRadius,
    cfg.waistCore.height * 1.30,
    24
  );
  const innerBoreMesh = new THREE.Mesh(innerBoreGeo, materials.joint);
  innerBoreMesh.position.set(0, cfg.waistCore.yOffset, -0.004);
  tempWaistCore.add(innerBoreMesh);

  const waistCoreMerged = mergeGroupMeshesByMaterial(tempWaistCore, materials.joint, 'WaistCore_Merged', false, true)!;
  tempWaistCore.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  waistCoreGroup.add(waistCoreMerged);

  // Dual Purple Emissive Core Accent Rings flanking the rotational bearing race
  const accentGroup = new THREE.Group();
  for (const yOff of [0.005, -0.005]) {
    const accentRaceGeo = new THREE.TorusGeometry(cfg.waistCore.upperRadius * 1.02, 0.0015, 8, 36);
    const accentRace = new THREE.Mesh(accentRaceGeo, materials.purpleEmissive);
    accentRace.rotation.x = Math.PI / 2;
    accentRace.position.set(0, cfg.waistCore.yOffset + yOff, -0.004);
    accentRace.scale.set(1.04, 0.88, 1.0);
    accentGroup.add(accentRace);
  }

  const mergedWaistAccents = mergeGroupMeshesByMaterial(accentGroup, materials.purpleEmissive, 'WaistCoreAccentRings_Merged', false, false);
  if (mergedWaistAccents) {
    waistCoreGroup.add(mergedWaistAccents);
    ledMeshes.push(mergedWaistAccents);
  }

  // ==========================================
  // 4. DUAL HYDRAULIC STABILIZATION ACTUATORS
  // ==========================================
  const leftActuator = createSingleWaistActuator(-1, materials);
  waistPivot.add(leftActuator.group);

  const rightActuator = createSingleWaistActuator(1, materials);
  waistPivot.add(rightActuator.group);

  // ==========================================
  // 5. HIP CONNECTIONS & PELVIC SHIELD
  // ==========================================
  const hipConnectionGroup = new THREE.Group();
  hipConnectionGroup.name = 'HipConnection';
  waistPivot.add(hipConnectionGroup);

  const leftHip = createSingleHipConnection(-1, materials);
  hipConnectionGroup.add(leftHip.group);
  ledMeshes.push(...leftHip.ledMeshes);

  const rightHip = createSingleHipConnection(1, materials);
  hipConnectionGroup.add(rightHip.group);
  ledMeshes.push(...rightHip.ledMeshes);

  // Pelvic Front Armor Shield Plate between the hips (Sculpted multi-faceted groin shield)
  const pelvicPlateShape = new THREE.Shape();
  pelvicPlateShape.moveTo(-0.046, 0.026);
  pelvicPlateShape.quadraticCurveTo(0, 0.030, 0.046, 0.026);
  pelvicPlateShape.lineTo(0.040, -0.016);
  pelvicPlateShape.lineTo(0.024, -0.050);
  pelvicPlateShape.quadraticCurveTo(0, -0.062, -0.024, -0.050);
  pelvicPlateShape.lineTo(-0.040, -0.016);
  pelvicPlateShape.closePath();

  // Intake window cutout in the ceramic plate
  const intakeWindow = new THREE.Path();
  intakeWindow.moveTo(-0.022, 0.015);
  intakeWindow.lineTo(0.022, 0.015);
  intakeWindow.lineTo(0.020, 0.007);
  intakeWindow.lineTo(-0.020, 0.007);
  intakeWindow.closePath();
  pelvicPlateShape.holes.push(intakeWindow);

  const plateGeo = new THREE.ExtrudeGeometry(pelvicPlateShape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.0040,
    bevelSize: 0.0032,
    bevelSegments: 3,
    curveSegments: 28,
  });
  plateGeo.center();

  // Multi-faceted 3D curvature: central vertical aerodynamic keel ridge
  const pPos = plateGeo.attributes.position;
  for (let i = 0; i < pPos.count; i++) {
    const x = pPos.getX(i);
    const y = pPos.getY(i);
    const z = pPos.getZ(i);
    if (z > 0) {
      // Keel peak at x = 0, sloping back laterally
      const keel = (1.0 - Math.min(1.0, Math.abs(x) / 0.046)) * 0.007;
      // Slight forward thrust in lower pelvis
      const thrust = (y < 0) ? Math.sin(-y * 18) * 0.003 : 0;
      pPos.setZ(i, z + keel + thrust);
    }
  }
  plateGeo.computeVertexNormals();

  const pelvicPlate = new THREE.Mesh(plateGeo, materials.armor);
  pelvicPlate.name = 'PelvicShieldPlate';
  pelvicPlate.position.set(0, -0.278, 0.046);
  pelvicPlate.rotation.x = -0.02;
  pelvicPlate.castShadow = true;
  pelvicPlate.receiveShadow = true;
  hipConnectionGroup.add(pelvicPlate);

  // Recessed dark titanium intake scoop pocket parented inside pelvic plate
  const intakePocketGeo = new THREE.BoxGeometry(0.042, 0.009, 0.008);
  const intakeGroup = new THREE.Group();
  const rawIntake = new THREE.Mesh(intakePocketGeo, materials.joint);
  intakeGroup.add(rawIntake);

  // Horizontal titanium radiator grille louvers across intake
  for (const lY of [-0.002, 0.002]) {
    const louverGeo = new THREE.BoxGeometry(0.038, 0.0008, 0.006);
    const louver = new THREE.Mesh(louverGeo, materials.joint);
    louver.position.set(0, lY, 0.002);
    intakeGroup.add(louver);
  }

  const pelvicIntakePocket = mergeGroupMeshesByMaterial(intakeGroup, materials.joint, 'PelvicIntake_Merged', false)!;
  pelvicIntakePocket.name = 'PelvicIntakePocket';
  pelvicIntakePocket.position.set(0, 0.011, 0.005);
  pelvicPlate.add(pelvicIntakePocket);

  // Signature horizontal violet emissive LED slit nested inside intake
  const pelvicLightGeo = new THREE.BoxGeometry(0.036, 0.0022, 0.003);
  const pelvicAccentLight = new THREE.Mesh(pelvicLightGeo, materials.purpleEmissive);
  pelvicAccentLight.name = 'PelvicAccentLight';
  pelvicAccentLight.position.set(0, 0.011, 0.009);
  pelvicPlate.add(pelvicAccentLight);
  ledMeshes.push(pelvicAccentLight);

  // Left & Right Inguinal Armor Flaps (Contoured ceramic pauldrons with titanium hinge clevises)
  function createInguinalFlap(fSide: -1 | 1): THREE.Mesh {
    const flapShape = new THREE.Shape();
    flapShape.moveTo(0, 0.022);
    flapShape.quadraticCurveTo(0.018, 0.018, 0.020, 0.012);
    flapShape.lineTo(0.016, -0.028);
    flapShape.quadraticCurveTo(0.004, -0.036, -0.004, -0.034);
    flapShape.lineTo(-0.014, 0.010);
    flapShape.closePath();

    const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
      depth: 0.009,
      bevelEnabled: true,
      bevelThickness: 0.0028,
      bevelSize: 0.0022,
      bevelSegments: 2,
      curveSegments: 20,
    });
    flapGeo.center();

    const flapMesh = new THREE.Mesh(flapGeo, materials.armor);
    flapMesh.name = `InguinalFlap_${fSide === -1 ? 'L' : 'R'}`;
    flapMesh.position.set(fSide * 0.046, -0.274, 0.038);
    flapMesh.rotation.y = fSide * -0.26;
    flapMesh.rotation.x = -0.04;
    flapMesh.castShadow = true;
    flapMesh.receiveShadow = true;

    // Machined titanium top hinge clevis
    const clevisGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.010, 12);
    const clevis = new THREE.Mesh(clevisGeo, materials.joint);
    clevis.rotation.z = Math.PI / 2;
    clevis.position.set(0, 0.020, 0);
    flapMesh.add(clevis);

    return flapMesh;
  }

  const inguinalFlapLeft = createInguinalFlap(-1);
  hipConnectionGroup.add(inguinalFlapLeft);

  const inguinalFlapRight = createInguinalFlap(1);
  hipConnectionGroup.add(inguinalFlapRight);

  // Sub-Pelvic Mechanical Cradle (Dark Titanium Frame connecting lower waist to hips)
  const cradleGeo = new THREE.CylinderGeometry(0.046, 0.038, 0.036, 28);
  const cradleGroup = new THREE.Group();
  const rawCradle = new THREE.Mesh(cradleGeo, materials.joint);
  rawCradle.scale.set(1.15, 1.0, 0.85);
  cradleGroup.add(rawCradle);

  // Additional CNC ribbing details on sub-pelvis cradle
  for (let i = 0; i < 3; i++) {
    const ribGeo = new THREE.BoxGeometry(0.042 - i * 0.006, 0.003, 0.006);
    const rib = new THREE.Mesh(ribGeo, materials.joint);
    rib.position.set(0, -0.008 - i * 0.008, 0.026);
    cradleGroup.add(rib);
  }

  const subPelvisCradle = mergeGroupMeshesByMaterial(cradleGroup, materials.joint, 'SubPelvisCradle_Merged', false)!;
  subPelvisCradle.name = 'SubPelvisCradle';
  subPelvisCradle.position.set(0, -0.262, 0.010);
  subPelvisCradle.castShadow = true;
  hipConnectionGroup.add(subPelvisCradle);

  return {
    group: waistGroup,
    waistPivot,
    upperWaistRing,
    waistCore: waistCoreGroup,
    waistCoreHousing,
    rotationalRing: waistCoreMerged,
    statorTeeth: [waistCoreMerged],
    lowerWaistRing,
    leftActuator,
    rightActuator,
    hipConnection: hipConnectionGroup,
    leftHipPivot: leftHip.group,
    rightHipPivot: rightHip.group,
    leftHip,
    rightHip,
    pelvicPlate,
    pelvicAccentLight,
    pelvicIntakePocket,
    inguinalFlapLeft,
    inguinalFlapRight,
    subPelvisCradle,
    ledMeshes,

    // Backward compatibility aliases
    waistCollar: upperWaistRing,
    waistRing01: upperWaistRing,
    waistRing02: lowerWaistRing,
    pelvicCore: waistCoreHousing,
  };
}
