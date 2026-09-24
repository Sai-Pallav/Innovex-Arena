/**
 * ============================================================================
 * PART 4 — MULTI-AXIS SHOULDER JOINT & CIRCULAR BEARING MECHANISM (IMAGE 2 MASTER)
 * ============================================================================
 *
 * Exact mechanical reconstruction adhering strictly to IMAGE 2 and Corrections 01, 02, 04, 20-22:
 * - Substantial circular mechanical module extending outward from chest (D = 106mm, R = 53mm).
 * - Fully exposed stepped dark titanium bearing housing facing laterally outward.
 * - Concentric metallic crossed-roller bearing rings and 16 radial hex socket screws.
 * - Vibrant circular purple emissive LED halo ring nested inside the stepped bearing channel.
 * - Heavy-duty central axle hub with deep hollow bearing race and 12-bolt arm mounting flange.
 * - Black structural frame / yoke linking joint into the upper arm core.
 *
 * Visual Hierarchy:
 *   WHITE SHOULDER COWL (Overhead mantle)
 *         ↓
 *   DELIBERATE BLACK STRUCTURAL GAP (5mm clearance)
 *         ↓
 *   METALLIC CROSSED-ROLLER BEARING RINGS & PURPLE LED HALO
 *         ↓
 *   STEPPED DARK TITANIUM MECHANICAL CORE & AXLE
 *
 * Parametrically mirrored for Left (side = -1) and Right (side = 1).
 * ============================================================================
 */

import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

export interface MultiAxisShoulderJointNodes {
  foundation: THREE.Group;
  shoulderJoint: THREE.Group;
  primaryAxisPivot: THREE.Group;
  secondaryAxisCarrier: THREE.Group;
  secondaryAxisPivot: THREE.Group;
  armMount: THREE.Group;
  armMountingFlange: THREE.Mesh;
  bearingHousing: THREE.Mesh;
  accentRing: THREE.Mesh;
  driveHub: THREE.Mesh;
  stationaryCollar: THREE.Mesh;
  upperLink: THREE.Group;
  lowerLink: THREE.Group;
  ledMeshes: THREE.Mesh[];
  blackPlateBetweenShellAndRotational?: THREE.Mesh | THREE.Group;
}

/**
 * Creates the stationary mounting collar and inboard anchor clevises.
 * Bridges the chest extension module (X ≈ ±0.19m) to the active shoulder joint (X ≈ ±0.24m).
 */
function createStationaryMountingCollar(
  side: -1 | 1,
  materials: RobotMaterialPalette
): {
  collarMesh: THREE.Mesh;
  anchorGroup: THREE.Group;
  upperAnchorPos: THREE.Vector3;
  lowerAnchorPos: THREE.Vector3;
} {
  const anchorGroup = new THREE.Group();
  anchorGroup.name = side === -1 ? 'StationaryAnchorGroup_L' : 'StationaryAnchorGroup_R';

  const collarR = 0.0460;
  const collarLen = 0.0200;

  // 1. Heavy-duty dark titanium mounting collar sleeve seated in chest socket
  const collarGeo = new THREE.CylinderGeometry(collarR * 0.96, collarR, collarLen, 40);
  collarGeo.rotateZ(Math.PI / 2);
  const collarMesh = new THREE.Mesh(collarGeo, materials.joint);
  collarMesh.name = side === -1 ? 'StationaryShoulderCollar_L' : 'StationaryShoulderCollar_R';
  collarMesh.position.set(-side * 0.024, 0, 0);
  collarMesh.castShadow = true;
  collarMesh.receiveShadow = true;
  anchorGroup.add(collarMesh);

  // 2. Stepped inner metallic bearing seat ring
  const seatGeo = new THREE.CylinderGeometry(collarR * 0.91, collarR * 0.91, 0.007, 36);
  seatGeo.rotateZ(Math.PI / 2);
  const seatMesh = new THREE.Mesh(seatGeo, materials.metallic);
  seatMesh.position.set(-side * 0.016, 0, 0);
  anchorGroup.add(seatMesh);

  // 3. Perimeter socket cap screws (12 bolt pattern)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0014, 0.0014, 0.005, 6);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      -side * 0.016,
      Math.sin(angle) * (collarR * 0.88),
      Math.cos(angle) * (collarR * 0.88)
    );
    anchorGroup.add(bolt);
  }

  // 4. Upper Link Anchor Clevis Lug (Top-Rear quadrant)
  const upperAnchorPos = new THREE.Vector3(-side * 0.014, 0.032, -0.020);
  const clevisUpperGeo = new THREE.BoxGeometry(0.012, 0.014, 0.012);
  const clevisUpper = new THREE.Mesh(clevisUpperGeo, materials.joint);
  clevisUpper.position.copy(upperAnchorPos);
  clevisUpper.castShadow = true;
  anchorGroup.add(clevisUpper);

  const pinUpperGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.015, 16);
  pinUpperGeo.rotateZ(Math.PI / 2);
  const pinUpper = new THREE.Mesh(pinUpperGeo, materials.metallic);
  pinUpper.position.copy(clevisUpper.position);
  anchorGroup.add(pinUpper);

  // 5. Lower Link Anchor Clevis Lug (Bottom-Rear quadrant)
  const lowerAnchorPos = new THREE.Vector3(-side * 0.014, -0.030, -0.020);
  const clevisLowerGeo = new THREE.BoxGeometry(0.012, 0.014, 0.012);
  const clevisLower = new THREE.Mesh(clevisLowerGeo, materials.joint);
  clevisLower.position.copy(lowerAnchorPos);
  clevisLower.castShadow = true;
  anchorGroup.add(clevisLower);

  const pinLowerGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.015, 16);
  pinLowerGeo.rotateZ(Math.PI / 2);
  const pinLower = new THREE.Mesh(pinLowerGeo, materials.metallic);
  pinLower.position.copy(clevisLower.position);
  anchorGroup.add(pinLower);

  return {
    collarMesh,
    anchorGroup,
    upperAnchorPos,
    lowerAnchorPos,
  };
}

/**
 * Creates the compact stepped dark titanium bearing housing & concentric purple emissive ring.
 * Scaled to precision engineered proportion (R = 46.5mm, Diameter = 93mm).
 */
function createBearingHousing(
  side: -1 | 1,
  materials: RobotMaterialPalette,
  ledMeshes: THREE.Mesh[]
): {
  housingGroup: THREE.Group;
  housingMesh: THREE.Mesh;
  accentRing: THREE.Mesh;
  blackPlate: THREE.Mesh;
} {
  const housingGroup = new THREE.Group();
  housingGroup.name = side === -1 ? 'BearingHousingGroup_L' : 'BearingHousingGroup_R';

  // Precision compact circular bearing module (R = 46.5mm, Diameter = 93mm)
  const outerRadius = 0.0465;
  const innerBoreRadius = 0.0300;

  // 1. BLACK PLATE BETWEEN WHITE SHELL AND ROTATIONAL (Stepped Annular Spacer Plate)
  // Positioned directly bridging from underneath the white pauldron edge (side * 0.010 - 0.016)
  // to the purple rotational bearing ring (side * 0.0195)
  const plateShape = new THREE.Shape();
  const plateOuterR = 0.0488; // Matches inner curvature of the white pauldron hood
  plateShape.absarc(0, 0, plateOuterR, 0, Math.PI * 2, false);
  const plateHole = new THREE.Path();
  plateHole.absarc(0, 0, innerBoreRadius, 0, Math.PI * 2, true);
  plateShape.holes.push(plateHole);

  const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.0016,
    bevelSize: 0.0014,
    bevelSegments: 2,
    curveSegments: 44,
  });
  plateGeo.center();
  const blackPlate = new THREE.Mesh(plateGeo, materials.joint);
  blackPlate.name = side === -1 ? 'LeftShoulderBlackPlateBetweenShellAndRotational' : 'RightShoulderBlackPlateBetweenShellAndRotational';
  blackPlate.rotation.y = Math.PI / 2;
  blackPlate.position.set(side * 0.011, 0, 0);
  blackPlate.castShadow = true;
  blackPlate.receiveShadow = true;
  housingGroup.add(blackPlate);

  // Stepped forward bevel collar on the black plate
  const plateStepShape = new THREE.Shape();
  plateStepShape.absarc(0, 0, plateOuterR * 0.97, 0, Math.PI * 2, false);
  const plateStepHole = new THREE.Path();
  plateStepHole.absarc(0, 0, innerBoreRadius, 0, Math.PI * 2, true);
  plateStepShape.holes.push(plateStepHole);

  const plateStepGeo = new THREE.ExtrudeGeometry(plateStepShape, {
    depth: 0.004,
    bevelEnabled: true,
    bevelThickness: 0.0010,
    bevelSize: 0.0008,
    bevelSegments: 2,
    curveSegments: 44,
  });
  plateStepGeo.center();
  const plateStep = new THREE.Mesh(plateStepGeo, materials.joint);
  plateStep.rotation.y = Math.PI / 2;
  plateStep.position.set(side * 0.015, 0, 0);
  plateStep.castShadow = true;
  housingGroup.add(plateStep);

  // 1B. Inboard stepped annular collar sleeve
  const baseShape = new THREE.Shape();
  baseShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  const baseHole = new THREE.Path();
  baseHole.absarc(0, 0, innerBoreRadius, 0, Math.PI * 2, true);
  baseShape.holes.push(baseHole);

  const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelThickness: 0.0012,
    bevelSize: 0.0010,
    bevelSegments: 2,
    curveSegments: 44,
  });
  baseGeo.center();
  const baseCollar = new THREE.Mesh(baseGeo, materials.joint);
  baseCollar.rotation.y = Math.PI / 2;
  baseCollar.position.set(-side * 0.003, 0, 0);
  baseCollar.castShadow = true;
  baseCollar.receiveShadow = true;
  housingGroup.add(baseCollar);

  // 2. Outboard stepped retention collar with crisp chamfer
  const fwdShape = new THREE.Shape();
  fwdShape.absarc(0, 0, outerRadius * 0.94, 0, Math.PI * 2, false);
  const fwdHole = new THREE.Path();
  fwdHole.absarc(0, 0, innerBoreRadius, 0, Math.PI * 2, true);
  fwdShape.holes.push(fwdHole);

  const fwdGeo = new THREE.ExtrudeGeometry(fwdShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.0015,
    bevelSize: 0.0012,
    bevelSegments: 2,
    curveSegments: 44,
  });
  fwdGeo.center();
  const housingMesh = new THREE.Mesh(fwdGeo, materials.joint);
  housingMesh.name = side === -1 ? 'BearingHousingMesh_L' : 'BearingHousingMesh_R';
  housingMesh.rotation.y = Math.PI / 2;
  housingMesh.position.set(side * 0.012, 0, 0);
  housingMesh.castShadow = true;
  housingMesh.receiveShadow = true;
  housingGroup.add(housingMesh);

  // 3. Polished metallic crossed-roller bearing race ring (outer rim)
  const lipGeo = new THREE.TorusGeometry(outerRadius * 0.95, 0.0018, 10, 44);
  lipGeo.rotateY(Math.PI / 2);
  const lip = new THREE.Mesh(lipGeo, materials.metallic);
  lip.position.set(side * 0.018, 0, 0);
  housingGroup.add(lip);

  // Intermediate polished steel raceway ring
  const raceGeo = new THREE.TorusGeometry(outerRadius * 0.82, 0.0015, 8, 40);
  raceGeo.rotateY(Math.PI / 2);
  const race = new THREE.Mesh(raceGeo, materials.metallic);
  race.position.set(side * 0.019, 0, 0);
  housingGroup.add(race);

  // 4. 16 Precision Radial Hex Socket Screws around the outer housing step
  const boltCount = 16;
  const boltPitch = outerRadius * 0.88;
  for (let s = 0; s < boltCount; s++) {
    const angle = (s / boltCount) * Math.PI * 2;
    const screwGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.004, 6);
    screwGeo.rotateZ(Math.PI / 2);
    const screw = new THREE.Mesh(screwGeo, materials.metallic);
    screw.position.set(
      side * 0.019,
      Math.sin(angle) * boltPitch,
      Math.cos(angle) * boltPitch
    );
    housingGroup.add(screw);
  }

  // 5. Concentric Vibrant Purple Emissive Energy Ring (Recessed inside stepped bearing channel)
  const ringRadius = 0.0385;
  const accentRingGeo = new THREE.TorusGeometry(ringRadius, 0.0030, 14, 44);
  accentRingGeo.rotateY(Math.PI / 2);
  const accentRing = new THREE.Mesh(accentRingGeo, materials.purpleEmissive);
  accentRing.name = side === -1 ? 'ShoulderEnergyRing_L' : 'ShoulderEnergyRing_R';
  accentRing.position.set(side * 0.0195, 0, 0);
  housingGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // Outer Bloom Ring for high-intensity neon bloom glow
  const bloomGeo = new THREE.TorusGeometry(ringRadius, 0.0065, 8, 44);
  bloomGeo.rotateY(Math.PI / 2);
  const bloom = new THREE.Mesh(bloomGeo, materials.purpleBloom);
  bloom.position.copy(accentRing.position);
  housingGroup.add(bloom);

  // Thin White Ceramic Pinstripe Ring (directly adjacent to purple ring as shown in reference image)
  const whitePinstripeGeo = new THREE.TorusGeometry(ringRadius + 0.0034, 0.0009, 8, 44);
  whitePinstripeGeo.rotateY(Math.PI / 2);
  const whitePinstripe = new THREE.Mesh(whitePinstripeGeo, materials.armor);
  whitePinstripe.position.set(side * 0.0192, 0, 0);
  housingGroup.add(whitePinstripe);

  // 6. Deep dark recessed backing trough for the purple ring
  const troughGeo = new THREE.TorusGeometry(ringRadius, 0.0040, 8, 44);
  troughGeo.rotateY(Math.PI / 2);
  const trough = new THREE.Mesh(troughGeo, materials.joint);
  trough.position.set(side * 0.0175, 0, 0);
  housingGroup.add(trough);

  return {
    housingGroup,
    housingMesh,
    accentRing,
    blackPlate,
  };
}

/**
 * Creates the central rotating hub & drive splines (Callout 3).
 * Includes the lateral pivot bracket with purple accent band matching the reference image.
 */
function createPrimaryRotationHub(
  side: -1 | 1,
  materials: RobotMaterialPalette,
  ledMeshes: THREE.Mesh[]
): { hubGroup: THREE.Group; driveHub: THREE.Mesh } {
  const hubGroup = new THREE.Group();
  hubGroup.name = side === -1 ? 'PrimaryHubGroup_L' : 'PrimaryHubGroup_R';

  const hubRadius = 0.0265;
  const hubDepth = 0.014;

  // 1. Central Rotating Journal Core
  const hubGeo = new THREE.CylinderGeometry(hubRadius, hubRadius * 0.96, hubDepth, 36);
  hubGeo.rotateZ(Math.PI / 2);
  const driveHub = new THREE.Mesh(hubGeo, materials.joint);
  driveHub.name = side === -1 ? 'PrimaryDriveHub_L' : 'PrimaryDriveHub_R';
  driveHub.position.set(side * 0.020, 0, 0);
  driveHub.castShadow = true;
  driveHub.receiveShadow = true;
  hubGroup.add(driveHub);

  // 2. Polished Metallic Inner Bevel Ring
  const bevelRingGeo = new THREE.TorusGeometry(hubRadius * 0.94, 0.0013, 8, 32);
  bevelRingGeo.rotateY(Math.PI / 2);
  const bevelRing = new THREE.Mesh(bevelRingGeo, materials.metallic);
  bevelRing.position.set(side * (0.020 + hubDepth * 0.48), 0, 0);
  hubGroup.add(bevelRing);

  // 3. 16 Axial Rotary Drive Splines around the hub circumference
  const splineCount = 16;
  for (let i = 0; i < splineCount; i++) {
    const angle = (i / splineCount) * Math.PI * 2;
    const splineGeo = new THREE.BoxGeometry(hubDepth * 0.85, 0.0018, 0.0028);
    const spline = new THREE.Mesh(splineGeo, materials.joint);
    spline.position.set(
      side * 0.020,
      Math.sin(angle) * (hubRadius * 0.98),
      Math.cos(angle) * (hubRadius * 0.98)
    );
    spline.rotation.x = angle;
    hubGroup.add(spline);
  }

  // 4. Central axle bore rim
  const innerBoreGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.018, 28);
  innerBoreGeo.rotateZ(Math.PI / 2);
  const innerBore = new THREE.Mesh(innerBoreGeo, materials.metallic);
  innerBore.position.set(side * 0.015, 0, 0);
  hubGroup.add(innerBore);

  // 5. Lateral Pivot Bracket & Purple Accent Ring (as seen on the outer hub face in reference image)
  const pivotBlockGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.016, 18);
  const pivotBlock = new THREE.Mesh(pivotBlockGeo, materials.joint);
  pivotBlock.position.set(side * 0.026, 0.002, 0.010);
  pivotBlock.castShadow = true;
  hubGroup.add(pivotBlock);

  const pivotRingGeo = new THREE.TorusGeometry(0.0052, 0.0011, 8, 20);
  const pivotRing = new THREE.Mesh(pivotRingGeo, materials.purpleEmissive);
  pivotRing.position.copy(pivotBlock.position);
  hubGroup.add(pivotRing);
  ledMeshes.push(pivotRing);

  return {
    hubGroup,
    driveHub,
  };
}

/**
 * Creates the secondary axis gimbal carrier ring (Callout 4).
 */
function createSecondaryAxisCarrier(
  side: -1 | 1,
  materials: RobotMaterialPalette
): {
  carrierGroup: THREE.Group;
  upperTargetPos: THREE.Vector3;
  lowerTargetPos: THREE.Vector3;
} {
  const carrierGroup = new THREE.Group();
  carrierGroup.name = side === -1 ? 'SecondaryCarrierGroup_L' : 'SecondaryCarrierGroup_R';

  const carrierRadius = 0.0360;
  const carrierLength = 0.014;

  // Main Annular Gimbal Ring
  const shape = new THREE.Shape();
  shape.absarc(0, 0, carrierRadius, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, carrierRadius * 0.84, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const ringGeo = new THREE.ExtrudeGeometry(shape, {
    depth: carrierLength,
    bevelEnabled: true,
    bevelThickness: 0.0012,
    bevelSize: 0.0010,
    bevelSegments: 2,
    curveSegments: 36,
  });
  ringGeo.center();
  const ringMesh = new THREE.Mesh(ringGeo, materials.joint);
  ringMesh.rotation.y = Math.PI / 2;
  ringMesh.position.set(side * 0.018, 0, 0);
  ringMesh.castShadow = true;
  ringMesh.receiveShadow = true;
  carrierGroup.add(ringMesh);

  // Outer polished metallic gimbal retaining rim
  const rimGeo = new THREE.TorusGeometry(carrierRadius * 0.98, 0.0012, 6, 36);
  rimGeo.rotateY(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, materials.metallic);
  rim.position.set(side * (0.018 + carrierLength * 0.5), 0, 0);
  carrierGroup.add(rim);

  // Upper Link Receiving Clevis Lug on moving carrier
  const upperTargetPos = new THREE.Vector3(side * 0.018, 0.026, -0.016);
  const clevisUpperGeo = new THREE.BoxGeometry(0.010, 0.012, 0.010);
  const clevisUpper = new THREE.Mesh(clevisUpperGeo, materials.joint);
  clevisUpper.position.copy(upperTargetPos);
  carrierGroup.add(clevisUpper);

  // Lower Link Receiving Clevis Lug on moving carrier
  const lowerTargetPos = new THREE.Vector3(side * 0.018, -0.024, -0.016);
  const clevisLowerGeo = new THREE.BoxGeometry(0.010, 0.012, 0.010);
  const clevisLower = new THREE.Mesh(clevisLowerGeo, materials.joint);
  clevisLower.position.copy(lowerTargetPos);
  carrierGroup.add(clevisLower);

  return {
    carrierGroup,
    upperTargetPos,
    lowerTargetPos,
  };
}

/**
 * Creates precision machined structural links connecting stationary collar to gimbal carrier.
 */
function createMachinedStructuralLink(
  length: number,
  headWidth: number,
  rodRadius: number,
  materials: RobotMaterialPalette,
  linkMaterial: THREE.MeshPhysicalMaterial
): THREE.Group {
  const group = new THREE.Group();

  // Central connecting rod
  const rodGeo = new THREE.CylinderGeometry(rodRadius, rodRadius, Math.max(0.004, length - headWidth), 16);
  const rod = new THREE.Mesh(rodGeo, linkMaterial);
  rod.castShadow = true;
  group.add(rod);

  // End eye lugs
  for (const endY of [-length * 0.45, length * 0.45]) {
    const eyeGeo = new THREE.CylinderGeometry(headWidth * 0.45, headWidth * 0.45, 0.007, 16);
    eyeGeo.rotateZ(Math.PI / 2);
    const eye = new THREE.Mesh(eyeGeo, materials.joint);
    eye.position.set(0, endY, 0);
    group.add(eye);

    const pinGeo = new THREE.CylinderGeometry(headWidth * 0.22, headWidth * 0.22, 0.009, 12);
    pinGeo.rotateZ(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, materials.metallic);
    pin.position.set(0, endY, 0);
    group.add(pin);
  }

  return group;
}

function positionLinkBetweenPoints(
  link: THREE.Group,
  start: THREE.Vector3,
  end: THREE.Vector3,
  side: -1 | 1
): void {
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  link.position.copy(midpoint);

  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const up = new THREE.Vector3(side, 0, 0);
  const matrix = new THREE.Matrix4();
  const right = new THREE.Vector3().crossVectors(dir, up).normalize();
  const recomputedUp = new THREE.Vector3().crossVectors(right, dir).normalize();
  matrix.makeBasis(dir, right, recomputedUp);
  link.quaternion.setFromRotationMatrix(matrix);
}

/**
 * Creates the arm mounting flange interfacing into UpperArm.ts.
 * Centered directly at the shoulder joint's kinematic center (0, 0, 0),
 * extending downward (-Y) as a heavy-duty load-bearing trunnion mount.
 */
function createArmMountingFlange(
  side: -1 | 1,
  materials: RobotMaterialPalette
): {
  flangeGroup: THREE.Group;
  flangeMesh: THREE.Mesh;
} {
  const flangeGroup = new THREE.Group();
  flangeGroup.name = side === -1 ? 'ArmMountingFlangeGroup_L' : 'ArmMountingFlangeGroup_R';

  const flangeRadius = 0.0340;
  const boreRadius = 0.0160;
  const flangeThickness = 0.0075;

  // 1. Central Load-Bearing Gimbal Yoke Hub at (0, 0, 0)
  const yokeHubGeo = new THREE.CylinderGeometry(0.024, 0.026, 0.018, 28);
  const yokeHub = new THREE.Mesh(yokeHubGeo, materials.joint);
  yokeHub.position.set(0, -0.005, 0);
  yokeHub.castShadow = true;
  flangeGroup.add(yokeHub);

  // 2. Downward-facing circular docking flange at Y = -0.014
  const shape = new THREE.Shape();
  shape.absarc(0, 0, flangeRadius, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const flangeGeo = new THREE.ExtrudeGeometry(shape, {
    depth: flangeThickness,
    bevelEnabled: true,
    bevelThickness: 0.0014,
    bevelSize: 0.0012,
    bevelSegments: 2,
    curveSegments: 36,
  });
  flangeGeo.center();

  const flangeMesh = new THREE.Mesh(flangeGeo, materials.joint);
  flangeMesh.name = side === -1 ? 'ArmMountingFlange_L' : 'ArmMountingFlange_R';
  flangeMesh.rotation.x = Math.PI / 2;
  flangeMesh.position.set(0, -0.014, 0);
  flangeMesh.castShadow = true;
  flangeMesh.receiveShadow = true;
  flangeGroup.add(flangeMesh);

  // Polished Metallic Outer Bevel Rim
  const rimGeo = new THREE.TorusGeometry(flangeRadius * 0.98, 0.0012, 8, 36);
  rimGeo.rotateX(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, materials.metallic);
  rim.position.set(0, -0.014 - flangeThickness * 0.45, 0);
  flangeGroup.add(rim);

  // 12 Precision Hex Socket Head Cap Screws
  const boltCount = 12;
  const boltPitchR = 0.0260;
  for (let b = 0; b < boltCount; b++) {
    const angle = (b / boltCount) * Math.PI * 2;
    const socketGeo = new THREE.CylinderGeometry(0.0014, 0.0014, 0.0028, 12);
    const socket = new THREE.Mesh(socketGeo, materials.metallic);
    socket.position.set(
      Math.sin(angle) * boltPitchR,
      -0.014 - flangeThickness * 0.45,
      Math.cos(angle) * boltPitchR
    );
    flangeGroup.add(socket);

    const headGeo = new THREE.CylinderGeometry(0.0010, 0.0010, 0.0035, 6);
    const boltHead = new THREE.Mesh(headGeo, materials.joint);
    boltHead.position.set(
      Math.sin(angle) * boltPitchR,
      -0.014 - flangeThickness * 0.55,
      Math.cos(angle) * boltPitchR
    );
    flangeGroup.add(boltHead);
  }

  // Deep Hollow Central Bearing Bore extending upward into joint
  const boreLen = 0.024;
  const boreGeo = new THREE.CylinderGeometry(boreRadius * 0.98, boreRadius * 0.94, boreLen, 28, 1, true);
  const boreMesh = new THREE.Mesh(boreGeo, materials.joint);
  boreMesh.position.set(0, -0.005, 0);
  flangeGroup.add(boreMesh);

  // Internal Stepped Bearing Race Ring
  const innerRaceGeo = new THREE.CylinderGeometry(boreRadius * 0.88, boreRadius * 0.88, 0.006, 24);
  const innerRace = new THREE.Mesh(innerRaceGeo, materials.metallic);
  innerRace.position.set(0, -0.008, 0);
  flangeGroup.add(innerRace);

  return {
    flangeGroup,
    flangeMesh,
  };
}

/**
 * Creates the complete Part 4 Multi-Axis Shoulder Joint / Bearing Assembly.
 */
export function createMultiAxisShoulderJoint(
  side: -1 | 1,
  materials: RobotMaterialPalette,
  ledMeshes: THREE.Mesh[]
): MultiAxisShoulderJointNodes {
  const linkMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdde6f5,
    metalness: 0.90,
    roughness: 0.18,
    clearcoat: 0.70,
    clearcoatRoughness: 0.10,
    reflectivity: 0.98,
    name: 'RobotMachinedLinkMaterial',
  });

  // 1. Stationary Shoulder Foundation (Grounds into Part 3 Housing at X = ±0.222, Y = 0.052, Z = 0.015)
  // Shifted inward by 20mm to bring arm mass athletic and close to torso
  const foundation = new THREE.Group();
  foundation.name = side === -1 ? 'LeftShoulderFoundation' : 'RightShoulderFoundation';
  foundation.position.set(side * 0.222, 0.052, 0.015);

  // Stationary Mounting Collar & Anchor Clevises
  const { collarMesh, anchorGroup, upperAnchorPos, lowerAnchorPos } = createStationaryMountingCollar(side, materials);
  foundation.add(anchorGroup);

  // 2. Active Shoulder Joint Origin
  const shoulderJoint = new THREE.Group();
  shoulderJoint.name = side === -1 ? 'LeftShoulderJoint' : 'RightShoulderJoint';
  // Natural forward-lateral orientation: subtle forward angle (~2.8°) to showcase bearing highlight
  shoulderJoint.rotation.set(0.01, -side * 0.05, 0);
  foundation.add(shoulderJoint);

  // 3. Primary Rotation Axis Pivot (Pitch around local X)
  const primaryAxisPivot = new THREE.Group();
  primaryAxisPivot.name = side === -1 ? 'LeftPrimaryAxisPivot' : 'RightPrimaryAxisPivot';
  shoulderJoint.add(primaryAxisPivot);

  // Outer Stepped Bearing Housing & Purple Energy Ring
  const { housingGroup, housingMesh, accentRing, blackPlate } = createBearingHousing(side, materials, ledMeshes);
  primaryAxisPivot.add(housingGroup);

  // Central Rotating Hub
  const { hubGroup, driveHub } = createPrimaryRotationHub(side, materials, ledMeshes);
  primaryAxisPivot.add(hubGroup);

  // 4. Secondary Axis Carrier & Pivot (Yaw/Roll Articulation)
  const secondaryAxisCarrier = new THREE.Group();
  secondaryAxisCarrier.name = side === -1 ? 'LeftSecondaryAxisCarrier' : 'RightSecondaryAxisCarrier';
  primaryAxisPivot.add(secondaryAxisCarrier);

  const { carrierGroup, upperTargetPos, lowerTargetPos } = createSecondaryAxisCarrier(side, materials);
  secondaryAxisCarrier.add(carrierGroup);

  const secondaryAxisPivot = new THREE.Group();
  secondaryAxisPivot.name = side === -1 ? 'LeftSecondaryAxisPivot' : 'RightSecondaryAxisPivot';
  secondaryAxisCarrier.add(secondaryAxisPivot);

  // 5. Dual Precision Machined Structural Links
  const upperSpan = upperAnchorPos.distanceTo(upperTargetPos);
  const upperLink = createMachinedStructuralLink(upperSpan, 0.0140, 0.0060, materials, linkMaterial);
  upperLink.name = side === -1 ? 'LeftShoulderUpperLink' : 'RightShoulderUpperLink';
  positionLinkBetweenPoints(upperLink, upperAnchorPos, upperTargetPos, side);
  secondaryAxisCarrier.add(upperLink);

  const lowerSpan = lowerAnchorPos.distanceTo(lowerTargetPos);
  const lowerLink = createMachinedStructuralLink(lowerSpan, 0.0135, 0.0060, materials, linkMaterial);
  lowerLink.name = side === -1 ? 'LeftShoulderLowerLink' : 'RightShoulderLowerLink';
  positionLinkBetweenPoints(lowerLink, lowerAnchorPos, lowerTargetPos, side);
  secondaryAxisCarrier.add(lowerLink);

  // 6. Arm Mounting Interface Group & Arm Mounting Flange
  const armMount = new THREE.Group();
  armMount.name = side === -1 ? 'LeftArmMount' : 'RightArmMount';
  secondaryAxisPivot.add(armMount);

  const { flangeGroup, flangeMesh: armMountingFlange } = createArmMountingFlange(side, materials);
  armMount.add(flangeGroup);

  return {
    foundation,
    shoulderJoint,
    primaryAxisPivot,
    secondaryAxisCarrier,
    secondaryAxisPivot,
    armMount,
    armMountingFlange,
    bearingHousing: housingMesh,
    accentRing,
    driveHub,
    stationaryCollar: collarMesh,
    upperLink,
    lowerLink,
    ledMeshes,
    blackPlateBetweenShellAndRotational: blackPlate,
  };
}
