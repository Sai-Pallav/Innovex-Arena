import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { LEG_CONFIG } from './LegConfig';

export interface ThighDamperNodes {
  group: THREE.Group;
  cylinder: THREE.Mesh;
  piston: THREE.Mesh;
}

export interface ThighNodes {
  group: THREE.Group;
  femurSkeleton: THREE.Mesh;
  anteriorArmor: THREE.Mesh;
  lateralArmor: THREE.Mesh;
  medialArmor: THREE.Mesh;
  posteriorPlate: THREE.Mesh;
  ledStrip: THREE.Mesh;
  rearDamper?: ThighDamperNodes;
  kneePivot: THREE.Group;
  ledMeshes: THREE.Mesh[];
}

/**
 * Creates the sculpted white ceramic anterior (front) quad armor plate.
 * Features an anatomical central crease ridge and precision beveled chamfers.
 */
function createAnteriorArmorGeometry(
  widthTop: number,
  widthBottom: number,
  length: number,
  thickness: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfWT = widthTop * 0.5;
  const halfWB = widthBottom * 0.5;

  // Quad outline tapering smoothly from hip to knee
  shape.moveTo(0, length * 0.5);
  shape.quadraticCurveTo(halfWT * 0.6, length * 0.49, halfWT, length * 0.42);
  shape.lineTo(halfWT * 0.95, -length * 0.10);
  shape.quadraticCurveTo(halfWB * 1.10, -length * 0.38, halfWB, -length * 0.48);
  shape.quadraticCurveTo(0, -length * 0.50, -halfWB, -length * 0.48);
  shape.quadraticCurveTo(-halfWB * 1.10, -length * 0.38, -halfWT * 0.95, -length * 0.10);
  shape.lineTo(-halfWT, length * 0.42);
  shape.quadraticCurveTo(-halfWT * 0.6, length * 0.49, 0, length * 0.5);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0035,
    bevelSize: 0.0028,
    bevelSegments: 3,
    curveSegments: 24,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  // Sculpt central longitudinal keel ridge: front vertices peak at x = 0
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (z > 0) {
      // Keel ridge tapering laterally
      const keelFactor = 1.0 - Math.min(1.0, Math.abs(x) / halfWT);
      const quadBulge = Math.sin(((y + length * 0.5) / length) * Math.PI) * 0.006;
      pos.setZ(i, z + keelFactor * 0.007 + quadBulge);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the outer lateral thigh armor cowl wrapping around the exterior quad.
 */
function createLateralArmorGeometry(
  side: -1 | 1,
  length: number,
  width: number,
  thickness: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfW = width * 0.5;

  shape.moveTo(-halfW, length * 0.46);
  shape.lineTo(halfW * 0.8, length * 0.44);
  shape.quadraticCurveTo(halfW, length * 0.15, halfW * 0.95, -length * 0.20);
  shape.lineTo(halfW * 0.7, -length * 0.44);
  shape.lineTo(-halfW * 0.8, -length * 0.45);
  shape.quadraticCurveTo(-halfW, -length * 0.10, -halfW, length * 0.46);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.0020,
    bevelSegments: 2,
    curveSegments: 20,
  });
  geo.center();

  // Lateral curvature wrapping around the cylinder of the thigh
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (z > 0) {
      pos.setZ(i, z + Math.cos((x / halfW) * (Math.PI * 0.45)) * 0.004);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the complete Thigh (Upper Leg) assembly:
 * - Internal dark titanium structural femur skeleton
 * - Sculpted white ceramic anterior armor plate with keel crease
 * - Outer lateral armor cowl with recessed purple neon LED conduit
 * - Medial aerodynamic protector plate
 * - Posterior mechanical hamstring actuator
 * - Distal knee articulation mount
 */
export function createThigh(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ThighNodes {
  const thighGroup = new THREE.Group();
  thighGroup.name = side === -1 ? 'LeftThigh' : 'RightThigh';

  const cfg = LEG_CONFIG.thigh;
  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 1. CENTRAL FEMUR SKELETON (Dark Titanium Core)
  // ==========================================
  const skeletonGeo = new THREE.CylinderGeometry(
    cfg.skeletonRadius * 1.15,
    cfg.skeletonRadius * 0.95,
    cfg.length * 0.92,
    24
  );
  const femurSkeleton = new THREE.Mesh(skeletonGeo, materials.joint);
  femurSkeleton.name = side === -1 ? 'FemurSkeleton_L' : 'FemurSkeleton_R';
  femurSkeleton.position.set(0, -cfg.length * 0.5, 0);
  femurSkeleton.castShadow = true;
  femurSkeleton.receiveShadow = true;
  thighGroup.add(femurSkeleton);

  // Reinforcement Rings along the skeleton
  for (const factor of [0.25, 0.50, 0.75]) {
    const ringGeo = new THREE.CylinderGeometry(
      cfg.skeletonRadius * 1.28,
      cfg.skeletonRadius * 1.28,
      0.005,
      24
    );
    const ring = new THREE.Mesh(ringGeo, materials.joint);
    ring.position.set(0, -cfg.length * factor, 0);
    thighGroup.add(ring);
  }

  // ==========================================
  // 2. SCULPTED ANTERIOR (FRONT) QUAD ARMOR PLATE
  // ==========================================
  const antGeo = createAnteriorArmorGeometry(
    cfg.anteriorArmor.widthTop,
    cfg.anteriorArmor.widthBottom,
    cfg.length * 0.88,
    cfg.anteriorArmor.thickness
  );
  const anteriorArmor = new THREE.Mesh(antGeo, materials.armor);
  anteriorArmor.name = side === -1 ? 'ThighAnteriorArmor_L' : 'ThighAnteriorArmor_R';
  anteriorArmor.position.set(0, -cfg.length * 0.48, 0.024);
  anteriorArmor.castShadow = true;
  anteriorArmor.receiveShadow = true;
  thighGroup.add(anteriorArmor);

  // Decorative dark horizontal tech slot in upper anterior armor
  const slotGeo = new THREE.BoxGeometry(0.024, 0.0035, 0.004);
  const slot = new THREE.Mesh(slotGeo, materials.joint);
  slot.position.set(0, -cfg.length * 0.22, 0.033);
  thighGroup.add(slot);

  // ==========================================
  // 3. LATERAL (OUTER) THIGH ARMOR COWL
  // ==========================================
  const latGeo = createLateralArmorGeometry(
    side,
    cfg.lateralArmor.cowlLength,
    cfg.lateralArmor.width,
    cfg.lateralArmor.thickness
  );
  const lateralArmor = new THREE.Mesh(latGeo, materials.armor);
  lateralArmor.name = side === -1 ? 'ThighLateralArmor_L' : 'ThighLateralArmor_R';
  lateralArmor.position.set(side * 0.038, -cfg.length * 0.46, 0.004);
  lateralArmor.rotation.y = side * (Math.PI / 2);
  lateralArmor.castShadow = true;
  lateralArmor.receiveShadow = true;
  thighGroup.add(lateralArmor);

  // ==========================================
  // 4. RECESSED PURPLE NEON ENERGY CONDUIT / LED STRIP
  // ==========================================
  const ledGeo = new THREE.BoxGeometry(cfg.ledStrip.width, cfg.ledStrip.length, cfg.ledStrip.depth);
  const ledStrip = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledStrip.name = side === -1 ? 'ThighLedStrip_L' : 'ThighLedStrip_R';
  ledStrip.position.set(side * 0.044, -cfg.length * 0.47, 0.006);
  thighGroup.add(ledStrip);
  ledMeshes.push(ledStrip);

  // Subtle lateral bloom mesh for the conduit
  const bloomGeo = new THREE.BoxGeometry(cfg.ledStrip.width * 2.2, cfg.ledStrip.length, cfg.ledStrip.depth * 1.5);
  const bloomMesh = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomMesh.position.copy(ledStrip.position);
  thighGroup.add(bloomMesh);

  // ==========================================
  // 5. MEDIAL (INNER) PROTECTOR PLATE
  // ==========================================
  const medShape = new THREE.Shape();
  medShape.moveTo(-0.016, cfg.length * 0.32);
  medShape.lineTo(0.016, cfg.length * 0.30);
  medShape.lineTo(0.012, -cfg.length * 0.30);
  medShape.lineTo(-0.014, -cfg.length * 0.32);
  medShape.closePath();

  const medGeo = new THREE.ExtrudeGeometry(medShape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.0018,
    bevelSegments: 2,
  });
  medGeo.center();

  const medialArmor = new THREE.Mesh(medGeo, materials.armor);
  medialArmor.name = side === -1 ? 'ThighMedialArmor_L' : 'ThighMedialArmor_R';
  medialArmor.position.set(-side * 0.034, -cfg.length * 0.48, 0.002);
  medialArmor.rotation.y = -side * (Math.PI / 2);
  medialArmor.castShadow = true;
  thighGroup.add(medialArmor);

  // ==========================================
  // 6. POSTERIOR (HAMSTRING) REINFORCEMENT PLATE
  // ==========================================
  const postGeo = new THREE.CylinderGeometry(0.022, 0.020, cfg.length * 0.65, 18, 1, false, 0, Math.PI);
  const posteriorPlate = new THREE.Mesh(postGeo, materials.joint);
  posteriorPlate.name = side === -1 ? 'ThighPosteriorPlate_L' : 'ThighPosteriorPlate_R';
  posteriorPlate.position.set(0, -cfg.length * 0.48, -0.014);
  posteriorPlate.rotation.y = Math.PI / 2;
  posteriorPlate.castShadow = true;
  thighGroup.add(posteriorPlate);

  // ==========================================
  // 7. POSTERIOR HYDRAULIC DAMPER (Knee articulation assist)
  // ==========================================
  const dCfg = cfg.rearDamper;
  const damperGroup = new THREE.Group();
  damperGroup.name = side === -1 ? 'HamstringDamper_L' : 'HamstringDamper_R';

  const dStart = new THREE.Vector3(side * 0.014, dCfg.mountY, dCfg.mountZ);
  const dEnd = new THREE.Vector3(side * 0.014, dCfg.targetY, dCfg.targetZ);
  const dDir = new THREE.Vector3().subVectors(dEnd, dStart);
  const dLen = dDir.length();

  damperGroup.position.copy(dStart);
  const dUp = new THREE.Vector3(0, -1, 0);
  damperGroup.quaternion.setFromUnitVectors(dUp, dDir.clone().normalize());

  const cylLen = dLen * 0.55;
  const cylGeo = new THREE.CylinderGeometry(dCfg.cylinderRadius, dCfg.cylinderRadius, cylLen, 14);
  const cylinder = new THREE.Mesh(cylGeo, materials.joint);
  cylinder.position.set(0, -cylLen * 0.5, 0);
  cylinder.castShadow = true;
  damperGroup.add(cylinder);

  const pistLen = dLen * 0.50;
  const pistGeo = new THREE.CylinderGeometry(dCfg.pistonRadius, dCfg.pistonRadius, pistLen, 12);
  const piston = new THREE.Mesh(pistGeo, materials.joint);
  piston.position.set(0, -cylLen - pistLen * 0.5 + 0.003, 0);
  piston.castShadow = true;
  damperGroup.add(piston);

  thighGroup.add(damperGroup);

  // ==========================================
  // 8. DISTAL KNEE ARTICULATION PIVOT
  // ==========================================
  const kneePivot = new THREE.Group();
  kneePivot.name = side === -1 ? 'LeftKneePivot' : 'RightKneePivot';
  kneePivot.position.set(0, -cfg.length, 0);
  thighGroup.add(kneePivot);

  return {
    group: thighGroup,
    femurSkeleton,
    anteriorArmor,
    lateralArmor,
    medialArmor,
    posteriorPlate,
    ledStrip,
    rearDamper: {
      group: damperGroup,
      cylinder,
      piston,
    },
    kneePivot,
    ledMeshes,
  };
}
