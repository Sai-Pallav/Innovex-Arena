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

// ─── 3-Segment Articulated Spine Vertebral Positions ────────────────────────
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

  // Upper mounting collar mating into LowerChestFrame socket (y = -0.076 to -0.086)
  const flangeGeo = new THREE.CylinderGeometry(0.034, 0.030, 0.010, 28);
  const upperFlange = new THREE.Mesh(flangeGeo, materials.joint);
  upperFlange.position.set(0, -0.076, -0.002);
  tmp.add(upperFlange);

  // Tapered structural transition collar bridging cleanly to the spine
  const collarGeo = new THREE.CylinderGeometry(0.028, 0.024, 0.010, 28);
  const collar = new THREE.Mesh(collarGeo, materials.joint);
  collar.position.set(0, -0.080, -0.003);
  tmp.add(collar);

  // Central spine top gimbal trunnion knuckle
  const socketGeo = new THREE.CylinderGeometry(0.022, 0.020, 0.008, 24);
  const socket = new THREE.Mesh(socketGeo, materials.joint);
  socket.position.set(0, -0.086, -0.004);
  tmp.add(socket);

  // Slim metallic accent ring around the transition collar
  const accentGeo = new THREE.TorusGeometry(0.026, 0.0010, 6, 28);
  const accentRing = new THREE.Mesh(accentGeo, materials.metallic);
  accentRing.rotation.x = Math.PI / 2;
  accentRing.position.set(0, -0.080, -0.003);
  tmp.add(accentRing);

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
  // A. Segmented Cylindrical Spine Column (3 Stacked Vertebrae Modules)
  // ---------------------------------------------------------------------------
  const DISC_COUNT = 3;
  const DISC_RADIUS = 0.026;
  const DISC_HEIGHT = 0.018;
  const DAMPER_HEIGHT = 0.005;

  // Central dark spine structural core shaft
  const shaftHeight = 0.155;
  const shaftGeo = new THREE.CylinderGeometry(0.014, 0.016, shaftHeight, 24);
  const spineCoreMesh = new THREE.Mesh(shaftGeo, materials.joint);
  spineCoreMesh.name = 'SpineCentralShaft';
  spineCoreMesh.position.set(0, -0.136, -0.004);
  spineCoreMesh.castShadow = true;
  group.add(spineCoreMesh);

  // Stacked Cylindrical Vertebrae Discs
  for (let d = 0; d < DISC_COUNT; d++) {
    const discGroup = new THREE.Group();

    const currentRadius = DISC_RADIUS;
    const currentHeight = DISC_HEIGHT;

    // 1. Primary Titanium Vertebra Disc Body (Polished gunmetal with specular highlights)
    const discGeo = new THREE.CylinderGeometry(currentRadius, currentRadius, currentHeight, 32);
    const discMesh = new THREE.Mesh(discGeo, materials.joint);
    discMesh.castShadow = true;
    discMesh.receiveShadow = true;
    discGroup.add(discMesh);

    // 2. Central Machined Recessed Groove Ring
    const grooveGeo = new THREE.CylinderGeometry(currentRadius * 1.025, currentRadius * 1.025, 0.0035, 32);
    const grooveMesh = new THREE.Mesh(grooveGeo, materials.metallic);
    discGroup.add(grooveMesh);

    // 3. Embedded Blue/Purple Glowing LED Dot on Front/Lateral Face (Reference: Image 2)
    for (const ang of [0, Math.PI * 0.45, -Math.PI * 0.45]) {
      const ledDotGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.0020, 10);
      const ledDot = new THREE.Mesh(ledDotGeo, materials.purpleEmissive);
      ledDot.rotation.x = Math.PI / 2;
      ledDot.rotation.z = -ang;
      ledDot.position.set(
        Math.sin(ang) * (currentRadius + 0.0008),
        0,
        Math.cos(ang) * (currentRadius + 0.0008)
      );
      discGroup.add(ledDot);
      ledMeshes.push(ledDot);
    }

    // 4. Center Vertebra (Disc 2) Rear Glowing Purple Power Core Lens (Reference: Image 3)
    if (d === 1) {
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
      const damperGeo = new THREE.CylinderGeometry(currentRadius * 0.90, currentRadius * 0.90, DAMPER_HEIGHT, 28);
      const damper = new THREE.Mesh(damperGeo, materials.joint);
      damper.position.set(0, -currentHeight * 0.5 - DAMPER_HEIGHT * 0.5, 0);
      discGroup.add(damper);
    }

    // Discs 0, 1, 2 are internal spine pivots behind Plates 1, 2, 3
    discGroup.position.set(0, 0, -0.004);
    const vGroup = new THREE.Group();
    vGroup.name = `VertebraJoint_${String(d + 1).padStart(2, '0')}`;
    vGroup.position.set(0, cfg.vertebraY[d], 0);

    vGroup.add(discGroup);
    group.add(vGroup);
    vertebraGroups.push(vGroup);
    vertebraPrimaryMeshes.push(discMesh);
  }

  // ---------------------------------------------------------------------------
  // B. Waist Top Deck & Engineered Turntable Assembly (Reference Image 1 & 2)
  // ---------------------------------------------------------------------------
  const lowerMountGroup = new THREE.Group();

  // 1. Multi-Tiered Machined Dark Titanium Turntable Deck Plate
  const waistDeckGeo = new THREE.CylinderGeometry(0.084, 0.088, 0.009, 48);
  const waistDeck = new THREE.Mesh(waistDeckGeo, materials.joint);
  waistDeck.scale.set(1.06, 1.0, 0.86);
  waistDeck.position.set(0, -0.209, 0);
  lowerMountGroup.add(waistDeck);

  // Stepped inner raised concentric hub
  const hubStepGeo = new THREE.CylinderGeometry(0.076, 0.080, 0.003, 44);
  const hubStep = new THREE.Mesh(hubStepGeo, materials.joint);
  hubStep.scale.set(1.06, 1.0, 0.86);
  hubStep.position.set(0, -0.2045, 0);
  lowerMountGroup.add(hubStep);

  // Polished chrome accent highlight rim around the turntable deck edge
  const deckRimGeo = new THREE.TorusGeometry(0.084, 0.0012, 8, 48);
  const deckRim = new THREE.Mesh(deckRimGeo, materials.metallic);
  deckRim.rotation.x = Math.PI / 2;
  deckRim.scale.set(1.06, 0.86, 1.0);
  deckRim.position.set(0, -0.2045, 0);
  group.add(deckRim);

  // 2. Precision Hex Socket Fasteners Circling the Top Turntable Deck (Reference: Image 1)
  const boltCount = 18;
  for (let b = 0; b < boltCount; b++) {
    const bAngle = (b / boltCount) * Math.PI * 2;
    // Skip front-lateral angles where the white clamp hoods wrap the rim
    if (Math.abs(Math.sin(bAngle)) > 0.82 && Math.cos(bAngle) > 0) continue;
    const boltGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.0018, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.metallic);
    bolt.position.set(
      Math.sin(bAngle) * 0.080 * 1.05,
      -0.2035,
      Math.cos(bAngle) * 0.080 * 0.86
    );
    group.add(bolt);
  }

  // 3. Continuous Neon Violet/Purple Glowing Channel Ring directly beneath the black deck
  const neonWaistGeo = new THREE.TorusGeometry(0.086, 0.0016, 8, 44);
  const neonWaistRing = new THREE.Mesh(neonWaistGeo, materials.purpleEmissive);
  neonWaistRing.name = 'WaistTurntableNeonRing';
  neonWaistRing.rotation.x = Math.PI / 2;
  neonWaistRing.scale.set(1.06, 0.86, 1.0);
  neonWaistRing.position.set(0, -0.213, 0);
  group.add(neonWaistRing);
  ledMeshes.push(neonWaistRing);

  // 4. Forward-Curving Horizontal Glowing Purple Neon LED Arc Bar & Recessed Channel (Image 1)
  const WAIST_ARC_R = 0.086;
  const WAIST_ARC_Z = 0.000;
  const WAIST_ARC_Y = -0.2055;
  const WAIST_ARC_MAX_ANGLE = 0.76; // ~43.5 degrees
  const NUM_WAIST_PTS = 24;

  const waistArcPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= NUM_WAIST_PTS; i++) {
    const t = i / NUM_WAIST_PTS;
    const angle = -WAIST_ARC_MAX_ANGLE + t * (2 * WAIST_ARC_MAX_ANGLE);
    const x = Math.sin(angle) * WAIST_ARC_R * 1.05;
    const z = WAIST_ARC_Z + Math.cos(angle) * WAIST_ARC_R * 0.86;
    waistArcPoints.push(new THREE.Vector3(x, WAIST_ARC_Y, z));
  }
  const waistArcCurve = new THREE.CatmullRomCurve3(waistArcPoints);

  // Recessed dark metallic bezel rim cradling the neon bar
  const waistChannelGeo = new THREE.TubeGeometry(waistArcCurve, 32, 0.0038, 10, false);
  const waistChannelMesh = new THREE.Mesh(waistChannelGeo, materials.joint);
  waistChannelMesh.position.set(0, 0.0005, -0.001);
  lowerMountGroup.add(waistChannelMesh);

  // Illuminated Purple Neon LED Arc Bar (Prominent specular violet glow)
  const waistNeonBarGeo = new THREE.TubeGeometry(waistArcCurve, 32, 0.0026, 10, false);
  const waistNeonBar = new THREE.Mesh(waistNeonBarGeo, materials.purpleEmissive);
  waistNeonBar.name = 'WaistFrontPurpleNeonBar';
  group.add(waistNeonBar);
  ledMeshes.push(waistNeonBar);

  // 5. White Ceramic Arched Clamp Hoods / Cuffs Wrapping Around Deck Perimeter (Image 1)
  for (const side of [-1, 1] as const) {
    const hoodShape = new THREE.Shape();
    hoodShape.moveTo(-0.008, 0.010);
    hoodShape.lineTo(0.008, 0.010);
    hoodShape.quadraticCurveTo(0.010, 0, 0.008, -0.010);
    hoodShape.lineTo(-0.008, -0.010);
    hoodShape.quadraticCurveTo(-0.010, 0, -0.008, 0.010);
    hoodShape.closePath();

    const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.0032,
      bevelSize: 0.0026,
      bevelSegments: 3,
    });
    hoodGeo.center();

    const hood = new THREE.Mesh(hoodGeo, materials.armor);
    hood.name = side === -1 ? 'WaistNeonClampHood_Left' : 'WaistNeonClampHood_Right';
    const hX = side * Math.sin(WAIST_ARC_MAX_ANGLE) * WAIST_ARC_R * 1.05;
    const hZ = WAIST_ARC_Z + Math.cos(WAIST_ARC_MAX_ANGLE) * WAIST_ARC_R * 0.86;
    hood.position.set(hX, WAIST_ARC_Y + 0.002, hZ);
    hood.rotation.y = -side * (WAIST_ARC_MAX_ANGLE + 0.20);
    hood.rotation.x = -0.04;
    hood.castShadow = true;
    hood.receiveShadow = true;
    group.add(hood);
  }

  // 6. Transverse Hydraulic Stabilizer Strut (Waist Transition per Image 1)
  const wStrutY = -0.198;
  const wStrutZ = 0.024;

  // Central dark titanium clamp collar
  const wCollarWidth = 0.018;
  const wCollarGeo = new THREE.CylinderGeometry(0.0048, 0.0048, wCollarWidth, 20);
  const wCenterCollar = new THREE.Mesh(wCollarGeo, materials.joint);
  wCenterCollar.rotation.z = Math.PI / 2;
  wCenterCollar.position.set(0, wStrutY, wStrutZ);
  lowerMountGroup.add(wCenterCollar);

  // Central glowing purple indicator slit
  const wSlitGeo = new THREE.CylinderGeometry(0.0050, 0.0050, 0.0032, 20);
  const wCenterSlit = new THREE.Mesh(wSlitGeo, materials.purpleEmissive);
  wCenterSlit.name = 'WaistStabilizerPurpleSlit';
  wCenterSlit.rotation.z = Math.PI / 2;
  wCenterSlit.position.set(0, wStrutY, wStrutZ);
  group.add(wCenterSlit);
  ledMeshes.push(wCenterSlit);

  // Bilateral horizontal mirror-polished chrome piston rods & collars
  const wRodLen = 0.026;
  for (const side of [-1, 1] as const) {
    const rodGeo = new THREE.CylinderGeometry(0.0030, 0.0030, wRodLen, 18);
    const rod = new THREE.Mesh(rodGeo, materials.metallic);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(side * (0.009 + wRodLen * 0.5), wStrutY, wStrutZ);
    rod.castShadow = true;
    group.add(rod);

    // Stepped chrome collar ring
    const ringGeo = new THREE.CylinderGeometry(0.0044, 0.0044, 0.0024, 18);
    const outerRing = new THREE.Mesh(ringGeo, materials.metallic);
    outerRing.rotation.z = Math.PI / 2;
    outerRing.position.set(side * (0.009 + wRodLen - 0.002), wStrutY, wStrutZ);
    group.add(outerRing);

    // Mounting pivot block connecting into frame
    const bGeo = new THREE.BoxGeometry(0.006, 0.008, 0.009);
    const bracket = new THREE.Mesh(bGeo, materials.joint);
    bracket.position.set(side * (0.009 + wRodLen + 0.002), wStrutY, wStrutZ - 0.002);
    lowerMountGroup.add(bracket);
  }

  // 7. Dual Spherical Rotary Gimbal "Eyeball" Sockets (Left & Right Waist per Image 1)
  for (const side of [-1, 1] as const) {
    const eyeballGroup = new THREE.Group();
    eyeballGroup.name = side === -1 ? 'WaistGimbalEyeballSocket_Left' : 'WaistGimbalEyeballSocket_Right';
    eyeballGroup.position.set(side * 0.046, -0.198, 0.028);
    eyeballGroup.rotation.y = side * 0.16;
    eyeballGroup.rotation.x = 0.05;

    // Spherical eyeball housing
    const sphereGeo = new THREE.SphereGeometry(0.0086, 20, 18);
    const sphereMesh = new THREE.Mesh(sphereGeo, materials.joint);
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;
    eyeballGroup.add(sphereMesh);

    // Outer stepped conical bezel ring
    const bezelGeo = new THREE.CylinderGeometry(0.0072, 0.0084, 0.0032, 22);
    const bezel = new THREE.Mesh(bezelGeo, materials.joint);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(0, 0, 0.0070);
    eyeballGroup.add(bezel);

    // Mirror-polished chrome concentric ring (iris)
    const chromeRingGeo = new THREE.TorusGeometry(0.0058, 0.0012, 8, 24);
    const chromeRing = new THREE.Mesh(chromeRingGeo, materials.metallic);
    chromeRing.position.set(0, 0, 0.0082);
    eyeballGroup.add(chromeRing);

    // Central dark recessed bore ("pupil")
    const boreGeo = new THREE.CylinderGeometry(0.0036, 0.0036, 0.0030, 18);
    const bore = new THREE.Mesh(boreGeo, materials.joint);
    bore.rotation.x = Math.PI / 2;
    bore.position.set(0, 0, 0.0078);
    eyeballGroup.add(bore);

    // Purple specular core indicator
    const coreGeo = new THREE.SphereGeometry(0.0020, 10, 8);
    const core = new THREE.Mesh(coreGeo, materials.purpleEmissive);
    core.name = side === -1 ? 'WaistEyeballGlow_Left' : 'WaistEyeballGlow_Right';
    core.position.set(0, 0, 0.0078);
    eyeballGroup.add(core);
    ledMeshes.push(core);

    // Rear mounting sleeve entering chassis
    const mountSleeveGeo = new THREE.CylinderGeometry(0.0065, 0.0075, 0.010, 18);
    const mountSleeve = new THREE.Mesh(mountSleeveGeo, materials.joint);
    mountSleeve.rotation.x = Math.PI / 2;
    mountSleeve.position.set(0, 0, -0.005);
    eyeballGroup.add(mountSleeve);

    group.add(eyeballGroup);

    // Lateral White Ceramic Structural Pole (Straight, perfectly linear column sloping in exact harmony with side poles)
    const wStart = new THREE.Vector3(side * 0.084, -0.0465, 0.060);
    const wEnd = new THREE.Vector3(side * 0.062, -0.2035, 0.054);
    const wLen = wStart.distanceTo(wEnd);

    const poleGroup = new THREE.Group();
    poleGroup.name = side === -1 ? 'WaistEyeballCowlShield_Left' : 'WaistEyeballCowlShield_Right';
    poleGroup.position.copy(wStart);

    const wDir = new THREE.Vector3().subVectors(wEnd, wStart).normalize();
    poleGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), wDir);

    const poleRadius = 0.0052;

    // 1. Primary Straight White Ceramic Armor Pole (Solid perfectly linear column, zero lateral bend)
    const whitePoleGeo = new THREE.CylinderGeometry(poleRadius, poleRadius, wLen, 24);
    const whitePole = new THREE.Mesh(whitePoleGeo, materials.armor);
    whitePole.position.set(0, -wLen * 0.5, 0);
    whitePole.castShadow = true;
    whitePole.receiveShadow = true;
    poleGroup.add(whitePole);

    // 2. Upper and Lower Machined Metallic Collar Caps (Seamless mechanical mounting integration)
    const capGeo = new THREE.CylinderGeometry(poleRadius * 1.15, poleRadius * 1.15, 0.003, 24);

    const topCap = new THREE.Mesh(capGeo, materials.metallic);
    topCap.position.set(0, -0.0015, 0);
    topCap.castShadow = true;
    topCap.receiveShadow = true;
    poleGroup.add(topCap);

    const bottomCap = new THREE.Mesh(capGeo, materials.metallic);
    bottomCap.position.set(0, -wLen + 0.0015, 0);
    bottomCap.castShadow = true;
    bottomCap.receiveShadow = true;
    poleGroup.add(bottomCap);

    // 3. Central Machined Dark Titanium Joint Ring Accent
    const jointRingGeo = new THREE.CylinderGeometry(poleRadius * 1.08, poleRadius * 1.08, 0.0025, 24);
    const jointRing = new THREE.Mesh(jointRingGeo, materials.joint);
    jointRing.position.set(0, -wLen * 0.5, 0);
    jointRing.castShadow = true;
    jointRing.receiveShadow = true;
    poleGroup.add(jointRing);

    group.add(poleGroup);
  }

  // 8. Polished Chrome / Silver Conical Socket Bosses on the Black Deck (Reference: Image 1, 2, 3)
  // 4 Socket Collars: 2 Outer Angled + 2 Inner Crossed
  const cfgAct = TORSO_CONFIG.stomach.actuatorArray;
  const sockets = [
    // Outer Angled Actuator Sockets (Left and Right)
    { x: cfgAct.frontLinear.lowerMount.x, y: -0.199, z: cfgAct.frontLinear.lowerMount.z, radiusTop: 0.0084, radiusBottom: 0.0102, height: 0.012 },
    { x: -cfgAct.frontLinear.lowerMount.x, y: -0.199, z: cfgAct.frontLinear.lowerMount.z, radiusTop: 0.0084, radiusBottom: 0.0102, height: 0.012 },
    // Inner Crossed Actuator Sockets (Left and Right)
    { x: cfgAct.rearLinear.lowerMount.x, y: -0.199, z: cfgAct.rearLinear.lowerMount.z, radiusTop: 0.0078, radiusBottom: 0.0096, height: 0.012 },
    { x: -cfgAct.rearLinear.lowerMount.x, y: -0.199, z: cfgAct.rearLinear.lowerMount.z, radiusTop: 0.0078, radiusBottom: 0.0096, height: 0.012 },
  ];

  for (const s of sockets) {
    const bossGeo = new THREE.CylinderGeometry(s.radiusTop, s.radiusBottom, s.height, 20);
    const boss = new THREE.Mesh(bossGeo, materials.metallic);
    boss.position.set(s.x, s.y, s.z);
    boss.castShadow = true;
    boss.receiveShadow = true;
    group.add(boss);

    // Dark interior bore receiving piston rod
    const boreGeo = new THREE.CylinderGeometry(s.radiusTop * 0.72, s.radiusTop * 0.72, 0.003, 16);
    const bore = new THREE.Mesh(boreGeo, materials.joint);
    bore.position.set(s.x, s.y + s.height * 0.5 + 0.0005, s.z);
    lowerMountGroup.add(bore);
  }

  // 9. Rear Illuminated Chevron Vent Slits on the Black Deck (Reference: Image 3)
  for (const s of [-1, 1] as const) {
    for (let v = 0; v < 3; v++) {
      const ventGeo = new THREE.BoxGeometry(0.007, 0.0012, 0.003);
      const vent = new THREE.Mesh(ventGeo, materials.purpleEmissive);
      vent.position.set(s * (0.024 + v * 0.008), -0.196, -0.038 - v * 0.004);
      vent.rotation.y = s * 0.35;
      group.add(vent);
      ledMeshes.push(vent);
    }
  }

  // Lower central chassis mating hub
  const hubGeo = new THREE.CylinderGeometry(0.036, 0.048, 0.014, 28);
  const hub = new THREE.Mesh(hubGeo, materials.joint);
  hub.position.set(0, -0.209, 0);
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
  // A. FRONT-LATERAL LINEAR ACTUATOR (Heavy-Duty Satin Silver Hydraulic Pole)
  // Outer angled hydraulic: slopes inward towards waist deck (Reference Image)
  // =========================================================================
  const fStart = v3(cfg.frontLinear.upperMount);
  const fEnd = v3(cfg.frontLinear.lowerMount);
  const fLen = fStart.distanceTo(fEnd);

  const fGroup = new THREE.Group();
  fGroup.position.copy(fStart);
  const fDir = new THREE.Vector3().subVectors(fEnd, fStart).normalize();
  fGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), fDir);

  const fRadius = cfg.frontLinear.cylinderRadius;
  const fPistonRadius = cfg.frontLinear.pistonRadius;

  // 1. Upper Mounting Bracket & Gimbal Socket Cup entering chest undercarriage
  const fMountCupGeo = new THREE.CylinderGeometry(fRadius * 1.25, fRadius * 1.15, 0.014, 24);
  const fMountCup = new THREE.Mesh(fMountCupGeo, materials.joint);
  fMountCup.position.set(0, 0.003, 0);
  fGroup.add(fMountCup);

  const fMountRing = new THREE.Mesh(new THREE.CylinderGeometry(fRadius * 1.30, fRadius * 1.30, 0.003, 24), materials.metallic);
  fMountRing.position.set(0, 0.006, 0);
  fGroup.add(fMountRing);

  // Upper Clevis Mount & Pivot Pin
  const fUClevis = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.018, 0.018), materials.joint);
  fUClevis.position.set(0, -0.006, 0);
  fGroup.add(fUClevis);

  const fUPin = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.018, 12), materials.joint);
  fUPin.rotation.z = Math.PI / 2;
  fGroup.add(fUPin);

  for (const bSide of [-1, 1] as const) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0036, 0.0036, 0.0025, 6), materials.metallic);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(bSide * 0.009, -0.006, 0);
    fGroup.add(bolt);
  }

  // Elongated upper dark titanium neck / collar section with stepped rings
  const fNeckLen = 0.034;
  const fNeck = new THREE.Mesh(new THREE.CylinderGeometry(fRadius * 0.90, fRadius * 0.98, fNeckLen, 24), materials.joint);
  fNeck.position.set(0, -0.009 - fNeckLen * 0.5, 0);
  fGroup.add(fNeck);

  // Stepped dark flanges & metallic accent rings on upper neck
  const fNeckRing1 = new THREE.Mesh(new THREE.CylinderGeometry(fRadius * 1.08, fRadius * 1.08, 0.003, 24), materials.metallic);
  fNeckRing1.position.set(0, -0.009 - fNeckLen * 0.35, 0);
  fGroup.add(fNeckRing1);

  const fNeckFlange = new THREE.Mesh(new THREE.CylinderGeometry(fRadius * 1.06, fRadius * 1.06, 0.0035, 24), materials.joint);
  fNeckFlange.position.set(0, -0.009 - fNeckLen * 0.70, 0);
  fGroup.add(fNeckFlange);

  const fNeckRing2 = new THREE.Mesh(new THREE.CylinderGeometry(fRadius * 1.10, fRadius * 1.10, 0.003, 24), materials.metallic);
  fNeckRing2.position.set(0, -0.009 - fNeckLen + 0.002, 0);
  fGroup.add(fNeckRing2);

  // 2. Heavy-Duty Satin Silver Cylinder Barrel (Reference: Image)
  // Prominent solid metallic cylinder starting right below chest flank
  const fCylLen = fLen * 0.40;
  const fCylStartY = -0.009 - fNeckLen;

  // Upper dark beveled cap ring
  const fTopCap = new THREE.Mesh(new THREE.CylinderGeometry(fRadius * 1.08, fRadius * 1.08, 0.004, 24), materials.joint);
  fTopCap.position.set(0, fCylStartY - 0.002, 0);
  fGroup.add(fTopCap);

  // Main solid satin silver barrel
  const fCylGeo = new THREE.CylinderGeometry(fRadius, fRadius, fCylLen, 28);
  const fCyl = new THREE.Mesh(fCylGeo, materials.metallic);
  fCyl.position.set(0, fCylStartY - fCylLen * 0.5, 0);
  fCyl.castShadow = true;
  fCyl.receiveShadow = true;
  fGroup.add(fCyl);

  // Lower dark beveled cap ring
  const fBottomCap = new THREE.Mesh(new THREE.CylinderGeometry(fRadius * 1.08, fRadius * 1.08, 0.004, 24), materials.joint);
  fBottomCap.position.set(0, fCylStartY - fCylLen + 0.002, 0);
  fGroup.add(fBottomCap);

  // Lower gland seal collar
  const fSeal = new THREE.Mesh(new THREE.CylinderGeometry(fRadius * 0.94, fRadius * 0.94, 0.004, 22), materials.joint);
  fSeal.position.set(0, fCylStartY - fCylLen - 0.002, 0);
  fGroup.add(fSeal);

  // 3. Mirror-Polished Chrome Telescoping Piston Rod
  const fRodStartY = fCylStartY - fCylLen - 0.004;
  const fRodLen = Math.abs(-fLen - fRodStartY);
  const fRod = new THREE.Mesh(
    new THREE.CylinderGeometry(fPistonRadius, fPistonRadius, fRodLen, 20),
    materials.metallic
  );
  fRod.position.set(0, fRodStartY - fRodLen * 0.5, 0);
  fGroup.add(fRod);

  // Spherical Ball Joint Collar / Socket Knuckle right above the lower turntable deck socket
  const fBallKnuckleGeo = new THREE.SphereGeometry(fPistonRadius * 1.55, 20, 16);
  fBallKnuckleGeo.scale(1, 0.78, 1);
  const fBallKnuckle = new THREE.Mesh(fBallKnuckleGeo, materials.metallic);
  fBallKnuckle.position.set(0, -fLen + 0.010, 0);
  fGroup.add(fBallKnuckle);

  // Ball knuckle retaining band
  const fKnuckleBand = new THREE.Mesh(new THREE.CylinderGeometry(fPistonRadius * 1.62, fPistonRadius * 1.62, 0.0022, 20), materials.joint);
  fKnuckleBand.position.set(0, -fLen + 0.010, 0);
  fGroup.add(fKnuckleBand);

  // Rod terminal seating pin
  const fEndCap = new THREE.Mesh(new THREE.CylinderGeometry(fPistonRadius * 1.08, fPistonRadius * 1.08, 0.006, 16), materials.metallic);
  fEndCap.position.set(0, -fLen, 0);
  fGroup.add(fEndCap);

  group.add(fGroup);

  // =========================================================================
  // B. INNER CROSSED ACTUATOR (Dark Titanium with Glowing Violet/Purple Band)
  // Inner actuator: slopes outward/forward to cross against outer pole
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

  // Upper mounting socket boss deep inside chest substernal vault
  const rMountCup = new THREE.Mesh(
    new THREE.CylinderGeometry(rRadius * 1.25, rRadius * 1.15, 0.012, 20),
    materials.joint
  );
  rMountCup.position.set(0, 0.003, 0);
  rGroup.add(rMountCup);

  // Upper clevis mount
  const rUClevis = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.014, 0.014), materials.joint);
  rUClevis.position.set(0, -0.005, 0);
  rGroup.add(rUClevis);

  const rUPin = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.015, 10), materials.joint);
  rUPin.rotation.z = Math.PI / 2;
  rGroup.add(rUPin);

  // Elongated upper dark titanium shaft/rod extending high into chest
  const rUpperShaftLen = rLen * 0.48;
  const rUpperShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0048, 0.0048, rUpperShaftLen, 18), materials.joint);
  rUpperShaft.position.set(0, -0.008 - rUpperShaftLen * 0.5, 0);
  rGroup.add(rUpperShaft);

  // Upper shaft metallic accent rings
  const rShaftRing1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0058, 0.0058, 0.0022, 16), materials.metallic);
  rShaftRing1.position.set(0, -0.008 - rUpperShaftLen * 0.35, 0);
  rGroup.add(rShaftRing1);

  const rShaftRing2 = new THREE.Mesh(new THREE.CylinderGeometry(0.0058, 0.0058, 0.0022, 16), materials.metallic);
  rShaftRing2.position.set(0, -0.008 - rUpperShaftLen * 0.70, 0);
  rGroup.add(rShaftRing2);

  // Transition conical collar into lower cylinder
  const rTransCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.0050, rRadius, 0.005, 20), materials.joint);
  rTransCollar.position.set(0, -0.008 - rUpperShaftLen - 0.0025, 0);
  rGroup.add(rTransCollar);

  // Lower cylinder housing
  const rCylStartY = -0.008 - rUpperShaftLen - 0.005;
  const rCylLen = rLen * 0.34;

  const rLowerCyl = new THREE.Mesh(new THREE.CylinderGeometry(rRadius, rRadius, rCylLen, 22), materials.joint);
  rLowerCyl.position.set(0, rCylStartY - rCylLen * 0.5, 0);
  rLowerCyl.castShadow = true;
  rLowerCyl.receiveShadow = true;
  rGroup.add(rLowerCyl);

  // Illuminated Violet/Purple Power Ring Band on lower cylinder (matching reference specular/glow)
  const rGlowBandGeo = new THREE.CylinderGeometry(rRadius * 1.05, rRadius * 1.05, 0.007, 24);
  const rPowerCore = new THREE.Mesh(rGlowBandGeo, materials.purpleEmissive);
  rPowerCore.name = side === -1 ? 'LeftInnerActuatorPowerCore' : 'RightInnerActuatorPowerCore';
  rPowerCore.position.set(0, rCylStartY - rCylLen * 0.55, 0);
  rGroup.add(rPowerCore);
  ledMeshes.push(rPowerCore);

  // Metallic accent clamp rings bordering the purple emissive ring
  for (const offset of [-0.0045, 0.0045]) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(rRadius * 1.10, rRadius * 1.10, 0.002, 18),
      materials.metallic
    );
    band.position.set(0, rCylStartY - rCylLen * 0.55 + offset, 0);
    rGroup.add(band);
  }

  // Lower seal collar
  const rSeal = new THREE.Mesh(
    new THREE.CylinderGeometry(rRadius * 0.94, rRadius * 0.94, 0.0035, 18),
    materials.joint
  );
  rSeal.position.set(0, rCylStartY - rCylLen - 0.00175, 0);
  rGroup.add(rSeal);

  // Lower rod seating into inner socket
  const rRodStartY = rCylStartY - rCylLen - 0.0035;
  const rRodLen = Math.abs(-rLen - rRodStartY);
  const rRod = new THREE.Mesh(
    new THREE.CylinderGeometry(rPistonRadius, rPistonRadius, rRodLen, 16),
    materials.metallic
  );
  rRod.position.set(0, rRodStartY - rRodLen * 0.5, 0);
  rGroup.add(rRod);

  // Terminal seating pin into the inner waist socket boss
  const rEndCap = new THREE.Mesh(
    new THREE.CylinderGeometry(rPistonRadius * 1.08, rPistonRadius * 1.08, 0.005, 16),
    materials.metallic
  );
  rEndCap.position.set(0, -rLen, 0);
  rGroup.add(rEndCap);

  group.add(rGroup);

  // =========================================================================
  // C. HIGH-PRESSURE FLEXIBLE HYDRAULIC CONDUIT (Fluid Hose)
  // =========================================================================
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * (cfg.frontLinear.upperMount.x - 0.008), cfg.frontLinear.upperMount.y - 0.024, cfg.frontLinear.upperMount.z - 0.002),
    new THREE.Vector3(side * (cfg.frontLinear.upperMount.x - 0.016), cfg.frontLinear.upperMount.y - 0.012, cfg.frontLinear.upperMount.z - 0.008),
    new THREE.Vector3(side * (cfg.frontLinear.upperMount.x - 0.020), cfg.frontLinear.upperMount.y + 0.004, cfg.frontLinear.upperMount.z - 0.014),
  ]);
  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 16, 0.0016, 8, false);
  const hose = new THREE.Mesh(hoseGeo, materials.joint);
  group.add(hose);

  const primaryMesh = fCyl;
  return { group, primaryMesh, ledMeshes };
}

// ─── 4. THREE TIERED ARTICULATED SEGMENTAL ARMOR PLATES ──────────────────────
// (Precision sculpted trapezoids with purple LED accents matching media_1789233119043.png)
function createTieredArmorPlate(
  index: number,
  materials: RobotMaterialPalette,
  ledMeshes?: THREE.Mesh[]
): THREE.Mesh {
  const cfg = TORSO_CONFIG.stomach.armorPlates[Math.min(index, 2)];
  const W = cfg.width * 0.5;
  const H = cfg.height * 0.5;
  const D = cfg.depth;

  // Horizontal ridge & facet depths
  const zRidge = D * 0.5 + 0.005;
  const zTop = D * 0.5 - 0.001;
  const zBot = D * 0.5 - 0.001;
  const zEdge = D * 0.5 - 0.003;
  const zBack = -D * 0.5;

  // Proportional trapezoidal narrowing matching Reference Image: identical slope & faceting
  const topW = W * 1.0;
  const midW = W * 0.91;
  const botW = W * 0.82;
  const Cx = W * 0.20; // Side chamfer facet width

  const positions: number[] = [];

  function addQuad(
    bl: [number, number, number],
    br: [number, number, number],
    tr: [number, number, number],
    tl: [number, number, number]
  ) {
    positions.push(...bl, ...br, ...tr);
    positions.push(...bl, ...tr, ...tl);
  }

  // Front center vertices
  const pTopL: [number, number, number] = [-topW + Cx, H, zTop];
  const pTopM: [number, number, number] = [0, H + 0.0015, zTop];
  const pTopR: [number, number, number] = [topW - Cx, H, zTop];

  const pMidL: [number, number, number] = [-midW + Cx, 0, zRidge];
  const pMidM: [number, number, number] = [0, 0, zRidge + 0.0015];
  const pMidR: [number, number, number] = [midW - Cx, 0, zRidge];

  const pBotL: [number, number, number] = [-botW + Cx, -H, zBot];
  const pBotM: [number, number, number] = [0, -H, zBot];
  const pBotR: [number, number, number] = [botW - Cx, -H, zBot];

  // Outer bevel rim front vertices
  const pEdgeTopL: [number, number, number] = [-topW, H - 0.003, zEdge];
  const pEdgeTopR: [number, number, number] = [topW, H - 0.003, zEdge];
  const pEdgeMidL: [number, number, number] = [-midW, 0, zEdge];
  const pEdgeMidR: [number, number, number] = [midW, 0, zEdge];
  const pEdgeBotL: [number, number, number] = [-botW, -H + 0.003, zEdge];
  const pEdgeBotR: [number, number, number] = [botW, -H + 0.003, zEdge];

  // Back vertices
  const pBackTopL: [number, number, number] = [-topW * 0.94, H - 0.002, zBack];
  const pBackTopR: [number, number, number] = [topW * 0.94, H - 0.002, zBack];
  const pBackBotL: [number, number, number] = [-botW * 0.94, -H + 0.002, zBack];
  const pBackBotR: [number, number, number] = [botW * 0.94, -H + 0.002, zBack];

  // 1. Front center facets (meeting at crisp horizontal ridge)
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

  // ---------------------------------------------------------------------------
  // DETAILS PER TIER (Matching Reference Photo media_1789233119043.png):
  // ---------------------------------------------------------------------------
  if (index === 0) {
    // PLATE 01 (Top): Clean white ceramic face framed by horizontal crevice LEDs


    // Horizontal purple glowing crevice LED lens centered in the gap above Plate 01 (between chest and Plate 01)
    const topCreviceLedGeo = new THREE.BoxGeometry(0.016, 0.0024, 0.004);
    const topCreviceLed = new THREE.Mesh(topCreviceLedGeo, materials.purpleEmissive);
    topCreviceLed.name = 'Plate01TopCrevicePurpleLed';
    topCreviceLed.position.set(0, H + 0.005, zRidge - 0.002);
    mesh.add(topCreviceLed);
    if (ledMeshes) ledMeshes.push(topCreviceLed);

    // Horizontal purple glowing crevice LED lens centered in the gap between Plate 01 and Plate 02
    const creviceLedGeo = new THREE.BoxGeometry(0.014, 0.0024, 0.004);
    const creviceLed = new THREE.Mesh(creviceLedGeo, materials.purpleEmissive);
    creviceLed.name = 'Plate01CrevicePurpleLed';
    creviceLed.position.set(0, -H - 0.005, zRidge - 0.002);
    mesh.add(creviceLed);
    if (ledMeshes) ledMeshes.push(creviceLed);
  } else if (index === 1) {
    // PLATE 02 (Middle): Vertical purple glowing slit on each lateral wing facet
    for (const side of [-1, 1] as const) {
      const slitGeo = new THREE.BoxGeometry(0.0018, H * 0.65, 0.0022);
      const slit = new THREE.Mesh(slitGeo, materials.purpleEmissive);
      slit.position.set(side * (midW - Cx * 0.45), 0, zRidge + 0.0005);
      slit.rotation.z = -side * 0.10;
      mesh.add(slit);
      if (ledMeshes) ledMeshes.push(slit);
    }

    // Horizontal purple glowing crevice LED lens centered in the gap between Plate 02 and Plate 03
    const creviceLedGeo = new THREE.BoxGeometry(0.011, 0.0024, 0.004);
    const creviceLed = new THREE.Mesh(creviceLedGeo, materials.purpleEmissive);
    creviceLed.name = 'Plate02CrevicePurpleLed';
    creviceLed.position.set(0, -H - 0.005, zRidge - 0.002);
    mesh.add(creviceLed);
    if (ledMeshes) ledMeshes.push(creviceLed);
  } else if (index === 2) {
    // PLATE 03 (Bottom): Lateral CNC mounting brackets with metallic hex bolts
    for (const side of [-1, 1] as const) {
      const earGeo = new THREE.BoxGeometry(0.0045, 0.008, 0.006);
      const ear = new THREE.Mesh(earGeo, materials.joint);
      ear.position.set(side * (botW + 0.001), -H * 0.35, zRidge - 0.003);
      mesh.add(ear);

      const boltGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0025, 6);
      const bolt = new THREE.Mesh(boltGeo, materials.metallic);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(side * (botW + 0.0022), -H * 0.35, zRidge - 0.0005);
      mesh.add(bolt);
    }

    // Horizontal purple glowing crevice LED lens centered in the gap below Plate 03
    const botCreviceLedGeo = new THREE.BoxGeometry(0.009, 0.0024, 0.004);
    const botCreviceLed = new THREE.Mesh(botCreviceLedGeo, materials.purpleEmissive);
    botCreviceLed.name = 'Plate03CrevicePurpleLed';
    botCreviceLed.position.set(0, -H - 0.005, zRidge - 0.002);
    mesh.add(botCreviceLed);
    if (ledMeshes) ledMeshes.push(botCreviceLed);
  }

  return mesh;
}

// ─── 4b. SLEEK RECESSED MECHANICAL MOUNTING BRACKETS ────────────────────────
// (Replacing bulky black box shells; tucked behind white plates to leave flank open)
function createTieredSideBracket(index: number, materials: RobotMaterialPalette): THREE.Group {
  const group = new THREE.Group();
  group.name = `AbdomenSideBracket_Tier_${index + 1}`;

  if (index >= 3) {
    return group;
  }

  const cfg = TORSO_CONFIG.stomach;
  const pCfg = cfg.armorPlates[index];
  const halfW = pCfg.width * 0.5;
  const H = pCfg.height;

  // Sleek, recessed mechanical mounting brackets tucked BEHIND the white plate lateral wings
  // Keeping the lateral corridor (X = 0.044 - 0.075) open for the inner actuator poles
  for (const side of [-1, 1] as const) {
    const sideGroup = new THREE.Group();

    // 1. Recessed dark titanium CNC mounting lug behind the plate chamfer wing
    const lugGeo = new THREE.BoxGeometry(0.0055, H * 0.65, 0.009);
    const lug = new THREE.Mesh(lugGeo, materials.joint);
    lug.position.set(side * (halfW * 0.84), 0, 0.024);
    lug.rotation.y = -side * 0.25;
    sideGroup.add(lug);

    // 2. Machined metallic pivot pin / fastening bolt
    const pinGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.007, 12);
    const pin = new THREE.Mesh(pinGeo, materials.metallic);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(side * (halfW * 0.85), 0, 0.026);
    sideGroup.add(pin);

    // 3. Standoff strut connecting lug back to vertebra disc
    const strutGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.015, 12);
    const strut = new THREE.Mesh(strutGeo, materials.joint);
    strut.rotation.x = Math.PI / 2;
    strut.position.set(side * (halfW * 0.68), 0, 0.012);
    sideGroup.add(strut);

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

  // 3. 3 Tiered Identical Trapezoidal Armor Plates & Sleek Recessed CNC Brackets
  const armorPlates: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const plate = createTieredArmorPlate(i, materials, ledMeshes);
    vertebraGroups[i].add(plate);
    armorPlates.push(plate);

    const sideBracket = createTieredSideBracket(i, materials);
    vertebraGroups[i].add(sideBracket);
  }

  // 4. Kinematic Multi-Column Actuator & Stabilizer Clusters (Left and Right)
  const leftCluster = createSideActuatorCluster(-1, materials);
  const rightCluster = createSideActuatorCluster(1, materials);
  abdomenGroup.add(leftCluster.group);
  abdomenGroup.add(rightCluster.group);
  ledMeshes.push(...leftCluster.ledMeshes, ...rightCluster.ledMeshes);

  // 5. Produce rings[] array for TorsoAnimationController (mapped directly to 3 vertebrae)
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
  lowerConnectorGroup.position.set(0, -0.213, 0);

  const sideMechLeft = leftCluster.group;
  const sideMechRight = rightCluster.group;

  return {
    group: abdomenGroup,
    upperConnector: upperConnectorGroup,
    segment01: rings[0].group,
    segment02: rings[1].group,
    segment03: rings[2].group,
    segment04: rings[2].group,
    segment05: rings[2].group,
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
