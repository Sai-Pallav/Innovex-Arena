import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { TORSO_CONFIG } from './TorsoConfig';

export interface ShoulderMountNodes {
  group: THREE.Group;
  socketRim: THREE.Mesh;
  rotarySocket: THREE.Mesh;
  accentRing: THREE.Mesh;
  armorBridge: THREE.Mesh;
  ledMeshes: THREE.Mesh[];
}

export interface ChestArmorNodes {
  group: THREE.Group;
  mainShell: THREE.Mesh;
  centerPlate: THREE.Mesh;
  centerPanel: THREE.Mesh;
  leftSidePanel: THREE.Mesh;
  leftPanel: THREE.Mesh;
  rightSidePanel: THREE.Mesh;
  rightPanel: THREE.Mesh;
  leftLightStrip: THREE.Mesh;
  rightLightStrip: THREE.Mesh;
  leftFlankArmor: THREE.Mesh;
  rightFlankArmor: THREE.Mesh;
  logo: THREE.Mesh;
  ledMeshes: THREE.Mesh[];
}

export interface UpperTorsoFrameNodes {
  group: THREE.Group;
  frameSpine: THREE.Mesh;
  frameClavicleLeft: THREE.Mesh;
  frameClavicleRight: THREE.Mesh;
  neckCollar: THREE.Mesh;
  neckCollarSleeve: THREE.Mesh;
  backArmor: THREE.Mesh;
  backLightBar: THREE.Mesh;
  lowerFrame: THREE.Group;
  ledMeshes: THREE.Mesh[];
}

export interface ChestAssemblyNodes {
  group: THREE.Group;
  chestArmor: ChestArmorNodes;
  upperTorsoFrame: UpperTorsoFrameNodes;
  shoulderMountLeft: ShoulderMountNodes;
  shoulderMountRight: ShoulderMountNodes;
  ledMeshes: THREE.Mesh[];
}

/**
 * 1. CHEST LOGO (Innovex "A")
 * Sharp, minimal, purple emissive stylized "A" logo.
 * Integrated directly onto the central breastplate matching the reference sheet.
 */
export function createChestLogo(materials: RobotMaterialPalette): THREE.Mesh {
  const hw = 0.024;
  const hh = 0.028;

  const shape = new THREE.Shape();
  // Outer apex
  shape.moveTo(0, hh);
  // Outer right leg
  shape.lineTo(hw, -hh);
  shape.lineTo(hw * 0.54, -hh);
  // Crossbar right
  shape.lineTo(hw * 0.34, -hh * 0.10);
  shape.lineTo(-hw * 0.34, -hh * 0.10);
  // Outer left leg
  shape.lineTo(-hw * 0.54, -hh);
  shape.lineTo(-hw, -hh);
  shape.closePath();

  // Inner triangular cutout
  const hole = new THREE.Path();
  hole.moveTo(0, hh * 0.50);
  hole.lineTo(-hw * 0.22, 0.015);
  hole.lineTo(hw * 0.22, 0.015);
  hole.closePath();
  shape.holes.push(hole);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.005,
    bevelEnabled: true,
    bevelThickness: 0.0014,
    bevelSize: 0.0012,
    bevelSegments: 2,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  const logo = new THREE.Mesh(geo, materials.purpleEmissive);
  logo.name = 'ChestLogo_A';
  logo.castShadow = false;
  return logo;
}

/**
 * 2. CENTRAL CHEST PLATE (Hero Breastplate)
 * Reconstructed directly from Reference Sheet: "CHEST PLATE (FRONT - DETAILED)" & "EXPLODED VIEW"
 * Features:
 * - Scooped neck collar cutout
 * - Broad clavicle shoulders
 * - Clean diagonal seams tapering down to a pointed V-tongue over the upper abdomen
 * - Sculpted 3D aerodynamic convex curvature bulging forward
 * - Smooth beveled perimeter
 */
function createCentralChestPlate(materials: RobotMaterialPalette): {
  mesh: THREE.Mesh;
  frontZ: number;
} {
  const shape = new THREE.Shape();
  // Scooped collar neckline dipping gracefully in front of the neck
  shape.moveTo(-0.082, 0.126);
  shape.quadraticCurveTo(0, 0.098, 0.082, 0.126);
  // Broad clavicle shoulder contour sweeping smoothly towards deltoid
  shape.quadraticCurveTo(0.124, 0.126, 0.162, 0.118);
  // Upper pectoral outer shoulder contour
  shape.quadraticCurveTo(0.178, 0.094, 0.172, 0.072);
  // Pectoral flank seam: curves inward gradually rather than forming an acute triangle
  shape.bezierCurveTo(0.150, 0.012, 0.112, -0.046, 0.086, -0.068);
  // Lower sternal margin narrowing gradually to meet upper abdomen
  shape.quadraticCurveTo(0.076, -0.095, 0.064, -0.118);
  shape.lineTo(-0.064, -0.118);
  // Symmetrical return left
  shape.quadraticCurveTo(-0.076, -0.095, -0.086, -0.068);
  shape.bezierCurveTo(-0.112, -0.046, -0.150, 0.012, -0.172, 0.072);
  shape.quadraticCurveTo(-0.178, 0.094, -0.162, 0.118);
  shape.quadraticCurveTo(-0.124, 0.126, -0.082, 0.126);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.0065,
    bevelSize: 0.0055,
    bevelSegments: 4,
    curveSegments: 36,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  // Anatomical compound 3D curvature: molded pectoral dome bulge & ribcage wrap
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (z > 0) {
      const nx = Math.min(1, Math.abs(x) / 0.17);
      const ny = Math.min(1, Math.abs(y - 0.015) / 0.13);
      // Molded pectoral fullness
      const bulge = Math.cos(nx * (Math.PI / 2)) * Math.cos(ny * (Math.PI / 2)) * 0.016;
      // Lateral ribcage wrap: curve edges gently back for anatomical fit
      const wrap = -Math.pow(nx, 2.0) * 0.011;
      pos.setZ(i, z + bulge + wrap);
    }
  }
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, materials.armor);
  mesh.name = 'ChestPlate_Central';
  mesh.position.set(0, 0.018, 0.052);
  mesh.rotation.x = -0.05;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return { mesh, frontZ: 0.024 * 0.5 + 0.007 + 0.018 };
}

/**
 * 3. CHEST SIDE PANELS & DIAGONAL PURPLE LIGHT STRIPS
 * Molded lateral flank armor panels matching the central plate's refined seam:
 * - Upper chest wraps smoothly toward the shoulder socket
 * - Embedded purple emissive light strip along the diagonal seam
 */
function createChestSidePanel(
  side: -1 | 1,
  materials: RobotMaterialPalette
): { panel: THREE.Mesh; lightStrip: THREE.Mesh } {
  const shape = new THREE.Shape();
  // Inner curved seam parallel to central breastplate with controlled mechanical gap
  shape.moveTo(side * 0.176, 0.076);
  shape.bezierCurveTo(side * 0.154, 0.014, side * 0.116, -0.042, side * 0.090, -0.064);
  // Lower horizontal contour meeting flank armor
  shape.lineTo(side * 0.138, -0.076);
  // Outer lateral contour wrapping smoothly toward shoulder socket
  shape.bezierCurveTo(side * 0.188, -0.030, side * 0.190, 0.040, side * 0.178, 0.118);
  // Clavicle shoulder connection
  shape.lineTo(side * 0.158, 0.118);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.020,
    bevelEnabled: true,
    bevelThickness: 0.0055,
    bevelSize: 0.0045,
    bevelSegments: 4,
    curveSegments: 24,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  // Subtle 3D curvature wrapping toward the sides
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (z > 0) {
      const d = Math.abs(x) / 0.18;
      pos.setZ(i, z + Math.sin(d * Math.PI) * 0.008);
    }
  }
  geo.computeVertexNormals();

  const panel = new THREE.Mesh(geo, materials.armor);
  panel.name = side === -1 ? 'ChestSidePanel_Left' : 'ChestSidePanel_Right';
  panel.position.set(side * 0.126, 0.018, 0.044);
  panel.rotation.y = -side * 0.16;
  panel.rotation.x = -0.05;
  panel.castShadow = true;
  panel.receiveShadow = true;

  // Diagonal Purple Emissive Light Strip
  const stripLength = 0.136;
  const stripGeo = new THREE.CylinderGeometry(0.0036, 0.0036, stripLength, 12);
  const lightStrip = new THREE.Mesh(stripGeo, materials.purpleEmissive);
  lightStrip.name = side === -1 ? 'ChestLightStrip_Left' : 'ChestLightStrip_Right';

  // Position along the diagonal seam between central plate and side panel
  lightStrip.position.set(side * 0.120, 0.020, 0.064);
  // Diagonal slant matching the seam (~28 degrees = ~0.49 rad)
  lightStrip.rotation.z = -side * 0.49;
  lightStrip.rotation.x = -0.05;

  return { panel, lightStrip };
}

/**
 * 4. LOWER FLANK / SIDE INSERT ARMOR
 * Reference Exploded View: Lower Flank Inserts
 * Extends from under the side panels to wrap the lower ribcage to the back.
 */
function createChestFlankArmor(
  side: -1 | 1,
  materials: RobotMaterialPalette
): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.042);
  shape.lineTo(0.044, 0.034);
  shape.bezierCurveTo(0.052, -0.005, 0.046, -0.050, 0.028, -0.075);
  shape.lineTo(-0.014, -0.070);
  shape.bezierCurveTo(-0.020, -0.025, -0.014, 0.015, 0, 0.042);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.048,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 3,
  });
  geo.center();

  const mesh = new THREE.Mesh(geo, materials.armor);
  mesh.name = side === -1 ? 'ChestFlankArmor_Left' : 'ChestFlankArmor_Right';
  mesh.position.set(side * 0.148, -0.028, 0.012);
  mesh.rotation.y = -side * 0.36;
  mesh.rotation.x = -0.04;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * 5. MAIN UNDER-SHELL ARMOR
 * Foundational structural backing plate providing physical armor depth and black mechanical contrast.
 */
function createChestMainShell(materials: RobotMaterialPalette): THREE.Mesh {
  const shape = new THREE.Shape();
  // Scooped neckline matching breastplate
  shape.moveTo(-0.076, 0.120);
  shape.quadraticCurveTo(0, 0.096, 0.076, 0.120);
  // Clavicle line
  shape.lineTo(0.144, 0.116);
  // Outer chest curvature
  shape.bezierCurveTo(0.156, 0.065, 0.152, 0.010, 0.138, -0.040);
  // Lower taper
  shape.lineTo(0.098, -0.082);
  shape.lineTo(0.032, -0.112);
  shape.lineTo(-0.032, -0.112);
  shape.lineTo(-0.098, -0.082);
  shape.lineTo(-0.138, -0.040);
  shape.bezierCurveTo(-0.152, 0.010, -0.156, 0.065, -0.144, 0.124);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  geo.center();

  const mesh = new THREE.Mesh(geo, materials.joint);
  mesh.name = 'ChestMainShell_UnderArmor';
  mesh.position.set(0, 0.012, 0.032);
  mesh.rotation.x = -0.05;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * 6. UPPER TORSO FRAME (Back Armor, Spine & Neck Collar)
 * Reconstructed directly from Reference: "BACK VIEW" & Section 6
 * - Sculpted white chevron/trapezius backplate tapering to mid-spine
 * - Central vertebrae spine core with dark titanium finish
 * - Transverse clavicle structural beams connecting to shoulder mounts
 * - Neck collar gorget & sleeve at Y=0.142, Z=0.012
 */
export function createUpperTorsoFrame(materials: RobotMaterialPalette): UpperTorsoFrameNodes {
  const group = new THREE.Group();
  group.name = 'UpperTorsoFrame';

  const ledMeshes: THREE.Mesh[] = [];

  // Central dark spinal column
  const spineGeo = new THREE.CylinderGeometry(0.068, 0.060, 0.32, 24);
  const frameSpine = new THREE.Mesh(spineGeo, materials.joint);
  frameSpine.name = 'ChestFrameSpine';
  frameSpine.position.set(0, -0.010, -0.020);
  frameSpine.scale.set(1.08, 1.0, 0.88);
  frameSpine.castShadow = true;
  frameSpine.receiveShadow = true;
  group.add(frameSpine);

  // Transverse Clavicle Structural Beams (Connecting center spine to shoulder sockets)
  const clavicleBeamGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.170, 14);

  const frameClavicleLeft = new THREE.Mesh(clavicleBeamGeo, materials.joint);
  frameClavicleLeft.rotation.z = Math.PI / 2;
  frameClavicleLeft.position.set(-0.110, 0.065, 0.008);
  group.add(frameClavicleLeft);

  const frameClavicleRight = new THREE.Mesh(clavicleBeamGeo, materials.joint);
  frameClavicleRight.rotation.z = Math.PI / 2;
  frameClavicleRight.position.set(0.110, 0.065, 0.008);
  group.add(frameClavicleRight);

  // Recessed White Ceramic Gorget Socket Bezel nestled inside scooped neckline
  const gorgetShape = new THREE.Shape();
  const gRx = TORSO_CONFIG.chest.collarRadius;
  const gRz = TORSO_CONFIG.chest.collarRadius * 0.90;
  gorgetShape.absellipse(0, 0, gRx, gRz, 0, Math.PI * 2, false, 0);

  const gorgetHole = new THREE.Path();
  const gIrx = gRx * 0.80;
  const gIrz = gRz * 0.80;
  gorgetHole.absellipse(0, 0, gIrx, gIrz, 0, Math.PI * 2, true, 0);
  gorgetShape.holes.push(gorgetHole);

  const gorgetGeo = new THREE.ExtrudeGeometry(gorgetShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.0028,
    bevelSize: 0.0022,
    bevelSegments: 2,
    curveSegments: 32,
  });
  gorgetGeo.center();

  const neckCollar = new THREE.Mesh(gorgetGeo, materials.armor);
  neckCollar.name = 'NeckCollar';
  neckCollar.rotation.x = Math.PI / 2 + 0.06;
  neckCollar.position.set(0, TORSO_CONFIG.chest.collarY, TORSO_CONFIG.chest.collarZ);
  neckCollar.castShadow = true;
  neckCollar.receiveShadow = true;
  group.add(neckCollar);

  // Stepped inner dark titanium collar sleeve where neck pedestal mounts
  const collarSleeveGeo = new THREE.CylinderGeometry(gIrx * 1.02, gIrx * 0.96, 0.030, 32);
  const neckCollarSleeve = new THREE.Mesh(collarSleeveGeo, materials.joint);
  neckCollarSleeve.position.set(0, TORSO_CONFIG.chest.collarY - 0.006, TORSO_CONFIG.chest.collarZ);
  neckCollarSleeve.scale.set(1.0, 1.0, gRz / gRx);
  neckCollarSleeve.castShadow = true;
  group.add(neckCollarSleeve);

  // Sculpted White Upper Back Armor (Reference Sheet: "BACK VIEW")
  // Trapezius/scapular plate with aerodynamic curved neckline cupping collar cleanly
  const backShape = new THREE.Shape();
  // Curved trapezius neckline (eliminates flat horizontal bar behind neck)
  backShape.moveTo(-0.128, 0.106);
  backShape.quadraticCurveTo(-0.076, 0.122, -0.068, 0.122);
  backShape.quadraticCurveTo(0, 0.108, 0.068, 0.122);
  backShape.quadraticCurveTo(0.076, 0.122, 0.128, 0.106);
  backShape.bezierCurveTo(0.136, 0.045, 0.126, -0.065, 0.086, -0.145);
  backShape.lineTo(0.038, -0.185);
  backShape.lineTo(-0.038, -0.185);
  backShape.lineTo(-0.086, -0.145);
  backShape.bezierCurveTo(-0.126, -0.065, -0.136, 0.045, -0.128, 0.106);
  backShape.closePath();

  const backGeo = new THREE.ExtrudeGeometry(backShape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.005,
    bevelSegments: 3,
  });
  backGeo.center();

  const backArmor = new THREE.Mesh(backGeo, materials.armor);
  backArmor.name = 'ChestBackArmor';
  backArmor.position.set(0, 0.015, -0.085);
  backArmor.rotation.x = 0.06;
  backArmor.castShadow = true;
  backArmor.receiveShadow = true;
  group.add(backArmor);

  // Horizontal Purple Emissive Scapula Light Bar on Back Armor
  const backLightGeo = new THREE.BoxGeometry(0.108, 0.0060, 0.006);
  const backLightBar = new THREE.Mesh(backLightGeo, materials.purpleEmissive);
  backLightBar.name = 'BackLightBar';
  backLightBar.position.set(0, 0.058, -0.100);
  group.add(backLightBar);
  ledMeshes.push(backLightBar);

  // LOWER CHEST FRAME & SUB-STERNAL MECHANICAL TRANSITION
  // Creates an engineered physical bridge: CHEST ARMOR -> INNER BLACK STRUCTURE -> UPPER ABDOMEN
  const lowerFrame = new THREE.Group();
  lowerFrame.name = 'LowerChestFrame';
  group.add(lowerFrame);

  // 1. Sternal-Spinal chassis mounting core (safely recessed behind armor)
  const chassisBlockGeo = new THREE.BoxGeometry(0.092, 0.036, 0.058);
  const chassisBlock = new THREE.Mesh(chassisBlockGeo, materials.joint);
  chassisBlock.name = 'SubSternalChassis';
  chassisBlock.position.set(0, -0.096, -0.008);
  chassisBlock.castShadow = true;
  chassisBlock.receiveShadow = true;
  lowerFrame.add(chassisBlock);

  // 2. Central vertebral gimbal socket linking down into upper abdomen
  const gimbalSocketGeo = new THREE.CylinderGeometry(0.048, 0.044, 0.024, 32);
  const gimbalSocket = new THREE.Mesh(gimbalSocketGeo, materials.joint);
  gimbalSocket.name = 'SpineGimbalSocket';
  gimbalSocket.position.set(0, -0.110, -0.004);
  gimbalSocket.scale.set(1.06, 1.0, 0.88);
  gimbalSocket.castShadow = true;
  lowerFrame.add(gimbalSocket);

  // 3. Bilateral sub-pectoral diagonal bracing trusses (Left & Right)
  for (const side of [-1, 1]) {
    // Primary diagonal support strut
    const strutGeo = new THREE.CylinderGeometry(0.0048, 0.0042, 0.048, 14);
    const strut = new THREE.Mesh(strutGeo, materials.joint);
    strut.position.set(side * 0.046, -0.092, 0.018);
    strut.rotation.z = side * 0.28;
    strut.rotation.x = -0.15;
    strut.castShadow = true;
    lowerFrame.add(strut);

    // Mechanical pivot knuckle at base of strut
    const knuckleGeo = new THREE.SphereGeometry(0.0065, 12, 10);
    const knuckle = new THREE.Mesh(knuckleGeo, materials.joint);
    knuckle.position.set(side * 0.052, -0.112, 0.016);
    lowerFrame.add(knuckle);

    // 4. Subtle structural mounting brackets connecting chest -> abdomen (Priority 1)
    // Visually clamps the lower chest frame down into the top shoulders of Segment 01
    const bracketShape = new THREE.Shape();
    bracketShape.moveTo(-0.006, 0.014);
    bracketShape.lineTo(0.006, 0.014);
    bracketShape.lineTo(0.008, -0.012);
    bracketShape.lineTo(0.003, -0.016);
    bracketShape.lineTo(-0.008, -0.010);
    bracketShape.closePath();

    const bracketGeo = new THREE.ExtrudeGeometry(bracketShape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.0018,
      bevelSegments: 2,
    });
    bracketGeo.center();

    const bracket = new THREE.Mesh(bracketGeo, materials.joint);
    bracket.name = side === -1 ? 'ChestAbdomenBracketLeft' : 'ChestAbdomenBracketRight';
    bracket.position.set(side * 0.060, -0.110, 0.026);
    bracket.rotation.z = -side * 0.12;
    bracket.rotation.x = -0.08;
    bracket.castShadow = true;
    bracket.receiveShadow = true;
    lowerFrame.add(bracket);
  }

  return {
    group,
    frameSpine,
    frameClavicleLeft,
    frameClavicleRight,
    neckCollar,
    neckCollarSleeve,
    backArmor,
    backLightBar,
    lowerFrame,
    ledMeshes,
  };
}

/**
 * 7. SHOULDER CONNECTION SOCKET (Section 5)
 * Creates chest-side socket housing:
 * - Black cylindrical mechanical housing
 * - Circular rotary joint
 * - Small metallic rings
 * - Purple emissive accent ring
 * - White armor bridge mantle surrounding the mechanism
 * Connects to robot arm at X = ±0.205, Y = 0.065, Z = 0.012.
 */
export function createShoulderMount(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ShoulderMountNodes {
  const group = new THREE.Group();
  group.name = side === -1 ? 'ShoulderMountLeft' : 'ShoulderMountRight';
  group.position.set(
    side * TORSO_CONFIG.chest.shoulderMountX,
    TORSO_CONFIG.chest.shoulderMountY,
    TORSO_CONFIG.chest.shoulderMountZ
  );

  const ledMeshes: THREE.Mesh[] = [];

  // 1. Heavy-duty cast titanium clavicle trunnion sleeve anchoring inward into chest frame
  // Bridges the horizontal span between lateral chest armor and the shoulder joint
  const trunnionGeo = new THREE.CylinderGeometry(0.046, 0.052, 0.044, 24);
  const trunnionSleeve = new THREE.Mesh(trunnionGeo, materials.joint);
  trunnionSleeve.rotation.z = Math.PI / 2;
  trunnionSleeve.position.set(-side * 0.022, 0, 0);
  trunnionSleeve.castShadow = true;
  trunnionSleeve.receiveShadow = true;
  group.add(trunnionSleeve);

  // 2. Structural reinforcement gusset ribs anchoring sleeve to chest frame
  for (let g = 0; g < 3; g++) {
    const angle = (g / 3) * Math.PI - Math.PI / 2;
    const gussetGeo = new THREE.BoxGeometry(0.036, 0.008, 0.018);
    const gusset = new THREE.Mesh(gussetGeo, materials.joint);
    gusset.position.set(-side * 0.024, Math.sin(angle) * 0.038, Math.cos(angle) * 0.038);
    gusset.rotation.x = angle;
    gusset.castShadow = true;
    group.add(gusset);
  }

  // 3. Heavy-Duty Circular Mounting Flange with 6 Hex Fasteners
  const flangeGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.006, 24);
  const mountFlange = new THREE.Mesh(flangeGeo, materials.joint);
  mountFlange.rotation.z = Math.PI / 2;
  mountFlange.position.set(-side * 0.004, 0, 0);
  mountFlange.castShadow = true;
  group.add(mountFlange);

  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0035, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(
      -side * 0.001,
      Math.sin(angle) * 0.044,
      Math.cos(angle) * 0.044
    );
    group.add(bolt);
  }

  // 4. Dark titanium mechanical rotary socket cylinder
  const socketGeo = new THREE.CylinderGeometry(0.048, 0.050, 0.016, 24);
  const rotarySocket = new THREE.Mesh(socketGeo, materials.joint);
  rotarySocket.name = side === -1 ? 'SocketLeft' : 'SocketRight';
  rotarySocket.rotation.z = Math.PI / 2;
  rotarySocket.position.set(-side * 0.002, 0, 0);
  rotarySocket.castShadow = true;
  rotarySocket.receiveShadow = true;
  group.add(rotarySocket);

  // 5. Socket Outer Rim Collar
  const rimGeo = new THREE.TorusGeometry(0.048, 0.0035, 8, 24);
  const socketRim = new THREE.Mesh(rimGeo, materials.joint);
  socketRim.rotation.y = Math.PI / 2;
  socketRim.position.set(-side * 0.002, 0, 0);
  group.add(socketRim);

  // 6. Interior bearing race ring & Purple Accent Ring
  const ringGeo = new THREE.TorusGeometry(0.038, 0.0020, 8, 24);
  const accentRing = new THREE.Mesh(ringGeo, materials.purpleEmissive);
  accentRing.name = side === -1 ? 'ShoulderAccentRingLeft' : 'ShoulderAccentRingRight';
  accentRing.rotation.y = Math.PI / 2;
  accentRing.position.set(0, 0, 0);
  group.add(accentRing);
  ledMeshes.push(accentRing);

  // 7. Upper Actuator Clevis Anchor (Mates with shoulder damper strut)
  const actBracketGeo = new THREE.BoxGeometry(0.012, 0.018, 0.014);
  const actBracket = new THREE.Mesh(actBracketGeo, materials.joint);
  actBracket.position.set(-side * 0.010, 0.044, 0.012);
  actBracket.castShadow = true;
  group.add(actBracket);

  // White Armor Clavicle Connection Mantle (Removed per user request to remove white shoulder parts)
  const armorBridge = new THREE.Mesh();
  armorBridge.name = side === -1 ? 'ArmorBridgeLeft' : 'ArmorBridgeRight';
  armorBridge.visible = false;
  group.add(armorBridge);

  return {
    group,
    socketRim,
    rotarySocket,
    accentRing,
    armorBridge,
    ledMeshes,
  };
}

/**
 * 8. COMPLETE MODULAR CHEST ASSEMBLY ROOT
 * Assembles all modular components into the cohesive hierarchy:
 *
 * ChestRoot
 *  ├── ChestArmor (Group)
 *  │    ├── ChestMainShell
 *  │    ├── ChestPlate_Central
 *  │    ├── ChestLogo_A
 *  │    ├── ChestSidePanel_Left & Right
 *  │    ├── ChestLightStrip_Left & Right (Purple Emissive Diagonal Strips)
 *  │    └── ChestFlankArmor_Left & Right
 *  ├── UpperTorsoFrame (Group)
 *  │    ├── ChestFrameSpine
 *  │    ├── FrameClavicleLeft & Right
 *  │    ├── NeckCollar & Sleeve (Neck connection)
 *  │    ├── ChestBackArmor & BackLightBar
 *  │    └── LowerChestFrame
 *  ├── ShoulderMountLeft (Group - Arm connection)
 *  └── ShoulderMountRight (Group - Arm connection)
 */
export function createChestAssembly(materials: RobotMaterialPalette): ChestAssemblyNodes {
  const chestGroup = new THREE.Group();
  chestGroup.name = 'ChestRoot';

  const ledMeshes: THREE.Mesh[] = [];

  // 1. CHEST ARMOR GROUP
  const chestArmorGroup = new THREE.Group();
  chestArmorGroup.name = 'ChestArmor';
  chestGroup.add(chestArmorGroup);

  // A. Under-shell structural armor
  const mainShell = createChestMainShell(materials);
  chestArmorGroup.add(mainShell);

  // B. Central Chest Plate (Hero Breastplate)
  const { mesh: centerPlate, frontZ } = createCentralChestPlate(materials);
  chestArmorGroup.add(centerPlate);

  // C. Innovex "A" Logo (Centered directly on the central breastplate)
  const logo = createChestLogo(materials);
  logo.position.set(0, 0.026, frontZ + 0.003);
  centerPlate.add(logo);
  ledMeshes.push(logo);

  // D. Left & Right Side Panels with Diagonal Purple Light Strips
  const leftSide = createChestSidePanel(-1, materials);
  chestArmorGroup.add(leftSide.panel);
  chestArmorGroup.add(leftSide.lightStrip);
  ledMeshes.push(leftSide.lightStrip);

  const rightSide = createChestSidePanel(1, materials);
  chestArmorGroup.add(rightSide.panel);
  chestArmorGroup.add(rightSide.lightStrip);
  ledMeshes.push(rightSide.lightStrip);

  // E. Left & Right Flank Armor Cowls
  const leftFlankArmor = createChestFlankArmor(-1, materials);
  chestArmorGroup.add(leftFlankArmor);

  const rightFlankArmor = createChestFlankArmor(1, materials);
  chestArmorGroup.add(rightFlankArmor);

  // Subtle localized purple point light illuminating chest armor seams & logo
  const chestGlow = new THREE.PointLight(materials.purpleEmissive.color, 0.45, 0.48);
  chestGlow.position.set(0, 0.026, 0.082);
  chestArmorGroup.add(chestGlow);

  const chestArmor: ChestArmorNodes = {
    group: chestArmorGroup,
    mainShell,
    centerPlate,
    centerPanel: centerPlate,
    leftSidePanel: leftSide.panel,
    leftPanel: leftSide.panel,
    rightSidePanel: rightSide.panel,
    rightPanel: rightSide.panel,
    leftLightStrip: leftSide.lightStrip,
    rightLightStrip: rightSide.lightStrip,
    leftFlankArmor,
    rightFlankArmor,
    logo,
    ledMeshes,
  };

  // 2. UPPER & LOWER CHEST FRAME (Internal skeleton, spine, back armor, neck collar)
  const upperTorsoFrame = createUpperTorsoFrame(materials);
  chestGroup.add(upperTorsoFrame.group);
  ledMeshes.push(...upperTorsoFrame.ledMeshes);

  // 3. SHOULDER MOUNTS (Left & Right connection points for robot arms)
  const shoulderMountLeft = createShoulderMount(-1, materials);
  chestGroup.add(shoulderMountLeft.group);
  ledMeshes.push(...shoulderMountLeft.ledMeshes);

  const shoulderMountRight = createShoulderMount(1, materials);
  chestGroup.add(shoulderMountRight.group);
  ledMeshes.push(...shoulderMountRight.ledMeshes);

  return {
    group: chestGroup,
    chestArmor,
    upperTorsoFrame,
    shoulderMountLeft,
    shoulderMountRight,
    ledMeshes,
  };
}
