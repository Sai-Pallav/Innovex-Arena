import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { TORSO_CONFIG } from './TorsoConfig';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

// ─── Public interfaces (strictly preserved for animation controller compatibility) ────

export interface StomachRingNodes {
  group: THREE.Group;
  outerRing: THREE.Mesh;
  innerCore: THREE.Mesh;
  frontPlate?: THREE.Mesh;
  pistons?: THREE.Mesh[];
  accentLed?: THREE.Mesh;
  mechanism?: THREE.Group;
}

export interface StomachAssemblyNodes {
  group: THREE.Group;
  upperConnector: THREE.Group;
  segment01: THREE.Group;
  segment02: THREE.Group;
  segment03: THREE.Group;
  segment04: THREE.Group;
  segment05: THREE.Group;
  rings: StomachRingNodes[];
  lowerAbdomen: THREE.Group;
  lowerConnector: THREE.Group;
  sideMechanismLeft: THREE.Group;
  sideMechanismRight: THREE.Group;
  internalSpine: THREE.Group;
  spineCore: THREE.Mesh;
  vertebraeDiscs: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];
  armorPlates?: THREE.Mesh[];
}

// ─── 4-Segment Articulated Spine Vertebral Positions ────────────────────────
export const VERTEBRA_Y = TORSO_CONFIG.stomach.vertebraY;

// ─── 1. SPINE UPPER MOUNT / LOWER CHEST INTERFACE ───────────────────────────
function createSpineUpperMount(materials: RobotMaterialPalette): {
  group: THREE.Group;
  ledMeshes: THREE.Mesh[];
} {
  const group = new THREE.Group();
  group.name = 'SpineUpperMount';
  const ledMeshes: THREE.Mesh[] = [];

  const tmp = new THREE.Group();

  // Upper mounting collar mating into LowerChestFrame socket (y = -0.050)
  const flangeGeo = new THREE.CylinderGeometry(0.048, 0.044, 0.010, 32);
  const upperFlange = new THREE.Mesh(flangeGeo, materials.joint);
  upperFlange.scale.set(1.08, 1.0, 0.84);
  upperFlange.position.set(0, -0.050, -0.002);
  tmp.add(upperFlange);

  // Upper Mounting Plate & Yaw Rotation Bearing (Reference: "WAIST INTERNAL STRUCTURE")
  const plateGeo = new THREE.CylinderGeometry(0.082, 0.086, 0.008, 36);
  const upperMountPlate = new THREE.Mesh(plateGeo, materials.joint);
  upperMountPlate.scale.set(1.06, 1.0, 0.88);
  upperMountPlate.position.set(0, -0.048, 0.002);
  tmp.add(upperMountPlate);

  // Concentric Yaw Rotation Bearing Race (Polished Metallic)
  const bearingGeo = new THREE.TorusGeometry(0.078, 0.0018, 8, 36);
  const bearingRing = new THREE.Mesh(bearingGeo, materials.metallic);
  bearingRing.rotation.x = Math.PI / 2;
  bearingRing.position.set(0, -0.048, 0.002);
  bearingRing.scale.set(1.06, 0.88, 1.0);
  tmp.add(bearingRing);

  // Illuminated Purple Neon Ring Channel inside the Yaw Bearing
  const neonGeo = new THREE.TorusGeometry(0.076, 0.0014, 6, 36);
  const neonRing = new THREE.Mesh(neonGeo, materials.purpleEmissive);
  neonRing.name = 'YawBearingNeonRing';
  neonRing.rotation.x = Math.PI / 2;
  neonRing.position.set(0, -0.048, 0.002);
  neonRing.scale.set(1.06, 0.88, 1.0);
  group.add(neonRing);
  ledMeshes.push(neonRing);

  // Tapered structural transition collar
  const collarGeo = new THREE.CylinderGeometry(0.044, 0.046, 0.010, 28);
  const collar = new THREE.Mesh(collarGeo, materials.joint);
  collar.scale.set(1.06, 1.0, 0.84);
  collar.position.set(0, -0.056, -0.002);
  tmp.add(collar);

  // Central spine top gimbal trunnion
  const socketGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.008, 24);
  const socket = new THREE.Mesh(socketGeo, materials.joint);
  socket.position.set(0, -0.060, -0.004);
  tmp.add(socket);

  const merged = mergeGroupMeshesByMaterial(tmp, materials.joint, 'SpineUpperMount_Merged', false)!;
  merged.castShadow = true;
  merged.receiveShadow = true;
  group.add(merged);

  return { group, ledMeshes };
}

// ─── 2. CENTRAL MECHANICAL SPINE COLUMN (4 Vertebral Modules) ────────────────
function createSpineColumn(materials: RobotMaterialPalette): {
  group: THREE.Group;
  spineCoreMesh: THREE.Mesh;
  vertebraGroups: THREE.Group[];
  ledMeshes: THREE.Mesh[];
  vertebraPrimaryMeshes: THREE.Mesh[];
} {
  const group = new THREE.Group();
  group.name = 'SpineColumnAssembly';

  const ledMeshes: THREE.Mesh[] = [];
  const vertebraGroups: THREE.Group[] = [];
  const vertebraPrimaryMeshes: THREE.Mesh[] = [];

  const cfg = TORSO_CONFIG.stomach;

  // ---------------------------------------------------------------------------
  // A. Segmented Cylindrical Spine Column (5 Stacked Vertebrae Discs per Image 2 & 3)
  // ---------------------------------------------------------------------------
  const DISC_COUNT = 5;
  const DISC_RADIUS = 0.030;
  const DISC_HEIGHT = 0.024;
  const DAMPER_HEIGHT = 0.006;

  // Central dark spine structural core shaft
  const shaftHeight = 0.142;
  const shaftGeo = new THREE.CylinderGeometry(0.014, 0.016, shaftHeight, 24);
  const spineCoreMesh = new THREE.Mesh(shaftGeo, materials.joint);
  spineCoreMesh.name = 'SpineCentralShaft';
  spineCoreMesh.position.set(0, -0.118, -0.004);
  spineCoreMesh.castShadow = true;
  group.add(spineCoreMesh);

  // Stacked Cylindrical Vertebrae Discs
  for (let d = 0; d < DISC_COUNT; d++) {
    const discGroup = new THREE.Group();

    // 1. Primary Titanium Vertebra Disc Body (Polished gunmetal with specular highlights)
    const discGeo = new THREE.CylinderGeometry(DISC_RADIUS, DISC_RADIUS, DISC_HEIGHT, 32);
    const discMesh = new THREE.Mesh(discGeo, materials.joint);
    discMesh.castShadow = true;
    discMesh.receiveShadow = true;
    discGroup.add(discMesh);

    // 2. Central Machined Recessed Groove Ring
    const grooveGeo = new THREE.CylinderGeometry(DISC_RADIUS * 1.025, DISC_RADIUS * 1.025, 0.0040, 32);
    const grooveMesh = new THREE.Mesh(grooveGeo, materials.metallic);
    discGroup.add(grooveMesh);

    // 3. Embedded Blue/Purple Glowing LED Dot on Front/Lateral Face (Reference: Image 2)
    for (const ang of [0, Math.PI * 0.45, -Math.PI * 0.45]) {
      const ledDotGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.0020, 10);
      const ledDot = new THREE.Mesh(ledDotGeo, materials.purpleEmissive);
      ledDot.rotation.x = Math.PI / 2;
      ledDot.rotation.z = -ang;
      ledDot.position.set(
        Math.sin(ang) * (DISC_RADIUS + 0.0008),
        0,
        Math.cos(ang) * (DISC_RADIUS + 0.0008)
      );
      discGroup.add(ledDot);
      ledMeshes.push(ledDot);
    }

    // 4. Center Vertebra (Disc 3) Rear Glowing Purple Power Core Lens (Reference: Image 3)
    if (d === 2) {
      const lensBezelGeo = new THREE.CylinderGeometry(0.0090, 0.0090, 0.004, 24);
      const lensBezel = new THREE.Mesh(lensBezelGeo, materials.metallic);
      lensBezel.rotation.x = Math.PI / 2;
      lensBezel.position.set(0, 0, -DISC_RADIUS - 0.001);
      discGroup.add(lensBezel);

      const lensGeo = new THREE.CylinderGeometry(0.0070, 0.0070, 0.005, 24);
      const coreLens = new THREE.Mesh(lensGeo, materials.purpleEmissive);
      coreLens.name = 'SpineRearPowerCoreLens';
      coreLens.rotation.x = Math.PI / 2;
      coreLens.position.set(0, 0, -DISC_RADIUS - 0.002);
      discGroup.add(coreLens);
      ledMeshes.push(coreLens);

      // Vertical micro-LED indicator strip on spine midline
      for (const yOff of [-0.006, 0.006]) {
        const indGeo = new THREE.BoxGeometry(0.0018, 0.0025, 0.002);
        const ind = new THREE.Mesh(indGeo, materials.purpleEmissive);
        ind.position.set(0, yOff, -DISC_RADIUS - 0.002);
        discGroup.add(ind);
        ledMeshes.push(ind);
      }
    }

    // 5. Damper Washer Ring between vertebrae
    if (d < DISC_COUNT - 1) {
      const damperGeo = new THREE.CylinderGeometry(DISC_RADIUS * 0.90, DISC_RADIUS * 0.90, DAMPER_HEIGHT, 28);
      const damper = new THREE.Mesh(damperGeo, materials.joint);
      damper.position.set(0, -DISC_HEIGHT * 0.5 - DAMPER_HEIGHT * 0.5, 0);
      discGroup.add(damper);
    }

    // Map first 4 discs into vertebraGroups for smooth animation control
    if (d < 4) {
      discGroup.position.set(0, 0, -0.004);
      const vGroup = new THREE.Group();
      vGroup.name = `VertebraJoint_${String(d + 1).padStart(2, '0')}`;
      vGroup.position.set(0, cfg.vertebraY[d], 0);

      vGroup.add(discGroup);
      group.add(vGroup);
      vertebraGroups.push(vGroup);
      vertebraPrimaryMeshes.push(discMesh);
    } else {
      discGroup.position.set(0, cfg.vertebraY[3] - 0.030, -0.004);
      group.add(discGroup);
    }
  }

  // ---------------------------------------------------------------------------
  // B. Waist Top Deck & Polished Chrome Socket Bosses (Reference: Image 1, 2, 3)
  // ---------------------------------------------------------------------------
  const lowerMountGroup = new THREE.Group();

  // 1. Glossy Black Waist Turntable Upper Deck Plate
  const waistDeckGeo = new THREE.CylinderGeometry(0.084, 0.088, 0.008, 40);
  const waistDeck = new THREE.Mesh(waistDeckGeo, materials.joint);
  waistDeck.scale.set(1.06, 1.0, 0.86);
  waistDeck.position.set(0, -0.194, 0);
  lowerMountGroup.add(waistDeck);

  // 2. Continuous Neon Violet/Purple Glowing Channel Ring directly beneath the black deck
  const neonWaistGeo = new THREE.TorusGeometry(0.086, 0.0016, 8, 44);
  const neonWaistRing = new THREE.Mesh(neonWaistGeo, materials.purpleEmissive);
  neonWaistRing.name = 'WaistTurntableNeonRing';
  neonWaistRing.rotation.x = Math.PI / 2;
  neonWaistRing.scale.set(1.06, 0.86, 1.0);
  neonWaistRing.position.set(0, -0.198, 0);
  group.add(neonWaistRing);
  ledMeshes.push(neonWaistRing);

  // 3. Polished Chrome / Silver Conical Socket Bosses on the Black Deck (Reference: Image 1, 2, 3)
  // 4 Socket Collars: 2 Outer Angled + 2 Inner Vertical
  const sockets = [
    // Outer Angled Actuator Sockets (Left and Right)
    { x: 0.086, y: -0.188, z: 0.010, radiusTop: 0.0084, radiusBottom: 0.0102, height: 0.012 },
    { x: -0.086, y: -0.188, z: 0.010, radiusTop: 0.0084, radiusBottom: 0.0102, height: 0.012 },
    // Inner Vertical Actuator Sockets (Left and Right)
    { x: 0.050, y: -0.188, z: -0.006, radiusTop: 0.0078, radiusBottom: 0.0096, height: 0.012 },
    { x: -0.050, y: -0.188, z: -0.006, radiusTop: 0.0078, radiusBottom: 0.0096, height: 0.012 },
  ];

  for (const s of sockets) {
    const bossGeo = new THREE.CylinderGeometry(s.radiusTop, s.radiusBottom, s.height, 20);
    const boss = new THREE.Mesh(bossGeo, materials.metallic);
    boss.position.set(s.x, s.y, s.z);
    boss.castShadow = true;
    boss.receiveShadow = true;
    lowerMountGroup.add(boss);

    // Dark interior bore receiving piston rod
    const boreGeo = new THREE.CylinderGeometry(s.radiusTop * 0.72, s.radiusTop * 0.72, 0.003, 16);
    const bore = new THREE.Mesh(boreGeo, materials.joint);
    bore.position.set(s.x, s.y + s.height * 0.5 + 0.0005, s.z);
    lowerMountGroup.add(bore);
  }

  // 4. Rear Illuminated Chevron Vent Slits on the Black Deck (Reference: Image 3)
  for (const s of [-1, 1] as const) {
    for (let v = 0; v < 3; v++) {
      const ventGeo = new THREE.BoxGeometry(0.007, 0.0012, 0.003);
      const vent = new THREE.Mesh(ventGeo, materials.purpleEmissive);
      vent.position.set(s * (0.024 + v * 0.008), -0.189, -0.038 - v * 0.004);
      vent.rotation.y = s * 0.35;
      group.add(vent);
      ledMeshes.push(vent);
    }
  }

  // Lower central chassis mating hub
  const hubGeo = new THREE.CylinderGeometry(0.036, 0.048, 0.014, 28);
  const hub = new THREE.Mesh(hubGeo, materials.joint);
  hub.position.set(0, -0.202, 0);
  lowerMountGroup.add(hub);

  const mergedLowerMount = mergeGroupMeshesByMaterial(lowerMountGroup, materials.joint, 'LowerSpineMount_Merged', false)!;
  mergedLowerMount.castShadow = true;
  mergedLowerMount.receiveShadow = true;
  group.add(mergedLowerMount);

  return { group, spineCoreMesh, vertebraGroups, ledMeshes, vertebraPrimaryMeshes };
}

// ─── 3. MULTI-COLUMN KINEMATIC ACTUATOR & STABILIZER CLUSTERS ────────────────
/**
 * Kinematic Actuator & Stabilizer Array matching Reference: "WAIST INTERNAL STRUCTURE",
 * "EXPLODED VIEW", and Front/Side/Back views in media_1789198792558.jpg:
 * 1. Front-Lateral Linear Actuator (Heavy-duty cylinder with illuminated violet/purple cylindrical
 *    power core sleeve inside windowed/slotted cage, metallic clamp bands, 90° hydraulic elbow fitting,
 *    and mirror-polished chrome telescoping piston rod).
 * 2. Mid-Lateral Spine Support / Stabilizer Column (Continuous titanium vertical guide column with
 *    bronze bushing collars clamped by the transverse CNC standoff brackets from each vertebra).
 * 3. Rear-Lateral Linear Actuator (Posterior stabilizer cylinder with glowing violet/purple energy core
 *    visible through rear back armor opening and lateral angles).
 * 4. Dual Cross-Tie Linkage Brackets (CNC machined tie bars with central turnbuckles bridging front
 *    linear actuator and mid stabilizer column).
 * 5. High-Pressure Flexible Hydraulic Conduits (Smooth CatmullRomCurve3 braided fluid hoses routing
 *    from the 90° elbow fitting into the torso chassis).
 */
function createSideActuatorCluster(
  side: -1 | 1,
  materials: RobotMaterialPalette
): { group: THREE.Group; primaryMesh: THREE.Mesh; ledMeshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.name = side === -1 ? 'LeftActuatorClusterAssembly' : 'RightActuatorClusterAssembly';

  const cfg = TORSO_CONFIG.stomach.actuatorArray;
  const ledMeshes: THREE.Mesh[] = [];

  const v3 = (p: { x: number; y: number; z: number }) => new THREE.Vector3(side * p.x, p.y, p.z);

  // =========================================================================
  // A. FRONT-LATERAL LINEAR ACTUATOR (with Glowing Violet/Purple Power Sleeve)
  // =========================================================================
  const fStart = v3(cfg.frontLinear.upperMount);
  const fEnd = v3(cfg.frontLinear.lowerMount);
  const fLen = fStart.distanceTo(fEnd);

  const fGroup = new THREE.Group();
  fGroup.position.copy(fStart);
  const fDir = new THREE.Vector3().subVectors(fEnd, fStart).normalize();
  fGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), fDir);

  // 1. Upper Clevis Mount & Pivot Pin
  const fUClevis = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.016, 0.016), materials.joint);
  fUClevis.position.set(0, -0.006, 0);
  fGroup.add(fUClevis);

  const fUPin = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.018, 12), materials.joint);
  fUPin.rotation.z = Math.PI / 2;
  fGroup.add(fUPin);

  for (const bSide of [-1, 1] as const) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0034, 0.0034, 0.002, 6), materials.metallic);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(bSide * 0.009, 0, 0);
    fGroup.add(bolt);
  }

  // 2. Outer Heavy-Duty Dark Titanium Hydraulic Cylinder Barrel (Reference: Image 1)
  const fCylLen = fLen * 0.52;
  const fRadius = cfg.frontLinear.cylinderRadius;
  const fPistonRadius = cfg.frontLinear.pistonRadius;

  // Solid dark titanium barrel housing
  const fCylGeo = new THREE.CylinderGeometry(fRadius, fRadius, fCylLen, 24);
  const fCyl = new THREE.Mesh(fCylGeo, materials.joint);
  fCyl.position.set(0, -fCylLen * 0.5 - 0.008, 0);
  fCyl.castShadow = true;
  fCyl.receiveShadow = true;
  fGroup.add(fCyl);

  // Ribbed / knurled middle sleeve section
  const fRibSleeveGeo = new THREE.CylinderGeometry(fRadius * 1.04, fRadius * 1.04, fCylLen * 0.44, 24);
  const fRibSleeve = new THREE.Mesh(fRibSleeveGeo, materials.joint);
  fRibSleeve.position.set(0, -fCylLen * 0.5 - 0.008, 0);
  fGroup.add(fRibSleeve);

  // CNC Machined Metallic Accent Clamp Rings (Polished contrast rings matching Image 1)
  for (const yOffsetFrac of [0.20, 0.50, 0.80]) {
    const bandGeo = new THREE.CylinderGeometry(fRadius * 1.12, fRadius * 1.12, 0.0028, 20);
    const band = new THREE.Mesh(bandGeo, materials.metallic);
    band.position.set(0, -fCylLen * yOffsetFrac - 0.008, 0);
    fGroup.add(band);
  }

  // High-Pressure Hydraulic 90° Elbow Fitting (facing inward towards spine)
  const fittingGeo = new THREE.BoxGeometry(0.0052, 0.0052, 0.0064);
  const fitting = new THREE.Mesh(fittingGeo, materials.metallic);
  fitting.position.set(-side * (fRadius + 0.0024), -fCylLen - 0.004, 0);
  fGroup.add(fitting);

  // Heavy-duty lower cylinder seal gland collar
  const fSeal = new THREE.Mesh(
    new THREE.CylinderGeometry(fRadius * 1.25, fRadius * 1.25, 0.0045, 22),
    materials.metallic
  );
  fSeal.position.set(0, -fCylLen - 0.008, 0);
  fGroup.add(fSeal);

  // Mirror-Polished Chrome Telescoping Piston Rod
  const fRodLen = fLen * 0.50;
  const fRod = new THREE.Mesh(
    new THREE.CylinderGeometry(fPistonRadius, fPistonRadius, fRodLen, 20),
    materials.metallic
  );
  fRod.position.set(0, -fCylLen - 0.008 - fRodLen * 0.5, 0);
  fGroup.add(fRod);

  // Rod lower terminal pin seating cleanly into the silver waist socket boss
  const fEndCap = new THREE.Mesh(new THREE.CylinderGeometry(fPistonRadius * 1.05, fPistonRadius * 1.05, 0.006, 16), materials.metallic);
  fEndCap.position.set(0, -fLen, 0);
  fGroup.add(fEndCap);

  group.add(fGroup);

  // =========================================================================
  // B. INNER VERTICAL LINEAR ACTUATOR (with Glowing Violet/Purple Power Core)
  // (Prominently visible in Side View Image 2 and Back View Image 3)
  // =========================================================================
  const rStart = v3(cfg.rearLinear.upperMount);
  const rEnd = v3(cfg.rearLinear.lowerMount);
  const rLen = rStart.distanceTo(rEnd);

  const rGroup = new THREE.Group();
  rGroup.position.copy(rStart);
  const rDir = new THREE.Vector3().subVectors(rEnd, rStart).normalize();
  rGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), rDir);

  const rRadius = cfg.rearLinear.cylinderRadius;
  const rPistonRadius = cfg.rearLinear.pistonRadius;

  // Upper clevis mount & pivot pin attaching under chest lower frame
  const rUClevis = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.013, 0.013), materials.joint);
  rUClevis.position.set(0, -0.005, 0);
  rGroup.add(rUClevis);

  const rUPin = new THREE.Mesh(new THREE.CylinderGeometry(0.0026, 0.0026, 0.015, 10), materials.joint);
  rUPin.rotation.z = Math.PI / 2;
  rUPin.position.set(0, 0, 0);
  rGroup.add(rUPin);

  // Rear cylinder barrel & glowing core
  const rCylLen = rLen * 0.52;
  const rCapLen = 0.012;
  const rCap = new THREE.Mesh(new THREE.CylinderGeometry(rRadius, rRadius, rCapLen, 20), materials.joint);
  rCap.position.set(0, -rCapLen * 0.5 - 0.007, 0);
  rGroup.add(rCap);

  // Glowing violet/purple energy cylinder (bright neon core matching Image 2 & 3)
  const rCoreLen = cfg.rearLinear.powerCoreLength;
  const rCoreGeo = new THREE.CylinderGeometry(rRadius * 0.88, rRadius * 0.88, rCoreLen, 24);
  const rPowerCore = new THREE.Mesh(rCoreGeo, materials.purpleEmissive);
  rPowerCore.name = side === -1 ? 'LeftInnerActuatorPowerCore' : 'RightInnerActuatorPowerCore';
  rPowerCore.position.set(0, -0.007 - rCapLen - rCoreLen * 0.5, 0);
  rGroup.add(rPowerCore);
  ledMeshes.push(rPowerCore);

  // Slotted outer cage struts (3 subtle vertical dark ribs protecting the core)
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const ribGeo = new THREE.BoxGeometry(0.0018, rCoreLen, 0.0018);
    const rib = new THREE.Mesh(ribGeo, materials.joint);
    rib.position.set(
      Math.cos(angle) * (rRadius * 0.96),
      -0.007 - rCapLen - rCoreLen * 0.5,
      Math.sin(angle) * (rRadius * 0.96)
    );
    rib.rotation.y = -angle;
    rGroup.add(rib);
  }

  // Lower cylinder barrel section
  const rLowerCylLen = rCylLen - rCapLen - rCoreLen;
  const rLowerCyl = new THREE.Mesh(new THREE.CylinderGeometry(rRadius, rRadius, rLowerCylLen, 20), materials.joint);
  rLowerCyl.position.set(0, -0.007 - rCapLen - rCoreLen - rLowerCylLen * 0.5, 0);
  rGroup.add(rLowerCyl);

  // Metallic clamp accent rings
  for (const yOffset of [
    -0.007 - rCapLen * 0.5,
    -0.007 - rCapLen - rCoreLen,
    -0.007 - rCylLen + 0.003,
  ]) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(rRadius * 1.12, rRadius * 1.12, 0.0026, 16),
      materials.metallic
    );
    band.position.set(0, yOffset, 0);
    rGroup.add(band);
  }

  // Piston seal gland collar
  const rSeal = new THREE.Mesh(
    new THREE.CylinderGeometry(rRadius * 1.22, rRadius * 1.22, 0.0038, 16),
    materials.metallic
  );
  rSeal.position.set(0, -rCylLen - 0.008, 0);
  rGroup.add(rSeal);

  // Mirror-polished chrome telescoping rod
  const rRodLen = rLen * 0.48;
  const rRod = new THREE.Mesh(
    new THREE.CylinderGeometry(rPistonRadius, rPistonRadius, rRodLen, 16),
    materials.metallic
  );
  rRod.position.set(0, -rCylLen - 0.008 - rRodLen * 0.5, 0);
  rGroup.add(rRod);

  // Terminal seating collar entering the inner silver waist socket boss
  const rEndCap = new THREE.Mesh(
    new THREE.CylinderGeometry(rPistonRadius * 1.05, rPistonRadius * 1.05, 0.006, 16),
    materials.metallic
  );
  rEndCap.position.set(0, -rLen, 0);
  rGroup.add(rEndCap);

  group.add(rGroup);

  // =========================================================================
  // C. HIGH-PRESSURE FLEXIBLE HYDRAULIC CONDUITS (Fluid Hoses)
  // =========================================================================
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * (cfg.frontLinear.upperMount.x - 0.010), cfg.frontLinear.upperMount.y - 0.020, cfg.frontLinear.upperMount.z),
    new THREE.Vector3(side * (cfg.frontLinear.upperMount.x - 0.018), cfg.frontLinear.upperMount.y - 0.010, cfg.frontLinear.upperMount.z - 0.006),
    new THREE.Vector3(side * (cfg.frontLinear.upperMount.x - 0.022), cfg.frontLinear.upperMount.y + 0.002, cfg.frontLinear.upperMount.z - 0.014),
  ]);
  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 16, 0.0018, 8, false);
  const hose = new THREE.Mesh(hoseGeo, materials.joint);
  group.add(hose);

  const primaryMesh = fCyl;
  return { group, primaryMesh, ledMeshes };
}

// ─── 4. FOUR TIERED ARTICULATED SEGMENTAL ARMOR PLATES ──────────────────────
/**
 * 4 Tiered Articulated Segmental Armor Plates matching wireframe reference media_1789197600327.png:
 * - Plate 01 (y = -0.064): Width 136mm, height 32mm, sub-sternal arched contour
 * - Plate 02 (y = -0.098): Width 122mm, height 30mm
 * - Plate 03 (y = -0.132): Width 108mm, height 28mm
 * - Plate 04 (y = -0.166): Width 94mm, height 26mm, compact waist transition
 */
function createTieredArmorPlate(
  index: number,
  materials: RobotMaterialPalette
): THREE.Mesh {
  const cfg = TORSO_CONFIG.stomach.armorPlates[index];
  const W = cfg.width * 0.5;
  const H = cfg.height * 0.5;
  const D = 0.018; // Solid chunky depth matching side profile in Image 2
  const flare = index === 0 ? 0.0035 : 0;

  // Horizontal ridge & facet depths
  const zRidge = D * 0.5 + 0.005;
  const zTop = D * 0.5 - 0.001;
  const zBot = D * 0.5 - 0.001;
  const zEdge = D * 0.5 - 0.004;
  const zBack = -D * 0.5;

  // Trapezoidal narrowing from top to bottom
  const topW = W * 1.0;
  const midW = W * 0.96;
  const botW = W * 0.90;
  const Cx = W * 0.24; // Side chamfer width

  const positions: number[] = [];

  function addQuad(
    bl: [number, number, number],
    br: [number, number, number],
    tr: [number, number, number],
    tl: [number, number, number]
  ) {
    // Triangle 1: bl -> br -> tr (Strictly CCW)
    positions.push(...bl, ...br, ...tr);
    // Triangle 2: bl -> tr -> tl (Strictly CCW)
    positions.push(...bl, ...tr, ...tl);
  }

  // Front center vertices
  const pTopL: [number, number, number] = [-topW + Cx, H + flare, zTop];
  const pTopM: [number, number, number] = [0, H + flare + 0.0015, zTop];
  const pTopR: [number, number, number] = [topW - Cx, H + flare, zTop];

  const pMidL: [number, number, number] = [-midW + Cx, 0, zRidge];
  const pMidM: [number, number, number] = [0, 0, zRidge + 0.0015];
  const pMidR: [number, number, number] = [midW - Cx, 0, zRidge];

  const pBotL: [number, number, number] = [-botW + Cx, -H, zBot];
  const pBotM: [number, number, number] = [0, -H, zBot];
  const pBotR: [number, number, number] = [botW - Cx, -H, zBot];

  // Outer bevel rim front vertices
  const pEdgeTopL: [number, number, number] = [-topW, H + flare - 0.003, zEdge];
  const pEdgeTopR: [number, number, number] = [topW, H + flare - 0.003, zEdge];
  const pEdgeMidL: [number, number, number] = [-midW, 0, zEdge];
  const pEdgeMidR: [number, number, number] = [midW, 0, zEdge];
  const pEdgeBotL: [number, number, number] = [-botW, -H + 0.003, zEdge];
  const pEdgeBotR: [number, number, number] = [botW, -H + 0.003, zEdge];

  // Back vertices
  const pBackTopL: [number, number, number] = [-topW * 0.94, H + flare - 0.002, zBack];
  const pBackTopR: [number, number, number] = [topW * 0.94, H + flare - 0.002, zBack];
  const pBackBotL: [number, number, number] = [-botW * 0.94, -H + 0.002, zBack];
  const pBackBotR: [number, number, number] = [botW * 0.94, -H + 0.002, zBack];

  // 1. Front center facets (upper and lower halves meeting at crisp horizontal ridge crease)
  addQuad(pMidL, pMidM, pTopM, pTopL);
  addQuad(pMidM, pMidR, pTopR, pTopM);
  addQuad(pBotL, pBotM, pMidM, pMidL);
  addQuad(pBotM, pBotR, pMidR, pMidM);

  // 2. Front lateral chamfer facets
  addQuad(pEdgeMidL, pMidL, pTopL, pEdgeTopL);
  addQuad(pEdgeBotL, pBotL, pMidL, pEdgeMidL);
  addQuad(pMidR, pEdgeMidR, pEdgeTopR, pTopR);
  addQuad(pBotR, pEdgeBotR, pEdgeMidR, pMidR);

  // 3. Top chamfer bevel
  addQuad(pTopL, pTopR, pBackTopR, pBackTopL);
  addQuad(pEdgeTopL, pTopL, pBackTopL, pBackTopL);
  addQuad(pTopR, pEdgeTopR, pBackTopR, pBackTopR);

  // 4. Bottom chamfer bevel
  addQuad(pBackBotL, pBackBotR, pBotR, pBotL);
  addQuad(pBackBotL, pBotL, pEdgeBotL, pBackBotL);
  addQuad(pBotR, pBackBotR, pBackBotR, pEdgeBotR);

  // 5. Left & right sides
  addQuad(pBackBotL, pEdgeBotL, pEdgeMidL, pBackTopL);
  addQuad(pBackTopL, pEdgeMidL, pEdgeTopL, pBackTopL);
  addQuad(pEdgeBotR, pBackBotR, pBackTopR, pEdgeMidR);
  addQuad(pEdgeMidR, pBackTopR, pBackTopR, pEdgeTopR);

  // 6. Back mounting surface
  addQuad(pBackBotR, pBackBotL, pBackTopL, pBackTopR);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, materials.armor);
  mesh.name = `AbdomenArmorPlate_${String(index + 1).padStart(2, '0')}`;
  mesh.position.set(0, 0, 0.040 - index * 0.001);
  mesh.rotation.x = -0.02;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Internal mounting bracket connecting plate to vertebra housing
  const bracketGeo = new THREE.BoxGeometry(0.016, 0.010, 0.010);
  const bracket = new THREE.Mesh(bracketGeo, materials.joint);
  bracket.position.set(0, 0, -D * 0.5 - 0.008);
  mesh.add(bracket);

  return mesh;
}

// ─── 4b. STRUCTURED BLACK LATERAL FLANK SHELL & DAMPER CAPSULES (Reference: Image 1 & 2) ─
function createTieredSideShell(index: number, materials: RobotMaterialPalette): THREE.Group {
  const group = new THREE.Group();
  group.name = `AbdomenSideShell_Tier_${index + 1}`;

  const cfg = TORSO_CONFIG.stomach;
  const pCfg = cfg.armorPlates[index];
  const halfW = pCfg.width * 0.5;
  const H = pCfg.height;

  for (const side of [-1, 1] as const) {
    const sideGroup = new THREE.Group();

    // 1. Sleek Beveled Flank Shell Wing (expanded outward towards the actuator poles)
    // Dark titanium / satin joint material wrapping the lateral core
    // poleX = 0.112 (frontLinear.upperMount.x) — shell must reach close to this
    const poleX = 0.112;
    const flankW = 0.052 - index * 0.002; // wider — reaches toward the pole
    const flankH = H * 0.90;
    const flankD = 0.024;
    const flankGeo = new THREE.BoxGeometry(flankW, flankH, flankD);
    const flankMesh = new THREE.Mesh(flankGeo, materials.joint);
    flankMesh.castShadow = true;
    flankMesh.receiveShadow = true;
    // Centre the main shell body between halfW and ~poleX - 0.010
    const shellCenterX = halfW + flankW * 0.50;
    flankMesh.position.set(side * shellCenterX, 0, 0.018 - index * 0.001);
    flankMesh.rotation.y = -side * 0.28;
    sideGroup.add(flankMesh);

    // Front beveled stepped trim creating a crisp layered border flanking the white abs
    const facetGeo = new THREE.BoxGeometry(flankW * 0.65, flankH * 0.84, 0.005);
    const facetMesh = new THREE.Mesh(facetGeo, materials.joint);
    facetMesh.position.set(side * (halfW + flankW * 0.28), 0, 0.030 - index * 0.001);
    facetMesh.rotation.y = -side * 0.16;
    sideGroup.add(facetMesh);

    // Outer pole fairing fin — pushed right up to the actuator column
    const outerFinW = 0.010;
    const outerFinGeo = new THREE.BoxGeometry(outerFinW, flankH * 0.82, 0.018);
    const outerFin = new THREE.Mesh(outerFinGeo, materials.joint);
    // Position outer edge of fin at poleX - 0.006 (just clear of pole surface)
    const outerFinCenterX = poleX - outerFinW * 0.5 - 0.006;
    outerFin.position.set(side * outerFinCenterX, 0, 0.012 - index * 0.001);
    outerFin.rotation.y = -side * 0.20;
    sideGroup.add(outerFin);

    // Bridging gusset plate connecting main shell body to the outer pole fin
    const gussetW = outerFinCenterX - shellCenterX - flankW * 0.5;
    if (gussetW > 0.002) {
      const gussetGeo = new THREE.BoxGeometry(gussetW + 0.004, flankH * 0.60, 0.012);
      const gussetMesh = new THREE.Mesh(gussetGeo, materials.joint);
      gussetMesh.position.set(side * (shellCenterX + flankW * 0.5 + gussetW * 0.5), 0, 0.012 - index * 0.001);
      gussetMesh.rotation.y = -side * 0.10;
      sideGroup.add(gussetMesh);
    }

    // Recessed horizontal mechanical accent slot with CNC titanium socket bolts
    const slotGeo = new THREE.BoxGeometry(flankW * 0.80, 0.0030, 0.0025);
    const slotMesh = new THREE.Mesh(slotGeo, materials.metallic);
    slotMesh.position.set(side * (halfW + flankW * 0.52), 0, 0.030 - index * 0.001);
    slotMesh.rotation.y = -side * 0.28;
    sideGroup.add(slotMesh);

    // Micro-hex bolt heads inside the slot
    for (const bOff of [-0.010, 0, 0.010]) {
      const boltGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.0018, 6);
      const bolt = new THREE.Mesh(boltGeo, materials.metallic);
      bolt.rotation.x = Math.PI / 2;
      bolt.rotation.y = -side * 0.28;
      bolt.position.set(
        side * (halfW + flankW * 0.52) + Math.cos(-side * 0.28) * bOff,
        0,
        0.031 - index * 0.001 + Math.sin(-side * 0.28) * bOff
      );
      sideGroup.add(bolt);
    }

    // 2. Horizontal Damper Capsule Rib (Reference: Image 2)
    // Anchors directly from the back of the lateral shell into the side of the vertebra disc
    const ribRadius = 0.0036;
    const ribLength = 0.030;
    const ribGeo = new THREE.CylinderGeometry(ribRadius, ribRadius, ribLength, 16);
    const ribMesh = new THREE.Mesh(ribGeo, materials.joint);
    ribMesh.castShadow = true;
    ribMesh.rotation.x = Math.PI / 2;
    ribMesh.position.set(side * 0.027, 0, 0.010);
    sideGroup.add(ribMesh);

    // Spherical rounded end caps for authentic capsule look
    const capGeo = new THREE.SphereGeometry(ribRadius, 12, 8);
    const capFront = new THREE.Mesh(capGeo, materials.joint);
    capFront.position.set(side * 0.027, 0, 0.010 + ribLength * 0.5);
    sideGroup.add(capFront);

    const capBack = new THREE.Mesh(capGeo, materials.joint);
    capBack.position.set(side * 0.027, 0, 0.010 - ribLength * 0.5);
    sideGroup.add(capBack);

    // Polished machined chrome collar ring around the rib
    const collarGeo = new THREE.CylinderGeometry(ribRadius * 1.25, ribRadius * 1.25, 0.0028, 16);
    const collarMesh = new THREE.Mesh(collarGeo, materials.metallic);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(side * 0.027, 0, 0.010);
    sideGroup.add(collarMesh);

    // 3. Structural Chassis Linkage Web connecting flank shell back to spine
    const webGeo = new THREE.BoxGeometry(0.007, flankH * 0.65, 0.024);
    const webMesh = new THREE.Mesh(webGeo, materials.joint);
    webMesh.position.set(side * (halfW * 0.90), 0, 0.010);
    webMesh.rotation.y = -side * 0.12;
    sideGroup.add(webMesh);

    // 4. Outer pole proximity rail — a slim vertical bar running alongside the actuator column
    const poleRailGeo = new THREE.BoxGeometry(0.006, flankH * 0.95, 0.010);
    const poleRail = new THREE.Mesh(poleRailGeo, materials.joint);
    poleRail.castShadow = true;
    // Place rail just inboard of the actuator pole surface
    poleRail.position.set(side * (0.112 - 0.008), 0, 0.006 - index * 0.001);
    sideGroup.add(poleRail);

    // Metallic clamp accent ring on the pole rail (structural detail)
    const railClampGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.0030, 12);
    const railClamp = new THREE.Mesh(railClampGeo, materials.metallic);
    railClamp.rotation.z = Math.PI / 2;
    railClamp.position.set(side * (0.112 - 0.008), 0, 0.006 - index * 0.001);
    sideGroup.add(railClamp);

    // Bottom tier transition bracket hovering cleanly above the waist deck
    if (index === 3) {
      const lowerFootGeo = new THREE.BoxGeometry(0.018, 0.014, 0.016);
      const lowerFoot = new THREE.Mesh(lowerFootGeo, materials.joint);
      lowerFoot.position.set(side * (halfW + 0.008), -0.014, 0.014);
      lowerFoot.rotation.z = side * 0.10;
      sideGroup.add(lowerFoot);
    }

    // Top tier transition cowl tucking under the chest frame
    if (index === 0) {
      const upperCowlGeo = new THREE.BoxGeometry(0.018, 0.012, 0.016);
      const upperCowl = new THREE.Mesh(upperCowlGeo, materials.joint);
      upperCowl.position.set(side * (halfW + 0.008), 0.014, 0.014);
      upperCowl.rotation.z = -side * 0.10;
      sideGroup.add(upperCowl);
    }

    group.add(sideGroup);
  }

  return group;
}

// ─── 5. COMPLETE STOMACH / ABDOMEN ASSEMBLY ──────────────────────────────────
export function createStomachAssembly(materials: RobotMaterialPalette): StomachAssemblyNodes {
  const abdomenGroup = new THREE.Group();
  abdomenGroup.name = 'AbdomenCore';

  const ledMeshes: THREE.Mesh[] = [];

  // 1. Torso Lower Structural Interface (mating with LowerChestFrame)
  const { group: upperConnectorGroup, ledMeshes: upperLeds } = createSpineUpperMount(materials);
  abdomenGroup.add(upperConnectorGroup);
  ledMeshes.push(...upperLeds);

  // 2. Central Mechanical Spine Column (4 Vertebral Modules)
  const {
    group: spineGroup,
    spineCoreMesh,
    vertebraGroups,
    ledMeshes: spineLeds,
    vertebraPrimaryMeshes,
  } = createSpineColumn(materials);
  abdomenGroup.add(spineGroup);
  ledMeshes.push(...spineLeds);

  // 3. 4 Tiered Segmental Armor Plates & Black Lateral Flank Shells (attached directly to vertebra modules)
  const armorPlates: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const plate = createTieredArmorPlate(i, materials);
    vertebraGroups[i].add(plate);
    armorPlates.push(plate);

    const sideShell = createTieredSideShell(i, materials);
    vertebraGroups[i].add(sideShell);
  }

  // 4. Kinematic Multi-Column Actuator & Stabilizer Clusters (Left and Right)
  const leftCluster = createSideActuatorCluster(-1, materials);
  const rightCluster = createSideActuatorCluster(1, materials);
  abdomenGroup.add(leftCluster.group);
  abdomenGroup.add(rightCluster.group);
  ledMeshes.push(...leftCluster.ledMeshes, ...rightCluster.ledMeshes);

  // 5. Produce rings[] array for TorsoAnimationController (mapped directly to 4 vertebrae)
  const rings: StomachRingNodes[] = vertebraGroups.map((vg, idx) => {
    const primaryMesh = vertebraPrimaryMeshes[idx];
    return {
      group: vg,
      outerRing: primaryMesh,
      innerCore: primaryMesh,
      frontPlate: armorPlates[idx],
    } satisfies StomachRingNodes;
  });

  const lowerConnectorGroup = new THREE.Group();
  lowerConnectorGroup.name = 'LowerConnector';
  lowerConnectorGroup.position.set(0, -0.198, 0);

  const sideMechLeft = leftCluster.group;
  const sideMechRight = rightCluster.group;

  return {
    group: abdomenGroup,
    upperConnector: upperConnectorGroup,
    segment01: rings[0].group,
    segment02: rings[1].group,
    segment03: rings[2].group,
    segment04: rings[3].group,
    segment05: rings[3].group,
    rings,
    lowerAbdomen: lowerConnectorGroup,
    lowerConnector: lowerConnectorGroup,
    sideMechanismLeft: sideMechLeft,
    sideMechanismRight: sideMechRight,
    internalSpine: spineGroup,
    spineCore: spineCoreMesh,
    vertebraeDiscs: vertebraPrimaryMeshes,
    ledMeshes,
    armorPlates,
  };
}
