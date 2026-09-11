import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface FingerSegmentNodes {
  group: THREE.Group;
  boneMesh: THREE.Mesh;
  armorMesh: THREE.Mesh;
  padMesh?: THREE.Mesh;
  hingeMesh?: THREE.Mesh;
  hingeCaps?: THREE.Mesh[];
}

export interface FingerNodes {
  group: THREE.Group;
  proximal: FingerSegmentNodes;
  middle: FingerSegmentNodes;
  distal: FingerSegmentNodes;
  tipMesh: THREE.Mesh;
}

export interface ThumbNodes {
  group: THREE.Group;
  baseBall: THREE.Mesh;
  baseCollar: THREE.Mesh;
  proximal: FingerSegmentNodes;
  middle?: FingerSegmentNodes;
  distal: FingerSegmentNodes;
  tipMesh: THREE.Mesh;
}

export interface FingerSpec {
  name: string;
  spreadX: number;
  offsetY: number;
  offsetZ: number;
  proximalLength: number;
  middleLength: number;
  distalLength: number;
  proximalRadius: number;
  middleRadius: number;
  distalRadius: number;
}

/**
 * Creates a precision-sculpted, volumetric 3D white ceramic exoskeleton phalanx shell.
 * 
 * Design Features:
 * - Full 3D volumetric enclosure with 7-vertex cross-sectional contour wrapping
 *   from palmar margin over lateral flanks, angled shoulder chamfers, to the dorsal spine crest.
 * - Encloses the dark titanium core so that the sides are solid sculpted white ceramic
 *   (eliminating the flat popsicle-stick profile and exposed dark side-stripes).
 * - Distal segment wraps over the entire apex of the fingertip, creating a sleek,
 *   aerodynamic cybernetic fingertip cowl (eliminating blunt black rubber thimbles).
 * - Cylindrical clearance arch at proximal end for smooth articulation around hinge axis.
 */
function createSculptedPhalanxShell(
  width: number,
  length: number,
  depth: number,
  material: THREE.Material,
  isDistalTip: boolean = false
): THREE.Mesh {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const segmentsY = isDistalTip ? 14 : 10;
  const halfW = width * 0.5;
  const curD = depth * 0.5;

  // 7 cross-sectional contour vertices wrapping from left palmar margin to right palmar margin
  const numX = 7;

  for (let iy = 0; iy <= segmentsY; iy++) {
    const v = iy / segmentsY; // 0 = proximal base, 1 = distal end
    let y = -v * length;

    // Width taper factor along length
    let wFactor = 1.0;
    if (v < 0.12) {
      wFactor = 0.94 + 0.06 * (v / 0.12);
    } else if (v > 0.65) {
      wFactor = 1.0 - (isDistalTip ? 0.38 : 0.12) * ((v - 0.65) / 0.35);
    }
    const curW = halfW * wFactor;

    // Height / Depth taper factor
    let dFactor = 1.0 - 0.16 * v;

    // Distal tip wrap: curves apex around and down to close smoothly
    let tipZOffset = 0;
    if (isDistalTip && v > 0.55) {
      const tipT = (v - 0.55) / 0.45;
      y -= tipT * 0.0024;
      tipZOffset = -Math.sin(tipT * Math.PI * 0.5) * (curD * 0.85);
      dFactor *= (1.0 - tipT * 0.32);
      wFactor *= (1.0 - tipT * 0.25);
    }

    const effD = curD * dFactor;

    // 7 vertices:
    // 0: Left palmar seam
    // 1: Left lateral flank
    // 2: Left dorsal shoulder chamfer
    // 3: Centerline dorsal spine crest (sharp highlight ridge)
    // 4: Right dorsal shoulder chamfer
    // 5: Right lateral flank
    // 6: Right palmar seam
    const rowPoints = [
      { x: -curW * 0.92, z: -effD * 0.40 },
      { x: -curW,        z:  effD * 0.12 },
      { x: -curW * 0.62, z:  effD * 0.84 },
      { x: 0,            z:  effD + tipZOffset },
      { x:  curW * 0.62, z:  effD * 0.84 },
      { x:  curW,        z:  effD * 0.12 },
      { x:  curW * 0.92, z: -effD * 0.40 },
    ];

    for (let ix = 0; ix < numX; ix++) {
      let vx = rowPoints[ix].x;
      let vy = y;
      let vz = rowPoints[ix].z;

      // Proximal clearance arch on the first row
      if (iy === 0) {
        const arch = 0.0012 * Math.cos((vx / (curW || 1)) * (Math.PI / 2));
        vy += arch;
      }

      positions.push(vx, vy, vz);
      uvs.push(ix / (numX - 1), v);
    }
  }

  // Generate grid quads
  for (let iy = 0; iy < segmentsY; iy++) {
    for (let ix = 0; ix < numX - 1; ix++) {
      const a = iy * numX + ix;
      const b = (iy + 1) * numX + ix;
      const c = (iy + 1) * numX + (ix + 1);
      const d = iy * numX + (ix + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // End cap closures
  // Proximal end cap (facing +Y)
  indices.push(3, 2, 1);
  indices.push(3, 1, 0);
  indices.push(3, 4, 5);
  indices.push(3, 5, 6);
  indices.push(0, 6, 3);

  // Distal end cap (facing -Y)
  const baseLast = segmentsY * numX;
  const d0 = baseLast + 0, d1 = baseLast + 1, d2 = baseLast + 2;
  const d3 = baseLast + 3, d4 = baseLast + 4, d5 = baseLast + 5, d6 = baseLast + 6;
  indices.push(d3, d1, d2);
  indices.push(d3, d0, d1);
  indices.push(d3, d5, d4);
  indices.push(d3, d6, d5);
  indices.push(d0, d3, d6);

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Creates an ergonomic dark tactile friction grip pad for the inner palmar face.
 */
function createPalmarGripPad(
  width: number,
  length: number,
  thickness: number,
  jointMat: THREE.Material
): THREE.Mesh {
  const padShape = new THREE.Shape();
  const hw = width * 0.46;
  const hl = length * 0.44;
  const r = 0.0010;

  padShape.moveTo(-hw + r, -hl);
  padShape.lineTo(hw - r, -hl);
  padShape.quadraticCurveTo(hw, -hl, hw, -hl + r);
  padShape.lineTo(hw, hl - r);
  padShape.quadraticCurveTo(hw, hl, hw - r, hl);
  padShape.lineTo(-hw + r, hl);
  padShape.quadraticCurveTo(-hw, hl, -hw, hl - r);
  padShape.lineTo(-hw, -hl + r);
  padShape.quadraticCurveTo(-hw, -hl, -hw + r, -hl);

  const padGeo = new THREE.ExtrudeGeometry(padShape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0005,
    bevelSize: 0.0004,
    bevelSegments: 2,
  });
  padGeo.center();

  const mesh = new THREE.Mesh(padGeo, jointMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Creates a flush, internal mechanical hinge pin assembly with concentric pivot caps
 * and an articulated dorsal ceramic knuckle cowl.
 */
function createHingeAssembly(
  radius: number,
  width: number,
  jointMat: THREE.Material,
  armorMat?: THREE.Material
): { pin: THREE.Mesh; caps: THREE.Mesh[]; cowl?: THREE.Mesh } {
  const pinGeo = new THREE.CylinderGeometry(radius, radius, width, 14);
  const pin = new THREE.Mesh(pinGeo, jointMat);
  pin.rotation.z = Math.PI / 2;

  const caps: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    // Flush concentric bearing flange
    const capGeo = new THREE.CylinderGeometry(radius * 1.15, radius * 1.15, 0.0006, 14);
    const cap = new THREE.Mesh(capGeo, jointMat);
    cap.position.set(0, s * (width * 0.5 + 0.0003), 0);
    pin.add(cap);
    caps.push(cap);

    // Micro Allen bolt center recess
    const boltGeo = new THREE.CylinderGeometry(radius * 0.42, radius * 0.42, 0.0008, 6);
    const bolt = new THREE.Mesh(boltGeo, jointMat);
    bolt.position.set(0, s * (width * 0.5 + 0.0007), 0);
    pin.add(bolt);
  }

  let cowl: THREE.Mesh | undefined;
  if (armorMat) {
    // Sculpted ceramic dorsal knuckle cowl bridging the hinge
    const cowlGeo = new THREE.CylinderGeometry(
      radius * 1.18,
      radius * 1.18,
      width * 0.88,
      14,
      1,
      false,
      -Math.PI * 0.45,
      Math.PI * 0.90
    );
    cowl = new THREE.Mesh(cowlGeo, armorMat);
    cowl.rotation.z = Math.PI / 2;
    cowl.position.set(0, 0, radius * 0.15);
    cowl.castShadow = true;
    pin.add(cowl);
  }

  return { pin, caps, cowl };
}

/**
 * Creates a single 3-segment articulated robotic finger:
 * - Internal structural dark titanium core bone (fully enclosed, no exposed side stripes)
 * - Sculpted white ceramic 3D volumetric exoskeleton phalanx shell (compound camber & chamfers)
 * - Segmented palmar dark tactile grip pad (-Z)
 * - Precision cylindrical mechanical hinges with concentric pivot caps & ceramic knuckle cowls
 * - Sculpted distal ceramic fingertip cowl wrapping over tactile sensor aperture
 */
export function createFinger(
  spec: FingerSpec,
  side: -1 | 1,
  materials: RobotMaterialPalette
): FingerNodes {
  const fingerGroup = new THREE.Group();
  fingerGroup.name = `${spec.name}Finger`;

  // ==========================================
  // 1. PROXIMAL SEGMENT (Proximal Phalanx)
  // ==========================================
  const proximalGroup = new THREE.Group();
  proximalGroup.name = 'Proximal';
  fingerGroup.add(proximalGroup);

  // Helper to dispose temporary sub-geometries
  const disposeTemp = (g: THREE.Group) => {
    g.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    });
  };

  // Knuckle socket collar linking proximal phalanx to palm's MCP hinge
  const socketGeo = new THREE.CylinderGeometry(
    spec.proximalRadius * 0.95,
    spec.proximalRadius * 0.85,
    0.005,
    14
  );
  const socketMesh = new THREE.Mesh(socketGeo, materials.joint);
  socketMesh.position.set(0, 0.001, 0);

  // Slender internal titanium structural bone (enclosed within shell)
  const pBoneGeo = new THREE.CylinderGeometry(
    spec.proximalRadius * 0.45,
    spec.proximalRadius * 0.40,
    spec.proximalLength,
    12
  );
  const pBoneMesh = new THREE.Mesh(pBoneGeo, materials.joint);
  pBoneMesh.position.set(0, -spec.proximalLength * 0.5, 0);

  // 3D Volumetric sculpted ceramic exoskeleton shell
  const pArmorWidth = spec.proximalRadius * 2.0;
  const pArmorLength = spec.proximalLength * 0.96;
  const pArmorDepth = spec.proximalRadius * 1.80;
  const pArmorMesh = createSculptedPhalanxShell(pArmorWidth, pArmorLength, pArmorDepth, materials.armor);
  pArmorMesh.position.set(0, -spec.proximalLength * 0.02, 0);

  // Palmar dark tactile friction grip pad (-Z face)
  const pPadMesh = createPalmarGripPad(
    pArmorWidth * 0.72,
    spec.proximalLength * 0.70,
    0.0018,
    materials.joint
  );
  pPadMesh.position.set(0, -spec.proximalLength * 0.50, -pArmorDepth * 0.26);

  // PIP Hinge Assembly at distal end of proximal segment
  const pipHinge = createHingeAssembly(
    spec.proximalRadius * 0.52,
    pArmorWidth * 0.88,
    materials.joint,
    materials.armor
  );
  pipHinge.pin.position.set(0, -spec.proximalLength, 0);

  const tempProximal = new THREE.Group();
  tempProximal.add(socketMesh);
  tempProximal.add(pBoneMesh);
  tempProximal.add(pArmorMesh);
  tempProximal.add(pPadMesh);
  tempProximal.add(pipHinge.pin);

  const pMergedJoint = mergeGroupMeshesByMaterial(tempProximal, materials.joint, `${spec.name}_Proximal_Joint`, false, false)!;
  const pMergedArmor = mergeGroupMeshesByMaterial(tempProximal, materials.armor, `${spec.name}_Proximal_Armor`, false, true)!;
  disposeTemp(tempProximal);

  proximalGroup.add(pMergedJoint);
  proximalGroup.add(pMergedArmor);

  // ==========================================
  // 2. MIDDLE SEGMENT (Intermediate Phalanx)
  // ==========================================
  const middleGroup = new THREE.Group();
  middleGroup.name = 'Middle';
  middleGroup.position.set(0, -spec.proximalLength, 0);
  proximalGroup.add(middleGroup);

  // Slender internal bone
  const mBoneGeo = new THREE.CylinderGeometry(
    spec.middleRadius * 0.45,
    spec.middleRadius * 0.40,
    spec.middleLength,
    12
  );
  const mBoneMesh = new THREE.Mesh(mBoneGeo, materials.joint);
  mBoneMesh.position.set(0, -spec.middleLength * 0.5, 0);

  // 3D Volumetric sculpted ceramic exoskeleton shell
  const mArmorWidth = spec.middleRadius * 2.0;
  const mArmorLength = spec.middleLength * 0.96;
  const mArmorDepth = spec.middleRadius * 1.80;
  const mArmorMesh = createSculptedPhalanxShell(mArmorWidth, mArmorLength, mArmorDepth, materials.armor);
  mArmorMesh.position.set(0, -spec.middleLength * 0.02, 0);

  // Palmar dark tactile friction grip pad
  const mPadMesh = createPalmarGripPad(
    mArmorWidth * 0.72,
    spec.middleLength * 0.70,
    0.0016,
    materials.joint
  );
  mPadMesh.position.set(0, -spec.middleLength * 0.50, -mArmorDepth * 0.26);

  // DIP Hinge Assembly at distal end of middle segment
  const dipHinge = createHingeAssembly(
    spec.middleRadius * 0.50,
    mArmorWidth * 0.84,
    materials.joint,
    materials.armor
  );
  dipHinge.pin.position.set(0, -spec.middleLength, 0);

  const tempMiddle = new THREE.Group();
  tempMiddle.add(mBoneMesh);
  tempMiddle.add(mArmorMesh);
  tempMiddle.add(mPadMesh);
  tempMiddle.add(dipHinge.pin);

  const mMergedJoint = mergeGroupMeshesByMaterial(tempMiddle, materials.joint, `${spec.name}_Middle_Joint`, false, false)!;
  const mMergedArmor = mergeGroupMeshesByMaterial(tempMiddle, materials.armor, `${spec.name}_Middle_Armor`, false, true)!;
  disposeTemp(tempMiddle);

  middleGroup.add(mMergedJoint);
  middleGroup.add(mMergedArmor);

  // ==========================================
  // 3. DISTAL SEGMENT (Distal Phalanx & Tip)
  // ==========================================
  const distalGroup = new THREE.Group();
  distalGroup.name = 'Distal';
  distalGroup.position.set(0, -spec.middleLength, 0);
  middleGroup.add(distalGroup);

  // Tapered internal bone
  const dBoneGeo = new THREE.CylinderGeometry(
    spec.distalRadius * 0.40,
    spec.distalRadius * 0.26,
    spec.distalLength * 0.85,
    12
  );
  const dBoneMesh = new THREE.Mesh(dBoneGeo, materials.joint);
  dBoneMesh.position.set(0, -spec.distalLength * 0.45, 0);

  // Distal ceramic shell with curved aerodynamic fingertip cowl wrapping apex
  const dArmorWidth = spec.distalRadius * 1.95;
  const dArmorLength = spec.distalLength * 1.02;
  const dArmorDepth = spec.distalRadius * 1.75;
  const dArmorMesh = createSculptedPhalanxShell(dArmorWidth, dArmorLength, dArmorDepth, materials.armor, true);
  dArmorMesh.position.set(0, -spec.distalLength * 0.02, 0);

  // Palmar tactile friction grip pad
  const dPadMesh = createPalmarGripPad(
    dArmorWidth * 0.68,
    spec.distalLength * 0.62,
    0.0015,
    materials.joint
  );
  dPadMesh.position.set(0, -spec.distalLength * 0.44, -dArmorDepth * 0.24);

  // Precision tactile sensor aperture on palmar face near apex
  const tipGeo = new THREE.CylinderGeometry(
    spec.distalRadius * 0.40,
    spec.distalRadius * 0.30,
    0.0016,
    14
  );
  const tipMesh = new THREE.Mesh(tipGeo, materials.joint);
  tipMesh.position.set(0, -spec.distalLength * 0.90, -dArmorDepth * 0.16);
  tipMesh.rotation.x = Math.PI * 0.25;

  const tempDistal = new THREE.Group();
  tempDistal.add(dBoneMesh);
  tempDistal.add(dArmorMesh);
  tempDistal.add(dPadMesh);
  tempDistal.add(tipMesh);

  const dMergedJoint = mergeGroupMeshesByMaterial(tempDistal, materials.joint, `${spec.name}_Distal_Joint`, false, false)!;
  const dMergedArmor = mergeGroupMeshesByMaterial(tempDistal, materials.armor, `${spec.name}_Distal_Armor`, false, true)!;
  disposeTemp(tempDistal);

  distalGroup.add(dMergedJoint);
  distalGroup.add(dMergedArmor);

  // Progressive anatomical cascading resting flexion:
  // - Relaxed human/robotic hand: fingers curl naturally toward palm (-Z).
  // - Cascade: Index is most open, Little is most curled.
  const restingAngles: Record<string, { prox: number; mid: number; dist: number; splay: number }> = {
    Index: { prox: 0.18, mid: 0.26, dist: 0.18, splay: 0.035 },
    Middle: { prox: 0.24, mid: 0.32, dist: 0.22, splay: 0.008 },
    Ring: { prox: 0.32, mid: 0.40, dist: 0.26, splay: -0.020 },
    Little: { prox: 0.40, mid: 0.48, dist: 0.32, splay: -0.048 },
  };

  const angles = restingAngles[spec.name] || { prox: 0.24, mid: 0.32, dist: 0.22, splay: 0 };

  proximalGroup.rotation.x = angles.prox;
  middleGroup.rotation.x = angles.mid;
  distalGroup.rotation.x = angles.dist;
  proximalGroup.rotation.z = -side * angles.splay;

  return {
    group: fingerGroup,
    proximal: {
      group: proximalGroup,
      boneMesh: pMergedJoint,
      armorMesh: pMergedArmor,
    },
    middle: {
      group: middleGroup,
      boneMesh: mMergedJoint,
      armorMesh: mMergedArmor,
    },
    distal: {
      group: distalGroup,
      boneMesh: dMergedJoint,
      armorMesh: dMergedArmor,
    },
    tipMesh: dMergedJoint,
  };
}

/**
 * Creates the opposable articulated robotic thumb:
 * - Medial thenar base bracket with sculpted ceramic protective cowl
 * - 2 articulated segments (proximal & distal)
 * - Sleek multi-faceted white ceramic dorsal plates & palmar tactile pads
 * - Flush interphalangeal cylindrical hinge
 * - Natural anatomical opposable grasping posture angled forward and inward
 */
export function createThumb(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ThumbNodes {
  const thumbGroup = new THREE.Group();
  thumbGroup.name = 'Thumb';
  // Positioned at thenar eminence on medial-anterior palm margin
  thumbGroup.position.set(-side * 0.024, -0.020, 0.008);

  // Natural opposable resting orientation: angled forward (+Z) and medially toward index/palm
  thumbGroup.rotation.set(0.38, -side * 0.48, -side * 0.20);

  const disposeTemp = (g: THREE.Group) => {
    g.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    });
  };

  // 1. Thenar Base Swivel Knuckle (Dark core ball)
  const ballGeo = new THREE.SphereGeometry(0.0108, 16, 14);
  const baseBall = new THREE.Mesh(ballGeo, materials.joint);

  // Sculpted white ceramic thenar protector cowl over base ball
  const thenarCowlGeo = new THREE.SphereGeometry(0.0120, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const thenarCowl = new THREE.Mesh(thenarCowlGeo, materials.armor);
  thenarCowl.position.set(0, 0, 0.0020);
  thenarCowl.scale.set(0.92, 0.96, 0.72);
  thenarCowl.castShadow = true;
  thenarCowl.receiveShadow = true;
  thumbGroup.add(thenarCowl);

  // Dark Swivel Collar Bracket
  const collarGeo = new THREE.CylinderGeometry(0.0090, 0.0090, 0.007, 14);
  const baseCollar = new THREE.Mesh(collarGeo, materials.joint);
  baseCollar.position.set(0, -0.005, 0);

  const tempBase = new THREE.Group();
  tempBase.add(baseBall);
  tempBase.add(baseCollar);
  const baseJoint = mergeGroupMeshesByMaterial(tempBase, materials.joint, 'Thumb_Base_Joint')!;
  disposeTemp(tempBase);
  thumbGroup.add(baseJoint);

  // 2. Proximal Segment
  const proximalGroup = new THREE.Group();
  proximalGroup.name = 'ThumbProximal';
  thumbGroup.add(proximalGroup);

  const proxLen = 0.028;
  const proxRad = 0.0070;
  const pBoneGeo = new THREE.CylinderGeometry(proxRad * 0.45, proxRad * 0.40, proxLen, 12);
  const pBoneMesh = new THREE.Mesh(pBoneGeo, materials.joint);
  pBoneMesh.position.set(0, -proxLen * 0.5, 0);

  // 3D Volumetric sculpted ceramic exoskeleton shell
  const pArmorWidth = proxRad * 2.0;
  const pArmorLength = proxLen * 0.96;
  const pArmorDepth = proxRad * 1.80;
  const pArmor = createSculptedPhalanxShell(pArmorWidth, pArmorLength, pArmorDepth, materials.armor);
  pArmor.position.set(0, -proxLen * 0.02, 0);

  // Palmar grip pad (-Z)
  const pPadMesh = createPalmarGripPad(pArmorWidth * 0.72, proxLen * 0.70, 0.0018, materials.joint);
  pPadMesh.position.set(0, -proxLen * 0.50, -pArmorDepth * 0.26);

  // Thumb IP Hinge Joint Assembly with ceramic knuckle cowl
  const ipHinge = createHingeAssembly(proxRad * 0.52, pArmorWidth * 0.88, materials.joint, materials.armor);
  ipHinge.pin.position.set(0, -proxLen, 0);

  const tempThumbProx = new THREE.Group();
  tempThumbProx.add(pBoneMesh);
  tempThumbProx.add(pArmor);
  tempThumbProx.add(pPadMesh);
  tempThumbProx.add(ipHinge.pin);

  const tpMergedJoint = mergeGroupMeshesByMaterial(tempThumbProx, materials.joint, 'Thumb_Proximal_Joint', false, false)!;
  const tpMergedArmor = mergeGroupMeshesByMaterial(tempThumbProx, materials.armor, 'Thumb_Proximal_Armor', false, true)!;
  disposeTemp(tempThumbProx);

  proximalGroup.add(tpMergedJoint);
  proximalGroup.add(tpMergedArmor);

  // 3. Distal Segment
  const distalGroup = new THREE.Group();
  distalGroup.name = 'ThumbDistal';
  distalGroup.position.set(0, -proxLen, 0);
  proximalGroup.add(distalGroup);

  const distLen = 0.022;
  const distRad = 0.0060;
  const dBoneGeo = new THREE.CylinderGeometry(distRad * 0.40, distRad * 0.26, distLen * 0.85, 12);
  const dBoneMesh = new THREE.Mesh(dBoneGeo, materials.joint);
  dBoneMesh.position.set(0, -distLen * 0.45, 0);

  // Distal ceramic shell with curved aerodynamic fingertip cowl wrapping apex
  const dArmorWidth = distRad * 1.95;
  const dArmorLength = distLen * 1.02;
  const dArmorDepth = distRad * 1.75;
  const dArmor = createSculptedPhalanxShell(dArmorWidth, dArmorLength, dArmorDepth, materials.armor, true);
  dArmor.position.set(0, -distLen * 0.02, 0);

  // Palmar pad
  const dPad = createPalmarGripPad(dArmorWidth * 0.68, distLen * 0.62, 0.0015, materials.joint);
  dPad.position.set(0, -distLen * 0.44, -dArmorDepth * 0.24);

  // Precision tactile sensor aperture on palmar face near apex
  const tipGeo = new THREE.CylinderGeometry(distRad * 0.40, distRad * 0.30, 0.0016, 14);
  const tipMesh = new THREE.Mesh(tipGeo, materials.joint);
  tipMesh.position.set(0, -distLen * 0.90, -dArmorDepth * 0.16);
  tipMesh.rotation.x = Math.PI * 0.25;

  const tempThumbDist = new THREE.Group();
  tempThumbDist.add(dBoneMesh);
  tempThumbDist.add(dArmor);
  tempThumbDist.add(dPad);
  tempThumbDist.add(tipMesh);

  const tdMergedJoint = mergeGroupMeshesByMaterial(tempThumbDist, materials.joint, 'Thumb_Distal_Joint', false, false)!;
  const tdMergedArmor = mergeGroupMeshesByMaterial(tempThumbDist, materials.armor, 'Thumb_Distal_Armor', false, true)!;
  disposeTemp(tempThumbDist);

  distalGroup.add(tdMergedJoint);
  distalGroup.add(tdMergedArmor);

  // Natural resting thumb flexion curling toward palm
  proximalGroup.rotation.x = 0.32;
  proximalGroup.rotation.z = -side * 0.12;
  distalGroup.rotation.x = 0.36;

  return {
    group: thumbGroup,
    baseBall: baseJoint,
    baseCollar: baseJoint,
    proximal: {
      group: proximalGroup,
      boneMesh: tpMergedJoint,
      armorMesh: tpMergedArmor,
    },
    distal: {
      group: distalGroup,
      boneMesh: tdMergedJoint,
      armorMesh: tdMergedArmor,
    },
    tipMesh: tdMergedJoint,
  };
}

