import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { TORSO_CONFIG, StomachRingSpec } from './TorsoConfig';

export interface StomachRingNodes {
  group: THREE.Group;
  outerRing: THREE.Mesh;
  innerCore: THREE.Mesh;
  frontPlate?: THREE.Mesh;
  pistons?: THREE.Mesh[];
  accentLed?: THREE.Mesh;
  mechanism?: THREE.Group;
}

export interface StomachAssemblyNodes {
  group: THREE.Group;
  upperConnector: THREE.Group;
  segment01: THREE.Group;
  segment02: THREE.Group;
  segment03: THREE.Group;
  segment04: THREE.Group;
  segment05: THREE.Group;
  rings: StomachRingNodes[];
  lowerAbdomen: THREE.Group;
  lowerConnector: THREE.Group;
  sideMechanismLeft: THREE.Group;
  sideMechanismRight: THREE.Group;
  internalSpine: THREE.Group;
  spineCore: THREE.Mesh;
  vertebraeDiscs: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];
}

/**
 * SCULPTED ARTICULATED ABDOMINAL ARMOR PLATE (CUIRASS LAME)
 * Features:
 * - Pristine white ceramic rectus-abdominis cuirass lame plate
 * - Controlled compound 3D curvature wrapping naturally around the ribcage in Z
 * - Crisp, subtle central keel facet (linea alba crest) running down the midline
 * - Precision automotive beveled perimeter on all four edges
 * - Shingled overlap geometry: top lip tucks under the segment above, bottom flange overlaps the segment below
 * - Open lateral flanks exposing the dark titanium vertebral core, pistons, and guide rails
 * - ZERO internal mesh clipping or Z-fighting
 */
function createAbdominalArmorPlateGeometry(
  spec: StomachRingSpec,
  index: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();

  const rx = spec.radiusX;
  const h = spec.height * 1.12; // Controlled vertical extension for clean articulated overlap

  // Half-width of front armor plate at top and bottom (anatomical athletic taper)
  const topHalfW = rx * (0.84 - index * 0.022);
  const botHalfW = rx * (0.76 - index * 0.022);
  const halfH = h * 0.50;

  // Sculpted dual-lobe plate outline with anatomical midline notch (linea alba)
  shape.moveTo(-0.0025, halfH - 0.001);
  // Left lobe top arch
  shape.quadraticCurveTo(-topHalfW * 0.45, halfH + 0.002, -topHalfW, halfH - 0.003);
  // Outer lateral flank edge: smooth curve angling down and inward
  shape.quadraticCurveTo(-topHalfW * 1.02, 0, -botHalfW, -halfH);
  // Bottom left edge: chevron flange overlapping segment below
  shape.quadraticCurveTo(-botHalfW * 0.45, -halfH - 0.0025, -0.0025, -halfH - 0.004);
  // Midline return groove
  shape.lineTo(0.0025, -halfH - 0.004);
  // Bottom right edge
  shape.quadraticCurveTo(botHalfW * 0.45, -halfH - 0.0025, botHalfW, -halfH);
  // Right lateral flank edge
  shape.quadraticCurveTo(topHalfW * 1.02, 0, topHalfW, halfH - 0.003);
  // Right lobe top arch
  shape.quadraticCurveTo(topHalfW * 0.45, halfH + 0.002, 0.0025, halfH - 0.001);
  shape.closePath();

  // Precision automotive bevels
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.012, // Controlled, clean panel depth
    bevelEnabled: true,
    bevelThickness: 0.0032,
    bevelSize: 0.0026,
    bevelSegments: 3,
    curveSegments: 32,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  // Compound Biomechanical 3D Curvature:
  // 1. Cylindrical wrap: plate wraps smoothly back around the ribcage in Z
  // 2. Dual-lobe abdominal crest: distinct muscle-armor peaks on left and right, with recessed midline seam
  // 3. Vertical convex roll: softens harsh step edges into luxurious liquid ceramic curvature
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const nx = Math.min(1.0, Math.abs(x) / (topHalfW * 1.02));
    // Smooth parabolic flank wrap
    const flankWrap = -Math.pow(nx, 2.0) * 0.015;
    // Dual-lobe crest: peak at nx ~ 0.45, recessed at nx = 0 and outer flank
    const lobeCrest = Math.sin(nx * Math.PI) * 0.0045;
    // Midline seam indent at x = 0
    const midlineIndent = (1.0 - Math.min(1.0, Math.abs(x) / 0.012)) * -0.0022;
    // Vertical convex roll
    const vertRoll = Math.cos((y / (halfH * 1.05)) * (Math.PI * 0.48)) * 0.0030;

    pos.setZ(i, z + flankWrap + lobeCrest + midlineIndent + vertRoll);
  }
  geo.computeVertexNormals();

  return geo;
}

/**
 * Creates the dark metallic articulated internal mechanism nested safely INSIDE each segment:
 * - Sits strictly behind the white armor plate keep-out boundary (ZERO clipping)
 * - Dark titanium vertebral chassis collar gripping the spine
 * - Left and right dual inter-segment hydraulic mini-pistons in the lateral notches
 */
function createSegmentMechanism(
  spec: StomachRingSpec,
  index: number,
  materials: RobotMaterialPalette
): {
  mechanismGroup: THREE.Group;
  innerCore: THREE.Mesh;
  pistons: THREE.Mesh[];
  accentLed?: THREE.Mesh;
} {
  const mechanismGroup = new THREE.Group();
  mechanismGroup.name = `Mechanism0${index + 1}`;

  const rx = spec.radiusX;
  const rz = spec.radiusZ;

  // 1. Dark Titanium Vertebral Chassis Collar (Nested safely behind the armor plate)
  const collarGeo = new THREE.CylinderGeometry(
    rx * 0.70,
    rx * 0.66,
    spec.height * 0.88,
    32
  );
  const innerCore = new THREE.Mesh(collarGeo, materials.joint);
  innerCore.name = `InnerChassisCollar0${index + 1}`;
  innerCore.position.set(0, 0, -0.016);
  innerCore.scale.set(1.0, 1.0, (rz * 0.40) / rx);
  innerCore.castShadow = true;
  innerCore.receiveShadow = true;
  mechanismGroup.add(innerCore);

  // 2. Central Vertebral Knuckle Sleeve gripping the spine
  const knuckleGeo = new THREE.CylinderGeometry(0.028, 0.026, spec.height * 1.15, 24);
  const knuckleMesh = new THREE.Mesh(knuckleGeo, materials.joint);
  knuckleMesh.name = `SpineKnuckle0${index + 1}`;
  knuckleMesh.position.set(0, 0, -0.020);
  knuckleMesh.castShadow = true;
  mechanismGroup.add(knuckleMesh);

  // 3. Dual Left and Right Mini-Pistons (Inter-Segment Articulation)
  // Visibly bridging the gap at the lateral notches between segments
  const pistons: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const pistonSubGroup = new THREE.Group();
    pistonSubGroup.name = `PistonAssembly_${side === -1 ? 'L' : 'R'}_0${index + 1}`;
    pistonSubGroup.position.set(side * (rx * 0.66), 0, 0.002);

    // Outer hydraulic cylinder casing (dark titanium)
    const sleeveGeo = new THREE.CylinderGeometry(0.0036, 0.0036, spec.height * 0.85, 14);
    const sleeveMesh = new THREE.Mesh(sleeveGeo, materials.joint);
    sleeveMesh.castShadow = true;
    pistonSubGroup.add(sleeveMesh);

    // Inner polished piston rod extending through the gap
    const rodGeo = new THREE.CylinderGeometry(0.0020, 0.0020, spec.height * 1.50, 12);
    const rodMesh = new THREE.Mesh(rodGeo, materials.joint);
    rodMesh.position.set(0, -spec.height * 0.30, 0);
    rodMesh.castShadow = true;
    pistonSubGroup.add(rodMesh);

    // Mounting clevis brackets
    for (const ySign of [-1, 1]) {
      const mountBracketGeo = new THREE.BoxGeometry(0.007, 0.0035, 0.007);
      const mountBracket = new THREE.Mesh(mountBracketGeo, materials.joint);
      mountBracket.position.set(0, ySign * (spec.height * 0.48), 0);
      mountBracket.castShadow = true;
      pistonSubGroup.add(mountBracket);
    }

    mechanismGroup.add(pistonSubGroup);
    pistons.push(sleeveMesh);
  }

  return {
    mechanismGroup,
    innerCore,
    pistons,
  };
}

/**
 * Creates one articulated abdominal segment:
 * Contains:
 * - frontArmorPlate: Sculpted white ceramic cuirass plate with keel and compound curvature
 * - mechanism: Dark metallic internal chassis, vertebral sleeve, hydraulic pistons (nested safely behind)
 */
export function createAbdominalSegment(
  spec: StomachRingSpec,
  index: number,
  materials: RobotMaterialPalette
): StomachRingNodes {
  const segmentGroup = new THREE.Group();
  segmentGroup.name = `AbdomenSegment0${index + 1}`;
  segmentGroup.position.set(0, spec.yOffset, 0);

  // 1. External Sculpted White Armor Cuirass Plate
  const plateGeo = createAbdominalArmorPlateGeometry(spec, index);
  const frontArmorPlate = new THREE.Mesh(plateGeo, materials.armor);
  frontArmorPlate.name = `AbdomenArmorPlate0${index + 1}`;
  // Positioned proudly on the anterior front with subtle 2mm shingle step per segment
  const plateZ = 0.048 - index * 0.002;
  frontArmorPlate.position.set(0, 0, plateZ);
  frontArmorPlate.castShadow = true;
  frontArmorPlate.receiveShadow = true;
  segmentGroup.add(frontArmorPlate);

  // 2. Internal Mechanical Core Assembly (Nested safely behind the armor plate)
  const { mechanismGroup, innerCore, pistons } = createSegmentMechanism(
    spec,
    index,
    materials
  );
  segmentGroup.add(mechanismGroup);

  return {
    group: segmentGroup,
    outerRing: frontArmorPlate,
    innerCore,
    frontPlate: frontArmorPlate,
    mechanism: mechanismGroup,
    pistons,
  };
}

/**
 * UPPER CONNECTOR
 * Smooth dark titanium gimbal nested under the chest underside.
 * Connects chest chassis to Segment 01 without any clipping.
 */
function createUpperConnector(materials: RobotMaterialPalette): THREE.Group {
  const group = new THREE.Group();
  group.name = 'UpperConnector';
  const cfg = TORSO_CONFIG.stomach.upperConnector;
  group.position.set(0, cfg.yOffset, -0.012);

  const rx = cfg.widthX;
  const rz = cfg.depthZ;

  // Smooth circular/elliptical dark titanium gimbal collar (32 segments)
  const collarGeo = new THREE.CylinderGeometry(rx * 0.62, rx * 0.68, cfg.height, 32);
  const collar = new THREE.Mesh(collarGeo, materials.joint);
  collar.name = 'UpperConnectorChassis';
  collar.scale.set(1.0, 1.0, (rz * 0.52) / rx);
  collar.castShadow = true;
  collar.receiveShadow = true;
  group.add(collar);

  // Concentric rotational bearing ring
  const bearingGeo = new THREE.TorusGeometry(rx * 0.52, 0.0028, 10, 32);
  const bearing = new THREE.Mesh(bearingGeo, materials.joint);
  bearing.rotation.x = Math.PI / 2;
  bearing.scale.set(1.0, (rz * 0.52) / rx, 1.0);
  bearing.castShadow = true;
  group.add(bearing);

  // Central rotational gimbal knuckle
  const gimbalGeo = new THREE.CylinderGeometry(0.032, 0.030, cfg.height * 1.30, 24);
  const gimbal = new THREE.Mesh(gimbalGeo, materials.joint);
  gimbal.castShadow = true;
  group.add(gimbal);

  return group;
}

/**
 * LOWER CONNECTOR
 * Smooth articulated transition collar distributing load from Segment 05 into the upper waist collar.
 */
function createLowerConnector(materials: RobotMaterialPalette): THREE.Group {
  const group = new THREE.Group();
  group.name = 'LowerConnector';
  const cfg = TORSO_CONFIG.stomach.lowerConnector;
  group.position.set(0, cfg.yOffset, -0.010);

  const rx = cfg.widthX;
  const rz = cfg.depthZ;

  const collarGeo = new THREE.CylinderGeometry(rx * 0.68, rx * 0.72, cfg.height, 32);
  const chassis = new THREE.Mesh(collarGeo, materials.joint);
  chassis.name = 'LowerConnectorChassis';
  chassis.scale.set(1.0, 1.0, (rz * 0.50) / rx);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  // Central rotational neck sleeve
  const neckGeo = new THREE.CylinderGeometry(0.028, 0.028, cfg.height * 1.25, 24);
  const neck = new THREE.Mesh(neckGeo, materials.joint);
  neck.castShadow = true;
  group.add(neck);

  return group;
}

/**
 * CENTRAL MECHANICAL SPINE (INTERNAL CORE)
 * Continuous vertebral mechanical column running through the abdomen:
 * - Recessed dark cylindrical central spine column
 * - Vertebrae discs sitting safely inside the inter-segment gaps
 * - Zero clipping through the front armor plates
 */
function createInternalSpine(materials: RobotMaterialPalette): {
  spineGroup: THREE.Group;
  spineCore: THREE.Mesh;
  vertebraeDiscs: THREE.Mesh[];
} {
  const spineGroup = new THREE.Group();
  spineGroup.name = 'InternalCore';

  // 1. Central Dark Metallic Spine Column (smooth 32-segment cylinder)
  const spineGeo = new THREE.CylinderGeometry(0.024, 0.022, 0.22, 32);
  const spineCore = new THREE.Mesh(spineGeo, materials.joint);
  spineCore.name = 'SpineCore';
  spineCore.position.set(0, -0.170, -0.020);
  spineCore.castShadow = true;
  spineCore.receiveShadow = true;
  spineGroup.add(spineCore);

  // 2. Vertebrae Discs sitting safely within the inter-segment gaps
  const vertebraeDiscs: THREE.Mesh[] = [];
  const discLevels = [
    // Vertebra in Joint 01 (between Seg 01 & Seg 02)
    { y: -0.125, rx: 0.062, rz: 0.030, h: 0.008 },
    // Vertebra in Joint 02 (between Seg 02 & Seg 03)
    { y: -0.1465, rx: 0.058, rz: 0.028, h: 0.008 },
    // Vertebra in Joint 03 (between Seg 03 & Seg 04)
    { y: -0.167, rx: 0.054, rz: 0.026, h: 0.008 },
    // Vertebra in Joint 04 (between Seg 04 & Seg 05)
    { y: -0.1865, rx: 0.050, rz: 0.024, h: 0.008 },
    // Vertebra in Joint 05 (between Seg 05 & Lower Connector)
    { y: -0.204, rx: 0.046, rz: 0.022, h: 0.008 },
  ];

  discLevels.forEach((lvl, i) => {
    // Smooth elliptical disc with 32 segments, safely recessed
    const dGeo = new THREE.CylinderGeometry(lvl.rx, lvl.rx * 0.98, lvl.h, 32);
    const disc = new THREE.Mesh(dGeo, materials.joint);
    disc.name = `VertebraCollar0${i + 1}`;
    disc.position.set(0, lvl.y, -0.018);
    disc.scale.set(1.0, 1.0, lvl.rz / lvl.rx);
    disc.castShadow = true;
    disc.receiveShadow = true;
    spineGroup.add(disc);
    vertebraeDiscs.push(disc);

    // Fluted central mechanical ring around each disc
    const flutedRingGeo = new THREE.CylinderGeometry(0.028, 0.028, lvl.h * 1.15, 24);
    const flutedRing = new THREE.Mesh(flutedRingGeo, materials.joint);
    flutedRing.position.set(0, lvl.y, -0.020);
    flutedRing.castShadow = true;
    spineGroup.add(flutedRing);
  });

  // 3. Posterior Hydraulic Lines running vertically along the spine
  for (const side of [-1, 1]) {
    const lineGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.20, 14);
    const lineMesh = new THREE.Mesh(lineGeo, materials.joint);
    lineMesh.name = `SpineHydraulicLine_${side === -1 ? 'L' : 'R'}`;
    lineMesh.position.set(side * 0.016, -0.160, -0.034);
    lineMesh.castShadow = true;
    spineGroup.add(lineMesh);
  }

  return {
    spineGroup,
    spineCore,
    vertebraeDiscs,
  };
}

/**
 * SIDE MECHANICAL STRUCTURES
 * Articulated oblique flank support rails:
 * - Contoured dark titanium guide rails following the torso taper
 * - Flush mechanical mounting brackets at each segment level
 * - Integrated cleanly without any floating detached artifacts
 */
function createSideMechanism(
  side: -1 | 1,
  materials: RobotMaterialPalette
): { group: THREE.Group; leds: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.name = side === -1 ? 'SideMechanismLeft' : 'SideMechanismRight';

  const leds: THREE.Mesh[] = [];

  // Contoured Oblique Flank Guide Rail connecting sub-chest down to waist
  const railHeight = 0.124;
  const railGeo = new THREE.CylinderGeometry(0.004, 0.0035, railHeight, 16);
  const rail = new THREE.Mesh(railGeo, materials.joint);
  rail.name = side === -1 ? 'SideSupportRail_L' : 'SideSupportRail_R';
  rail.position.set(side * 0.088, -0.158, 0.004);
  rail.rotation.z = side * 0.08;
  rail.castShadow = true;
  group.add(rail);

  // Flush mechanical flank brackets docking into each segment level
  const yLevels = [-0.114, -0.136, -0.157, -0.177, -0.196];
  yLevels.forEach((y, i) => {
    const bracketX = side * (0.091 - i * 0.005);
    const bracketGeo = new THREE.BoxGeometry(0.008, 0.006, 0.014);
    const bracket = new THREE.Mesh(bracketGeo, materials.joint);
    bracket.position.set(bracketX, y, 0.004);
    bracket.castShadow = true;
    group.add(bracket);
  });

  return { group, leds };
}

/**
 * COMPLETE ARTICULATED ABDOMEN ASSEMBLY
 */
export function createStomachAssembly(materials: RobotMaterialPalette): StomachAssemblyNodes {
  const abdomenGroup = new THREE.Group();
  abdomenGroup.name = 'AbdomenCore';

  const rings: StomachRingNodes[] = [];
  const ledMeshes: THREE.Mesh[] = [];

  // 1. Central Mechanical Spine (Internal Core built first, deeply recessed)
  const { spineGroup, spineCore, vertebraeDiscs } = createInternalSpine(materials);
  abdomenGroup.add(spineGroup);

  // 2. Upper Connector (Internal gimbal socket nestled under chest V-tab)
  const upperConnector = createUpperConnector(materials);
  abdomenGroup.add(upperConnector);

  // 3. Exactly 5 Articulated Abdominal Segments (Separate Three.js groups with progressive taper)
  TORSO_CONFIG.stomach.rings.forEach((spec, idx) => {
    const segment = createAbdominalSegment(spec, idx, materials);
    abdomenGroup.add(segment.group);
    rings.push(segment);
    if (segment.accentLed) {
      ledMeshes.push(segment.accentLed);
    }
  });

  // 4. Lower Connector (Distributes load into waist)
  const lowerConnector = createLowerConnector(materials);
  abdomenGroup.add(lowerConnector);

  // 5. Left and Right Side Structural Mechanisms
  const leftSide = createSideMechanism(-1, materials);
  abdomenGroup.add(leftSide.group);
  ledMeshes.push(...leftSide.leds);

  const rightSide = createSideMechanism(1, materials);
  abdomenGroup.add(rightSide.group);
  ledMeshes.push(...rightSide.leds);

  return {
    group: abdomenGroup,
    upperConnector,
    segment01: rings[0].group,
    segment02: rings[1].group,
    segment03: rings[2].group,
    segment04: rings[3].group,
    segment05: rings[4].group,
    rings,
    lowerAbdomen: lowerConnector,
    lowerConnector,
    sideMechanismLeft: leftSide.group,
    sideMechanismRight: rightSide.group,
    internalSpine: spineGroup,
    spineCore,
    vertebraeDiscs,
    ledMeshes,
  };
}
