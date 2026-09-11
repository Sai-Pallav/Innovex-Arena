import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { LEG_CONFIG } from './LegConfig';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface KneeNodes {
  group: THREE.Group;
  shinPivot: THREE.Group;
  lateralDisc: THREE.Mesh;
  medialDisc: THREE.Mesh;
  accentRingLateral: THREE.Mesh;
  accentRingMedial: THREE.Mesh;
  patellaShield: THREE.Mesh;
  patellaLed?: THREE.Mesh;
  centralPin: THREE.Mesh;
  statorTeeth: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];
}

/**
 * Creates the sculpted white ceramic patellar knee guard shield.
 * Hexagonal / shield silhouette with central vertical crease and chamfered bevels.
 */
function createPatellaGeometry(
  width: number,
  height: number,
  thickness: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfW = width * 0.5;
  const halfH = height * 0.5;

  // Hexagonal shield profile
  shape.moveTo(0, halfH);
  shape.lineTo(halfW * 0.85, halfH * 0.65);
  shape.lineTo(halfW, -halfH * 0.20);
  shape.lineTo(halfW * 0.55, -halfH * 0.85);
  shape.lineTo(0, -halfH);
  shape.lineTo(-halfW * 0.55, -halfH * 0.85);
  shape.lineTo(-halfW, -halfH * 0.20);
  shape.lineTo(-halfW * 0.85, halfH * 0.65);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0035,
    bevelSize: 0.0028,
    bevelSegments: 3,
    curveSegments: 20,
  });
  geo.center();

  // 3D forward curvature and central vertical ridge
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (z > 0) {
      const ridge = (1.0 - Math.min(1.0, Math.abs(x) / halfW)) * 0.006;
      const verticalCurve = Math.cos((y / halfH) * (Math.PI * 0.4)) * 0.004;
      pos.setZ(i, z + ridge + verticalCurve);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the complete Knee Joint assembly:
 * - Dual-disc rotary condyle hinge mechanism (dark titanium)
 * - Concentric purple emissive accent rings on lateral disc faces
 * - Sculpted white ceramic outer caps
 * - Central transverse axle pin with hex fasteners
 * - Articulated floating patellar knee guard shield
 * - Articulated Shin Pivot for lower leg pitch rotation
 */
export function createKnee(
  side: -1 | 1,
  materials: RobotMaterialPalette
): KneeNodes {
  const kneeGroup = new THREE.Group();
  kneeGroup.name = side === -1 ? 'LeftKnee' : 'RightKnee';

  const cfg = LEG_CONFIG.knee;
  const ledMeshes: THREE.Mesh[] = [];
  const statorTeeth: THREE.Mesh[] = [];

  // Group containing stationary rotary condyle discs, axle, flanges, and stator teeth
  const condyleCoreGroup = new THREE.Group();
  condyleCoreGroup.name = side === -1 ? 'KneeCondyleCore_L' : 'KneeCondyleCore_R';
  kneeGroup.add(condyleCoreGroup);

  // ==========================================
  // 1. TRANSVERSE HINGE AXLE PIN (Central structural core)
  // ==========================================
  const pinGeo = new THREE.CylinderGeometry(
    cfg.centralAxleRadius,
    cfg.centralAxleRadius,
    cfg.centralAxleLength,
    24
  );
  const centralPin = new THREE.Mesh(pinGeo, materials.joint);
  centralPin.name = side === -1 ? 'KneeAxlePin_L' : 'KneeAxlePin_R';
  centralPin.rotation.z = Math.PI / 2;
  centralPin.castShadow = true;
  condyleCoreGroup.add(centralPin);

  // Hex end caps for the central axle
  for (const dir of [-1, 1]) {
    const capGeo = new THREE.CylinderGeometry(
      cfg.centralAxleRadius * 1.35,
      cfg.centralAxleRadius * 1.35,
      0.003,
      6
    );
    const cap = new THREE.Mesh(capGeo, materials.joint);
    cap.rotation.z = Math.PI / 2;
    cap.position.x = dir * (cfg.centralAxleLength * 0.5 + 0.0015);
    condyleCoreGroup.add(cap);
  }

  // ==========================================
  // 2. DUAL ROTARY CONDYLE DISCS (Lateral & Medial)
  // ==========================================
  const discGeo = new THREE.CylinderGeometry(
    cfg.discRadius,
    cfg.discRadius,
    cfg.discWidth,
    32
  );

  // Outer (lateral) rotary disc
  const lateralDisc = new THREE.Mesh(discGeo, materials.joint);
  lateralDisc.name = side === -1 ? 'KneeLateralDisc_L' : 'KneeLateralDisc_R';
  lateralDisc.rotation.z = Math.PI / 2;
  lateralDisc.position.x = side * (cfg.outerDiscSpacing * 0.5);
  lateralDisc.castShadow = true;
  lateralDisc.receiveShadow = true;
  condyleCoreGroup.add(lateralDisc);

  // Inner (medial) rotary disc
  const medialDisc = new THREE.Mesh(discGeo, materials.joint);
  medialDisc.name = side === -1 ? 'KneeMedialDisc_L' : 'KneeMedialDisc_R';
  medialDisc.rotation.z = Math.PI / 2;
  medialDisc.position.x = -side * (cfg.outerDiscSpacing * 0.5);
  medialDisc.castShadow = true;
  medialDisc.receiveShadow = true;
  condyleCoreGroup.add(medialDisc);

  // Bearing Race Flange on discs
  for (const discX of [side * (cfg.outerDiscSpacing * 0.5), -side * (cfg.outerDiscSpacing * 0.5)]) {
    const flangeGeo = new THREE.CylinderGeometry(
      cfg.discRadius * 1.05,
      cfg.discRadius * 1.05,
      0.0025,
      32
    );
    const flange = new THREE.Mesh(flangeGeo, materials.joint);
    flange.rotation.z = Math.PI / 2;
    flange.position.x = discX;
    condyleCoreGroup.add(flange);
  }

  // Stator teeth around lateral disc perimeter for mechanical intricacy
  const toothCount = 12;
  for (let i = 0; i < toothCount; i++) {
    const angle = (i / toothCount) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.0024, cfg.discWidth * 0.85, 0.0028);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      side * (cfg.outerDiscSpacing * 0.5),
      Math.cos(angle) * (cfg.discRadius * 1.02),
      Math.sin(angle) * (cfg.discRadius * 1.02)
    );
    tooth.rotation.x = -angle;
    condyleCoreGroup.add(tooth);
    statorTeeth.push(tooth);
  }

  const mergedCondyle = mergeGroupMeshesByMaterial(condyleCoreGroup, materials.joint, side === -1 ? 'KneeCondyleMesh_L' : 'KneeCondyleMesh_R', true) || centralPin;

  // ==========================================
  // 3. CONCENTRIC PURPLE EMISSIVE ACCENT RINGS
  // ==========================================
  const kneeAccentGroup = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(cfg.accentRingRadius, 0.0018, 10, 32);

  // Lateral accent ring
  const accentRingLateral = new THREE.Mesh(ringGeo, materials.purpleEmissive);
  accentRingLateral.name = side === -1 ? 'KneeAccentRingLat_L' : 'KneeAccentRingLat_R';
  accentRingLateral.rotation.y = Math.PI / 2;
  accentRingLateral.position.x = side * (cfg.outerDiscSpacing * 0.5 + cfg.discWidth * 0.5 + 0.001);
  kneeAccentGroup.add(accentRingLateral);

  // Medial accent ring
  const accentRingMedial = new THREE.Mesh(ringGeo, materials.purpleEmissive);
  accentRingMedial.name = side === -1 ? 'KneeAccentRingMed_L' : 'KneeAccentRingMed_R';
  accentRingMedial.rotation.y = Math.PI / 2;
  accentRingMedial.position.x = -side * (cfg.outerDiscSpacing * 0.5 + cfg.discWidth * 0.5 + 0.001);
  kneeAccentGroup.add(accentRingMedial);

  const mergedKneeAccents = mergeGroupMeshesByMaterial(kneeAccentGroup, materials.purpleEmissive, side === -1 ? 'KneeAccents_L' : 'KneeAccents_R', false, false) || accentRingLateral;
  kneeGroup.add(mergedKneeAccents);
  ledMeshes.push(mergedKneeAccents);

  // ==========================================
  // 4. SCULPTED WHITE CERAMIC OUTER CENTER CAPS
  // ==========================================
  const capGeo = new THREE.CylinderGeometry(
    cfg.centerCapRadius,
    cfg.centerCapRadius * 0.94,
    0.004,
    24
  );
  const centerCap = new THREE.Mesh(capGeo, materials.armor);
  centerCap.rotation.z = Math.PI / 2;
  centerCap.position.x = side * (cfg.outerDiscSpacing * 0.5 + cfg.discWidth * 0.5 + 0.003);
  centerCap.castShadow = true;
  kneeGroup.add(centerCap);

  // ==========================================
  // 5. ARTICULATED PATELLAR KNEE GUARD SHIELD
  // ==========================================
  const patGeo = createPatellaGeometry(
    cfg.patella.width,
    cfg.patella.height,
    cfg.patella.thickness
  );
  const patellaShield = new THREE.Mesh(patGeo, materials.armor);
  patellaShield.name = side === -1 ? 'PatellaShield_L' : 'PatellaShield_R';
  patellaShield.position.set(0, cfg.patella.yOffset, cfg.patella.offsetZ);
  patellaShield.castShadow = true;
  patellaShield.receiveShadow = true;
  kneeGroup.add(patellaShield);

  // Horizontal violet emissive LED slit across patella shield
  const ledGeo = new THREE.BoxGeometry(0.024, 0.0022, 0.0025);
  const patellaLed = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  patellaLed.name = side === -1 ? 'PatellaLed_L' : 'PatellaLed_R';
  patellaLed.position.set(0, cfg.patella.yOffset, cfg.patella.offsetZ + cfg.patella.thickness * 0.5 + 0.004);
  kneeGroup.add(patellaLed);
  ledMeshes.push(patellaLed);

  // ==========================================
  // 6. SHIN PIVOT (Articulated Hinge Axis for Lower Leg)
  // ==========================================
  const shinPivot = new THREE.Group();
  shinPivot.name = side === -1 ? 'LeftShinPivot' : 'RightShinPivot';
  shinPivot.position.set(0, 0, 0);
  kneeGroup.add(shinPivot);

  // Structural clevis connecting knee axle into top of shin
  const clevisGeo = new THREE.CylinderGeometry(0.022, 0.026, 0.028, 20);
  const clevis = new THREE.Mesh(clevisGeo, materials.joint);
  clevis.position.set(0, -0.014, 0);
  clevis.castShadow = true;
  shinPivot.add(clevis);

  return {
    group: kneeGroup,
    shinPivot,
    lateralDisc: mergedCondyle,
    medialDisc: mergedCondyle,
    accentRingLateral,
    accentRingMedial,
    patellaShield,
    patellaLed,
    centralPin: mergedCondyle,
    statorTeeth,
    ledMeshes,
  };
}
