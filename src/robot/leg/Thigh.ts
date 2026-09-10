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
  trochanterHood: THREE.Mesh;
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
 * Creates the proximal trochanter hood that arches upward from the top of the thigh
 * to cup snugly around the hip socket skirt and swivel ball, completely eliminating
 * any floating gap between the hip and the thigh.
 */
function createTrochanterHoodGeometry(
  radius: number,
  height: number,
  thickness: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const r = radius;

  // Horseshoe / bell curve contour cupping the proximal joint
  shape.moveTo(-r * 0.92, -height * 0.5);
  shape.quadraticCurveTo(-r * 0.98, 0, -r * 0.70, height * 0.40);
  shape.quadraticCurveTo(0, height * 0.55, r * 0.70, height * 0.40);
  shape.quadraticCurveTo(r * 0.98, 0, r * 0.92, -height * 0.5);
  shape.quadraticCurveTo(r * 0.50, -height * 0.35, 0, -height * 0.35);
  shape.quadraticCurveTo(-r * 0.50, -height * 0.35, -r * 0.92, -height * 0.5);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0035,
    bevelSize: 0.0028,
    bevelSegments: 3,
    curveSegments: 28,
  });
  geo.center();

  // Cylindrical wrap around the upper femur
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const nx = x / (r * 0.98);
    pos.setZ(i, z - Math.pow(nx, 2) * 0.012 + (z > 0 ? 0.003 : 0));
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the next-level sculpted white ceramic anterior quad armor plate.
 * Features:
 * - High-speed aerodynamic central keel crest running down the rectus femoris midline
 * - Precision automotive angled chamfers on lateral and medial shoulders
 * - Upper intake scoop with recessed dark titanium grille
 * - Anatomical muscular bulge with organic compound curvature
 * - Distal patellar relief pocket
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
  const halfL = length * 0.5;

  // Athletic anatomical quad profile
  // Proximal arch rising up towards the hip socket
  shape.moveTo(0, halfL);
  shape.quadraticCurveTo(halfWT * 0.50, halfL + 0.004, halfWT * 0.85, halfL - 0.012);
  shape.quadraticCurveTo(halfWT * 1.04, halfL * 0.55, halfWT * 0.98, 0);
  shape.quadraticCurveTo(halfWT * 0.90, -halfL * 0.45, halfWB * 1.08, -halfL * 0.82);
  shape.lineTo(halfWB, -halfL);
  // Distal patellar arch
  shape.quadraticCurveTo(halfWB * 0.40, -halfL + 0.006, 0, -halfL + 0.008);
  shape.quadraticCurveTo(-halfWB * 0.40, -halfL + 0.006, -halfWB, -halfL);
  // Symmetrical return left
  shape.lineTo(-halfWB * 1.08, -halfL * 0.82);
  shape.quadraticCurveTo(-halfWT * 0.90, -halfL * 0.45, -halfWT * 0.98, 0);
  shape.quadraticCurveTo(-halfWT * 1.04, halfL * 0.55, -halfWT * 0.85, halfL - 0.012);
  shape.quadraticCurveTo(-halfWT * 0.50, halfL + 0.004, 0, halfL);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0045,
    bevelSize: 0.0035,
    bevelSegments: 4,
    curveSegments: 32,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  // Multi-faceted 3D Sculpting:
  // 1. Sharp central longitudinal keel ridge peaking along x = 0
  // 2. Lateral facet slope: 35° beveled planes running down each flank
  // 3. Anatomical quad belly: convex curve peaking at upper 40% of thigh
  // 4. Cylindrical wrap around the femur
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    if (z > 0) {
      const nx = Math.min(1.0, Math.abs(x) / halfWT);
      // Aggressive central keel: peak at nx = 0
      const keel = (1.0 - Math.pow(nx, 1.4)) * 0.011;
      // Muscular bulge peaking at y = +0.02
      const ny = (y + halfL) / length;
      const muscleBulge = Math.sin(ny * Math.PI * 0.95) * 0.008;
      // Flank taper
      const flankWrap = -Math.pow(nx, 2.0) * 0.009;

      pos.setZ(i, z + keel + muscleBulge + flankWrap);
    } else {
      // Concave inner seat wrapping the femur
      const nx = Math.min(1.0, Math.abs(x) / halfWT);
      pos.setZ(i, z - Math.pow(nx, 2.0) * 0.005);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the aerodynamic outer lateral armor cowl (Vastus Lateralis).
 */
function createLateralArmorGeometry(
  side: -1 | 1,
  length: number,
  width: number,
  thickness: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfW = width * 0.5;
  const halfL = length * 0.5;

  // Sculpted aerodynamic wing profile
  shape.moveTo(-halfW * 0.70, halfL);
  shape.quadraticCurveTo(halfW * 0.60, halfL * 0.95, halfW * 0.95, halfL * 0.70);
  shape.quadraticCurveTo(halfW * 1.05, halfL * 0.20, halfW * 0.90, -halfL * 0.25);
  shape.quadraticCurveTo(halfW * 0.75, -halfL * 0.70, halfW * 0.50, -halfL);
  shape.lineTo(-halfW * 0.85, -halfL * 0.95);
  shape.quadraticCurveTo(-halfW * 1.02, 0, -halfW * 0.70, halfL);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0032,
    bevelSize: 0.0024,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.center();

  // Cylindrical wrap around the thigh cylinder
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const nx = x / halfW;
    pos.setZ(i, z + Math.cos(nx * (Math.PI * 0.45)) * 0.006);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the complete next-level Thigh (Upper Leg) assembly:
 * - Upper Trochanter Hood cupping the hip socket (ZERO gap)
 * - Sculpted White Ceramic Anterior Quad Armor with aerodynamic keel and intake grille
 * - Internal Dark Titanium Femur Chassis with structural CNC bulkheads
 * - Lateral Armor Cowl with recessed purple neon LED conduit & cooling louvers
 * - Medial Protector Plate shielding internal hydraulic conduits
 * - Lower Patellar Joint Collar interfacing with the Knee
 * - Posterior Hamstring Hydraulic Damper
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
  // 1. PROXIMAL TROCHANTER ARMOR HOOD (Caps the Hip Joint - Eliminates View-Through Gap)
  // ==========================================
  const hoodGeo = createTrochanterHoodGeometry(
    cfg.trochanterHood.radius,
    cfg.trochanterHood.height,
    cfg.trochanterHood.thickness
  );
  const trochanterHood = new THREE.Mesh(hoodGeo, materials.armor);
  trochanterHood.name = side === -1 ? 'TrochanterHood_L' : 'TrochanterHood_R';
  trochanterHood.position.set(0, 0.008, 0.016);
  trochanterHood.rotation.x = -0.10;
  trochanterHood.castShadow = true;
  trochanterHood.receiveShadow = true;
  thighGroup.add(trochanterHood);

  // Trochanter secondary dark titanium flange ring
  const trochanterRingGeo = new THREE.TorusGeometry(cfg.trochanterHood.radius * 0.95, 0.0028, 12, 32);
  const trochanterRing = new THREE.Mesh(trochanterRingGeo, materials.joint);
  trochanterRing.rotation.x = Math.PI / 2;
  trochanterRing.position.set(0, 0.012, 0.010);
  thighGroup.add(trochanterRing);

  // ==========================================
  // 2. STRUCTURAL FEMUR CHASSIS (Dark Titanium Core)
  // ==========================================
  const skeletonGeo = new THREE.CylinderGeometry(
    cfg.skeletonRadius * 1.25,
    cfg.skeletonRadius * 1.05,
    cfg.length * 0.96,
    28
  );
  const femurSkeleton = new THREE.Mesh(skeletonGeo, materials.joint);
  femurSkeleton.name = side === -1 ? 'FemurSkeleton_L' : 'FemurSkeleton_R';
  femurSkeleton.position.set(0, -cfg.length * 0.48, 0);
  femurSkeleton.castShadow = true;
  femurSkeleton.receiveShadow = true;
  thighGroup.add(femurSkeleton);

  // CNC Reinforcement Bulkheads along the femur skeleton
  for (const factor of [0.15, 0.35, 0.58, 0.82]) {
    const ringGeo = new THREE.CylinderGeometry(
      cfg.skeletonRadius * 1.38,
      cfg.skeletonRadius * 1.38,
      0.006,
      28
    );
    const ring = new THREE.Mesh(ringGeo, materials.joint);
    ring.position.set(0, -cfg.length * factor, 0);
    ring.castShadow = true;
    thighGroup.add(ring);
  }

  // ==========================================
  // 3. NEXT-LEVEL SCULPTED ANTERIOR QUAD ARMOR
  // ==========================================
  const antGeo = createAnteriorArmorGeometry(
    cfg.anteriorArmor.widthTop,
    cfg.anteriorArmor.widthBottom,
    cfg.anteriorArmor.length,
    cfg.anteriorArmor.thickness
  );
  const anteriorArmor = new THREE.Mesh(antGeo, materials.armor);
  anteriorArmor.name = side === -1 ? 'ThighAnteriorArmor_L' : 'ThighAnteriorArmor_R';
  // Anchored so top sweeps continuously up into the trochanter hood
  anteriorArmor.position.set(0, -cfg.length * 0.44, 0.026);
  anteriorArmor.rotation.x = 0.02;
  anteriorArmor.castShadow = true;
  anteriorArmor.receiveShadow = true;
  thighGroup.add(anteriorArmor);

  // Upper aerodynamic intake scoop with dark titanium grille
  const intakeGroup = new THREE.Group();
  intakeGroup.position.set(0, -cfg.length * 0.20, 0.038);

  const intakePocketGeo = new THREE.BoxGeometry(0.028, 0.007, 0.005);
  const intakePocket = new THREE.Mesh(intakePocketGeo, materials.joint);
  intakeGroup.add(intakePocket);

  // Horizontal grille bars
  for (let i = -1; i <= 1; i++) {
    const barGeo = new THREE.BoxGeometry(0.024, 0.0012, 0.006);
    const bar = new THREE.Mesh(barGeo, materials.joint);
    bar.position.set(0, i * 0.0022, 0.0005);
    intakeGroup.add(bar);
  }
  thighGroup.add(intakeGroup);

  // Recessed hydraulic anchor clevises receiving the hip assist struts
  const clevisGeo = new THREE.BoxGeometry(0.010, 0.014, 0.009);
  const frontClevis = new THREE.Mesh(clevisGeo, materials.joint);
  frontClevis.position.set(0, -0.046, 0.031);
  thighGroup.add(frontClevis);

  const latClevis = new THREE.Mesh(clevisGeo, materials.joint);
  latClevis.position.set(side * 0.028, -0.048, -0.018);
  thighGroup.add(latClevis);

  // ==========================================
  // 4. SCULPTED LATERAL ARMOR COWL (Vastus Lateralis)
  // ==========================================
  const latGeo = createLateralArmorGeometry(
    side,
    cfg.lateralArmor.cowlLength,
    cfg.lateralArmor.width,
    cfg.lateralArmor.thickness
  );
  const lateralArmor = new THREE.Mesh(latGeo, materials.armor);
  lateralArmor.name = side === -1 ? 'ThighLateralArmor_L' : 'ThighLateralArmor_R';
  lateralArmor.position.set(side * 0.040, -cfg.length * 0.45, 0.004);
  lateralArmor.rotation.y = side * (Math.PI / 2);
  lateralArmor.castShadow = true;
  lateralArmor.receiveShadow = true;
  thighGroup.add(lateralArmor);

  // Lateral cooling louvers on the flank
  for (let i = 0; i < 3; i++) {
    const louverGeo = new THREE.BoxGeometry(0.0025, 0.003, 0.022);
    const louver = new THREE.Mesh(louverGeo, materials.joint);
    louver.position.set(side * 0.047, -cfg.length * (0.34 + i * 0.06), 0.002);
    louver.rotation.z = side * 0.15;
    thighGroup.add(louver);
  }

  // ==========================================
  // 5. RECESSED PURPLE NEON ENERGY CONDUIT / LED STRIP
  // ==========================================
  const ledGeo = new THREE.BoxGeometry(cfg.ledStrip.width, cfg.ledStrip.length, cfg.ledStrip.depth);
  const ledStrip = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledStrip.name = side === -1 ? 'ThighLedStrip_L' : 'ThighLedStrip_R';
  ledStrip.position.set(side * 0.048, -cfg.length * 0.47, 0.006);
  thighGroup.add(ledStrip);
  ledMeshes.push(ledStrip);

  // Soft atmospheric bloom shell
  const bloomGeo = new THREE.BoxGeometry(cfg.ledStrip.width * 2.2, cfg.ledStrip.length, cfg.ledStrip.depth * 1.5);
  const bloomMesh = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomMesh.position.copy(ledStrip.position);
  thighGroup.add(bloomMesh);

  // ==========================================
  // 6. MEDIAL (INNER) PROTECTOR PLATE
  // ==========================================
  const medShape = new THREE.Shape();
  const medH = cfg.medialArmor.cowlLength * 0.5;
  const medW = cfg.medialArmor.width * 0.5;

  medShape.moveTo(-medW * 0.70, medH);
  medShape.lineTo(medW * 0.70, medH * 0.90);
  medShape.quadraticCurveTo(medW * 0.95, 0, medW * 0.70, -medH * 0.90);
  medShape.lineTo(-medW * 0.70, -medH);
  medShape.quadraticCurveTo(-medW * 0.95, 0, -medW * 0.70, medH);
  medShape.closePath();

  const medGeo = new THREE.ExtrudeGeometry(medShape, {
    depth: cfg.medialArmor.thickness,
    bevelEnabled: true,
    bevelThickness: 0.0028,
    bevelSize: 0.0022,
    bevelSegments: 2,
    curveSegments: 20,
  });
  medGeo.center();

  const medialArmor = new THREE.Mesh(medGeo, materials.armor);
  medialArmor.name = side === -1 ? 'ThighMedialArmor_L' : 'ThighMedialArmor_R';
  medialArmor.position.set(-side * 0.036, -cfg.length * 0.46, 0.002);
  medialArmor.rotation.y = -side * (Math.PI / 2);
  medialArmor.castShadow = true;
  medialArmor.receiveShadow = true;
  thighGroup.add(medialArmor);

  // ==========================================
  // 7. POSTERIOR HAMSTRING ARMOR & HYDRAULIC DAMPER
  // ==========================================
  const postShape = new THREE.Shape();
  postShape.moveTo(-0.024, cfg.length * 0.36);
  postShape.lineTo(0.024, cfg.length * 0.36);
  postShape.lineTo(0.018, -cfg.length * 0.36);
  postShape.lineTo(-0.018, -cfg.length * 0.36);
  postShape.closePath();

  const postGeo = new THREE.ExtrudeGeometry(postShape, {
    depth: 0.010,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.0020,
    bevelSegments: 2,
  });
  postGeo.center();

  const posteriorPlate = new THREE.Mesh(postGeo, materials.armor);
  posteriorPlate.name = side === -1 ? 'ThighPosteriorPlate_L' : 'ThighPosteriorPlate_R';
  posteriorPlate.position.set(0, -cfg.length * 0.47, -0.028);
  posteriorPlate.castShadow = true;
  posteriorPlate.receiveShadow = true;
  thighGroup.add(posteriorPlate);

  // Telescoping rear hamstring damper
  const dCfg = cfg.rearDamper;
  const startD = new THREE.Vector3(0, dCfg.mountY, dCfg.mountZ);
  const endD = new THREE.Vector3(0, dCfg.targetY, dCfg.targetZ);
  const damperDir = new THREE.Vector3().subVectors(endD, startD);
  const damperLen = damperDir.length();

  const damperGroup = new THREE.Group();
  damperGroup.position.copy(startD);

  const damperUp = new THREE.Vector3(0, -1, 0);
  damperGroup.quaternion.setFromUnitVectors(damperUp, damperDir.clone().normalize());

  const dCylLen = damperLen * 0.55;
  const dCylGeo = new THREE.CylinderGeometry(dCfg.cylinderRadius, dCfg.cylinderRadius, dCylLen, 16);
  const dCylinder = new THREE.Mesh(dCylGeo, materials.joint);
  dCylinder.position.set(0, -dCylLen * 0.5, 0);
  dCylinder.castShadow = true;
  damperGroup.add(dCylinder);

  const dPistLen = damperLen * 0.50;
  const dPistGeo = new THREE.CylinderGeometry(dCfg.pistonRadius, dCfg.pistonRadius, dPistLen, 14);
  const dPiston = new THREE.Mesh(dPistGeo, materials.joint);
  dPiston.position.set(0, -dCylLen - dPistLen * 0.5 + 0.004, 0);
  dPiston.castShadow = true;
  damperGroup.add(dPiston);
  thighGroup.add(damperGroup);

  const rearDamper: ThighDamperNodes = {
    group: damperGroup,
    cylinder: dCylinder,
    piston: dPiston,
  };

  // ==========================================
  // 8. DISTAL KNEE ARTICULATION PIVOT (Knee Mount)
  // ==========================================
  const kneePivot = new THREE.Group();
  kneePivot.name = side === -1 ? 'KneePivot_L' : 'KneePivot_R';
  kneePivot.position.set(0, -cfg.length, 0);
  thighGroup.add(kneePivot);

  // Distal femur condyle joint disc
  const condyleGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.068, 24);
  const condyle = new THREE.Mesh(condyleGeo, materials.joint);
  condyle.rotation.z = Math.PI / 2;
  condyle.castShadow = true;
  kneePivot.add(condyle);

  return {
    group: thighGroup,
    femurSkeleton,
    trochanterHood,
    anteriorArmor,
    lateralArmor,
    medialArmor,
    posteriorPlate,
    ledStrip,
    rearDamper,
    kneePivot,
    ledMeshes,
  };
}
