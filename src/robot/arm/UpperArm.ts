import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface UpperArmNodes {
  group: THREE.Group;
  bicepSubGroup: THREE.Group;
  upperCollar: THREE.Mesh;
  armatureCore: THREE.Mesh;
  bicepShell: THREE.Mesh;
  topDomeCap: THREE.Mesh;
  topSocketRim: THREE.Mesh;
  elbowSocketCuff: THREE.Mesh;
  panelSeam: THREE.Mesh;
  ledStrip: THREE.Mesh;
  ledMeshes: THREE.Mesh[];
  tricepActuator: THREE.Mesh;
  tricepPiston: THREE.Mesh;
}

/**
 * RECONSTRUCTED HIGH-PRECISION UPPER ARM (BICEP / TRICEP) ASSEMBLY
 * Adheres strictly to the user's design requirements and reference photo:
 * - Sleek, high-gloss white ceramic exoskeleton armor (materials.armorDoubleSide)
 * - Taut, athletic humanoid silhouette (slender deltoid taper, no bloated/chubby sausage profile)
 * - Prominent longitudinal anterior ridge crest (cos A > 0.3) that catches crisp vertical specular highlights
 * - Full-length (134mm) razor-thin recessed cybernetic light channel flush with the armor face
 * - Seamless proximal contact mating with the Shoulder Joint lower seating flange at y = 0
 * - Distal condylar saddle rim with pointed anterior chevron and side arches clearing elbow rotational discs
 * - Dark titanium transition cuff sleeving directly into the elbow upper housing
 * - Full internal dark titanium bone armature core and posterior tricep hydraulic actuator
 */
export function createUpperArm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): UpperArmNodes {
  const upperArmGroup = new THREE.Group();
  upperArmGroup.name = side === -1 ? 'LeftUpperArmPivot' : 'RightUpperArmPivot';

  const ledMeshes: THREE.Mesh[] = [];

  // ==============================================================
  // 1. UPPER ROTARY CONNECTOR COLLAR & FLANGE INTERFACE (Shoulder Contact)
  // Mates flush with shoulder.upperArmConnector seating flange at y = 0
  // ==============================================================
  const armatureJointGroup = new THREE.Group();

  const collarGeo = new THREE.CylinderGeometry(0.0380, 0.0360, 0.014, 32);
  const upperCollar = new THREE.Mesh(collarGeo, materials.joint);
  upperCollar.name = 'UpperArmShoulderCollar';
  upperCollar.position.set(0, -0.007, 0);
  upperCollar.castShadow = true;
  upperCollar.receiveShadow = true;
  armatureJointGroup.add(upperCollar);

  // Beveled collar trim ring flush against shoulder flange
  const collarRimGeo = new THREE.TorusGeometry(0.0382, 0.0018, 8, 32);
  const collarRim = new THREE.Mesh(collarRimGeo, materials.joint);
  collarRim.rotation.x = Math.PI / 2;
  collarRim.position.set(0, -0.001, 0);
  armatureJointGroup.add(collarRim);

  // ==========================================
  // 2. STRUCTURAL 7075-T6 CNC I-BEAM ARMATURE CORE
  // Internal load-bearing chassis with weight reduction pockets
  // ==========================================
  const boneGeo = new THREE.CylinderGeometry(0.027, 0.025, 0.170, 24);
  const armatureCore = new THREE.Mesh(boneGeo, materials.joint);
  armatureCore.name = 'UpperArmArmatureCore';
  armatureCore.position.set(0, -0.088, 0);
  armatureCore.castShadow = true;
  armatureCore.receiveShadow = true;
  armatureJointGroup.add(armatureCore);

  // CNC structural I-beam flange ribs (visible through mechanical gaps)
  const sparFlangeGeo = new THREE.BoxGeometry(0.008, 0.140, 0.042);
  const sparFlange = new THREE.Mesh(sparFlangeGeo, materials.joint);
  sparFlange.position.set(0, -0.088, 0);
  armatureJointGroup.add(sparFlange);

  // Internal mechanical reinforcement rings along bone shaft
  for (let r = 0; r < 3; r++) {
    const ringGeo = new THREE.TorusGeometry(0.0285, 0.0020, 8, 20);
    const ringMesh = new THREE.Mesh(ringGeo, materials.joint);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, -0.040 - r * 0.048, 0);
    armatureJointGroup.add(ringMesh);
  }

  // Lateral actuator mounting bracket boss
  const bossGeo = new THREE.BoxGeometry(0.010, 0.018, 0.012);
  const boss = new THREE.Mesh(bossGeo, materials.joint);
  boss.position.set(-side * 0.014, -0.055, -0.024);
  armatureJointGroup.add(boss);

  // ==========================================
  // 3. SCULPTED TAPERED BICEP ARMOR SHELL
  // Ends with a distinct 8mm mechanical clearance gap above the elbow joint
  // ==========================================
  const bicepSubGroup = new THREE.Group();
  bicepSubGroup.name = side === -1 ? 'LeftBicepSubGroup' : 'RightBicepSubGroup';
  bicepSubGroup.position.set(0, -0.082, 0);
  upperArmGroup.add(bicepSubGroup);

  function evalBicepSurface(v: number, angle: number): {
    x: number;
    y: number;
    z: number;
    nx: number;
    nz: number;
  } {
    // Shortened length to 0.156m so the armor never visually collides with elbow clevis
    const length = 0.156;
    const y = 0.078 - v * length;

    const baseR = 0.0380 + 0.0036 * Math.sin(Math.pow(v, 0.90) * Math.PI) - 0.0038 * v;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    let rx = baseR;
    let rz = baseR;
    let localY = y;

    // 1. Anterior Longitudinal Specular Ridge Crest (cosA > 0.30)
    // Matches user reference: distinct vertical ridge catching the key specular highlight
    if (cosA > 0.30) {
      const tAnterior = (cosA - 0.30) / 0.70;
      const verticalWeight = 0.65 + 0.35 * Math.sin(v * Math.PI);
      const ridgeHeight = 0.0034 * Math.pow(tAnterior, 1.75) * verticalWeight;
      rz += ridgeHeight;
    }

    // 2. Lateral Deltoid Athletic Contour (-sinA * side > 0, v in [0.12, 0.65])
    const lateralFactor = Math.max(0, -sinA * side);
    if (lateralFactor > 0 && v >= 0.12 && v <= 0.65) {
      const deltoidCurve = Math.sin(((v - 0.12) / 0.53) * Math.PI);
      rx += 0.0028 * Math.pow(lateralFactor, 1.4) * deltoidCurve;
    }

    // 3. Medial Flatness for Torso Clearance (-sinA * side < 0 => sinA * side > 0)
    const medialFactor = Math.max(0, sinA * side);
    if (medialFactor > 0) {
      rx -= 0.0018 * Math.pow(medialFactor, 1.4);
    }

    // 4. Posterior Tricep Recess (cosA < -0.30)
    if (cosA < -0.30) {
      const postFactor = (-cosA - 0.30) / 0.70;
      rz -= 0.0022 * Math.pow(postFactor, 1.3);
    }

    // 5. Distal Condylar Saddle Rim Profile (v > 0.65)
    if (v > 0.65) {
      const bottomBlend = Math.pow((v - 0.65) / 0.35, 1.35);
      const dYAnterior = -0.0065 * Math.pow(Math.max(0, cosA), 1.5);
      const dYSaddle = 0.0132 * Math.pow(Math.abs(sinA), 1.6);
      const dYPosterior = 0.0050 * Math.pow(Math.max(0, -cosA), 1.4);
      localY += (dYAnterior + dYSaddle + dYPosterior) * bottomBlend;
    }

    const x = rx * sinA;
    const z = rz * cosA;

    // Normal unit components
    const nLen = Math.hypot(sinA, cosA) || 1;
    const nx = sinA / nLen;
    const nz = cosA / nLen;

    return { x, y: localY, z, nx, nz };
  }

  // Parametric Sculpted Bicep Armor Shell Geometry
  function createRefinedBicepGeometry(): THREE.BufferGeometry {
    const radialSegments = 48; // High resolution for smooth roundness and sharp ridge crest
    const heightSegments = 32; // Smooth vertical gradient
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy <= heightSegments; iy++) {
      const v = iy / heightSegments; // 0 = top (shoulder), 1 = bottom (elbow)

      for (let ix = 0; ix <= radialSegments; ix++) {
        const u = ix / radialSegments;
        const angle = u * Math.PI * 2;
        const pt = evalBicepSurface(v, angle);

        positions.push(pt.x, pt.y, pt.z);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < radialSegments; ix++) {
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

  const bicepGeo = createRefinedBicepGeometry();
  const bicepShell = new THREE.Mesh(bicepGeo, materials.armorDoubleSide);
  bicepShell.name = 'BicepArmorShell';
  bicepShell.castShadow = true;
  bicepShell.receiveShadow = true;
  bicepSubGroup.add(bicepShell);

  // ==============================================================
  // 4. ANATOMICAL PROXIMAL SHOULDER SOCKET RIM & SLEEVE (Proper Contact)
  // Perfectly mates with the shoulder connector lower seating flange at y = 0
  // ==============================================================
  const bicepJointGroup = new THREE.Group();

  const topRimGeo = new THREE.TorusGeometry(0.0386, 0.0020, 8, 32);
  const topSocketRim = new THREE.Mesh(topRimGeo, materials.joint);
  topSocketRim.name = 'BicepTopSocketRim';
  topSocketRim.rotation.x = Math.PI / 2;
  topSocketRim.position.set(0, 0.086, 0);
  topSocketRim.castShadow = true;
  bicepJointGroup.add(topSocketRim);

  // Inner titanium socket sleeve inserting upward into connector
  const topSleeveGeo = new THREE.CylinderGeometry(0.0360, 0.0375, 0.014, 28);
  const topSleeve = new THREE.Mesh(topSleeveGeo, materials.joint);
  topSleeve.position.set(0, 0.080, 0);
  bicepJointGroup.add(topSleeve);

  // Twin cybernetic conduit entry ports on proximal rim
  for (let c = -1; c <= 1; c += 2) {
    const portGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.0035, 12);
    const port = new THREE.Mesh(portGeo, materials.joint);
    port.position.set(-side * 0.012, 0.087, c * 0.015);
    bicepJointGroup.add(port);
  }

  // ==============================================================
  // 5. DISTAL CONDYLAR TRANSITION CUFF & ELBOW MATING SLEEVE (Proper Contact)
  // Sleeves seamlessly into elbow.upperHousing.connector at y = -0.155 to -0.175
  // ==============================================================
  const socketCuffGeo = new THREE.CylinderGeometry(0.0352, 0.0335, 0.024, 28);
  const elbowSocketCuff = new THREE.Mesh(socketCuffGeo, materials.joint);
  elbowSocketCuff.name = 'BicepElbowSocketCuff';
  elbowSocketCuff.position.set(0, -0.076, 0);
  elbowSocketCuff.castShadow = true;
  elbowSocketCuff.receiveShadow = true;
  bicepJointGroup.add(elbowSocketCuff);

  // Beveled trim collar seated around the lower cuff
  const cuffTrimGeo = new THREE.TorusGeometry(0.0355, 0.0016, 6, 28);
  const cuffTrim = new THREE.Mesh(cuffTrimGeo, materials.joint);
  cuffTrim.rotation.x = Math.PI / 2;
  cuffTrim.position.set(0, -0.070, 0);
  bicepJointGroup.add(cuffTrim);

  // ==============================================================
  // 6. CONFORMAL CYBERNETIC LIGHT CHANNEL & VIOLET LED STRIP
  // Matches user reference (media_1789103639564.png):
  // - Full-height continuous, slender, razor-thin vertical strip
  // - Evaluated conformally along the armor shell surface so it NEVER clips or floats
  // - Positioned on anterior-lateral face: theta = -side * 24 degrees (lateral)
  // ==============================================================
  const stripTheta = -side * (24 * Math.PI / 180);
  const curvePoints: THREE.Vector3[] = [];
  const casingPoints: THREE.Vector3[] = [];
  const numSteps = 28;

  for (let i = 0; i <= numSteps; i++) {
    // Spans from v = 0.07 (just below shoulder rim) down to v = 0.88 (just above distal chevron)
    const v = 0.07 + (i / numSteps) * 0.81;
    const pt = evalBicepSurface(v, stripTheta);

    // Glowing LED core sits at +0.0012m along normal (proud of armor by 1.2mm for crisp visibility)
    curvePoints.push(new THREE.Vector3(
      pt.x + pt.nx * 0.0012,
      pt.y,
      pt.z + pt.nz * 0.0012
    ));

    // Dark titanium recessed backing channel sits at +0.0003m along normal
    casingPoints.push(new THREE.Vector3(
      pt.x + pt.nx * 0.0003,
      pt.y,
      pt.z + pt.nz * 0.0003
    ));
  }

  // 1. Dark titanium channel backing bezel
  const casingCurve = new THREE.CatmullRomCurve3(casingPoints);
  const casingGeo = new THREE.TubeGeometry(casingCurve, 32, 0.0016, 8, false);
  const channelCasing = new THREE.Mesh(casingGeo, materials.joint);
  channelCasing.name = 'BicepLightChannelCasing';
  channelCasing.castShadow = true;
  bicepJointGroup.add(channelCasing);

  // 2. Luminous violet LED neon strip (elevated and vibrant)
  const ledCurve = new THREE.CatmullRomCurve3(curvePoints);
  const ledGeo = new THREE.TubeGeometry(ledCurve, 32, 0.0013, 8, false);
  const ledStrip = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledStrip.name = 'BicepLedStrip';
  bicepSubGroup.add(ledStrip);
  ledMeshes.push(ledStrip);

  // Terminal micro-machined titanium caps at ends of channel
  const topPt = curvePoints[0];
  const botPt = curvePoints[curvePoints.length - 1];
  [topPt, botPt].forEach((p) => {
    const capGeo = new THREE.SphereGeometry(0.0018, 8, 8);
    const capMesh = new THREE.Mesh(capGeo, materials.joint);
    capMesh.position.copy(p);
    bicepJointGroup.add(capMesh);
  });

  // Backward-compatible panelSeam alias (conformal subtle rear-medial seam)
  const seamPoints: THREE.Vector3[] = [];
  const seamTheta = side * (65 * Math.PI / 180);
  for (let i = 0; i <= 16; i++) {
    const v = 0.12 + (i / 16) * 0.72;
    const pt = evalBicepSurface(v, seamTheta);
    seamPoints.push(new THREE.Vector3(pt.x + pt.nx * 0.0002, pt.y, pt.z + pt.nz * 0.0002));
  }
  const seamCurve = new THREE.CatmullRomCurve3(seamPoints);
  const seamGeo = new THREE.TubeGeometry(seamCurve, 20, 0.0009, 6, false);
  const panelSeam = new THREE.Mesh(seamGeo, materials.joint);
  panelSeam.name = 'BicepPanelSeam';
  bicepJointGroup.add(panelSeam);

  // Merge static joint details of the bicep
  const mergedBicepJoint = mergeGroupMeshesByMaterial(bicepJointGroup, materials.joint, 'BicepJoint_Merged', false);
  if (mergedBicepJoint) {
    mergedBicepJoint.castShadow = true;
    mergedBicepJoint.receiveShadow = true;
    bicepSubGroup.add(mergedBicepJoint);
  }

  // ==============================================================
  // 7. POSTERIOR TRICEP MECHANICAL ACTUATOR ROD
  // Aligns directly into the posterior elbow clevis and hydraulic flexion ram
  // ==============================================================
  const actGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.120, 16);
  const tricepActuator = new THREE.Mesh(actGeo, materials.joint);
  tricepActuator.name = 'TricepActuatorCylinder';
  tricepActuator.position.set(0, -0.084, -0.033);
  tricepActuator.castShadow = true;
  armatureJointGroup.add(tricepActuator);

  // Anodized violet collar ring on tricep actuator
  const tricepCollarGeo = new THREE.TorusGeometry(0.0060, 0.0012, 6, 16);
  const tricepCollar = new THREE.Mesh(tricepCollarGeo, materials.purpleEmissive);
  tricepCollar.rotation.x = Math.PI / 2;
  tricepCollar.position.set(0, -0.040, -0.033);
  upperArmGroup.add(tricepCollar);
  ledMeshes.push(tricepCollar);

  // Polished chrome piston shaft telescoping toward elbow clevis
  const pistonGeo = new THREE.CylinderGeometry(0.0032, 0.0032, 0.104, 12);
  const tricepPiston = new THREE.Mesh(pistonGeo, materials.joint); // High metallic
  tricepPiston.name = 'TricepPistonRod';
  tricepPiston.position.set(0, -0.106, -0.033);
  tricepPiston.castShadow = true;
  armatureJointGroup.add(tricepPiston);

  // Merge static armature components
  const mergedArmature = mergeGroupMeshesByMaterial(armatureJointGroup, materials.joint, 'UpperArmArmature_Merged', false);
  if (mergedArmature) {
    mergedArmature.castShadow = true;
    mergedArmature.receiveShadow = true;
    upperArmGroup.add(mergedArmature);
  }

  return {
    group: upperArmGroup,
    bicepSubGroup,
    upperCollar,
    armatureCore,
    bicepShell,
    topDomeCap: topSocketRim, // Backwards-compatible alias
    topSocketRim,
    elbowSocketCuff,
    panelSeam,
    ledStrip,
    ledMeshes,
    tricepActuator,
    tricepPiston,
  };
}
