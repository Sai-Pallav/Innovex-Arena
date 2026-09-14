import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { LEG_CONFIG } from './LegConfig';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface ThighNodes {
  group: THREE.Group;
  femurSkeleton: THREE.Mesh;
  trochanterHood: THREE.Mesh;
  anteriorArmor: THREE.Mesh;
  lateralArmor: THREE.Mesh;
  medialArmor: THREE.Mesh;
  posteriorPlate: THREE.Mesh;
  ledStrip: THREE.Mesh;
  kneePivot: THREE.Group;
  ledMeshes: THREE.Mesh[];
}

/**
 * Creates the multi-faceted segmented white ceramic anterior quad armor plate.
 * Features:
 * - Controlled athletic taper: broader at upper thigh, tapering gracefully toward knee
 * - Aerodynamic central keel ridge with 35° chamfered lateral/medial facets
 * - Open suprapatellar articulation arch leaving generous clearance above the knee
 * - Substantial composite armor thickness with precision bevels
 */
function createSegmentedAnteriorArmorGeometry(
  widthTop: number,
  widthBottom: number,
  length: number,
  thickness: number,
  keelProtrusion: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfWT = widthTop * 0.5;
  const halfWB = widthBottom * 0.5;
  const halfL = length * 0.5;

  // Engineered quad plate silhouette with controlled taper and suprapatellar arch
  shape.moveTo(0, halfL);
  shape.quadraticCurveTo(halfWT * 0.55, halfL - 0.005, halfWT * 0.90, halfL - 0.018);
  shape.quadraticCurveTo(halfWT * 1.04, halfL * 0.35, halfWT * 0.96, 0);
  shape.quadraticCurveTo(halfWT * 0.88, -halfL * 0.45, halfWB * 1.06, -halfL * 0.78);
  shape.lineTo(halfWB, -halfL);
  // Suprapatellar articulation arch - curves upward to guarantee knee flexion clearance
  shape.quadraticCurveTo(halfWB * 0.45, -halfL + 0.020, 0, -halfL + 0.022);
  shape.quadraticCurveTo(-halfWB * 0.45, -halfL + 0.020, -halfWB, -halfL);
  // Symmetrical return
  shape.lineTo(-halfWB * 1.06, -halfL * 0.78);
  shape.quadraticCurveTo(-halfWT * 0.88, -halfL * 0.45, -halfWT * 0.96, 0);
  shape.quadraticCurveTo(-halfWT * 1.04, halfL * 0.35, -halfWT * 0.90, -halfL * 0.018);
  shape.quadraticCurveTo(-halfWT * 0.55, halfL - 0.005, 0, halfL);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0042,
    bevelSize: 0.0034,
    bevelSegments: 4,
    curveSegments: 28,
  });
  geo.center();

  // Multi-faceted 3D Sculpting:
  // 1. Central longitudinal keel ridge peaking along x = 0
  // 2. Chamfered lateral facets
  // 3. Flank curvature wrapping backward toward the structural frame
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    if (z > 0) {
      const nx = Math.min(1.0, Math.abs(x) / halfWT);
      const keel = (1.0 - Math.pow(nx, 1.35)) * keelProtrusion;
      const yNorm = (y + halfL) / length;
      const muscleBulge = Math.sin(yNorm * Math.PI * 0.92) * 0.006;
      const flankWrap = -Math.pow(nx, 1.8) * 0.008;
      pos.setZ(i, z + keel + muscleBulge + flankWrap);
    } else {
      const nx = Math.min(1.0, Math.abs(x) / halfWT);
      pos.setZ(i, z - Math.pow(nx, 2.0) * 0.004);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the sculpted lateral armor cowl (Vastus Lateralis).
 */
function createLateralCowlGeometry(
  length: number,
  width: number,
  thickness: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfW = width * 0.5;
  const halfL = length * 0.5;

  shape.moveTo(-halfW * 0.70, halfL);
  shape.lineTo(halfW * 0.70, halfL * 0.88);
  shape.quadraticCurveTo(halfW * 1.02, 0, halfW * 0.65, -halfL * 0.85);
  shape.lineTo(-halfW * 0.70, -halfL);
  shape.quadraticCurveTo(-halfW * 1.02, 0, -halfW * 0.70, halfL);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0032,
    bevelSize: 0.0026,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.center();
  return geo;
}

/**
 * REBUILDS THE VISIBLE THIGH (RULES #1, #2, #3):
 *
 *   HIP MOUNT YOKE
 *          │
 *          ▼
 * ┌────────────────────────┐
 * │ UPPER THIGH COLLAR     │ (Titanium Socket Flange, Bolts, Trochanter Shell)
 * └──────────┬─────────────┘
 *            │
 * ┌──────────▼─────────────┐
 * │ STRUCTURAL FEMUR CHASSIS│ (Titanium Spine, Transverse Ribs, Distal Fork)
 * └──────────┬─────────────┘
 *            │
 *       ┌────▼────┐
 *       │  ARMOR  │ (Segmented White Ceramic Quad Plate & Flank Cowls)
 *       │  SHELL  │ (Mounted around chassis; exposes ~60mm frame & knee clearance)
 *       └────┬────┘
 *            │
 *            ▼
 *       KNEE JOINT
 */
export function createThigh(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ThighNodes {
  const thighGroup = new THREE.Group();
  thighGroup.name = side === -1 ? 'LeftThigh' : 'RightThigh';

  const cfg = LEG_CONFIG.thigh;
  const ledMeshes: THREE.Mesh[] = [];

  // Group containing the load-bearing titanium frame components
  const frameGroup = new THREE.Group();
  frameGroup.name = side === -1 ? 'ThighFrame_L' : 'ThighFrame_R';
  thighGroup.add(frameGroup);

  // Group containing secondary static armor parts
  const staticArmorGroup = new THREE.Group();
  staticArmorGroup.name = side === -1 ? 'ThighStaticArmorGroup_L' : 'ThighStaticArmorGroup_R';

  // =========================================================================
  // 1. ENGINEERED UPPER THIGH COLLAR (Direct Mechanical Bridge from Hip Mount)
  // =========================================================================

  // A. Titanium Receiving Socket Flange (Bolts flush to Hip Mount Flange)
  const collarSocketGeo = new THREE.CylinderGeometry(
    cfg.frame.upperCollarRadius * 1.08,
    cfg.frame.upperCollarRadius * 1.02,
    cfg.frame.upperCollarHeight * 0.45,
    28
  );
  const collarSocket = new THREE.Mesh(collarSocketGeo, materials.joint);
  collarSocket.position.set(0, -cfg.frame.upperCollarHeight * 0.22, 0);
  collarSocket.castShadow = true;
  collarSocket.receiveShadow = true;
  frameGroup.add(collarSocket);

  // Perimeter coupling bolts through the receiving flange
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.004, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      Math.cos(angle) * (cfg.frame.upperCollarRadius * 0.96),
      -0.002,
      Math.sin(angle) * (cfg.frame.upperCollarRadius * 0.96)
    );
    frameGroup.add(bolt);
  }

  // B. Lower Clamping Sleeve (Clamps the titanium femur spine)
  const lowerCollarGeo = new THREE.CylinderGeometry(
    cfg.frame.upperCollarRadius * 0.98,
    cfg.frame.upperCollarRadius * 0.92,
    cfg.frame.upperCollarHeight * 0.55,
    28
  );
  const lowerCollar = new THREE.Mesh(lowerCollarGeo, materials.joint);
  lowerCollar.position.set(0, -cfg.frame.upperCollarHeight * 0.72, 0);
  lowerCollar.castShadow = true;
  lowerCollar.receiveShadow = true;
  frameGroup.add(lowerCollar);

  // Structural diagonal side gussets (outriggers transferring torque to femur flanks)
  for (const bSide of [-1, 1]) {
    const gussetGeo = new THREE.BoxGeometry(0.006, 0.024, 0.018);
    const gusset = new THREE.Mesh(gussetGeo, materials.joint);
    gusset.position.set(
      bSide * (cfg.frame.upperCollarRadius * 0.85),
      -cfg.frame.upperCollarHeight * 0.65,
      0
    );
    gusset.castShadow = true;
    frameGroup.add(gusset);
  }

  // =========================================================================
  // 2. CENTRAL TITANIUM BOX-SECTION BACKBONE SPINE
  // =========================================================================
  const spineGeo = new THREE.BoxGeometry(
    cfg.frame.spineWidth,
    cfg.length * 0.80,
    cfg.frame.spineDepth
  );
  const spineMesh = new THREE.Mesh(spineGeo, materials.joint);
  spineMesh.position.set(0, -cfg.length * 0.45, 0);
  spineMesh.castShadow = true;
  spineMesh.receiveShadow = true;
  frameGroup.add(spineMesh);

  // CNC transverse reinforcement bulkheads along the femur spine
  for (const factor of [0.18, 0.36, 0.54, 0.72]) {
    const ribGeo = new THREE.BoxGeometry(
      cfg.frame.spineWidth * 1.25,
      0.007,
      cfg.frame.spineDepth * 1.15
    );
    const rib = new THREE.Mesh(ribGeo, materials.joint);
    rib.position.set(0, -cfg.length * factor, 0);
    rib.castShadow = true;
    frameGroup.add(rib);
  }

  // =========================================================================
  // 3. DISTAL STRUCTURAL CONDYLE FORK (Forms Upper Half of Knee Joint)
  // Heavy titanium fork tines descending directly to the knee pivot axis
  // =========================================================================
  for (const forkSide of [-1, 1]) {
    const tineGeo = new THREE.BoxGeometry(
      0.010,
      cfg.frame.lowerForkLength,
      cfg.frame.lowerForkDepth
    );
    const tine = new THREE.Mesh(tineGeo, materials.joint);
    tine.position.set(
      forkSide * (cfg.frame.lowerForkWidth * 0.5),
      -cfg.length + cfg.frame.lowerForkLength * 0.45,
      0
    );
    tine.castShadow = true;
    tine.receiveShadow = true;
    frameGroup.add(tine);

    // Cross-reinforcement gusset bracing tine to femur spine
    const gussetGeo = new THREE.BoxGeometry(0.014, 0.018, 0.018);
    const gusset = new THREE.Mesh(gussetGeo, materials.joint);
    gusset.position.set(
      forkSide * (cfg.frame.lowerForkWidth * 0.35),
      -cfg.length + cfg.frame.lowerForkLength * 0.85,
      0
    );
    frameGroup.add(gusset);

    // Bearing boss ring at the fork tip
    const bossGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.012, 16);
    const boss = new THREE.Mesh(bossGeo, materials.joint);
    boss.rotation.z = Math.PI / 2;
    boss.position.set(
      forkSide * (cfg.frame.lowerForkWidth * 0.5),
      -cfg.length + 0.006,
      0
    );
    frameGroup.add(boss);
  }

  // Armor mounting standoffs/bosses along the spine
  for (const bY of [-cfg.length * 0.22, -cfg.length * 0.48, -cfg.length * 0.68]) {
    const bossGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.018, 12);
    const boss = new THREE.Mesh(bossGeo, materials.joint);
    boss.rotation.x = Math.PI / 2;
    boss.position.set(0, bY, cfg.frame.spineDepth * 0.5 + 0.005);
    frameGroup.add(boss);
  }

  const mergedFrame = mergeGroupMeshesByMaterial(
    frameGroup,
    materials.joint,
    side === -1 ? 'ThighFrame_Merged_L' : 'ThighFrame_Merged_R',
    true
  ) || spineMesh;

  // =========================================================================
  // 4. ENGINEERED WHITE CERAMIC TROCHANTER SHELL COLLAR
  // Sculpted transition cowl with beveled top rim cupping the titanium socket
  // =========================================================================
  const trochanterShape = new THREE.Shape();
  const tR = cfg.frame.upperCollarRadius * 1.15;
  trochanterShape.absarc(0, 0, tR, 0, Math.PI * 2, false);
  const trochanterHole = new THREE.Path();
  trochanterHole.absarc(0, 0, cfg.frame.upperCollarRadius * 1.02, 0, Math.PI * 2, true);
  trochanterShape.holes.push(trochanterHole);

  const trochanterGeo = new THREE.ExtrudeGeometry(trochanterShape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.0035,
    bevelSize: 0.0028,
    bevelSegments: 3,
    curveSegments: 28,
  });
  trochanterGeo.center();

  const trochanterHood = new THREE.Mesh(trochanterGeo, materials.armor);
  trochanterHood.name = side === -1 ? 'TrochanterHood_L' : 'TrochanterHood_R';
  trochanterHood.rotation.x = Math.PI / 2;
  trochanterHood.position.set(0, -cfg.frame.upperCollarHeight * 0.55, 0);
  trochanterHood.castShadow = true;
  staticArmorGroup.add(trochanterHood);

  // =========================================================================
  // 5. SEGMENTED SCULPTED WHITE CERAMIC ANTERIOR QUAD ARMOR
  // Segmented length: leaves ~60mm of visible frame & clearance above knee!
  // =========================================================================
  const antGeo = createSegmentedAnteriorArmorGeometry(
    cfg.anteriorArmor.widthTop,
    cfg.anteriorArmor.widthBottom,
    cfg.anteriorArmor.length,
    cfg.anteriorArmor.thickness,
    cfg.anteriorArmor.keelProtrusion
  );
  const anteriorArmor = new THREE.Mesh(antGeo, materials.armor);
  anteriorArmor.name = side === -1 ? 'ThighAnteriorArmor_L' : 'ThighAnteriorArmor_R';
  // Positioned over the spine standoffs, leaving upper collar and lower fork exposed
  anteriorArmor.position.set(
    0,
    -cfg.length * 0.48,
    cfg.frame.spineDepth * 0.5 + cfg.anteriorArmor.thickness * 0.4
  );
  anteriorArmor.castShadow = true;
  anteriorArmor.receiveShadow = true;
  thighGroup.add(anteriorArmor);

  // =========================================================================
  // 6. SCULPTED LATERAL ARMOR COWL (Vastus Lateralis)
  // Mounted flush to outer flank, preserving visible structural edges
  // =========================================================================
  const latGeo = createLateralCowlGeometry(
    cfg.lateralArmor.cowlLength,
    cfg.lateralArmor.width,
    cfg.lateralArmor.thickness
  );
  const lateralArmor = new THREE.Mesh(latGeo, materials.armor);
  lateralArmor.name = side === -1 ? 'ThighLateralArmor_L' : 'ThighLateralArmor_R';
  lateralArmor.position.set(
    side * (cfg.frame.spineWidth * 0.5 + cfg.lateralArmor.thickness * 0.5),
    -cfg.length * 0.48,
    0.002
  );
  lateralArmor.rotation.y = side * (Math.PI / 2 - 0.12);
  lateralArmor.castShadow = true;
  lateralArmor.receiveShadow = true;
  thighGroup.add(lateralArmor);

  // Recessed purple neon LED conduit along the lateral armor edge
  const ledGeo = new THREE.BoxGeometry(cfg.ledStrip.width, cfg.ledStrip.length, cfg.ledStrip.depth);
  const ledStrip = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledStrip.name = side === -1 ? 'ThighLedStrip_L' : 'ThighLedStrip_R';
  ledStrip.position.set(
    side * (cfg.frame.spineWidth * 0.5 + cfg.lateralArmor.thickness * 0.8),
    -cfg.length * 0.48,
    0.004
  );
  thighGroup.add(ledStrip);
  ledMeshes.push(ledStrip);

  // Subtle bloom glow
  const bloomGeo = new THREE.BoxGeometry(
    cfg.ledStrip.width * 2.0,
    cfg.ledStrip.length,
    cfg.ledStrip.depth * 1.5
  );
  const bloomMesh = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomMesh.position.copy(ledStrip.position);
  thighGroup.add(bloomMesh);

  // =========================================================================
  // 7. MEDIAL PROTECTOR PLATE
  // Preserves inner leg clearance while shielding internal wiring
  // =========================================================================
  const medGeo = createLateralCowlGeometry(
    cfg.medialArmor.cowlLength,
    cfg.medialArmor.width,
    cfg.medialArmor.thickness
  );
  const medialArmor = new THREE.Mesh(medGeo, materials.armor);
  medialArmor.name = side === -1 ? 'ThighMedialArmor_L' : 'ThighMedialArmor_R';
  medialArmor.position.set(
    -side * (cfg.frame.spineWidth * 0.5 + cfg.medialArmor.thickness * 0.5),
    -cfg.length * 0.48,
    0.002
  );
  medialArmor.rotation.y = -side * (Math.PI / 2 - 0.12);
  staticArmorGroup.add(medialArmor);

  // =========================================================================
  // 8. POSTERIOR HAMSTRING COVER PLATE
  // =========================================================================
  const postShape = new THREE.Shape();
  const postH = cfg.anteriorArmor.length * 0.38;
  postShape.moveTo(-0.020, postH);
  postShape.lineTo(0.020, postH);
  postShape.lineTo(0.016, -postH);
  postShape.lineTo(-0.016, -postH);
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
  posteriorPlate.position.set(0, -cfg.length * 0.48, -cfg.frame.spineDepth * 0.5 - 0.005);
  staticArmorGroup.add(posteriorPlate);

  const mergedStaticArmor = mergeGroupMeshesByMaterial(
    staticArmorGroup,
    materials.armor,
    side === -1 ? 'ThighStaticArmor_L' : 'ThighStaticArmor_R',
    false,
    true
  ) || trochanterHood;
  thighGroup.add(mergedStaticArmor);

  // =========================================================================
  // 9. DISTAL KNEE ARTICULATION PIVOT (Attached hierarchically at knee axis)
  // =========================================================================
  const kneePivot = new THREE.Group();
  kneePivot.name = side === -1 ? 'KneePivot_L' : 'KneePivot_R';
  kneePivot.position.set(0, -cfg.length, 0);
  thighGroup.add(kneePivot);

  return {
    group: thighGroup,
    femurSkeleton: mergedFrame,
    trochanterHood,
    anteriorArmor,
    lateralArmor,
    medialArmor,
    posteriorPlate,
    ledStrip,
    kneePivot,
    ledMeshes,
  };
}
