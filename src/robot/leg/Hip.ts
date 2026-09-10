import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { LEG_CONFIG } from './LegConfig';

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
  swivelBall: THREE.Mesh;
  accentRing: THREE.Mesh;
  thighMount: THREE.Group;
  actuatorFront?: HipActuatorNodes;
  actuatorLateral?: HipActuatorNodes;
  ledMeshes: THREE.Mesh[];
}

/**
 * Creates a single linear hydraulic assist actuator for the hip joint.
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

  // Upper mount clevis
  const uMountGeo = new THREE.CylinderGeometry(cfg.cylinderRadius * 1.25, cfg.cylinderRadius * 1.25, 0.005, 14);
  const upperMount = new THREE.Mesh(uMountGeo, materials.joint);
  upperMount.rotation.x = Math.PI / 2;
  group.add(upperMount);

  // Outer cylinder barrel (dark titanium)
  const cylLen = len * 0.54;
  const cylGeo = new THREE.CylinderGeometry(cfg.cylinderRadius, cfg.cylinderRadius, cylLen, 16);
  const cylinder = new THREE.Mesh(cylGeo, materials.joint);
  cylinder.position.set(0, -cylLen * 0.5, 0);
  cylinder.castShadow = true;
  group.add(cylinder);

  // Cylinder end collar
  const collarGeo = new THREE.CylinderGeometry(cfg.cylinderRadius * 1.14, cfg.cylinderRadius * 1.14, 0.0028, 16);
  const collar = new THREE.Mesh(collarGeo, materials.joint);
  collar.position.set(0, -cylLen + 0.0014, 0);
  group.add(collar);

  // Telescoping Piston Rod (Polished metallic / chrome)
  const pistLen = len * 0.48;
  const pistGeo = new THREE.CylinderGeometry(cfg.pistonRadius, cfg.pistonRadius, pistLen, 14);
  const piston = new THREE.Mesh(pistGeo, materials.joint);
  piston.position.set(0, -cylLen - pistLen * 0.5 + 0.003, 0);
  piston.castShadow = true;
  group.add(piston);

  // Lower mount eyelet
  const lMountGeo = new THREE.CylinderGeometry(cfg.pistonRadius * 1.35, cfg.pistonRadius * 1.35, 0.0045, 12);
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
 * Creates the high-fidelity articulated Hip Joint assembly:
 * - Direct mechanical socket receiving the waist rotary hub
 * - Multiaxial spherical bearing and gimbal collar
 * - Dual linear hydraulic assist struts
 * - Violet emissive indicator accent ring
 * - Articulated thigh mounting interface
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
  // 1. STRUCTURAL GIMBAL HOUSING & SOCKET
  // ==========================================
  const gimbalGeo = new THREE.CylinderGeometry(
    cfg.collarRadius,
    cfg.collarRadius * 0.92,
    cfg.collarHeight,
    28
  );
  const gimbalHousing = new THREE.Mesh(gimbalGeo, materials.joint);
  gimbalHousing.name = side === -1 ? 'HipGimbal_L' : 'HipGimbal_R';
  gimbalHousing.position.set(0, -0.010, 0);
  gimbalHousing.castShadow = true;
  gimbalHousing.receiveShadow = true;
  hipGroup.add(gimbalHousing);

  // Bearing Race Chamfer Rings around gimbal collar
  const flangeGeo = new THREE.TorusGeometry(cfg.collarRadius * 1.02, 0.002, 12, 28);
  const flange = new THREE.Mesh(flangeGeo, materials.joint);
  flange.rotation.x = Math.PI / 2;
  flange.position.y = -0.010;
  hipGroup.add(flange);

  // ==========================================
  // 2. INTERNAL MULTIAXIAL SWIVEL BEARING BALL
  // ==========================================
  const ballGeo = new THREE.SphereGeometry(cfg.gimbalRadius, 24, 20);
  const swivelBall = new THREE.Mesh(ballGeo, materials.joint);
  swivelBall.name = side === -1 ? 'HipSwivelBall_L' : 'HipSwivelBall_R';
  swivelBall.position.set(0, -0.018, 0);
  swivelBall.castShadow = true;
  hipGroup.add(swivelBall);

  // ==========================================
  // 3. CONCENTRIC PURPLE EMISSIVE ACCENT RING
  // ==========================================
  const accentRingGeo = new THREE.TorusGeometry(cfg.accentRingRadius, 0.0018, 10, 28);
  const accentRing = new THREE.Mesh(accentRingGeo, materials.purpleEmissive);
  accentRing.name = side === -1 ? 'HipAccentRing_L' : 'HipAccentRing_R';
  accentRing.rotation.x = Math.PI / 2;
  accentRing.position.set(0, -0.003, 0);
  hipGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // ==========================================
  // 4. THIGH MOUNTING INTERFACE (Articulated Pivot)
  // ==========================================
  const thighMount = new THREE.Group();
  thighMount.name = side === -1 ? 'ThighMount_L' : 'ThighMount_R';
  thighMount.position.set(0, cfg.yOffset, 0);
  hipGroup.add(thighMount);

  // Thigh top mounting flange (interlocking dark titanium disc with bolt indents)
  const mountFlangeGeo = new THREE.CylinderGeometry(0.026, 0.028, 0.008, 24);
  const mountFlange = new THREE.Mesh(mountFlangeGeo, materials.joint);
  mountFlange.position.set(0, 0.004, 0);
  mountFlange.castShadow = true;
  thighMount.add(mountFlange);

  // 6 Hex bolt heads around top flange
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.003, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(Math.cos(angle) * 0.021, 0.008, Math.sin(angle) * 0.021);
    thighMount.add(bolt);
  }

  // ==========================================
  // 5. DUAL HYDRAULIC ASSIST ACTUATORS
  // ==========================================
  // Actuator 1: Anterior-medial stabilizer
  const start1 = new THREE.Vector3(0, 0.008, 0.016);
  const end1 = new THREE.Vector3(0, -0.036, 0.022);
  const actuatorFront = createHipActuator(start1, end1, `${side === -1 ? 'Left' : 'Right'}HipFront`, materials);
  hipGroup.add(actuatorFront.group);

  // Actuator 2: Lateral-posterior stabilizer
  const start2 = new THREE.Vector3(side * 0.018, 0.006, -0.012);
  const end2 = new THREE.Vector3(side * 0.022, -0.038, -0.016);
  const actuatorLateral = createHipActuator(start2, end2, `${side === -1 ? 'Left' : 'Right'}HipLat`, materials);
  hipGroup.add(actuatorLateral.group);

  return {
    group: hipGroup,
    gimbalHousing,
    swivelBall,
    accentRing,
    thighMount,
    actuatorFront,
    actuatorLateral,
    ledMeshes,
  };
}
