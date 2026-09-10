import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { LEG_CONFIG } from './LegConfig';

export interface AchillesDamperNodes {
  group: THREE.Group;
  cylinder: THREE.Mesh;
  piston: THREE.Mesh;
}

export interface AnkleNodes {
  group: THREE.Group;
  sphericalCore: THREE.Mesh;
  clevisHousing: THREE.Mesh;
  malleolusLateral: THREE.Mesh;
  malleolusMedial: THREE.Mesh;
  accentRingLateral: THREE.Mesh;
  accentRingMedial: THREE.Mesh;
  achillesDamper?: AchillesDamperNodes;
  footPivot: THREE.Group;
  ledMeshes: THREE.Mesh[];
}

/**
 * Creates the high-fidelity articulated Ankle Joint assembly:
 * - Dual-axis clevis and spherical bearing core
 * - Malleolus armor discs (lateral and medial) with concentric violet LED rings
 * - Posterior Achilles hydraulic shock damper
 * - Articulated Foot Pivot for pitch and roll rotation
 */
export function createAnkle(
  side: -1 | 1,
  materials: RobotMaterialPalette
): AnkleNodes {
  const ankleGroup = new THREE.Group();
  ankleGroup.name = side === -1 ? 'LeftAnkle' : 'RightAnkle';

  const cfg = LEG_CONFIG.ankle;
  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 1. CENTRAL MULTIAXIAL SPHERICAL BEARING
  // ==========================================
  const sphereGeo = new THREE.SphereGeometry(cfg.housingRadius * 0.90, 20, 16);
  const sphericalCore = new THREE.Mesh(sphereGeo, materials.joint);
  sphericalCore.name = side === -1 ? 'AnkleBall_L' : 'AnkleBall_R';
  sphericalCore.castShadow = true;
  ankleGroup.add(sphericalCore);

  // Structural dark titanium clevis yoke clasping the spherical core
  const clevisShape = new THREE.Shape();
  clevisShape.moveTo(-0.016, 0.018);
  clevisShape.lineTo(0.016, 0.018);
  clevisShape.lineTo(0.020, -0.012);
  clevisShape.lineTo(0.012, -0.022);
  clevisShape.lineTo(-0.012, -0.022);
  clevisShape.lineTo(-0.020, -0.012);
  clevisShape.closePath();

  const clevisGeo = new THREE.ExtrudeGeometry(clevisShape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.002,
    bevelSegments: 2,
  });
  clevisGeo.center();

  const clevisHousing = new THREE.Mesh(clevisGeo, materials.joint);
  clevisHousing.name = side === -1 ? 'AnkleClevis_L' : 'AnkleClevis_R';
  clevisHousing.castShadow = true;
  ankleGroup.add(clevisHousing);

  // ==========================================
  // 2. MALLEOLUS DISCS (Lateral & Medial Ankle Bones)
  // ==========================================
  const discGeo = new THREE.CylinderGeometry(
    cfg.malleolusDiscRadius,
    cfg.malleolusDiscRadius,
    cfg.malleolusDiscWidth,
    24
  );

  const discSpacing = 0.052;

  // Lateral malleolus disc
  const malleolusLateral = new THREE.Mesh(discGeo, materials.joint);
  malleolusLateral.name = side === -1 ? 'MalleolusLat_L' : 'MalleolusLat_R';
  malleolusLateral.rotation.z = Math.PI / 2;
  malleolusLateral.position.x = side * (discSpacing * 0.5);
  malleolusLateral.castShadow = true;
  ankleGroup.add(malleolusLateral);

  // Medial malleolus disc
  const malleolusMedial = new THREE.Mesh(discGeo, materials.joint);
  malleolusMedial.name = side === -1 ? 'MalleolusMed_L' : 'MalleolusMed_R';
  malleolusMedial.rotation.z = Math.PI / 2;
  malleolusMedial.position.x = -side * (discSpacing * 0.5);
  malleolusMedial.castShadow = true;
  ankleGroup.add(malleolusMedial);

  // Concentric purple emissive rings on lateral and medial malleolus
  const ringGeo = new THREE.TorusGeometry(cfg.accentRingRadius, 0.0016, 8, 24);

  const accentRingLateral = new THREE.Mesh(ringGeo, materials.purpleEmissive);
  accentRingLateral.name = side === -1 ? 'AnkleAccentLat_L' : 'AnkleAccentLat_R';
  accentRingLateral.rotation.y = Math.PI / 2;
  accentRingLateral.position.x = side * (discSpacing * 0.5 + cfg.malleolusDiscWidth * 0.5 + 0.001);
  ankleGroup.add(accentRingLateral);
  ledMeshes.push(accentRingLateral);

  const accentRingMedial = new THREE.Mesh(ringGeo, materials.purpleEmissive);
  accentRingMedial.name = side === -1 ? 'AnkleAccentMed_L' : 'AnkleAccentMed_R';
  accentRingMedial.rotation.y = Math.PI / 2;
  accentRingMedial.position.x = -side * (discSpacing * 0.5 + cfg.malleolusDiscWidth * 0.5 + 0.001);
  ankleGroup.add(accentRingMedial);
  ledMeshes.push(accentRingMedial);

  // White ceramic outer accent caps on the malleolus discs
  const capGeo = new THREE.CylinderGeometry(
    cfg.malleolusDiscRadius * 0.72,
    cfg.malleolusDiscRadius * 0.68,
    0.003,
    20
  );
  const capLat = new THREE.Mesh(capGeo, materials.armor);
  capLat.rotation.z = Math.PI / 2;
  capLat.position.x = side * (discSpacing * 0.5 + cfg.malleolusDiscWidth * 0.5 + 0.0025);
  ankleGroup.add(capLat);

  const capMed = new THREE.Mesh(capGeo, materials.armor);
  capMed.rotation.z = Math.PI / 2;
  capMed.position.x = -side * (discSpacing * 0.5 + cfg.malleolusDiscWidth * 0.5 + 0.0025);
  ankleGroup.add(capMed);

  // ==========================================
  // 3. POSTERIOR ACHILLES HYDRAULIC DAMPER
  // ==========================================
  const aCfg = cfg.achillesDamper;
  const damperGroup = new THREE.Group();
  damperGroup.name = side === -1 ? 'AchillesDamper_L' : 'AchillesDamper_R';

  const aStart = new THREE.Vector3(0, aCfg.mountY, aCfg.mountZ);
  const aEnd = new THREE.Vector3(0, aCfg.targetY, aCfg.targetZ);
  const aDir = new THREE.Vector3().subVectors(aEnd, aStart);
  const aLen = aDir.length();

  damperGroup.position.copy(aStart);
  const aUp = new THREE.Vector3(0, -1, 0);
  damperGroup.quaternion.setFromUnitVectors(aUp, aDir.clone().normalize());

  const cylLen = aLen * 0.56;
  const cylGeo = new THREE.CylinderGeometry(aCfg.cylinderRadius, aCfg.cylinderRadius, cylLen, 12);
  const cylinder = new THREE.Mesh(cylGeo, materials.joint);
  cylinder.position.set(0, -cylLen * 0.5, 0);
  cylinder.castShadow = true;
  damperGroup.add(cylinder);

  const pistLen = aLen * 0.50;
  const pistGeo = new THREE.CylinderGeometry(aCfg.pistonRadius, aCfg.pistonRadius, pistLen, 10);
  const piston = new THREE.Mesh(pistGeo, materials.joint);
  piston.position.set(0, -cylLen - pistLen * 0.5 + 0.002, 0);
  piston.castShadow = true;
  damperGroup.add(piston);

  ankleGroup.add(damperGroup);

  // ==========================================
  // 4. FOOT PIVOT (Pitch, Yaw, Roll Articulation)
  // ==========================================
  const footPivot = new THREE.Group();
  footPivot.name = side === -1 ? 'LeftFootPivot' : 'RightFootPivot';
  footPivot.position.set(0, -0.016, 0);
  ankleGroup.add(footPivot);

  return {
    group: ankleGroup,
    sphericalCore,
    clevisHousing,
    malleolusLateral,
    malleolusMedial,
    accentRingLateral,
    accentRingMedial,
    achillesDamper: {
      group: damperGroup,
      cylinder,
      piston,
    },
    footPivot,
    ledMeshes,
  };
}
