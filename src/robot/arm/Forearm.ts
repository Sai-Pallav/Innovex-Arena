/**
 * ============================================================================
 * FOREARM MODULE — GAUNTLET & MECHANICAL CORE (AAA PRODUCTION SPECIFICATION)
 * ============================================================================
 *
 * Exact mechanical and hard-surface CAD reconstruction adhering strictly to:
 * - Reference Image 2: Wide under-elbow mass, continuous taper to wrist,
 *   exposed dark spaceframe core, and front-outer recessed purple LED accent.
 * - Corrections 14 to 18: Forearm volume, multi-piece white armor, visible
 *   dark titanium core, recessed longitudinal purple LED, and distinct wrist taper.
 *
 * Architecture:
 *   elbow.forearmPivot (Parent rotation pivot for elbow flexion)
 *     │
 *     ▼
 *   forearmMechanicalCore (Dark titanium structural spine + dual flexor actuators + cable conduit)
 *     │
 *     ▼
 *   forearmWhiteArmor (Multi-piece ceramic composite gauntlet: anterior + lateral + posterior)
 *     │
 *     ▼
 *   forearmVentilationChannel & purpleAccent (Recessed front-outer channel + purple LED rod)
 *     │
 *     ▼
 *   distalWristMount (Precision machined cuff interfacing with Wrist.ts)
 * ============================================================================
 */

import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

export interface ForearmNodes {
  group: THREE.Group;
  mechanicalCore: THREE.Group;
  armatureSpine: THREE.Mesh;
  armorGroup: THREE.Group;
  anteriorArmor: THREE.Mesh;
  posteriorArmor: THREE.Mesh;
  sideArmor?: THREE.Mesh;
  innerArmor?: THREE.Mesh;
  ventilationChannel: THREE.Group;
  ledStrip: THREE.Mesh;
  ledMeshes: THREE.Mesh[];
  distalWristMount: THREE.Group;
  wristCuff: THREE.Mesh;
  // Compatibility aliases
  gauntletBody: THREE.Mesh;
  innerSleeve: THREE.Mesh;
  elbowSocketCollar: THREE.Mesh;
  brachioradialis: THREE.Mesh;
  panelSeam: THREE.Mesh;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCULPTED FOREARM ARMOR GEOMETRY (CORRECTIONS 14, 15, 18)
// Wide near elbow, sleek continuous taper to wrist, real 3.5mm wall thickness.
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 1. COHERENT FOREARM GAUNTLET ARMOR GEOMETRY (SECTIONS 10, 11, 12, 15, 16)
// Coherent volumetric gauntlet, wide under-elbow mass, continuous taper to wrist.
// ─────────────────────────────────────────────────────────────────────────────
function createForearmCoherentArmor(
  shellType: 'primaryOuter' | 'secondaryInner',
  side: -1 | 1
): THREE.BufferGeometry {
  const radialSegs = 32;
  const heightSegs = 30;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const yTop = -0.006; // Originates directly flush at elbow lower housing collar (Y = -0.020m in forearmPivot)
  const totalLength = 0.138; // Terminating identically at y = -0.144m to house dedicated wrist module (length strictly preserved)
  const thickness = 0.0026;  // 2.6 mm real physical wall thickness

  let startAngle = 0;
  let endAngle = 0;

  if (side === 1) {
    if (shellType === 'primaryOuter') {
      startAngle = -0.16 * Math.PI;
      endAngle = 0.82 * Math.PI;
    } else {
      startAngle = 0.86 * Math.PI;
      endAngle = 1.80 * Math.PI;
    }
  } else {
    if (shellType === 'primaryOuter') {
      startAngle = 0.16 * Math.PI;
      endAngle = -0.82 * Math.PI;
    } else {
      startAngle = -0.86 * Math.PI;
      endAngle = -1.80 * Math.PI;
    }
  }

  function evaluateSurface(layer: 0 | 1, iy: number, ix: number): THREE.Vector3 {
    const v = iy / heightSegs;
    const u = ix / radialSegs;
    let y = yTop - v * totalLength;

    // Athletic humanoid mecha gauntlet taper: under-elbow width ~63mm down to wrist ~48mm
    // Harmoniously proportioned with upper arm bicep (~65mm) and elbow lower collar (~63mm)
    let radius = 0.0315 - 0.0075 * v + 0.0016 * Math.sin(Math.pow(v, 0.65) * Math.PI);

    if (v < 0.12) {
      // Inward chamfer at proximal elbow rim to seamlessly dock with lowCollar
      const tTop = (0.12 - v) / 0.12;
      radius -= tTop * 0.0006;
    } else if (v > 0.85) {
      // Inward socket bevel at distal wrist rim (\______/ )
      const tBot = (v - 0.85) / 0.15;
      radius -= tBot * 0.0010;
    }

    const angle = startAngle + u * (endAngle - startAngle);
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);

    // Both width (rx) and depth (rz) taper gradually to create the sculpted athletic profile
    let rx = radius * 0.98; // medial-lateral width (~61.7mm at elbow -> ~47.0mm at wrist)
    let rz = radius * 0.95; // anterior-posterior depth (~59.8mm at elbow -> ~45.6mm at wrist)

    // 3D Facet Crowning & Crisp 45° Corner Chamfers (Eliminates flat sleeve appearance)
    if (shellType === 'primaryOuter') {
      if (cosA > 0.52) {
        // Central anterior facet: prominent crowned curvature (convex aerodynamic arch)
        const tCenter = (cosA - 0.52) / 0.48;
        rz -= (1.0 - Math.pow(tCenter, 1.4) * 0.40) * 0.0024;
      } else if (cosA > 0.15) {
        // Crisp 45° chamfered corner bevel connecting front and lateral faces
        const tChamfer = (cosA - 0.15) / 0.37;
        rx -= Math.sin(tChamfer * Math.PI) * 0.0016;
        rz -= (1.0 - tChamfer) * 0.0018;
      }
    }

    // Posterior dorsal flexor contour
    if (shellType === 'secondaryInner') {
      if (cosA < -0.40) {
        const tPost = (-cosA - 0.40) / 0.60;
        rz += Math.pow(tPost, 1.3) * 0.0018 * Math.sin(v * Math.PI * 0.85);
      } else if (cosA < 0) {
        const tChamfer = (-cosA) / 0.40;
        rx -= Math.sin(tChamfer * Math.PI) * 0.0010;
      }
    }

    // Proximal Forearm Elbow Transition (subtle chevron crest cleanly seating under cowl)
    if (v < 0.22) {
      const tElbow = (0.22 - v) / 0.22;
      const frontBias = Math.max(0, (cosA - 0.20) / 0.80);
      const sideBias = 1.0 - frontBias;
      // Front center facet reaches upward into sleek chevron crest towards elbow joint
      y += frontBias * 0.0040 * tElbow;
      rz += frontBias * 0.0008 * tElbow;
      // Lateral and medial sides smoothly funnel to meet the mechanical hinge width
      y -= sideBias * 0.0012 * tElbow;
      rx -= sideBias * 0.0005 * Math.pow(tElbow, 1.2);
    }

    // Distal Wrist Transition Socket (terminates in engineered collar socket)
    if (v > 0.85) {
      const tWrist = (v - 0.85) / 0.15;
      rx -= tWrist * 0.0008;
      rz -= tWrist * 0.0009;
    }

    const rFactor = layer === 0 ? 1.0 : (1.0 - thickness / Math.max(rx, rz));

    return new THREE.Vector3(
      rFactor * rx * sinA,
      y,
      rFactor * rz * cosA
    );
  }

  // 1. Generate Vertices for Outer Shell (layer 0) and Inner Shell (layer 1)
  for (let layer = 0; layer <= 1; layer++) {
    for (let iy = 0; iy <= heightSegs; iy++) {
      for (let ix = 0; ix <= radialSegs; ix++) {
        const p = evaluateSurface(layer as 0 | 1, iy, ix);
        positions.push(p.x, p.y, p.z);
        uvs.push(ix / radialSegs, iy / heightSegs);
      }
    }
  }

  const layerStride = (heightSegs + 1) * (radialSegs + 1);

  // 2. Generate Triangles for Outer Surface
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = iy * (radialSegs + 1) + ix;
      const b = a + 1;
      const c = a + (radialSegs + 1);
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

  // 3. Generate Triangles for Inner Surface
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = layerStride + iy * (radialSegs + 1) + ix;
      const b = a + 1;
      const c = a + (radialSegs + 1);
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

  // 4. Perimeter Edge Walls (watertight bevel borders)
  for (let ix = 0; ix < radialSegs; ix++) {
    const oA = ix;
    const oB = ix + 1;
    const iA = layerStride + ix;
    const iB = layerStride + ix + 1;
    if (side === 1) {
      indices.push(oA, oB, iA);
      indices.push(oB, iB, iA);
    } else {
      indices.push(oA, iA, oB);
      indices.push(oB, iA, iB);
    }
  }

  const botRow = heightSegs * (radialSegs + 1);
  for (let ix = 0; ix < radialSegs; ix++) {
    const oA = botRow + ix;
    const oB = botRow + ix + 1;
    const iA = layerStride + botRow + ix;
    const iB = layerStride + botRow + ix + 1;
    if (side === 1) {
      indices.push(oA, iA, oB);
      indices.push(oB, iA, iB);
    } else {
      indices.push(oA, oB, iA);
      indices.push(oB, iB, iA);
    }
  }

  for (let iy = 0; iy < heightSegs; iy++) {
    const oA0 = iy * (radialSegs + 1);
    const oC0 = (iy + 1) * (radialSegs + 1);
    const iA0 = layerStride + oA0;
    const iC0 = layerStride + oC0;
    if (side === 1) {
      indices.push(oA0, iA0, oC0);
      indices.push(oC0, iA0, iC0);
    } else {
      indices.push(oA0, oC0, iA0);
      indices.push(oC0, iC0, iA0);
    }

    const oA1 = iy * (radialSegs + 1) + radialSegs;
    const oC1 = (iy + 1) * (radialSegs + 1) + radialSegs;
    const iA1 = layerStride + oA1;
    const iC1 = layerStride + oC1;
    if (side === 1) {
      indices.push(oA1, oC1, iA1);
      indices.push(oC1, iC1, iA1);
    } else {
      indices.push(oA1, iA1, oC1);
      indices.push(oC1, iA1, iC1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MAIN FOREARM ASSEMBLY BUILDER
// ─────────────────────────────────────────────────────────────────────────────
export function createForearm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ForearmNodes {
  const forearmGroup = new THREE.Group();
  forearmGroup.name = side === -1 ? 'LeftForearmAssembly' : 'RightForearmAssembly';

  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================================================
  // SECTION 1: DARK STRUCTURAL MECHANICAL CORE (CORRECTION 16)
  // Titanium load-bearing spaceframe visually connecting ELBOW → FOREARM → WRIST
  // ==========================================================================
  const mechanicalCore = new THREE.Group();
  mechanicalCore.name = side === -1 ? 'LeftForearmMechanicalCore' : 'RightForearmMechanicalCore';
  forearmGroup.add(mechanicalCore);

  // 1. Proximal Elbow Docking Collar (interfaces with Elbow lower housing)
  const dockGeo = new THREE.CylinderGeometry(0.0295, 0.0310, 0.016, 28);
  const elbowSocketCollar = new THREE.Mesh(dockGeo, materials.joint);
  elbowSocketCollar.name = 'ForearmElbowSocketCollar';
  elbowSocketCollar.position.set(0, -0.008, 0);
  elbowSocketCollar.castShadow = true;
  mechanicalCore.add(elbowSocketCollar);

  // 2. Main Structural Column / Spaceframe Spine
  const spineGeo = new THREE.BoxGeometry(0.018, 0.149, 0.022);
  const armatureSpine = new THREE.Mesh(spineGeo, materials.joint);
  armatureSpine.name = 'ForearmArmatureSpine';
  armatureSpine.position.set(0, -0.0815, 0);
  armatureSpine.castShadow = true;
  armatureSpine.receiveShadow = true;
  mechanicalCore.add(armatureSpine);

  // CNC Weight-Reduction Cutouts on Spine
  for (let c = 0; c < 4; c++) {
    const cavGeo = new THREE.BoxGeometry(0.020, 0.018, 0.016);
    const cav = new THREE.Mesh(cavGeo, materials.joint);
    cav.position.set(0, -0.042 - c * 0.024, 0);
    mechanicalCore.add(cav);
  }

  // 3. Substantial Bilateral Linear Flexor Actuator Cylinders & Chrome Piston Rods
  // Compacted load-bearing actuators nestled inside gauntlet spaceframe
  for (const aSide of [-1, 1]) {
    const actCylGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.050, 16);
    const actCyl = new THREE.Mesh(actCylGeo, materials.joint);
    actCyl.position.set(aSide * 0.010, -0.066, 0.007);
    actCyl.castShadow = true;
    mechanicalCore.add(actCyl);

    const actRingGeo = new THREE.TorusGeometry(0.0044, 0.0008, 6, 16);
    const actRing = new THREE.Mesh(actRingGeo, materials.metallic);
    actRing.position.set(aSide * 0.010, -0.052, 0.007);
    mechanicalCore.add(actRing);

    const pistonGeo = new THREE.CylinderGeometry(0.0024, 0.0024, 0.054, 14);
    const piston = new THREE.Mesh(pistonGeo, materials.metallic);
    piston.position.set(aSide * 0.010, -0.110, 0.007);
    piston.castShadow = true;
    mechanicalCore.add(piston);
  }

  // 4. Internal Protected Cable Conduit Raceway
  const cableConduitGeo = new THREE.CylinderGeometry(0.0024, 0.0024, 0.141, 10);
  const cableConduit = new THREE.Mesh(cableConduitGeo, materials.joint);
  cableConduit.position.set(0, -0.0815, -0.009);
  cableConduit.castShadow = true;
  mechanicalCore.add(cableConduit);

  // 5. Distal Wrist Interface Mount (Receives Dedicated Wrist Module at Y = -0.151m for balanced proportions)
  const distalWristMount = new THREE.Group();
  distalWristMount.name = side === -1 ? 'LeftDistalWristMount' : 'RightDistalWristMount';
  distalWristMount.position.set(0, -0.151, 0);
  mechanicalCore.add(distalWristMount);

  const cuffGeo = new THREE.CylinderGeometry(0.0230, 0.0238, 0.010, 28);
  const wristCuff = new THREE.Mesh(cuffGeo, materials.joint);
  wristCuff.name = 'ForearmWristCuff';
  wristCuff.position.set(0, 0.005, 0);
  wristCuff.castShadow = true;
  wristCuff.receiveShadow = true;
  distalWristMount.add(wristCuff);

  const cuffRimGeo = new THREE.TorusGeometry(0.0234, 0.0008, 6, 28);
  cuffRimGeo.rotateX(Math.PI / 2);
  const cuffRim = new THREE.Mesh(cuffRimGeo, materials.metallic);
  cuffRim.position.set(0, 0.009, 0);
  distalWristMount.add(cuffRim);

  // Forearm -> Wrist Tapered Transition Collar (Interlocks with dedicated wrist housing)
  const collarGeo = new THREE.CylinderGeometry(0.0232, 0.0238, 0.006, 28);
  const transitionCollar = new THREE.Mesh(collarGeo, materials.joint);
  transitionCollar.name = 'ForearmWristTransitionCollar';
  transitionCollar.position.set(0, -0.148, 0);
  transitionCollar.castShadow = true;
  forearmGroup.add(transitionCollar);

  const collarRingGeo = new THREE.TorusGeometry(0.0235, 0.0008, 6, 28);
  collarRingGeo.rotateX(Math.PI / 2);
  const collarRing = new THREE.Mesh(collarRingGeo, materials.metallic);
  collarRing.position.set(0, -0.148, 0);
  forearmGroup.add(collarRing);

  // ==========================================================================
  // SECTION 2: SCULPTED WHITE CERAMIC COHERENT GAUNTLET (SECTIONS 10, 11, 12)
  // Single coherent armored volume: primary outer shell + secondary inner shell
  // ==========================================================================
  const armorGroup = new THREE.Group();
  armorGroup.name = side === -1 ? 'LeftForearmArmorGroup' : 'RightForearmArmorGroup';
  forearmGroup.add(armorGroup);

  // 1. Primary Outer Shell (Anterior face + lateral gauntlet + Lower Elbow Guard)
  const outerGeo = createForearmCoherentArmor('primaryOuter', side);
  const anteriorArmor = new THREE.Mesh(outerGeo, materials.armorDoubleSide);
  anteriorArmor.name = 'ForearmPrimaryOuterArmorShell';
  anteriorArmor.castShadow = true;
  anteriorArmor.receiveShadow = true;
  armorGroup.add(anteriorArmor);

  // 2. Secondary Inner Shell (Medial + Posterior flexor volume)
  const innerGeo = createForearmCoherentArmor('secondaryInner', side);
  const posteriorArmor = new THREE.Mesh(innerGeo, materials.armorDoubleSide);
  posteriorArmor.name = 'ForearmSecondaryInnerArmorShell';
  posteriorArmor.castShadow = true;
  posteriorArmor.receiveShadow = true;
  armorGroup.add(posteriorArmor);

  const sideArmor = anteriorArmor;
  const innerArmor = posteriorArmor;

  // Proximal compression gasket seal ring mating flush to elbow lower collar
  const proxGasketGeo = new THREE.TorusGeometry(0.0312, 0.0008, 6, 32);
  proxGasketGeo.rotateX(Math.PI / 2);
  const proxGasket = new THREE.Mesh(proxGasketGeo, materials.joint);
  proxGasket.name = 'ForearmProximalElbowGasket';
  proxGasket.position.set(0, -0.006, 0);
  armorGroup.add(proxGasket);

  // ==========================================================================
  // SECTION 3: INTEGRATED TECHNICAL PANEL & PURPLE EMISSIVE DETAIL (SECTION 16)
  // WHITE ARMOR → DARK RECESS → PURPLE EMISSIVE ELEMENT → THIN BEZEL
  // Perfectly sunken flush into the sculpted armor facet with ZERO clipping
  // ==========================================================================
  const techBayGroup = new THREE.Group();
  techBayGroup.name = 'ForearmStandardizedTechBay';
  // Positioned flush on the anterior facet at y = -0.080m, z = 0.0258m
  const bayX = side * 0.0010;
  const bayZ = 0.0258;
  const bayY = -0.080;
  techBayGroup.position.set(bayX, bayY, bayZ);
  armorGroup.add(techBayGroup);

  // 1. Dark Titanium Recessed Tray / Cavity (sunken flush into the armor facet)
  const bayHousingGeo = new THREE.BoxGeometry(0.0088, 0.044, 0.0020);
  const bayHousing = new THREE.Mesh(bayHousingGeo, materials.joint);
  bayHousing.position.set(0, 0, -0.0006);
  bayHousing.castShadow = true;
  techBayGroup.add(bayHousing);

  // 2. Precision Machined Metallic Thin Bezel Rim
  const bezelFrameGeo = new THREE.BoxGeometry(0.0096, 0.045, 0.0007);
  const bezelFrame = new THREE.Mesh(bezelFrameGeo, materials.metallic);
  bezelFrame.position.set(0, 0, 0.0003);
  techBayGroup.add(bezelFrame);

  // 3. Centered Flush Purple Emissive Accent Strip
  const purpleRodGeo = new THREE.CapsuleGeometry(0.0013, 0.030, 8, 16);
  const ledStrip = new THREE.Mesh(purpleRodGeo, materials.purpleEmissive);
  ledStrip.name = 'ForearmPurpleLEDAccent';
  ledStrip.position.set(0, 0, 0.0004);
  techBayGroup.add(ledStrip);
  ledMeshes.push(ledStrip);

  // High-intensity Bloom Glow (Calibrated radius to stay inside bezel)
  const purpleBloomGeo = new THREE.CapsuleGeometry(0.0020, 0.030, 8, 16);
  const purpleBloomMesh = new THREE.Mesh(purpleBloomGeo, materials.purpleBloom);
  purpleBloomMesh.position.copy(ledStrip.position);
  techBayGroup.add(purpleBloomMesh);

  // 4. Micro Heat-Dissipation Louvers (Symmetric top and bottom technical vents)
  const ventilationChannel = new THREE.Group();
  ventilationChannel.name = 'ForearmVentilationChannel';
  ventilationChannel.position.set(0, 0, 0);
  techBayGroup.add(ventilationChannel);

  for (const lY of [-0.020, 0.020]) {
    const slatGeo = new THREE.BoxGeometry(0.0050, 0.0008, 0.0010);
    const slat = new THREE.Mesh(slatGeo, materials.joint);
    slat.position.set(0, lY, 0.0002);
    ventilationChannel.add(slat);
  }

  // Engineered Parting Seam between inner and outer shells (Safely inside at radius 24mm)
  const medSeamGeo = new THREE.BoxGeometry(0.0018, 0.096, 0.0025);
  const panelSeam = new THREE.Mesh(medSeamGeo, materials.joint);
  panelSeam.name = 'ForearmPartingSeam';
  panelSeam.position.set(-side * 0.0240, -0.080, 0);
  armorGroup.add(panelSeam);

  // Compatibility aliases
  const gauntletBody = anteriorArmor;
  const innerSleeve = armatureSpine;
  const brachioradialis = anteriorArmor;

  return {
    group: forearmGroup,
    mechanicalCore,
    armatureSpine,
    armorGroup,
    anteriorArmor,
    posteriorArmor,
    sideArmor,
    innerArmor,
    ventilationChannel,
    ledStrip,
    ledMeshes,
    distalWristMount,
    wristCuff,
    // Aliases
    gauntletBody,
    innerSleeve,
    elbowSocketCollar,
    brachioradialis,
    panelSeam,
  };
}
