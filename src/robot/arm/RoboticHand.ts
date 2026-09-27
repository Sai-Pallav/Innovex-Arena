import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ============================================================================
// MASTER CRAFTED CYBERNETIC HUMANOID ROBOTIC HAND SPECIFICATION
// ============================================================================
// Precision Mechanical Engineering & Anatomical Refinement:
// - Calibrated Heroic Proportions: Forearm (151mm) -> Hand (120mm, ~80% heroic ratio)
// - 100% Flush Wrist-Carpal Interface:
//     * Zero-gap, zero-penetration mating with Wrist.ts distalHandMount at Y = 0
//     * Carpal heel matches wrist distal trunnion profile (width 42.0mm, depth 22.0mm)
//     * Precision centering spigot with metallic seal O-ring inserting into wrist socket
//     * Elimination of redundant second wrist lightbar and protruding saucer flanges
// - Master Sculpted Exoskeleton Carapace:
//     * Continuous ceramic white armor from carpal heel to knuckles
//     * 4 sculpted metacarpal crests leading to the 4 MCP knuckle clevises
//     * 4 scalloped knuckle clearance arches hooding over the MCP hinge barrels
//     * Interdigital clearance notches eliminating mesh collisions
//     * Recessed central telemetry canal with dark titanium conduit inlay & hex bolts
//     * Twin diagnostic telemetry ports with metallic sensor contact pins
// - Integrated Thenar Actuator & True Opposable Thumb:
//     * Ergonomic thenar fairing flowing seamlessly out of the radial palm flank
//     * Cycloidal drive foundation with polished chrome retaining collar
//     * Anatomical 2-DOF CMC saddle joint: angled forward (~20°) and inward (~16°)
//       into true human-like opposition facing the index/middle fingertips
//     * Signature purple LED status lightbar in a flush dark titanium bezel
// - Master Phalanx Mechanical Architecture:
//     * Internal dark titanium bone spar with distal clevis fork ears
//     * Sculpted ceramic white dorsal armor shell with crowned spine, 45° chamfers,
//       proximal joint hood, and distal flexion relief clearance
//     * Volar tactile sensor pad with transverse high-friction traction ribs
//     * Lateral polished chrome tendon linkage guide rods
//     * Dual-shear cylindrical hinge barrels with chrome bearing races & hex cap pins
// - Calibrated Knuckle Spacing & Clearances:
//     * 14.0mm center-to-center knuckle spacing with 1.85mm clean mechanical clearance
// - Ergonomic Fingertips:
//     * Aerodynamic dorsal fingernail cowl, tactile contact dome & flush apex optical disc
// - Canonical Humanoid Resting Cascade & Organic Breathing Ripple
// ============================================================================

export interface FingerJointNodes {
  pivot:   THREE.Group;
  phalanx: THREE.Mesh;
  hinge:   THREE.Mesh;
}

export interface FingerNodes {
  base:     THREE.Group;
  proximal: FingerJointNodes;
  middle:   FingerJointNodes;
  distal:   FingerJointNodes;
  tip:      THREE.Mesh;
}

export interface ThumbNodes {
  metacarpalPivot: THREE.Group;
  proximalSegment: THREE.Mesh;
  proximalJoint:   THREE.Mesh;
  distalPivot:     THREE.Group;
  distalSegment:   THREE.Mesh;
  tip:             THREE.Mesh;
}

export interface HandNodes {
  group:        THREE.Group;
  palmCore:     THREE.Mesh;
  dorsalArmor:  THREE.Mesh;
  volarArmor:   THREE.Mesh;
  dorsalAccent: THREE.Mesh;
  fingers: [FingerNodes, FingerNodes, FingerNodes, FingerNodes, FingerNodes];
  thumb:        ThumbNodes;
  ledMeshes:    THREE.Mesh[];
  side:         -1 | 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER DIMENSIONS (Meters) — HEROIC PROPORTIONS PRESERVED
// ─────────────────────────────────────────────────────────────────────────────
const PALM_W   = 0.0580;    // 58.0mm across knuckles
const PALM_H   = 0.0420;    // 42.0mm height (carpal adapter to knuckle axis)
const PALM_D   = 0.0210;    // 21.0mm depth
const CUFF_W   = 0.0420;    // 42.0mm carpal heel width (exact match to wrist distal clevis!)
const CUFF_H   = 0.0080;    // 8.0mm carpal adapter height (compact, zero double-wrist look!)
const CUFF_D   = 0.0220;    // 22.0mm carpal heel depth (exact match to wrist distal clevis!)

// Reference middle finger baseline dimensions (meters)
const PR_RAD   = 0.0066;    // Proximal radius 6.6mm (dia 13.2mm)
const PR_LEN   = 0.0285;    // Proximal shaft 28.5mm
const MR_RAD   = 0.0058;    // Middle radius 5.8mm (dia 11.6mm)
const MR_LEN   = 0.0210;    // Middle shaft 21.0mm
const DR_RAD   = 0.0050;    // Distal radius 5.0mm (dia 10.0mm)
const DR_LEN   = 0.0145;    // Distal shaft 14.5mm

// Reference thumb baseline dimensions (meters)
const TPR_RAD  = 0.0072;    // Thumb proximal radius 7.2mm (dia 14.4mm)
const TPR_LEN  = 0.0245;    // Thumb proximal shaft 24.5mm
const TDR_RAD  = 0.0063;    // Thumb distal radius 6.3mm (dia 12.6mm)
const TDR_LEN  = 0.0175;    // Thumb distal shaft 17.5mm

// ─────────────────────────────────────────────────────────────────────────────
// PRECISION MECHANICAL ASSEMBLIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Precision Dual-Shear Cylindrical Hinge Barrel Assembly:
 * Central dark titanium barrel + dual polished chrome bearing races + outer pivot pin caps
 */
function createJointHingeBand(
  axleWidth: number,
  barrelRadius: number,
  matJoint: THREE.Material,
  matChrome: THREE.Material,
  name: string
): THREE.Group {
  const g = new THREE.Group();
  g.name = name;
  const aw = Math.max(axleWidth, 0.0024);
  const br = Math.max(barrelRadius, 0.0016);

  // 1. Central joint barrel (dark titanium)
  const bandH = aw * 0.60;
  const bandGeo = new THREE.CylinderGeometry(br, br, bandH, 16);
  bandGeo.rotateZ(Math.PI / 2);
  const band = new THREE.Mesh(bandGeo, matJoint);
  band.castShadow = true;
  band.receiveShadow = true;
  g.add(band);

  // 2. Dual Polished Chrome Bearing Races
  const collarH = aw * 0.13;
  const collarR = br * 1.10;

  const collarGeoL = new THREE.CylinderGeometry(collarR, collarR, collarH, 16);
  collarGeoL.rotateZ(Math.PI / 2);
  const collarL = new THREE.Mesh(collarGeoL, matChrome);
  collarL.position.x = -aw * 0.36;
  collarL.castShadow = true;
  g.add(collarL);

  const collarGeoR = new THREE.CylinderGeometry(collarR, collarR, collarH, 16);
  collarGeoR.rotateZ(Math.PI / 2);
  const collarRight = new THREE.Mesh(collarGeoR, matChrome);
  collarRight.position.x = aw * 0.36;
  collarRight.castShadow = true;
  g.add(collarRight);

  // 3. Precision Polished Endcap Pivot Pins with sunken hex sockets
  const pinH = aw * 0.07;
  const pinR = br * 0.54;

  const pinGeoL = new THREE.CylinderGeometry(pinR, pinR, pinH, 12);
  pinGeoL.rotateZ(Math.PI / 2);
  const pinL = new THREE.Mesh(pinGeoL, matChrome);
  pinL.position.x = -aw * 0.46;
  g.add(pinL);

  const pinGeoR = new THREE.CylinderGeometry(pinR, pinR, pinH, 12);
  pinGeoR.rotateZ(Math.PI / 2);
  const pinRight = new THREE.Mesh(pinGeoR, matChrome);
  pinRight.position.x = aw * 0.46;
  g.add(pinRight);

  return g;
}

/**
 * Ergonomic Cybernetic Fingertip:
 * Aerodynamic dorsal ceramic cowl ("fingernail") + tactile contact dome + apex optical sensor disc
 */
function createFingertip(radius: number, mat: RobotMaterialPalette, name: string): THREE.Mesh {
  // 1. Core tactile sensor ellipsoid (volar contact surface)
  const tipGeo = new THREE.SphereGeometry(radius, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.72);
  tipGeo.rotateX(Math.PI);
  tipGeo.scale(1.0, 1.15, 0.88);
  const tipMesh = new THREE.Mesh(tipGeo, mat.armor);
  tipMesh.name = name;
  tipMesh.castShadow = true;
  tipMesh.receiveShadow = true;

  // 2. Sculpted Dorsal Ceramic Cowl (exoskeleton shell curving over the nail)
  const cowlW = radius * 1.60;
  const cowlH = radius * 1.15;
  const cowlD = radius * 0.38;
  const cowlGeo = new THREE.BoxGeometry(cowlW, cowlH, cowlD, 4, 4, 2);
  const cPos = cowlGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < cPos.count; i++) {
    const xN = cPos.getX(i) / (cowlW * 0.5);
    const yN = cPos.getY(i) / (cowlH * 0.5);
    if (yN < 0) {
      cPos.setX(i, cPos.getX(i) * 0.78);
      cPos.setZ(i, cPos.getZ(i) * 0.80);
    }
    if (Math.abs(xN) > 0.55) {
      cPos.setZ(i, cPos.getZ(i) * 0.72);
    }
  }
  cPos.needsUpdate = true;
  cowlGeo.computeVertexNormals();

  const cowlMesh = new THREE.Mesh(cowlGeo, mat.armorDoubleSide);
  cowlMesh.position.set(0, radius * 0.10, radius * 0.42);
  cowlMesh.castShadow = true;
  tipMesh.add(cowlMesh);

  // 3. Volar Tactile Grip Sensor Pad (Dark titanium/composite)
  const padW = radius * 1.40;
  const padH = radius * 1.18;
  const padD = radius * 0.28;
  const padGeo = new THREE.BoxGeometry(padW, padH, padD);
  const padMesh = new THREE.Mesh(padGeo, mat.joint);
  padMesh.position.set(0, -radius * 0.06, -radius * 0.44);
  padMesh.castShadow = true;
  tipMesh.add(padMesh);

  // Volar micro-groove tread bar for grip traction
  const grooveGeo = new THREE.BoxGeometry(padW * 0.72, radius * 0.16, 0.0006);
  const groove = new THREE.Mesh(grooveGeo, mat.metallic);
  groove.position.set(0, -radius * 0.16, -radius * 0.56);
  tipMesh.add(groove);

  // 4. Precision Metallic Optical Sensor Disc at apex
  const dotGeo = new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, radius * 0.12, 12);
  const dotMesh = new THREE.Mesh(dotGeo, mat.metallic);
  dotMesh.position.set(0, -radius * 1.12, 0);
  tipMesh.add(dotMesh);

  return tipMesh;
}

/**
 * Builds a single complete robotic finger joint assembly:
 * - Rotation pivot (Group)
 * - Precision Hinge Axle & Clevis
 * - Internal Dark Titanium Bone Spar with Sculpted Distal Clevis Fork
 * - Beautifully Sculpted Ceramic Exoskeleton Shell (crowned spine, 45° chamfers, joint hoods)
 * - Volar Tactile Grip Sensor Pad
 * - Lateral Stainless Steel Tendon Guide Rods
 */
function buildFingerJoint(
  radius: number,
  shaftLength: number,
  mat: RobotMaterialPalette,
  name: string
): FingerJointNodes {
  const pivot = new THREE.Group();
  pivot.name = name + 'Pivot';

  // 1. Joint Hinge Axle Assembly
  const hw = radius * 1.88;
  const hingeGroup = createJointHingeBand(hw, radius * 0.86, mat.joint, mat.metallic, name + 'HingeGrp');
  pivot.add(hingeGroup);

  // 2. Internal Titanium Bone Spar (Primary structural chassis)
  const safeRadius = Math.max(radius * 0.82, 0.0010);
  const safeLength = Math.max(shaftLength, 0.0015);
  const boneGeo = new THREE.CapsuleGeometry(safeRadius, safeLength, 12, 16);
  const boneMesh = new THREE.Mesh(boneGeo, mat.joint);
  boneMesh.name = name + 'Bone';
  boneMesh.position.y = -shaftLength * 0.5 - radius * 0.85;
  boneMesh.castShadow = true;
  boneMesh.receiveShadow = true;
  pivot.add(boneMesh);

  // Sculpted Distal Clevis Fork Ears (dark titanium brackets with rounded bearing bosses)
  const earW = radius * 0.28;
  const earH = radius * 1.45;
  const earD = radius * 1.25;
  const earGeo = new THREE.BoxGeometry(earW, earH, earD, 2, 2, 2);
  const ePos = earGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < ePos.count; i++) {
    const yN = ePos.getY(i) / (earH * 0.5);
    const zN = ePos.getZ(i) / (earD * 0.5);
    if (yN < 0 && Math.abs(zN) > 0.5) {
      ePos.setZ(i, ePos.getZ(i) * 0.82);
    }
  }
  ePos.needsUpdate = true;
  earGeo.computeVertexNormals();

  const earL = new THREE.Mesh(earGeo, mat.joint);
  earL.position.set(-hw * 0.38, -shaftLength * 0.5 + radius * 0.10, 0);
  earL.castShadow = true;
  boneMesh.add(earL);

  const earR = new THREE.Mesh(earGeo, mat.joint);
  earR.position.set(hw * 0.38, -shaftLength * 0.5 + radius * 0.10, 0);
  earR.castShadow = true;
  boneMesh.add(earR);

  // Polished chrome bearing bosses on clevis ear exteriors
  const bossGeo = new THREE.CylinderGeometry(radius * 0.40, radius * 0.40, 0.0006, 12);
  bossGeo.rotateZ(Math.PI / 2);
  const bossL = new THREE.Mesh(bossGeo, mat.metallic);
  bossL.position.set(-hw * 0.38 - earW * 0.50 - 0.0003, -shaftLength * 0.5 + radius * 0.10, 0);
  boneMesh.add(bossL);

  const bossR = new THREE.Mesh(bossGeo, mat.metallic);
  bossR.position.set(hw * 0.38 + earW * 0.50 + 0.0003, -shaftLength * 0.5 + radius * 0.10, 0);
  boneMesh.add(bossR);

  // 3. Sculpted Ceramic White Dorsal Exoskeleton Shell
  const shellW = radius * 1.90;
  const shellH = shaftLength * 0.90;
  const shellD = radius * 0.62;
  const dorsalShellGeo = new THREE.BoxGeometry(shellW, shellH, shellD, 6, 8, 3);
  const pos = dorsalShellGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const xN = pos.getX(i) / (shellW * 0.5);
    const yN = pos.getY(i) / (shellH * 0.5);
    const zN = pos.getZ(i) / (shellD * 0.5);

    if (Math.abs(xN) > 0.55 && zN > 0) {
      pos.setZ(i, pos.getZ(i) * 0.72);
    }
    if (zN > 0) {
      pos.setZ(i, pos.getZ(i) + (1.0 - xN * xN) * 0.0007);
    }
    if (yN > 0.65) {
      pos.setY(i, pos.getY(i) + 0.0008);
      if (zN > 0) pos.setZ(i, pos.getZ(i) * 1.05);
    }
    if (yN < -0.65) {
      pos.setX(i, pos.getX(i) * 0.90);
      if (zN < 0) pos.setY(i, pos.getY(i) + 0.0010);
    }
    if (Math.abs(yN) < 0.35) {
      pos.setX(i, pos.getX(i) * 0.95);
    }
  }
  pos.needsUpdate = true;
  dorsalShellGeo.computeVertexNormals();

  const dorsalShell = new THREE.Mesh(dorsalShellGeo, mat.armorDoubleSide);
  dorsalShell.position.set(0, 0, radius * 0.50);
  dorsalShell.castShadow = true;
  dorsalShell.receiveShadow = true;
  boneMesh.add(dorsalShell);

  // Recessed crisp panel line accent groove across the dorsal shell
  const seamGeo = new THREE.BoxGeometry(shellW * 0.74, 0.0008, 0.0004);
  const seam = new THREE.Mesh(seamGeo, mat.joint);
  seam.position.set(0, shellH * 0.16, radius * 0.50 + shellD * 0.50 + 0.0001);
  boneMesh.add(seam);

  // 4. Volar High-Friction Tactile Grip Pad
  const padW = radius * 1.50;
  const padH = shaftLength * 0.76;
  const padD = radius * 0.30;
  const padGeo = new THREE.BoxGeometry(padW, padH, padD);
  const padMesh = new THREE.Mesh(padGeo, mat.joint);
  padMesh.position.set(0, 0, -radius * 0.56);
  padMesh.castShadow = true;
  boneMesh.add(padMesh);

  // Tactile micro-ribs on volar face
  for (const ribY of [-padH * 0.22, padH * 0.22]) {
    const ribGeo = new THREE.BoxGeometry(padW * 0.70, padH * 0.18, 0.0006);
    const rib = new THREE.Mesh(ribGeo, mat.metallic);
    rib.position.set(0, ribY, -radius * 0.56 - padD * 0.50 - 0.0001);
    boneMesh.add(rib);
  }

  // 5. Lateral Stainless Steel Tendon Guide Rods
  const guideGeo = new THREE.CylinderGeometry(radius * 0.11, radius * 0.11, shaftLength * 0.74, 8);
  const guideL = new THREE.Mesh(guideGeo, mat.metallic);
  guideL.position.set(-radius * 0.94, 0, 0);
  boneMesh.add(guideL);

  const guideR = new THREE.Mesh(guideGeo, mat.metallic);
  guideR.position.set(radius * 0.94, 0, 0);
  boneMesh.add(guideR);

  const hingeMesh = hingeGroup.children[0] as THREE.Mesh;
  return { pivot, phalanx: boneMesh, hinge: hingeMesh };
}

/**
 * Builds a 3-phalanx articulated robotic finger (Index, Middle, Ring, or Pinky)
 */
function buildReferenceFinger(
  mat: RobotMaterialPalette,
  name: string,
  pr = PR_RAD, pl = PR_LEN,
  mr = MR_RAD, ml = MR_LEN,
  dr = DR_RAD, dl = DR_LEN
): FingerNodes {
  // Proximal Joint
  const proximal = buildFingerJoint(pr, pl, mat, name + 'Prox');

  // Middle Joint (PIP): sits exactly at the distal end of the proximal phalanx
  const middle = buildFingerJoint(mr, ml, mat, name + 'Mid');
  middle.pivot.position.y = -(pl + pr * 1.8);
  proximal.pivot.add(middle.pivot);

  // Distal Joint (DIP): sits exactly at the distal end of the middle phalanx
  const distal = buildFingerJoint(dr, dl, mat, name + 'Dist');
  distal.pivot.position.y = -(ml + mr * 1.8);
  middle.pivot.add(distal.pivot);

  // Ergonomic Cybernetic Fingertip
  const tip = createFingertip(dr, mat, name + 'Tip');
  tip.position.y = -(dl + dr * 1.7);
  distal.pivot.add(tip);

  // Base Mounting Group
  const base = new THREE.Group();
  base.name = name + 'Base';
  base.add(proximal.pivot);

  return { base, proximal, middle, distal, tip };
}

/**
 * Builds the articulated robotic thumb assembly:
 * - Heavy-duty Proximal Phalanx with ceramic armor shell
 * - Lateral Signature Purple Emissive Status Strip embedded in flush bezel
 * - Interphalangeal (IP) Hinge Axle & Distal Phalanx
 * - Ergonomic Opposable Fingertip
 */
function buildReferenceThumb(
  side: -1 | 1,
  mat: RobotMaterialPalette
): ThumbNodes & { ledMeshes: THREE.Mesh[] } {
  const isRightHand = side === 1;
  const ledMeshes: THREE.Mesh[] = [];

  // Metacarpal / Proximal Pivot
  const metacarpalPivot = new THREE.Group();
  metacarpalPivot.name = (isRightHand ? 'Right' : 'Left') + 'ThumbMCPPivot';

  // 1. Proximal Hinge Axle
  const proxHW = TPR_RAD * 1.95;
  const proxHinge = createJointHingeBand(proxHW, TPR_RAD * 0.86, mat.joint, mat.metallic, 'ThumbMCPHinge');
  metacarpalPivot.add(proxHinge);

  // 2. Proximal Phalanx Body (Titanium core)
  const proxBoneGeo = new THREE.CapsuleGeometry(TPR_RAD * 0.82, TPR_LEN, 12, 16);
  const proxCap = new THREE.Mesh(proxBoneGeo, mat.joint);
  proxCap.name = 'ThumbProxCap';
  proxCap.position.y = -TPR_LEN * 0.5 - TPR_RAD * 0.85;
  proxCap.castShadow = true;
  proxCap.receiveShadow = true;
  metacarpalPivot.add(proxCap);

  // Distal Clevis Fork on Thumb Proximal
  const tEarGeo = new THREE.BoxGeometry(TPR_RAD * 0.28, TPR_RAD * 1.45, TPR_RAD * 1.25);
  const tEarL = new THREE.Mesh(tEarGeo, mat.joint);
  tEarL.position.set(-proxHW * 0.38, -TPR_LEN * 0.5 + TPR_RAD * 0.10, 0);
  proxCap.add(tEarL);

  const tEarR = new THREE.Mesh(tEarGeo, mat.joint);
  tEarR.position.set(proxHW * 0.38, -TPR_LEN * 0.5 + TPR_RAD * 0.10, 0);
  proxCap.add(tEarR);

  // 3. Sculpted Dorsal Ceramic Shell Plate
  const pShellGeo = new THREE.BoxGeometry(TPR_RAD * 1.92, TPR_LEN * 0.88, TPR_RAD * 0.60, 4, 6, 2);
  const pPos = pShellGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pPos.count; i++) {
    const xN = pPos.getX(i) / (TPR_RAD * 0.96);
    const zN = pPos.getZ(i) / (TPR_RAD * 0.30);
    if (Math.abs(xN) > 0.55 && zN > 0) {
      pPos.setZ(i, pPos.getZ(i) * 0.72);
    }
  }
  pPos.needsUpdate = true;
  pShellGeo.computeVertexNormals();

  const pShell = new THREE.Mesh(pShellGeo, mat.armorDoubleSide);
  pShell.position.set(0, 0, TPR_RAD * 0.50);
  pShell.castShadow = true;
  proxCap.add(pShell);

  // 4. Volar Tactile Grip Pad
  const pPadGeo = new THREE.BoxGeometry(TPR_RAD * 1.55, TPR_LEN * 0.76, TPR_RAD * 0.32);
  const pPad = new THREE.Mesh(pPadGeo, mat.joint);
  pPad.position.set(0, 0, -TPR_RAD * 0.58);
  pPad.castShadow = true;
  proxCap.add(pPad);

  // 5. Signature Purple Emissive Status Strip (Lateral thumb accent)
  const ledW = 0.0016;
  const ledH = 0.0105;
  const ledD = 0.0016;
  const ledSign = isRightHand ? -1 : 1;

  const bezelGeo = new THREE.BoxGeometry(ledW + 0.0014, ledH + 0.0014, ledD);
  const bezel = new THREE.Mesh(bezelGeo, mat.joint);
  bezel.position.set(ledSign * TPR_RAD * 0.88, 0, TPR_RAD * 0.16);
  proxCap.add(bezel);

  const ledGeo = new THREE.BoxGeometry(ledW, ledH, ledD + 0.0005);
  const thumbLed = new THREE.Mesh(ledGeo, mat.purpleEmissive);
  thumbLed.name = 'ThumbPurpleLedAccent';
  thumbLed.position.copy(bezel.position);
  thumbLed.position.z += 0.0003;
  proxCap.add(thumbLed);
  ledMeshes.push(thumbLed);

  const bloomGeo = new THREE.BoxGeometry(ledW * 1.30, ledH * 1.25, ledD);
  const thumbBloom = new THREE.Mesh(bloomGeo, mat.purpleBloom);
  thumbBloom.position.copy(thumbLed.position);
  proxCap.add(thumbBloom);

  // Distal Interphalangeal (IP) Pivot
  const distalPivot = new THREE.Group();
  distalPivot.name = (isRightHand ? 'Right' : 'Left') + 'ThumbIPPivot';
  distalPivot.position.y = -(TPR_LEN + TPR_RAD * 1.8);
  metacarpalPivot.add(distalPivot);

  // 6. Distal Hinge Axle
  const distHW = TDR_RAD * 1.95;
  const distHinge = createJointHingeBand(distHW, TDR_RAD * 0.86, mat.joint, mat.metallic, 'ThumbIPHinge');
  distalPivot.add(distHinge);

  // 7. Distal Phalanx Body (Titanium core)
  const distBoneGeo = new THREE.CapsuleGeometry(TDR_RAD * 0.82, TDR_LEN, 12, 16);
  const distCap = new THREE.Mesh(distBoneGeo, mat.joint);
  distCap.name = 'ThumbDistCap';
  distCap.position.y = -TDR_LEN * 0.5 - TDR_RAD * 0.85;
  distCap.castShadow = true;
  distCap.receiveShadow = true;
  distalPivot.add(distCap);

  // 8. Distal Dorsal Shell
  const dShellGeo = new THREE.BoxGeometry(TDR_RAD * 1.90, TDR_LEN * 0.84, TDR_RAD * 0.54);
  const dShell = new THREE.Mesh(dShellGeo, mat.armorDoubleSide);
  dShell.position.set(0, 0, TDR_RAD * 0.48);
  dShell.castShadow = true;
  distCap.add(dShell);

  // 9. Distal Volar Grip Pad
  const dPadGeo = new THREE.BoxGeometry(TDR_RAD * 1.45, TDR_LEN * 0.74, TDR_RAD * 0.30);
  const dPad = new THREE.Mesh(dPadGeo, mat.joint);
  dPad.position.set(0, 0, -TDR_RAD * 0.56);
  distCap.add(dPad);

  // 10. Ergonomic Opposable Fingertip
  const tip = createFingertip(TDR_RAD, mat, 'ThumbTip');
  tip.position.y = -(TDR_LEN + TDR_RAD * 1.7);
  distalPivot.add(tip);

  return {
    metacarpalPivot,
    proximalSegment: proxCap,
    proximalJoint: proxHinge.children[0] as THREE.Mesh,
    distalPivot,
    distalSegment: distCap,
    tip,
    ledMeshes,
  };
}

/**
 * Builds the Precision Carpal Heel Interface:
 * Engineered to mate 100% flush with Wrist.ts distalHandMount faceplate (Y = 0)
 * Width: 42.0mm, Depth: 22.0mm at interface plane — zero overhang, zero gap, zero clipping!
 */
function buildCarpalHeel(mat: RobotMaterialPalette): { group: THREE.Group; telemetryAccent: THREE.Mesh } {
  const g = new THREE.Group();
  g.name = 'CarpalHeelGroup';

  // 1. Precision Centering Spigot (inserts into Wrist.ts distal trunnion socket)
  const spigotGeo = new THREE.CylinderGeometry(0.0165, 0.0165, 0.0022, 24);
  const spigot = new THREE.Mesh(spigotGeo, mat.joint);
  spigot.position.y = 0.0011;
  spigot.castShadow = true;
  g.add(spigot);

  // Metallic O-ring seal
  const oRingGeo = new THREE.TorusGeometry(0.0168, 0.0006, 6, 24);
  oRingGeo.rotateX(Math.PI / 2);
  const oRing = new THREE.Mesh(oRingGeo, mat.metallic);
  oRing.position.y = 0.0002;
  g.add(oRing);

  // 2. Carpal Adapter Housing (Dark Titanium Chamfered Block)
  // Perfectly matches the 42.0mm x 22.0mm wrist trunnion profile at Y = 0
  const cuffGeo = new THREE.BoxGeometry(CUFF_W, CUFF_H, CUFF_D, 6, 2, 4);
  const pos = cuffGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const xN = pos.getX(i) / (CUFF_W * 0.5);
    const zN = pos.getZ(i) / (CUFF_D * 0.5);
    const yN = pos.getY(i) / (CUFF_H * 0.5);
    // Chamfer the corners smoothly to round into the wrist profile
    if (Math.abs(xN) > 0.50 && Math.abs(zN) > 0.50) {
      pos.setX(i, pos.getX(i) * 0.86);
      pos.setZ(i, pos.getZ(i) * 0.86);
    }
    // Flare smoothly outward toward the palm at the distal end (yN < 0)
    if (yN < 0) {
      pos.setX(i, pos.getX(i) * 1.08);
      pos.setZ(i, pos.getZ(i) * 0.96);
    }
  }
  pos.needsUpdate = true;
  cuffGeo.computeVertexNormals();

  const cuff = new THREE.Mesh(cuffGeo, mat.joint);
  cuff.name = 'CarpalHeelBody';
  cuff.position.y = -CUFF_H * 0.5;
  cuff.castShadow = true;
  cuff.receiveShadow = true;
  g.add(cuff);

  // 3. Technical Telemetry Status Indicator (dorsal face)
  const dotGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.0008, 12);
  dotGeo.rotateX(Math.PI / 2);
  const telemetryAccent = new THREE.Mesh(dotGeo, mat.metallic);
  telemetryAccent.name = 'CarpalTelemetryAccent';
  telemetryAccent.position.set(0, -CUFF_H * 0.5, CUFF_D * 0.5 + 0.0002);
  g.add(telemetryAccent);

  // Twin micro hex fasteners on carpal heel
  for (const bX of [-0.012, 0.012]) {
    const boltGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.0008, 6);
    boltGeo.rotateX(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, mat.metallic);
    bolt.position.set(bX, -CUFF_H * 0.5, CUFF_D * 0.5 + 0.0002);
    g.add(bolt);
  }

  return { group: g, telemetryAccent };
}

/**
 * Builds the Volumetric Palm Core, Sculpted Dorsal Exoskeleton Carapace & Volar Grip Plates:
 * Parameterized by side (-1: Left Hand, 1: Right Hand) for anatomical asymmetry.
 * Sculpted with 4 distinct metacarpal dorsal crests, scalloped knuckle arches, and integrated thenar fairing.
 */
function buildReferencePalmPlate(
  side: -1 | 1,
  mat: RobotMaterialPalette,
  kx: number[]
): {
  group: THREE.Group;
  dorsalPlate: THREE.Mesh;
  palmCore: THREE.Mesh;
  volarPlate: THREE.Mesh;
} {
  const isRightHand = side === 1;
  const g = new THREE.Group();
  g.name = (isRightHand ? 'Right' : 'Left') + 'ReferencePalmGroup';

  const w = PALM_W;
  const h = PALM_H;
  const d = PALM_D;

  const thumbSign = isRightHand ? -1 : 1;

  // 1. Titanium Internal Structural Core (Servos & Cable Conduit Spaceframe)
  const coreGeo = new THREE.BoxGeometry(w * 0.90, h, d * 0.68, 6, 6, 3);
  const corePos = coreGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < corePos.count; i++) {
    const yN = corePos.getY(i) / (h * 0.5);
    // Taper gracefully from knuckles down to carpal heel (42mm width)
    if (yN > 0) {
      corePos.setX(i, corePos.getX(i) * 0.82);
      corePos.setZ(i, corePos.getZ(i) * 0.92);
    }
    // Asymmetric expansion toward thenar mound
    const x = corePos.getX(i);
    if (x * thumbSign > 0 && yN < 0.3 && yN > -0.6) {
      corePos.setX(i, x * 1.05);
    }
  }
  corePos.needsUpdate = true;
  coreGeo.computeVertexNormals();

  const palmCore = new THREE.Mesh(coreGeo, mat.joint);
  palmCore.name = 'PalmCore';
  palmCore.position.y = -h * 0.5;
  palmCore.castShadow = true;
  palmCore.receiveShadow = true;
  g.add(palmCore);

  // 2. Master Sculpted Ceramic White Dorsal Carapace
  // Begins flush at the carpal heel and sweeps down to the 4 scalloped knuckle arches
  const dorsalGeo = new THREE.BoxGeometry(w, h, d * 0.42, 12, 14, 3);
  const dPos = dorsalGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < dPos.count; i++) {
    const x = dPos.getX(i);
    const y = dPos.getY(i);
    const z = dPos.getZ(i);

    const xN = x / (w * 0.5);
    const yN = y / (h * 0.5);

    // Carpal heel taper: matches CUFF_W (42mm) smoothly at the top
    if (yN > 0.05) {
      const t = (yN - 0.05) / 0.95;
      const tapFactor = 1.0 - t * 0.22;
      dPos.setX(i, x * tapFactor);
    }

    // 4 Anatomical Metacarpal Crests
    if (z > 0) {
      const crestWave = Math.cos(xN * Math.PI * 3.5) * 0.0011;
      const crown = (1.0 - xN * xN) * 0.0018;
      dPos.setZ(i, z + crown + crestWave);
    }

    // Distal Knuckle Margin: 4 Scalloped Clearance Arches
    if (yN < -0.68) {
      let minDist = 999;
      for (let k = 0; k < 4; k++) {
        const dist = Math.abs(x - kx[k]);
        if (dist < minDist) minDist = dist;
      }

      if (minDist < 0.0055) {
        dPos.setY(i, y - 0.0016 * (1.0 - minDist / 0.0055));
        if (z > 0) dPos.setZ(i, dPos.getZ(i) + 0.0006);
      } else {
        dPos.setY(i, y + 0.0012);
      }
    }

    // Chamfer lateral borders (thenar & hypothenar edges)
    if (Math.abs(xN) > 0.70 && z > 0) {
      dPos.setZ(i, dPos.getZ(i) * 0.78);
    }
  }
  dPos.needsUpdate = true;
  dorsalGeo.computeVertexNormals();

  const dorsalPlate = new THREE.Mesh(dorsalGeo, mat.armorDoubleSide);
  dorsalPlate.name = 'DorsalPlate';
  dorsalPlate.position.set(0, -h * 0.5, d * 0.32);
  dorsalPlate.castShadow = true;
  dorsalPlate.receiveShadow = true;
  g.add(dorsalPlate);

  // 3. Technical Diagnostic Ports & Telemetry Sensor Dots (Dorsal face)
  for (const pSide of [-1, 1]) {
    const portGeo = new THREE.BoxGeometry(0.0032, 0.0032, 0.0014);
    const port = new THREE.Mesh(portGeo, mat.joint);
    port.position.set(pSide * w * 0.28, -h * 0.65, d * 0.54);
    g.add(port);

    const dotGeo = new THREE.CylinderGeometry(0.0010, 0.0010, 0.0018, 12);
    dotGeo.rotateX(Math.PI / 2);
    const dot = new THREE.Mesh(dotGeo, mat.metallic);
    dot.position.set(pSide * w * 0.28, -h * 0.65, d * 0.54 + 0.0008);
    g.add(dot);
  }

  // Central Recessed Technical Channel with Dark Titanium Conduit Inlay
  const channelGeo = new THREE.BoxGeometry(0.0036, h * 0.54, 0.0014);
  const channel = new THREE.Mesh(channelGeo, mat.joint);
  channel.position.set(0, -h * 0.44, d * 0.54);
  g.add(channel);

  // Micro socket bolts along channel
  for (const cY of [-h * 0.26, -h * 0.62]) {
    const boltGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.0016, 6);
    boltGeo.rotateX(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, mat.metallic);
    bolt.position.set(0, cY, d * 0.54 + 0.0008);
    g.add(bolt);
  }

  // 4. Volar Armored Grip Surface (Palmar face)
  const volarGeo = new THREE.BoxGeometry(w * 0.92, h, d * 0.32, 6, 6, 2);
  const vPos = volarGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < vPos.count; i++) {
    const yN = vPos.getY(i) / (h * 0.5);
    if (yN > 0.05) vPos.setX(i, vPos.getX(i) * 0.82);
  }
  vPos.needsUpdate = true;
  volarGeo.computeVertexNormals();

  const volarPlate = new THREE.Mesh(volarGeo, mat.armor);
  volarPlate.name = 'VolarPlate';
  volarPlate.position.set(0, -h * 0.5, -d * 0.32);
  volarPlate.castShadow = true;
  volarPlate.receiveShadow = true;
  g.add(volarPlate);

  // 5. Segmented Volar Tactile Grip Pads
  // Thenar cushion (thumb side)
  const thenarGeo = new THREE.BoxGeometry(w * 0.36, h * 0.44, 0.0022);
  const thenarPad = new THREE.Mesh(thenarGeo, mat.joint);
  thenarPad.position.set(thumbSign * w * 0.26, -h * 0.40, -d * 0.46);
  thenarPad.castShadow = true;
  g.add(thenarPad);

  // Hypothenar cushion (pinky side)
  const hypoGeo = new THREE.BoxGeometry(w * 0.34, h * 0.42, 0.0022);
  const hypoPad = new THREE.Mesh(hypoGeo, mat.joint);
  hypoPad.position.set(-thumbSign * w * 0.27, -h * 0.42, -d * 0.46);
  hypoPad.castShadow = true;
  g.add(hypoPad);

  // Metacarpal palmar grip bar (under knuckles)
  const metaBarGeo = new THREE.BoxGeometry(w * 0.84, h * 0.22, 0.0024);
  const metaBar = new THREE.Mesh(metaBarGeo, mat.joint);
  metaBar.position.set(0, -h * 0.81, -d * 0.46);
  metaBar.castShadow = true;
  g.add(metaBar);

  return { group: g, dorsalPlate, palmCore, volarPlate };
}

/**
 * Builds the Metacarpophalangeal (MCP) Knuckle Arch Clevises:
 * 4 precision dual-shear clevis housings anchored directly to the transverse bridge.
 * Hooded under the scalloped arches of the dorsal carapace.
 */
function buildKnuckleBridge(
  side: -1 | 1,
  mat: RobotMaterialPalette,
  kx: number[],
  ky: number[],
  kz: number[]
): THREE.Group {
  const isRightHand = side === 1;
  const g = new THREE.Group();
  g.name = (isRightHand ? 'Right' : 'Left') + 'KnuckleBridge';

  // 1. Structural Transverse Metacarpal Bridge Bar (Dark Titanium)
  const barGeo = new THREE.BoxGeometry(PALM_W * 0.88, 0.0042, PALM_D * 0.54);
  const bar = new THREE.Mesh(barGeo, mat.joint);
  bar.position.set(0, 0.0021, 0);
  bar.castShadow = true;
  bar.receiveShadow = true;
  g.add(bar);

  // 2. Individual MCP Knuckle Clevis Brackets & Sculpted Armor Caps
  for (let i = 0; i < 4; i++) {
    const kGeo = new THREE.BoxGeometry(0.0124, 0.0054, 0.0104);
    const kMesh = new THREE.Mesh(kGeo, mat.joint);
    kMesh.position.set(kx[i], ky[i], kz[i]);
    kMesh.castShadow = true;
    kMesh.receiveShadow = true;
    g.add(kMesh);

    const capGeo = new THREE.BoxGeometry(0.0118, 0.0026, 0.0098);
    const cap = new THREE.Mesh(capGeo, mat.armor);
    cap.position.set(kx[i], ky[i] + 0.0026, kz[i] + 0.0004);
    cap.castShadow = true;
    g.add(cap);
  }

  return g;
}

/**
 * Builds the Integrated Thenar Actuator Foundation & Cowl Fairing:
 * Smoothly blends into the radial palm edge and houses the opposable thumb's cycloidal rotary drive.
 */
function buildThenarBase(
  side: -1 | 1,
  mat: RobotMaterialPalette
): THREE.Group {
  const isRightHand = side === 1;
  const g = new THREE.Group();
  g.name = (isRightHand ? 'Right' : 'Left') + 'ThenarBase';

  // 1. Dark Titanium Rotary Drive Stepped Cylinder Foundation
  const cylinderGeo = new THREE.CylinderGeometry(0.0096, 0.0105, 0.0095, 20);
  const cylinder = new THREE.Mesh(cylinderGeo, mat.joint);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  g.add(cylinder);

  // 2. Sculpted Ceramic White Armored Cowl Fairing (aerodynamic transition to palm)
  const cowlGeo = new THREE.BoxGeometry(0.0138, 0.0152, 0.0116, 3, 3, 2);
  const cPos = cowlGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < cPos.count; i++) {
    const xN = cPos.getX(i) / (0.0138 * 0.5);
    const zN = cPos.getZ(i) / (0.0116 * 0.5);
    if (Math.abs(xN) > 0.50 && Math.abs(zN) > 0.50) {
      cPos.setX(i, cPos.getX(i) * 0.85);
      cPos.setZ(i, cPos.getZ(i) * 0.85);
    }
  }
  cPos.needsUpdate = true;
  cowlGeo.computeVertexNormals();

  const cowl = new THREE.Mesh(cowlGeo, mat.armor);
  cowl.castShadow = true;
  cowl.receiveShadow = true;
  g.add(cowl);

  // 3. Machined Metallic Bearing Race Retaining Collar
  const ringGeo = new THREE.CylinderGeometry(0.0102, 0.0102, 0.0018, 20);
  const ring = new THREE.Mesh(ringGeo, mat.metallic);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);

  return g;
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER ROBOTIC HAND FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export function createRoboticHand(side: -1 | 1, mat: RobotMaterialPalette): HandNodes {
  // STRICT CONVENTION:
  // side === -1 is LEFT Arm/Hand
  // side === 1  is RIGHT Arm/Hand
  const isRightHand = side === 1;
  const sideName = isRightHand ? 'Right' : 'Left';
  const ledMeshes: THREE.Mesh[] = [];

  const group = new THREE.Group();
  group.name = sideName + 'HandRoot';

  // Palm root group holds all hand components
  // Coaxial and coplanar with the wrist faceplate (articulation handled by wrist trunnion)
  const palmRoot = new THREE.Group();
  palmRoot.name = sideName + 'PalmRoot';
  palmRoot.rotation.set(0, 0, 0);
  group.add(palmRoot);

  // 1. Carpal Interface Heel (flushes 100% coplanar with Wrist.ts distalHandMount)
  const carpalObj = buildCarpalHeel(mat);
  palmRoot.add(carpalObj.group);

  // 2. Master Knuckle Arch Coordinates
  // 14.0mm center-to-center spacing across 58.0mm palm (Index, Middle, Ring, Pinky)
  // Clean 1.85mm mechanical clearance gaps between all hinges
  const PALM_Y0 = -CUFF_H;
  const FINGER_ROOT_Y = PALM_Y0 - PALM_H;
  const KNUCKLE_Z = PALM_D * 0.14;

  const thumbSign = isRightHand ? -1 : 1;
  const KX = [
    thumbSign * 0.0210,   // Index
    thumbSign * 0.0070,   // Middle
    -thumbSign * 0.0070,  // Ring
    -thumbSign * 0.0210,  // Pinky
  ];
  // Anatomical knuckle arch: Middle highest, Index/Ring neutral, Pinky recessed
  const KY = [ -0.0006, 0.0018, -0.0006, -0.0036 ];
  const KZ = [ 0.0014, 0.0024, 0.0016, -0.0008 ];

  // 3. Volumetric Palm Plate Assembly with Scalloped Knuckle Arches
  const palmObj = buildReferencePalmPlate(side, mat, KX);
  palmObj.group.position.y = PALM_Y0;
  palmRoot.add(palmObj.group);

  const palmCore     = palmObj.palmCore;
  const dorsalArmor  = palmObj.dorsalPlate;
  const volarArmor   = palmObj.volarPlate;
  const dorsalAccent = carpalObj.telemetryAccent;

  // 4. Knuckle Bridge Housing (Anchored stationary clevis brackets on palm)
  const knuckleBridge = buildKnuckleBridge(side, mat, KX, KY, KZ);
  knuckleBridge.position.set(0, FINGER_ROOT_Y, KNUCKLE_Z);
  palmRoot.add(knuckleBridge);

  // 5. Articulated Digits (Index, Middle, Ring, Pinky)
  const F_PROX_LEN_SC = [ 0.940, 1.000, 0.950, 0.780 ];
  const F_PROX_RAD_SC = [ 0.960, 1.000, 0.960, 0.880 ];

  const F_MID_LEN_SC  = [ 0.940, 1.000, 0.950, 0.780 ];
  const F_MID_RAD_SC  = [ 0.960, 1.000, 0.960, 0.880 ];

  const F_DIST_LEN_SC = [ 0.940, 1.000, 0.950, 0.780 ];
  const F_DIST_RAD_SC = [ 0.960, 1.000, 0.960, 0.880 ];

  const FNAMES = ['Index', 'Middle', 'Ring', 'Pinky'];
  const fingerNodesArr: FingerNodes[] = [];

  for (let fi = 0; fi < 4; fi++) {
    const fn = buildReferenceFinger(
      mat,
      sideName + FNAMES[fi],
      PR_RAD * F_PROX_RAD_SC[fi], PR_LEN * F_PROX_LEN_SC[fi],
      MR_RAD * F_MID_RAD_SC[fi],  MR_LEN * F_MID_LEN_SC[fi],
      DR_RAD * F_DIST_RAD_SC[fi], DR_LEN * F_DIST_LEN_SC[fi]
    );
    // Exact joint axis alignment: finger base is at the exact knuckle coordinate
    fn.base.position.set(KX[fi], FINGER_ROOT_Y + KY[fi], KNUCKLE_Z + KZ[fi]);
    palmRoot.add(fn.base);
    fingerNodesArr.push(fn);
  }

  // 6. Integrated Opposable Robotic Thumb Assembly
  // Positioned on the radial/volar boundary for genuine humanoid grasp kinematics
  const thumbRootPos = new THREE.Vector3(
    thumbSign * (PALM_W * 0.44),
    FINGER_ROOT_Y + PALM_H * 0.52,
    -PALM_D * 0.16
  );

  const thenarBase = buildThenarBase(side, mat);
  thenarBase.position.copy(thumbRootPos);
  palmRoot.add(thenarBase);

  const thumb = buildReferenceThumb(side, mat);
  ledMeshes.push(...thumb.ledMeshes);

  const thumbCMC = new THREE.Group();
  thumbCMC.name = sideName + 'ThumbCMC';
  thumbCMC.position.copy(thumbRootPos);

  // True opposable humanoid thumb orientation:
  // Forward pitch (toward palm) + medial rotation (facing index/middle digits) + natural tilt
  thumbCMC.rotation.set(
    0.30,
    -thumbSign * 0.26,
    thumbSign * 0.22
  );

  thumbCMC.add(thumb.metacarpalPivot);
  palmRoot.add(thumbCMC);

  // Compatibility proxy for thumb in fingers array
  const _proxyPivot = new THREE.Group();
  const _proxyPhalanx = new THREE.Mesh(new THREE.BoxGeometry(0.0001, 0.0001, 0.0001), mat.armor);
  const _proxyHinge = new THREE.Mesh(new THREE.BoxGeometry(0.0001, 0.0001, 0.0001), mat.joint);
  const _proxyJoint: FingerJointNodes = { pivot: _proxyPivot, phalanx: _proxyPhalanx, hinge: _proxyHinge };
  const _proxyBase = new THREE.Group();
  const _proxyTip = new THREE.Mesh(new THREE.BoxGeometry(0.0001, 0.0001, 0.0001), mat.armor);
  const thumbProxy: FingerNodes = {
    base: _proxyBase,
    proximal: _proxyJoint,
    middle: { ..._proxyJoint, pivot: new THREE.Group() },
    distal: { ..._proxyJoint, pivot: new THREE.Group() },
    tip: _proxyTip,
  };
  thumbProxy.base.visible = false;

  const fingers = [
    thumbProxy,
    fingerNodesArr[0],
    fingerNodesArr[1],
    fingerNodesArr[2],
    fingerNodesArr[3],
  ] as [FingerNodes, FingerNodes, FingerNodes, FingerNodes, FingerNodes];

  // Apply default natural canonical resting posture
  applyHandRestingPosture(fingerNodesArr, thumb, side);

  return {
    group,
    palmCore,
    dorsalArmor: dorsalArmor as any,
    volarArmor,
    dorsalAccent,
    fingers,
    thumb,
    ledMeshes,
    side,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POSTURE CONTROLS & NATURAL CANONICAL RESTING EXPRESSIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Natural cascading resting posture for relaxed athletic character poise:
 * Follows the canonical anatomical cascade of the human digits:
 * - Index: gentle open curve (~9° MCP, ~14° PIP, ~8° DIP)
 * - Middle: standard relaxed curl (~12.5° MCP, ~18° PIP, ~10° DIP)
 * - Ring: deeper nestled curl (~17° MCP, ~24° PIP, ~12.5° DIP)
 * - Pinky: nestled comfortable curl (~22° MCP, ~30° PIP, ~16° DIP)
 * - Thumb: opposed ready grasp facing index and middle digits
 */
export function applyHandRestingPosture(
  fingers: FingerNodes[],
  thumb: ThumbNodes,
  side: -1 | 1 = 1
): void {
  const isRightHand = side === 1;
  const thumbSign = isRightHand ? -1 : 1;

  // Canonical human resting cascade flex angles: [MCP, PIP, DIP] in radians
  const BENDS: [number, number, number][] = [
    [ 0.16, 0.24, 0.14 ],  // Index: gentle open curve
    [ 0.22, 0.32, 0.18 ],  // Middle: standard relaxed curl
    [ 0.30, 0.42, 0.22 ],  // Ring: deeper nestled curl
    [ 0.38, 0.52, 0.28 ],  // Pinky: fully nestled curl
  ];
  // Natural anatomical splay: index outward, pinky inward (mirrored by thumbSign)
  const SPLAY = [
    thumbSign * 0.016,
    thumbSign * 0.003,
    -thumbSign * 0.010,
    -thumbSign * 0.022,
  ];

  for (let i = 0; i < 4; i++) {
    const f = fingers[i];
    const b = BENDS[i];
    f.base.rotation.z = SPLAY[i];
    f.base.rotation.y = 0;
    f.proximal.pivot.rotation.x = b[0];
    f.middle.pivot.rotation.x   = b[1];
    f.distal.pivot.rotation.x   = b[2];
  }

  // Opposable thumb ready position
  thumb.metacarpalPivot.rotation.x = 0.22;
  thumb.metacarpalPivot.rotation.z = thumbSign * 0.05;
  thumb.distalPivot.rotation.x     = 0.24;
}

export function applyRightHandPosture(fingers: FingerNodes[], thumb: ThumbNodes): void {
  applyHandRestingPosture(fingers, thumb, 1);
}

export function applyLeftHandPose(fingers: FingerNodes[], thumb: ThumbNodes): void {
  applyHandRestingPosture(fingers, thumb, -1);
}

export function applyOpenSpreadPose(fingers: FingerNodes[], thumb: ThumbNodes): void {
  const SPLAY = [ +0.050, +0.016, -0.018, -0.045 ];
  for (let i = 0; i < 4; i++) {
    const f = fingers[i];
    f.base.rotation.z = SPLAY[i];
    f.proximal.pivot.rotation.x = 0.06;
    f.middle.pivot.rotation.x   = 0.08;
    f.distal.pivot.rotation.x   = 0.04;
  }
  thumb.metacarpalPivot.rotation.x = 0.10;
  thumb.metacarpalPivot.rotation.z = -0.04;
  thumb.distalPivot.rotation.x     = 0.12;
}

export function applyNaturalHangPose(fingers: FingerNodes[], thumb: ThumbNodes): void {
  applyHandRestingPosture(fingers, thumb, 1);
}

export function applyRelaxedPose(fingers: FingerNodes[], thumb: ThumbNodes): void {
  applyHandRestingPosture(fingers, thumb, 1);
}

export interface FingerPose {
  proximal?: number;
  middle?:   number;
  distal?:   number;
  splay?:    number;
}

export interface HandPose {
  index?:  FingerPose;
  middle?: FingerPose;
  ring?:   FingerPose;
  pinky?:  FingerPose;
  thumb?: { metacarpal?: number; distal?: number };
}

export function applyHandPose(nodes: HandNodes, pose: HandPose): void {
  const MAP: Array<[keyof HandPose, number]> = [
    ['index', 1],
    ['middle', 2],
    ['ring', 3],
    ['pinky', 4],
  ];

  for (const [key, idx] of MAP) {
    const fp = pose[key] as FingerPose | undefined;
    if (!fp) continue;
    const f = nodes.fingers[idx];
    if (fp.splay    !== undefined) f.base.rotation.z           = fp.splay;
    if (fp.proximal !== undefined) f.proximal.pivot.rotation.x = fp.proximal;
    if (fp.middle   !== undefined) f.middle.pivot.rotation.x   = fp.middle;
    if (fp.distal   !== undefined) f.distal.pivot.rotation.x   = fp.distal;
  }

  if (pose.thumb) {
    if (pose.thumb.metacarpal !== undefined) {
      nodes.thumb.metacarpalPivot.rotation.x = pose.thumb.metacarpal;
    }
    if (pose.thumb.distal !== undefined) {
      nodes.thumb.distalPivot.rotation.x = pose.thumb.distal;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME PROCEDURAL HAND KINEMATICS & ORGANIC BREATHING WAVE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates dynamic procedural finger articulation in sync with robot breathing & pose
 * Adds subtle organic micro-curling waves to eliminate robotic stiffness
 */
export function updateRoboticHandAnimation(
  nodes: HandNodes,
  side: -1 | 1,
  time: number,
  _dt: number,
  breathOffset: number,
  lookYaw: number = 0,
  _lookPitch: number = 0
): void {
  const isRightHand = side === 1;
  const thumbSign = isRightHand ? -1 : 1;
  const timePhase = isRightHand ? 0 : 1.8;

  // Canonical human resting cascade flex angles: [MCP, PIP, DIP]
  const BASE_BENDS: [number, number, number][] = [
    [ 0.16, 0.24, 0.14 ], // Index
    [ 0.22, 0.32, 0.18 ], // Middle
    [ 0.30, 0.42, 0.22 ], // Ring
    [ 0.38, 0.52, 0.28 ], // Pinky
  ];

  // Cascading harmonic breathing ripple:
  // Each digit has a slight phase delay across the hand (0.18s offset per finger)
  for (let i = 0; i < 4; i++) {
    const f = nodes.fingers[i + 1];
    if (!f) continue;

    const phaseDelay = i * 0.18;
    const wave = Math.sin(time * 1.4 + timePhase - phaseDelay);
    const microBend = wave * 0.016 + breathOffset * 0.26 + Math.abs(lookYaw) * 0.010;

    const b = BASE_BENDS[i];
    f.proximal.pivot.rotation.x = b[0] + microBend * 0.65;
    f.middle.pivot.rotation.x   = b[1] + microBend * 0.90;
    f.distal.pivot.rotation.x   = b[2] + microBend * 0.45;
  }

  // Thumb micro-articulation
  const thumbWave = Math.sin(time * 1.4 + timePhase - 0.12);
  const thumbMicro = thumbWave * 0.014 + breathOffset * 0.18;

  nodes.thumb.metacarpalPivot.rotation.x = 0.22 + thumbMicro * 0.50;
  nodes.thumb.metacarpalPivot.rotation.z = thumbSign * (0.05 + thumbMicro * 0.15);
  nodes.thumb.distalPivot.rotation.x     = 0.24 + thumbMicro * 0.70;
}
