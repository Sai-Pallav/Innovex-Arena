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
 * Creates a high-precision, sculpted robotic forearm gauntlet.
 * Adheres strictly to the futuristic cybernetic design language:
 * - Sculpted aerodynamic gauntlet with smooth ergonomic taper towards wrist
 * - Anatomical lateral brachioradialis contour seamlessly blended into armor
 * - Beveled upper elbow socket collar that cleanly encloses the hinge joint
 * - Zero hollow voids, zero clipping prongs, zero jagged edges
 * - Recessed technical panel seam channel with glowing purple LED strip
 * - Precision-machined distal wrist cuff
 */
export function createForearm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ForearmNodes {
  const forearmGroup = new THREE.Group();
  forearmGroup.name = side === -1 ? 'LeftForearmArmor' : 'RightForearmArmor';

  const ledMeshes: THREE.Mesh[] = [];

  // 1. Sculpted White Ceramic Forearm Gauntlet Geometry
  // Generates a smooth, anatomically contoured exoskeleton armor shell
  function createGauntletGeometry(): THREE.BufferGeometry {
    const radialSegments = 36;
    const heightSegments = 24;
    const length = 0.180; // Total gauntlet length
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy <= heightSegments; iy++) {
      const v = iy / heightSegments; // 0 = top (elbow), 1 = bottom (wrist)
      const y = -0.006 - v * length;

      // Base radius interpolation: 0.050 at elbow tapering to 0.038 at wrist
      const baseRadiusX = 0.049 - 0.012 * v;
      const baseRadiusZ = 0.047 - 0.011 * v;

      for (let ix = 0; ix <= radialSegments; ix++) {
        const u = ix / radialSegments;
        const angle = u * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Anatomical sculpting:
        // Lateral side (sinA * side > 0) has brachioradialis muscular fullness
        let rX = baseRadiusX;
        let rZ = baseRadiusZ;

        // Subtle lateral flare in upper-mid forearm (brachioradialis curve)
        const lateralFactor = Math.max(0, sinA * side);
        if (lateralFactor > 0 && v < 0.70) {
          const flareCurve = Math.sin((v / 0.70) * Math.PI);
          rX += 0.0065 * lateralFactor * flareCurve;
          rZ += 0.0040 * lateralFactor * flareCurve;
        }

        // Anterior slight flattened chamfer (front facing +Z)
        const anteriorFactor = Math.max(0, cosA);
        if (anteriorFactor > 0.4) {
          rZ *= 0.96;
        }

        // Top elbow socket rim contour: scalloped saddle curve dipping laterally/medially and anteriorly
        // (Reference: ELBOW OVERVIEW -> Exploded View & Side View)
        // Provides clean, continuous 3.5mm clearance around the lower housing and side rotational discs
        let localY = y;
        if (v < 0.25) {
          const topBlend = Math.pow(1.0 - (v / 0.25), 1.35);
          // Lateral and medial saddle dip for the circular side rotational discs
          const lateralSaddleDip = 0.016 * Math.pow(Math.abs(sinA), 1.25);
          // Anterior flexion dip for clearance during acute bend
          const anteriorDip = 0.008 * Math.max(0, cosA);
          localY -= (lateralSaddleDip + anteriorDip) * topBlend;
        }

        const x = rX * sinA;
        const z = rZ * cosA;

        positions.push(x, localY, z);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < heightSegments; iy++) {
      const vMid = (iy + 0.5) / heightSegments;
      for (let ix = 0; ix < radialSegments; ix++) {
        const uMid = (ix + 0.5) / radialSegments;
        const ang = uMid * Math.PI * 2;
        const sinMid = Math.sin(ang);

        // Open structural side windows exposing internal spaceframe & actuators (Blueprint Panel 5)
        const isSideWindow = vMid > 0.18 && vMid < 0.82 && Math.abs(sinMid) > 0.56;
        if (isSideWindow) {
          continue;
        }

        const a = iy * (radialSegments + 1) + ix;
        const b = (iy + 1) * (radialSegments + 1) + ix;
        const c = (iy + 1) * (radialSegments + 1) + (ix + 1);
        const d = iy * (radialSegments + 1) + (ix + 1);
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

  const armorGroup = new THREE.Group();
  armorGroup.name = 'ForearmArmorGroup';
  forearmGroup.add(armorGroup);

  const gauntletGeo = createGauntletGeometry();
  const gauntletBody = new THREE.Mesh(gauntletGeo, materials.armorDoubleSide);
  gauntletBody.name = 'GauntletArmorBody';
  gauntletBody.castShadow = true;
  gauntletBody.receiveShadow = true;
  armorGroup.add(gauntletBody);

  const forearmJointGroup = new THREE.Group();

  // 2. INTERNAL 7075-T6 TRIANGULATED CNC SPACEFRAME CHASSIS
  // Real mechanical truss replacing solid cylinder, visible through armor cutouts
  const chassisSpineGeo = new THREE.BoxGeometry(0.032, 0.170, 0.034);
  const chassisSpine = new THREE.Mesh(chassisSpineGeo, materials.joint);
  chassisSpine.name = 'ForearmChassisSpine';
  chassisSpine.position.set(0, -0.092, 0);
  chassisSpine.castShadow = true;
  forearmJointGroup.add(chassisSpine);

  // Longitudinal CNC structural spars (Lateral and Medial)
  for (let s = -1; s <= 1; s += 2) {
    const sparGeo = new THREE.BoxGeometry(0.005, 0.160, 0.010);
    const spar = new THREE.Mesh(sparGeo, materials.joint);
    spar.position.set(s * 0.024, -0.092, 0);
    forearmJointGroup.add(spar);
  }

  // Triangulated diagonal cross-brace ribs
  for (let r = 0; r < 3; r++) {
    const braceGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.046, 8);
    braceGeo.rotateZ(Math.PI / 4 * (r % 2 === 0 ? 1 : -1));
    const brace = new THREE.Mesh(braceGeo, materials.joint);
    brace.position.set(0, -0.045 - r * 0.045, 0);
    forearmJointGroup.add(brace);
  }

  // 3. DUAL INVERTED ROLLER-SCREW LINEAR ACTUATORS (Blueprint Panel 5)
  // Parallel mechanical pushrod cylinders driving wrist pitch & yaw, centered in open windows
  for (let a = -1; a <= 1; a += 2) {
    // Actuator Pressure Cylinder (Dark gunmetal)
    const actCylGeo = new THREE.CylinderGeometry(0.0062, 0.0062, 0.078, 16);
    const actCyl = new THREE.Mesh(actCylGeo, materials.joint);
    actCyl.position.set(a * 0.022, -0.070, 0.000);
    actCyl.castShadow = true;
    forearmJointGroup.add(actCyl);

    // Chrome telescopic pushrod shaft
    const rodGeo = new THREE.CylinderGeometry(0.0036, 0.0036, 0.072, 12);
    const rod = new THREE.Mesh(rodGeo, materials.joint);
    rod.position.set(a * 0.022, -0.130, 0.000);
    rod.castShadow = true;
    forearmJointGroup.add(rod);

    // Anodized violet collar ring
    const collarGeo = new THREE.TorusGeometry(0.0066, 0.0012, 6, 16);
    const collar = new THREE.Mesh(collarGeo, materials.purpleEmissive);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(a * 0.022, -0.045, 0.000);
    forearmGroup.add(collar);
    ledMeshes.push(collar);
  }

  // Central Wrist Roll Hollow Drive Tube (Carbon fiber / titanium pass-through)
  const driveTubeGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.168, 16);
  const driveTube = new THREE.Mesh(driveTubeGeo, materials.joint);
  driveTube.position.set(0, -0.092, -0.004);
  forearmJointGroup.add(driveTube);

  // Braided Cybernetic Wiring Conduit Harness
  const conduitGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.160, 10);
  const conduit = new THREE.Mesh(conduitGeo, materials.joint);
  conduit.position.set(-side * 0.018, -0.092, -0.014);
  forearmJointGroup.add(conduit);

  const innerSleeve = chassisSpine; // Backwards-compatible alias

  // 3. Upper Elbow Socket Transition Collar (Sleek dark titanium cup receiving the lower joint housing)
  const collarGeo = new THREE.CylinderGeometry(0.043, 0.041, 0.016, 32);
  const elbowSocketCollar = new THREE.Mesh(collarGeo, materials.joint);
  elbowSocketCollar.name = 'ForearmElbowSocketCollar';
  elbowSocketCollar.position.set(0, -0.012, 0);
  elbowSocketCollar.castShadow = true;
  elbowSocketCollar.receiveShadow = true;
  forearmJointGroup.add(elbowSocketCollar);

  // Smooth trim rim on elbow collar
  const socketRimGeo = new THREE.TorusGeometry(0.042, 0.0022, 10, 32);
  const socketRim = new THREE.Mesh(socketRimGeo, materials.joint);
  socketRim.rotation.x = Math.PI / 2;
  socketRim.position.set(0, -0.005, 0);
  forearmJointGroup.add(socketRim);

  // 4. Contoured Brachioradialis Armor Accent Plate (Flush, smoothly chamfered lateral contour)
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
  brachioradialis.position.set(side * 0.048, -0.064, 0.010);
  brachioradialis.rotation.y = side * (Math.PI / 2);
  brachioradialis.rotation.z = side * 0.05;
  brachioradialis.castShadow = true;
  armorGroup.add(brachioradialis);

  // 5. Distal Wrist Collar Rim (White ceramic cuff framing wrist joint)
  const cuffGeo = new THREE.CylinderGeometry(0.042, 0.039, 0.016, 32);
  const wristCuff = new THREE.Mesh(cuffGeo, materials.armor);
  wristCuff.name = 'ForearmWristCuff';
  wristCuff.position.set(0, -0.178, 0);
  wristCuff.castShadow = true;
  wristCuff.receiveShadow = true;
  armorGroup.add(wristCuff);

  // Inner dark titanium wrist socket ring
  const wristSocketGeo = new THREE.CylinderGeometry(0.038, 0.036, 0.018, 28);
  const wristSocket = new THREE.Mesh(wristSocketGeo, materials.joint);
  wristSocket.position.set(0, -0.180, 0);
  forearmJointGroup.add(wristSocket);

  // Merge static joint elements of the forearm
  const mergedForearmJoint = mergeGroupMeshesByMaterial(forearmJointGroup, materials.joint, 'ForearmJoint_Merged', false);
  if (mergedForearmJoint) {
    mergedForearmJoint.castShadow = true;
    mergedForearmJoint.receiveShadow = true;
    forearmGroup.add(mergedForearmJoint);
  }

  // 6. Longitudinal Dark Technical Seam Channel
  const seamGeo = new THREE.BoxGeometry(0.0032, 0.130, 0.006);
  const panelSeam = new THREE.Mesh(seamGeo, materials.joint);
  panelSeam.name = 'ForearmPanelSeam';
  panelSeam.position.set(side * 0.049, -0.088, 0.004);
  armorGroup.add(panelSeam);

  // 7. Embedded Violet LED Accent Strip inside Channel
  const ledGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.118, 12);
  const forearmLed = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  forearmLed.name = 'ForearmLedStrip';
  forearmLed.position.set(side * 0.050, -0.088, 0.004);
  armorGroup.add(forearmLed);
  ledMeshes.push(forearmLed);

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
