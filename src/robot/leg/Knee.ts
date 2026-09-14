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
 * Creates the compact, low-profile white ceramic patellar deflector guard.
 * Deliberately compact to keep the rotational joint drum, axle, and structural brackets fully visible!
 */
function createLowProfilePatellaGeometry(
  width: number,
  height: number,
  thickness: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const halfW = width * 0.5;
  const halfH = height * 0.5;

  // Hexagonal shield profile with sharp aerodynamic chamfers
  shape.moveTo(0, halfH);
  shape.lineTo(halfW * 0.85, halfH * 0.55);
  shape.lineTo(halfW, -halfH * 0.15);
  shape.lineTo(halfW * 0.65, -halfH * 0.80);
  shape.lineTo(0, -halfH);
  shape.lineTo(-halfW * 0.65, -halfH * 0.80);
  shape.lineTo(-halfW, -halfH * 0.15);
  shape.lineTo(-halfW * 0.85, halfH * 0.55);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0024,
    bevelSize: 0.0018,
    bevelSegments: 3,
    curveSegments: 20,
  });
  geo.center();

  // 3D forward ridge along midline
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (z > 0) {
      const ridge = (1.0 - Math.min(1.0, Math.abs(x) / halfW)) * 0.004;
      pos.setZ(i, z + ridge);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * PRECISION-ENGINEERED ROBOTIC KNEE JOINT ASSEMBLY:
 *
 *   THIGH FEMUR CHASSIS
 *            │
 *   UPPER STRUCTURAL YOKE (Machined Titanium Fork & Clamping Bosses)
 *            │
 *            ▼
 * ┌────────────────────────────────────────────────────────┐
 * │ PRIMARY ROTATIONAL BEARING DRUM & TRANSVERSE AXLE (●)   │
 * │ (Single Cylindrical Housing, Stepped Seals, End Caps)  │
 * └──────────────────────────┬─────────────────────────────┘
 *            ▲               │               ▲
 *            │               ▼               │
 *   [ASSIST LINK]   LOWER DOUBLE-SHEAR YOKE  [ASSIST LINK]
 *            │               │               │
 *            │               ▼               │
 *   SHIN TIBIAL PLATEAU COLLAR & BACKBONE SPINE
 *
 * Unifies all components into ONE coherent mechanical joint with clear load paths.
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

  // Group containing stationary upper joint components, axle, and condyles
  const jointCoreGroup = new THREE.Group();
  jointCoreGroup.name = side === -1 ? 'KneeJointCore_L' : 'KneeJointCore_R';
  kneeGroup.add(jointCoreGroup);

  // =========================================================================
  // 1. PRIMARY CYLINDRICAL BEARING HOUSING DRUM
  // One master cylindrical actuator housing along the horizontal rotation axis
  // =========================================================================
  const housingGeo = new THREE.CylinderGeometry(
    cfg.jointRadius,
    cfg.jointRadius,
    cfg.jointLength,
    32
  );
  const centralHousing = new THREE.Mesh(housingGeo, materials.joint);
  centralHousing.name = side === -1 ? 'KneeMainHousing_L' : 'KneeMainHousing_R';
  centralHousing.rotation.z = Math.PI / 2;
  centralHousing.castShadow = true;
  centralHousing.receiveShadow = true;
  jointCoreGroup.add(centralHousing);

  // Precision central stator band with subtle recessed diameter
  const statorBandGeo = new THREE.CylinderGeometry(
    cfg.jointRadius * 0.97,
    cfg.jointRadius * 0.97,
    cfg.jointLength * 0.44,
    32
  );
  const statorBand = new THREE.Mesh(statorBandGeo, materials.joint);
  statorBand.rotation.z = Math.PI / 2;
  jointCoreGroup.add(statorBand);

  // Stepped precision bearing seal collars flanking the central band
  for (const sSide of [-1, 1]) {
    const sealGeo = new THREE.CylinderGeometry(
      cfg.jointRadius * 1.04,
      cfg.jointRadius * 1.04,
      0.006,
      28
    );
    const seal = new THREE.Mesh(sealGeo, materials.joint);
    seal.rotation.z = Math.PI / 2;
    seal.position.x = sSide * (cfg.jointLength * 0.28);
    seal.castShadow = true;
    jointCoreGroup.add(seal);
  }

  // Central transverse structural axle pin running through the entire joint
  const pinGeo = new THREE.CylinderGeometry(
    cfg.axleRadius,
    cfg.axleRadius,
    cfg.axleLength,
    24
  );
  const centralPin = new THREE.Mesh(pinGeo, materials.joint);
  centralPin.name = side === -1 ? 'KneeAxlePin_L' : 'KneeAxlePin_R';
  centralPin.rotation.z = Math.PI / 2;
  centralPin.castShadow = true;
  jointCoreGroup.add(centralPin);

  // =========================================================================
  // 2. UPPER STRUCTURAL KNEE BRACKETS (Engineered Femur Yoke)
  // Substantial titanium brackets connecting thigh fork directly into the bearing
  // =========================================================================
  for (const bSide of [-1, 1]) {
    const xPos = bSide * (cfg.upperForkWidth * 0.5);

    // Main vertical load-bearing bracket plate with beveled edges
    const plateGeo = new THREE.BoxGeometry(cfg.upperForkThickness, 0.038, 0.032);
    const plate = new THREE.Mesh(plateGeo, materials.joint);
    plate.position.set(xPos, 0.016, 0);
    plate.castShadow = true;
    plate.receiveShadow = true;
    jointCoreGroup.add(plate);

    // Annular bearing clamp collar wrapping around the bearing housing
    const ringGeo = new THREE.CylinderGeometry(
      cfg.jointRadius * 1.12,
      cfg.jointRadius * 1.12,
      cfg.upperForkThickness * 1.05,
      28
    );
    const ring = new THREE.Mesh(ringGeo, materials.joint);
    ring.rotation.z = Math.PI / 2;
    ring.position.set(xPos, 0, 0);
    ring.castShadow = true;
    jointCoreGroup.add(ring);

    // Recessed lightening pocket on the outer face of each bracket
    const pocketGeo = new THREE.BoxGeometry(0.0025, 0.022, 0.016);
    const pocket = new THREE.Mesh(pocketGeo, materials.joint);
    pocket.position.set(xPos + bSide * (cfg.upperForkThickness * 0.45), 0.016, 0);
    jointCoreGroup.add(pocket);

    // Cross-clamp fastener bolt securing bracket to thigh fork
    const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, cfg.upperForkThickness * 1.35, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(xPos, 0.026, 0);
    jointCoreGroup.add(bolt);
  }

  // =========================================================================
  // 3. PRECISION SIDE BEARING CAPS (Lateral & Medial Interfaces)
  // Refined into compact, precision-machined housings — NOT stacked cylinders!
  // =========================================================================
  const capGroup = new THREE.Group();
  const accentGroup = new THREE.Group();

  for (const dir of [-1, 1]) {
    const xCap = dir * (cfg.jointLength * 0.5 + cfg.bearingCapThickness * 0.5);

    // Precision circular bearing cap housing
    const capHousingGeo = new THREE.CylinderGeometry(
      cfg.bearingCapRadius,
      cfg.bearingCapRadius * 0.96,
      cfg.bearingCapThickness,
      32
    );
    const capHousing = new THREE.Mesh(capHousingGeo, materials.joint);
    capHousing.rotation.z = Math.PI / 2;
    capHousing.position.x = xCap;
    capHousing.castShadow = true;
    capHousing.receiveShadow = true;
    capGroup.add(capHousing);

    // 6 flush socket-head cap screws in a circular bolt pattern
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const screwGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.002, 6);
      const screw = new THREE.Mesh(screwGeo, materials.joint);
      screw.rotation.z = Math.PI / 2;
      screw.position.set(
        xCap + dir * (cfg.bearingCapThickness * 0.45),
        Math.cos(angle) * (cfg.bearingCapRadius * 0.70),
        Math.sin(angle) * (cfg.bearingCapRadius * 0.70)
      );
      capGroup.add(screw);
    }

    // Flush hex spindle locknut at the axle center
    const nutGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.003, 6);
    const nut = new THREE.Mesh(nutGeo, materials.joint);
    nut.rotation.z = Math.PI / 2;
    nut.position.x = xCap + dir * (cfg.bearingCapThickness * 0.48);
    capGroup.add(nut);

    // Subtle flush white ceramic accent center plug
    const centerPlugGeo = new THREE.CylinderGeometry(cfg.centerCapRadius, cfg.centerCapRadius, 0.002, 24);
    const centerPlug = new THREE.Mesh(centerPlugGeo, materials.armor);
    centerPlug.rotation.z = Math.PI / 2;
    centerPlug.position.x = xCap + dir * (cfg.bearingCapThickness * 0.52);
    centerPlug.castShadow = true;
    capGroup.add(centerPlug);

    // Hairline recessed purple status ring (encoder status seal)
    const ringGeo = new THREE.TorusGeometry(cfg.accentRingRadius, 0.0012, 8, 32);
    const accentRing = new THREE.Mesh(ringGeo, materials.purpleEmissive);
    accentRing.name = dir === side ? 'KneeAccentRingLat' : 'KneeAccentRingMed';
    accentRing.rotation.y = Math.PI / 2;
    accentRing.position.x = xCap + dir * (cfg.bearingCapThickness * 0.46);
    accentGroup.add(accentRing);
  }

  const mergedCaps = mergeGroupMeshesByMaterial(
    capGroup,
    materials.joint,
    side === -1 ? 'KneeCaps_L' : 'KneeCaps_R',
    true
  ) || centralHousing;
  jointCoreGroup.add(mergedCaps);

  const mergedAccents = mergeGroupMeshesByMaterial(
    accentGroup,
    materials.purpleEmissive,
    side === -1 ? 'KneeAccents_L' : 'KneeAccents_R',
    false,
    false
  );
  if (mergedAccents) {
    kneeGroup.add(mergedAccents);
    ledMeshes.push(mergedAccents);
  }

  // Reference meshes for interface compatibility
  const lateralDisc = mergedCaps;
  const medialDisc = mergedCaps;
  const accentRingLateral = (accentGroup.children[0] as THREE.Mesh) || centralHousing;
  const accentRingMedial = (accentGroup.children[1] as THREE.Mesh) || centralHousing;

  // =========================================================================
  // 4. PURPOSEFUL HYDRAULIC / MECHANICAL ASSIST LINK
  // Provides believable flexion damping with 2 clear attachment points
  // =========================================================================
  const assistLinkGroup = new THREE.Group();
  const linkZ = -0.016;

  // Upper trunnion block mounted to upper bracket
  const trunnionGeo = new THREE.BoxGeometry(0.009, 0.010, 0.010);
  const trunnion = new THREE.Mesh(trunnionGeo, materials.joint);
  trunnion.position.set(side * (cfg.upperForkWidth * 0.36), 0.020, linkZ);
  assistLinkGroup.add(trunnion);

  // Linear damper cylinder barrel
  const barrelGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.026, 16);
  const barrel = new THREE.Mesh(barrelGeo, materials.joint);
  barrel.position.set(side * (cfg.upperForkWidth * 0.36), 0.008, linkZ);
  assistLinkGroup.add(barrel);

  // Chrome piston rod extending downward
  const rodGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.024, 16);
  const rod = new THREE.Mesh(rodGeo, materials.joint);
  rod.position.set(side * (cfg.upperForkWidth * 0.36), -0.012, linkZ);
  assistLinkGroup.add(rod);

  const mergedAssistLink = mergeGroupMeshesByMaterial(
    assistLinkGroup,
    materials.joint,
    side === -1 ? 'KneeAssistLink_L' : 'KneeAssistLink_R',
    true
  );
  if (mergedAssistLink) {
    jointCoreGroup.add(mergedAssistLink);
  }

  const mergedJointCore = mergeGroupMeshesByMaterial(
    jointCoreGroup,
    materials.joint,
    side === -1 ? 'KneeCore_Merged_L' : 'KneeCore_Merged_R',
    true
  ) || centralHousing;

  // =========================================================================
  // 5. SHIN PIVOT & LOWER STRUCTURAL CLEVIS (Substantial Lower Connection)
  // Double-shear clevis yoke rotating on the knee axle and anchoring into shin
  // =========================================================================
  const shinPivot = new THREE.Group();
  shinPivot.name = side === -1 ? 'LeftShinPivot' : 'RightShinPivot';
  shinPivot.position.set(0, 0, 0);
  kneeGroup.add(shinPivot);

  const clevisGroup = new THREE.Group();

  // Robust clevis base mounting foot
  const baseGeo = new THREE.BoxGeometry(cfg.lowerClevisWidth * 0.94, 0.018, 0.034);
  const clevisBase = new THREE.Mesh(baseGeo, materials.joint);
  clevisBase.position.set(0, -0.018, 0);
  clevisBase.castShadow = true;
  clevisBase.receiveShadow = true;
  clevisGroup.add(clevisBase);

  // 4 heavy mounting bolts securing the clevis foot directly to the tibial plateau
  for (const bx of [-0.014, 0.014]) {
    for (const bz of [-0.010, 0.010]) {
      const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.006, 6);
      const bolt = new THREE.Mesh(boltGeo, materials.joint);
      bolt.position.set(bx, -0.024, bz);
      clevisGroup.add(bolt);
    }
  }

  // Dual upright load-bearing clevis arms clasping the drum in double shear
  for (const cSide of [-1, 1]) {
    const xClevis = cSide * (cfg.lowerClevisWidth * 0.5);

    // Vertical structural arm
    const armGeo = new THREE.BoxGeometry(cfg.lowerClevisThickness, 0.034, 0.028);
    const arm = new THREE.Mesh(armGeo, materials.joint);
    arm.position.set(xClevis, -0.005, 0);
    arm.castShadow = true;
    clevisGroup.add(arm);

    // Annular pivot bearing collar enclosing the axle journal
    const bearingGeo = new THREE.CylinderGeometry(
      cfg.axleRadius * 1.55,
      cfg.axleRadius * 1.55,
      cfg.lowerClevisThickness * 1.10,
      20
    );
    const bearing = new THREE.Mesh(bearingGeo, materials.joint);
    bearing.rotation.z = Math.PI / 2;
    bearing.position.set(xClevis, 0, 0);
    clevisGroup.add(bearing);
  }

  // Lower actuator anchor pivot block (completing assist link connection)
  const lowerAnchorGeo = new THREE.BoxGeometry(0.008, 0.009, 0.009);
  const lowerAnchor = new THREE.Mesh(lowerAnchorGeo, materials.joint);
  lowerAnchor.position.set(side * (cfg.upperForkWidth * 0.36), -0.020, linkZ);
  clevisGroup.add(lowerAnchor);

  const mergedClevis = mergeGroupMeshesByMaterial(
    clevisGroup,
    materials.joint,
    side === -1 ? 'KneeShinClevis_L' : 'KneeShinClevis_R',
    true
  ) || clevisBase;
  shinPivot.add(mergedClevis);

  // =========================================================================
  // 6. LOW-PROFILE ARTICULATED PATELLAR DEFLECTOR GUARD
  // Compact, sleek white ceramic guard with clear articulation clearance
  // =========================================================================
  const patGeo = createLowProfilePatellaGeometry(
    cfg.patella.width,
    cfg.patella.height,
    cfg.patella.thickness
  );
  const patellaShield = new THREE.Mesh(patGeo, materials.armor);
  patellaShield.name = side === -1 ? 'PatellaShield_L' : 'PatellaShield_R';
  patellaShield.position.set(0, cfg.patella.yOffset, cfg.patella.offsetZ);
  patellaShield.castShadow = true;
  patellaShield.receiveShadow = true;
  shinPivot.add(patellaShield);

  // Horizontal purple emissive LED slit
  const ledGeo = new THREE.BoxGeometry(0.016, 0.0016, 0.0020);
  const patellaLed = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  patellaLed.name = side === -1 ? 'PatellaLed_L' : 'PatellaLed_R';
  patellaLed.position.set(
    0,
    cfg.patella.yOffset,
    cfg.patella.offsetZ + cfg.patella.thickness * 0.5 + 0.002
  );
  shinPivot.add(patellaLed);
  ledMeshes.push(patellaLed);

  // Structural titanium guide brackets anchoring patella to lower clevis
  const patellaBracketGroup = new THREE.Group();
  for (const pbSide of [-1, 1]) {
    const armGeo = new THREE.BoxGeometry(0.003, 0.007, cfg.patella.offsetZ * 0.70);
    const arm = new THREE.Mesh(armGeo, materials.joint);
    arm.position.set(
      pbSide * (cfg.patella.width * 0.32),
      cfg.patella.yOffset - 0.002,
      cfg.patella.offsetZ * 0.45
    );
    arm.castShadow = true;
    patellaBracketGroup.add(arm);
  }
  const mergedPatellaBrackets = mergeGroupMeshesByMaterial(
    patellaBracketGroup,
    materials.joint,
    side === -1 ? 'PatellaBrackets_L' : 'PatellaBrackets_R',
    true
  );
  if (mergedPatellaBrackets) {
    shinPivot.add(mergedPatellaBrackets);
  }

  return {
    group: kneeGroup,
    shinPivot,
    lateralDisc,
    medialDisc,
    accentRingLateral,
    accentRingMedial,
    patellaShield,
    patellaLed,
    centralPin: mergedJointCore,
    statorTeeth,
    ledMeshes,
  };
}
