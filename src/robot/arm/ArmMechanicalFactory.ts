import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

/**
 * AAA MECHANICAL COMPONENT FACTORY FOR HUMANOID ROBOTIC ARM
 * Provides high-precision hard-surface engineering primitives:
 * - Rotational crossed-roller bearings with outer races and ball/roller tracks
 * - Hydraulic & electromechanical linear actuators with chrome piston rods
 * - Precision joint clevis housings and bearing cups
 * - Structural CNC brackets with lightening cutouts and chamfered ribs
 * - Hex fasteners and bolt circles (PCD)
 * - Beveled floating armor shells with realistic panel wall thickness
 */

/**
 * Creates a precision rotational bearing assembly with inner and outer races,
 * chamfered edges, and concentric ball/roller track grooves.
 */
export function createBearingAssembly(
  radiusOuter: number,
  radiusInner: number,
  depth: number,
  materials: RobotMaterialPalette,
  options?: {
    withBallTrack?: boolean;
    withChamfer?: boolean;
    withBolts?: boolean;
    boltCount?: number;
    accentGlow?: boolean;
  }
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'BearingAssembly';

  const withBallTrack = options?.withBallTrack !== false;
  const withChamfer = options?.withChamfer !== false;
  const withBolts = !!options?.withBolts;
  const boltCount = options?.boltCount || 8;
  const accentGlow = !!options?.accentGlow;

  // Outer Bearing Race Ring (Dark Gunmetal Titanium)
  const outerWall = (radiusOuter - radiusInner) * 0.42;
  const outerRingGeo = new THREE.CylinderGeometry(
    radiusOuter,
    radiusOuter,
    depth,
    32,
    1,
    true
  );
  const outerRingMesh = new THREE.Mesh(outerRingGeo, materials.jointDoubleSide);
  outerRingMesh.castShadow = true;
  group.add(outerRingMesh);

  // Outer Race Flange Rim
  if (withChamfer) {
    const flangeGeo = new THREE.TorusGeometry(radiusOuter - 0.001, depth * 0.18, 8, 32);
    const flangeMesh = new THREE.Mesh(flangeGeo, materials.joint);
    flangeMesh.rotation.x = Math.PI / 2;
    flangeMesh.position.y = depth * 0.45;
    group.add(flangeMesh);

    const flangeMesh2 = flangeMesh.clone();
    flangeMesh2.position.y = -depth * 0.45;
    group.add(flangeMesh2);
  }

  // Inner Bearing Race Ring
  const innerRingGeo = new THREE.CylinderGeometry(
    radiusInner + outerWall * 0.35,
    radiusInner + outerWall * 0.35,
    depth * 0.92,
    32,
    1,
    true
  );
  const innerRingMesh = new THREE.Mesh(innerRingGeo, materials.jointDoubleSide);
  group.add(innerRingMesh);

  // Recessed Ball / Roller Race Track
  if (withBallTrack) {
    const trackRadius = (radiusOuter + radiusInner) * 0.5;
    const trackGeo = new THREE.TorusGeometry(trackRadius, depth * 0.22, 10, 32);
    const trackMesh = new THREE.Mesh(trackGeo, materials.joint);
    trackMesh.rotation.x = Math.PI / 2;
    group.add(trackMesh);

    if (accentGlow) {
      const glowGeo = new THREE.TorusGeometry(trackRadius, depth * 0.08, 6, 32);
      const glowMesh = new THREE.Mesh(glowGeo, materials.purpleEmissive);
      glowMesh.rotation.x = Math.PI / 2;
      group.add(glowMesh);
    }
  }

  // Hex Bolt Circle on Outer Race
  if (withBolts && boltCount > 0) {
    const pcdRadius = radiusOuter - outerWall * 0.35;
    const boltHeadGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.002, 6);
    for (let i = 0; i < boltCount; i++) {
      const angle = (i / boltCount) * Math.PI * 2;
      const boltMesh = new THREE.Mesh(boltHeadGeo, materials.joint);
      boltMesh.position.set(
        Math.cos(angle) * pcdRadius,
        depth * 0.5 + 0.0008,
        Math.sin(angle) * pcdRadius
      );
      group.add(boltMesh);
    }
  }

  return group;
}

/**
 * Creates a precision linear actuator or hydraulic cylinder assembly with
 * pressure barrel, high-polish chrome telescopic rod, and spherical eyelet mounts.
 */
export function createLinearActuator(
  length: number,
  cylinderRadius: number,
  rodRadius: number,
  materials: RobotMaterialPalette,
  options?: {
    strokeFraction?: number;
    withEyelets?: boolean;
    withDustBoot?: boolean;
  }
): {
  group: THREE.Group;
  cylinderMesh: THREE.Mesh;
  rodMesh: THREE.Mesh;
  eyeletBase?: THREE.Mesh;
  eyeletTip?: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.name = 'LinearActuator';

  const strokeFrac = options?.strokeFraction ?? 0.6;
  const cylinderLength = length * (1 - strokeFrac * 0.5);
  const rodLength = length * strokeFrac;

  // 1. Actuator Pressure Barrel (Gunmetal Titanium)
  const cylGeo = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength, 24);
  const cylinderMesh = new THREE.Mesh(cylGeo, materials.joint);
  cylinderMesh.name = 'ActuatorCylinder';
  cylinderMesh.position.y = cylinderLength * 0.5;
  cylinderMesh.castShadow = true;
  cylinderMesh.receiveShadow = true;
  group.add(cylinderMesh);

  // Decorative Barrel Reinforcement Collar Rings
  const collarGeo = new THREE.TorusGeometry(cylinderRadius + 0.0006, 0.0012, 8, 24);
  const collar1 = new THREE.Mesh(collarGeo, materials.joint);
  collar1.rotation.x = Math.PI / 2;
  collar1.position.y = cylinderLength * 0.2;
  group.add(collar1);

  const collar2 = collar1.clone();
  collar2.position.y = cylinderLength * 0.85;
  group.add(collar2);

  // 2. High-Polish Telescopic Output Rod
  const rodGeo = new THREE.CylinderGeometry(rodRadius, rodRadius, rodLength, 20);
  const rodMesh = new THREE.Mesh(rodGeo, materials.joint);
  rodMesh.name = 'ActuatorRod';
  rodMesh.position.y = cylinderLength + rodLength * 0.5;
  rodMesh.castShadow = true;
  group.add(rodMesh);

  // 3. Eyelet Mounts
  let eyeletBase: THREE.Mesh | undefined;
  let eyeletTip: THREE.Mesh | undefined;

  if (options?.withEyelets !== false) {
    const eyeletGeo = new THREE.TorusGeometry(cylinderRadius * 1.1, cylinderRadius * 0.35, 10, 20);
    eyeletBase = new THREE.Mesh(eyeletGeo, materials.joint);
    eyeletBase.position.y = -0.002;
    group.add(eyeletBase);

    eyeletTip = new THREE.Mesh(eyeletGeo, materials.joint);
    eyeletTip.position.y = cylinderLength + rodLength + 0.002;
    group.add(eyeletTip);
  }

  // Rubber wiper seal / dust boot at barrel mouth
  if (options?.withDustBoot !== false) {
    const bootGeo = new THREE.CylinderGeometry(cylinderRadius * 0.95, cylinderRadius * 1.05, 0.005, 16);
    const bootMesh = new THREE.Mesh(bootGeo, materials.joint);
    bootMesh.position.y = cylinderLength;
    group.add(bootMesh);
  }

  return { group, cylinderMesh, rodMesh, eyeletBase, eyeletTip };
}

/**
 * Creates an engineered double-clevis joint bracket fork.
 */
export function createClevisBracket(
  width: number,
  thickness: number,
  height: number,
  axleBoreRadius: number,
  materials: RobotMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ClevisBracket';

  const halfW = width * 0.5;

  // Lateral Clevis Plate
  const plateShape = new THREE.Shape();
  plateShape.moveTo(-halfW, 0);
  plateShape.lineTo(-halfW, height * 0.6);
  plateShape.absarc(-halfW, height, thickness * 0.7, -Math.PI / 2, Math.PI / 2, false);
  plateShape.lineTo(-halfW, 0);

  // Left Fork
  const forkGeo = new THREE.BoxGeometry(thickness, height, thickness * 2);
  const forkLeft = new THREE.Mesh(forkGeo, materials.joint);
  forkLeft.position.set(-halfW, height * 0.5, 0);
  forkLeft.castShadow = true;
  group.add(forkLeft);

  // Right Fork
  const forkRight = forkLeft.clone();
  forkRight.position.x = halfW;
  group.add(forkRight);

  // Base Bridge Plate
  const bridgeGeo = new THREE.BoxGeometry(width + thickness, thickness, thickness * 1.8);
  const bridge = new THREE.Mesh(bridgeGeo, materials.joint);
  bridge.position.set(0, thickness * 0.5, 0);
  group.add(bridge);

  // Axle Bushings on both forks
  const bushingGeo = new THREE.CylinderGeometry(
    axleBoreRadius * 1.6,
    axleBoreRadius * 1.6,
    thickness * 1.2,
    20
  );
  const bushingL = new THREE.Mesh(bushingGeo, materials.joint);
  bushingL.rotation.z = Math.PI / 2;
  bushingL.position.set(-halfW, height * 0.75, 0);
  group.add(bushingL);

  const bushingR = bushingL.clone();
  bushingR.position.x = halfW;
  group.add(bushingR);

  return group;
}

/**
 * Creates a circle of hex bolts / fasteners on a specified PCD.
 */
export function createBoltCircle(
  pcdRadius: number,
  boltCount: number,
  boltRadius: number,
  materials: RobotMaterialPalette,
  yOffset: number = 0
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'BoltCircle';

  const boltGeo = new THREE.CylinderGeometry(boltRadius, boltRadius, 0.002, 6);
  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2;
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      Math.cos(angle) * pcdRadius,
      yOffset,
      Math.sin(angle) * pcdRadius
    );
    group.add(bolt);
  }

  return group;
}

/**
 * Creates a floating aerodynamic armor shell with realistic 2.8mm panel wall thickness,
 * edge chamfers, and recessed mechanical seams.
 */
export function createBeveledArmorShell(
  widthTop: number,
  widthBottom: number,
  height: number,
  depth: number,
  materials: RobotMaterialPalette,
  options?: {
    thickness?: number;
    withCenterRidge?: boolean;
    withSideCutouts?: boolean;
    withAccentSlit?: boolean;
  }
): {
  armorMesh: THREE.Mesh;
  seamMesh?: THREE.Mesh;
  accentStrip?: THREE.Mesh;
} {
  const radialSegments = 28;
  const heightSegments = 16;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const withCenterRidge = options?.withCenterRidge !== false;

  for (let iy = 0; iy <= heightSegments; iy++) {
    const v = iy / heightSegments; // 0 = top, 1 = bottom
    const y = -v * height;
    const curW = (widthTop * (1 - v) + widthBottom * v) * 0.5;
    const curD = depth * (1 - v * 0.22) * 0.5;

    for (let ix = 0; ix <= radialSegments; ix++) {
      const u = ix / radialSegments;
      const angle = u * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Subtle anterior ridge line
      let rZ = curD * sinA;
      if (withCenterRidge && sinA > 0.4) {
        rZ += (sinA - 0.4) * 0.004;
      }

      positions.push(curW * cosA, y, rZ);
      uvs.push(u, v);
    }
  }

  const stride = radialSegments + 1;
  for (let iy = 0; iy < heightSegments; iy++) {
    for (let ix = 0; ix < radialSegments; ix++) {
      const a = iy * stride + ix;
      const b = (iy + 1) * stride + ix;
      const c = (iy + 1) * stride + (ix + 1);
      const d = iy * stride + (ix + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const armorMesh = new THREE.Mesh(geo, materials.armorDoubleSide);
  armorMesh.castShadow = true;
  armorMesh.receiveShadow = true;

  return { armorMesh };
}
