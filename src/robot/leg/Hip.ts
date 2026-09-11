import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { LEG_CONFIG } from './LegConfig';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface HipActuatorNodes {
  group: THREE.Group;
  cylinder: THREE.Mesh;
  piston: THREE.Mesh;
  upperMount: THREE.Mesh;
  lowerMount: THREE.Mesh;
}

export interface HipNodes {
  group: THREE.Group;
  gimbalHousing: THREE.Mesh;
  socketSkirt: THREE.Mesh;
  swivelBall: THREE.Mesh;
  accentRing: THREE.Mesh;
  thighMount: THREE.Group;
  interlockingCollar: THREE.Mesh;
  actuatorFront?: HipActuatorNodes;
  actuatorLateral?: HipActuatorNodes;
  ledMeshes: THREE.Mesh[];
}

/**
 * Creates an engineered linear hydraulic assist actuator for the hip joint.
 */
function createHipActuator(
  startPoint: THREE.Vector3,
  endPoint: THREE.Vector3,
  namePrefix: string,
  materials: RobotMaterialPalette
): HipActuatorNodes {
  const group = new THREE.Group();
  group.name = `${namePrefix}Actuator`;

  const dir = new THREE.Vector3().subVectors(endPoint, startPoint);
  const len = dir.length();

  group.position.copy(startPoint);

  const up = new THREE.Vector3(0, -1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  group.quaternion.copy(quat);

  const cfg = LEG_CONFIG.hip.actuator;

  // Upper mount clevis with dual flange ears
  const uMountGeo = new THREE.CylinderGeometry(cfg.cylinderRadius * 1.30, cfg.cylinderRadius * 1.30, 0.007, 16);
  const upperMount = new THREE.Mesh(uMountGeo, materials.joint);
  upperMount.rotation.x = Math.PI / 2;
  group.add(upperMount);

  // Cross pivot pin
  const pinGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.016, 12);
  const pin = new THREE.Mesh(pinGeo, materials.joint);
  pin.rotation.z = Math.PI / 2;
  group.add(pin);

  // Outer cylinder barrel (dark titanium)
  const cylLen = len * 0.54;
  const cylGeo = new THREE.CylinderGeometry(cfg.cylinderRadius, cfg.cylinderRadius * 0.94, cylLen, 18);
  const cylinder = new THREE.Mesh(cylGeo, materials.joint);
  cylinder.position.set(0, -cylLen * 0.5, 0);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  group.add(cylinder);

  // Cylinder high-pressure collar ring
  const collarGeo = new THREE.CylinderGeometry(cfg.cylinderRadius * 1.16, cfg.cylinderRadius * 1.16, 0.0032, 18);
  const collar = new THREE.Mesh(collarGeo, materials.joint);
  collar.position.set(0, -cylLen + 0.0016, 0);
  group.add(collar);

  // Telescoping Piston Rod (Polished metallic / chrome)
  const pistLen = len * 0.52;
  const pistGeo = new THREE.CylinderGeometry(cfg.pistonRadius, cfg.pistonRadius, pistLen, 16);
  const piston = new THREE.Mesh(pistGeo, materials.joint);
  piston.position.set(0, -cylLen - pistLen * 0.5 + 0.004, 0);
  piston.castShadow = true;
  group.add(piston);

  // Lower mount rod-end eyelet
  const lMountGeo = new THREE.CylinderGeometry(cfg.pistonRadius * 1.45, cfg.pistonRadius * 1.45, 0.006, 14);
  const lowerMount = new THREE.Mesh(lMountGeo, materials.joint);
  lowerMount.position.set(0, -len, 0);
  lowerMount.rotation.x = Math.PI / 2;
  group.add(lowerMount);

  const mergedMesh = mergeGroupMeshesByMaterial(group, materials.joint, `${namePrefix}JointMesh`, true) || cylinder;

  return {
    group,
    cylinder: mergedMesh,
    piston: mergedMesh,
    upperMount: mergedMesh,
    lowerMount: mergedMesh,
  };
}

/**
 * NEXT-LEVEL ARTICULATED HIP JOINT ASSEMBLY:
 * - Eliminates floating gaps: continuous structural socket bell sleeves directly into thigh
 * - Multiaxial high-torque spherical titanium gimbal
 * - Stepped flared socket skirt with CNC machined chamfers
 * - Dual linear hydraulic assist actuators anchored to thigh
 * - Concentric electric purple emissive accent ring
 * - Interlocking trochanter mounting flange with structural hex fasteners
 */
export function createHip(
  side: -1 | 1,
  materials: RobotMaterialPalette
): HipNodes {
  const hipGroup = new THREE.Group();
  hipGroup.name = side === -1 ? 'LeftHip' : 'RightHip';

  const cfg = LEG_CONFIG.hip;
  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 1. STRUCTURAL GIMBAL HOUSING & UPPER MOUNTING FLANGE
  // ==========================================
  const housingGroup = new THREE.Group();
  housingGroup.name = side === -1 ? 'HipHousing_L' : 'HipHousing_R';
  hipGroup.add(housingGroup);

  const gimbalGeo = new THREE.CylinderGeometry(
    cfg.collarRadius * 1.04,
    cfg.collarRadius * 0.94,
    cfg.collarHeight * 0.55,
    32
  );
  const gimbalHousing = new THREE.Mesh(gimbalGeo, materials.joint);
  gimbalHousing.name = side === -1 ? 'HipGimbal_L' : 'HipGimbal_R';
  gimbalHousing.position.set(0, -0.006, 0);
  gimbalHousing.castShadow = true;
  gimbalHousing.receiveShadow = true;
  housingGroup.add(gimbalHousing);

  // Upper bearing race ring
  const upperRingGeo = new THREE.TorusGeometry(cfg.collarRadius * 1.05, 0.0024, 12, 32);
  const upperRing = new THREE.Mesh(upperRingGeo, materials.joint);
  upperRing.rotation.x = Math.PI / 2;
  upperRing.position.y = -0.002;
  housingGroup.add(upperRing);

  // ==========================================
  // 2. FLARED CONICAL SOCKET SKIRT (Completely seals upper joint gap)
  // ==========================================
  const skirtGeo = new THREE.CylinderGeometry(
    cfg.collarRadius * 0.94,
    cfg.socketSleeveRadiusTop * 1.06,
    cfg.collarHeight * 0.65,
    32,
    1,
    true
  );
  const socketSkirt = new THREE.Mesh(skirtGeo, materials.joint);
  socketSkirt.name = side === -1 ? 'HipSocketSkirt_L' : 'HipSocketSkirt_R';
  socketSkirt.position.set(0, -0.016, 0);
  socketSkirt.castShadow = true;
  socketSkirt.receiveShadow = true;
  housingGroup.add(socketSkirt);

  // Stepped lower collar seal ring
  const lowerSealGeo = new THREE.CylinderGeometry(
    cfg.socketSleeveRadiusTop * 1.08,
    cfg.socketSleeveRadiusTop * 1.04,
    0.006,
    32
  );
  const lowerSeal = new THREE.Mesh(lowerSealGeo, materials.joint);
  lowerSeal.position.set(0, -0.024, 0);
  lowerSeal.castShadow = true;
  housingGroup.add(lowerSeal);

  // ==========================================
  // 3. INTERNAL TITANIUM MULTIAXIAL SWIVEL BEARING BALL
  // ==========================================
  const ballGeo = new THREE.SphereGeometry(cfg.gimbalRadius, 28, 24);
  const swivelBall = new THREE.Mesh(ballGeo, materials.joint);
  swivelBall.name = side === -1 ? 'HipSwivelBall_L' : 'HipSwivelBall_R';
  swivelBall.position.set(0, -0.014, 0);
  swivelBall.castShadow = true;
  swivelBall.receiveShadow = true;
  housingGroup.add(swivelBall);

  const mergedHousing = mergeGroupMeshesByMaterial(housingGroup, materials.joint, side === -1 ? 'HipHousingJoint_L' : 'HipHousingJoint_R', true) || gimbalHousing;

  // ==========================================
  // 4. CONCENTRIC PURPLE EMISSIVE ACCENT RING
  // ==========================================
  const accentRingGeo = new THREE.TorusGeometry(cfg.accentRingRadius, 0.0020, 12, 32);
  const accentRing = new THREE.Mesh(accentRingGeo, materials.purpleEmissive);
  accentRing.name = side === -1 ? 'HipAccentRing_L' : 'HipAccentRing_R';
  accentRing.rotation.x = Math.PI / 2;
  accentRing.position.set(0, -0.005, 0);
  hipGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // ==========================================
  // 5. THIGH MOUNTING INTERFACE & INTERLOCKING TROCHANTER SLEEVE
  // ==========================================
  const thighMount = new THREE.Group();
  thighMount.name = side === -1 ? 'ThighMount_L' : 'ThighMount_R';
  thighMount.position.set(0, cfg.yOffset, 0);
  hipGroup.add(thighMount);

  // Continuous interlocking dark titanium collar sleeve
  const sleeveGeo = new THREE.CylinderGeometry(
    cfg.socketSleeveRadiusBottom * 1.02,
    cfg.socketSleeveRadiusBottom * 1.08,
    0.016,
    30
  );
  const interlockingCollar = new THREE.Mesh(sleeveGeo, materials.joint);
  interlockingCollar.name = side === -1 ? 'InterlockingCollar_L' : 'InterlockingCollar_R';
  interlockingCollar.position.set(0, 0.006, 0);
  interlockingCollar.castShadow = true;
  interlockingCollar.receiveShadow = true;
  thighMount.add(interlockingCollar);

  // Machined bolt flange with 8 radial hex fasteners
  const flangeGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.0045, 28);
  const mountFlange = new THREE.Mesh(flangeGeo, materials.joint);
  mountFlange.position.set(0, 0.001, 0);
  mountFlange.castShadow = true;
  thighMount.add(mountFlange);

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0035, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(Math.cos(angle) * 0.027, 0.004, Math.sin(angle) * 0.027);
    thighMount.add(bolt);
  }

  const mergedThighMount = mergeGroupMeshesByMaterial(thighMount, materials.joint, side === -1 ? 'ThighMountJoint_L' : 'ThighMountJoint_R', true) || interlockingCollar;

  // ==========================================
  // 6. DUAL HEAVY HYDRAULIC ASSIST STRUTS
  // ==========================================
  // Actuator 1: Anterior-Medial Pitch Stabilizer
  const start1 = new THREE.Vector3(0, 0.008, 0.022);
  const end1 = new THREE.Vector3(0, -0.046, 0.030);
  const actuatorFront = createHipActuator(start1, end1, `${side === -1 ? 'Left' : 'Right'}HipFront`, materials);
  hipGroup.add(actuatorFront.group);

  // Actuator 2: Lateral-Posterior Roll Stabilizer
  const start2 = new THREE.Vector3(side * 0.022, 0.006, -0.012);
  const end2 = new THREE.Vector3(side * 0.028, -0.048, -0.018);
  const actuatorLateral = createHipActuator(start2, end2, `${side === -1 ? 'Left' : 'Right'}HipLat`, materials);
  hipGroup.add(actuatorLateral.group);

  return {
    group: hipGroup,
    gimbalHousing: mergedHousing,
    socketSkirt: mergedHousing,
    swivelBall: mergedHousing,
    accentRing,
    thighMount,
    interlockingCollar: mergedThighMount,
    actuatorFront,
    actuatorLateral,
    ledMeshes,
  };
}
