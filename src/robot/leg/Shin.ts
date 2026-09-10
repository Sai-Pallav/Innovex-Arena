import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { LEG_CONFIG } from './LegConfig';

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
 * Creates the sculpted white ceramic anterior shin armor plate.
 * Prominent aerodynamic keel crest running down the shinbone, tapering toward the ankle.
 */
function createAnteriorKeelGeometry(
  widthTop: number,
  widthBottom: number,
  length: number,
  thickness: number,
  keelProtrusion: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfWT = widthTop * 0.5;
  const halfWB = widthBottom * 0.5;

  // Streamlined tapered contour
  shape.moveTo(0, length * 0.5);
  shape.quadraticCurveTo(halfWT * 0.7, length * 0.48, halfWT, length * 0.38);
  shape.lineTo(halfWT * 0.85, -length * 0.15);
  shape.quadraticCurveTo(halfWB * 1.15, -length * 0.38, halfWB, -length * 0.48);
  shape.quadraticCurveTo(0, -length * 0.50, -halfWB, -length * 0.48);
  shape.quadraticCurveTo(-halfWB * 1.15, -length * 0.38, -halfWT * 0.85, -length * 0.15);
  shape.lineTo(-halfWT, length * 0.38);
  shape.quadraticCurveTo(-halfWT * 0.7, length * 0.48, 0, length * 0.5);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0035,
    bevelSize: 0.0028,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.center();

  // Sculpt forward keel ridge: vertices along center x = 0 thrust forward
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (z > 0) {
      // Keel ridge is sharpest in upper 2/3 of shin and blends toward ankle
      const keelFactor = Math.max(0, 1.0 - Math.abs(x) / halfWT);
      const yNormalized = (y + length * 0.5) / length; // 0 at bottom, 1 at top
      const keelCurve = keelFactor * keelProtrusion * Math.sin(yNormalized * Math.PI * 0.85 + 0.15);
      pos.setZ(i, z + keelCurve);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the posterior calf muscle armor cowl.
 * Sculpted aerodynamic fairing with recesses for ventilation louvers.
 */
function createPosteriorCalfGeometry(
  width: number,
  height: number,
  depth: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfW = width * 0.5;
  const halfH = height * 0.5;

  // Athletic calf contour
  shape.moveTo(-halfW * 0.7, halfH);
  shape.lineTo(halfW * 0.7, halfH);
  shape.quadraticCurveTo(halfW, halfH * 0.5, halfW * 0.95, 0);
  shape.quadraticCurveTo(halfW * 0.7, -halfH * 0.6, halfW * 0.45, -halfH);
  shape.lineTo(-halfW * 0.45, -halfH);
  shape.quadraticCurveTo(-halfW * 0.7, -halfH * 0.6, -halfW * 0.95, 0);
  shape.quadraticCurveTo(-halfW, halfH * 0.5, -halfW * 0.7, halfH);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.0025,
    bevelSegments: 2,
    curveSegments: 20,
  });
  geo.center();

  // Curvature for muscular calf profile
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
 * Creates the complete Shin (Lower Leg & Calf) assembly:
 * - Structural dark titanium tibia core and lateral fibula support
 * - Sculpted white ceramic anterior keel armor with longitudinal purple LED strip
 * - Posterior calf muscle armor fairing with mechanical ventilation louvers
 * - Distal ankle joint mounting interface
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

  // ==========================================
  // 1. CENTRAL TIBIA SKELETON (Dark Titanium Core)
  // ==========================================
  const tibiaGeo = new THREE.CylinderGeometry(
    cfg.skeletonRadius * 1.12,
    cfg.skeletonRadius * 0.88,
    cfg.length * 0.94,
    24
  );
  const tibiaSkeleton = new THREE.Mesh(tibiaGeo, materials.joint);
  tibiaSkeleton.name = side === -1 ? 'TibiaSkeleton_L' : 'TibiaSkeleton_R';
  tibiaSkeleton.position.set(0, -cfg.length * 0.5, 0);
  tibiaSkeleton.castShadow = true;
  tibiaSkeleton.receiveShadow = true;
  shinGroup.add(tibiaSkeleton);

  // Lateral Fibula Strut
  const fibulaGeo = new THREE.CylinderGeometry(0.0045, 0.0035, cfg.length * 0.78, 12);
  const fibulaStrut = new THREE.Mesh(fibulaGeo, materials.joint);
  fibulaStrut.name = side === -1 ? 'FibulaStrut_L' : 'FibulaStrut_R';
  fibulaStrut.position.set(side * 0.024, -cfg.length * 0.48, -0.004);
  fibulaStrut.castShadow = true;
  shinGroup.add(fibulaStrut);

  // ==========================================
  // 2. SCULPTED ANTERIOR SHIN KEEL ARMOR PLATE
  // ==========================================
  const keelGeo = createAnteriorKeelGeometry(
    cfg.anteriorKeel.widthTop,
    cfg.anteriorKeel.widthBottom,
    cfg.length * 0.88,
    cfg.anteriorKeel.thickness,
    cfg.anteriorKeel.keelProtrusion
  );
  const anteriorKeelArmor = new THREE.Mesh(keelGeo, materials.armor);
  anteriorKeelArmor.name = side === -1 ? 'ShinAnteriorKeel_L' : 'ShinAnteriorKeel_R';
  anteriorKeelArmor.position.set(0, -cfg.length * 0.47, 0.022);
  anteriorKeelArmor.castShadow = true;
  anteriorKeelArmor.receiveShadow = true;
  shinGroup.add(anteriorKeelArmor);

  // ==========================================
  // 3. LONGITUDINAL PURPLE NEON LED STRIP (Along front keel)
  // ==========================================
  const ledGeo = new THREE.BoxGeometry(cfg.ledStrip.width, cfg.ledStrip.length, cfg.ledStrip.depth);
  const ledStrip = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledStrip.name = side === -1 ? 'ShinLedStrip_L' : 'ShinLedStrip_R';
  ledStrip.position.set(0, -cfg.length * 0.47, 0.038);
  shinGroup.add(ledStrip);
  ledMeshes.push(ledStrip);

  // Subtle bloom glow mesh
  const bloomGeo = new THREE.BoxGeometry(cfg.ledStrip.width * 2.2, cfg.ledStrip.length, cfg.ledStrip.depth * 1.5);
  const bloomMesh = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomMesh.position.copy(ledStrip.position);
  shinGroup.add(bloomMesh);

  // ==========================================
  // 4. POSTERIOR CALF MUSCLE ARMOR FAIRING
  // ==========================================
  const calfGeo = createPosteriorCalfGeometry(
    cfg.posteriorCalf.width,
    cfg.posteriorCalf.height,
    cfg.posteriorCalf.depth
  );
  const posteriorCalfArmor = new THREE.Mesh(calfGeo, materials.armor);
  posteriorCalfArmor.name = side === -1 ? 'CalfArmor_L' : 'CalfArmor_R';
  posteriorCalfArmor.position.set(0, -cfg.length * 0.36, -0.028);
  posteriorCalfArmor.rotation.y = Math.PI;
  posteriorCalfArmor.castShadow = true;
  posteriorCalfArmor.receiveShadow = true;
  shinGroup.add(posteriorCalfArmor);

  // ==========================================
  // 5. CALF COOLING VENTS & MICRO-THRUSTER LOUVERS
  // ==========================================
  const ventCount = cfg.posteriorCalf.ventCount;
  for (let i = 0; i < ventCount; i++) {
    const yOff = -cfg.length * 0.30 - i * 0.018;

    // Dark titanium louver blade angled downward
    const louverGeo = new THREE.BoxGeometry(cfg.posteriorCalf.ventWidth, cfg.posteriorCalf.ventHeight, 0.006);
    const louver = new THREE.Mesh(louverGeo, materials.joint);
    louver.position.set(0, yOff, -0.048);
    louver.rotation.x = -0.28;
    louver.castShadow = true;
    shinGroup.add(louver);
    calfVents.push(louver);

    // Internal violet glow slit inside each louver
    const glowGeo = new THREE.BoxGeometry(cfg.posteriorCalf.ventWidth * 0.75, 0.0016, 0.002);
    const glowMesh = new THREE.Mesh(glowGeo, materials.purpleEmissive);
    glowMesh.position.set(0, yOff - 0.001, -0.046);
    shinGroup.add(glowMesh);
    ledMeshes.push(glowMesh);
  }

  // ==========================================
  // 6. LOWER DISTAL ANKLE COLLAR
  // ==========================================
  const collarGeo = new THREE.CylinderGeometry(0.024, 0.026, 0.016, 24);
  const lowerCollar = new THREE.Mesh(collarGeo, materials.joint);
  lowerCollar.position.set(0, -cfg.length * 0.94, 0);
  lowerCollar.castShadow = true;
  shinGroup.add(lowerCollar);

  // Concentric accent ring on lower ankle collar
  const collarRingGeo = new THREE.TorusGeometry(0.025, 0.0016, 8, 24);
  const collarRing = new THREE.Mesh(collarRingGeo, materials.purpleEmissive);
  collarRing.rotation.x = Math.PI / 2;
  collarRing.position.set(0, -cfg.length * 0.94, 0);
  shinGroup.add(collarRing);
  ledMeshes.push(collarRing);

  // ==========================================
  // 7. ANKLE ARTICULATION PIVOT
  // ==========================================
  const anklePivot = new THREE.Group();
  anklePivot.name = side === -1 ? 'LeftAnklePivot' : 'RightAnklePivot';
  anklePivot.position.set(0, -cfg.length, 0);
  shinGroup.add(anklePivot);

  return {
    group: shinGroup,
    tibiaSkeleton,
    fibulaStrut,
    anteriorKeelArmor,
    posteriorCalfArmor,
    calfVents,
    ledStrip,
    anklePivot,
    ledMeshes,
  };
}
