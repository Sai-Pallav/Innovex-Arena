import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { TORSO_CONFIG } from './TorsoConfig';

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

  // 1. Structural mounting bracket arm connecting lower waist ring to hip joint hub
  const bracketShape = new THREE.Shape();
  bracketShape.moveTo(0, 0.018);
  bracketShape.lineTo(0.014, 0.014);
  bracketShape.lineTo(0.016, -0.014);
  bracketShape.lineTo(-0.014, -0.018);
  bracketShape.lineTo(-0.016, 0.012);
  bracketShape.closePath();

  const bracketGeo = new THREE.ExtrudeGeometry(bracketShape, {
    depth: 0.030,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.0025,
    bevelSegments: 2,
  });
  bracketGeo.center();

  const bracketArm = new THREE.Mesh(bracketGeo, materials.joint);
  bracketArm.name = side === -1 ? 'HipBracket_L' : 'HipBracket_R';
  bracketArm.position.set(-side * 0.010, 0.014, 0);
  bracketArm.rotation.z = -side * 0.22;
  bracketArm.castShadow = true;
  bracketArm.receiveShadow = true;
  group.add(bracketArm);

  // 2. Lateral Cylindrical Rotational Joint Hub (Dark Titanium Mechanism)
  const hubGroup = new THREE.Group();
  hubGroup.rotation.z = Math.PI / 2;

  const hubGeo = new THREE.CylinderGeometry(cfg.hubRadius, cfg.hubRadius, cfg.hubWidth, 32);
  const rotaryHub = new THREE.Mesh(hubGeo, materials.joint);
  rotaryHub.name = side === -1 ? 'HipRotaryHub_L' : 'HipRotaryHub_R';
  rotaryHub.castShadow = true;
  rotaryHub.receiveShadow = true;
  hubGroup.add(rotaryHub);

  // Bearing Race Chamfer Rings on Rotary Hub
  const bearingFlangeGeo = new THREE.CylinderGeometry(
    cfg.hubRadius * 1.04,
    cfg.hubRadius * 1.04,
    0.004,
    32
  );
  const bearingFlange = new THREE.Mesh(bearingFlangeGeo, materials.joint);
  hubGroup.add(bearingFlange);
  group.add(hubGroup);

  // 3. Concentric Purple Emissive Accent Ring on Joint Face
  const ringGeo = new THREE.TorusGeometry(cfg.accentRingRadius, 0.0022, 12, 32);
  const accentRing = new THREE.Mesh(ringGeo, materials.purpleEmissive);
  accentRing.name = side === -1 ? 'HipAccentRing_L' : 'HipAccentRing_R';
  accentRing.rotation.y = Math.PI / 2;
  accentRing.position.set(side * (cfg.hubWidth * 0.50 + 0.002), 0, 0);
  group.add(accentRing);
  ledMeshes.push(accentRing);

  // 4. Secondary White Ceramic Accent Cap (Snugly integrated into outer face of rotary hub)
  const capShape = new THREE.Shape();
  const capR = cfg.hubRadius * 0.78;
  capShape.moveTo(0, capR);
  capShape.quadraticCurveTo(capR * 0.90, capR * 0.90, capR, 0);
  capShape.quadraticCurveTo(capR * 0.90, -capR * 0.90, 0, -capR);
  capShape.quadraticCurveTo(-capR * 0.90, -capR * 0.90, -capR, 0);
  capShape.quadraticCurveTo(-capR * 0.90, capR * 0.90, 0, capR);
  capShape.closePath();

  const capGeo = new THREE.ExtrudeGeometry(capShape, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.0018,
    bevelSegments: 2,
    curveSegments: 24,
  });
  capGeo.center();

  const hipCowl = new THREE.Mesh(capGeo, materials.armor);
  hipCowl.name = side === -1 ? 'LeftHipArmor' : 'RightHipArmor';
  hipCowl.rotation.y = Math.PI / 2;
  hipCowl.position.set(side * (cfg.hubWidth * 0.50 + 0.004), 0, 0);
  hipCowl.castShadow = true;
  hipCowl.receiveShadow = true;
  group.add(hipCowl);

  // 5. Sculpted White Ceramic Iliac Crest Armor Cowl (Flank Shield)
  // Pauldron-style sculpted shield wrapping over the outer hip bracket and rotary hub
  const cowlShape = new THREE.Shape();
  cowlShape.moveTo(0, 0.026);
  cowlShape.quadraticCurveTo(0.018, 0.022, 0.026, 0.008);
  cowlShape.quadraticCurveTo(0.028, -0.016, 0.014, -0.030);
  cowlShape.quadraticCurveTo(0, -0.034, -0.016, -0.026);
  cowlShape.quadraticCurveTo(-0.026, -0.008, -0.024, 0.010);
  cowlShape.quadraticCurveTo(-0.018, 0.024, 0, 0.026);
  cowlShape.closePath();

  const cowlGeo = new THREE.ExtrudeGeometry(cowlShape, {
    depth: 0.010,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.0020,
    bevelSegments: 2,
    curveSegments: 24,
  });
  cowlGeo.center();

  // Subtle lateral curvature
  const cowlPos = cowlGeo.attributes.position;
  for (let i = 0; i < cowlPos.count; i++) {
    const y = cowlPos.getY(i);
    const z = cowlPos.getZ(i);
    if (z > 0) {
      cowlPos.setZ(i, z + Math.sin((y + 0.03) * 35) * 0.0025);
    }
  }
  cowlGeo.computeVertexNormals();

  const iliacCrestArmor = new THREE.Mesh(cowlGeo, materials.armor);
  iliacCrestArmor.name = side === -1 ? 'LeftIliacCrestArmor' : 'RightIliacCrestArmor';
  iliacCrestArmor.rotation.y = Math.PI / 2;
  iliacCrestArmor.position.set(side * (cfg.hubWidth * 0.50 + 0.008), 0.006, 0.002);
  iliacCrestArmor.castShadow = true;
  iliacCrestArmor.receiveShadow = true;
  group.add(iliacCrestArmor);

  // Subtle lateral violet emissive slit on the iliac crest armor
  const flankLightGeo = new THREE.BoxGeometry(0.0022, 0.018, 0.0016);
  const flankLight = new THREE.Mesh(flankLightGeo, materials.purpleEmissive);
  flankLight.name = side === -1 ? 'LeftHipFlankLight' : 'RightHipFlankLight';
  flankLight.position.set(side * (cfg.hubWidth * 0.50 + 0.014), 0.006, 0.002);
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
  group.add(upperMount);

  // Upper pivot pin
  const pinGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.014, 12);
  const upperPin = new THREE.Mesh(pinGeo, materials.joint);
  upperPin.rotation.z = Math.PI / 2;
  group.add(upperPin);

  // 2. Outer cylinder barrel (dark titanium)
  const cylLen = len * 0.55;
  const cylGeo = new THREE.CylinderGeometry(cfg.cylinderRadius, cfg.cylinderRadius, cylLen, 18);
  const cylinder = new THREE.Mesh(cylGeo, materials.joint);
  cylinder.position.set(0, -cylLen * 0.5, 0);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  group.add(cylinder);

  // Cylinder end collar gasket
  const collarGeo = new THREE.CylinderGeometry(cfg.cylinderRadius * 1.15, cfg.cylinderRadius * 1.15, 0.003, 18);
  const collar = new THREE.Mesh(collarGeo, materials.joint);
  collar.position.set(0, -cylLen + 0.0015, 0);
  group.add(collar);

  // 3. Telescoping Piston Rod (Polished metallic)
  const pistLen = len * 0.50;
  const pistGeo = new THREE.CylinderGeometry(cfg.pistonRadius, cfg.pistonRadius, pistLen, 16);
  const piston = new THREE.Mesh(pistGeo, materials.joint);
  piston.position.set(0, -cylLen - pistLen * 0.5 + 0.004, 0);
  piston.castShadow = true;
  group.add(piston);

  // 4. Lower Rod-end eyelet & clevis
  const lMountGeo = new THREE.CylinderGeometry(cfg.pistonRadius * 1.45, cfg.pistonRadius * 1.45, 0.005, 14);
  const lowerMount = new THREE.Mesh(lMountGeo, materials.joint);
  lowerMount.position.set(0, -len, 0);
  lowerMount.rotation.x = Math.PI / 2;
  group.add(lowerMount);

  return {
    group,
    cylinder,
    piston,
    upperMount,
    lowerMount,
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
  const urx = cfg.upperWaistRing.radiusX;
  const urz = cfg.upperWaistRing.radiusZ;
  const uGeo = createWaistCollarGeometry(urx, urz, cfg.upperWaistRing.height, 0.022);

  const upperWaistRing = new THREE.Mesh(uGeo, materials.joint);
  upperWaistRing.name = 'UpperWaistCollar';
  upperWaistRing.position.set(0, cfg.upperWaistRing.yOffset, -0.004);
  upperWaistRing.rotation.x = Math.PI / 2;
  upperWaistRing.castShadow = true;
  upperWaistRing.receiveShadow = true;
  waistPivot.add(upperWaistRing);

  // ==========================================
  // 2. CENTRAL MECHANICAL WAIST CORE & ROTATIONAL BEARING RACE
  // ==========================================
  const waistCoreGroup = new THREE.Group();
  waistCoreGroup.name = 'WaistCore';
  waistCoreGroup.position.set(0, cfg.waistCore.yOffset, -0.004);
  waistPivot.add(waistCoreGroup);

  // Stepped Conical Outer Housing (Smooth 36 segments)
  const coreHousingGeo = new THREE.CylinderGeometry(
    cfg.waistCore.upperRadius,
    cfg.waistCore.lowerRadius,
    cfg.waistCore.height,
    36
  );
  const waistCoreHousing = new THREE.Mesh(coreHousingGeo, materials.joint);
  waistCoreHousing.name = 'WaistCoreHousing';
  waistCoreHousing.scale.set(1.04, 1.0, 0.88);
  waistCoreHousing.castShadow = true;
  waistCoreHousing.receiveShadow = true;
  waistCoreGroup.add(waistCoreHousing);

  // Rotational Mechanical Bearing Ring
  const rotRingGeo = new THREE.TorusGeometry(cfg.waistCore.upperRadius * 1.05, 0.0040, 12, 36);
  const rotationalRing = new THREE.Mesh(rotRingGeo, materials.joint);
  rotationalRing.name = 'WaistRotationalRing';
  rotationalRing.rotation.x = Math.PI / 2;
  rotationalRing.scale.set(1.04, 0.88, 1.0);
  rotationalRing.castShadow = true;
  rotationalRing.receiveShadow = true;
  waistCoreGroup.add(rotationalRing);

  // 18 Radial Stator Teeth around the rotational bearing ring
  const statorTeeth: THREE.Mesh[] = [];
  const toothCount = 18;
  const statorR = cfg.waistCore.upperRadius * 1.05;
  for (let i = 0; i < toothCount; i++) {
    const angle = (i / toothCount) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.0030, cfg.waistCore.height * 0.35, 0.0032);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      Math.cos(angle) * statorR * 1.04,
      0,
      Math.sin(angle) * statorR * 0.88
    );
    tooth.rotation.y = -angle;
    tooth.castShadow = true;
    waistCoreGroup.add(tooth);
    statorTeeth.push(tooth);
  }

  // Dual Purple Emissive Core Accent Rings flanking the rotational bearing race
  for (const yOff of [0.005, -0.005]) {
    const accentRaceGeo = new THREE.TorusGeometry(cfg.waistCore.upperRadius * 1.02, 0.0015, 8, 36);
    const accentRace = new THREE.Mesh(accentRaceGeo, materials.purpleEmissive);
    accentRace.rotation.x = Math.PI / 2;
    accentRace.position.y = yOff;
    accentRace.scale.set(1.04, 0.88, 1.0);
    waistCoreGroup.add(accentRace);
    ledMeshes.push(accentRace);
  }

  // Vertical Mechanical Struts bridging upper collar to lower collar
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const sx = Math.cos(angle) * (cfg.waistCore.upperRadius * 0.94);
    const sz = Math.sin(angle) * (cfg.waistCore.upperRadius * 0.82);
    const strutGeo = new THREE.CylinderGeometry(0.0035, 0.0035, cfg.waistCore.height * 1.15, 12);
    const strut = new THREE.Mesh(strutGeo, materials.joint);
    strut.position.set(sx, 0, sz);
    strut.castShadow = true;
    waistCoreGroup.add(strut);
  }

  // Central cylindrical inner pass-through spine
  const innerBoreGeo = new THREE.CylinderGeometry(
    cfg.waistCore.innerBoreRadius,
    cfg.waistCore.innerBoreRadius,
    cfg.waistCore.height * 1.30,
    24
  );
  const innerBoreMesh = new THREE.Mesh(innerBoreGeo, materials.joint);
  innerBoreMesh.castShadow = true;
  waistCoreGroup.add(innerBoreMesh);

  // ==========================================
  // 3. LOWER WAIST COLLAR
  // ==========================================
  const lrx = cfg.lowerWaistRing.radiusX;
  const lrz = cfg.lowerWaistRing.radiusZ;
  const lGeo = createWaistCollarGeometry(lrx, lrz, cfg.lowerWaistRing.height, 0.024);

  const lowerWaistRing = new THREE.Mesh(lGeo, materials.joint);
  lowerWaistRing.name = 'LowerWaistCollar';
  lowerWaistRing.position.set(0, cfg.lowerWaistRing.yOffset, -0.004);
  lowerWaistRing.rotation.x = Math.PI / 2;
  lowerWaistRing.castShadow = true;
  lowerWaistRing.receiveShadow = true;
  waistPivot.add(lowerWaistRing);

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
  pelvicPlateShape.moveTo(-0.048, 0.028);
  pelvicPlateShape.quadraticCurveTo(0, 0.032, 0.048, 0.028);
  pelvicPlateShape.lineTo(0.042, -0.018);
  pelvicPlateShape.lineTo(0.026, -0.052);
  pelvicPlateShape.quadraticCurveTo(0, -0.066, -0.026, -0.052);
  pelvicPlateShape.lineTo(-0.042, -0.018);
  pelvicPlateShape.closePath();

  const plateGeo = new THREE.ExtrudeGeometry(pelvicPlateShape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.0045,
    bevelSize: 0.0036,
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
      const keel = (1.0 - Math.min(1.0, Math.abs(x) / 0.048)) * 0.0075;
      // Slight forward thrust in lower pelvis
      const thrust = (y < 0) ? Math.sin(-y * 18) * 0.0035 : 0;
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

  // Recessed dark titanium intake scoop pocket on the pelvic plate
  const intakePocketGeo = new THREE.BoxGeometry(0.040, 0.007, 0.006);
  const intakePocket = new THREE.Mesh(intakePocketGeo, materials.joint);
  intakePocket.position.set(0, -0.266, 0.055);
  intakePocket.rotation.x = -0.02;
  hipConnectionGroup.add(intakePocket);

  // Signature horizontal violet emissive LED slit across the pelvic plate
  const pelvicLightGeo = new THREE.BoxGeometry(0.036, 0.0024, 0.003);
  const pelvicAccentLight = new THREE.Mesh(pelvicLightGeo, materials.purpleEmissive);
  pelvicAccentLight.name = 'PelvicAccentLight';
  pelvicAccentLight.position.set(0, -0.266, 0.0585);
  pelvicAccentLight.rotation.x = -0.02;
  hipConnectionGroup.add(pelvicAccentLight);
  ledMeshes.push(pelvicAccentLight);

  // Left & Right Inguinal Armor Flaps (Bridges pelvis to lateral hip mounts - eliminates side voids)
  for (const side of [-1, 1]) {
    const flapShape = new THREE.Shape();
    flapShape.moveTo(0, 0.024);
    flapShape.lineTo(0.022, 0.016);
    flapShape.lineTo(0.018, -0.030);
    flapShape.lineTo(-0.004, -0.038);
    flapShape.lineTo(-0.014, 0.012);
    flapShape.closePath();

    const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
      depth: 0.010,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.0024,
      bevelSegments: 2,
    });
    flapGeo.center();

    const flapMesh = new THREE.Mesh(flapGeo, materials.armor);
    flapMesh.name = `InguinalFlap_${side === -1 ? 'L' : 'R'}`;
    flapMesh.position.set(side * 0.046, -0.274, 0.036);
    flapMesh.rotation.y = side * -0.28;
    flapMesh.rotation.x = -0.04;
    flapMesh.castShadow = true;
    flapMesh.receiveShadow = true;
    hipConnectionGroup.add(flapMesh);
  }

  // Sub-Pelvic Mechanical Cradle (Dark Titanium Frame connecting lower waist to hips)
  const cradleGeo = new THREE.CylinderGeometry(0.046, 0.038, 0.036, 24);
  const subPelvisCradle = new THREE.Mesh(cradleGeo, materials.joint);
  subPelvisCradle.name = 'SubPelvisCradle';
  subPelvisCradle.position.set(0, -0.262, 0.010);
  subPelvisCradle.scale.set(1.15, 1.0, 0.85);
  subPelvisCradle.castShadow = true;
  hipConnectionGroup.add(subPelvisCradle);

  return {
    group: waistGroup,
    waistPivot,
    upperWaistRing,
    waistCore: waistCoreGroup,
    waistCoreHousing,
    rotationalRing,
    statorTeeth,
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
    ledMeshes,

    // Backward compatibility aliases
    waistCollar: upperWaistRing,
    waistRing01: upperWaistRing,
    waistRing02: lowerWaistRing,
    pelvicCore: waistCoreHousing,
  };
}
