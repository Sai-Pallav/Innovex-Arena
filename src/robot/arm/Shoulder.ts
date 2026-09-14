import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ═══════════════════════════════════════════════════════════════════════════════
// SHOULDER MODULE — Humanoid Robot Shoulder Assembly
//
// Built directly from the technical reference blueprint:
//   "HUMANOID ROBOT SHOULDER ASSEMBLY — Technical Reference for Three.js"
//
// 13 parts:
//   1  Torso Mounting Plate
//   2  Yaw Bearing Housing
//   3  Yaw Actuator (Motor + Gear)
//   4  Pitch Actuator Module
//   5  Pitch Bearing Ring
//   6  Central Joint Core
//   7  Roll Actuator Module
//   8  Outer Shoulder Shell (Left/Right)
//   9  Cable Routing Channel
//  10  Structural Support Bracket
//  11  Upper-Arm Yoke
//  12  Fasteners (Bolts — 4×M8 on 120mm square PCD)
//  13  Upper Arm (Top Section)  ← attachment stub only here
//
// Kinematic hierarchy (from blueprint):
//   shoulderRoot
//     └─ shoulderYaw    (Group, rotates Y ±180°)
//           └─ shoulderPitch  (Group, rotates X ±120°)
//                 └─ shoulderRoll   (Group, rotates Z ±90°)
//                       └─ shoulderVisual (Group)
//                             ├─ outerShell  (Mesh)
//                             ├─ mechanicalCore (Group)
//                             └─ upperArmYoke  (Group)  ← upperArm attaches here
//
// Reference dimensions (scaled × 0.60 for robot proportions):
//   Blueprint 240mm wide → 0.144m   240mm → 0.144m
//   Blueprint 260mm tall → 0.156m   180mm → 0.108m
//
// Coordinate convention:  +Y = up,  +Z = forward (anterior),  +X = robot's right
// side = -1 (left arm) or +1 (right arm)
// ═══════════════════════════════════════════════════════════════════════════════

// Scale factor: blueprint mm → Three.js meters
// 240mm blueprint ≈ 0.144m scene → factor = 0.0006
const S = 0.0006;

export interface ShoulderNodes {
  group: THREE.Group;

  // Kinematic chain groups (from blueprint hierarchy)
  shoulderYaw:   THREE.Group;   // rotates Y — mounted to torso
  shoulderPitch: THREE.Group;   // rotates X — child of yaw
  shoulderRoll:  THREE.Group;   // rotates Z — child of pitch
  visualGroup:   THREE.Group;   // shoulderVisual — contains geometry

  // Legacy aliases (kept for ArmAnimationController compatibility)
  jointGroup:        THREE.Group;   // = shoulderYaw
  armorGroup:        THREE.Group;   // = shell group inside visualGroup
  upperArmConnector: THREE.Group;   // = upperArmYoke
  innerStructure:    THREE.Group;   // = mechanicalCore

  // Key meshes
  shoulderArmor:   THREE.Mesh;  // outer shell
  torsoMountPlate: THREE.Mesh;  // part 1
  rotationalCore:  THREE.Mesh;  // part 6 central joint core
  outerRing:       THREE.Mesh;  // roll disc outer bezel ring
  innerRing:       THREE.Mesh;  // pitch bearing ring
  accentRing:      THREE.Mesh;  // purple emissive ring on roll disc

  // Sub-groups exposed for exploded-view animation
  yawBearingHousing: THREE.Group;   // part 2
  yawActuator:       THREE.Group;   // part 3
  pitchActuator:     THREE.Group;   // part 4
  pitchBearingRing:  THREE.Mesh;    // part 5
  rollActuator:      THREE.Group;   // part 7
  cableChannel:      THREE.Mesh;    // part 9
  supportBracket:    THREE.Group;   // part 10
  upperArmYoke:      THREE.Group;   // part 11
  rollDisc:          THREE.Group;   // the large lateral circular disc

  // Legacy aliases
  gimbalYoke:     THREE.Group;
  cycloidalDrive: THREE.Group;
  faceplateHub:   THREE.Group;
  damperActuator: THREE.Group;
  damperPiston:   THREE.Mesh;
  damperCylinder: THREE.Mesh;
  shoulderCollar?: THREE.Mesh;
  rotatingHub:    THREE.Mesh;
  ballJoint:      THREE.Mesh;
  pauldronCowl:   THREE.Mesh;
  socketApertureRim: THREE.Mesh;

  ledMeshes: THREE.Mesh[];
}

// ───────────────────────────────────────────────────────────────────────────────
// HELPER — bolt circle (M8 4×, 120mm square PCD from blueprint part 12)
// ───────────────────────────────────────────────────────────────────────────────
function addBoltSquare(
  parent: THREE.Object3D,
  pcd: number,           // half-side of square
  boltR: number,
  boltH: number,
  mat: THREE.Material,
  xOffset: number = 0
): void {
  const corners: [number, number][] = [
    [-pcd, -pcd], [pcd, -pcd], [pcd, pcd], [-pcd, pcd],
  ];
  for (const [y, z] of corners) {
    const g = new THREE.CylinderGeometry(boltR, boltR, boltH, 6);
    g.rotateZ(Math.PI / 2);
    const m = new THREE.Mesh(g, mat);
    m.position.set(xOffset, y, z);
    parent.add(m);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// HELPER — circular bearing ring stack (outer bezel, metallic race, purple LED)
// ───────────────────────────────────────────────────────────────────────────────
function buildBearingDisc(
  parent: THREE.Object3D,
  outerR: number,
  innerR: number,
  depth: number,
  tickCount: number,
  materials: RobotMaterialPalette,
  ledMeshes: THREE.Mesh[],
  xSign: number = 1
): { outerRing: THREE.Mesh; innerRing: THREE.Mesh; accentRing: THREE.Mesh } {
  // Outer bezel ring
  const bezelGeo = new THREE.TorusGeometry(outerR, outerR * 0.072, 10, 44);
  bezelGeo.rotateY(Math.PI / 2);
  const outerRing = new THREE.Mesh(bezelGeo, materials.joint);
  outerRing.castShadow = true;
  parent.add(outerRing);

  // Solid back-plate
  const backGeo = new THREE.CylinderGeometry(outerR * 0.98, outerR * 0.98, depth, 44);
  backGeo.rotateZ(Math.PI / 2);
  const backPlate = new THREE.Mesh(backGeo, materials.joint);
  backPlate.position.set(-xSign * depth * 0.35, 0, 0);
  backPlate.castShadow = true;
  backPlate.receiveShadow = true;
  parent.add(backPlate);

  // Calibration ticks on outer bezel
  for (let t = 0; t < tickCount; t++) {
    const a = (t / tickCount) * Math.PI * 2;
    const tg = new THREE.BoxGeometry(0.0024, 0.0050, 0.0018);
    const tm = new THREE.Mesh(tg, materials.joint);
    tm.position.set(xSign * 0.0040, Math.sin(a) * outerR * 0.92, Math.cos(a) * outerR * 0.92);
    tm.rotation.x = a;
    parent.add(tm);
  }

  // Metallic crossed-roller bearing race
  const raceGeo = new THREE.TorusGeometry(outerR * 0.80, outerR * 0.040, 8, 40);
  raceGeo.rotateY(Math.PI / 2);
  const innerRing = new THREE.Mesh(raceGeo, materials.metallic);
  innerRing.position.set(xSign * 0.0018, 0, 0);
  parent.add(innerRing);

  // Purple emissive accent ring — 70% of outer radius
  const accentR = outerR * 0.70;
  const accentGeo = new THREE.TorusGeometry(accentR, accentR * 0.058, 10, 44);
  accentGeo.rotateY(Math.PI / 2);
  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.position.set(xSign * 0.0030, 0, 0);
  parent.add(accentRing);
  ledMeshes.push(accentRing);

  // Hub cap
  const hubR = innerR * 1.10;
  const hubGeo = new THREE.CylinderGeometry(hubR, hubR * 1.04, depth * 0.90, 30);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, materials.joint);
  hub.position.set(xSign * 0.0042, 0, 0);
  parent.add(hub);

  // Hub bevel metallic ring
  const hBevelGeo = new THREE.TorusGeometry(hubR * 0.86, hubR * 0.10, 6, 26);
  hBevelGeo.rotateY(Math.PI / 2);
  const hBevel = new THREE.Mesh(hBevelGeo, materials.metallic);
  hBevel.position.set(xSign * 0.0058, 0, 0);
  parent.add(hBevel);

  // Purple center indicator dot
  const dotGeo = new THREE.CylinderGeometry(hubR * 0.30, hubR * 0.30, 0.0024, 16);
  dotGeo.rotateZ(Math.PI / 2);
  const dot = new THREE.Mesh(dotGeo, materials.purpleEmissive);
  dot.position.set(xSign * 0.0066, 0, 0);
  parent.add(dot);
  ledMeshes.push(dot);

  // 6 hex micro-fasteners
  for (let b = 0; b < 6; b++) {
    const ang = (b / 6) * Math.PI * 2;
    const bg = new THREE.CylinderGeometry(0.0013, 0.0013, 0.0030, 6);
    bg.rotateZ(Math.PI / 2);
    const bm = new THREE.Mesh(bg, materials.joint);
    bm.position.set(xSign * 0.0050, Math.sin(ang) * hubR * 0.66, Math.cos(ang) * hubR * 0.66);
    parent.add(bm);
  }

  return { outerRing, innerRing, accentRing };
}

// ───────────────────────────────────────────────────────────────────────────────
// OUTER SHOULDER SHELL GEOMETRY (Part 8)
//
// From blueprint front/side views:
//   - Large white organic shell wrapping from the top of the torso mount
//     around the crown and down the anterior/posterior faces
//   - Opens on the LATERAL side (disc face fully exposed)
//   - Opens at the BOTTOM to expose the upper-arm yoke
//   - Cable routing channel groove runs along the lateral-posterior edge (part 9)
//
// Approach: parameterised dual-layer shell, wide crown (~120mm radius),
// height spans from +75mm above joint centre to −60mm below.
// ───────────────────────────────────────────────────────────────────────────────
function createOuterShellGeo(side: -1 | 1): THREE.BufferGeometry {
  const radialSegs = 40;
  const heightSegs = 28;
  const positions: number[] = [];
  const uvs:       number[] = [];
  const indices:   number[] = [];

  const thickness = 0.0040;     // 4mm wall thickness (matches blueprint "4mm composite")

  // Outer radius profile sampled in blueprint side view:
  //   Crown (v=0): r ≈ 72mm  (0.043m)
  //   Mid-belly (v=0.35): r ≈ 84mm (0.050m) — widest point
  //   Equator (v=0.55): r ≈ 76mm (0.046m)
  //   Lower lip (v=1.0): r ≈ 52mm (0.031m)
  function shellRadius(v: number): number {
    return 0.0430
      + 0.0070 * Math.sin(v * Math.PI * 0.90)  // belly swell
      - 0.0130 * Math.pow(v, 1.4);             // lower taper
  }

  // Y extent: top = +0.075, bottom = -0.060
  const yTop    =  0.075;
  const yBottom = -0.060;

  function getVert(layer: 0 | 1, iy: number, ix: number): THREE.Vector3 {
    const v   = iy / heightSegs;
    const u   = ix / radialSegs;
    const phi = u * Math.PI * 2;

    const sinP = Math.sin(phi);
    const cosP = Math.cos(phi);

    // Lateral factor: +1 on the disc-face side, −1 on torso side
    const latFactor = sinP * side;

    // --- Angular coverage ---
    // The shell is OPEN on the lateral disc face.
    // We do this by reducing the radius to near-zero when approaching the lateral opening.
    // Lateral opening: |phi − (side>0 ? π/2 : 3π/2)| < openingHalfAngle
    const lateralPhi = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    const angDist = Math.abs(phi - (side > 0 ? Math.PI / 2 : 3 * Math.PI / 2));
    const openAngle = Math.PI * 0.44;  // ±79° opening on lateral face

    // Blend factor: 0 = fully open, 1 = fully present
    const openBlend = Math.min(1, Math.max(0, (Math.abs(Math.PI - angDist < angDist ? Math.PI - angDist : angDist) - openAngle) / (Math.PI * 0.10)));

    // Bottom opening for the yoke (lower lip rises on the lateral+anterior side)
    let yLip = yBottom;
    if (latFactor > 0.0) {
      yLip = yBottom + 0.022 * latFactor;  // lateral side lifts 22mm
    }
    // Anterior face also slightly opens at bottom for clearance
    if (cosP > 0.50) {
      yLip = yBottom + 0.010 * (cosP - 0.50) / 0.50;
    }

    const y = yTop - v * (yTop - yLip);

    // Full shell radius
    let r = shellRadius(v);

    // Posterior (rear) fullness — shell wraps further back
    if (cosP < -0.20) {
      r += 0.006 * Math.max(0, -cosP - 0.20);
    }

    // Slight anterior forward lean matching blueprint side silhouette
    if (cosP > 0.35) {
      r += 0.004 * (cosP - 0.35);
    }

    // Apply lateral opening: pinch radius toward zero
    r *= (0.06 + 0.94 * openBlend);

    const rBase = layer === 0 ? r : Math.max(0.001, r - thickness);

    return new THREE.Vector3(
      rBase * sinP * 1.02,
      y,
      rBase * cosP * 1.05
    );
  }

  const vCount = (heightSegs + 1) * (radialSegs + 1);

  for (let layer = 0; layer < 2; layer++) {
    for (let iy = 0; iy <= heightSegs; iy++) {
      for (let ix = 0; ix <= radialSegs; ix++) {
        const v3 = getVert(layer as 0 | 1, iy, ix);
        positions.push(v3.x, v3.y, v3.z);
        uvs.push(ix / radialSegs, iy / heightSegs);
      }
    }
  }

  const stride = radialSegs + 1;

  // Outer face
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = iy * stride + ix;
      const b = (iy + 1) * stride + ix;
      const c = (iy + 1) * stride + (ix + 1);
      const d = iy * stride + (ix + 1);
      indices.push(a, b, d, b, c, d);
    }
  }

  // Inner face (reversed winding)
  const iO = vCount;
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = iO + iy * stride + ix;
      const b = iO + (iy + 1) * stride + ix;
      const c = iO + (iy + 1) * stride + (ix + 1);
      const d = iO + iy * stride + (ix + 1);
      indices.push(a, d, b, b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
export function createShoulder(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ShoulderNodes {
  const ledMeshes: THREE.Mesh[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // ROOT — the fixed anchor in torso space
  // ─────────────────────────────────────────────────────────────────────────
  const shoulderRoot = new THREE.Group();
  shoulderRoot.name = side === -1 ? 'LeftShoulderRoot' : 'RightShoulderRoot';

  // =========================================================================
  // PART 1 — TORSO MOUNTING PLATE
  // Blueprint: 120mm × 120mm square plate, 4×M8 bolts on 120mm PCD,
  //            faces medially (toward torso), dark titanium.
  // =========================================================================
  const torsoMountGroup = new THREE.Group();
  torsoMountGroup.name = 'TorsoMountInterface';
  torsoMountGroup.position.set(-side * 0.0110, 0.010, 0);
  shoulderRoot.add(torsoMountGroup);

  // Square mounting plate
  const mpGeo = new THREE.BoxGeometry(0.008, 0.072, 0.072);
  const torsoMountPlate = new THREE.Mesh(mpGeo, materials.joint);
  torsoMountPlate.name = 'TorsoMountPlate';
  torsoMountPlate.castShadow = true;
  torsoMountPlate.receiveShadow = true;
  torsoMountGroup.add(torsoMountPlate);

  // Chamfered bevel rim around the plate
  const plateRimGeo = new THREE.BoxGeometry(0.0068, 0.0740, 0.0740);
  const plateRim = new THREE.Mesh(plateRimGeo, materials.metallic);
  plateRim.position.set(side * 0.0008, 0, 0);
  torsoMountGroup.add(plateRim);

  // 4×M8 bolts on 60mm half-diagonal
  addBoltSquare(torsoMountGroup, 0.030, 0.0042, 0.0090, materials.metallic, side * 0.0050);

  // =========================================================================
  // KINEMATIC CHAIN — 3 DOF
  // shoulderYaw (Y) → shoulderPitch (X) → shoulderRoll (Z)
  // All pivot at a common centre in the mechanical core
  // =========================================================================
  const shoulderYaw = new THREE.Group();
  shoulderYaw.name = side === -1 ? 'LeftShoulderYaw' : 'RightShoulderYaw';
  shoulderRoot.add(shoulderYaw);

  const shoulderPitch = new THREE.Group();
  shoulderPitch.name = side === -1 ? 'LeftShoulderPitch' : 'RightShoulderPitch';
  shoulderYaw.add(shoulderPitch);

  const shoulderRoll = new THREE.Group();
  shoulderRoll.name = side === -1 ? 'LeftShoulderRoll' : 'RightShoulderRoll';
  shoulderPitch.add(shoulderRoll);

  // All visible geometry lives here
  const visualGroup = new THREE.Group();
  visualGroup.name = 'ShoulderVisual';
  shoulderRoll.add(visualGroup);

  // =========================================================================
  // PART 2 — YAW BEARING HOUSING
  // Blueprint: large dark cylindrical barrel on the torso-facing side,
  //            houses the yaw axis bearing stack.
  //            Diameter ≈ 80mm → 0.048m,  depth ≈ 36mm → 0.022m
  // =========================================================================
  const yawBearingHousing = new THREE.Group();
  yawBearingHousing.name = 'YawBearingHousing';
  yawBearingHousing.position.set(-side * 0.022, 0.012, 0);
  visualGroup.add(yawBearingHousing);

  // Main housing barrel
  const ybhGeo = new THREE.CylinderGeometry(0.0240, 0.0240, 0.022, 36);
  ybhGeo.rotateZ(Math.PI / 2);
  const ybhMesh = new THREE.Mesh(ybhGeo, materials.joint);
  ybhMesh.castShadow = true;
  ybhMesh.receiveShadow = true;
  yawBearingHousing.add(ybhMesh);

  // Front face disc (metallic precision face)
  const ybhFaceGeo = new THREE.CylinderGeometry(0.0238, 0.0238, 0.0030, 36);
  ybhFaceGeo.rotateZ(Math.PI / 2);
  const ybhFace = new THREE.Mesh(ybhFaceGeo, materials.metallic);
  ybhFace.position.set(side * 0.0118, 0, 0);
  yawBearingHousing.add(ybhFace);

  // Housing retaining flange ring
  const ybhFlangeGeo = new THREE.TorusGeometry(0.0240, 0.0016, 6, 36);
  ybhFlangeGeo.rotateY(Math.PI / 2);
  const ybhFlange = new THREE.Mesh(ybhFlangeGeo, materials.metallic);
  ybhFlange.position.set(side * 0.0120, 0, 0);
  yawBearingHousing.add(ybhFlange);

  // 8 hex bolts around housing perimeter
  for (let b = 0; b < 8; b++) {
    const a = (b / 8) * Math.PI * 2;
    const bg = new THREE.CylinderGeometry(0.0012, 0.0012, 0.0026, 6);
    bg.rotateZ(Math.PI / 2);
    const bm = new THREE.Mesh(bg, materials.metallic);
    bm.position.set(side * 0.0130, Math.sin(a) * 0.0210, Math.cos(a) * 0.0210);
    yawBearingHousing.add(bm);
  }

  // =========================================================================
  // PART 3 — YAW ACTUATOR (Motor + Gear)
  // Blueprint: cylindrical motor body behind/above the yaw housing,
  //            angled slightly — dark titanium with gear ring
  // =========================================================================
  const yawActuator = new THREE.Group();
  yawActuator.name = 'YawActuator';
  yawActuator.position.set(-side * 0.010, 0.030, -0.018);
  yawActuator.rotation.z = -side * 0.30;
  visualGroup.add(yawActuator);

  // Motor body
  const yaBodyGeo = new THREE.CylinderGeometry(0.0115, 0.0115, 0.040, 18);
  const yaBody = new THREE.Mesh(yaBodyGeo, materials.joint);
  yaBody.castShadow = true;
  yawActuator.add(yaBody);

  // Gear ring on output shaft
  const yaGearGeo = new THREE.CylinderGeometry(0.0130, 0.0130, 0.010, 24);
  const yaGear = new THREE.Mesh(yaGearGeo, materials.joint);
  yaGear.position.y = -0.025;
  yawActuator.add(yaGear);

  // Gear teeth approximation (12 small radial protrusions)
  for (let t = 0; t < 12; t++) {
    const a = (t / 12) * Math.PI * 2;
    const tg = new THREE.BoxGeometry(0.003, 0.006, 0.003);
    const tm = new THREE.Mesh(tg, materials.joint);
    tm.position.set(Math.cos(a) * 0.0140, -0.025, Math.sin(a) * 0.0140);
    yawActuator.add(tm);
  }

  // Collar at base
  const yaCollarGeo = new THREE.CylinderGeometry(0.0120, 0.0120, 0.006, 18);
  const yaCollar = new THREE.Mesh(yaCollarGeo, materials.metallic);
  yaCollar.position.y = 0.023;
  yawActuator.add(yaCollar);

  // =========================================================================
  // PART 4 — PITCH ACTUATOR MODULE
  // Blueprint: cylindrical module on the anterior-superior face,
  //            perpendicular to the pitch axis (runs along Z)
  // =========================================================================
  const pitchActuator = new THREE.Group();
  pitchActuator.name = 'PitchActuator';
  pitchActuator.position.set(side * 0.008, 0.020, 0.028);
  pitchActuator.rotation.x = -0.22;
  visualGroup.add(pitchActuator);

  const paBodyGeo = new THREE.CylinderGeometry(0.0108, 0.0108, 0.038, 18);
  const paBody = new THREE.Mesh(paBodyGeo, materials.joint);
  paBody.castShadow = true;
  pitchActuator.add(paBody);

  // Output shaft stub
  const paShaftGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.018, 14);
  const paShaft = new THREE.Mesh(paShaftGeo, materials.metallic);
  paShaft.position.y = -0.028;
  pitchActuator.add(paShaft);

  // Mounting collar
  const paMountGeo = new THREE.CylinderGeometry(0.0118, 0.0118, 0.007, 18);
  const paMount = new THREE.Mesh(paMountGeo, materials.joint);
  paMount.position.y = 0.022;
  pitchActuator.add(paMount);

  const paMountRingGeo = new THREE.TorusGeometry(0.0118, 0.0012, 6, 18);
  const paMountRing = new THREE.Mesh(paMountRingGeo, materials.metallic);
  paMountRing.position.y = 0.024;
  pitchActuator.add(paMountRing);

  // =========================================================================
  // PART 5 — PITCH BEARING RING
  // Blueprint: large flat ring around the pitch axis (perpendicular to Z),
  //            metallic, diameter ≈ 80mm → 0.048m
  // =========================================================================
  const pitchBearingGeo = new THREE.TorusGeometry(0.0300, 0.0038, 10, 44);
  pitchBearingGeo.rotateX(Math.PI / 2);
  const pitchBearingRing = new THREE.Mesh(pitchBearingGeo, materials.metallic);
  pitchBearingRing.name = 'PitchBearingRing';
  pitchBearingRing.position.set(side * 0.004, 0.012, 0);
  pitchBearingRing.castShadow = true;
  visualGroup.add(pitchBearingRing);

  // Bearing race inner track
  const pitchTrackGeo = new THREE.TorusGeometry(0.0258, 0.0016, 8, 40);
  pitchTrackGeo.rotateX(Math.PI / 2);
  const pitchTrack = new THREE.Mesh(pitchTrackGeo, materials.joint);
  pitchTrack.position.set(side * 0.004, 0.012, 0);
  visualGroup.add(pitchTrack);

  // =========================================================================
  // PART 6 — CENTRAL JOINT CORE
  // Blueprint: multi-tier cylindrical/spherical dark core connecting all 3
  //            actuator axes. The structural heart of the shoulder.
  //            From transparent view: layered cylinders of decreasing radius
  // =========================================================================
  const mechanicalCore = new THREE.Group();
  mechanicalCore.name = 'MechanicalCore';
  mechanicalCore.position.set(side * 0.004, 0.012, 0);
  visualGroup.add(mechanicalCore);

  // Outer housing sphere (primary visual mass)
  const coreGeo = new THREE.SphereGeometry(0.0340, 34, 24);
  const rotationalCore = new THREE.Mesh(coreGeo, materials.joint);
  rotationalCore.name = 'CentralJointCore';
  rotationalCore.castShadow = true;
  rotationalCore.receiveShadow = true;
  mechanicalCore.add(rotationalCore);

  // Equatorial reinforcement band (X-axis oriented — pitch axis)
  const eqBandGeo = new THREE.CylinderGeometry(0.0348, 0.0348, 0.0160, 40);
  eqBandGeo.rotateZ(Math.PI / 2);
  const eqBand = new THREE.Mesh(eqBandGeo, materials.joint);
  mechanicalCore.add(eqBand);

  const eqRingGeo = new THREE.TorusGeometry(0.0348, 0.0015, 8, 40);
  eqRingGeo.rotateX(Math.PI / 2);
  const eqRing = new THREE.Mesh(eqRingGeo, materials.metallic);
  mechanicalCore.add(eqRing);

  // Inner structural layer (visible in transparent view)
  const innerCoreGeo = new THREE.CylinderGeometry(0.0200, 0.0200, 0.0380, 28);
  innerCoreGeo.rotateZ(Math.PI / 2);
  const innerCore = new THREE.Mesh(innerCoreGeo, materials.joint);
  mechanicalCore.add(innerCore);

  // Innermost hub with purple vertical LED strip
  const innerHubGeo = new THREE.CylinderGeometry(0.0110, 0.0110, 0.0200, 20);
  innerHubGeo.rotateZ(Math.PI / 2);
  const innerHub = new THREE.Mesh(innerHubGeo, materials.joint);
  mechanicalCore.add(innerHub);

  // Purple vertical indicator strip on core (from blueprint — thin glowing line)
  const coreStripGeo = new THREE.BoxGeometry(0.0020, 0.0340, 0.0030);
  const coreStrip = new THREE.Mesh(coreStripGeo, materials.purpleEmissive);
  coreStrip.name = 'CorePurpleStrip';
  coreStrip.position.set(side * 0.0360, 0, -0.0020);
  visualGroup.add(coreStrip);
  ledMeshes.push(coreStrip);

  // =========================================================================
  // PART 7 — ROLL ACTUATOR MODULE
  // Blueprint: cylindrical actuator on the lateral face, oriented along X,
  //            this is the most prominent feature — drives the roll axis.
  //            The large disc (parts 2 of the roll assembly) is on this face.
  // =========================================================================
  const rollActuator = new THREE.Group();
  rollActuator.name = 'RollActuator';
  rollActuator.position.set(side * 0.022, 0.012, 0.006);
  rollActuator.rotation.y = side * 0.14;  // slight toe-in toward viewer
  visualGroup.add(rollActuator);

  // ── Roll actuator barrel (housing behind the disc) ───────────────────────
  const raBodyGeo = new THREE.CylinderGeometry(0.0115, 0.0115, 0.028, 18);
  raBodyGeo.rotateZ(Math.PI / 2);
  const raBody = new THREE.Mesh(raBodyGeo, materials.joint);
  raBody.castShadow = true;
  rollActuator.add(raBody);

  // ── THE DOMINANT LATERAL CIRCULAR DISC (Roll bearing + actuator face) ────
  // This is the most distinctive visual feature — matches blueprint exactly:
  // Outer R ≈ 52mm → 0.031m, with outer bezel, bearing race, purple ring, hub
  const rollDisc = new THREE.Group();
  rollDisc.name = 'RollActuatorDisc';
  rollActuator.add(rollDisc);

  const discR = 0.0390;  // outer disc radius (~65mm at full scale, dominant feature)
  const discSign = side;

  const discRings = buildBearingDisc(
    rollDisc,
    discR,
    0.0140,     // hub cap inner radius
    0.0070,     // disc depth
    16,         // tick count
    materials,
    ledMeshes,
    discSign
  );

  const outerRing  = discRings.outerRing;
  const innerRing  = discRings.innerRing;
  const accentRing = discRings.accentRing;

  // =========================================================================
  // PARTS 9 & 10 — CABLE ROUTING CHANNEL + STRUCTURAL SUPPORT BRACKET
  // =========================================================================

  // Part 9 — Cable routing channel: shallow groove running along the
  // posterior-lateral edge of the outer shell
  const cableChannelGeo = new THREE.BoxGeometry(0.007, 0.062, 0.006);
  const cableChannel = new THREE.Mesh(cableChannelGeo, materials.joint);
  cableChannel.name = 'CableRoutingChannel';
  cableChannel.position.set(side * 0.032, 0.018, -0.026);
  cableChannel.rotation.z = side * 0.15;
  cableChannel.castShadow = true;
  visualGroup.add(cableChannel);

  // Conduit tube inside channel
  const conduitGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.058, 10);
  const conduit = new THREE.Mesh(conduitGeo, materials.joint);
  conduit.position.set(0, 0, 0.004);
  cableChannel.add(conduit);

  // Part 10 — Structural support bracket: L-shaped plate on torso side
  const supportBracket = new THREE.Group();
  supportBracket.name = 'StructuralSupportBracket';
  supportBracket.position.set(-side * 0.012, 0.012, 0);
  visualGroup.add(supportBracket);

  // Vertical arm of bracket
  const sbVertGeo = new THREE.BoxGeometry(0.008, 0.054, 0.016);
  const sbVert = new THREE.Mesh(sbVertGeo, materials.joint);
  sbVert.position.set(0, 0.004, 0);
  sbVert.castShadow = true;
  supportBracket.add(sbVert);

  // Horizontal arm of bracket
  const sbHorzGeo = new THREE.BoxGeometry(0.028, 0.007, 0.016);
  const sbHorz = new THREE.Mesh(sbHorzGeo, materials.joint);
  sbHorz.position.set(side * 0.010, -0.024, 0);
  supportBracket.add(sbHorz);

  // Gusset triangular rib
  const sbGussetGeo = new THREE.BoxGeometry(0.006, 0.018, 0.012);
  const sbGusset = new THREE.Mesh(sbGussetGeo, materials.joint);
  sbGusset.position.set(side * 0.005, -0.012, 0);
  sbGusset.rotation.z = -side * 0.52;
  supportBracket.add(sbGusset);

  // 4 mounting bolts on bracket face
  for (const [by, bz] of [[-0.016, 0.005], [0.020, 0.005], [-0.016, -0.005], [0.020, -0.005]]) {
    const boltGeo = new THREE.CylinderGeometry(0.0014, 0.0014, 0.0030, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const boltMesh = new THREE.Mesh(boltGeo, materials.metallic);
    boltMesh.position.set(-side * 0.005, by, bz);
    supportBracket.add(boltMesh);
  }

  // =========================================================================
  // PART 11 — UPPER-ARM YOKE
  // Blueprint: heavy U-shaped titanium fork dropping from the central core,
  //            with bushing eyelets and a transverse pin for the upper-arm attachment.
  //            This is where upperArm.group gets parented.
  // =========================================================================
  const upperArmYoke = new THREE.Group();
  upperArmYoke.name = 'UpperArmYoke';
  upperArmYoke.position.set(0, -0.026, 0);
  // Note: positioned inside shoulderYaw so it follows all 3 rotation axes
  shoulderYaw.add(upperArmYoke);

  // Yoke bridge / crosshead
  const yokeBridgeGeo = new THREE.BoxGeometry(0.072, 0.010, 0.030);
  const yokeBridge = new THREE.Mesh(yokeBridgeGeo, materials.joint);
  yokeBridge.position.set(0, 0, 0);
  yokeBridge.castShadow = true;
  yokeBridge.receiveShadow = true;
  upperArmYoke.add(yokeBridge);

  // Left & right fork arms extending downward
  for (const fSide of [-1, 1]) {
    const forkGeo = new THREE.BoxGeometry(0.008, 0.036, 0.026);
    const fork = new THREE.Mesh(forkGeo, materials.joint);
    fork.position.set(fSide * 0.032, -0.018, 0);
    fork.castShadow = true;
    upperArmYoke.add(fork);

    // Bushing eyelet on each fork arm
    const eyeletGeo = new THREE.CylinderGeometry(0.0068, 0.0068, 0.010, 16);
    eyeletGeo.rotateZ(Math.PI / 2);
    const eyelet = new THREE.Mesh(eyeletGeo, materials.joint);
    eyelet.position.set(fSide * 0.032, -0.030, 0);
    upperArmYoke.add(eyelet);
  }

  // Transverse pin connecting both fork arms
  const yokePinGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.074, 14);
  yokePinGeo.rotateZ(Math.PI / 2);
  const yokePin = new THREE.Mesh(yokePinGeo, materials.metallic);
  yokePin.position.set(0, -0.030, 0);
  upperArmYoke.add(yokePin);

  // Mounting collar on yoke bottom (receives upper arm proximal collar)
  const yokeCollarGeo = new THREE.CylinderGeometry(0.0348, 0.0368, 0.016, 30);
  const yokeCollar = new THREE.Mesh(yokeCollarGeo, materials.joint);
  yokeCollar.name = 'YokeUpperArmCollar';
  yokeCollar.position.set(0, -0.010, 0);
  yokeCollar.castShadow = true;
  yokeCollar.receiveShadow = true;
  upperArmYoke.add(yokeCollar);

  const yokeCollarRingGeo = new THREE.TorusGeometry(0.0352, 0.0015, 6, 30);
  yokeCollarRingGeo.rotateX(Math.PI / 2);
  const yokeCollarRing = new THREE.Mesh(yokeCollarRingGeo, materials.metallic);
  yokeCollarRing.position.set(0, -0.004, 0);
  upperArmYoke.add(yokeCollarRing);

  // =========================================================================
  // PART 8 — OUTER SHOULDER SHELL
  // Blueprint: large white ceramic shell wrapping the entire assembly crown.
  // Sits as sibling of jointGroup so it can be animated independently
  // (armor opens / closes in exploded view).
  // =========================================================================
  const armorGroup = new THREE.Group();
  armorGroup.name = 'ShoulderArmorGroup';
  shoulderRoot.add(armorGroup);

  const shellGeo = createOuterShellGeo(side);
  const shoulderArmor = new THREE.Mesh(shellGeo, materials.armorDoubleSide);
  shoulderArmor.name = side === -1 ? 'LeftOuterShell' : 'RightOuterShell';
  shoulderArmor.castShadow = true;
  shoulderArmor.receiveShadow = true;
  armorGroup.add(shoulderArmor);

  // Crown crest ridge strip along the top of the shell
  const crestGeo = new THREE.BoxGeometry(0.0038, 0.012, 0.058);
  const crestMesh = new THREE.Mesh(crestGeo, materials.armor);
  crestMesh.name = 'ShellCrownCrest';
  crestMesh.position.set(0, 0.074, 0.004);
  crestMesh.rotation.x = 0.06;
  armorGroup.add(crestMesh);

  // Secondary armor lip panel on the anterior (forward-facing) edge
  const lipGeo = new THREE.BoxGeometry(0.006, 0.022, 0.010);
  const anteriorLip = new THREE.Mesh(lipGeo, materials.armor);
  anteriorLip.name = 'AnteriorShellLip';
  anteriorLip.position.set(0, 0.024, 0.050);
  anteriorLip.rotation.x = 0.22;
  armorGroup.add(anteriorLip);

  // Posterior armor lip (wraps behind the joint)
  const postLipGeo = new THREE.BoxGeometry(0.006, 0.028, 0.010);
  const posteriorLip = new THREE.Mesh(postLipGeo, materials.armor);
  posteriorLip.name = 'PosteriorShellLip';
  posteriorLip.position.set(0, 0.020, -0.050);
  posteriorLip.rotation.x = -0.20;
  armorGroup.add(posteriorLip);

  // =========================================================================
  // LEGACY ALIASES — kept for ArmAnimationController without changes
  // =========================================================================
  // damperActuator uses the pitch actuator group as a proxy
  const damperActuator = pitchActuator;
  const damperCylinder = paBody;
  const damperPiston   = paShaft;
  const innerStructure = mechanicalCore;
  const gimbalYoke     = upperArmYoke;
  const cycloidalDrive = new THREE.Group(); // empty proxy — cycloidal drive is inside mechanicalCore
  cycloidalDrive.name  = 'ShoulderCycloidalDrive';
  mechanicalCore.add(cycloidalDrive);
  const faceplateHub   = rollDisc;
  const shoulderCollar = eqBand as THREE.Mesh;

  // The upperArmConnector the ArmAnimationController references for exploded view
  // must be the same object that upperArm.group gets parented to in RobotArm.ts
  const upperArmConnector = upperArmYoke;

  // jointGroup alias used by ArmAnimationController for shoulder joint rotation
  const jointGroup = shoulderYaw;

  return {
    group: shoulderRoot,

    // Kinematic chain
    shoulderYaw,
    shoulderPitch,
    shoulderRoll,
    visualGroup,

    // Legacy aliases
    jointGroup,
    armorGroup,
    upperArmConnector,
    innerStructure,

    // Key meshes
    shoulderArmor,
    torsoMountPlate,
    rotationalCore,
    outerRing,
    innerRing,
    accentRing,

    // Named sub-assemblies
    yawBearingHousing,
    yawActuator,
    pitchActuator,
    pitchBearingRing,
    rollActuator,
    cableChannel,
    supportBracket,
    upperArmYoke,
    rollDisc,

    // Legacy aliases for ArmAnimationController
    gimbalYoke,
    cycloidalDrive,
    faceplateHub,
    damperActuator,
    damperPiston,
    damperCylinder,
    shoulderCollar,
    rotatingHub:      rotationalCore,
    ballJoint:        rotationalCore,
    pauldronCowl:     shoulderArmor,
    socketApertureRim: outerRing,

    ledMeshes,
  };
}
