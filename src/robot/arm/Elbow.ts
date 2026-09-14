import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// ELBOW MODULE — Premium Humanoid Robotic Elbow Joint Assembly
// Reference: Images 1, 2, 3 — dominant dual circular actuator discs,
//            real transverse hinge, clevis fork, olecranon cowl,
//            hydraulic damper, concentric purple accent rings.
//
// Architecture (load path):
//   UpperArm distal cuff
//     ↓  elbowRoot  (stationary, parented to upperArm.group)
//     ↓  upperHousing  — clevis forks + upper connector
//     ↓  hingeCore     — transverse barrel + bearing tracks
//     ↓  centralPin    — axle pin
//     ↓  lateralDisc / medialDisc  — circular actuator discs (static)
//     ↓  forearmPivot  — ROTATION PIVOT (rotation.x = elbow bend)
//          └  lowerHousing  — knuckle + stem + olecranon
//
// The forearmPivot is the only animated DOF.  Forearm, Wrist, Hand are
// all parented to forearmPivot so they follow elbow bend automatically.
// ─────────────────────────────────────────────────────────────────────────────

const ELBOW_CONFIG = {
  hingeRadius:      0.0345,   // transverse hinge core outer radius
  hingeWidth:       0.0720,   // total axle span along X  (72 mm)
  discOuterRadius:  0.0388,   // circular actuator disc outer bezel radius
  discThickness:    0.0058,   // actuator side cover thickness
  emissiveRingR:    0.0278,   // purple accent ring radius
  emissiveRingTube: 0.0024,   // accent ring tube thickness
  hubCapRadius:     0.0142,   // machined hub cap radius
  axleRadius:       0.0108,   // central axle pin radius
  axleLength:       0.0780,   // axle pin total length

  // Angular limits (radians) — rotation.x on forearmPivot
  neutralAngle:  0.00,
  minBend:       0.08,        // slight hyperextension guard
  maxBend:      -2.18,        // ≈ 125 ° maximum anatomical flexion
  restingBend:  -0.44,        // natural relaxed ready posture (≈ 25 °)
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// NODE INTERFACE TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface ElbowDiscNodes {
  group: THREE.Group;
  outerBezel: THREE.Group;
  bearingRace: THREE.Group;
  accentRing: THREE.Mesh;
  innerDisc: THREE.Mesh;
  hubCap: THREE.Group;
}

export interface ElbowNodes {
  group: THREE.Group;
  forearmPivot: THREE.Group;
  upperConnector: THREE.Mesh;
  upperHousing: THREE.Group;
  hingeCore: THREE.Group;
  centralPin: THREE.Group;
  lateralDisc: THREE.Group;
  medialDisc: THREE.Group;
  lowerHousing: THREE.Group;
  accentRing: THREE.Mesh;
  medialAccentRing: THREE.Mesh;
  ledMeshes: THREE.Mesh[];
  hydraulicRam: THREE.Group;
  ramPiston: THREE.Mesh;
  ramCylinder: THREE.Mesh;
  olecranonMesh: THREE.Mesh;
  lateralDiscNodes: ElbowDiscNodes;
  medialDiscNodes: ElbowDiscNodes;
  setAngle: (angle: number) => void;
  getAngle: () => number;
  // Backwards compatibility aliases
  mainHingeBarrel: THREE.Mesh;
  lateralHub: THREE.Mesh;
  medialHub: THREE.Mesh;
  olecranonArmor: THREE.Mesh;
  upperClevis: THREE.Mesh;
  lowerClevis: THREE.Mesh;
}

// ─────────────────────────────────────────────────────────────────────────────
// CIRCULAR ACTUATOR DISC BUILDER
// Dominant side feature — matches References 1 & 2:
//   • Thick dark titanium beveled outer bezel with 12 calibration ticks
//   • Metallic crossed-roller bearing race
//   • Signature purple emissive accent ring
//   • Machined hub cap with 6 hex bolts and purple center indicator
// ─────────────────────────────────────────────────────────────────────────────
function createActuatorDisc(
  side: -1 | 1,
  isLateral: boolean,
  materials: RobotMaterialPalette,
  ledMeshes: THREE.Mesh[]
): { group: THREE.Group; nodes: ElbowDiscNodes; accentRingMesh: THREE.Mesh } {
  const group = new THREE.Group();
  const sign = isLateral ? side : -side;
  const prefix = isLateral ? 'LateralActuatorDisc' : 'MedialActuatorDisc';
  group.name = prefix;

  // Disc sits flush with the hinge width outer face
  group.position.set(
    sign * (ELBOW_CONFIG.hingeWidth * 0.5 + ELBOW_CONFIG.discThickness * 0.5),
    0, 0
  );

  // ── Outer Bezel Group ────────────────────────────────────────────────────
  const outerBezel = new THREE.Group();
  outerBezel.name = `${prefix}_OuterBezel`;
  group.add(outerBezel);

  // Retaining rim torus
  const bezelRimGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.discOuterRadius - 0.0014,
    0.0028, 10, 40
  );
  bezelRimGeo.rotateY(Math.PI / 2);
  const bezelRim = new THREE.Mesh(bezelRimGeo, materials.joint);
  bezelRim.castShadow = true;
  outerBezel.add(bezelRim);

  // Solid back-plate cylinder
  const backPlateGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discThickness * 0.68, 40
  );
  backPlateGeo.rotateZ(Math.PI / 2);
  const backPlate = new THREE.Mesh(backPlateGeo, materials.joint);
  backPlate.position.set(-sign * 0.0010, 0, 0);
  backPlate.castShadow = true;
  backPlate.receiveShadow = true;
  outerBezel.add(backPlate);

  // 12 calibration tick marks around outer bezel
  for (let t = 0; t < 12; t++) {
    const angle = (t / 12) * Math.PI * 2;
    const tickGeo = new THREE.BoxGeometry(0.0022, 0.0046, 0.0018);
    const tick = new THREE.Mesh(tickGeo, materials.joint);
    tick.position.set(
      sign * 0.0038,
      Math.sin(angle) * (ELBOW_CONFIG.discOuterRadius - 0.0028),
      Math.cos(angle) * (ELBOW_CONFIG.discOuterRadius - 0.0028)
    );
    tick.rotation.x = angle;
    outerBezel.add(tick);
  }

  // ── Bearing Race Group ───────────────────────────────────────────────────
  const bearingRace = new THREE.Group();
  bearingRace.name = `${prefix}_BearingRace`;
  group.add(bearingRace);

  // Outer metallic race ring
  const outerRaceGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.discOuterRadius * 0.880,
    0.0018, 8, 36
  );
  outerRaceGeo.rotateY(Math.PI / 2);
  const outerRace = new THREE.Mesh(outerRaceGeo, materials.metallic);
  outerRace.position.set(sign * 0.0006, 0, 0);
  bearingRace.add(outerRace);

  // Inner metallic race ring
  const innerRaceGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.discOuterRadius * 0.760,
    0.0014, 8, 36
  );
  innerRaceGeo.rotateY(Math.PI / 2);
  const innerRace = new THREE.Mesh(innerRaceGeo, materials.metallic);
  innerRace.position.set(sign * 0.0010, 0, 0);
  bearingRace.add(innerRace);

  // ── Purple Emissive Accent Ring ──────────────────────────────────────────
  const accentGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.emissiveRingR,
    ELBOW_CONFIG.emissiveRingTube, 10, 44
  );
  accentGeo.rotateY(Math.PI / 2);
  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.name = `${prefix}_AccentRing`;
  accentRing.position.set(sign * 0.0022, 0, 0);
  group.add(accentRing);
  ledMeshes.push(accentRing);

  // ── Inner Disc Face ───────────────────────────────────────────────────────
  const innerDiscGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.emissiveRingR - 0.0040,
    ELBOW_CONFIG.emissiveRingR - 0.0040,
    ELBOW_CONFIG.discThickness * 0.35, 36
  );
  innerDiscGeo.rotateZ(Math.PI / 2);
  const innerDisc = new THREE.Mesh(innerDiscGeo, materials.joint);
  innerDisc.position.set(sign * 0.0016, 0, 0);
  innerDisc.castShadow = true;
  group.add(innerDisc);

  // ── Hub Cap Group ─────────────────────────────────────────────────────────
  const hubCap = new THREE.Group();
  hubCap.name = `${prefix}_HubCap`;
  group.add(hubCap);

  const hubBodyGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.hubCapRadius,
    ELBOW_CONFIG.hubCapRadius * 1.06,
    0.0062, 28
  );
  hubBodyGeo.rotateZ(Math.PI / 2);
  const hubBody = new THREE.Mesh(hubBodyGeo, materials.joint);
  hubBody.position.set(sign * 0.0040, 0, 0);
  hubCap.add(hubBody);

  const hubBevelGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.hubCapRadius * 0.840,
    0.0015, 6, 24
  );
  hubBevelGeo.rotateY(Math.PI / 2);
  const hubBevel = new THREE.Mesh(hubBevelGeo, materials.metallic);
  hubBevel.position.set(sign * 0.0052, 0, 0);
  hubCap.add(hubBevel);

  // Center purple indicator
  const centerDotGeo = new THREE.CylinderGeometry(0.0042, 0.0042, 0.0024, 16);
  centerDotGeo.rotateZ(Math.PI / 2);
  const centerDot = new THREE.Mesh(centerDotGeo, materials.purpleEmissive);
  centerDot.position.set(sign * 0.0058, 0, 0);
  hubCap.add(centerDot);
  ledMeshes.push(centerDot);

  // 6 hex micro-fasteners
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0013, 0.0013, 0.0028, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      sign * 0.0046,
      Math.sin(angle) * 0.0096,
      Math.cos(angle) * 0.0096
    );
    hubCap.add(bolt);
  }

  const nodes: ElbowDiscNodes = {
    group,
    outerBezel,
    bearingRace,
    accentRing,
    innerDisc,
    hubCap,
  };

  return { group, nodes, accentRingMesh: accentRing };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ELBOW FACTORY
// ─────────────────────────────────────────────────────────────────────────────
export function createElbow(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ElbowNodes {
  const elbowRoot = new THREE.Group();
  elbowRoot.name = side === -1 ? 'LeftElbowRoot' : 'RightElbowRoot';

  const ledMeshes: THREE.Mesh[] = [];

  // ════════════════════════════════════════════════════════════
  // 1. UPPER HOUSING — Clevis Forks + Upper Connector
  //    Stationary — anchored to the UpperArm distal cuff.
  // ════════════════════════════════════════════════════════════
  const upperHousing = new THREE.Group();
  upperHousing.name = 'ElbowUpperHousing';
  elbowRoot.add(upperHousing);

  // Upper mounting block — interfaces with upper arm spar
  const upperConnectorGeo = new THREE.BoxGeometry(0.048, 0.028, 0.042);
  const upperConnector = new THREE.Mesh(upperConnectorGeo, materials.joint);
  upperConnector.name = 'ElbowUpperConnector';
  upperConnector.position.set(0, 0.026, 0);
  upperConnector.castShadow = true;
  upperConnector.receiveShadow = true;
  upperHousing.add(upperConnector);

  // Upper collar socket flange (mates with UpperArm elbowSocketCuff)
  const upperCollarGeo = new THREE.CylinderGeometry(0.0310, 0.0335, 0.014, 30);
  const upperCollar = new THREE.Mesh(upperCollarGeo, materials.joint);
  upperCollar.position.set(0, 0.034, 0);
  upperCollar.castShadow = true;
  upperHousing.add(upperCollar);

  const upperCollarRingGeo = new THREE.TorusGeometry(0.0316, 0.0014, 6, 30);
  upperCollarRingGeo.rotateX(Math.PI / 2);
  const upperCollarRing = new THREE.Mesh(upperCollarRingGeo, materials.metallic);
  upperCollarRing.position.set(0, 0.040, 0);
  upperHousing.add(upperCollarRing);

  // ── Clevis cheek forks (bilateral, straddle the hinge barrel) ─────────────
  const forkWidth = 0.0112;
  const forkSpan = ELBOW_CONFIG.hingeWidth * 0.5 - forkWidth * 0.5;

  for (const fSide of [-1, 1]) {
    const forkGroup = new THREE.Group();
    forkGroup.position.set(fSide * forkSpan, 0.012, 0);

    // Main clevis arm — tall enough to bridge connector block to hinge center
    const armGeo = new THREE.BoxGeometry(forkWidth, 0.034, 0.038);
    const armMesh = new THREE.Mesh(armGeo, materials.joint);
    armMesh.castShadow = true;
    armMesh.receiveShadow = true;
    forkGroup.add(armMesh);

    // Eyelet wrapping the hinge axle — aligns precisely with hinge barrel
    const eyeletGeo = new THREE.CylinderGeometry(
      ELBOW_CONFIG.hingeRadius * 0.96,
      ELBOW_CONFIG.hingeRadius * 0.96,
      forkWidth, 28
    );
    eyeletGeo.rotateZ(Math.PI / 2);
    const eyelet = new THREE.Mesh(eyeletGeo, materials.joint);
    eyelet.position.set(0, -0.012, 0);
    eyelet.castShadow = true;
    forkGroup.add(eyelet);

    // Exterior structural stiffener rib
    const ribGeo = new THREE.BoxGeometry(0.0032, 0.030, 0.022);
    const rib = new THREE.Mesh(ribGeo, materials.joint);
    rib.position.set(fSide * (forkWidth * 0.5 + 0.0018), 0, 0.002);
    forkGroup.add(rib);

    upperHousing.add(forkGroup);
  }

  // Anterior protective half-cowl bridging the two forks
  const antCowlGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.hingeRadius * 1.06,
    ELBOW_CONFIG.hingeRadius * 1.06,
    ELBOW_CONFIG.hingeWidth * 0.70, 32, 1, false,
    -Math.PI * 0.48, Math.PI * 0.96
  );
  antCowlGeo.rotateZ(Math.PI / 2);
  const antCowl = new THREE.Mesh(antCowlGeo, materials.joint);
  antCowl.position.set(0, 0.006, 0);
  antCowl.castShadow = true;
  upperHousing.add(antCowl);

  // ════════════════════════════════════════════════════════════
  // 2. CENTRAL TRANSVERSE HINGE BARREL & STATOR CORE
  //    The core structural tube about which the forearm rotates.
  // ════════════════════════════════════════════════════════════
  const hingeCore = new THREE.Group();
  hingeCore.name = 'ElbowHingeCore';
  elbowRoot.add(hingeCore);

  const barrelGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.hingeRadius * 0.90,
    ELBOW_CONFIG.hingeRadius * 0.90,
    ELBOW_CONFIG.hingeWidth * 0.74, 34
  );
  barrelGeo.rotateZ(Math.PI / 2);
  const mainHingeBarrel = new THREE.Mesh(barrelGeo, materials.joint);
  mainHingeBarrel.name = 'ElbowMainHingeBarrel';
  mainHingeBarrel.castShadow = true;
  mainHingeBarrel.receiveShadow = true;
  hingeCore.add(mainHingeBarrel);

  // Crossed-roller bearing track grooves on each face of the barrel
  for (const bSide of [-1, 1]) {
    const trackGeo = new THREE.TorusGeometry(
      ELBOW_CONFIG.hingeRadius * 0.860,
      0.0022, 8, 30
    );
    trackGeo.rotateY(Math.PI / 2);
    const trackMesh = new THREE.Mesh(trackGeo, materials.metallic);
    trackMesh.position.set(bSide * (ELBOW_CONFIG.hingeWidth * 0.30), 0, 0);
    hingeCore.add(trackMesh);
  }

  // ════════════════════════════════════════════════════════════
  // 3. CENTRAL TRANSVERSE AXLE PIN ASSEMBLY
  //    Chrome axle pin spanning the full hinge width.
  // ════════════════════════════════════════════════════════════
  const centralPin = new THREE.Group();
  centralPin.name = 'ElbowCentralAxlePin';
  elbowRoot.add(centralPin);

  const pinShaftGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.axleRadius,
    ELBOW_CONFIG.axleRadius,
    ELBOW_CONFIG.axleLength, 28
  );
  pinShaftGeo.rotateZ(Math.PI / 2);
  const pinShaft = new THREE.Mesh(pinShaftGeo, materials.metallic);
  pinShaft.castShadow = true;
  centralPin.add(pinShaft);

  // Hollow conduit bore (visible axle detail)
  const boreGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.axleRadius * 0.46,
    ELBOW_CONFIG.axleRadius * 0.46,
    ELBOW_CONFIG.axleLength + 0.002, 16
  );
  boreGeo.rotateZ(Math.PI / 2);
  const boreMesh = new THREE.Mesh(boreGeo, materials.joint);
  centralPin.add(boreMesh);

  // Axle end caps
  for (const pSide of [-1, 1]) {
    const capGeo = new THREE.CylinderGeometry(
      ELBOW_CONFIG.axleRadius * 1.18,
      ELBOW_CONFIG.axleRadius * 1.18,
      0.0028, 20
    );
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, materials.joint);
    cap.position.set(pSide * (ELBOW_CONFIG.axleLength * 0.5 + 0.0014), 0, 0);
    centralPin.add(cap);
  }

  // ════════════════════════════════════════════════════════════
  // 4. DUAL CIRCULAR ACTUATOR DISCS — Lateral & Medial
  //    The dominant visual feature of the elbow.
  //    Each disc = beveled bezel + bearing race + purple ring + hub cap.
  // ════════════════════════════════════════════════════════════
  const latResult = createActuatorDisc(side, true, materials, ledMeshes);
  const medResult = createActuatorDisc(side, false, materials, ledMeshes);

  elbowRoot.add(latResult.group);
  elbowRoot.add(medResult.group);

  const lateralDisc = latResult.group;
  const medialDisc = medResult.group;
  const accentRing = latResult.accentRingMesh;
  const medialAccentRing = medResult.accentRingMesh;
  const lateralDiscNodes = latResult.nodes;
  const medialDiscNodes = medResult.nodes;

  // ════════════════════════════════════════════════════════════
  // 5. POSTERIOR HYDRAULIC DECELERATION DAMPER
  //    Chrome piston rod + dark titanium barrel.
  //    Parented to upperHousing — static structure.
  // ════════════════════════════════════════════════════════════
  const hydraulicRam = new THREE.Group();
  hydraulicRam.name = 'ElbowHydraulicRam';
  hydraulicRam.position.set(0, 0.004, -0.024);
  upperHousing.add(hydraulicRam);

  const cylGeo = new THREE.CylinderGeometry(0.0058, 0.0058, 0.032, 16);
  cylGeo.rotateX(0.26);
  const ramCylinder = new THREE.Mesh(cylGeo, materials.joint);
  ramCylinder.name = 'ElbowRamCylinder';
  ramCylinder.castShadow = true;
  hydraulicRam.add(ramCylinder);

  // Reinforcement collar rings on cylinder
  for (const cY of [-0.008, 0.008]) {
    const cRingGeo = new THREE.TorusGeometry(0.0064, 0.0012, 6, 16);
    const cRing = new THREE.Mesh(cRingGeo, materials.metallic);
    cRing.position.set(0, cY * Math.cos(0.26), cY * Math.sin(0.26) - 0.006);
    hydraulicRam.add(cRing);
  }

  const pisGeo = new THREE.CylinderGeometry(0.0032, 0.0032, 0.030, 14);
  pisGeo.rotateX(0.26);
  const ramPiston = new THREE.Mesh(pisGeo, materials.metallic);
  ramPiston.name = 'ElbowRamPiston';
  ramPiston.position.set(0, -0.012, -0.004);
  ramPiston.castShadow = true;
  hydraulicRam.add(ramPiston);

  // ════════════════════════════════════════════════════════════
  // 6. FOREARM PIVOT — The Single Rotational DOF
  //    All downstream geometry (forearm, wrist, hand) is parented here.
  //    Rotation around X-axis = elbow bend.
  // ════════════════════════════════════════════════════════════
  const forearmPivot = new THREE.Group();
  forearmPivot.name = side === -1 ? 'LeftForearmPivot' : 'RightForearmPivot';
  forearmPivot.position.set(0, 0, 0);
  elbowRoot.add(forearmPivot);

  const lowerHousing = new THREE.Group();
  lowerHousing.name = 'ElbowLowerHousing';
  forearmPivot.add(lowerHousing);

  // Central articulating knuckle (rotates around axle pin in the upper clevis)
  const knuckleGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.hingeRadius * 0.86,
    ELBOW_CONFIG.hingeRadius * 0.86,
    ELBOW_CONFIG.hingeWidth * 0.48, 30
  );
  knuckleGeo.rotateZ(Math.PI / 2);
  const knuckleMesh = new THREE.Mesh(knuckleGeo, materials.joint);
  knuckleMesh.castShadow = true;
  knuckleMesh.receiveShadow = true;
  lowerHousing.add(knuckleMesh);

  // Lower mounting stem dropping toward forearm proximal collar
  const stemGeo = new THREE.BoxGeometry(ELBOW_CONFIG.hingeWidth * 0.44, 0.026, 0.038);
  const stemMesh = new THREE.Mesh(stemGeo, materials.joint);
  stemMesh.position.set(0, -0.016, 0);
  stemMesh.castShadow = true;
  lowerHousing.add(stemMesh);

  // Lower docking collar — interfaces with Forearm.ts proximal collar
  const lowCollarGeo = new THREE.CylinderGeometry(0.028, 0.031, 0.014, 30);
  const lowCollar = new THREE.Mesh(lowCollarGeo, materials.joint);
  lowCollar.position.set(0, -0.026, 0);
  lowCollar.castShadow = true;
  lowerHousing.add(lowCollar);

  const lowCollarRingGeo = new THREE.TorusGeometry(0.0285, 0.0014, 6, 30);
  lowCollarRingGeo.rotateX(Math.PI / 2);
  const lowCollarRing = new THREE.Mesh(lowCollarRingGeo, materials.metallic);
  lowCollarRing.position.set(0, -0.020, 0);
  lowerHousing.add(lowCollarRing);

  // ── Olecranon Armor Shield ─────────────────────────────────────────────────
  // Posterior rounded protector — the "elbow tip" form.
  // Sculpted to read as a compound-curved panel, not a simple box.
  const olecWidth = ELBOW_CONFIG.hingeWidth * 0.62;
  const olecGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.hingeRadius * 0.78,
    ELBOW_CONFIG.hingeRadius * 0.66,
    olecWidth, 26, 2, false,
    Math.PI * 0.12, Math.PI * 0.76   // open arc on the posterior face
  );
  olecGeo.rotateZ(Math.PI / 2);
  const olecranonMesh = new THREE.Mesh(olecGeo, materials.joint);
  olecranonMesh.name = 'ElbowOlecranonArmor';
  olecranonMesh.position.set(0, -0.006, -ELBOW_CONFIG.hingeRadius * 0.88);
  olecranonMesh.rotation.x = -0.18;
  olecranonMesh.castShadow = true;
  olecranonMesh.receiveShadow = true;
  lowerHousing.add(olecranonMesh);

  // White ceramic olecranon outer cap
  const olecCapGeo = new THREE.SphereGeometry(
    ELBOW_CONFIG.hingeRadius * 0.62,
    18, 12, 0, Math.PI * 2, Math.PI * 0.30, Math.PI * 0.45
  );
  const olecCap = new THREE.Mesh(olecCapGeo, materials.armor);
  olecCap.name = 'ElbowOlecranonArmorCap';
  olecCap.position.set(0, -0.008, -ELBOW_CONFIG.hingeRadius * 0.96);
  olecCap.rotation.x = -0.22;
  olecCap.castShadow = true;
  lowerHousing.add(olecCap);

  // ════════════════════════════════════════════════════════════
  // 7. ANGULAR CONTROL API
  // ════════════════════════════════════════════════════════════
  let currentAngle: number = ELBOW_CONFIG.restingBend;
  forearmPivot.rotation.x = currentAngle;

  const setAngle = (angle: number) => {
    currentAngle = THREE.MathUtils.clamp(
      angle, ELBOW_CONFIG.maxBend, ELBOW_CONFIG.minBend
    );
    forearmPivot.rotation.x = currentAngle;
  };

  const getAngle = () => currentAngle;

  return {
    group: elbowRoot,
    forearmPivot,
    upperConnector,
    upperHousing,
    hingeCore,
    centralPin,
    lateralDisc,
    medialDisc,
    lowerHousing,
    accentRing,
    medialAccentRing,
    ledMeshes,
    hydraulicRam,
    ramPiston,
    ramCylinder,
    olecranonMesh,
    lateralDiscNodes,
    medialDiscNodes,
    setAngle,
    getAngle,
    // Backwards compatibility aliases
    mainHingeBarrel,
    lateralHub:   latResult.nodes.hubCap.children[0] as THREE.Mesh,
    medialHub:    medResult.nodes.hubCap.children[0] as THREE.Mesh,
    olecranonArmor: olecranonMesh,
    upperClevis:  upperConnector,
    lowerClevis:  knuckleMesh,
  };
}
