import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { LEG_CONFIG } from './LegConfig';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface ShinNodes {
  group: THREE.Group;
  tibiaSkeleton: THREE.Mesh;
  fibulaStrut: THREE.Mesh;
  anteriorKeelArmor: THREE.Mesh;
  posteriorCalfArmor: THREE.Mesh;
  calfVents: THREE.Mesh[];
  ledStrip: THREE.Mesh;
  anklePivot: THREE.Group;
  ledMeshes: THREE.Mesh[];
}

/**
 * Creates the segmented white ceramic anterior shin keel armor gauntlet.
 * Features:
 * - Controlled athletic taper toward the ankle
 * - Sharp central deflector crest with chamfered lateral/medial facets
 * - Open upper articulation shelf leaving ~45mm of clearance below the knee
 * - Substantial composite armor thickness with precision bevels
 */
function createSegmentedKeelGeometry(
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

  // Streamlined tapered robotic shin contour with articulation-aware upper shelf
  shape.moveTo(0, halfL);
  shape.quadraticCurveTo(halfWT * 0.60, halfL - 0.005, halfWT, halfL * 0.75);
  shape.lineTo(halfWT * 0.85, -halfL * 0.20);
  shape.quadraticCurveTo(halfWB * 1.15, -halfL * 0.55, halfWB, -halfL * 0.88);
  shape.lineTo(halfWB * 0.85, -halfL);
  shape.lineTo(-halfWB * 0.85, -halfL);
  shape.lineTo(-halfWB, -halfL * 0.88);
  shape.quadraticCurveTo(-halfWB * 1.15, -halfL * 0.55, -halfWT * 0.85, -halfL * 0.20);
  shape.lineTo(-halfWT, halfL * 0.75);
  shape.quadraticCurveTo(-halfWT * 0.60, halfL - 0.005, 0, halfL);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0038,
    bevelSize: 0.0030,
    bevelSegments: 4,
    curveSegments: 24,
  });
  geo.center();

  // Multi-faceted 3D Sculpting:
  // Forward keel ridge: vertices along center x = 0 thrust forward with sharp chamfered flanks
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (z > 0) {
      const nx = Math.min(1.0, Math.abs(x) / halfWT);
      const keelFactor = Math.pow(1.0 - nx, 1.30);
      const yNorm = (y + halfL) / length;
      const keelCurve = keelFactor * keelProtrusion * (0.50 + 0.50 * Math.sin(yNorm * Math.PI * 0.90));
      const flankSlope = -Math.pow(nx, 1.8) * 0.006;
      pos.setZ(i, z + keelCurve + flankSlope);
    } else {
      const nx = Math.min(1.0, Math.abs(x) / halfWT);
      pos.setZ(i, z - Math.pow(nx, 2.0) * 0.004);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the posterior calf muscle armor cowl.
 */
function createPosteriorCalfGeometry(
  width: number,
  height: number,
  depth: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfW = width * 0.5;
  const halfH = height * 0.5;

  shape.moveTo(-halfW * 0.72, halfH);
  shape.lineTo(halfW * 0.72, halfH);
  shape.quadraticCurveTo(halfW * 1.02, halfH * 0.50, halfW * 0.94, 0);
  shape.quadraticCurveTo(halfW * 0.72, -halfH * 0.60, halfW * 0.45, -halfH);
  shape.lineTo(-halfW * 0.45, -halfH);
  shape.quadraticCurveTo(-halfW * 0.72, -halfH * 0.60, -halfW * 0.94, 0);
  shape.quadraticCurveTo(-halfW * 1.02, halfH * 0.50, -halfW * 0.72, halfH);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.0034,
    bevelSize: 0.0026,
    bevelSegments: 3,
    curveSegments: 20,
  });
  geo.center();

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (z > 0) {
      const calfBulge = Math.sin(((y + halfH) / height) * Math.PI) * 0.008;
      pos.setZ(i, z + calfBulge);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * REBUILDS THE SHIN (LOWER LEG & CALF) WITH AUTHENTIC MECHANICAL CONTINUITY (RULES #6 & #7):
 *
 *   KNEE LOWER BRACKET (Tibial Double-Shear Clevis)
 *          │
 *          ▼
 *   TIBIAL PLATEAU STRUCTURAL COLLAR (Machined Titanium Receiver Block & Bolts)
 *          │
 *          ▼
 *   SHIN STRUCTURAL CORE (Titanium Tibia Spine & Fibula Diagonal Bracing)
 *          │
 *          ▼
 *   ARMOR MOUNTING STANDOFFS (Machined Bosses)
 *          │
 *          ▼
 *   WHITE SHIN ARMOR (Segmented Keel Gauntlet & Calf Cowl)
 *          │
 *          ▼
 *   ANKLE INTERFACE
 */
export function createShin(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ShinNodes {
  const shinGroup = new THREE.Group();
  shinGroup.name = side === -1 ? 'LeftShin' : 'RightShin';

  const cfg = LEG_CONFIG.shin;
  const ledMeshes: THREE.Mesh[] = [];
  const calfVents: THREE.Mesh[] = [];

  // Group containing the load-bearing titanium frame components
  const frameGroup = new THREE.Group();
  frameGroup.name = side === -1 ? 'ShinFrame_L' : 'ShinFrame_R';
  shinGroup.add(frameGroup);

  // =========================================================================
  // 1. KNEE-TO-SHIN STRUCTURAL INTERFACE (Tibial Plateau Collar & Receiver)
  // Visible physical bracket connecting directly into the knee clevis
  // =========================================================================
  const plateauGeo = new THREE.BoxGeometry(
    cfg.frame.upperPlateauWidth,
    cfg.frame.upperPlateauHeight,
    cfg.frame.upperPlateauDepth
  );
  const tibialPlateau = new THREE.Mesh(plateauGeo, materials.joint);
  tibialPlateau.name = side === -1 ? 'TibialPlateau_L' : 'TibialPlateau_R';
  tibialPlateau.position.set(0, -cfg.frame.upperPlateauHeight * 0.5, 0);
  tibialPlateau.castShadow = true;
  tibialPlateau.receiveShadow = true;
  frameGroup.add(tibialPlateau);

  // Clevis receiver socket lip atop the plateau
  const lipGeo = new THREE.BoxGeometry(
    cfg.frame.upperPlateauWidth * 1.04,
    0.005,
    cfg.frame.upperPlateauDepth * 1.04
  );
  const plateauLip = new THREE.Mesh(lipGeo, materials.joint);
  plateauLip.position.set(0, -0.0025, 0);
  plateauLip.castShadow = true;
  frameGroup.add(plateauLip);

  // 4 vertical mounting bolts receiving the knee clevis base
  for (let bx of [-0.014, 0.014]) {
    for (let bz of [-0.010, 0.010]) {
      const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.004, 6);
      const bolt = new THREE.Mesh(boltGeo, materials.joint);
      bolt.position.set(bx, 0.001, bz);
      frameGroup.add(bolt);
    }
  }

  // Bilateral load-transfer gussets on plateau flanks
  for (const pSide of [-1, 1]) {
    const gussetGeo = new THREE.BoxGeometry(0.006, 0.020, 0.018);
    const gusset = new THREE.Mesh(gussetGeo, materials.joint);
    gusset.position.set(
      pSide * (cfg.frame.upperPlateauWidth * 0.45),
      -cfg.frame.upperPlateauHeight * 0.65,
      0
    );
    gusset.castShadow = true;
    frameGroup.add(gusset);
  }

  // =========================================================================
  // 2. CENTRAL TIBIA STRUCTURAL SPINE (Load-Bearing Backbone)
  // =========================================================================
  const spineGeo = new THREE.BoxGeometry(
    cfg.frame.spineWidth,
    cfg.length * 0.88,
    cfg.frame.spineDepth
  );
  const tibiaSkeleton = new THREE.Mesh(spineGeo, materials.joint);
  tibiaSkeleton.name = side === -1 ? 'TibiaSkeleton_L' : 'TibiaSkeleton_R';
  tibiaSkeleton.position.set(0, -cfg.length * 0.48, 0);
  tibiaSkeleton.castShadow = true;
  tibiaSkeleton.receiveShadow = true;
  frameGroup.add(tibiaSkeleton);

  // CNC Reinforcement bulkheads along the tibia spine
  for (const factor of [0.22, 0.48, 0.74]) {
    const ringGeo = new THREE.BoxGeometry(
      cfg.frame.spineWidth * 1.25,
      0.006,
      cfg.frame.spineDepth * 1.20
    );
    const ring = new THREE.Mesh(ringGeo, materials.joint);
    ring.position.set(0, -cfg.length * factor, 0);
    ring.castShadow = true;
    frameGroup.add(ring);
  }

  // Lateral Fibula Strut & Triangular Reinforcement Bracing
  const fibulaGeo = new THREE.CylinderGeometry(0.0048, 0.0038, cfg.length * 0.76, 12);
  const fibulaStrut = new THREE.Mesh(fibulaGeo, materials.joint);
  fibulaStrut.name = side === -1 ? 'FibulaStrut_L' : 'FibulaStrut_R';
  fibulaStrut.position.set(side * 0.025, -cfg.length * 0.48, -0.003);
  fibulaStrut.castShadow = true;
  frameGroup.add(fibulaStrut);

  for (const factor of [0.30, 0.65]) {
    const braceGeo = new THREE.BoxGeometry(0.015, 0.005, 0.006);
    const brace = new THREE.Mesh(braceGeo, materials.joint);
    brace.position.set(side * 0.013, -cfg.length * factor, -0.002);
    frameGroup.add(brace);
  }

  // Armor mounting standoffs projecting forward from tibia spine
  for (const bY of [-cfg.length * 0.28, -cfg.length * 0.52, -cfg.length * 0.72]) {
    const bossGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.016, 12);
    const boss = new THREE.Mesh(bossGeo, materials.joint);
    boss.rotation.x = Math.PI / 2;
    boss.position.set(0, bY, cfg.frame.spineDepth * 0.5 + 0.005);
    frameGroup.add(boss);
  }

  // Distal Ankle Gauntlet Collar (Structural base meeting ankle pivot)
  const collarGeo = new THREE.CylinderGeometry(
    cfg.frame.lowerCollarRadius,
    cfg.frame.lowerCollarRadius * 1.08,
    0.016,
    24
  );
  const lowerCollar = new THREE.Mesh(collarGeo, materials.joint);
  lowerCollar.position.set(0, -cfg.length * 0.94, 0);
  lowerCollar.castShadow = true;
  frameGroup.add(lowerCollar);

  const mergedFrame = mergeGroupMeshesByMaterial(
    frameGroup,
    materials.joint,
    side === -1 ? 'ShinFrame_Merged_L' : 'ShinFrame_Merged_R',
    true
  ) || tibiaSkeleton;

  // Concentric accent ring on lower ankle collar
  const collarRingGeo = new THREE.TorusGeometry(cfg.frame.lowerCollarRadius * 1.05, 0.0016, 8, 24);
  const collarRing = new THREE.Mesh(collarRingGeo, materials.purpleEmissive);
  collarRing.rotation.x = Math.PI / 2;
  collarRing.position.set(0, -cfg.length * 0.94, 0);
  shinGroup.add(collarRing);
  ledMeshes.push(collarRing);

  // =========================================================================
  // 3. SEGMENTED SCULPTED ANTERIOR SHIN KEEL ARMOR
  // Segmented length leaves ~45mm of open articulation clearance below knee!
  // =========================================================================
  const keelGeo = createSegmentedKeelGeometry(
    cfg.anteriorKeel.widthTop,
    cfg.anteriorKeel.widthBottom,
    cfg.anteriorKeel.length,
    cfg.anteriorKeel.thickness,
    cfg.anteriorKeel.keelProtrusion
  );
  const anteriorKeelArmor = new THREE.Mesh(keelGeo, materials.armor);
  anteriorKeelArmor.name = side === -1 ? 'ShinAnteriorKeel_L' : 'ShinAnteriorKeel_R';
  // Mounted over the front of the tibia spine
  anteriorKeelArmor.position.set(
    0,
    -cfg.length * 0.48,
    cfg.frame.spineDepth * 0.5 + cfg.anteriorKeel.thickness * 0.4
  );
  anteriorKeelArmor.castShadow = true;
  anteriorKeelArmor.receiveShadow = true;
  shinGroup.add(anteriorKeelArmor);

  // Longitudinal purple neon LED strip along the front keel crest
  const ledGeo = new THREE.BoxGeometry(cfg.ledStrip.width, cfg.ledStrip.length, cfg.ledStrip.depth);
  const ledStrip = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledStrip.name = side === -1 ? 'ShinLedStrip_L' : 'ShinLedStrip_R';
  ledStrip.position.set(
    0,
    -cfg.length * 0.48,
    cfg.frame.spineDepth * 0.5 + cfg.anteriorKeel.thickness * 0.4 + 0.012
  );
  shinGroup.add(ledStrip);
  ledMeshes.push(ledStrip);

  const bloomGeo = new THREE.BoxGeometry(
    cfg.ledStrip.width * 2.0,
    cfg.ledStrip.length,
    cfg.ledStrip.depth * 1.5
  );
  const bloomMesh = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomMesh.position.copy(ledStrip.position);
  shinGroup.add(bloomMesh);

  // =========================================================================
  // 4. POSTERIOR CALF MUSCLE ARMOR FAIRING & COOLING LOUVERS
  // =========================================================================
  const calfGeo = createPosteriorCalfGeometry(
    cfg.posteriorCalf.width,
    cfg.posteriorCalf.height,
    cfg.posteriorCalf.depth
  );
  const posteriorCalfArmor = new THREE.Mesh(calfGeo, materials.armor);
  posteriorCalfArmor.name = side === -1 ? 'CalfArmor_L' : 'CalfArmor_R';
  posteriorCalfArmor.position.set(0, -cfg.length * 0.38, -cfg.frame.spineDepth * 0.5 - 0.008);
  posteriorCalfArmor.rotation.y = Math.PI;
  posteriorCalfArmor.castShadow = true;
  posteriorCalfArmor.receiveShadow = true;
  shinGroup.add(posteriorCalfArmor);

  // Calf cooling vents
  const ventCount = cfg.posteriorCalf.ventCount;
  const ventGroup = new THREE.Group();
  const ventGlowGroup = new THREE.Group();

  for (let i = 0; i < ventCount; i++) {
    const yOff = -cfg.length * 0.32 - i * 0.018;

    const louverGeo = new THREE.BoxGeometry(cfg.posteriorCalf.ventWidth, cfg.posteriorCalf.ventHeight, 0.006);
    const louver = new THREE.Mesh(louverGeo, materials.joint);
    louver.position.set(0, yOff, -cfg.frame.spineDepth * 0.5 - 0.024);
    louver.rotation.x = -0.28;
    louver.castShadow = true;
    ventGroup.add(louver);
    calfVents.push(louver);

    const glowGeo = new THREE.BoxGeometry(cfg.posteriorCalf.ventWidth * 0.75, 0.0014, 0.002);
    const glowMesh = new THREE.Mesh(glowGeo, materials.purpleEmissive);
    glowMesh.position.set(0, yOff - 0.001, -cfg.frame.spineDepth * 0.5 - 0.022);
    ventGlowGroup.add(glowMesh);
  }

  const mergedVents = mergeGroupMeshesByMaterial(
    ventGroup,
    materials.joint,
    side === -1 ? 'CalfVents_L' : 'CalfVents_R',
    true
  );
  if (mergedVents) {
    shinGroup.add(mergedVents);
  }

  const mergedGlow = mergeGroupMeshesByMaterial(
    ventGlowGroup,
    materials.purpleEmissive,
    side === -1 ? 'CalfGlows_L' : 'CalfGlows_R',
    false
  );
  if (mergedGlow) {
    shinGroup.add(mergedGlow);
    ledMeshes.push(mergedGlow);
  }

  // =========================================================================
  // 5. ANKLE ARTICULATION PIVOT (At distal end of shin)
  // =========================================================================
  const anklePivot = new THREE.Group();
  anklePivot.name = side === -1 ? 'LeftAnklePivot' : 'RightAnklePivot';
  anklePivot.position.set(0, -cfg.length, 0);
  shinGroup.add(anklePivot);

  return {
    group: shinGroup,
    tibiaSkeleton: mergedFrame,
    fibulaStrut: mergedFrame,
    anteriorKeelArmor,
    posteriorCalfArmor,
    calfVents,
    ledStrip,
    anklePivot,
    ledMeshes,
  };
}
