import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface ShoulderNodes {
  group: THREE.Group;                  // ShoulderPivot root
  jointGroup: THREE.Group;             // ShoulderJoint rotating assembly
  armorGroup: THREE.Group;             // ShoulderArmor assembly
  shoulderArmor: THREE.Mesh;           // White outer protective shell (solid volumetric)
  shoulderCollar?: THREE.Mesh;         // Inner mechanical shoulder collar
  rotationalCore: THREE.Mesh;          // Central rotational disc / core hub
  outerRing: THREE.Mesh;               // Outer black ring framing joint
  innerRing: THREE.Mesh;               // Inner black ring towards torso
  innerStructure: THREE.Group;         // Segmented mechanical stator / gear ring
  upperArmConnector: THREE.Group;      // Articulated black connector / mounting fork
  accentRing: THREE.Mesh;              // Purple emissive accent ring
  torsoMountPlate: THREE.Mesh;         // Shoulder mounting plate
  ledMeshes: THREE.Mesh[];             // Emissive meshes for lighting

  // Mechanical Open / Exploded Hierarchy Nodes:
  gimbalYoke: THREE.Group;             // Arching structural titanium yoke
  cycloidalDrive: THREE.Group;         // Planetary gear drive & roller bearings
  faceplateHub: THREE.Group;           // Precision billet faceplate & fasteners
  damperActuator: THREE.Group;         // Hydraulic damper strut assembly
  damperPiston: THREE.Mesh;            // Telescopic chrome piston rod
  damperCylinder: THREE.Mesh;          // Damper pressure cylinder

  // Backwards compatibility aliases
  rotatingHub: THREE.Mesh;
  ballJoint: THREE.Mesh;
  pauldronCowl: THREE.Mesh;
  socketApertureRim: THREE.Mesh;
}

/**
 * Creates a solid volumetric 3D deltoid pauldron with real physical wall thickness (5.5mm),
 * continuous compound aerodynamic curvature, and an engineered inner mounting edge.
 * Wraps form-fittingly around the upper 70% of the joint with an inward-curving lower lip
 * (tucking inward around the joint) framing the inner collar and bearing assembly.
 */
function createSolidPauldronGeo(side: -1 | 1): THREE.BufferGeometry {
  const radialSegs = 40;
  const heightSegs = 24;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // 5.5mm solid wall thickness
  const thickness = 0.0055;

  // Compute coordinate for given layer (0 = outer, 1 = inner)
  function getVertex(layer: 0 | 1, iy: number, ix: number): THREE.Vector3 {
    const v = iy / heightSegs;
    const u = ix / radialSegs;
    const phi = u * Math.PI * 2;

    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    // Anatomical factor: -1 on medial torso side, +1 on lateral deltoid flank
    const latFactor = sinPhi * side;

    // Y profile from crown (+0.046) down to skirt
    // Medial side arches up (+0.014) to clear torso mount plate;
    // Lateral side drapes down (-0.018) to protect outer deltoid;
    // Anterior & posterior sit at (-0.011 to -0.012).
    let yBottom = -0.011;
    if (latFactor > 0) {
      yBottom -= 0.007 * latFactor; // down to -0.018 on lateral flank
    } else {
      yBottom += 0.025 * Math.abs(latFactor); // up to +0.014 on medial torso side
    }
    // Slight anterior ease for forward reach
    if (cosPhi > 0.25) {
      yBottom += 0.002 * (cosPhi - 0.25);
    }

    const yTop = 0.046;
    // Smooth quadratic ease between crown and bottom rim
    const yBase = yTop - v * (yTop - yBottom);

    // Radial profile:
    // Starts at crown radius ~0.020, swells outward over joint equator to ~0.046,
    // and CRUCIALLY tucks back inward at the lower skirt to ~0.0385 (hugging the 0.037 collar)
    let rOuter: number;
    if (v < 0.55) {
      // Upper swell expanding over crown
      const t = v / 0.55;
      rOuter = 0.022 + (0.0465 - 0.022) * Math.sin(t * Math.PI * 0.5);
    } else {
      // Lower skirt tucking back inward around joint
      const t = (v - 0.55) / 0.45;
      rOuter = 0.0465 - (0.0465 - 0.0385) * Math.sin(t * Math.PI * 0.5);
    }

    // Lateral deltoid muscle flare on outer flank
    if (latFactor > 0) {
      rOuter += 0.0025 * Math.sin(v * Math.PI) * latFactor;
    }

    const rBase = layer === 0 ? rOuter : (rOuter - thickness);

    // Scale axes for sleek athletic deltoid contour
    const scaleX = 1.06;
    const scaleZ = 1.02;

    const x = rBase * scaleX * sinPhi;
    const y = yBase;
    const z = rBase * scaleZ * cosPhi;

    return new THREE.Vector3(x, y, z);
  }

  // Layer 0: Outer surface
  for (let iy = 0; iy <= heightSegs; iy++) {
    const v = iy / heightSegs;
    for (let ix = 0; ix <= radialSegs; ix++) {
      const u = ix / radialSegs;
      const pt = getVertex(0, iy, ix);
      positions.push(pt.x, pt.y, pt.z);
      uvs.push(u, v * 0.5);
    }
  }

  // Layer 1: Inner surface
  for (let iy = 0; iy <= heightSegs; iy++) {
    const v = iy / heightSegs;
    for (let ix = 0; ix <= radialSegs; ix++) {
      const u = ix / radialSegs;
      const pt = getVertex(1, iy, ix);
      positions.push(pt.x, pt.y, pt.z);
      uvs.push(u, 0.5 + v * 0.5);
    }
  }

  const numRing = radialSegs + 1;
  const innerOffset = (heightSegs + 1) * numRing;

  // Outer surface quads (facing outward)
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = iy * numRing + ix;
      const b = (iy + 1) * numRing + ix;
      const c = (iy + 1) * numRing + (ix + 1);
      const d = iy * numRing + (ix + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Inner surface quads (facing inward)
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = innerOffset + iy * numRing + ix;
      const b = innerOffset + (iy + 1) * numRing + ix;
      const c = innerOffset + (iy + 1) * numRing + (ix + 1);
      const d = innerOffset + iy * numRing + (ix + 1);

      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  // Bottom rim quads joining outer and inner surfaces (creating 5.5mm solid edge)
  const outerRimBase = heightSegs * numRing;
  const innerRimBase = innerOffset + heightSegs * numRing;
  for (let ix = 0; ix < radialSegs; ix++) {
    const o1 = outerRimBase + ix;
    const o2 = outerRimBase + (ix + 1);
    const i1 = innerRimBase + ix;
    const i2 = innerRimBase + (ix + 1);

    indices.push(o1, i1, o2);
    indices.push(o2, i1, i2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the high-fidelity robotic shoulder assembly adhering to Section 1-15:
 *
 * 1. Rebuilt solid 3D shoulder armor with 5.5mm thickness wrapping upper joint.
 * 2. Dedicated Inner Shoulder Collar (concentric rings, bearing housing, dark rubber seal,
 *    metallic inner ring, mounting flange) bridging armor to mechanism.
 * 3. Multi-layered rotary joint (outer bearing housing, bearing race, inner bearing ring,
 *    central hub, actuator stator, axle, structural mounting bracket).
 * 4. Upper arm mounting fork (dual-cheek titanium bracket) clamping onto the joint axle.
 * 5. Believable 10-12mm mechanical clearance gap revealing functional mechanics.
 * 6. 70% protected mechanical structure, 30% visible mechanical structure.
 */
export function createShoulder(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ShoulderNodes {
  // 1. Root ShoulderPivot
  const shoulderGroup = new THREE.Group();
  shoulderGroup.name = side === -1 ? 'LeftShoulderPivot' : 'RightShoulderPivot';

  const ledMeshes: THREE.Mesh[] = [];

  // ==============================================================
  // 2. SCULPTED SOLID DELTOID PAULDRON ARMOR
  // Form-fitting protective shell wrapping around the upper 70%
  // of the rotating joint mechanism.
  // ==============================================================
  const armorGroup = new THREE.Group();
  armorGroup.name = side === -1 ? 'LeftShoulderArmor' : 'RightShoulderArmor';
  armorGroup.position.set(side * 0.003, 0.004, 0.000);
  shoulderGroup.add(armorGroup);

  const pauldronGeo = createSolidPauldronGeo(side);
  const shoulderArmor = new THREE.Mesh(pauldronGeo, materials.armor);
  shoulderArmor.name = side === -1 ? 'LeftShoulderArmorShell' : 'RightShoulderArmorShell';
  shoulderArmor.rotation.z = -side * 0.08;
  shoulderArmor.rotation.x = 0.02;
  shoulderArmor.castShadow = true;
  shoulderArmor.receiveShadow = true;
  armorGroup.add(shoulderArmor);

  // A. Flush Cybernetic LED Light Channel on Anterior-Lateral Ridge
  const ledPathPoints = [
    new THREE.Vector3(side * 0.014, 0.038, 0.034),
    new THREE.Vector3(side * 0.028, 0.026, 0.028),
    new THREE.Vector3(side * 0.040, 0.012, 0.018),
    new THREE.Vector3(side * 0.046, -0.006, 0.006),
  ];
  const ledCurve = new THREE.CatmullRomCurve3(ledPathPoints);

  // Dark titanium mounting bezel
  const bezelGeo = new THREE.TubeGeometry(ledCurve, 20, 0.0024, 8, false);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.joint);
  shoulderArmor.add(bezelMesh);

  // Flush glowing purple emissive light strip
  const ledGeo = new THREE.TubeGeometry(ledCurve, 20, 0.0014, 8, false);
  const pauldronAccent = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  pauldronAccent.name = 'PauldronAccentLed';
  shoulderArmor.add(pauldronAccent);
  ledMeshes.push(pauldronAccent);

  // B. Secondary lateral accent notch (horizontal slit framing deltoid skirt)
  const flankCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.046, -0.002, -0.014),
    new THREE.Vector3(side * 0.049, -0.008, 0.002),
    new THREE.Vector3(side * 0.046, -0.012, 0.018),
  ]);
  const flankLedGeo = new THREE.TubeGeometry(flankCurve, 14, 0.0012, 6, false);
  const flankLed = new THREE.Mesh(flankLedGeo, materials.purpleEmissive);
  shoulderArmor.add(flankLed);
  ledMeshes.push(flankLed);

  // C. Recessed Posterior Heat Exhaust Louvers on Pauldron Crown
  for (let l = 0; l < 3; l++) {
    const louverGeo = new THREE.BoxGeometry(0.012, 0.0015, 0.0032);
    const louver = new THREE.Mesh(louverGeo, materials.joint);
    louver.position.set(-side * 0.002, 0.016 + l * 0.0042, -0.030);
    louver.rotation.x = 0.32;
    shoulderArmor.add(louver);
  }

  // D. Flush M3 Hex Fasteners on Armor Mounting Stanchions
  for (const bAngle of [-0.7, 0.5, 2.1]) {
    const boltGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.0022, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    const bRad = 0.044;
    bolt.position.set(
      Math.sin(bAngle) * bRad * side,
      0.022,
      Math.cos(bAngle) * bRad
    );
    shoulderArmor.add(bolt);
  }

  // E. Internal Structural Mounting Flange anchoring the shell to the shoulder chassis
  // Sized at r = 0.032 to sit cleanly within the inner cavity of the pauldron crown (r_inner ~ 0.034)
  const innerFlangeGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.003, 24);
  const innerFlange = new THREE.Mesh(innerFlangeGeo, materials.joint);
  innerFlange.position.set(side * 0.002, 0.012, 0);
  shoulderArmor.add(innerFlange);

  // ==============================================================
  // 3. INNER SHOULDER COLLAR (ENGINEERED ANATOMICAL SHROUD)
  // Inside the pauldron lower skirt, a precision dark mechanical collar
  // bridging the white shoulder armor and the rotating joint mechanism.
  // Sized with r <= 0.0315 so it NEVER punches through the 5.5mm pauldron wall
  // (pauldron lower skirt outer r = 0.0385, inner r = 0.033).
  // Features a clean 2.5mm functional clearance gap above the rotary joint.
  // ==============================================================
  const collarGroup = new THREE.Group();
  collarGroup.name = side === -1 ? 'LeftShoulderInnerCollar' : 'RightShoulderInnerCollar';
  collarGroup.position.set(side * 0.002, 0, 0);
  shoulderGroup.add(collarGroup);

  const tempCollar = new THREE.Group();

  // A. Structural Mounting Flange nested within the pauldron's lower inner rim
  const collarFlangeGeo = new THREE.CylinderGeometry(0.0315, 0.0305, 0.004, 32);
  const collarFlange = new THREE.Mesh(collarFlangeGeo, materials.joint);
  collarFlange.position.set(0, 0.002, 0);
  tempCollar.add(collarFlange);

  // 6 Fasteners securing collar flange to armor
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.002, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(Math.cos(angle) * 0.029, 0.003, Math.sin(angle) * 0.029);
    tempCollar.add(bolt);
  }

  // B. Stepped Concentric Collar Sleeve (stepping down from 30.5mm to 27.5mm)
  const collarSleeveGeo = new THREE.CylinderGeometry(0.0305, 0.0275, 0.008, 32);
  const collarSleeve = new THREE.Mesh(collarSleeveGeo, materials.joint);
  collarSleeve.position.set(0, -0.004, 0);
  tempCollar.add(collarSleeve);

  // Concentric rib ring on sleeve exterior
  const ringGeo = new THREE.TorusGeometry(0.029, 0.0012, 6, 28);
  const ring = new THREE.Mesh(ringGeo, materials.joint);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, -0.003, 0);
  tempCollar.add(ring);

  // C. Dark Synthetic Nitrile Rubber Flex Seal
  const flexSealGeo = new THREE.TorusGeometry(0.0275, 0.0016, 8, 32);
  const flexSeal = new THREE.Mesh(flexSealGeo, materials.joint);
  flexSeal.rotation.x = Math.PI / 2;
  flexSeal.position.set(0, -0.008, 0);
  tempCollar.add(flexSeal);

  // D. Metallic Inner Bearing Retaining Ring
  const retainerRingGeo = new THREE.TorusGeometry(0.0265, 0.0014, 8, 28);
  const retainerRing = new THREE.Mesh(retainerRingGeo, materials.joint);
  retainerRing.rotation.x = Math.PI / 2;
  retainerRing.position.set(0, -0.010, 0);
  tempCollar.add(retainerRing);

  const collarMerged = mergeGroupMeshesByMaterial(tempCollar, materials.joint, 'ShoulderCollar_Merged')!;
  tempCollar.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  collarGroup.add(collarMerged);

  // ==============================================================
  // 4. MULTI-LAYERED ROTATIONAL BEARING & JOINT HOUSING (SECTION 3)
  // Structured along the horizontal X-axis (Pitch/Elevation & Abduction):
  // - Medial side: Trunnion collar inserting into Chest Socket Cup
  // - Center core: Rotational bearing race, stator structure, cycloidal drive, axle pin
  // - Lateral side: Beveled retaining ring, purple accent LED ring, and
  //                 proud faceplate hub with central jewel (completely unclipped!)
  // ==============================================================
  const jointGroup = new THREE.Group();
  jointGroup.name = side === -1 ? 'LeftShoulderJoint' : 'RightShoulderJoint';
  jointGroup.rotation.y = -side * 0.03;
  shoulderGroup.add(jointGroup);

  const tempJointCore = new THREE.Group();

  // A. Torso Mount Trunnion Collar (inserts cleanly into chest socket bearing cup)
  const mountPlateGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.010, 28);
  const torsoMountPlate = new THREE.Mesh(mountPlateGeo, materials.joint);
  torsoMountPlate.name = side === -1 ? 'LeftTorsoMountPlate' : 'RightTorsoMountPlate';
  torsoMountPlate.rotation.z = Math.PI / 2;
  torsoMountPlate.position.set(-side * 0.007, 0, 0);
  tempJointCore.add(torsoMountPlate);

  // 6 Perimeter M4 Fasteners on Mounting Flange
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.0025, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(-side * 0.005, Math.sin(angle) * 0.032, Math.cos(angle) * 0.032);
    tempJointCore.add(bolt);
  }

  // B. Outer Bearing Housing (Heavy CNC casing centered in the joint gap)
  const outerRaceGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.016, 32);
  const outerRace = new THREE.Mesh(outerRaceGeo, materials.joint);
  outerRace.rotation.z = Math.PI / 2;
  outerRace.position.set(side * 0.003, 0, 0);
  tempJointCore.add(outerRace);

  // Outer Beveled Retaining Ring
  const outerBezelGeo = new THREE.TorusGeometry(0.036, 0.0018, 8, 32);
  const outerBezel = new THREE.Mesh(outerBezelGeo, materials.joint);
  outerBezel.rotation.y = Math.PI / 2;
  outerBezel.position.set(side * 0.011, 0, 0);
  tempJointCore.add(outerBezel);

  // C. Dark Nitrile Mechanical Rubber Seal
  const rubberSealGeo = new THREE.TorusGeometry(0.032, 0.0016, 8, 28);
  const rubberSeal = new THREE.Mesh(rubberSealGeo, materials.joint);
  rubberSeal.rotation.y = Math.PI / 2;
  rubberSeal.position.set(side * 0.0115, 0, 0);
  tempJointCore.add(rubberSeal);

  // D. Inner Bearing Race Ring
  const innerRaceGeo = new THREE.TorusGeometry(0.026, 0.0018, 8, 28);
  const innerRace = new THREE.Mesh(innerRaceGeo, materials.joint);
  innerRace.rotation.y = Math.PI / 2;
  innerRace.position.set(side * 0.0125, 0, 0);
  tempJointCore.add(innerRace);

  // E. Solid Cross-Axis Rotational Axle Pin
  const axlePinGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.032, 24);
  const axlePin = new THREE.Mesh(axlePinGeo, materials.joint);
  axlePin.rotation.z = Math.PI / 2;
  axlePin.position.set(side * 0.002, 0, 0);
  tempJointCore.add(axlePin);

  const jointCoreMerged = mergeGroupMeshesByMaterial(tempJointCore, materials.joint, 'ShoulderCore_Merged')!;
  tempJointCore.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  jointGroup.add(jointCoreMerged);

  // F. Actuator Stator Core & Harmonic Drive (centered inside bearing core)
  const innerStructure = new THREE.Group();
  innerStructure.name = side === -1 ? 'LeftInnerStructure' : 'RightInnerStructure';
  innerStructure.position.set(side * 0.003, 0, 0);
  jointGroup.add(innerStructure);

  const statorBaseGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.010, 28);
  const statorBase = new THREE.Mesh(statorBaseGeo, materials.joint);
  statorBase.rotation.z = Math.PI / 2;

  const tempStator = new THREE.Group();
  tempStator.add(statorBase);

  // 12 Radial Stator Teeth (heat dissipation ribs)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.008, 0.0022, 0.0044);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      0,
      Math.sin(angle) * 0.033,
      Math.cos(angle) * 0.033
    );
    tooth.rotation.x = angle;
    tempStator.add(tooth);
  }

  const statorMerged = mergeGroupMeshesByMaterial(tempStator, materials.joint, 'StatorStructure_Merged')!;
  tempStator.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  innerStructure.add(statorMerged);

  // G. Cycloidal Planetary Drive Ring
  const cycloidalDrive = new THREE.Group();
  cycloidalDrive.name = side === -1 ? 'LeftCycloidalDrive' : 'RightCycloidalDrive';
  cycloidalDrive.position.set(side * 0.006, 0, 0);
  jointGroup.add(cycloidalDrive);

  const gearRingGeo = new THREE.TorusGeometry(0.028, 0.0020, 8, 28);
  const gearRing = new THREE.Mesh(gearRingGeo, materials.joint);
  gearRing.rotation.y = Math.PI / 2;

  const tempDrive = new THREE.Group();
  tempDrive.add(gearRing);

  // 12 Cycloidal drive roller pins
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const pinGeo = new THREE.CylinderGeometry(0.0013, 0.0013, 0.0030, 8);
    const pin = new THREE.Mesh(pinGeo, materials.joint);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(
      0,
      Math.sin(angle) * 0.026,
      Math.cos(angle) * 0.026
    );
    tempDrive.add(pin);
  }

  const driveMerged = mergeGroupMeshesByMaterial(tempDrive, materials.joint, 'CycloidalDrive_Merged')!;
  tempDrive.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  cycloidalDrive.add(driveMerged);

  // H. Concentric Purple Emissive Accent Ring (Recessed flush on outer bearing face)
  const tempShoulderAccents = new THREE.Group();
  const accentGeo = new THREE.TorusGeometry(0.022, 0.0014, 8, 28);
  const accentRingRaw = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRingRaw.rotation.y = Math.PI / 2;
  accentRingRaw.position.set(side * 0.0135, 0, 0);
  tempShoulderAccents.add(accentRingRaw);

  const accentRing = mergeGroupMeshesByMaterial(
    tempShoulderAccents,
    materials.purpleEmissive,
    side === -1 ? 'LeftShoulderAccentRing' : 'RightShoulderAccentRing',
    false,
    false
  ) || accentRingRaw;
  accentRing.name = side === -1 ? 'LeftShoulderAccentRing' : 'RightShoulderAccentRing';
  jointGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // Inner machined titanium ring
  const innerRingGeo = new THREE.TorusGeometry(0.017, 0.0014, 6, 20);
  const innerRing = new THREE.Mesh(innerRingGeo, materials.joint);
  innerRing.name = side === -1 ? 'LeftInnerRing' : 'RightInnerRing';
  innerRing.rotation.y = Math.PI / 2;
  innerRing.position.set(side * 0.0142, 0, 0);
  jointGroup.add(innerRing);

  // I. Precision Billet Faceplate Hub & Fasteners
  // Positioned proudly on the lateral exterior (side * 0.015) completely clear
  // of the upper arm mounting fork and visible from all lateral angles!
  const faceplateHub = new THREE.Group();
  faceplateHub.name = side === -1 ? 'LeftFaceplateHub' : 'RightFaceplateHub';
  faceplateHub.position.set(side * 0.0148, 0, 0);
  jointGroup.add(faceplateHub);

  const tempFaceplate = new THREE.Group();

  // Outer beveled retaining casing ring
  const outerRingGeo = new THREE.TorusGeometry(0.029, 0.0020, 8, 28);
  const outerRing = new THREE.Mesh(outerRingGeo, materials.joint);
  outerRing.name = side === -1 ? 'LeftOuterRing' : 'RightOuterRing';
  outerRing.rotation.y = Math.PI / 2;
  tempFaceplate.add(outerRing);

  // Stepped recessed faceplate disc
  const steppedFaceGeo = new THREE.CylinderGeometry(0.027, 0.027, 0.0026, 24);
  const steppedFace = new THREE.Mesh(steppedFaceGeo, materials.joint);
  steppedFace.rotation.z = Math.PI / 2;
  steppedFace.position.set(side * 0.0010, 0, 0);
  tempFaceplate.add(steppedFace);

  // 6 Perimeter Hex Fasteners
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0013, 0.0013, 0.0022, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(
      side * 0.0022,
      Math.sin(angle) * 0.023,
      Math.cos(angle) * 0.023
    );
    tempFaceplate.add(bolt);
  }

  // Central Rotational Core Hub
  const coreDiscGeo = new THREE.CylinderGeometry(0.011, 0.013, 0.0032, 20);
  const rotationalCore = new THREE.Mesh(coreDiscGeo, materials.joint);
  rotationalCore.name = side === -1 ? 'LeftRotationalCore' : 'RightRotationalCore';
  rotationalCore.rotation.z = Math.PI / 2;
  rotationalCore.position.set(side * 0.0030, 0, 0);
  tempFaceplate.add(rotationalCore);

  // Central axle cap boss
  const centerPinGeo = new THREE.CylinderGeometry(0.0050, 0.0060, 0.0024, 16);
  const centerPin = new THREE.Mesh(centerPinGeo, materials.joint);
  centerPin.rotation.z = Math.PI / 2;
  centerPin.position.set(side * 0.0044, 0, 0);
  tempFaceplate.add(centerPin);

  const faceplateMerged = mergeGroupMeshesByMaterial(tempFaceplate, materials.joint, 'FaceplateHub_Merged')!;
  tempFaceplate.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  faceplateHub.add(faceplateMerged);

  // Purple LED center jewel
  const jewelGeo = new THREE.SphereGeometry(0.0020, 10, 10);
  const jewel = new THREE.Mesh(jewelGeo, materials.purpleEmissive);
  jewel.position.set(side * 0.0060, 0, 0);
  faceplateHub.add(jewel);
  ledMeshes.push(jewel);

  // ==============================================================
  // 5. STRUCTURAL GIMBAL YOKE & BRACKET
  // Anchored between the medial chassis mount and the pauldron framework
  // ==============================================================
  const gimbalYoke = new THREE.Group();
  gimbalYoke.name = side === -1 ? 'LeftGimbalYoke' : 'RightGimbalYoke';
  shoulderGroup.add(gimbalYoke);

  const tempYoke = new THREE.Group();

  // Primary structural bracket arm anchored on medial joint side
  const bracketArmGeo = new THREE.BoxGeometry(0.010, 0.020, 0.034);
  const bracketArm = new THREE.Mesh(bracketArmGeo, materials.joint);
  bracketArm.position.set(-side * 0.006, 0.010, 0.000);
  bracketArm.rotation.z = side * 0.10;
  tempYoke.add(bracketArm);

  // Lateral armor chassis anchor block
  const lateralAnchorGeo = new THREE.BoxGeometry(0.008, 0.012, 0.016);
  const lateralAnchor = new THREE.Mesh(lateralAnchorGeo, materials.joint);
  lateralAnchor.position.set(side * 0.012, 0.012, 0.008);
  tempYoke.add(lateralAnchor);

  // Titanium C-frame yoke spine connecting medial bracket to lateral armor anchor
  const yokeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-side * 0.006, 0.010, -0.010),
    new THREE.Vector3(-side * 0.002, 0.022, -0.004),
    new THREE.Vector3(side * 0.004, 0.026, 0.000),
    new THREE.Vector3(side * 0.009, 0.020, 0.005),
    new THREE.Vector3(side * 0.012, 0.012, 0.008),
  ]);
  const yokeSpineGeo = new THREE.TubeGeometry(yokeCurve, 16, 0.0036, 8, false);
  const yokeSpine = new THREE.Mesh(yokeSpineGeo, materials.joint);
  tempYoke.add(yokeSpine);

  const yokeMerged = mergeGroupMeshesByMaterial(tempYoke, materials.joint, 'GimbalYoke_Merged')!;
  tempYoke.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  gimbalYoke.add(yokeMerged);

  // ==============================================================
  // 6. HYDRAULIC ASSIST ACTUATOR STRUT
  // Mechanically linking the pauldron chassis to the joint casing
  // ==============================================================
  const damperActuator = new THREE.Group();
  damperActuator.name = side === -1 ? 'LeftDamperActuator' : 'RightDamperActuator';
  damperActuator.position.set(side * 0.002, 0.018, -0.014);
  damperActuator.rotation.x = -0.15;
  damperActuator.rotation.z = side * 0.16;
  shoulderGroup.add(damperActuator);

  const tempDamper = new THREE.Group();

  // Top clevis mounting tab on pauldron chassis
  const topClevisGeo = new THREE.BoxGeometry(0.006, 0.008, 0.008);
  const topClevis = new THREE.Mesh(topClevisGeo, materials.joint);
  topClevis.position.set(0, 0.016, 0);
  tempDamper.add(topClevis);

  const cylGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.022, 16);
  const damperCylinder = new THREE.Mesh(cylGeo, materials.joint);
  damperCylinder.position.set(0, 0.005, 0);
  tempDamper.add(damperCylinder);

  const pistonGeo = new THREE.CylinderGeometry(0.0030, 0.0030, 0.022, 16);
  const damperPiston = new THREE.Mesh(pistonGeo, materials.joint);
  damperPiston.position.set(0, -0.010, 0);
  tempDamper.add(damperPiston);

  const eyeletGeo = new THREE.SphereGeometry(0.0038, 12, 12);
  const eyelet = new THREE.Mesh(eyeletGeo, materials.joint);
  eyelet.position.set(0, -0.021, 0);
  tempDamper.add(eyelet);

  const damperMerged = mergeGroupMeshesByMaterial(tempDamper, materials.joint, 'DamperActuator_Merged')!;
  tempDamper.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  damperActuator.add(damperMerged);

  // ==============================================================
  // 7. UPPER ARM MOUNTING FORK & STRUCTURAL BRACKET (SECTION 4 & 7)
  // Architecture:
  // SHOULDER JOINT -> A-FRAME MOUNTING FORK -> STRUCTURAL BRACKET -> UPPER ARM
  // Dual-cheek cast titanium fork clamping directly to the rotational axle.
  // Medial cheek: -side * 0.004
  // Lateral cheek: side * 0.011 (nested cleanly INSIDE the faceplate hub at side * 0.0148)
  // Centerline: side * 0.0035
  // ==============================================================
  const upperArmConnector = new THREE.Group();
  upperArmConnector.name = side === -1 ? 'LeftUpperArmConnector' : 'RightUpperArmConnector';
  jointGroup.add(upperArmConnector);

  const tempConnector = new THREE.Group();

  const forkCenterlineX = side * 0.0035;

  // Dual-cheek A-Frame clevis
  // Cheek 1: Medial cheek at -side * 0.004
  // Cheek 2: Lateral cheek at side * 0.011
  const cheekPositionsX = [
    forkCenterlineX - side * 0.0075, // Medial: -side * 0.004
    forkCenterlineX + side * 0.0075, // Lateral: side * 0.011
  ];

  for (const cX of cheekPositionsX) {
    const cheekShape = new THREE.Shape();
    cheekShape.moveTo(-0.007, 0.008);
    cheekShape.lineTo(0.007, 0.008);
    cheekShape.lineTo(0.011, -0.014);
    cheekShape.lineTo(-0.011, -0.014);
    cheekShape.closePath();

    const cheekGeo = new THREE.ExtrudeGeometry(cheekShape, {
      depth: 0.0034,
      bevelEnabled: true,
      bevelThickness: 0.0008,
      bevelSize: 0.0006,
      bevelSegments: 2,
    });
    cheekGeo.center();

    const cheekMesh = new THREE.Mesh(cheekGeo, materials.joint);
    cheekMesh.position.set(cX, -0.005, 0);
    tempConnector.add(cheekMesh);

    // Axle pivot cap on each cheek
    const capGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.0018, 16);
    const cap = new THREE.Mesh(capGeo, materials.joint);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(cX + (cX > forkCenterlineX ? side * 0.0020 : -side * 0.0020), 0, 0);
    tempConnector.add(cap);
  }

  // B. Structural Cross-Brace Box linking the two fork cheeks
  const crossBraceGeo = new THREE.BoxGeometry(0.020, 0.008, 0.018);
  const crossBrace = new THREE.Mesh(crossBraceGeo, materials.joint);
  crossBrace.position.set(forkCenterlineX, -0.008, 0);
  tempConnector.add(crossBrace);

  // C. Lower Structural Mounting Neck & Flange
  // Mates flush into UpperArm collar at y = -0.016
  const neckGeo = new THREE.CylinderGeometry(0.031, 0.033, 0.008, 28);
  const neckMesh = new THREE.Mesh(neckGeo, materials.joint);
  neckMesh.position.set(forkCenterlineX, -0.013, 0);
  tempConnector.add(neckMesh);

  // Heavy machined mounting flange ring
  const flangeGeo = new THREE.TorusGeometry(0.032, 0.0018, 8, 28);
  const flange = new THREE.Mesh(flangeGeo, materials.joint);
  flange.rotation.x = Math.PI / 2;
  flange.position.set(forkCenterlineX, -0.016, 0);
  tempConnector.add(flange);

  // 4 M4 structural socket studs that seat into counterbores of the upper arm collar
  for (let b = 0; b < 4; b++) {
    const angle = (b / 4) * Math.PI * 2 + Math.PI / 4;
    const boltGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.0030, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      forkCenterlineX + Math.cos(angle) * 0.026,
      -0.0165,
      Math.sin(angle) * 0.026
    );
    tempConnector.add(bolt);
  }

  // D. Twin cybernetic braided conduit lines routing through fork into upper arm
  for (const c of [-1, 1]) {
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(forkCenterlineX + side * 0.004, 0.003, c * 0.010),
      new THREE.Vector3(forkCenterlineX + side * 0.002, -0.007, c * 0.012),
      new THREE.Vector3(forkCenterlineX, -0.017, c * 0.010),
    ]);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 10, 0.0014, 6, false);
    const cable = new THREE.Mesh(cableGeo, materials.joint);
    tempConnector.add(cable);
  }

  const connectorMerged = mergeGroupMeshesByMaterial(tempConnector, materials.joint, 'UpperArmConnector_Merged')!;
  tempConnector.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  upperArmConnector.add(connectorMerged);

  return {
    group: shoulderGroup,
    jointGroup,
    armorGroup,
    shoulderArmor,
    shoulderCollar: collarMerged,
    rotationalCore: faceplateMerged,
    outerRing: faceplateMerged,
    innerRing,
    innerStructure,
    upperArmConnector,
    accentRing,
    torsoMountPlate: jointCoreMerged,
    ledMeshes,

    // High-Precision Mechanical Nodes:
    gimbalYoke,
    cycloidalDrive,
    faceplateHub,
    damperActuator,
    damperPiston: damperMerged,
    damperCylinder: damperMerged,

    // Backwards compatibility aliases
    rotatingHub: faceplateMerged,
    ballJoint: jointCoreMerged,
    pauldronCowl: shoulderArmor,
    socketApertureRim: faceplateMerged,
  };
}
