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

export const ELBOW_CONFIG = {
  hingeRadius:      0.0315,   // transverse hinge core outer radius (63.0 mm dia, scaled +10.5% for refined mecha proportion)
  hingeWidth:       0.0590,   // total axle span along X (59.0 mm, scaled +9.3% for confident athletic stance)
  discOuterRadius:  0.0345,   // circular actuator disc outer bezel radius (69.0 mm outer dia, substantial rotary actuator)
  discThickness:    0.0052,   // actuator side cover thickness (5.2 mm)
  emissiveRingR:    0.0262,   // signature purple accent ring radius (52.4 mm dia, scaled +11.5%)
  emissiveRingTube: 0.0020,   // accent ring tube thickness
  hubCapRadius:     0.0130,   // machined hub cap radius (26.0 mm dia)
  axleRadius:       0.0098,   // central axle pin radius (19.6 mm dia)
  axleLength:       0.0610,   // axle pin total length (61.0 mm)

  // Angular limits (radians) — rotation.x on forearmPivot
  neutralAngle:  0.00,
  minBend:       0.08,        // slight hyperextension guard
  maxBend:      -2.18,        // ≈ 125 ° maximum anatomical flexion
  restingBend:  -0.40,        // natural relaxed posture (~22.9° visual flexion)
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

  // Retaining rim torus — compact, crisp machined bezel rim
  const bezelRimGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.discOuterRadius - 0.0016,
    0.0018, 8, 32
  );
  bezelRimGeo.rotateY(Math.PI / 2);
  const bezelRim = new THREE.Mesh(bezelRimGeo, materials.joint);
  bezelRim.castShadow = true;
  outerBezel.add(bezelRim);

  // Solid back-plate cylinder
  const backPlateGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discOuterRadius,
    ELBOW_CONFIG.discThickness * 0.68, 32
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
    const tickGeo = new THREE.BoxGeometry(0.0018, 0.0035, 0.0013);
    const tick = new THREE.Mesh(tickGeo, materials.joint);
    tick.position.set(
      sign * 0.0028,
      Math.sin(angle) * (ELBOW_CONFIG.discOuterRadius - 0.0024),
      Math.cos(angle) * (ELBOW_CONFIG.discOuterRadius - 0.0024)
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
    0.0013, 6, 24
  );
  outerRaceGeo.rotateY(Math.PI / 2);
  const outerRace = new THREE.Mesh(outerRaceGeo, materials.metallic);
  outerRace.position.set(sign * 0.0004, 0, 0);
  bearingRace.add(outerRace);

  // Inner metallic race ring
  const innerRaceGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.discOuterRadius * 0.760,
    0.0011, 6, 24
  );
  innerRaceGeo.rotateY(Math.PI / 2);
  const innerRace = new THREE.Mesh(innerRaceGeo, materials.metallic);
  innerRace.position.set(sign * 0.0007, 0, 0);
  bearingRace.add(innerRace);

  // ── Signature Purple Emissive Halo Ring & Polished Raceway ─────────────
  const accentGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.emissiveRingR,
    ELBOW_CONFIG.emissiveRingTube * 0.9, 8, 32
  );
  accentGeo.rotateY(Math.PI / 2);
  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.name = `${prefix}_PurpleEmissiveRing`;
  accentRing.position.set(sign * 0.0018, 0, 0);
  group.add(accentRing);
  ledMeshes.push(accentRing);

  // Subtle bloom glow
  const bloomGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.emissiveRingR,
    ELBOW_CONFIG.emissiveRingTube * 1.6, 6, 24
  );
  bloomGeo.rotateY(Math.PI / 2);
  const bloomMesh = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloomMesh.position.copy(accentRing.position);
  group.add(bloomMesh);

  // Concentric Polished Metallic Raceway Bevel
  const raceBevelGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.emissiveRingR * 1.08,
    0.0010, 5, 24
  );
  raceBevelGeo.rotateY(Math.PI / 2);
  const raceBevel = new THREE.Mesh(raceBevelGeo, materials.metallic);
  raceBevel.position.set(sign * 0.0014, 0, 0);
  group.add(raceBevel);

  // ── Inner Disc Face ───────────────────────────────────────────────────────
  const innerDiscGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.emissiveRingR - 0.0028,
    ELBOW_CONFIG.emissiveRingR - 0.0028,
    ELBOW_CONFIG.discThickness * 0.35, 24
  );
  innerDiscGeo.rotateZ(Math.PI / 2);
  const innerDisc = new THREE.Mesh(innerDiscGeo, materials.joint);
  innerDisc.position.set(sign * 0.0011, 0, 0);
  innerDisc.castShadow = true;
  group.add(innerDisc);

  // ── Hub Cap Group ─────────────────────────────────────────────────────────
  const hubCap = new THREE.Group();
  hubCap.name = `${prefix}_HubCap`;
  group.add(hubCap);

  const hubBodyGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.hubCapRadius,
    ELBOW_CONFIG.hubCapRadius * 1.06,
    0.0044, 24
  );
  hubBodyGeo.rotateZ(Math.PI / 2);
  const hubBody = new THREE.Mesh(hubBodyGeo, materials.joint);
  hubBody.position.set(sign * 0.0030, 0, 0);
  hubCap.add(hubBody);

  const hubBevelGeo = new THREE.TorusGeometry(
    ELBOW_CONFIG.hubCapRadius * 0.840,
    0.0011, 5, 20
  );
  hubBevelGeo.rotateY(Math.PI / 2);
  const hubBevel = new THREE.Mesh(hubBevelGeo, materials.metallic);
  hubBevel.position.set(sign * 0.0039, 0, 0);
  hubCap.add(hubBevel);

  // Center axle boss (purple indicator core)
  const centerDotGeo = new THREE.CylinderGeometry(0.0030, 0.0030, 0.0018, 14);
  centerDotGeo.rotateZ(Math.PI / 2);
  const centerDot = new THREE.Mesh(centerDotGeo, materials.purpleEmissive);
  centerDot.position.set(sign * 0.0042, 0, 0);
  hubCap.add(centerDot);
  ledMeshes.push(centerDot);

  // 6 hex micro-fasteners
  const hexPitch = ELBOW_CONFIG.hubCapRadius * 0.60;
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0010, 0.0010, 0.0020, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      sign * 0.0035,
      Math.sin(angle) * hexPitch,
      Math.cos(angle) * hexPitch
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
  const upperConnectorGeo = new THREE.BoxGeometry(0.032, 0.024, 0.030);
  const upperConnector = new THREE.Mesh(upperConnectorGeo, materials.joint);
  upperConnector.name = 'ElbowUpperConnector';
  upperConnector.position.set(0, 0.021, 0);
  upperConnector.castShadow = true;
  upperConnector.receiveShadow = true;
  upperHousing.add(upperConnector);

  // Upper collar socket flange (mates flush with UpperArm elbowSocketCuff)
  const upperCollarGeo = new THREE.CylinderGeometry(0.0325, 0.0338, 0.010, 32);
  const upperCollar = new THREE.Mesh(upperCollarGeo, materials.joint);
  upperCollar.position.set(0, 0.0225, 0);
  upperCollar.castShadow = true;
  upperHousing.add(upperCollar);

  // ── CNC Structural Side Mounting Plates (Level 2 Medium Structure) ────────
  // Monolithic load-bearing plates with lightening pockets and linkage attachment lugs
  const forkWidth = 0.0085;
  const forkSpan = ELBOW_CONFIG.hingeWidth * 0.5 - forkWidth * 0.5;

  for (const fSide of [-1, 1]) {
    const forkGroup = new THREE.Group();
    forkGroup.name = fSide === -1 ? 'ElbowClevisPlate_L' : 'ElbowClevisPlate_R';
    forkGroup.position.set(fSide * forkSpan, 0, 0);

    // Monolithic structural bracket: spans from upper cuff down around the pivot axis
    const plateGeo = new THREE.CylinderGeometry(
      ELBOW_CONFIG.hingeRadius * 0.92,
      ELBOW_CONFIG.hingeRadius * 0.92,
      forkWidth, 32
    );
    plateGeo.rotateZ(Math.PI / 2);
    const plateMesh = new THREE.Mesh(plateGeo, materials.joint);
    plateMesh.position.set(0, 0, 0);
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    forkGroup.add(plateMesh);

    // Upper structural arm connecting plate to upper housing
    const upperArmSpanGeo = new THREE.BoxGeometry(forkWidth, 0.025, 0.030);
    const upperArmSpan = new THREE.Mesh(upperArmSpanGeo, materials.joint);
    upperArmSpan.position.set(0, 0.015, -0.002);
    upperArmSpan.castShadow = true;
    forkGroup.add(upperArmSpan);

    // Lightening pocket cutout
    const pocketGeo = new THREE.BoxGeometry(forkWidth + 0.002, 0.013, 0.013);
    const pocket = new THREE.Mesh(pocketGeo, materials.metallic);
    pocket.position.set(0, 0.015, -0.002);
    forkGroup.add(pocket);

    // Precision metallic retention bezel ring
    const ringGeo = new THREE.TorusGeometry(ELBOW_CONFIG.hingeRadius * 0.84, 0.0011, 6, 32);
    ringGeo.rotateY(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, materials.metallic);
    ring.position.set(fSide * (forkWidth * 0.5 + 0.0006), 0, 0);
    forkGroup.add(ring);

    // Integrated Linkage Attachment Lug (Anchors UpperArmStructuralLinkage)
    const lugGeo = new THREE.BoxGeometry(forkWidth, 0.011, 0.010);
    const lugMesh = new THREE.Mesh(lugGeo, materials.joint);
    lugMesh.position.set(0, 0.023, -0.010);
    forkGroup.add(lugMesh);

    const lugPinGeo = new THREE.CylinderGeometry(0.0016, 0.0016, forkWidth + 0.003, 12);
    lugPinGeo.rotateZ(Math.PI / 2);
    const lugPin = new THREE.Mesh(lugPinGeo, materials.metallic);
    lugPin.position.set(0, 0.023, -0.010);
    forkGroup.add(lugPin);

    upperHousing.add(forkGroup);
  }

  // Monolithic Anterior Clevis Shield & Transverse Cowl
  // Fully encloses the front quadrant above the hinge barrel, eliminating the open see-through gap
  const anteriorShieldGeo = new THREE.BoxGeometry(
    ELBOW_CONFIG.hingeWidth * 0.68,
    0.018,
    0.022
  );
  const upperElbowGuard = new THREE.Mesh(anteriorShieldGeo, materials.joint);
  upperElbowGuard.name = 'ElbowAnteriorClevisShield';
  upperElbowGuard.position.set(0, 0.018, 0.016);
  upperElbowGuard.castShadow = true;
  upperElbowGuard.receiveShadow = true;
  upperHousing.add(upperElbowGuard);

  // Precision-machined metallic front accent plate with dual hex fasteners
  const shieldFaceGeo = new THREE.BoxGeometry(
    ELBOW_CONFIG.hingeWidth * 0.54,
    0.011,
    0.0012
  );
  const shieldFace = new THREE.Mesh(shieldFaceGeo, materials.metallic);
  shieldFace.position.set(0, 0.018, 0.0272);
  upperHousing.add(shieldFace);

  for (const bX of [-0.012, 0.012]) {
    const boltGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.0016, 8);
    boltGeo.rotateX(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.metallic);
    bolt.position.set(bX, 0.018, 0.0280);
    upperHousing.add(bolt);
  }

  // ════════════════════════════════════════════════════════════
  // 2. DOMINANT CENTRAL TRANSVERSE HINGE BARREL (Level 1 Dominant Feature)
  //    Solid, continuous structural cylinder centered on Y = 0, Z = 0
  // ════════════════════════════════════════════════════════════
  const hingeCore = new THREE.Group();
  hingeCore.name = 'ElbowHingeCore';
  elbowRoot.add(hingeCore);

  // Dominant central housing barrel spanning full internal clevis width
  const barrelSpan = ELBOW_CONFIG.hingeWidth * 0.64;
  const barrelGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.hingeRadius * 0.90,
    ELBOW_CONFIG.hingeRadius * 0.90,
    barrelSpan, 36
  );
  barrelGeo.rotateZ(Math.PI / 2);
  const mainHingeBarrel = new THREE.Mesh(barrelGeo, materials.joint);
  mainHingeBarrel.name = 'ElbowDominantHingeBarrel';
  mainHingeBarrel.castShadow = true;
  mainHingeBarrel.receiveShadow = true;
  hingeCore.add(mainHingeBarrel);

  // ════════════════════════════════════════════════════════════
  // 3. CENTRAL TRANSVERSE AXLE PIN ASSEMBLY
  //    Chrome axle pin spanning the full hinge width with hollow conduit bore.
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

  // Hollow conduit bore
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
      0.0022, 20
    );
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, materials.joint);
    cap.position.set(pSide * (ELBOW_CONFIG.axleLength * 0.5 + 0.0011), 0, 0);
    centralPin.add(cap);
  }

  // ════════════════════════════════════════════════════════════
  // 4. DUAL CIRCULAR ACTUATOR DISCS — Lateral & Medial
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
  // 5. SUBSTANTIAL REAR HYDRAULIC/LINEAR DAMPER ASSEMBLY
  //    Solid structural actuator body with spherical rod ends (Level 2 Structure)
  // ════════════════════════════════════════════════════════════
  const hydraulicRam = new THREE.Group();
  hydraulicRam.name = 'ElbowHydraulicRam';
  hydraulicRam.position.set(0, 0.007, -0.018);
  upperHousing.add(hydraulicRam);

  // Compact damper body: 11.2mm diameter cylinder with machined cooling fins
  const cylGeo = new THREE.CylinderGeometry(0.0056, 0.0056, 0.028, 20);
  cylGeo.rotateX(0.22);
  const ramCylinder = new THREE.Mesh(cylGeo, materials.joint);
  ramCylinder.name = 'ElbowRamCylinder';
  ramCylinder.castShadow = true;
  hydraulicRam.add(ramCylinder);

  // Metallic finned collar
  const finGeo = new THREE.TorusGeometry(0.0062, 0.0011, 6, 20);
  finGeo.rotateX(Math.PI / 2 + 0.22);
  const fin = new THREE.Mesh(finGeo, materials.metallic);
  fin.position.set(0, 0.004, 0.001);
  hydraulicRam.add(fin);

  // Chrome piston rod: 6.4mm diameter
  const pisGeo = new THREE.CylinderGeometry(0.0032, 0.0032, 0.028, 16);
  pisGeo.rotateX(0.22);
  const ramPiston = new THREE.Mesh(pisGeo, materials.metallic);
  ramPiston.name = 'ElbowRamPiston';
  ramPiston.position.set(0, -0.010, -0.003);
  ramPiston.castShadow = true;
  hydraulicRam.add(ramPiston);

  // Spherical rod-end bearing on the lower knuckle attachment
  const rodEndGeo = new THREE.CylinderGeometry(0.0044, 0.0044, 0.0065, 14);
  rodEndGeo.rotateZ(Math.PI / 2);
  const rodEnd = new THREE.Mesh(rodEndGeo, materials.joint);
  rodEnd.position.set(0, -0.021, -0.007);
  hydraulicRam.add(rodEnd);

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
    ELBOW_CONFIG.hingeWidth * 0.48, 28
  );
  knuckleGeo.rotateZ(Math.PI / 2);
  const knuckleMesh = new THREE.Mesh(knuckleGeo, materials.joint);
  knuckleMesh.castShadow = true;
  knuckleMesh.receiveShadow = true;
  lowerHousing.add(knuckleMesh);

  // Lower mounting stem dropping toward forearm proximal collar
  const stemGeo = new THREE.BoxGeometry(ELBOW_CONFIG.hingeWidth * 0.48, 0.020, 0.030);
  const stemMesh = new THREE.Mesh(stemGeo, materials.joint);
  stemMesh.position.set(0, -0.009, 0);
  stemMesh.castShadow = true;
  lowerHousing.add(stemMesh);

  // Lower docking collar — interfaces flush with Forearm.ts proximal collar
  const lowCollarGeo = new THREE.CylinderGeometry(0.0318, 0.0346, 0.012, 28);
  const lowCollar = new THREE.Mesh(lowCollarGeo, materials.joint);
  lowCollar.position.set(0, -0.0150, 0);
  lowCollar.rotation.z = -side * 0.095;
  lowCollar.castShadow = true;
  lowerHousing.add(lowCollar);

  // ── Olecranon Armor Shield ─────────────────────────────────────────────────
  // Posterior protector — the "elbow tip" form, dark titanium structural knuckle.
  const olecWidth = ELBOW_CONFIG.hingeWidth * 0.58;
  const olecGeo = new THREE.CylinderGeometry(
    ELBOW_CONFIG.hingeRadius * 0.78,
    ELBOW_CONFIG.hingeRadius * 0.72,
    olecWidth, 28, 2, false,
    Math.PI * 0.15, Math.PI * 0.70
  );
  olecGeo.rotateZ(Math.PI / 2);
  const olecranonMesh = new THREE.Mesh(olecGeo, materials.joint);
  olecranonMesh.name = 'ElbowOlecranonArmor';
  olecranonMesh.position.set(0, -0.004, -ELBOW_CONFIG.hingeRadius * 0.84);
  olecranonMesh.rotation.x = -0.16;
  olecranonMesh.castShadow = true;
  olecranonMesh.receiveShadow = true;
  lowerHousing.add(olecranonMesh);

  // Metallic reinforcement rib along the olecranon spine
  const olecRibGeo = new THREE.BoxGeometry(0.0032, 0.020, 0.0045);
  const olecCap = new THREE.Mesh(olecRibGeo, materials.metallic);
  olecCap.name = 'ElbowOlecranonSpineRib';
  olecCap.position.set(0, -0.005, -ELBOW_CONFIG.hingeRadius * 0.90);
  olecCap.rotation.x = -0.16;
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
