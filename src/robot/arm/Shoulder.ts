import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface ShoulderNodes {
  group: THREE.Group;                  // ShoulderPivot root
  jointGroup: THREE.Group;             // ShoulderJoint rotating assembly
  armorGroup: THREE.Group;             // ShoulderArmor assembly (dummy/safe)
  shoulderArmor: THREE.Mesh;           // White outer protective shell (with cutaway exposure)
  rotationalCore: THREE.Mesh;          // Central rotational disc / core hub
  outerRing: THREE.Mesh;               // Outer black ring framing joint
  innerRing: THREE.Mesh;               // Inner black ring towards torso
  innerStructure: THREE.Group;         // Segmented mechanical stator / gear ring
  upperArmConnector: THREE.Group;      // Articulated black connector
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
 * CRITICAL CHANGE #1: REBUILT STRUCTURAL ROBOTIC SHOULDER
 * Engineering Logic:
 * TORSO MOUNT -> STRUCTURAL SHOULDER BRACKET -> LARGE CIRCULAR BEARING -> MOTOR / ACTUATOR HOUSING -> ROTATIONAL AXLE -> UPPER ARM FRAME -> SHOULDER ARMOR
 *
 * - Heavy-duty CNC torso mounting flange with 6 M4 hex bolts
 * - Structural cast titanium shoulder bracket
 * - Large circular bearing (outer race, inner race, rolling track, dark mechanical seal, central hub)
 * - Motor & cycloidal actuator housing with radial stator teeth
 * - Heavy transverse rotational axle pin
 * - Articulated dual-clevis connector to upper arm frame
 * - White ceramic deltoid pauldron with deliberate mechanical cutaways exposing the bearing from 3/4 view
 * - Visible armor mounting standoff brackets
 */
export function createShoulder(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ShoulderNodes {
  // 1. Root ShoulderPivot
  const shoulderGroup = new THREE.Group();
  shoulderGroup.name = side === -1 ? 'LeftShoulderPivot' : 'RightShoulderPivot';

  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 2. WHITE CERAMIC DELTOID PAULDRON ARMOR
  // Floating armor cowl with controlled cutaway exposure:
  // Shields the crown and posterior deltoid, while exposing
  // the large circular bearing, cycloidal drive, and actuator
  // to clear visibility from front, side, and 3/4 views.
  // ==========================================
  const armorGroup = new THREE.Group();
  armorGroup.name = side === -1 ? 'LeftShoulderArmor' : 'RightShoulderArmor';
  armorGroup.position.set(side * 0.010, 0.018, 0.002);
  shoulderGroup.add(armorGroup);

  // Sculpted anatomical pauldron with front/lateral exposure cutaway
  function createExposedPauldronGeo(): THREE.BufferGeometry {
    const radialSegs = 32;
    const heightSegs = 18;
    const maxTheta = Math.PI * 0.52; // Covers upper crown down to mid-joint
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const R = 0.068; // Sits with clean 6mm mechanical clearance above bearing

    for (let iy = 0; iy <= heightSegs; iy++) {
      const v = iy / heightSegs;
      const theta = v * maxTheta;

      for (let ix = 0; ix <= radialSegs; ix++) {
        const u = ix / radialSegs;
        const phi = u * Math.PI * 2;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        // Controlled mechanical exposure cutaway:
        // Cut an angular relief notch on the anterior-lateral quadrant (where bearing lives)
        // so the large circular bearing and cycloidal drive are visibly exposed!
        const isAnterior = cosPhi > 0.05;
        const isLateral = (sinPhi * side) > -0.20;

        let rEff = R;
        // Athletic deltoid contouring
        let scaleX = 1.14;
        let scaleY = 0.90;
        let scaleZ = 1.08;

        let localX = rEff * scaleX * sinTheta * sinPhi;
        let localY = rEff * scaleY * cosTheta;
        let localZ = rEff * scaleZ * sinTheta * cosPhi;

        // Cutaway scalloped rim along anterior-lateral border
        if (isAnterior && isLateral && v > 0.45) {
          const cutDepth = Math.pow((v - 0.45) / 0.55, 1.3) * 0.018;
          localY += cutDepth * 0.8;
          localZ -= cutDepth * 0.6;
        }

        positions.push(localX, localY, localZ);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < heightSegs; iy++) {
      const vMid = (iy + 0.5) / heightSegs;
      for (let ix = 0; ix < radialSegs; ix++) {
        const uMid = (ix + 0.5) / radialSegs;
        const phiMid = uMid * Math.PI * 2;
        const sinMid = Math.sin(phiMid);
        const cosMid = Math.cos(phiMid);

        // Expose front-lateral quadrant for bearing visibility
        const inCutoutZone = (vMid > 0.65) && (cosMid > 0.15) && ((sinMid * side) > 0.10);
        if (inCutoutZone) {
          continue; // Leave window open for bearing
        }

        const a = iy * (radialSegs + 1) + ix;
        const b = (iy + 1) * (radialSegs + 1) + ix;
        const c = (iy + 1) * (radialSegs + 1) + (ix + 1);
        const d = iy * (radialSegs + 1) + (ix + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  const pauldronGeo = createExposedPauldronGeo();
  const shoulderArmor = new THREE.Mesh(pauldronGeo, materials.armorDoubleSide);
  shoulderArmor.name = side === -1 ? 'LeftShoulderArmorShell' : 'RightShoulderArmorShell';
  shoulderArmor.rotation.z = -side * 0.14;
  shoulderArmor.rotation.x = 0.06;
  shoulderArmor.castShadow = true;
  shoulderArmor.receiveShadow = true;
  armorGroup.add(shoulderArmor);

  // Pauldron signature purple accent slit embedded directly flush into the armor shell
  const pauldronAccentGeo = new THREE.TorusGeometry(0.063, 0.0016, 6, 28, Math.PI * 0.45);
  const pauldronAccent = new THREE.Mesh(pauldronAccentGeo, materials.purpleEmissive);
  pauldronAccent.rotation.x = Math.PI * 0.42;
  pauldronAccent.rotation.z = side * 0.12;
  pauldronAccent.position.set(side * 0.006, 0.018, 0.024);
  shoulderArmor.add(pauldronAccent);
  ledMeshes.push(pauldronAccent);

  // Posterior Heat Exhaust Louvers on Pauldron Crown
  for (let l = 0; l < 3; l++) {
    const louverGeo = new THREE.BoxGeometry(0.016, 0.0024, 0.005);
    const louver = new THREE.Mesh(louverGeo, materials.joint);
    louver.position.set(-side * 0.006, 0.024 + l * 0.007, -0.042);
    louver.rotation.x = -Math.PI / 4;
    shoulderArmor.add(louver);
  }

  // Visible Armor Mounting Standoff Brackets (showing armor is bolted to frame)
  for (const bAngle of [-0.6, 0.8, 2.3]) {
    const standoffGeo = new THREE.CylinderGeometry(0.0030, 0.0035, 0.014, 8);
    const standoff = new THREE.Mesh(standoffGeo, materials.joint);
    standoff.position.set(
      Math.sin(bAngle) * 0.048,
      0.015,
      Math.cos(bAngle) * 0.048
    );
    standoff.rotation.x = Math.PI / 6;
    armorGroup.add(standoff);

    // M3 hex bolt head on outer armor face
    const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0020, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(
      Math.sin(bAngle) * 0.052,
      0.024,
      Math.cos(bAngle) * 0.052
    );
    armorGroup.add(bolt);
  }

  // ==========================================
  // 3. STRUCTURAL SHOULDER BRACKET & GIMBAL YOKE
  // Heavy cast 7075-T6 titanium structural bracket linking torso mount
  // to the primary bearing hub and actuator
  // ==========================================
  const gimbalYoke = new THREE.Group();
  gimbalYoke.name = side === -1 ? 'LeftGimbalYoke' : 'RightGimbalYoke';
  shoulderGroup.add(gimbalYoke);

  const tempYoke = new THREE.Group();

  // Primary structural bracket arm
  const bracketArmGeo = new THREE.BoxGeometry(0.018, 0.032, 0.054);
  const bracketArm = new THREE.Mesh(bracketArmGeo, materials.joint);
  bracketArm.position.set(-side * 0.004, 0.014, 0.000);
  bracketArm.rotation.z = side * 0.20;
  tempYoke.add(bracketArm);

  // Heavy C-frame titanium yoke arching over bearing
  const yokeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-side * 0.012, 0.004, -0.028),
    new THREE.Vector3(-side * 0.006, 0.034, -0.014),
    new THREE.Vector3(side * 0.008, 0.042, 0.000),
    new THREE.Vector3(side * 0.024, 0.032, 0.014),
    new THREE.Vector3(side * 0.028, 0.008, 0.022),
  ]);
  const yokeSpineGeo = new THREE.TubeGeometry(yokeCurve, 18, 0.0068, 8, false);
  const yokeSpine = new THREE.Mesh(yokeSpineGeo, materials.joint);
  tempYoke.add(yokeSpine);

  // Gusset reinforcing ribs
  for (let g = -1; g <= 1; g += 2) {
    const gussetGeo = new THREE.BoxGeometry(0.008, 0.022, 0.012);
    const gusset = new THREE.Mesh(gussetGeo, materials.joint);
    gusset.position.set(side * 0.008, 0.026, g * 0.016);
    gusset.rotation.z = side * 0.25;
    tempYoke.add(gusset);
  }

  const yokeMerged = mergeGroupMeshesByMaterial(tempYoke, materials.joint, 'GimbalYoke_Merged')!;
  tempYoke.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  gimbalYoke.add(yokeMerged);

  // ==========================================
  // 4. HYDRAULIC SHOULDER ACTUATOR STRUT
  // Heavy-duty assist cylinder linking torso chassis to shoulder yoke
  // ==========================================
  const damperActuator = new THREE.Group();
  damperActuator.name = side === -1 ? 'LeftDamperActuator' : 'RightDamperActuator';
  damperActuator.position.set(side * 0.004, 0.038, 0.016);
  damperActuator.rotation.x = 0.26;
  damperActuator.rotation.z = side * 0.30;
  shoulderGroup.add(damperActuator);

  const tempDamper = new THREE.Group();

  // Pressure cylinder
  const cylGeo = new THREE.CylinderGeometry(0.0078, 0.0078, 0.036, 16);
  const damperCylinder = new THREE.Mesh(cylGeo, materials.joint);
  damperCylinder.position.set(0, 0.010, 0);
  tempDamper.add(damperCylinder);

  // Anodized violet collar ring
  const damperCollarGeo = new THREE.TorusGeometry(0.0082, 0.0016, 6, 16);
  const damperCollar = new THREE.Mesh(damperCollarGeo, materials.purpleEmissive);
  damperCollar.rotation.x = Math.PI / 2;
  damperCollar.position.set(0, 0.002, 0);
  damperActuator.add(damperCollar);
  ledMeshes.push(damperCollar);

  // Mirror-chrome telescopic piston rod
  const pistonGeo = new THREE.CylinderGeometry(0.0046, 0.0046, 0.040, 16);
  const damperPiston = new THREE.Mesh(pistonGeo, materials.joint);
  damperPiston.position.set(0, -0.018, 0);
  tempDamper.add(damperPiston);

  // Eyelet trunnion
  const eyeletGeo = new THREE.SphereGeometry(0.0062, 12, 12);
  const eyelet = new THREE.Mesh(eyeletGeo, materials.joint);
  eyelet.position.set(0, -0.036, 0);
  tempDamper.add(eyelet);

  const damperMerged = mergeGroupMeshesByMaterial(tempDamper, materials.joint, 'DamperActuator_Merged')!;
  tempDamper.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  damperActuator.add(damperMerged);

  // ==========================================
  // 5. LARGE CIRCULAR SHOULDER BEARING & MOTOR HOUSING
  // Prominently visible from 3/4 view:
  // - Torso Mount Flange with 6 M4 bolts
  // - Outer Bearing Race (substantial machined radius 0.052)
  // - Dark Mechanical Rubber Seal
  // - Inner Bearing Race
  // - Rolling element ball track
  // - Stator Motor Housing & Cycloidal Planetary Drive
  // - Central Drive Axle Hub
  // ==========================================
  const jointGroup = new THREE.Group();
  jointGroup.name = side === -1 ? 'LeftShoulderJoint' : 'RightShoulderJoint';
  jointGroup.rotation.y = -side * 0.06;
  shoulderGroup.add(jointGroup);

  const tempJointCore = new THREE.Group();

  // A. Torso Mount Plate (Docking Flange)
  const mountPlateGeo = new THREE.CylinderGeometry(0.052, 0.050, 0.018, 28);
  const torsoMountPlate = new THREE.Mesh(mountPlateGeo, materials.joint);
  torsoMountPlate.name = side === -1 ? 'LeftTorsoMountPlate' : 'RightTorsoMountPlate';
  torsoMountPlate.rotation.z = Math.PI / 2;
  torsoMountPlate.position.set(-side * 0.008, 0, 0);
  tempJointCore.add(torsoMountPlate);

  // 6 Perimeter M4 Socket Head Fasteners on Flange
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0040, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(-side * 0.006, Math.sin(angle) * 0.043, Math.cos(angle) * 0.043);
    tempJointCore.add(bolt);
  }

  // B. Large Outer Bearing Race (Radius 0.052 - visibly massive industrial bearing)
  const outerRaceGeo = new THREE.CylinderGeometry(0.051, 0.051, 0.022, 32);
  const outerRace = new THREE.Mesh(outerRaceGeo, materials.joint);
  outerRace.rotation.z = Math.PI / 2;
  outerRace.position.set(side * 0.006, 0, 0);
  tempJointCore.add(outerRace);

  // Machined Outer Bearing Retaining Bezel Ring
  const outerBezelGeo = new THREE.TorusGeometry(0.0515, 0.0032, 8, 32);
  const outerBezel = new THREE.Mesh(outerBezelGeo, materials.joint);
  outerBezel.rotation.y = Math.PI / 2;
  outerBezel.position.set(side * 0.016, 0, 0);
  tempJointCore.add(outerBezel);

  // C. Dark Mechanical Seal (Synthetic nitrile rubber seal ring)
  const rubberSealGeo = new THREE.TorusGeometry(0.044, 0.0030, 8, 32);
  const rubberSeal = new THREE.Mesh(rubberSealGeo, materials.joint);
  rubberSeal.rotation.y = Math.PI / 2;
  rubberSeal.position.set(side * 0.0165, 0, 0);
  tempJointCore.add(rubberSeal);

  // D. Inner Bearing Race Ring
  const innerRaceGeo = new THREE.TorusGeometry(0.038, 0.0034, 8, 28);
  const innerRace = new THREE.Mesh(innerRaceGeo, materials.joint);
  innerRace.rotation.y = Math.PI / 2;
  innerRace.position.set(side * 0.0175, 0, 0);
  tempJointCore.add(innerRace);

  // E. Solid Cross-Axis Rotational Axle
  const axlePinGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.048, 24);
  const axlePin = new THREE.Mesh(axlePinGeo, materials.joint);
  axlePin.rotation.z = Math.PI / 2;
  axlePin.position.set(side * 0.004, 0, 0);
  tempJointCore.add(axlePin);

  const jointCoreMerged = mergeGroupMeshesByMaterial(tempJointCore, materials.joint, 'ShoulderCore_Merged')!;
  tempJointCore.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  jointGroup.add(jointCoreMerged);

  // F. Stator Ring & Harmonic Drive Core
  const innerStructure = new THREE.Group();
  innerStructure.name = side === -1 ? 'LeftInnerStructure' : 'RightInnerStructure';
  innerStructure.position.set(side * 0.010, 0, 0);
  jointGroup.add(innerStructure);

  const statorBaseGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.016, 28);
  const statorBase = new THREE.Mesh(statorBaseGeo, materials.joint);
  statorBase.rotation.z = Math.PI / 2;

  const tempStator = new THREE.Group();
  tempStator.add(statorBase);

  // 14 Radial Stator Teeth (visible motor core)
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.014, 0.0035, 0.0068);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      0,
      Math.sin(angle) * 0.0495,
      Math.cos(angle) * 0.0495
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

  // G. Cycloidal Planetary Drive Ring (Exploded Stage 4)
  const cycloidalDrive = new THREE.Group();
  cycloidalDrive.name = side === -1 ? 'LeftCycloidalDrive' : 'RightCycloidalDrive';
  cycloidalDrive.position.set(side * 0.014, 0, 0);
  jointGroup.add(cycloidalDrive);

  const gearRingGeo = new THREE.TorusGeometry(0.044, 0.0035, 8, 28);
  const gearRing = new THREE.Mesh(gearRingGeo, materials.joint);
  gearRing.rotation.y = Math.PI / 2;

  const tempDrive = new THREE.Group();
  tempDrive.add(gearRing);

  // 16 Cycloidal drive roller pins around perimeter
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const pinGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.0048, 8);
    const pin = new THREE.Mesh(pinGeo, materials.joint);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(
      0,
      Math.sin(angle) * 0.040,
      Math.cos(angle) * 0.040
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

  // H. Concentric Purple Emissive Accent Ring (Concentric within bearing)
  const tempShoulderAccents = new THREE.Group();
  const accentGeo = new THREE.TorusGeometry(0.034, 0.0020, 8, 28);
  const accentRingRaw = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRingRaw.rotation.y = Math.PI / 2;
  accentRingRaw.position.set(side * 0.0185, 0, 0);
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

  // Stepped inner machined titanium ring
  const innerRingGeo = new THREE.TorusGeometry(0.026, 0.0022, 6, 20);
  const innerRing = new THREE.Mesh(innerRingGeo, materials.joint);
  innerRing.name = side === -1 ? 'LeftInnerRing' : 'RightInnerRing';
  innerRing.rotation.y = Math.PI / 2;
  innerRing.position.set(side * 0.0195, 0, 0);
  jointGroup.add(innerRing);

  // I. Precision Billet Faceplate Hub & Fasteners (Exploded Stage 6)
  const faceplateHub = new THREE.Group();
  faceplateHub.name = side === -1 ? 'LeftFaceplateHub' : 'RightFaceplateHub';
  faceplateHub.position.set(side * 0.021, 0, 0);
  jointGroup.add(faceplateHub);

  const tempFaceplate = new THREE.Group();

  // Outer beveled retaining casing ring
  const outerRingGeo = new THREE.TorusGeometry(0.046, 0.0036, 8, 28);
  const outerRing = new THREE.Mesh(outerRingGeo, materials.joint);
  outerRing.name = side === -1 ? 'LeftOuterRing' : 'RightOuterRing';
  outerRing.rotation.y = Math.PI / 2;
  tempFaceplate.add(outerRing);

  // Stepped recessed faceplate disc
  const steppedFaceGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.0045, 24);
  const steppedFace = new THREE.Mesh(steppedFaceGeo, materials.joint);
  steppedFace.rotation.z = Math.PI / 2;
  steppedFace.position.set(side * 0.001, 0, 0);
  tempFaceplate.add(steppedFace);

  // 8 Perimeter Hex Fasteners
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0035, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(
      side * 0.0035,
      Math.sin(angle) * 0.038,
      Math.cos(angle) * 0.038
    );
    tempFaceplate.add(bolt);
  }

  // Central Rotational Core Hub
  const coreDiscGeo = new THREE.CylinderGeometry(0.018, 0.020, 0.0055, 24);
  const rotationalCore = new THREE.Mesh(coreDiscGeo, materials.joint);
  rotationalCore.name = side === -1 ? 'LeftRotationalCore' : 'RightRotationalCore';
  rotationalCore.rotation.z = Math.PI / 2;
  rotationalCore.position.set(side * 0.005, 0, 0);
  tempFaceplate.add(rotationalCore);

  // Central axle cap boss
  const centerPinGeo = new THREE.CylinderGeometry(0.008, 0.009, 0.0045, 16);
  const centerPin = new THREE.Mesh(centerPinGeo, materials.joint);
  centerPin.rotation.z = Math.PI / 2;
  centerPin.position.set(side * 0.0078, 0, 0);
  tempFaceplate.add(centerPin);

  const faceplateMerged = mergeGroupMeshesByMaterial(tempFaceplate, materials.joint, 'FaceplateHub_Merged')!;
  tempFaceplate.traverse((c) => {
    if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry) {
      (c as THREE.Mesh).geometry.dispose();
    }
  });
  faceplateHub.add(faceplateMerged);

  // Purple LED center jewel
  const jewelGeo = new THREE.SphereGeometry(0.0032, 10, 10);
  const jewel = new THREE.Mesh(jewelGeo, materials.purpleEmissive);
  jewel.position.set(side * 0.0102, 0, 0);
  faceplateHub.add(jewel);
  ledMeshes.push(jewel);

  // ==========================================
  // 6. ARTICULATED UPPER ARM CONNECTOR & CLEVIS
  // Heavy cast titanium clevis yoke articulating with underside of joint
  // and seating smoothly into the upper arm bicep frame
  // ==========================================
  const upperArmConnector = new THREE.Group();
  upperArmConnector.name = side === -1 ? 'LeftUpperArmConnector' : 'RightUpperArmConnector';
  jointGroup.add(upperArmConnector);

  const tempConnector = new THREE.Group();

  // Dual-cheek articulated clevis housing
  const clevisGeo = new THREE.CylinderGeometry(0.030, 0.032, 0.020, 20);
  const clevis = new THREE.Mesh(clevisGeo, materials.joint);
  clevis.position.set(side * 0.002, -0.016, 0);
  tempConnector.add(clevis);

  // Transverse pivot pin with beveled bolt caps
  const pivotPinGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.044, 16);
  const pivotPin = new THREE.Mesh(pivotPinGeo, materials.joint);
  pivotPin.rotation.z = Math.PI / 2;
  pivotPin.position.set(side * 0.002, -0.016, 0);
  tempConnector.add(pivotPin);

  // Connector stem linking down to upper arm frame
  const stemGeo = new THREE.CylinderGeometry(0.036, 0.038, 0.016, 24);
  const stem = new THREE.Mesh(stemGeo, materials.joint);
  stem.position.set(side * 0.002, -0.025, 0);
  tempConnector.add(stem);

  // Lower seating flange ring mating flush with upper arm frame collar
  const flangeGeo = new THREE.TorusGeometry(0.038, 0.0028, 8, 24);
  const flange = new THREE.Mesh(flangeGeo, materials.joint);
  flange.rotation.x = Math.PI / 2;
  flange.position.set(side * 0.002, -0.030, 0);
  tempConnector.add(flange);

  // Twin cybernetic braided conduit lines linking joint into upper arm
  for (let c = -1; c <= 1; c += 2) {
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.012, -0.008, c * 0.018),
      new THREE.Vector3(side * 0.006, -0.022, c * 0.020),
      new THREE.Vector3(side * 0.002, -0.034, c * 0.016),
    ]);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 10, 0.0022, 6, false);
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
