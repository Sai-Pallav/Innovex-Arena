import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface ForearmNodes {
  group: THREE.Group;
  gauntletBody: THREE.Mesh;
  innerSleeve: THREE.Mesh;
  armorGroup: THREE.Group;
  elbowSocketCollar: THREE.Mesh;
  brachioradialis: THREE.Mesh;
  wristCuff: THREE.Mesh;
  panelSeam: THREE.Mesh;
  ledMeshes: THREE.Mesh[];
}

/**
 * CRITICAL CHANGE #4: REBUILT ROBOTIC FOREARM
 * INTERNAL CHASSIS + ACTUATORS + STRUCTURAL RAILS + OUTER ARMOR
 *
 * Internal Chassis:
 * - Two heavy longitudinal 7075-T6 titanium side rails (lateral & medial)
 * - Central drive component / spine transmission chassis
 * - Triangulated cross supports & truss braces
 * - Dual parallel linear actuator cylinders with telescopic chrome pushrods
 * - Central wrist transmission torque shaft
 * - Braided cable routing harness
 * - Lower structural bracket interfacing with wrist
 *
 * Outer Armor:
 * - 3 large manufactured panels: Anterior Forearm Shield, Posterior Dorsal Shield, Brachioradialis Plate
 * - Visible mounting standoff bosses and hex fasteners securing panels to the chassis rails
 * - Wide open side windows exposing the internal mechanical skeleton and actuators
 */
export function createForearm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ForearmNodes {
  const forearmGroup = new THREE.Group();
  forearmGroup.name = side === -1 ? 'LeftForearmArmor' : 'RightForearmArmor';

  const ledMeshes: THREE.Mesh[] = [];
  const forearmJointGroup = new THREE.Group();

  // ==============================================================
  // 1. UPPER ELBOW SOCKET TRANSITION COLLAR & CARRIER FLANGE
  // Receives the elbow lower clevis housing
  // ==============================================================
  const collarGeo = new THREE.CylinderGeometry(0.042, 0.040, 0.016, 32);
  const elbowSocketCollar = new THREE.Mesh(collarGeo, materials.joint);
  elbowSocketCollar.name = 'ForearmElbowSocketCollar';
  elbowSocketCollar.position.set(0, -0.012, 0);
  elbowSocketCollar.castShadow = true;
  elbowSocketCollar.receiveShadow = true;
  forearmJointGroup.add(elbowSocketCollar);

  const socketRimGeo = new THREE.TorusGeometry(0.041, 0.0022, 8, 32);
  const socketRim = new THREE.Mesh(socketRimGeo, materials.joint);
  socketRim.rotation.x = Math.PI / 2;
  socketRim.position.set(0, -0.005, 0);
  forearmJointGroup.add(socketRim);

  // ==============================================================
  // 2. INTERNAL CHASSIS: DUAL LONGITUDINAL RAILS & CENTRAL SPINE
  // ==============================================================

  // A. Central Drive Transmission Spine Chassis
  const spineGeo = new THREE.BoxGeometry(0.024, 0.168, 0.028);
  const chassisSpine = new THREE.Mesh(spineGeo, materials.joint);
  chassisSpine.name = 'ForearmChassisSpine';
  chassisSpine.position.set(0, -0.094, 0);
  chassisSpine.castShadow = true;
  forearmJointGroup.add(chassisSpine);

  // CNC weight-reduction cutouts along spine
  for (let w = 0; w < 3; w++) {
    const pocketGeo = new THREE.BoxGeometry(0.028, 0.026, 0.016);
    const pocket = new THREE.Mesh(pocketGeo, materials.joint);
    pocket.position.set(0, -0.050 - w * 0.042, 0);
    forearmJointGroup.add(pocket);
  }

  // B. Two Longitudinal CNC 7075-T6 Structural Rails (Lateral and Medial)
  for (let s = -1; s <= 1; s += 2) {
    const railGeo = new THREE.BoxGeometry(0.006, 0.162, 0.014);
    const rail = new THREE.Mesh(railGeo, materials.joint);
    rail.position.set(s * 0.026, -0.094, 0.002);
    rail.castShadow = true;
    forearmJointGroup.add(rail);

    // Diagonal Cross-Brace Trusses linking side rails to central drive spine
    for (let t = 0; t < 3; t++) {
      const trussGeo = new THREE.CylinderGeometry(0.0024, 0.0024, 0.026, 8);
      trussGeo.rotateZ(Math.PI / 4 * (t % 2 === 0 ? 1 : -1) * s);
      const truss = new THREE.Mesh(trussGeo, materials.joint);
      truss.position.set(s * 0.014, -0.052 - t * 0.040, 0.002);
      forearmJointGroup.add(truss);
    }
  }

  // ==============================================================
  // 3. ACTUATORS & TRANSMISSION COMPONENTS
  // Dual Inverted Roller-Screw Linear Actuators + Central Torque Tube
  // ==============================================================

  // Dual Parallel Inverted Linear Actuators (driving wrist pitch & yaw)
  for (let a = -1; a <= 1; a += 2) {
    // Actuator Pressure Cylinder (Dark gunmetal)
    const actCylGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.078, 16);
    const actCyl = new THREE.Mesh(actCylGeo, materials.joint);
    actCyl.position.set(a * 0.021, -0.072, 0.000);
    actCyl.castShadow = true;
    forearmJointGroup.add(actCyl);

    // Telescopic Mirror-Chrome Pushrod Shaft
    const rodGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.072, 12);
    const rod = new THREE.Mesh(rodGeo, materials.joint);
    rod.position.set(a * 0.021, -0.134, 0.000);
    rod.castShadow = true;
    forearmJointGroup.add(rod);

    // Precision Brass Guide Bushing & Wiper Seal Collar
    const bushingGeo = new THREE.CylinderGeometry(0.0052, 0.0052, 0.006, 12);
    const bushing = new THREE.Mesh(bushingGeo, materials.joint);
    bushing.position.set(a * 0.021, -0.108, 0.000);
    forearmJointGroup.add(bushing);

    // Anodized Violet Sensor Ring on barrel mouth
    const collarGeo = new THREE.TorusGeometry(0.0070, 0.0012, 6, 16);
    const collar = new THREE.Mesh(collarGeo, materials.purpleEmissive);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(a * 0.021, -0.046, 0.000);
    forearmGroup.add(collar);
    ledMeshes.push(collar);
  }

  // Central Wrist Roll Torque Drive Tube
  const driveTubeGeo = new THREE.CylinderGeometry(0.0085, 0.0085, 0.166, 16);
  const driveTube = new THREE.Mesh(driveTubeGeo, materials.joint);
  driveTube.position.set(0, -0.094, -0.006);
  forearmJointGroup.add(driveTube);

  // Braided Cybernetic Electrical & Hydraulic Conduits
  const conduitGeo = new THREE.CylinderGeometry(0.0040, 0.0040, 0.158, 10);
  const conduit = new THREE.Mesh(conduitGeo, materials.joint);
  conduit.position.set(-side * 0.016, -0.094, -0.014);
  forearmJointGroup.add(conduit);

  // Lower Structural Carpal Bracket (interfaces with wrist)
  const lowerBracketGeo = new THREE.BoxGeometry(0.038, 0.020, 0.036);
  const wristSocket = new THREE.Mesh(lowerBracketGeo, materials.joint);
  wristSocket.position.set(0, -0.176, 0);
  forearmJointGroup.add(wristSocket);

  // Merge static mechanical components
  const mergedForearmJoint = mergeGroupMeshesByMaterial(forearmJointGroup, materials.joint, 'ForearmJoint_Merged', false);
  if (mergedForearmJoint) {
    mergedForearmJoint.castShadow = true;
    mergedForearmJoint.receiveShadow = true;
    forearmGroup.add(mergedForearmJoint);
  }

  // ==============================================================
  // 4. OUTER ARMOR MOUNTED AROUND THE STRUCTURE
  // 3 Distinct Manufactured Panels:
  // - Panel 1: Anterior Forearm Armor Shield
  // - Panel 2: Posterior Dorsal Armor Panel
  // - Panel 3: Brachioradialis Lateral Accent Plate
  // - Open side windows exposing internal rails & actuators
  // ==============================================================
  const armorGroup = new THREE.Group();
  armorGroup.name = 'ForearmArmorGroup';
  forearmGroup.add(armorGroup);

  // Panel 1: Sculpted Anterior Forearm Armor Shield (Covers anterior arc -45° to +45°)
  function createAnteriorForearmShieldGeo(): THREE.BufferGeometry {
    const radialSegs = 20;
    const heightSegs = 22;
    const length = 0.160;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy <= heightSegs; iy++) {
      const v = iy / heightSegs;
      const y = -0.014 - v * length;

      // Smooth ergonomic taper towards wrist: 0.046 at elbow down to 0.036 at wrist
      const baseR = 0.046 - 0.010 * v;

      for (let ix = 0; ix <= radialSegs; ix++) {
        const u = ix / radialSegs;
        // Spans anterior arc from -Math.PI*0.35 to +Math.PI*0.35
        const angle = -Math.PI * 0.35 + u * (Math.PI * 0.70);
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);

        let rx = baseR;
        let rz = baseR;

        // Anterior slight flattened chamfer with central longitudinal specular line
        if (cosA > 0.50) {
          const tAnt = (cosA - 0.50) / 0.50;
          rz += 0.0028 * Math.pow(tAnt, 1.5) * (0.8 + 0.2 * Math.sin(v * Math.PI));
        }

        const x = rx * sinA;
        const z = rz * cosA;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < heightSegs; iy++) {
      for (let ix = 0; ix < radialSegs; ix++) {
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

  const anteriorShieldGeo = createAnteriorForearmShieldGeo();
  const gauntletBody = new THREE.Mesh(anteriorShieldGeo, materials.armorDoubleSide);
  gauntletBody.name = 'AnteriorForearmArmorShield';
  gauntletBody.castShadow = true;
  gauntletBody.receiveShadow = true;
  armorGroup.add(gauntletBody);

  // Panel 2: Sculpted Posterior Dorsal Armor Panel (Covers posterior arc 135° to 225°)
  function createPosteriorDorsalPanelGeo(): THREE.BufferGeometry {
    const radialSegs = 20;
    const heightSegs = 22;
    const length = 0.160;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy <= heightSegs; iy++) {
      const v = iy / heightSegs;
      const y = -0.014 - v * length;
      const baseR = 0.044 - 0.009 * v;

      for (let ix = 0; ix <= radialSegs; ix++) {
        const u = ix / radialSegs;
        // Spans posterior arc from Math.PI*0.65 to Math.PI*1.35
        const angle = Math.PI * 0.65 + u * (Math.PI * 0.70);
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);

        const x = baseR * sinA;
        const z = baseR * cosA;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < heightSegs; iy++) {
      for (let ix = 0; ix < radialSegs; ix++) {
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

  const dorsalPanelGeo = createPosteriorDorsalPanelGeo();
  const dorsalPanel = new THREE.Mesh(dorsalPanelGeo, materials.armorDoubleSide);
  dorsalPanel.name = 'PosteriorDorsalArmorPanel';
  dorsalPanel.castShadow = true;
  dorsalPanel.receiveShadow = true;
  armorGroup.add(dorsalPanel);

  // Visible Mounting Standoff Tabs (showing armor is bolted to the side rails)
  for (const mY of [-0.045, -0.095, -0.145]) {
    for (const mSide of [-1, 1]) {
      const lugGeo = new THREE.BoxGeometry(0.007, 0.006, 0.007);
      const lug = new THREE.Mesh(lugGeo, materials.joint);
      lug.position.set(mSide * 0.025, mY, 0.024);
      armorGroup.add(lug);

      const boltGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0020, 6);
      const bolt = new THREE.Mesh(boltGeo, materials.joint);
      bolt.position.set(mSide * 0.026, mY, 0.027);
      bolt.rotation.x = Math.PI / 2;
      armorGroup.add(bolt);
    }
  }

  // Panel 3: Contoured Brachioradialis Armor Accent Plate
  const brachioShape = new THREE.Shape();
  brachioShape.moveTo(0, 0.055);
  brachioShape.quadraticCurveTo(0.014, 0.035, 0.015, 0);
  brachioShape.quadraticCurveTo(0.012, -0.045, 0, -0.065);
  brachioShape.quadraticCurveTo(-0.012, -0.045, -0.015, 0);
  brachioShape.quadraticCurveTo(-0.014, 0.035, 0, 0.055);
  brachioShape.closePath();

  const brachioGeo = new THREE.ExtrudeGeometry(brachioShape, {
    depth: 0.005,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.0020,
    bevelSegments: 3,
  });
  brachioGeo.center();

  const brachioradialis = new THREE.Mesh(brachioGeo, materials.armor);
  brachioradialis.name = 'BrachioradialisAccent';
  brachioradialis.position.set(side * 0.046, -0.068, 0.008);
  brachioradialis.rotation.y = side * (Math.PI / 2);
  brachioradialis.rotation.z = side * 0.05;
  brachioradialis.castShadow = true;
  armorGroup.add(brachioradialis);

  // Distal Wrist Collar Rim (White ceramic cuff framing wrist joint)
  const cuffGeo = new THREE.CylinderGeometry(0.040, 0.037, 0.014, 32);
  const wristCuff = new THREE.Mesh(cuffGeo, materials.armor);
  wristCuff.name = 'ForearmWristCuff';
  wristCuff.position.set(0, -0.176, 0);
  wristCuff.castShadow = true;
  wristCuff.receiveShadow = true;
  armorGroup.add(wristCuff);

  // Longitudinal Dark Technical Seam Channel
  const seamGeo = new THREE.BoxGeometry(0.0032, 0.130, 0.006);
  const panelSeam = new THREE.Mesh(seamGeo, materials.joint);
  panelSeam.name = 'ForearmPanelSeam';
  panelSeam.position.set(side * 0.047, -0.090, 0.004);
  armorGroup.add(panelSeam);

  // Embedded Violet LED Accent Strip inside Channel
  const ledGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.118, 12);
  const forearmLed = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  forearmLed.name = 'ForearmLedStrip';
  forearmLed.position.set(side * 0.048, -0.090, 0.004);
  armorGroup.add(forearmLed);
  ledMeshes.push(forearmLed);

  const innerSleeve = chassisSpine;

  return {
    group: forearmGroup,
    gauntletBody,
    innerSleeve,
    armorGroup,
    elbowSocketCollar,
    brachioradialis,
    wristCuff,
    panelSeam,
    ledMeshes,
  };
}
