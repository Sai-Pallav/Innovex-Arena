/**
 * ============================================================================
 * CHEST SHOULDER EXTENSION & SCULPTED WHITE PAULDRON ASSEMBLY (IMAGE 2 MASTER)
 * ============================================================================
 *
 * Replaces the old boxy rectangular shoulder block with an authentic mecha pauldron cowl:
 * - DESTROYS THE RECTANGULAR BOX: No enclosing front, rear, bottom, or outer white walls.
 * - Single sculpted white pauldron hood arching gracefully over the circular bearing.
 * - Leaves the circular bearing, metallic rings, dark housing, and purple halo 100% exposed!
 * - Deliberate 6mm air gap / black structural shadow between the pauldron and the bearing.
 * - Inboard transition collar connecting cleanly to the chest at X = ±0.175 → ±0.205.
 * ============================================================================
 */

import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import {
  createMultiAxisShoulderJoint,
  MultiAxisShoulderJointNodes,
} from './MultiAxisShoulderJoint';

export interface ShoulderExtensionNodes {
  group: THREE.Group;
  whiteStructuralAssembly: THREE.Group;
  chestTransitionPanel: THREE.Mesh;
  mountingFrame: THREE.Mesh;
  upperShoulderShell: THREE.Mesh | THREE.Group;
  lowerShoulderShell: THREE.Mesh | THREE.Group;
  frontStructuralPanel: THREE.Mesh | THREE.Group;
  rearStructuralPanel: THREE.Mesh | THREE.Group;
  innerCavityWalls: THREE.Mesh;
  outerShoulderShell: THREE.Group | THREE.Mesh;
  recessHousing: THREE.Mesh;
  extensionCowl: THREE.Group | THREE.Mesh;
  shoulderMountPivot: THREE.Group;
  baseFlange: THREE.Mesh;
  accentRing: THREE.Mesh;
  driveHub: THREE.Mesh;
  faceFlange: THREE.Mesh;
  rearTrussCage: THREE.Group;
  undersideChannel: THREE.Group;
  ledMeshes: THREE.Mesh[];
  multiAxisJoint?: MultiAxisShoulderJointNodes;
  primaryAxisPivot?: THREE.Group;
  secondaryAxisCarrier?: THREE.Group;
  secondaryAxisPivot?: THREE.Group;
  armMount?: THREE.Group;
  armMountingFlange?: THREE.Mesh;
}

// Shoulder Joint Axis Centerline (Model/Torso Space)
const Y_CENTER = 0.052;
const Z_CENTER = 0.015;

/**
 * Returns seam coordinate on the chest socket aperture where the extension mates flush.
 */
function getChestSeamPoint(sector: number, totalSectors: number, side: -1 | 1): { x: number; y: number; z: number } {
  const angle = (sector / totalSectors) * Math.PI * 2;
  const sinA = Math.sin(angle);
  const cosA = Math.cos(angle);

  let py = Y_CENTER + 0.054 * sinA;
  let pz = Z_CENTER + 0.058 * cosA;
  let xDepth = 0.174;

  if (sinA >= 0 && cosA >= 0) {
    const t = cosA;
    py = 0.108 * (1 - t) + 0.052 * t;
    pz = 0.018 * (1 - t) + 0.076 * t;
    xDepth = 0.155 * (1 - t) + 0.178 * t;
  } else if (sinA >= 0 && cosA < 0) {
    const t = -cosA;
    py = 0.108 * (1 - t) + 0.065 * t;
    const easeT = Math.pow(t, 0.45);
    pz = 0.018 * (1 - easeT) - 0.082 * easeT;
    xDepth = 0.155 * (1 - easeT) + 0.130 * easeT;
  } else if (sinA < 0 && cosA < 0) {
    const t = -cosA;
    py = 0.065 * t + 0.012 * (1 - t);
    pz = -0.082 * t + 0.015 * (1 - t);
    xDepth = 0.130 * t + 0.165 * (1 - t);
  } else {
    const t = cosA;
    py = 0.012 * (1 - t) + 0.052 * t;
    pz = 0.015 * (1 - t) + 0.076 * t;
    xDepth = 0.165 * (1 - t) + 0.178 * t;
  }

  return {
    x: side * xDepth,
    y: py,
    z: pz,
  };
}

/**
 * Creates the inboard white transitional collar (chestTransitionPanel).
 * Bridges flush from the chest armor (X ≈ ±0.175) to the base of the shoulder socket (X = ±0.205).
 * STOPS at X = ±0.205 so it NEVER covers the shoulder bearing mechanism!
 */
function createChestTransitionGeometry(side: -1 | 1): THREE.BufferGeometry {
  const SECTORS = 24;
  const positions: number[] = [];

  function pushQuad(
    p1: { x: number; y: number; z: number },
    p2: { x: number; y: number; z: number },
    p3: { x: number; y: number; z: number },
    p4: { x: number; y: number; z: number }
  ) {
    if (side === 1) {
      positions.push(p1.x, p1.y, p1.z, p3.x, p3.y, p3.z, p2.x, p2.y, p2.z);
      positions.push(p1.x, p1.y, p1.z, p4.x, p4.y, p4.z, p3.x, p3.y, p3.z);
    } else {
      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
      positions.push(p1.x, p1.y, p1.z, p3.x, p3.y, p3.z, p4.x, p4.y, p4.z);
    }
  }

  const ring0 = [];
  const ring1 = [];
  const ring2 = [];
  const ring3 = [];

  const collarR = 0.0460;

  for (let s = 0; s < SECTORS; s++) {
    const angle = (s / SECTORS) * Math.PI * 2;
    const seam = getChestSeamPoint(s, SECTORS, side);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    ring0.push(seam);

    ring1.push({
      x: side * (Math.abs(seam.x) * 0.40 + 0.188 * 0.60),
      y: seam.y * 0.40 + (Y_CENTER + collarR * sinA) * 0.60,
      z: seam.z * 0.40 + (Z_CENTER + collarR * cosA) * 0.60,
    });

    ring2.push({
      x: side * 0.192,
      y: Y_CENTER + collarR * 0.95 * sinA,
      z: Z_CENTER + collarR * 0.95 * cosA,
    });

    ring3.push({
      x: side * 0.198,
      y: Y_CENTER + collarR * sinA,
      z: Z_CENTER + collarR * cosA,
    });
  }

  // Connect top and upper clavicle arch (s = 2 to 11)
  // Leaves the front and underside 100% open so the black mechanical joint and bearing are exposed!
  for (let s = 2; s < 11; s++) {
    const next = (s + 1) % SECTORS;
    pushQuad(ring0[s], ring0[next], ring1[next], ring1[s]);
    pushQuad(ring1[s], ring1[next], ring2[next], ring2[s]);
    pushQuad(ring2[s], ring2[next], ring3[next], ring3[s]);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * 1. Upper Shoulder Shell (The Sculpted Pauldron Hood / Mantle)
 * Arches cleanly over the circular joint, closely hugging the compact bearing.
 * Maintains a deliberate 3mm clearance above the bearing, leaving the side, front, and bottom EXPOSED!
 */
function createSculptedPauldronGeometry(side: -1 | 1): THREE.BufferGeometry {
  const uSegs = 32; // along arch
  const vSegs = 24; // across width
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  function evaluatePoint(layer: 0 | 1, iu: number, iv: number): THREE.Vector3 {
    const u = iu / uSegs;
    const v = iv / vSegs;

    // Continuous wrap-around arch from anterior-inferior (u=0) over apex (u=0.48) to posterior-inferior (u=1.0)
    const angle = (-0.14 * (1 - u) + 1.14 * u) * Math.PI;
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);

    // Slimmed bearing outer radius is 0.0465m.
    // rBase maintains a snug 2.0mm mechanical clearance around the actuator.
    // rOuter provides a sleek 3.6mm - 4.5mm volumetric armor shell thickness.
    const rBase = 0.0475 + 0.0010 * Math.sin(u * Math.PI);
    const rOuter = rBase + 0.0036 + 0.0012 * Math.pow(Math.sin(u * Math.PI), 1.2);
    const radius = layer === 0 ? rOuter : rBase;

    // Compact lateral span:
    // v = 0: inboard connects flush with chest collar seam at side * -0.036m
    // v = 1: outboard frames the lateral bearing face at side * +0.012m (no longer flaring way out to +0.030m!)
    const xSpan = -0.036 + v * 0.048;
    const x = side * xSpan;

    // Compound roll: outboard edge tapers down around the lateral face toward upper arm
    let y = radius * sinA;
    if (v > 0.35) {
      const tOut = (v - 0.35) / 0.65;
      y -= Math.pow(tOut, 1.25) * 0.020;
    }

    let z = radius * cosA;

    // Precision chamfered lower edge return on anterior and posterior terminations
    if (u < 0.12) {
      const tEdge = (0.12 - u) / 0.12;
      z += tEdge * 0.0028;
      y -= tEdge * 0.0024;
    } else if (u > 0.88) {
      const tEdge = (u - 0.88) / 0.12;
      z -= tEdge * 0.0028;
      y -= tEdge * 0.0024;
    }

    return new THREE.Vector3(x, y, z);
  }

  // Generate outer (0) and inner (1) surfaces
  for (let layer = 0; layer <= 1; layer++) {
    for (let iu = 0; iu <= uSegs; iu++) {
      for (let iv = 0; iv <= vSegs; iv++) {
        const p = evaluatePoint(layer as 0 | 1, iu, iv);
        positions.push(p.x, p.y, p.z);
        uvs.push(iv / vSegs, iu / uSegs);
      }
    }
  }

  const layerStride = (uSegs + 1) * (vSegs + 1);

  // Outer surface triangles
  for (let iu = 0; iu < uSegs; iu++) {
    for (let iv = 0; iv < vSegs; iv++) {
      const a = iu * (vSegs + 1) + iv;
      const b = a + 1;
      const c = a + (vSegs + 1);
      const d = c + 1;
      if (side === 1) {
        indices.push(a, b, c);
        indices.push(b, d, c);
      } else {
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
  }

  // Inner surface triangles (reverse winding)
  for (let iu = 0; iu < uSegs; iu++) {
    for (let iv = 0; iv < vSegs; iv++) {
      const a = layerStride + iu * (vSegs + 1) + iv;
      const b = a + 1;
      const c = a + (vSegs + 1);
      const d = c + 1;
      if (side === 1) {
        indices.push(a, c, b);
        indices.push(b, c, d);
      } else {
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
  }

  // Perimeter bevel edges
  // Front edge (iu = 0)
  for (let iv = 0; iv < vSegs; iv++) {
    const oA = iv;
    const oB = iv + 1;
    const iA = layerStride + iv;
    const iB = layerStride + iv + 1;
    if (side === 1) {
      indices.push(oA, iA, oB);
      indices.push(oB, iA, iB);
    } else {
      indices.push(oA, oB, iA);
      indices.push(oB, iB, iA);
    }
  }

  // Rear edge (iu = uSegs)
  const rearOffset = uSegs * (vSegs + 1);
  for (let iv = 0; iv < vSegs; iv++) {
    const oA = rearOffset + iv;
    const oB = rearOffset + iv + 1;
    const iA = layerStride + rearOffset + iv;
    const iB = layerStride + rearOffset + iv + 1;
    if (side === 1) {
      indices.push(oA, oB, iA);
      indices.push(oB, iB, iA);
    } else {
      indices.push(oA, iA, oB);
      indices.push(oB, iA, iB);
    }
  }

  // Inboard edge (iv = 0)
  for (let iu = 0; iu < uSegs; iu++) {
    const oA = iu * (vSegs + 1);
    const oC = (iu + 1) * (vSegs + 1);
    const iA = layerStride + oA;
    const iC = layerStride + oC;
    if (side === 1) {
      indices.push(oA, oC, iA);
      indices.push(oC, iC, iA);
    } else {
      indices.push(oA, iA, oC);
      indices.push(oC, iA, iC);
    }
  }

  // Outboard edge (iv = vSegs)
  for (let iu = 0; iu < uSegs; iu++) {
    const oA = iu * (vSegs + 1) + vSegs;
    const oC = (iu + 1) * (vSegs + 1) + vSegs;
    const iA = layerStride + oA;
    const iC = layerStride + oC;
    if (side === 1) {
      indices.push(oA, iA, oC);
      indices.push(oC, iA, iC);
    } else {
      indices.push(oA, oC, iA);
      indices.push(oC, iC, iA);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function createUpperShoulderShell(
  side: -1 | 1,
  materials: RobotMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = side === -1 ? 'LeftUpperShoulderShell' : 'RightUpperShoulderShell';

  // 1. Continuous sculpted white ceramic pauldron
  const geo = createSculptedPauldronGeometry(side);
  const mesh = new THREE.Mesh(geo, materials.armorDoubleSide);
  mesh.name = side === -1 ? 'LeftUpperShoulderHood' : 'RightUpperShoulderHood';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // 2. Dark Titanium Inner Cavity Lining (provides depth & shadow behind white armor)
  const liningGeo = new THREE.CylinderGeometry(0.0465, 0.0465, 0.026, 28, 1, true, -0.10 * Math.PI, 1.20 * Math.PI);
  liningGeo.rotateZ(Math.PI / 2);
  const liningMesh = new THREE.Mesh(liningGeo, materials.jointDoubleSide);
  liningMesh.position.set(side * 0.003, 0, 0);
  liningMesh.castShadow = true;
  group.add(liningMesh);

  group.position.set(side * 0.222, Y_CENTER, Z_CENTER);
  group.rotation.set(0.02, -side * 0.20, side * 0.04);

  return group;
}

/**
 * 1B. Outer Shoulder Shell (Integrated lateral bracket / bezel)
 */
function createOuterShoulderShell(
  side: -1 | 1,
  materials: RobotMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = side === -1 ? 'LeftOuterShoulderShell' : 'RightOuterShoulderShell';

  // Low-profile dark titanium backing collar that neatly seals the lateral joint aperture
  const backingGeo = new THREE.TorusGeometry(0.0470, 0.0018, 8, 36, Math.PI * 0.75);
  backingGeo.rotateZ(Math.PI * 0.15);
  backingGeo.rotateY(Math.PI / 2);
  const backingMesh = new THREE.Mesh(backingGeo, materials.joint);
  backingMesh.position.set(side * 0.016, 0, 0);
  backingMesh.castShadow = true;
  group.add(backingMesh);

  group.position.set(side * 0.222, Y_CENTER, Z_CENTER);
  group.rotation.set(0.02, -side * 0.20, side * 0.04);

  return group;
}

/**
 * 1C. Rear Shoulder Shell (Dorsal Protective Shroud)
 */
function createRearShoulderShell(
  side: -1 | 1,
  materials: RobotMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = side === -1 ? 'LeftRearShoulderShell' : 'RightRearShoulderShell';

  const rearShape = new THREE.Shape();
  rearShape.moveTo(-0.022, 0.036);
  rearShape.lineTo(0.018, 0.028);
  rearShape.lineTo(0.022, -0.024);
  rearShape.lineTo(-0.018, -0.034);
  rearShape.closePath();

  const rearGeo = new THREE.ExtrudeGeometry(rearShape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.0020,
    bevelSize: 0.0016,
    bevelSegments: 2,
  });
  rearGeo.center();

  const mesh = new THREE.Mesh(rearGeo, materials.armorDoubleSide);
  mesh.name = side === -1 ? 'LeftRearShoulderArmor' : 'RightRearShoulderArmor';
  mesh.position.set(side * 0.216, Y_CENTER + 0.014, Z_CENTER - 0.044);
  mesh.rotation.y = side * 0.28;
  mesh.rotation.x = -0.12;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  return group;
}

/**
 * 1D. Lower Shoulder Shell (White Ceramic Chassis Cradle)
 */
function createLowerShoulderBracket(
  side: -1 | 1,
  materials: RobotMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = side === -1 ? 'LeftLowerShoulderShell' : 'RightLowerShoulderShell';

  // Sculpted White Ceramic Lower Cradle Shell
  const cradleShape = new THREE.Shape();
  cradleShape.moveTo(-0.018, 0.010);
  cradleShape.lineTo(0.020, 0.010);
  cradleShape.lineTo(0.016, -0.012);
  cradleShape.lineTo(-0.014, -0.016);
  cradleShape.closePath();

  const cradleGeo = new THREE.ExtrudeGeometry(cradleShape, {
    depth: 0.030,
    bevelEnabled: true,
    bevelThickness: 0.0018,
    bevelSize: 0.0014,
    bevelSegments: 2,
  });
  cradleGeo.center();

  const cradle = new THREE.Mesh(cradleGeo, materials.joint);
  cradle.name = side === -1 ? 'LeftLowerShoulderCradle' : 'RightLowerShoulderCradle';
  cradle.position.set(side * 0.218, Y_CENTER - 0.040, Z_CENTER);
  cradle.rotation.y = side * 0.15;
  cradle.castShadow = true;
  cradle.receiveShadow = true;
  group.add(cradle);

  // Dark Titanium Inner Structural Bracket inside cradle
  const bracketGeo = new THREE.BoxGeometry(0.018, 0.012, 0.028);
  const bracket = new THREE.Mesh(bracketGeo, materials.joint);
  bracket.position.set(side * 0.216, Y_CENTER - 0.036, Z_CENTER);
  bracket.castShadow = true;
  group.add(bracket);

  return group;
}

/**
 * 2. Dark Titanium Mounting Bulkhead (mountingFrame).
 * Sits inside the inboard socket at X = ±0.198 with 12 radial socket cap screws.
 */
function createMountingBulkhead(
  side: -1 | 1,
  materials: RobotMaterialPalette
): THREE.Mesh {
  const plateRadius = 0.0440;
  const innerR = 0.0380;

  const shape = new THREE.Shape();
  shape.absarc(0, 0, plateRadius, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.0035,
    bevelEnabled: true,
    bevelThickness: 0.0010,
    bevelSize: 0.0008,
    bevelSegments: 2,
    curveSegments: 32,
  });
  geo.center();

  const mesh = new THREE.Mesh(geo, materials.joint);
  mesh.name = side === -1 ? 'LeftMountingFrame' : 'RightMountingFrame';
  mesh.rotation.y = Math.PI / 2;
  mesh.position.set(side * 0.198, Y_CENTER, Z_CENTER);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  for (let b = 0; b < 12; b++) {
    const angle = (b / 12) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0013, 0.0013, 0.0035, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.metallic);
    bolt.position.set(
      side * 0.0020,
      Math.sin(angle) * 0.0410,
      Math.cos(angle) * 0.0410
    );
    mesh.add(bolt);
  }

  return mesh;
}

/**
 * Creates the complete Chest Shoulder Extension Assembly.
 */
export function createChestShoulderExtension(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ShoulderExtensionNodes {
  const group = new THREE.Group();
  group.name = side === -1 ? 'LeftShoulderModule' : 'RightShoulderModule';

  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================================================
  // SYSTEM A: WHITE STRUCTURAL ARMOR (Stationary Load-Bearing Protective Cradle)
  // ==========================================================================
  const whiteStructuralAssembly = new THREE.Group();
  whiteStructuralAssembly.name =
    side === -1 ? 'LeftWhiteStructuralAssembly' : 'RightWhiteStructuralAssembly';
  group.add(whiteStructuralAssembly);

  // 1. Inboard White Collar (chestTransitionPanel) — stops at X = ±0.205
  const transitionGeo = createChestTransitionGeometry(side);
  const chestTransitionPanel = new THREE.Mesh(transitionGeo, materials.armorDoubleSide);
  chestTransitionPanel.name =
    side === -1 ? 'LeftChestTransitionPanel' : 'RightChestTransitionPanel';
  chestTransitionPanel.castShadow = true;
  chestTransitionPanel.receiveShadow = true;
  whiteStructuralAssembly.add(chestTransitionPanel);

  // 2. Dark Titanium Mounting Bulkhead at socket interface
  const mountingFrame = createMountingBulkhead(side, materials);
  whiteStructuralAssembly.add(mountingFrame);
  const recessHousing = mountingFrame;

  // 3. Arched White Shoulder Pauldron Cowl (Mantle arching over joint)
  const upperShoulderShell = createUpperShoulderShell(side, materials);
  whiteStructuralAssembly.add(upperShoulderShell);

  const innerCavityWalls = new THREE.Mesh(); // stub for interface compatibility

  // 4. Multi-piece Shoulder Armor Panels (Pieces B, C, E)
  const outerShoulderShell = createOuterShoulderShell(side, materials);
  whiteStructuralAssembly.add(outerShoulderShell);

  const frontStructuralPanel = new THREE.Group();
  frontStructuralPanel.name = side === -1 ? 'LeftFrontShoulderPanel' : 'RightFrontShoulderPanel';
  whiteStructuralAssembly.add(frontStructuralPanel);

  const rearStructuralPanel = createRearShoulderShell(side, materials);
  whiteStructuralAssembly.add(rearStructuralPanel);

  const lowerShoulderShell = createLowerShoulderBracket(side, materials);
  whiteStructuralAssembly.add(lowerShoulderShell);

  const extensionCowl = upperShoulderShell;

  // ==========================================================================
  // SYSTEM B: DARK MECHANICAL SHOULDER JOINT & CIRCULAR BEARING MODULE
  // Centered at X = ±0.245, Y = 0.052, Z = 0.015
  // ==========================================================================
  const multiAxisJoint = createMultiAxisShoulderJoint(side, materials, ledMeshes);
  group.add(multiAxisJoint.foundation);

  const rearTrussCage = new THREE.Group();
  rearTrussCage.name = side === -1 ? 'LeftShoulderRearTruss' : 'RightShoulderRearTruss';
  group.add(rearTrussCage);

  const undersideChannel = new THREE.Group();
  undersideChannel.name =
    side === -1 ? 'LeftShoulderUndersideChannel' : 'RightShoulderUndersideChannel';
  group.add(undersideChannel);

  return {
    group,
    whiteStructuralAssembly,
    chestTransitionPanel,
    mountingFrame,
    upperShoulderShell,
    lowerShoulderShell,
    frontStructuralPanel,
    rearStructuralPanel,
    innerCavityWalls,
    outerShoulderShell,
    recessHousing,
    extensionCowl,
    shoulderMountPivot: multiAxisJoint.shoulderJoint,
    baseFlange: multiAxisJoint.stationaryCollar,
    accentRing: multiAxisJoint.accentRing,
    driveHub: multiAxisJoint.driveHub,
    faceFlange: multiAxisJoint.armMountingFlange,
    rearTrussCage,
    undersideChannel,
    ledMeshes,
    multiAxisJoint,
    primaryAxisPivot: multiAxisJoint.primaryAxisPivot,
    secondaryAxisCarrier: multiAxisJoint.secondaryAxisCarrier,
    secondaryAxisPivot: multiAxisJoint.secondaryAxisPivot,
    armMount: multiAxisJoint.armMount,
    armMountingFlange: multiAxisJoint.armMountingFlange,
  };
}
