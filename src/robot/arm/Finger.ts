import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

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
 * Creates an aerodynamic beveled white ceramic dorsal armor plate for a finger segment.
 * Features rounded trapezoidal camber and high-precision beveling matching reference "FINGER DETAIL".
 */
/**
 * Creates an aerodynamic beveled white ceramic dorsal armor plate for a finger segment.
 * Features:
 * - Compound 3D camber curvature with central spine ridge to catch specular roll-off
 * - Concave joint relief notches at proximal and distal margins clearing the hinge pins
 * - Curving distal "fingernail hood" for terminal phalanx segments
 * - Precision automotive beveling
 */
function createFingerArmorPlate(
  width: number,
  length: number,
  depth: number,
  material: THREE.Material,
  isDistalTip: boolean = false
): THREE.Mesh {
  const shape = new THREE.Shape();
  const halfW = width * 0.5;
  const r = Math.min(width * 0.26, 0.0035);

  const topW = halfW * 0.96;
  const botW = isDistalTip ? halfW * 0.72 : halfW * 0.86;

  // Top edge with subtle concave arch notch clearing the proximal joint axle
  shape.moveTo(-topW + r, 0);
  shape.quadraticCurveTo(0, -0.0012, topW - r, 0);
  shape.quadraticCurveTo(topW, 0, topW, -r);

  // Lateral flank tapering smoothly toward distal joint
  shape.lineTo(botW, -(length - r));

  // Bottom edge: for distal tip, a rounded shield tip; for intermediate, a concave clearance arch
  if (isDistalTip) {
    shape.quadraticCurveTo(botW, -length, 0, -length - 0.0022);
    shape.quadraticCurveTo(-botW, -length, -botW, -(length - r));
  } else {
    shape.quadraticCurveTo(botW, -length, botW - r, -length);
    shape.quadraticCurveTo(0, -length + 0.0012, -botW + r, -length);
    shape.quadraticCurveTo(-botW, -length, -botW, -(length - r));
  }

  // Medial flank return
  shape.lineTo(-topW, -r);
  shape.quadraticCurveTo(-topW, 0, -topW + r, 0);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.0018,
    bevelSize: 0.0015,
    bevelSegments: 3,
    curveSegments: 20,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  // Compound 3D Curvature & Central Keel:
  // Give the dorsal surface a parabolic cross-sectional arch and a defined centerline spine
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    if (z > 0) {
      const nx = Math.min(1.0, Math.abs(x) / (halfW * 0.95));
      // Parabolic camber curvature across X
      const camber = (1.0 - Math.pow(nx, 1.8)) * (depth * 0.38);
      // Subtle taper along length
      const ny = Math.abs(y) / (length * 0.5 + 0.001);
      let newZ = z + camber * (1.0 - ny * 0.15);

      // If distal tip, wrap the terminal apex forward over the fingertip
      if (isDistalTip && y < -length * 0.30) {
        const wrapProgress = Math.min(1.0, (-y - length * 0.30) / (length * 0.25));
        newZ += Math.sin(wrapProgress * Math.PI * 0.5) * 0.0018;
      }
      pos.setZ(i, newZ);
    }
  }
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Creates a palmar dark tactile friction grip pad for a finger segment.
 * Matches reference showing dark segmented pads on the palmar surface.
 */
function createPalmarGripPad(
  width: number,
  length: number,
  thickness: number,
  jointMat: THREE.Material
): THREE.Mesh {
  const padShape = new THREE.Shape();
  const hw = width * 0.44;
  const hl = length * 0.42;
  const r = 0.0018;

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
    bevelThickness: 0.0010,
    bevelSize: 0.0008,
    bevelSegments: 2,
  });
  padGeo.center();

  const mesh = new THREE.Mesh(padGeo, jointMat);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Creates a detailed mechanical hinge pin assembly with end-caps.
 * Axle is aligned with the X axis for natural transverse bending.
 */
function createHingeAssembly(
  radius: number,
  width: number,
  jointMat: THREE.Material
): { pin: THREE.Mesh; caps: THREE.Mesh[] } {
  // Main cylindrical hinge axle aligned with transverse X axis
  const pinGeo = new THREE.CylinderGeometry(radius, radius, width, 16);
  const pin = new THREE.Mesh(pinGeo, jointMat);
  pin.rotation.z = Math.PI / 2;

  const caps: THREE.Mesh[] = [];
  // Two lateral circular end-cap washers with stepped beveled rim along axle
  for (const s of [-1, 1]) {
    const capGeo = new THREE.CylinderGeometry(radius * 1.30, radius * 1.30, 0.0022, 16);
    const cap = new THREE.Mesh(capGeo, jointMat);
    cap.position.set(0, s * (width * 0.5 + 0.0011), 0);
    pin.add(cap);
    caps.push(cap);

    // Micro axle center recess
    const holeGeo = new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, 0.0028, 12);
    const hole = new THREE.Mesh(holeGeo, jointMat);
    hole.position.set(0, s * (width * 0.5 + 0.0024), 0);
    pin.add(hole);
  }

  return { pin, caps };
}

/**
 * Creates a single 3-segment articulated robotic finger:
 * - Internal structural dark titanium core bone
 * - Sculpted white ceramic cambered armor plate on dorsal side (+Z)
 * - Segmented palmar dark tactile grip pad on inner palmar side (-Z)
 * - Mechanical hinge pins with circular end-caps between segments along transverse X
 * - Progressive taper toward tip with dark tactile sensor dome and ceramic protective cowl
 * - Hierarchical THREE.Group nesting for clean independent joint bending
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

  // Knuckle socket collar linking proximal phalanx to palm's MCP hinge
  const socketGeo = new THREE.CylinderGeometry(
    spec.proximalRadius * 1.08,
    spec.proximalRadius * 0.95,
    0.008,
    16
  );
  const socketMesh = new THREE.Mesh(socketGeo, materials.joint);
  socketMesh.position.set(0, 0.002, 0);
  socketMesh.castShadow = true;
  proximalGroup.add(socketMesh);

  // Dark titanium bone
  const pBoneGeo = new THREE.CylinderGeometry(
    spec.proximalRadius * 0.88,
    spec.proximalRadius * 0.80,
    spec.proximalLength,
    14
  );
  const pBoneMesh = new THREE.Mesh(pBoneGeo, materials.joint);
  pBoneMesh.position.set(0, -spec.proximalLength * 0.5, 0);
  pBoneMesh.castShadow = true;
  proximalGroup.add(pBoneMesh);

  // Sculpted dorsal white armor plate on +Z face (dorsal side)
  const pArmorWidth = spec.proximalRadius * 2.15;
  const pArmorLength = spec.proximalLength * 0.88;
  const pArmorDepth = spec.proximalRadius * 1.25;
  const pArmorMesh = createFingerArmorPlate(pArmorWidth, pArmorLength, pArmorDepth, materials.armor);
  pArmorMesh.position.set(0, -spec.proximalLength * 0.5, spec.proximalRadius * 0.58);
  proximalGroup.add(pArmorMesh);

  // Palmar dark tactile friction grip pad on -Z face (palmar side)
  const pPadMesh = createPalmarGripPad(
    spec.proximalRadius * 1.6,
    spec.proximalLength * 0.72,
    0.003,
    materials.joint
  );
  pPadMesh.position.set(0, -spec.proximalLength * 0.5, -spec.proximalRadius * 0.65);
  proximalGroup.add(pPadMesh);

  // PIP Hinge Assembly at distal end of proximal segment
  const pipHingeWidth = spec.proximalRadius * 2.25;
  const pipHinge = createHingeAssembly(spec.proximalRadius * 0.72, pipHingeWidth, materials.joint);
  pipHinge.pin.position.set(0, -spec.proximalLength, 0);
  proximalGroup.add(pipHinge.pin);

  // ==========================================
  // 2. MIDDLE SEGMENT (Intermediate Phalanx)
  // ==========================================
  const middleGroup = new THREE.Group();
  middleGroup.name = 'Middle';
  middleGroup.position.set(0, -spec.proximalLength, 0);
  proximalGroup.add(middleGroup);

  // Dark titanium bone
  const mBoneGeo = new THREE.CylinderGeometry(
    spec.middleRadius * 0.86,
    spec.middleRadius * 0.78,
    spec.middleLength,
    14
  );
  const mBoneMesh = new THREE.Mesh(mBoneGeo, materials.joint);
  mBoneMesh.position.set(0, -spec.middleLength * 0.5, 0);
  mBoneMesh.castShadow = true;
  middleGroup.add(mBoneMesh);

  // Sculpted dorsal white armor plate on +Z face
  const mArmorWidth = spec.middleRadius * 2.05;
  const mArmorLength = spec.middleLength * 0.86;
  const mArmorDepth = spec.middleRadius * 1.20;
  const mArmorMesh = createFingerArmorPlate(mArmorWidth, mArmorLength, mArmorDepth, materials.armor);
  mArmorMesh.position.set(0, -spec.middleLength * 0.5, spec.middleRadius * 0.52);
  middleGroup.add(mArmorMesh);

  // Palmar dark tactile friction grip pad on -Z face
  const mPadMesh = createPalmarGripPad(
    spec.middleRadius * 1.5,
    spec.middleLength * 0.70,
    0.0028,
    materials.joint
  );
  mPadMesh.position.set(0, -spec.middleLength * 0.5, -spec.middleRadius * 0.60);
  middleGroup.add(mPadMesh);

  // DIP Hinge Assembly at distal end of middle segment
  const dipHingeWidth = spec.middleRadius * 2.15;
  const dipHinge = createHingeAssembly(spec.middleRadius * 0.68, dipHingeWidth, materials.joint);
  dipHinge.pin.position.set(0, -spec.middleLength, 0);
  middleGroup.add(dipHinge.pin);

  // ==========================================
  // 3. DISTAL SEGMENT (Distal Phalanx & Tip)
  // ==========================================
  const distalGroup = new THREE.Group();
  distalGroup.name = 'Distal';
  distalGroup.position.set(0, -spec.middleLength, 0);
  middleGroup.add(distalGroup);

  // Tapered dark bone
  const dBoneGeo = new THREE.CylinderGeometry(
    spec.distalRadius * 0.84,
    spec.distalRadius * 0.58,
    spec.distalLength,
    14
  );
  const dBoneMesh = new THREE.Mesh(dBoneGeo, materials.joint);
  dBoneMesh.position.set(0, -spec.distalLength * 0.5, 0);
  dBoneMesh.castShadow = true;
  distalGroup.add(dBoneMesh);

  // Distal armor plate with fingernail hood wrapping over sensor tip
  const dArmorWidth = spec.distalRadius * 1.95;
  const dArmorLength = spec.distalLength * 0.82;
  const dArmorDepth = spec.distalRadius * 1.15;
  const dArmorMesh = createFingerArmorPlate(dArmorWidth, dArmorLength, dArmorDepth, materials.armor, true);
  dArmorMesh.position.set(0, -spec.distalLength * 0.46, spec.distalRadius * 0.48);
  distalGroup.add(dArmorMesh);

  // Palmar dark tactile friction grip pad on distal segment (-Z face)
  const dPadMesh = createPalmarGripPad(
    spec.distalRadius * 1.4,
    spec.distalLength * 0.65,
    0.0025,
    materials.joint
  );
  dPadMesh.position.set(0, -spec.distalLength * 0.46, -spec.distalRadius * 0.55);
  distalGroup.add(dPadMesh);

  // Dark tactile sensor dome at fingertip
  const tipGeo = new THREE.SphereGeometry(spec.distalRadius * 0.78, 14, 14);
  const tipMesh = new THREE.Mesh(tipGeo, materials.joint);
  tipMesh.position.set(0, -spec.distalLength, 0);
  tipMesh.scale.set(1.0, 1.15, 0.92);
  distalGroup.add(tipMesh);

  // Progressive anatomical resting flexion:
  // - Natural relaxed human/robotic hand: fingers curl toward the palm (-Z).
  // - Positive rotation around X axis smoothly flexes the digit toward -Z.
  // - Cascade: Index is most open/extended, Little is most flexed.
  const restingAngles: Record<string, { prox: number; mid: number; dist: number; splay: number }> = {
    Index: { prox: 0.20, mid: 0.35, dist: 0.24, splay: 0.025 },
    Middle: { prox: 0.24, mid: 0.40, dist: 0.28, splay: 0.000 },
    Ring: { prox: 0.28, mid: 0.46, dist: 0.32, splay: -0.018 },
    Little: { prox: 0.32, mid: 0.52, dist: 0.36, splay: -0.038 },
  };

  const angles = restingAngles[spec.name] || { prox: 0.24, mid: 0.40, dist: 0.28, splay: 0 };

  // Natural inward curl toward palm (-Z direction)
  proximalGroup.rotation.x = angles.prox;
  middleGroup.rotation.x = angles.mid;
  distalGroup.rotation.x = angles.dist;

  // Natural anatomical finger splay along Z axis
  proximalGroup.rotation.z = -side * angles.splay;

  return {
    group: fingerGroup,
    proximal: {
      group: proximalGroup,
      boneMesh: pBoneMesh,
      armorMesh: pArmorMesh,
      padMesh: pPadMesh,
      hingeMesh: pipHinge.pin,
      hingeCaps: pipHinge.caps,
    },
    middle: {
      group: middleGroup,
      boneMesh: mBoneMesh,
      armorMesh: mArmorMesh,
      padMesh: mPadMesh,
      hingeMesh: dipHinge.pin,
      hingeCaps: dipHinge.caps,
    },
    distal: {
      group: distalGroup,
      boneMesh: dBoneMesh,
      armorMesh: dArmorMesh,
      padMesh: dPadMesh,
    },
    tipMesh,
  };
}

/**
 * Creates the opposable articulated robotic thumb:
 * - Angled thenar mount with dark spherical swivel ball and socket bracket
 * - 2 articulated segments (proximal & distal)
 * - Beveled white ceramic dorsal plates & palmar tactile pads
 * - Interphalangeal cylindrical hinge with end-caps
 * - Dark tactile sensor dome at tip
 */
export function createThumb(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ThumbNodes {
  const thumbGroup = new THREE.Group();
  thumbGroup.name = 'Thumb';
  // Positioned at medial-anterior thenar eminence
  thumbGroup.position.set(-side * 0.022, -0.026, 0.006);

  // Resting orientation: angled inward toward the palm and fingers
  thumbGroup.rotation.set(0.24, -side * 0.32, -side * 0.14);

  // 1. Thenar Base Swivel Ball
  const ballGeo = new THREE.SphereGeometry(0.011, 18, 16);
  const baseBall = new THREE.Mesh(ballGeo, materials.joint);
  baseBall.castShadow = true;
  thumbGroup.add(baseBall);

  // Dark Swivel Collar Bracket
  const collarGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.008, 16);
  const baseCollar = new THREE.Mesh(collarGeo, materials.joint);
  baseCollar.position.set(0, -0.005, 0);
  thumbGroup.add(baseCollar);

  // 2. Proximal Segment
  const proximalGroup = new THREE.Group();
  proximalGroup.name = 'ThumbProximal';
  thumbGroup.add(proximalGroup);

  const proxLen = 0.030;
  const proxRad = 0.0070;
  const pBoneGeo = new THREE.CylinderGeometry(proxRad * 0.88, proxRad * 0.80, proxLen, 14);
  const pBoneMesh = new THREE.Mesh(pBoneGeo, materials.joint);
  pBoneMesh.position.set(0, -proxLen * 0.5, 0);
  pBoneMesh.castShadow = true;
  proximalGroup.add(pBoneMesh);

  // White armor shell on outer dorsal side (+Z)
  const pArmor = createFingerArmorPlate(proxRad * 2.15, proxLen * 0.86, proxRad * 1.30, materials.armor);
  pArmor.position.set(0, -proxLen * 0.5, proxRad * 0.56);
  proximalGroup.add(pArmor);

  // Palmar grip pad (-Z)
  const pPadMesh = createPalmarGripPad(proxRad * 1.6, proxLen * 0.70, 0.0028, materials.joint);
  pPadMesh.position.set(0, -proxLen * 0.5, -proxRad * 0.62);
  proximalGroup.add(pPadMesh);

  // Thumb IP Hinge Joint Assembly
  const ipHinge = createHingeAssembly(proxRad * 0.72, proxRad * 2.20, materials.joint);
  ipHinge.pin.position.set(0, -proxLen, 0);
  proximalGroup.add(ipHinge.pin);

  // 3. Distal Segment
  const distalGroup = new THREE.Group();
  distalGroup.name = 'ThumbDistal';
  distalGroup.position.set(0, -proxLen, 0);
  proximalGroup.add(distalGroup);

  const distLen = 0.024;
  const distRad = 0.0060;
  const dBoneGeo = new THREE.CylinderGeometry(distRad * 0.86, distRad * 0.60, distLen, 14);
  const dBoneMesh = new THREE.Mesh(dBoneGeo, materials.joint);
  dBoneMesh.position.set(0, -distLen * 0.5, 0);
  dBoneMesh.castShadow = true;
  distalGroup.add(dBoneMesh);

  // Distal armor plate with curved protective fingernail hood
  const dArmor = createFingerArmorPlate(distRad * 2.05, distLen * 0.82, distRad * 1.20, materials.armor, true);
  dArmor.position.set(0, -distLen * 0.46, distRad * 0.48);
  distalGroup.add(dArmor);

  // Palmar pad
  const dPad = createPalmarGripPad(distRad * 1.4, distLen * 0.65, 0.0025, materials.joint);
  dPad.position.set(0, -distLen * 0.46, -distRad * 0.54);
  distalGroup.add(dPad);

  // Tactile sensor dome tip
  const tipGeo = new THREE.SphereGeometry(distRad * 0.76, 14, 14);
  const tipMesh = new THREE.Mesh(tipGeo, materials.joint);
  tipMesh.position.set(0, -distLen, 0);
  tipMesh.scale.set(1.0, 1.15, 0.92);
  distalGroup.add(tipMesh);

  // Natural resting thumb flexion
  proximalGroup.rotation.x = 0.20;
  proximalGroup.rotation.z = -side * 0.10;
  distalGroup.rotation.x = 0.24;

  return {
    group: thumbGroup,
    baseBall,
    baseCollar,
    proximal: {
      group: proximalGroup,
      boneMesh: pBoneMesh,
      armorMesh: pArmor,
      padMesh: pPadMesh,
      hingeMesh: ipHinge.pin,
      hingeCaps: ipHinge.caps,
    },
    distal: {
      group: distalGroup,
      boneMesh: dBoneMesh,
      armorMesh: dArmor,
      padMesh: dPad,
    },
    tipMesh,
  };
}
