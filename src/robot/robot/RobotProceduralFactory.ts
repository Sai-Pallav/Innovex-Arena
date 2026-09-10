import * as THREE from 'three';
import { ROBOT_CONFIG } from '../config';

export interface RobotNodes {
  root: THREE.Group;
  torso: THREE.Group;
  chestLogo: THREE.Mesh;
  neck: THREE.Group;
  head: THREE.Group;
  faceVisor: THREE.Mesh;
  eyeTrackingGroup: THREE.Group;
  eyeLeft: THREE.Mesh;
  eyeRight: THREE.Mesh;
  visorLightBar: THREE.Mesh;
  earRingLeft: THREE.Mesh;
  earRingRight: THREE.Mesh;
  leftShoulder: THREE.Group;
  rightShoulder: THREE.Group;
  leftUpperArm: THREE.Group;
  rightUpperArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftHand: THREE.Group;
  rightHand: THREE.Group;
  ledMeshes: THREE.Mesh[];
  materials: {
    armor: THREE.MeshPhysicalMaterial;
    joint: THREE.MeshPhysicalMaterial;
    visor: THREE.MeshPhysicalMaterial;
    eyeGlow: THREE.Material;
    earRingGlow: THREE.Material;
    chestGlow: THREE.Material;
    accentGlow: THREE.Material;
  };
}

/**
 * Creates the high-fidelity procedural 3D Robot model matching the uploaded reference image.
 * Sculpted with accurate anatomical proportions, glossy ceramic armor, dark titanium skeleton,
 * and illuminated neon violet/blue LED systems.
 */
export function createProceduralRobot(): RobotNodes {
  const root = new THREE.Group();
  root.name = 'RobotRoot';

  // Base orientation (fine-tuned in RobotController for screen-left heroic angle)
  root.rotation.y = 0;

  const cfg = ROBOT_CONFIG;
  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 1. PBR MATERIALS
  // ==========================================
  const armorMat = new THREE.MeshPhysicalMaterial({
    color: 0xedf2f8,
    roughness: 0.18,
    metalness: 0.04,
    clearcoat: 0.92,
    clearcoatRoughness: 0.08,
    reflectivity: 0.92,
    name: 'RobotArmorMaterial',
  });

  const jointMat = new THREE.MeshPhysicalMaterial({
    color: 0x2e3448,
    roughness: 0.20,
    metalness: 0.80,
    clearcoat: 0.70,
    clearcoatRoughness: 0.10,
    name: 'RobotJointMaterial',
  });

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x020205,
    roughness: 0.012,
    metalness: 0.35,
    reflectivity: 0.99,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    ior: 1.55,
    name: 'RobotVisorMaterial',
  });

  // Neon Violet Glowing Emissives (toneMapped: false ensures vibrant punchy neon glow)
  const eyeGlowMat = new THREE.MeshBasicMaterial({
    color: 0xdf46ff, // Vibrant electric magenta/violet laser halo
    toneMapped: false,
    name: 'RobotEyeGlowMaterial',
  });

  const eyeCoreGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, // Pure hot white laser core
    toneMapped: false,
    name: 'RobotEyeCoreGlowMaterial',
  });

  const eyeBloomMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7, // Soft volumetric violet bloom
    transparent: true,
    opacity: 0.38,
    toneMapped: false,
    name: 'RobotEyeBloomMaterial',
  });

  const earRingGlowMat = new THREE.MeshBasicMaterial({
    color: 0xdf70ff, // Vibrant circular neon ear ring
    toneMapped: false,
    name: 'RobotEarRingGlowMaterial',
  });

  const earRingCoreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, // Incandescent white core for ear ring
    toneMapped: false,
    name: 'RobotEarRingCoreMaterial',
  });

  const chestGlowMat = new THREE.MeshBasicMaterial({
    color: 0xb388ff, // Bright glowing neon violet 'A' crest
    toneMapped: false,
    name: 'RobotChestGlowMaterial',
  });

  const accentGlowMat = new THREE.MeshBasicMaterial({
    color: 0x9333ea, // Seam accent emissive
    toneMapped: false,
    name: 'RobotAccentGlowMaterial',
  });

  // ==========================================
  // 2. TORSO & ATHLETIC CHEST CUIRASS
  // ==========================================
  const torso = new THREE.Group();
  torso.name = 'Torso';
  // Positioned so head top has ample headroom and waist sits naturally behind stats cards
  torso.position.set(0, 0.45, 0);
  root.add(torso);

  // Dark Mechanical Spine & Abdominal Core (Tall lumbar spinal column)
  const spineCoreGeo = new THREE.CylinderGeometry(0.10, 0.08, 0.82, 24);
  const spineCore = new THREE.Mesh(spineCoreGeo, jointMat);
  spineCore.position.set(0, -0.22, -0.04);
  spineCore.castShadow = true;
  spineCore.receiveShadow = true;
  torso.add(spineCore);

  // Ribbed Spinal Vertebrae Discs (Stacking down the entire tall lumbar spine)
  for (let i = -7; i <= 2; i++) {
    const discGeo = new THREE.CylinderGeometry(0.130, 0.130, 0.018, 20);
    const disc = new THREE.Mesh(discGeo, jointMat);
    disc.position.set(0, 0.01 + i * 0.058, -0.055);
    torso.add(disc);
  }

  // Flank / Latissimus Mechanical Ribs (Visible in gaps under armpits)
  for (const side of [-1, 1]) {
    for (let r = 0; r < 4; r++) {
      const ribGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.16, 10);
      const rib = new THREE.Mesh(ribGeo, jointMat);
      rib.position.set(side * 0.15, -0.04 - r * 0.060, 0.02);
      rib.rotation.z = side * 0.45;
      rib.rotation.y = side * 0.25;
      torso.add(rib);
    }
  }

  // Sculpted White Armor Cuirass / Breastplate
  // Fitted athletic anatomical contour with clean lower V-taper matching Reference Image
  const chestPlateShape = new THREE.Shape();
  // Scooped anatomical collar line
  chestPlateShape.moveTo(-0.065, 0.125);
  chestPlateShape.quadraticCurveTo(0, 0.110, 0.065, 0.125);
  // Clavicle shoulder line
  chestPlateShape.lineTo(0.138, 0.115);
  // Upper outer pectoral curve
  chestPlateShape.bezierCurveTo(0.148, 0.06, 0.148, 0.01, 0.144, -0.035);
  // Angled diagonal thoracic seam tapering inward to lower ribcage
  chestPlateShape.lineTo(0.068, -0.165);
  // Lower athletic rounded tongue apex
  chestPlateShape.bezierCurveTo(0.046, -0.215, 0.024, -0.245, 0, -0.245);
  chestPlateShape.bezierCurveTo(-0.024, -0.245, -0.046, -0.215, -0.068, -0.165);
  // Symmetrical return
  chestPlateShape.lineTo(-0.144, -0.035);
  chestPlateShape.bezierCurveTo(-0.148, 0.01, -0.148, 0.06, -0.138, 0.115);
  chestPlateShape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 2,
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.010,
    bevelSegments: 4,
  };

  const chestPlateGeo = new THREE.ExtrudeGeometry(chestPlateShape, extrudeSettings);
  chestPlateGeo.center();
  const chestPlate = new THREE.Mesh(chestPlateGeo, armorMat);
  chestPlate.position.set(0, -0.010, 0.070);
  chestPlate.rotation.x = -0.06;
  chestPlate.castShadow = true;
  chestPlate.receiveShadow = true;
  chestPlate.name = 'ChestArmorPlate';
  torso.add(chestPlate);

  // White Armor Neck Collar Gorget Rim (Signature white collar rim around the neck base)
  const collarGeo = new THREE.TorusGeometry(0.095, 0.014, 16, 32);
  const collar = new THREE.Mesh(collarGeo, armorMat);
  collar.rotation.x = Math.PI / 2 + 0.08;
  collar.position.set(0, 0.14, 0.01);
  collar.scale.set(1.12, 0.88, 1.0);
  torso.add(collar);

  // White Clavicle Shoulder Straps (Connecting upper chest to broad shoulders per reference image)
  for (const side of [-1, 1]) {
    const archCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side * 0.12, 0.14, 0.05),
      new THREE.Vector3(side * 0.20, 0.13, 0.02),
      new THREE.Vector3(side * 0.255, 0.07, -0.02)
    );
    const archGeo = new THREE.TubeGeometry(archCurve, 16, 0.022, 12, false);
    const arch = new THREE.Mesh(archGeo, armorMat);
    arch.castShadow = true;
    torso.add(arch);

    // Dark Titanium Crescent Arm-Socket Rims (Framing armhole per reference image)
    const socketGeo = new THREE.TorusGeometry(0.082, 0.012, 16, 32, Math.PI * 0.95);
    const socketRim = new THREE.Mesh(socketGeo, jointMat);
    socketRim.rotation.y = side * (Math.PI / 2);
    socketRim.rotation.x = 0.25;
    socketRim.position.set(side * 0.225, 0.045, 0.01);
    torso.add(socketRim);
  }

  // Clavicle Collarbone Armor Trim
  const clavicleGeo = new THREE.TorusGeometry(0.185, 0.018, 16, 32, Math.PI * 0.9);
  const clavicle = new THREE.Mesh(clavicleGeo, armorMat);
  clavicle.rotation.x = Math.PI / 2 + 0.08;
  clavicle.rotation.z = Math.PI * 0.95;
  clavicle.position.set(0, 0.13, 0.01);
  clavicle.scale.set(1.15, 0.75, 1.0);
  torso.add(clavicle);

  // Left and Right Pectoral Subtle Relief Plates (adds real anatomical 3D contours)
  for (const side of [-1, 1]) {
    const pecShape = new THREE.Shape();
    pecShape.moveTo(side * 0.03, 0.01);
    pecShape.lineTo(side * 0.15, 0.01);
    pecShape.bezierCurveTo(side * 0.14, -0.06, side * 0.11, -0.10, side * 0.03, -0.11);
    pecShape.closePath();

    const pecGeo = new THREE.ExtrudeGeometry(pecShape, {
      depth: 0.010,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.006,
      bevelSegments: 3,
    });
    const pecMesh = new THREE.Mesh(pecGeo, armorMat);
    pecMesh.position.set(0, 0.01, 0.082);
    pecMesh.rotation.x = -0.08;
    pecMesh.rotation.y = side * 0.06;
    torso.add(pecMesh);
  }

  // Lateral White Armor Thoracic Flank Plates (Sleek aerodynamic contours wrapping ribs below armpit per reference image)
  for (const side of [-1, 1]) {
    const flankShape = new THREE.Shape();
    flankShape.moveTo(side * 0.120, -0.040);
    flankShape.lineTo(side * 0.160, -0.010);
    flankShape.lineTo(side * 0.145, -0.190);
    flankShape.lineTo(side * 0.080, -0.160);
    flankShape.closePath();

    const flankGeo = new THREE.ExtrudeGeometry(flankShape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    });
    flankGeo.center();

    const flankMesh = new THREE.Mesh(flankGeo, armorMat);
    flankMesh.position.set(side * 0.125, -0.10, 0.040);
    flankMesh.rotation.y = side * 0.18;
    flankMesh.rotation.x = -0.04;
    flankMesh.castShadow = true;
    torso.add(flankMesh);
  }

  // ==========================================
  // 3. CYBERNETIC ABDOMINAL CORE & ATHLETIC STOMACH
  // (Precision sculpted matching Reference Image latest_stomach_zoom.png)
  // ==========================================
  // A. Solid Dark Titanium Inner Core Trunk
  // Positioned as the anatomical deep trunk so surface armor plates sit prominently on top
  const midriffCoreGeo = new THREE.CylinderGeometry(0.120, 0.100, 0.28, 32);
  const midriffCore = new THREE.Mesh(midriffCoreGeo, jointMat);
  midriffCore.position.set(0, -0.27, -0.020);
  midriffCore.scale.set(1.02, 1.0, 0.78);
  midriffCore.castShadow = true;
  midriffCore.receiveShadow = true;
  torso.add(midriffCore);

  // B. Epigastric Infrasternal Notch Plate (Recessed beneath white breastplate apex)
  const epigastricGeo = new THREE.BoxGeometry(0.072, 0.032, 0.018);
  const epigastricPlate = new THREE.Mesh(epigastricGeo, jointMat);
  epigastricPlate.position.set(0, -0.165, 0.050);
  epigastricPlate.rotation.x = 0.06;
  epigastricPlate.castShadow = true;
  torso.add(epigastricPlate);

  // C. Central Linea Alba Recessed Groove
  // (Distinct vertical metallic seam running down the center between the abdominal plates)
  const lineaAlbaGeo = new THREE.BoxGeometry(0.006, 0.155, 0.012);
  const lineaAlba = new THREE.Mesh(lineaAlbaGeo, jointMat);
  lineaAlba.position.set(0, -0.250, 0.042);
  lineaAlba.rotation.x = 0.05;
  torso.add(lineaAlba);

  // D. Dual-Column Sculpted Rectus Abdominis Plates (Cybernetic Abs)
  // 3 anatomical tiers of left & right beveled armor muscle plates per reference image
  const abTiers = [
    { y: -0.205, w: 0.052, h: 0.036, d: 0.016, z: 0.046, rotX: 0.08, rotY: 0.06 },
    { y: -0.248, w: 0.048, h: 0.036, d: 0.016, z: 0.044, rotX: 0.05, rotY: 0.05 },
    { y: -0.290, w: 0.044, h: 0.034, d: 0.015, z: 0.040, rotX: 0.02, rotY: 0.04 },
  ];

  abTiers.forEach((tier) => {
    for (const side of [-1, 1]) {
      const abShape = new THREE.Shape();
      const hw = tier.w / 2;
      const hh = tier.h / 2;
      abShape.moveTo(-hw + 0.005, -hh);
      abShape.lineTo(hw - 0.005, -hh);
      abShape.bezierCurveTo(hw, -hh + 0.003, hw, hh - 0.003, hw - 0.005, hh);
      abShape.lineTo(-hw + 0.005, hh);
      abShape.bezierCurveTo(-hw, hh - 0.003, -hw, -hh + 0.003, -hw + 0.005, -hh);
      abShape.closePath();

      const abGeo = new THREE.ExtrudeGeometry(abShape, {
        depth: tier.d,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.004,
        bevelSegments: 3,
      });
      abGeo.center();

      const abMesh = new THREE.Mesh(abGeo, jointMat);
      abMesh.position.set(side * (tier.w / 2 + 0.005), tier.y, tier.z);
      abMesh.rotation.x = tier.rotX;
      abMesh.rotation.y = side * tier.rotY;
      abMesh.castShadow = true;
      abMesh.receiveShadow = true;
      torso.add(abMesh);
    }
  });

  // E. Lateral External Oblique Flank Plates (Sculpted diagonal flank muscles)
  // Wrapping the lateral waist inwards towards the pelvis per reference image
  for (const side of [-1, 1]) {
    const obliqueLevels = [
      { y: -0.19, x: 0.102, z: 0.054, rotZ: -0.26, rotY: 0.22, rotX: 0.08, l: 0.070 },
      { y: -0.24, x: 0.098, z: 0.052, rotZ: -0.22, rotY: 0.20, rotX: 0.05, l: 0.065 },
      { y: -0.29, x: 0.092, z: 0.048, rotZ: -0.18, rotY: 0.18, rotX: 0.02, l: 0.060 },
    ];

    obliqueLevels.forEach((obl) => {
      const oblGeo = new THREE.BoxGeometry(obl.l, 0.034, 0.024);
      const oblMesh = new THREE.Mesh(oblGeo, jointMat);
      oblMesh.position.set(side * obl.x, obl.y, obl.z);
      oblMesh.rotation.z = side * obl.rotZ;
      oblMesh.rotation.y = side * obl.rotY;
      oblMesh.rotation.x = obl.rotX;
      oblMesh.castShadow = true;
      torso.add(oblMesh);
    });

    // F. Biomechanical Hydraulic Micro-Pistons & Tendon Struts
    // Precision robotic hydraulics linking lower thoracic cage to lumbar waist band
    const cylGeo = new THREE.CylinderGeometry(0.0070, 0.0070, 0.10, 12);
    const pistonCyl = new THREE.Mesh(cylGeo, jointMat);
    pistonCyl.position.set(side * 0.112, -0.23, 0.038);
    pistonCyl.rotation.z = -side * 0.15;
    pistonCyl.rotation.x = -0.06;
    torso.add(pistonCyl);

    const rodGeo = new THREE.CylinderGeometry(0.0040, 0.0040, 0.08, 12);
    const pistonRod = new THREE.Mesh(rodGeo, armorMat);
    pistonRod.position.set(side * 0.112, -0.28, 0.038);
    pistonRod.rotation.z = -side * 0.15;
    pistonRod.rotation.x = -0.06;
    torso.add(pistonRod);
  }

  // ==========================================
  // 4. ARTICULATED LUMBAR WAIST & GROUNDED PELVIC FOUNDATION
  // (Precision waist meeting bottom of screen solidly behind stats cards)
  // ==========================================
  // A. Segmented Lumbar Waist Articulation Ring / Belt (The iconic waist band in reference)
  const waistRingGeo = new THREE.TorusGeometry(0.122, 0.016, 16, 40);
  const waistRing = new THREE.Mesh(waistRingGeo, jointMat);
  waistRing.rotation.x = Math.PI / 2 + 0.04;
  waistRing.position.set(0, -0.345, 0.015);
  waistRing.scale.set(1.06, 0.88, 1.0);
  waistRing.castShadow = true;
  torso.add(waistRing);

  // Inner Dark Waist Cylindrical Collar Core
  const waistCoreGeo = new THREE.CylinderGeometry(0.122, 0.120, 0.050, 32);
  const waistCore = new THREE.Mesh(waistCoreGeo, jointMat);
  waistCore.position.set(0, -0.345, 0.015);
  waistCore.scale.set(1.05, 1.0, 0.86);
  torso.add(waistCore);

  // Lateral Rotary Pivot Hub Discs on Waist Flanks
  for (const side of [-1, 1]) {
    const hubGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.028, 20);
    const hubMesh = new THREE.Mesh(hubGeo, jointMat);
    hubMesh.rotation.z = Math.PI / 2;
    hubMesh.position.set(side * 0.134, -0.345, 0.015);
    torso.add(hubMesh);

    const hubRingGeo = new THREE.TorusGeometry(0.026, 0.004, 12, 24);
    const hubRing = new THREE.Mesh(hubRingGeo, armorMat);
    hubRing.rotation.y = Math.PI / 2;
    hubRing.position.set(side * 0.148, -0.345, 0.015);
    torso.add(hubRing);
  }

  // B. Contoured Pelvic Girdle & Groin/Pubic Shield Plate
  // Curves downward from waist band into the bottom edge of the frame
  const groinShape = new THREE.Shape();
  groinShape.moveTo(-0.048, 0.02);
  groinShape.lineTo(0.048, 0.02);
  groinShape.bezierCurveTo(0.046, -0.04, 0.035, -0.09, 0.024, -0.14);
  groinShape.lineTo(-0.024, -0.14);
  groinShape.bezierCurveTo(-0.035, -0.09, -0.046, -0.04, -0.048, 0.02);
  groinShape.closePath();

  const groinGeo = new THREE.ExtrudeGeometry(groinShape, {
    depth: 0.042,
    bevelEnabled: true,
    bevelThickness: 0.010,
    bevelSize: 0.008,
    bevelSegments: 3,
  });
  groinGeo.center();

  const groinPlate = new THREE.Mesh(groinGeo, jointMat);
  groinPlate.position.set(0, -0.445, 0.068);
  groinPlate.rotation.x = -0.08;
  groinPlate.castShadow = true;
  torso.add(groinPlate);

  // Left & Right Dark Titanium Iliac Crest Hip Flank Shells
  for (const side of [-1, 1]) {
    const hipShellGeo = new THREE.CylinderGeometry(
      0.148,
      0.155,
      0.16,
      28,
      1,
      false,
      side === 1 ? -0.15 : Math.PI - 0.85,
      Math.PI * 0.70
    );
    const hipShell = new THREE.Mesh(hipShellGeo, jointMat);
    hipShell.position.set(side * 0.015, -0.46, 0.012);
    hipShell.scale.set(1.05, 1.0, 0.88);
    hipShell.castShadow = true;
    torso.add(hipShell);
  }

  // C. Heavy Grounded Pelvic Chassis Pedestal Foundation
  // Solid continuous chassis that anchors the robot firmly at the bottom of the section
  // eliminating any floating appearance and grounding the waist solidly behind the stats cards
  const pelvicChassisGeo = new THREE.CylinderGeometry(0.138, 0.168, 0.26, 32);
  const pelvicChassis = new THREE.Mesh(pelvicChassisGeo, jointMat);
  pelvicChassis.position.set(0, -0.52, 0.010);
  pelvicChassis.scale.set(1.10, 1.0, 0.88);
  pelvicChassis.castShadow = true;
  pelvicChassis.receiveShadow = true;
  torso.add(pelvicChassis);

  // ==========================================
  // ILLUMINATED "A" EMBLEM ON CHEST
  // (Directly embedded onto the white armor cuirass, matching Reference 2)
  // ==========================================
  const logoGroup = new THREE.Group();
  logoGroup.name = 'ChestLogoGroup';
  logoGroup.position.set(0, 0.025, 0.094);
  logoGroup.rotation.x = -0.06;

  // Left leg of A
  const strokeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.082, 14);
  const leftStroke = new THREE.Mesh(strokeGeo, chestGlowMat);
  leftStroke.position.set(-0.016, -0.002, 0.004);
  leftStroke.rotation.z = -0.28;
  logoGroup.add(leftStroke);

  // Right leg of A
  const rightStroke = new THREE.Mesh(strokeGeo, chestGlowMat);
  rightStroke.position.set(0.016, -0.002, 0.004);
  rightStroke.rotation.z = 0.28;
  logoGroup.add(rightStroke);

  // Crossbar of A
  const barGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.034, 12);
  const crossbar = new THREE.Mesh(barGeo, chestGlowMat);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, -0.010, 0.005);
  logoGroup.add(crossbar);

  // Apex Cap at top of A
  const apexGeo = new THREE.SphereGeometry(0.008, 12, 12);
  const apexMesh = new THREE.Mesh(apexGeo, chestGlowMat);
  apexMesh.position.set(0, 0.035, 0.004);
  logoGroup.add(apexMesh);

  // Soft violet ambient point light in front of the chest emblem
  const chestEmblemLight = new THREE.PointLight(0xa855f7, 0.35, 0.5);
  chestEmblemLight.position.set(0, 0, 0.04);
  logoGroup.add(chestEmblemLight);

  const chestLogo = leftStroke;
  ledMeshes.push(leftStroke, rightStroke, crossbar, apexMesh);
  torso.add(logoGroup);

  // Visible Flank Accent Light Slits (Matches glowing purple slit on lower breastplate in reference)
  for (const side of [-1, 1]) {
    const flankSeamGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.085, 10);
    const flankSeam = new THREE.Mesh(flankSeamGeo, accentGlowMat);
    flankSeam.position.set(side * 0.115, -0.095, 0.076);
    flankSeam.rotation.z = -side * 0.50;
    flankSeam.rotation.x = -0.08;
    torso.add(flankSeam);
    ledMeshes.push(flankSeam);
  }

  // ==========================================
  // ==========================================
  // 3. INTRICATE MECHANICAL CYBERNETIC NECK (Vertebrae & Hydraulics)
  // (Elevated, visible muscular neck matching Reference Image)
  // ==========================================
  const neck = new THREE.Group();
  neck.name = 'Neck';
  neck.position.set(0, 0.20, -0.005);
  torso.add(neck);

  // Dark Titanium Cervical Spine Column
  const neckCoreGeo = new THREE.CylinderGeometry(0.060, 0.070, 0.24, 32);
  const neckCore = new THREE.Mesh(neckCoreGeo, jointMat);
  neckCore.position.set(0, 0.12, 0);
  neckCore.castShadow = true;
  neck.add(neckCore);

  // 6 Stacked Curved Mechanical Cervical Vertebrae Rings matching Reference Image
  for (let r = 0; r < 6; r++) {
    const vRingGeo = new THREE.TorusGeometry(0.068, 0.0085, 16, 36);
    const vRing = new THREE.Mesh(vRingGeo, jointMat);
    vRing.rotation.x = Math.PI / 2 + 0.07;
    vRing.position.set(0, 0.026 + r * 0.035, -0.004);
    neck.add(vRing);
  }

  // Dual Hydraulic Neck Piston Struts linking skull base to clavicles
  for (const side of [-1, 1]) {
    const pistonGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.18, 16);
    const piston = new THREE.Mesh(pistonGeo, jointMat);
    piston.position.set(side * 0.056, 0.12, 0.024);
    piston.rotation.z = -side * 0.12;
    piston.rotation.x = -0.10;
    neck.add(piston);

    const rodGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.11, 16);
    const rod = new THREE.Mesh(rodGeo, armorMat);
    rod.position.set(side * 0.056, 0.13, 0.024);
    rod.rotation.z = -side * 0.12;
    rod.rotation.x = -0.10;
    neck.add(rod);

    // Posterior Nuchal Conduit Cable
    const nuchalCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side * 0.035, 0.04, -0.050),
      new THREE.Vector3(side * 0.042, 0.12, -0.055),
      new THREE.Vector3(side * 0.030, 0.20, -0.045)
    );
    const nuchalGeo = new THREE.TubeGeometry(nuchalCurve, 16, 0.0055, 8, false);
    const nuchal = new THREE.Mesh(nuchalGeo, jointMat);
    neck.add(nuchal);
  }

  // ==========================================
  // 4. GOD-LEVEL AERODYNAMIC ROBOTIC HELMET, VISOR & CHISELED JAW
  // (Masterpiece procedural engineering precision-crafted to match Reference Image)
  // ==========================================
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.138, 0.005);
  // Uniform 1.0 scale ensures mathematical perfection: true circles, zero non-uniform skewing
  head.scale.set(1.0, 1.0, 1.0);
  neck.add(head);

  // ----------------------------------------------------
  // Visor Mathematical Surface Function (Shared by Visor, Brow Trim & Laser Slit)
  // ----------------------------------------------------
  function getVisorPoint(u: number, v: number): THREE.Vector3 {
    // u: 0 (right ear) to 1 (left ear), v: 0 (top brow) to 1 (bottom chin)
    const y = 0.055 - v * 0.103; // y from +0.055 down to -0.048 (spacious vertical height)
    const vEye = Math.max(0, 1.0 - Math.abs(v - 0.38) / 0.45);
    const halfWidthAngle = 1.05 - 0.22 * v;
    const rx = 0.132 + 0.012 * vEye - 0.025 * v;
    const rz = 0.170 + 0.018 * vEye - 0.015 * v;
    const zOffset = 0.008 - 0.010 * v;

    const phi = (u - 0.5) * 2 * halfWidthAngle;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    const x = rx * sinPhi;
    // Compound forward bubble bulge creating rich glossy reflections
    const z = zOffset + rz * cosPhi + 0.008 * Math.cos(phi * 1.5);
    return new THREE.Vector3(x, y, z);
  }

  // ----------------------------------------------------
  // A. UNIFIED WHITE CERAMIC AERODYNAMIC CRANIAL HELMET SHELL
  // (Covers crown, forehead brow overhang, occiput to nape, and arches over ears)
  // ----------------------------------------------------
  function createGodLevelHelmet(): THREE.BufferGeometry {
    const uSegments = 64; // azimuth around Y
    const vSegments = 42; // elevation from crown (v=0) to lower rim (v=1)
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iv = 0; iv <= vSegments; iv++) {
      const v = iv / vSegments;

      for (let iu = 0; iu <= uSegments; iu++) {
        const u = iu / uSegments;
        const angle = u * Math.PI * 2;
        const sinA = Math.sin(angle); // +Z is front, -Z is rear
        const cosA = Math.cos(angle); // +X is left, -X is right

        let rimY: number;
        let rimX: number;
        let rimZ: number;

        if (sinA >= 0) {
          // Front & Temples (Brow hood & ear arches)
          const frontRatio = sinA; // 0 at sides, 1 at front center
          rimY = 0.042 + 0.015 * frontRatio;
          rimX = 0.142 * cosA;
          rimZ = 0.010 * cosA * cosA + 0.180 * frontRatio;
        } else {
          // Rear & Occiput (Full occipital ceramic shell down to neck nape)
          const rearRatio = -sinA; // 0 at sides, 1 at rear center
          // Fully sweeps down behind ears into gleaming white ceramic occipital dome
          rimY = 0.042 - 0.107 * Math.pow(rearRatio, 0.70);
          rimX = (0.142 - 0.024 * rearRatio) * cosA;
          rimZ = 0.010 * (1 - rearRatio) - 0.184 * rearRatio;
        }

        const crownY = 0.170;
        const crownZ = -0.020;

        const domeCurve = Math.sin(v * Math.PI * 0.5);
        const domeHeight = Math.cos(v * Math.PI * 0.5);

        let x = rimX * domeCurve;
        let y = rimY + (crownY - rimY) * domeHeight;
        let z = crownZ + (rimZ - crownZ) * domeCurve;

        // Subtle aerodynamic sagittal center crest along crown
        if (Math.abs(cosA) < 0.35 && v < 0.88) {
          const crestFactor = (1.0 - Math.abs(cosA) / 0.35) * Math.sin(v * Math.PI);
          y += 0.0040 * crestFactor;
        }

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iv = 0; iv < vSegments; iv++) {
      for (let iu = 0; iu < uSegments; iu++) {
        const a = iv * (uSegments + 1) + iu;
        const b = (iv + 1) * (uSegments + 1) + iu;
        const c = (iv + 1) * (uSegments + 1) + (iu + 1);
        const d = iv * (uSegments + 1) + (iu + 1);
        // Correct outward normal winding (a, d, b) and (b, d, c)
        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // Clone armor material with DoubleSide for complete, artifact-free ceramic shell rendering
  const helmetArmorMat = armorMat.clone();
  helmetArmorMat.side = THREE.DoubleSide;

  const helmetGeo = createGodLevelHelmet();
  const topCowl = new THREE.Mesh(helmetGeo, helmetArmorMat);
  topCowl.name = 'TopCowl';
  topCowl.castShadow = true;
  topCowl.receiveShadow = true;
  head.add(topCowl);

  // White Ceramic Temporal & Mastoid Shell Plates (Encasing lateral cranium and seamlessly framing ear pods)
  for (const side of [-1, 1]) {
    const temporalShape = new THREE.Shape();
    temporalShape.moveTo(0.010, 0.068);   // Above ear
    temporalShape.lineTo(-0.065, 0.050);  // Towards occiput
    temporalShape.lineTo(-0.065, -0.052); // Down nape
    temporalShape.lineTo(-0.015, -0.045); // Along lower jaw line
    temporalShape.lineTo(0.010, -0.028);  // Under ear
    temporalShape.absarc(0.0, 0.016, 0.052, -Math.PI * 0.45, Math.PI * 0.55, false);
    temporalShape.closePath();

    const temporalGeo = new THREE.ExtrudeGeometry(temporalShape, {
      depth: 0.014,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    });
    temporalGeo.center();
    const temporalMesh = new THREE.Mesh(temporalGeo, helmetArmorMat);
    temporalMesh.position.set(side * 0.136, 0.016, -0.020);
    temporalMesh.rotation.y = side * (Math.PI / 2) + side * 0.08;
    temporalMesh.castShadow = true;
    temporalMesh.receiveShadow = true;
    head.add(temporalMesh);
  }

  // Dark Titanium Brow Trim / Gasket (Sharp recessed mechanical seam between white brow and visor)
  const browCurvePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 32; i++) {
    const pt = getVisorPoint(i / 32, 0.0);
    pt.y += 0.002;
    pt.z -= 0.001;
    browCurvePoints.push(pt);
  }
  const browCurve = new THREE.CatmullRomCurve3(browCurvePoints);
  const browGasketGeo = new THREE.TubeGeometry(browCurve, 32, 0.0035, 10, false);
  const browGasket = new THREE.Mesh(browGasketGeo, jointMat);
  head.add(browGasket);

  // ----------------------------------------------------
  // B. CONTINUOUS OBSIDIAN COMPOUND-CURVED VISOR
  // (Ultra-glossy aerodynamic screen flush under brow hood down to chin guard)
  // ----------------------------------------------------
  function createGodLevelVisor(): THREE.BufferGeometry {
    const uSegments = 48;
    const vSegments = 32;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iv = 0; iv <= vSegments; iv++) {
      const v = iv / vSegments;
      for (let iu = 0; iu <= uSegments; iu++) {
        const u = iu / uSegments;
        const pt = getVisorPoint(u, v);
        positions.push(pt.x, pt.y, pt.z);
        uvs.push(u, v);
      }
    }

    for (let iv = 0; iv < vSegments; iv++) {
      for (let iu = 0; iu < uSegments; iu++) {
        const a = iv * (uSegments + 1) + iu;
        const b = (iv + 1) * (uSegments + 1) + iu;
        const c = (iv + 1) * (uSegments + 1) + (iu + 1);
        const d = iv * (uSegments + 1) + (iu + 1);
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

  const visorGeo = createGodLevelVisor();
  const faceVisor = new THREE.Mesh(visorGeo, visorMat);
  faceVisor.name = 'FaceVisor';
  faceVisor.castShadow = true;
  faceVisor.receiveShadow = true;
  head.add(faceVisor);

  // ----------------------------------------------------
  // C. INTERNAL MECHANICAL CAVITY & NAPE COLLAR
  // (Dark titanium structural framework inside helmet and linking to neck)
  // ----------------------------------------------------
  // Compact internal face backing cavity (strictly behind front visor, never pokes out rear or sides)
  const innerSkullGeo = new THREE.SphereGeometry(0.085, 20, 16);
  const innerSkull = new THREE.Mesh(innerSkullGeo, jointMat);
  innerSkull.position.set(0, 0.010, 0.045);
  head.add(innerSkull);

  // Occipital Cervical Collar (Beveled titanium connector at rear base of skull)
  const occipitalCollarGeo = new THREE.CylinderGeometry(0.095, 0.082, 0.085, 32);
  const occipitalCollar = new THREE.Mesh(occipitalCollarGeo, jointMat);
  occipitalCollar.position.set(0, -0.055, -0.080);
  occipitalCollar.rotation.x = 0.28;
  head.add(occipitalCollar);

  // ----------------------------------------------------
  // D. CHISELED WHITE CERAMIC JAW & ANGULAR CHIN GUARD
  // (Precision faceted jaw matching reference: cradling visor with forward-jutting chin prow)
  // ----------------------------------------------------
  const chinGroup = new THREE.Group();
  chinGroup.name = 'ChinGuard';
  head.add(chinGroup);

  function createGodLevelChin(): THREE.BufferGeometry {
    const uSegments = 32;
    const vSegments = 24;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iv = 0; iv <= vSegments; iv++) {
      const v = iv / vSegments; // 0 = top rim under visor, 1 = chin apex
      const y = -0.048 - v * 0.070; // Seamlessly meets bottom of visor at -0.048

      const halfWidthAngle = 0.83 * (1.0 - 0.72 * Math.pow(v, 1.2));
      const rx = 0.110 * (1.0 - 0.65 * v);
      const rz = 0.155 + 0.012 * Math.sin(v * Math.PI) - 0.010 * v;
      const zCenter = -0.005 + 0.015 * Math.pow(v, 1.5);

      for (let iu = 0; iu <= uSegments; iu++) {
        const u = iu / uSegments;
        const phi = (u - 0.5) * 2 * halfWidthAngle;
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);

        let x = rx * sinPhi;
        let z = zCenter + rz * cosPhi;

        // Chiseled front facet: jutting aerodynamic prow
        if (v > 0.50 && Math.abs(phi) < 0.35) {
          const facetFactor = (1.0 - Math.abs(phi) / 0.35) * ((v - 0.50) / 0.50);
          z += 0.008 * facetFactor;
        }

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iv = 0; iv < vSegments; iv++) {
      for (let iu = 0; iu < uSegments; iu++) {
        const a = iv * (uSegments + 1) + iu;
        const b = (iv + 1) * (uSegments + 1) + iu;
        const c = (iv + 1) * (uSegments + 1) + (iu + 1);
        const d = iv * (uSegments + 1) + (iu + 1);
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

  const chinShellGeo = createGodLevelChin();
  const chinShell = new THREE.Mesh(chinShellGeo, helmetArmorMat);
  chinShell.castShadow = true;
  chinShell.receiveShadow = true;
  chinGroup.add(chinShell);

  // Chiseled Beveled Chin Tip Plate (Trapezoidal armor facet fitted flush to chin prow)
  const chinShape = new THREE.Shape();
  chinShape.moveTo(-0.034, 0.018);
  chinShape.lineTo(0.034, 0.018);
  chinShape.lineTo(0.024, -0.022);
  chinShape.lineTo(0, -0.034);
  chinShape.lineTo(-0.024, -0.022);
  chinShape.closePath();

  const chinPlateGeo = new THREE.ExtrudeGeometry(chinShape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 3,
  });
  chinPlateGeo.center();
  const chinPlate = new THREE.Mesh(chinPlateGeo, armorMat);
  chinPlate.position.set(0, -0.092, 0.152);
  chinPlate.rotation.x = -0.18;
  chinPlate.castShadow = true;
  chinPlate.receiveShadow = true;
  chinGroup.add(chinPlate);

  // Dark Titanium Submental Intake Vent (Directly underneath chin tip)
  const chinVentGeo = new THREE.BoxGeometry(0.026, 0.008, 0.018);
  const chinVent = new THREE.Mesh(chinVentGeo, jointMat);
  chinVent.position.set(0, -0.118, 0.138);
  chinVent.rotation.x = -0.18;
  chinGroup.add(chinVent);

  // ----------------------------------------------------
  // 5. EYE TRACKING & GLOWING HORIZONTAL NEON VIOLET LASER BLADE
  // (Surface-conforming continuous neon laser slit across mid-upper visor, razor sharp)
  // ----------------------------------------------------
  const eyeTrackingGroup = new THREE.Group();
  eyeTrackingGroup.name = 'EyeTrackingGroup';
  eyeTrackingGroup.position.set(0, 0, 0);
  head.add(eyeTrackingGroup);

  // Laser points computed directly from the visor surface with +2.0mm normal proud offset
  const laserPoints: THREE.Vector3[] = [];
  const laserStepCount = 32;
  for (let i = 0; i <= laserStepCount; i++) {
    const u = 0.08 + (i / laserStepCount) * 0.84; // Spans 84% across the visor
    const v = 0.38; // Centered across mid-upper visor
    const pt = getVisorPoint(u, v);
    pt.z += 0.0022; // 2.2mm proud of visor surface
    laserPoints.push(pt);
  }
  const laserCurve = new THREE.CatmullRomCurve3(laserPoints);

  // Layer 1: Soft Volumetric Violet Bloom Tube
  const bloomGeo = new THREE.TubeGeometry(laserCurve, 40, 0.0055, 12, false);
  const bloomMesh = new THREE.Mesh(bloomGeo, eyeBloomMat);
  bloomMesh.renderOrder = 950;
  eyeTrackingGroup.add(bloomMesh);

  // Layer 2: Vibrant Electric Magenta Halo Tube
  const lightBarGeo = new THREE.TubeGeometry(laserCurve, 40, 0.0028, 12, false);
  const visorLightBar = new THREE.Mesh(lightBarGeo, eyeGlowMat);
  visorLightBar.renderOrder = 951;
  visorLightBar.name = 'VisorLightBar';
  eyeTrackingGroup.add(visorLightBar);
  ledMeshes.push(visorLightBar);

  // Layer 3: Blazing Pure-White Laser Hot Core Tube
  const hotCoreGeo = new THREE.TubeGeometry(laserCurve, 40, 0.0013, 10, false);
  const hotCore = new THREE.Mesh(hotCoreGeo, eyeCoreGlowMat);
  hotCore.renderOrder = 952;
  hotCore.position.set(0, 0, 0.0008);
  eyeTrackingGroup.add(hotCore);
  ledMeshes.push(hotCore);

  // Twin Subtle Eye Core Reference Nodes for Kinematics Controller
  const eyeLeft = new THREE.Mesh(new THREE.BufferGeometry(), eyeGlowMat);
  eyeLeft.name = 'EyeLeft';
  eyeTrackingGroup.add(eyeLeft);

  const eyeRight = new THREE.Mesh(new THREE.BufferGeometry(), eyeGlowMat);
  eyeRight.name = 'EyeRight';
  eyeTrackingGroup.add(eyeRight);

  // Visor Point Light creating specular purple gleam across obsidian visor and chin
  const visorGlowLight = new THREE.PointLight(0xd946ef, 3.0, 0.65);
  visorGlowLight.position.set(0, 0.016, 0.235);
  eyeTrackingGroup.add(visorGlowLight);

  // ----------------------------------------------------
  // 6. GOD-LEVEL CIRCULAR NEON EAR MODULES
  // (True circular audio drivers nestled into lateral cranium arches per Reference Image)
  // ----------------------------------------------------
  let earRingLeftMesh!: THREE.Mesh;
  let earRingRightMesh!: THREE.Mesh;

  for (const side of [-1, 1]) {
    const earGroup = new THREE.Group();
    earGroup.name = side === -1 ? 'EarModuleLeft' : 'EarModuleRight';
    // Positioned proud on lateral cranium surface, nestled in helmet arch
    earGroup.position.set(side * 0.142, 0.016, -0.020);
    // Facing outward with slight 10° aerodynamic forward rake
    earGroup.rotation.y = side * (Math.PI / 2) + (side === 1 ? -0.14 : 0.14);
    earGroup.rotation.x = -0.05;
    earGroup.rotation.z = side * 0.08;
    head.add(earGroup);

    // White Ceramic Ear Cowling / Chamfered Collar (Integrates ear module into helmet shell)
    const earCowlGeo = new THREE.TorusGeometry(0.054, 0.0065, 16, 40);
    const earCowl = new THREE.Mesh(earCowlGeo, armorMat);
    earCowl.position.set(0, 0, -0.002);
    earGroup.add(earCowl);

    // Dark Titanium Stepped Outer Rotary Bezel
    const earBezelGeo = new THREE.CylinderGeometry(0.048, 0.053, 0.014, 40);
    const earBezel = new THREE.Mesh(earBezelGeo, jointMat);
    earBezel.rotation.x = Math.PI / 2;
    earBezel.position.set(0, 0, 0.006);
    earGroup.add(earBezel);

    // Dark Titanium Deep Recessed Audio Chamber
    const earChamberGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.010, 36);
    const earChamber = new THREE.Mesh(earChamberGeo, jointMat);
    earChamber.rotation.x = Math.PI / 2;
    earChamber.position.set(0, 0, 0.012);
    earGroup.add(earChamber);

    // Dark Titanium Chamfered Inner Rim Ring
    const earRimGeo = new THREE.TorusGeometry(0.043, 0.0025, 16, 36);
    const earRim = new THREE.Mesh(earRimGeo, jointMat);
    earRim.position.set(0, 0, 0.016);
    earGroup.add(earRim);

    // Signature Unbroken 360° Glowing Neon Violet Torus Ring! (Mathematical circle, zero distortion)
    const earGlowGeo = new THREE.TorusGeometry(0.034, 0.0046, 24, 48);
    const earGlow = new THREE.Mesh(earGlowGeo, earRingGlowMat);
    earGlow.position.set(0, 0, 0.019);
    earGroup.add(earGlow);
    ledMeshes.push(earGlow);

    // Incandescent Pure White Core Ring inside the glowing torus!
    const earCoreRingGeo = new THREE.TorusGeometry(0.034, 0.0016, 16, 48);
    const earCoreRing = new THREE.Mesh(earCoreRingGeo, earRingCoreMat);
    earCoreRing.position.set(0, 0, 0.020);
    earGroup.add(earCoreRing);
    ledMeshes.push(earCoreRing);

    // Center Titanium Recessed Acoustic Dish with Micro-Aperture
    const earCoreGeo = new THREE.CylinderGeometry(0.021, 0.018, 0.008, 28);
    const earCore = new THREE.Mesh(earCoreGeo, jointMat);
    earCore.rotation.x = Math.PI / 2;
    earCore.position.set(0, 0, 0.015);
    earGroup.add(earCore);

    // Center Titanium Aperture Pin
    const earPinGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.010, 16);
    const earPin = new THREE.Mesh(earPinGeo, jointMat);
    earPin.rotation.x = Math.PI / 2;
    earPin.position.set(0, 0, 0.021);
    earGroup.add(earPin);

    // Ear Point Light casting soft purple sheen on the side of the helmet and shoulder
    const earLight = new THREE.PointLight(0xb040ff, 2.4, 0.50);
    earLight.position.set(0, 0, 0.036);
    earGroup.add(earLight);

    if (side === -1) earRingLeftMesh = earGlow;
    else earRingRightMesh = earGlow;
  }

  // ==========================================
  // 7. SHOULDERS, ARMS & COMPLETE ARTICULATED HANDS
  // (Built to perfection matching Reference 2)
  // ==========================================
  const leftShoulder = new THREE.Group();
  leftShoulder.name = 'LeftShoulder';
  leftShoulder.position.set(-0.265, 0.070, 0.020);
  torso.add(leftShoulder);

  const rightShoulder = new THREE.Group();
  rightShoulder.name = 'RightShoulder';
  rightShoulder.position.set(0.265, 0.070, 0.020);
  torso.add(rightShoulder);

  const leftUpperArm = new THREE.Group();
  leftUpperArm.name = 'LeftUpperArm';
  leftUpperArm.rotation.set(-0.16, 0.06, -0.08);
  leftShoulder.add(leftUpperArm);

  const rightUpperArm = new THREE.Group();
  rightUpperArm.name = 'RightUpperArm';
  // Athletic outward flare clearing the ribcage per reference image
  rightUpperArm.rotation.set(-0.10, -0.04, 0.10);
  rightShoulder.add(rightUpperArm);

  const leftForearm = new THREE.Group();
  leftForearm.name = 'LeftForearm';
  leftForearm.position.set(0, -0.225, 0.008);
  // Forward-bent elbow with forearm tapering down towards left hip in front of waist
  leftForearm.rotation.set(-0.42, 0.16, 0.08);
  leftUpperArm.add(leftForearm);

  const rightForearm = new THREE.Group();
  rightForearm.name = 'RightForearm';
  rightForearm.position.set(0, -0.225, 0.008);
  // Natural forward elbow bend hanging along lateral flank per reference image
  rightForearm.rotation.set(-0.18, -0.02, -0.04);
  rightUpperArm.add(rightForearm);

  const leftHand = new THREE.Group();
  leftHand.name = 'LeftHand';
  leftHand.position.set(0, -0.205, 0.006);
  leftHand.rotation.set(0.18, 0.10, -0.06);
  leftForearm.add(leftHand);

  const rightHand = new THREE.Group();
  rightHand.name = 'RightHand';
  rightHand.position.set(0, -0.205, 0.006);
  rightHand.rotation.set(0.06, -0.12, 0.04);
  rightForearm.add(rightHand);

  const armPairs = [
    { shoulder: leftShoulder, upper: leftUpperArm, fore: leftForearm, hand: leftHand, side: -1 },
    { shoulder: rightShoulder, upper: rightUpperArm, fore: rightForearm, hand: rightHand, side: 1 },
  ];

  for (const { shoulder, upper, fore, hand, side } of armPairs) {
    // -------------------------------------------------------------
    // A. SHOULDER GIMBAL & SCULPTED AERODYNAMIC DELTOID PAULDRON
    // (Snugly hugs the chest cuirass crescent socket per Reference Image)
    // -------------------------------------------------------------
    // Torso-to-Shoulder Rotary Gimbal Mount Bracket
    const gimbalGeo = new THREE.CylinderGeometry(0.042, 0.046, 0.052, 24);
    const gimbal = new THREE.Mesh(gimbalGeo, jointMat);
    gimbal.rotation.z = Math.PI / 2;
    gimbal.position.set(-side * 0.022, 0, 0);
    shoulder.add(gimbal);

    // Glenohumeral Rotary Ball Core (Dark titanium spherical joint)
    const ballJointGeo = new THREE.SphereGeometry(0.076, 32, 28);
    const ballJoint = new THREE.Mesh(ballJointGeo, jointMat);
    shoulder.add(ballJoint);

    // Concentric Circular Equatorial Groove Ring on Shoulder Ball
    const ballRingGeo = new THREE.TorusGeometry(0.077, 0.004, 12, 32);
    const ballRing = new THREE.Mesh(ballRingGeo, jointMat);
    ballRing.rotation.y = Math.PI / 2;
    shoulder.add(ballRing);

    // Armpit Hydraulic Conduit Cable
    const conduitCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-side * 0.028, -0.025, 0.018),
      new THREE.Vector3(-side * 0.014, -0.055, 0.010),
      new THREE.Vector3(0, -0.065, -0.010)
    );
    const conduitGeo = new THREE.TubeGeometry(conduitCurve, 12, 0.0045, 8, false);
    const conduit = new THREE.Mesh(conduitGeo, jointMat);
    shoulder.add(conduit);

    // Sculpted Aerodynamic Deltoid Pauldron (Elongated athletic armor shell conforming to upper arm per reference image)
    const pauldronGeo = new THREE.SphereGeometry(
      0.088,
      36,
      28,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.54
    );
    const pauldron = new THREE.Mesh(pauldronGeo, armorMat);
    pauldron.scale.set(0.82, 1.22, 0.94);
    pauldron.rotation.x = -0.06;
    pauldron.rotation.z = side * 0.16;
    pauldron.position.set(side * 0.012, -0.012, 0.002);
    pauldron.castShadow = true;
    pauldron.receiveShadow = true;
    shoulder.add(pauldron);

    // Pauldron Beveled Inner Titanium Rim Liner
    const pRimGeo = new THREE.TorusGeometry(0.084, 0.0045, 12, 36);
    const pRim = new THREE.Mesh(pRimGeo, jointMat);
    pRim.rotation.x = Math.PI / 2;
    pRim.position.set(side * 0.012, -0.028, 0.002);
    shoulder.add(pRim);

    // Cybernetic Deltoid Violet LED Accent Seam
    const deltoidLedGeo = new THREE.TorusGeometry(0.085, 0.003, 8, 36, Math.PI * 0.55);
    const deltoidLed = new THREE.Mesh(deltoidLedGeo, accentGlowMat);
    deltoidLed.rotation.x = Math.PI / 2;
    deltoidLed.rotation.z = side === 1 ? -0.25 : Math.PI - 0.25;
    deltoidLed.position.set(side * 0.012, -0.026, 0.002);
    shoulder.add(deltoidLed);
    ledMeshes.push(deltoidLed);

    // -------------------------------------------------------------
    // B. UPPER ARM (Solid Thick White Ceramic Bicep Carapace)
    // (Anatomically robust and sleek, matching Reference Image)
    // -------------------------------------------------------------
    // Upper Rotary Connector Collar
    const bicepCollarGeo = new THREE.CylinderGeometry(0.052, 0.048, 0.026, 24);
    const bicepCollar = new THREE.Mesh(bicepCollarGeo, jointMat);
    bicepCollar.position.set(side * 0.006, -0.016, 0);
    upper.add(bicepCollar);

    // Structural Dark Titanium Armature Core
    const bicepBoneGeo = new THREE.CylinderGeometry(0.042, 0.038, 0.20, 24);
    const bicepBone = new THREE.Mesh(bicepBoneGeo, jointMat);
    bicepBone.position.set(side * 0.006, -0.11, 0);
    upper.add(bicepBone);

    // Sculpted Solid White Ceramic Bicep Carapace (Sleek, smooth, closed shell)
    const bicepGroup = new THREE.Group();
    bicepGroup.position.set(side * 0.006, -0.11, 0.006);
    upper.add(bicepGroup);

    const bicepBodyGeo = new THREE.CylinderGeometry(0.058, 0.050, 0.19, 36, 2);
    const bicepBody = new THREE.Mesh(bicepBodyGeo, armorMat);
    bicepBody.scale.set(0.92, 1.0, 1.02);
    bicepBody.castShadow = true;
    bicepBody.receiveShadow = true;
    bicepGroup.add(bicepBody);

    // Rounded top shoulder-transition dome cap
    const bicepTopCapGeo = new THREE.SphereGeometry(0.058, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const bicepTopCap = new THREE.Mesh(bicepTopCapGeo, armorMat);
    bicepTopCap.position.set(0, 0.095, 0);
    bicepTopCap.scale.set(0.92, 0.50, 1.02);
    bicepGroup.add(bicepTopCap);

    // Bottom flush trim collar
    const bicepBottomRingGeo = new THREE.CylinderGeometry(0.052, 0.048, 0.012, 32);
    const bicepBottomRing = new THREE.Mesh(bicepBottomRingGeo, jointMat);
    bicepBottomRing.position.set(0, -0.095, 0);
    bicepGroup.add(bicepBottomRing);

    // Longitudinal Fine Front Panel Seam (Hairline seam visible in Reference Image)
    const bicepRidgeGeo = new THREE.BoxGeometry(0.005, 0.15, 0.006);
    const bicepRidge = new THREE.Mesh(bicepRidgeGeo, armorMat);
    bicepRidge.position.set(side * 0.024, 0, 0.064);
    bicepGroup.add(bicepRidge);

    // Tricep Dark Mechanical Actuator Rod
    const tricepActGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.16, 14);
    const tricepAct = new THREE.Mesh(tricepActGeo, jointMat);
    tricepAct.position.set(side * 0.006, -0.11, -0.040);
    upper.add(tricepAct);

    // Polished Piston Shaft inside Tricep Actuator
    const tricepPistonGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.13, 12);
    const tricepPiston = new THREE.Mesh(tricepPistonGeo, armorMat);
    tricepPiston.position.set(side * 0.006, -0.13, -0.040);
    upper.add(tricepPiston);

    // -------------------------------------------------------------
    // C. SIGNATURE DOUBLE-DISC ROTARY ELBOW JOINT (Reference Image Matching)
    // -------------------------------------------------------------
    for (const dSide of [-1, 1]) {
      // Parallel Dark Titanium Rotary Disc
      const elbowDiscGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.016, 36);
      const elbowDisc = new THREE.Mesh(elbowDiscGeo, jointMat);
      elbowDisc.rotation.z = Math.PI / 2;
      elbowDisc.position.set(dSide * 0.025, -0.22, 0);
      upper.add(elbowDisc);

      // Beveled Titanium Outer Trim Ring on Rotary Disc
      const discRingGeo = new THREE.TorusGeometry(0.056, 0.005, 12, 36);
      const discRing = new THREE.Mesh(discRingGeo, jointMat);
      discRing.rotation.y = Math.PI / 2;
      discRing.position.set(dSide * 0.033, -0.22, 0);
      upper.add(discRing);

      // Concentric Recessed Inner Ring
      const discInnerRingGeo = new THREE.TorusGeometry(0.036, 0.003, 10, 28);
      const discInnerRing = new THREE.Mesh(discInnerRingGeo, jointMat);
      discInnerRing.rotation.y = Math.PI / 2;
      discInnerRing.position.set(dSide * 0.033, -0.22, 0);
      upper.add(discInnerRing);
    }

    // Central Titanium Pivot Axle Pin
    const elbowAxleGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.076, 24);
    const elbowAxle = new THREE.Mesh(elbowAxleGeo, jointMat);
    elbowAxle.rotation.z = Math.PI / 2;
    elbowAxle.position.set(0, -0.22, 0);
    upper.add(elbowAxle);

    // Axle End-Cap Pins
    for (const dSide of [-1, 1]) {
      const pinCapGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.005, 18);
      const pinCap = new THREE.Mesh(pinCapGeo, jointMat);
      pinCap.rotation.z = Math.PI / 2;
      pinCap.position.set(dSide * 0.042, -0.22, 0);
      upper.add(pinCap);
    }

    // Olecranon (Posterior Elbow Tip) White Armor Shield
    const olecranonGeo = new THREE.BoxGeometry(0.046, 0.054, 0.028);
    const olecranon = new THREE.Mesh(olecranonGeo, armorMat);
    olecranon.position.set(0, -0.225, -0.042);
    olecranon.castShadow = true;
    upper.add(olecranon);

    // Anterior Flexible Conduit Rib
    const fossaConduitGeo = new THREE.TorusGeometry(0.024, 0.006, 10, 18, Math.PI * 0.7);
    const fossaConduit = new THREE.Mesh(fossaConduitGeo, jointMat);
    fossaConduit.rotation.x = Math.PI / 2;
    fossaConduit.position.set(0, -0.22, 0.018);
    upper.add(fossaConduit);

    // -------------------------------------------------------------
    // D. SCULPTED AERODYNAMIC FOREARM GAUNTLET & WRIST ROTARY ARTICULATION
    // (Solid, seamless, thick white ceramic gauntlet matching Reference Image)
    // -------------------------------------------------------------
    // Forearm Upper Rotary Connector Sleeve
    const foreSleeveGeo = new THREE.CylinderGeometry(0.058, 0.052, 0.026, 24);
    const foreSleeve = new THREE.Mesh(foreSleeveGeo, jointMat);
    foreSleeve.position.set(0, -0.012, 0);
    fore.add(foreSleeve);

    // Sculpted White Ceramic Forearm Gauntlet Group (100% solid, closed contours)
    const foreArmorGroup = new THREE.Group();
    foreArmorGroup.position.set(0, 0, 0.006);
    fore.add(foreArmorGroup);

    // 1. Signature Elbow U-Cradle Wings (Reaching UP to hug the rotary elbow disc per Reference Image)
    // Lateral Cradle Ear (outer side, directly flanking the rotary disc)
    const lateralCradleGeo = new THREE.BoxGeometry(0.010, 0.030, 0.036);
    const lateralCradle = new THREE.Mesh(lateralCradleGeo, armorMat);
    lateralCradle.position.set(side * 0.046, 0.002, 0);
    lateralCradle.rotation.z = -side * 0.10;
    lateralCradle.castShadow = true;
    foreArmorGroup.add(lateralCradle);

    // Medial Cradle Ear (inner side)
    const medialCradleGeo = new THREE.BoxGeometry(0.008, 0.024, 0.032);
    const medialCradle = new THREE.Mesh(medialCradleGeo, armorMat);
    medialCradle.position.set(-side * 0.040, 0.001, 0);
    medialCradle.rotation.z = side * 0.08;
    medialCradle.castShadow = true;
    foreArmorGroup.add(medialCradle);

    // 2. Continuous Sculpted White Ceramic Forearm Gauntlet
    // Seamless tapered solid body from elbow cradle down to wrist cuff
    const foreBodyGeo = new THREE.CylinderGeometry(0.068, 0.048, 0.196, 36);
    const foreBody = new THREE.Mesh(foreBodyGeo, armorMat);
    foreBody.position.set(0, -0.102, 0);
    foreBody.scale.set(0.96, 1.0, 1.04);
    foreBody.castShadow = true;
    foreBody.receiveShadow = true;
    foreArmorGroup.add(foreBody);

    // 3. Brachioradialis Muscle Contour (Subtle aerodynamic outer muscular flare)
    const brachioGeo = new THREE.SphereGeometry(0.066, 32, 20);
    const brachio = new THREE.Mesh(brachioGeo, armorMat);
    brachio.scale.set(0.38, 1.15, 0.65);
    brachio.position.set(side * 0.024, -0.068, 0.012);
    brachio.castShadow = true;
    foreArmorGroup.add(brachio);

    // 4. Distal Wrist Collar Rim (White ceramic cuff at wrist joint)
    const foreWristCuffGeo = new THREE.CylinderGeometry(0.050, 0.044, 0.022, 32);
    const foreWristCuff = new THREE.Mesh(foreWristCuffGeo, armorMat);
    foreWristCuff.position.set(0, -0.196, 0);
    foreWristCuff.castShadow = true;
    foreArmorGroup.add(foreWristCuff);

    // Lateral Recessed Panel Seam on Gauntlet
    const forePanelGeo = new THREE.BoxGeometry(0.004, 0.15, 0.006);
    const forePanel = new THREE.Mesh(forePanelGeo, jointMat);
    forePanel.position.set(side * 0.062, -0.100, 0.008);
    fore.add(forePanel);

    // Cybernetic Glowing Violet Accent Line along Forearm
    const foreLedGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.13, 8);
    const foreLed = new THREE.Mesh(foreLedGeo, accentGlowMat);
    foreLed.position.set(side * 0.063, -0.100, 0.008);
    fore.add(foreLed);
    ledMeshes.push(foreLed);

    // -------------------------------------------------------------
    // E. TWO-AXIS MECHANICAL WRIST JOINT
    // -------------------------------------------------------------
    // Rotary Swivel Collar
    const wristSwivelGeo = new THREE.CylinderGeometry(0.044, 0.040, 0.022, 24);
    const wristSwivel = new THREE.Mesh(wristSwivelGeo, jointMat);
    wristSwivel.position.set(0, -0.004, 0);
    hand.add(wristSwivel);

    // Multi-Ring Ribbed Mechanical Rings
    for (const wY of [-0.003, -0.010]) {
      const wRingGeo = new THREE.TorusGeometry(0.042, 0.003, 10, 24);
      const wRing = new THREE.Mesh(wRingGeo, jointMat);
      wRing.rotation.x = Math.PI / 2;
      wRing.position.set(0, wY, 0);
      hand.add(wRing);
    }

    // Flexion/Extension Cross-Axis Pivot Pin
    const wristPivotGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.046, 16);
    const wristPivot = new THREE.Mesh(wristPivotGeo, jointMat);
    wristPivot.rotation.z = Math.PI / 2;
    wristPivot.position.set(0, -0.014, 0);
    hand.add(wristPivot);

    // Lateral Styloid Process Caps
    for (const stySide of [-1, 1]) {
      const styGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.005, 14);
      const sty = new THREE.Mesh(styGeo, armorMat);
      sty.rotation.z = Math.PI / 2;
      sty.position.set(stySide * 0.026, -0.014, 0);
      hand.add(sty);
    }

    // -------------------------------------------------------------
    // F. HIGH-PRECISION ARTICULATED HAND CHASSIS & WHITE DORSAL METACARPAL SHIELD
    // (Anatomically aligned with forearm gauntlet: Palm medial, Dorsal shield lateral)
    // -------------------------------------------------------------
    // Dark Titanium Carpal / Metacarpal Palm Chassis
    const palmChassisGeo = new THREE.BoxGeometry(0.022, 0.056, 0.054);
    const palmChassis = new THREE.Mesh(palmChassisGeo, jointMat);
    palmChassis.position.set(0, -0.036, 0);
    palmChassis.castShadow = true;
    hand.add(palmChassis);

    // Sculpted White Ceramic Dorsal Metacarpal Shield (Back of hand, on the LATERAL / outer side)
    const dorsalShieldGeo = new THREE.BoxGeometry(0.010, 0.054, 0.056);
    const dorsalShield = new THREE.Mesh(dorsalShieldGeo, armorMat);
    dorsalShield.position.set(side * 0.012, -0.035, 0);
    dorsalShield.castShadow = true;
    dorsalShield.receiveShadow = true;
    hand.add(dorsalShield);

    // Dark Titanium Carpal Collar Ring at top of hand
    const carpalCuffGeo = new THREE.TorusGeometry(0.036, 0.0035, 12, 28);
    const carpalCuff = new THREE.Mesh(carpalCuffGeo, jointMat);
    carpalCuff.rotation.x = Math.PI / 2;
    carpalCuff.position.set(0, -0.010, 0.002);
    hand.add(carpalCuff);

    // Cybernetic Glowing Violet Accent Seam on Lateral Dorsal Shield
    const dorsalAccentGeo = new THREE.BoxGeometry(0.003, 0.004, 0.034);
    const dorsalAccent = new THREE.Mesh(dorsalAccentGeo, accentGlowMat);
    dorsalAccent.position.set(side * 0.018, -0.035, 0);
    hand.add(dorsalAccent);
    ledMeshes.push(dorsalAccent);

    // Segmented Palmar Dark Grip Pads (Inner palm surface, on the MEDIAL / inner side)
    for (const pY of [-0.028, -0.046]) {
      const palmPadGeo = new THREE.BoxGeometry(0.004, 0.012, 0.044);
      const palmPad = new THREE.Mesh(palmPadGeo, jointMat);
      palmPad.position.set(-side * 0.011, pY, 0);
      hand.add(palmPad);
    }

    // Metacarpophalangeal (MCP) Knuckle Bar (4 cylindrical pivot hinges arranged front-to-back along Z)
    for (let k = 0; k < 4; k++) {
      const kZ = 0.020 - k * 0.0135;
      const knuckleGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.012, 12);
      const knuckle = new THREE.Mesh(knuckleGeo, jointMat);
      knuckle.rotation.x = Math.PI / 2;
      knuckle.position.set(0, -0.064, kZ);
      hand.add(knuckle);

      // White ceramic knuckle cap on lateral (outer) side
      const knuckleCapGeo = new THREE.SphereGeometry(0.0065, 14, 14);
      const knuckleCap = new THREE.Mesh(knuckleCapGeo, armorMat);
      knuckleCap.position.set(side * 0.008, -0.064, kZ);
      knuckleCap.scale.set(0.85, 0.9, 0.9);
      hand.add(knuckleCap);
    }

    // -------------------------------------------------------------
    // G. ARTICULATED OPPOSABLE THUMB (Positioned at Front-Lateral, Curled Inward)
    // -------------------------------------------------------------
    const thumbGroup = new THREE.Group();
    thumbGroup.name = side === -1 ? 'ThumbLeft' : 'ThumbRight';
    thumbGroup.position.set(side * 0.010, -0.030, 0.024);
    thumbGroup.rotation.set(0.42, side * 0.32, -side * 0.38);
    hand.add(thumbGroup);

    // Thenar Base Swivel Ball
    const thumbBallGeo = new THREE.SphereGeometry(0.010, 16, 16);
    const thumbBall = new THREE.Mesh(thumbBallGeo, jointMat);
    thumbGroup.add(thumbBall);

    // Thumb Proximal Phalanx
    const thumbProxGeo = new THREE.CylinderGeometry(0.0065, 0.0055, 0.026, 12);
    const thumbProx = new THREE.Mesh(thumbProxGeo, jointMat);
    thumbProx.position.set(0, -0.013, 0);
    thumbGroup.add(thumbProx);

    // Thumb Dorsal White Armor Shell
    const thumbArmorGeo = new THREE.BoxGeometry(0.0075, 0.023, 0.012);
    const thumbArmor = new THREE.Mesh(thumbArmorGeo, armorMat);
    thumbArmor.position.set(side * 0.0055, -0.013, 0.004);
    thumbGroup.add(thumbArmor);

    // Thumb Interphalangeal Hinge Joint
    const thumbHingeGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.010, 10);
    const thumbHinge = new THREE.Mesh(thumbHingeGeo, jointMat);
    thumbHinge.rotation.x = Math.PI / 2;
    thumbHinge.position.set(0, -0.026, 0);
    thumbGroup.add(thumbHinge);

    // Thumb Distal Phalanx
    const thumbDistalGeo = new THREE.CylinderGeometry(0.0055, 0.0042, 0.020, 10);
    const thumbDistal = new THREE.Mesh(thumbDistalGeo, jointMat);
    thumbDistal.position.set(-side * 0.004, -0.036, -0.004);
    thumbDistal.rotation.z = -side * 0.30;
    thumbGroup.add(thumbDistal);

    // Thumb Distal White Armor Plate
    const thumbDistArmorGeo = new THREE.BoxGeometry(0.0065, 0.017, 0.009);
    const thumbDistArmor = new THREE.Mesh(thumbDistArmorGeo, armorMat);
    thumbDistArmor.position.set(side * 0.0045, -0.036, 0.004);
    thumbGroup.add(thumbDistArmor);

    // Thumb Tactile Sensor Cap
    const thumbTipGeo = new THREE.SphereGeometry(0.0042, 12, 12);
    const thumbTip = new THREE.Mesh(thumbTipGeo, jointMat);
    thumbTip.position.set(-side * 0.006, -0.046, -0.006);
    thumbGroup.add(thumbTip);

    // -------------------------------------------------------------
    // H. FOUR ARTICULATED SEGMENTED FINGERS (Arranged front-to-back along Z)
    // -------------------------------------------------------------
    const fingerSpecs = [
      { name: 'Index',  offsetZ:  0.020, proxLen: 0.032, midLen: 0.022, distLen: 0.016, curl: 0.58 },
      { name: 'Middle', offsetZ:  0.006, proxLen: 0.036, midLen: 0.025, distLen: 0.018, curl: 0.65 },
      { name: 'Ring',   offsetZ: -0.007, proxLen: 0.033, midLen: 0.023, distLen: 0.017, curl: 0.72 },
      { name: 'Pinky',  offsetZ: -0.020, proxLen: 0.028, midLen: 0.019, distLen: 0.014, curl: 0.80 },
    ];

    for (const spec of fingerSpecs) {
      const fingerGroup = new THREE.Group();
      fingerGroup.name = `${spec.name}Finger_${side === -1 ? 'L' : 'R'}`;
      fingerGroup.position.set(0, -0.064, spec.offsetZ);
      fingerGroup.rotation.set(0, 0, -side * spec.curl * 0.52);
      hand.add(fingerGroup);

      // 1. Proximal Phalanx Bone
      const pBoneGeo = new THREE.CylinderGeometry(0.0065, 0.0055, spec.proxLen, 12);
      const pBone = new THREE.Mesh(pBoneGeo, jointMat);
      pBone.position.set(0, -spec.proxLen * 0.5, 0);
      fingerGroup.add(pBone);

      // Dedicated Proximal Dorsal White Armor Shield Plate (Lateral / outer side)
      const pArmorGeo = new THREE.BoxGeometry(0.008, spec.proxLen * 0.88, 0.014);
      const pArmor = new THREE.Mesh(pArmorGeo, armorMat);
      pArmor.position.set(side * 0.006, -spec.proxLen * 0.5, 0);
      pArmor.castShadow = true;
      fingerGroup.add(pArmor);

      // 2. Proximal Interphalangeal (PIP) Knuckle Hinge
      const pipHingeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.012, 12);
      const pipHinge = new THREE.Mesh(pipHingeGeo, jointMat);
      pipHinge.rotation.x = Math.PI / 2;
      pipHinge.position.set(0, -spec.proxLen, 0);
      fingerGroup.add(pipHinge);

      // PIP White Armor Knuckle Cap (Lateral)
      const pipCapGeo = new THREE.SphereGeometry(0.0068, 14, 14);
      const pipCap = new THREE.Mesh(pipCapGeo, armorMat);
      pipCap.position.set(side * 0.006, -spec.proxLen, 0);
      pipCap.scale.set(0.9, 0.95, 0.95);
      fingerGroup.add(pipCap);

      // 3. Intermediate Phalanx Group (Curled naturally inward toward medial palm)
      const midGroup = new THREE.Group();
      midGroup.name = `${spec.name}FingerMid_${side === -1 ? 'L' : 'R'}`;
      midGroup.position.set(0, -spec.proxLen, 0);
      midGroup.rotation.z = -side * spec.curl * 0.62;
      fingerGroup.add(midGroup);

      const mBoneGeo = new THREE.CylinderGeometry(0.0058, 0.0048, spec.midLen, 10);
      const mBone = new THREE.Mesh(mBoneGeo, jointMat);
      mBone.position.set(0, -spec.midLen * 0.5, 0);
      midGroup.add(mBone);

      // Intermediate Dorsal White Armor Shield Plate
      const mArmorGeo = new THREE.BoxGeometry(0.007, spec.midLen * 0.85, 0.013);
      const mArmor = new THREE.Mesh(mArmorGeo, armorMat);
      mArmor.position.set(side * 0.0055, -spec.midLen * 0.5, 0);
      midGroup.add(mArmor);

      // 4. Distal Interphalangeal (DIP) Joint & Fingertip Pad
      const dipGroup = new THREE.Group();
      dipGroup.name = `${spec.name}FingerDip_${side === -1 ? 'L' : 'R'}`;
      dipGroup.position.set(0, -spec.midLen, 0);
      dipGroup.rotation.z = -side * spec.curl * 0.68;
      midGroup.add(dipGroup);

      const dPadGeo = new THREE.CylinderGeometry(0.0048, 0.0038, spec.distLen, 10);
      const dPad = new THREE.Mesh(dPadGeo, jointMat);
      dPad.position.set(0, -spec.distLen * 0.5, 0);
      dipGroup.add(dPad);

      // Distal White Armor Plate
      const dArmorGeo = new THREE.BoxGeometry(0.0065, spec.distLen * 0.80, 0.012);
      const dArmor = new THREE.Mesh(dArmorGeo, armorMat);
      dArmor.position.set(side * 0.005, -spec.distLen * 0.5, 0);
      dipGroup.add(dArmor);

      // Tactile Sensor Cap on Fingertip
      const tipCapGeo = new THREE.SphereGeometry(0.0048, 12, 12);
      const tipCap = new THREE.Mesh(tipCapGeo, jointMat);
      tipCap.position.set(0, -spec.distLen, 0);
      dipGroup.add(tipCap);
    }
  }

  // Natural heroic resting arm posture matching Reference Image
  leftShoulder.rotation.set(0.0, 0.0, -0.02);
  rightShoulder.rotation.set(0.0, 0.0, 0.02);
  leftUpperArm.rotation.set(-0.16, 0.06, -0.08);
  rightUpperArm.rotation.set(-0.10, -0.04, 0.10);
  leftForearm.rotation.set(-0.42, 0.16, 0.08);
  rightForearm.rotation.set(-0.18, -0.02, -0.04);
  leftHand.rotation.set(0.18, 0.10, -0.06);
  rightHand.rotation.set(0.06, -0.12, 0.04);

  return {
    root,
    torso,
    chestLogo,
    neck,
    head,
    faceVisor,
    eyeTrackingGroup,
    eyeLeft,
    eyeRight,
    visorLightBar,
    earRingLeft: earRingLeftMesh,
    earRingRight: earRingRightMesh,
    leftShoulder,
    rightShoulder,
    leftUpperArm,
    rightUpperArm,
    leftForearm,
    rightForearm,
    leftHand,
    rightHand,
    ledMeshes,
    materials: {
      armor: armorMat,
      joint: jointMat,
      visor: visorMat,
      eyeGlow: eyeGlowMat,
      earRingGlow: earRingGlowMat,
      chestGlow: chestGlowMat,
      accentGlow: accentGlowMat,
    },
  };
}
