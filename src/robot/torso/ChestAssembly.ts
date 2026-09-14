import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { TORSO_CONFIG } from './TorsoConfig';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';
import { ROBOT_ACCENT } from '../config';

// ─── Public interfaces (strictly preserved for animation controller compatibility) ──

export interface ChestArmorNodes {
  group: THREE.Group;
  centerPanel: THREE.Mesh;
  leftPanel: THREE.Mesh;
  rightPanel: THREE.Mesh;
  logo: THREE.Mesh;
  leftLightStrip?: THREE.Mesh;
  rightLightStrip?: THREE.Mesh;
  flankArmorLeft?: THREE.Mesh;
  flankArmorRight?: THREE.Mesh;
}

export interface UpperTorsoFrameNodes {
  group: THREE.Group;
  frameSpine: THREE.Mesh;
  frameClavicleLeft: THREE.Mesh;
  frameClavicleRight: THREE.Mesh;
  neckCollar: THREE.Mesh;
  neckCollarSleeve: THREE.Mesh;
  neckCollarLightRing?: THREE.Mesh;
  neckCollarLightSlit?: THREE.Mesh;
  backArmor: THREE.Mesh;
  backLightBar: THREE.Mesh;
  lowerFrame: THREE.Group;
  ledMeshes: THREE.Mesh[];
}

export interface ShoulderMountNodes {
  group: THREE.Group;
  socketHousing: THREE.Mesh;
  rotaryTrunnion: THREE.Mesh;
  accentRing: THREE.Mesh;
  ledMeshes: THREE.Mesh[];
}

export interface ChestAssemblyNodes {
  chestArmor: ChestArmorNodes;
  upperTorsoFrame: UpperTorsoFrameNodes;
  shoulderMountLeft: ShoulderMountNodes;
  shoulderMountRight: ShoulderMountNodes;
  ledMeshes: THREE.Mesh[];
}

// ─── 1. CENTRAL LOGO "A" ─────────────────────────────────────────────────────
function createChestLogo(materials: RobotMaterialPalette): THREE.Mesh {
  const shape = new THREE.Shape();
  const W = TORSO_CONFIG.chest.logoWidth * 0.5;
  const H = TORSO_CONFIG.chest.logoHeight * 0.5;

  shape.moveTo(0, H);
  shape.lineTo(W, -H);
  shape.lineTo(W * 0.62, -H);
  shape.lineTo(0, -H * 0.18);
  shape.lineTo(-W * 0.62, -H);
  shape.lineTo(-W, -H);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.005,
    bevelEnabled: true,
    bevelThickness: 0.0016,
    bevelSize: 0.0012,
    bevelSegments: 2,
  });
  geo.center();

  const logo = new THREE.Mesh(geo, materials.purpleEmissive);
  logo.name = 'ChestLogo_A';
  logo.castShadow = false;
  return logo;
}

// ─── 2. CENTRAL CHEST PLATE ─────────────────────────────────────────────────
/**
 * Engineered hard-surface central chest armor matching Reference Images:
 * - Defined suprasternal / jugular V-notch at center neckline (framing neck collar LED)
 * - Sculpted clavicle crests (peaking at x = ±0.088, y = 0.178)
 * - Angular shoulder descent (tapering to y = 0.156 at x = ±0.172)
 * - Upper collar chamfer facet sloping into the neck socket
 * - Recessed triangular sternal hollow beneath the notch catching purple glow
 * - Controlled diagonal seams tapering toward sternum
 * - Clean horizontal lower edge terminating at y = -0.040
 * - High-precision hard-surface beveled perimeter and athletic pectoral compound curvature
 */
function createCentralChestPlate(materials: RobotMaterialPalette): {
  mesh: THREE.Mesh;
  frontZ: number;
} {
  const shape = new THREE.Shape();
  // Expanded & refined upper chest neckline rising smoothly to cup the neck collar
  shape.moveTo(0, 0.178);
  // Curve smoothly up from suprasternal notch to left clavicle peak
  shape.bezierCurveTo(-0.024, 0.180, -0.054, 0.185, -0.088, 0.190);
  // Clavicle shoulder ridge sloping out toward left shoulder mount
  shape.bezierCurveTo(-0.124, 0.185, -0.152, 0.172, -0.172, 0.156);
  // Upper pectoral outer contour
  shape.quadraticCurveTo(-0.188, 0.118, -0.178, 0.072);
  // Outer flank sweeps smoothly down and arches cleanly into the engineered sub-costal arch
  shape.bezierCurveTo(-0.165, 0.028, -0.138, 0.006, -0.100, -0.001);
  shape.bezierCurveTo(-0.076, -0.003, -0.050, -0.003, -0.028, -0.002);
  // Sculpted central sub-xiphoid notch framing the transition frame & Vertebra 01 interlocking crest
  shape.lineTo(-0.014, 0.000);
  shape.lineTo(0, 0.002);
  shape.lineTo(0.014, 0.000);
  shape.lineTo(0.028, -0.002);
  shape.bezierCurveTo(0.050, -0.003, 0.076, -0.003, 0.100, -0.001);
  shape.bezierCurveTo(0.138, 0.006, 0.165, 0.028, 0.178, 0.072);
  shape.quadraticCurveTo(0.188, 0.118, 0.172, 0.156);
  shape.bezierCurveTo(0.152, 0.172, 0.124, 0.185, 0.088, 0.190);
  shape.bezierCurveTo(0.054, 0.185, 0.024, 0.180, 0, 0.178);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.0065,
    bevelSize: 0.0050,
    bevelSegments: 5,
    curveSegments: 48,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  // Precision 3D hard-surface sculpting:
  // - Clavicle crest elevation and sharp light-catching crease
  // - Upper collar chamfer facet sloping backwards toward neck cavity
  // - Triangular suprasternal notch depression reflecting neck purple LED
  // - Forward athletic pectoral compound curvature and lateral wrap
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    if (z > 0) {
      const ax = Math.abs(x);

      // 1. Clavicle crest Y position as a function of |x| in centered coordinates (shape center Y = 0.08425)
      let yCrest: number;
      if (ax <= 0.088) {
        const t = ax / 0.088;
        yCrest = 0.094 + (0.106 - 0.094) * Math.sin(t * (Math.PI / 2));
      } else {
        const t = Math.min(1.0, (ax - 0.088) / (0.172 - 0.088));
        yCrest = 0.106 - (0.106 - 0.072) * t;
      }

      // 2. Clavicle bone ridge elevation (raised proud along the crest line)
      const distToCrest = y - yCrest;
      let ridgeElev = 0;
      if (Math.abs(distToCrest) < 0.024) {
        ridgeElev = Math.cos((distToCrest / 0.024) * (Math.PI / 2)) * 0.008;
      }

      // 3. Upper collar chamfer facet (sloping back towards neck socket above the crest)
      let chamferSlope = 0;
      if (y > yCrest - 0.015) {
        const chamferT = Math.min(1.0, (y - (yCrest - 0.015)) / 0.035);
        chamferSlope = -chamferT * 0.022;
      }

      // 4. Suprasternal notch triangular recessed facet (sternal depression)
      let notchRecess = 0;
      if (ax < 0.036 && y > 0.070) {
        const tX = 1.0 - ax / 0.036;
        const tY = Math.min(1.0, (y - 0.070) / 0.024);
        notchRecess = -tX * tY * 0.005;
      }

      // 5. Pectoral muscle dome curvature (athletic forward bulge below the clavicle)
      let pectoralBulge = 0;
      if (y < yCrest) {
        const nx = Math.min(1.0, ax / 0.175);
        const ny = Math.min(1.0, Math.max(0, (y + 0.080) / 0.140));
        pectoralBulge = Math.cos(nx * (Math.PI / 2)) * Math.sin(ny * Math.PI) * 0.018;
      }

      // 6. Lateral aerodynamic wrap towards side panels
      const wrapNx = Math.min(1.0, ax / 0.175);
      const lateralWrap = -Math.pow(wrapNx, 2.2) * 0.012;

      pos.setZ(i, z + ridgeElev + chamferSlope + notchRecess + pectoralBulge + lateralWrap);
    }
  }
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, materials.armor);
  mesh.name = 'ChestPlate_Central';
  mesh.position.set(0, 0.0338, 0.048);
  mesh.rotation.x = -0.04;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return { mesh, frontZ: 0.026 * 0.5 + 0.0065 + 0.018 };
}


// ─── 3. CHEST SIDE PANELS & DIAGONAL PURPLE LIGHT STRIPS ────────────────────
function createChestSidePanel(
  side: -1 | 1,
  materials: RobotMaterialPalette
): { panel: THREE.Mesh; lightStrip: THREE.Mesh } {
  const shape = new THREE.Shape();
  // Extended upper side panel matching elevated clavicle contour, expanding downward
  shape.moveTo(side * 0.178, 0.082);
  shape.bezierCurveTo(side * 0.158, 0.010, side * 0.118, -0.036, side * 0.072, -0.056);
  shape.lineTo(side * 0.134, -0.060);
  shape.bezierCurveTo(side * 0.192, -0.020, side * 0.198, 0.055, side * 0.186, 0.154);
  shape.lineTo(side * 0.162, 0.156);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.0052,
    bevelSize: 0.0040,
    bevelSegments: 4,
    curveSegments: 32,
  });
  geo.center();

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (z > 0) {
      const d = Math.abs(x) / 0.19;
      pos.setZ(i, z + Math.sin(d * Math.PI) * 0.010);
    }
  }
  geo.computeVertexNormals();

  const panel = new THREE.Mesh(geo, materials.armor);
  panel.name = side === -1 ? 'ChestSidePanel_Left' : 'ChestSidePanel_Right';
  panel.position.set(side * 0.128, 0.003, 0.040);
  panel.rotation.y = -side * 0.14;
  panel.rotation.x = -0.04;
  panel.castShadow = true;
  panel.receiveShadow = true;

  // Diagonal Purple Emissive Light Strip aligned flush with side panel
  const stripLength = 0.128;
  const stripGeo = new THREE.CylinderGeometry(0.0032, 0.0032, stripLength, 14);
  const lightStrip = new THREE.Mesh(stripGeo, materials.purpleEmissive);
  lightStrip.name = side === -1 ? 'ChestLightStrip_Left' : 'ChestLightStrip_Right';
  lightStrip.position.set(side * 0.124, 0.029, 0.064);
  lightStrip.rotation.y = -side * 0.14;
  lightStrip.rotation.z = -side * 0.46;
  lightStrip.rotation.x = -0.04;

  return { panel, lightStrip };

}

// ─── 4. LOWER FLANK ARMOR WITH ARCHED UNDER-COWL ───────────────────────────
function createChestFlankArmor(
  side: -1 | 1,
  materials: RobotMaterialPalette
): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(0.048, 0.048);
  shape.lineTo(0.058, 0.015);
  // Curves downward to close tightly around the upper actuator cylinder and mount
  shape.bezierCurveTo(0.062, -0.025, 0.055, -0.060, 0.038, -0.078);
  shape.quadraticCurveTo(0.008, -0.058, -0.018, -0.058);
  shape.bezierCurveTo(-0.038, -0.054, -0.048, -0.020, -0.048, 0.018);
  shape.lineTo(-0.032, 0.048);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.0045,
    bevelSize: 0.0035,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.center();

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (z > 0) {
      const d = Math.abs(x) / 0.05;
      pos.setZ(i, z + Math.cos(d * Math.PI * 0.5) * 0.008);
    }
  }
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, materials.armor);
  mesh.name = side === -1 ? 'ChestFlankArmor_Left' : 'ChestFlankArmor_Right';
  mesh.position.set(side * 0.114, -0.029, 0.028);
  mesh.rotation.y = -side * 0.20;
  mesh.rotation.x = -0.03;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ─── 5. CHEST ARMOR ASSEMBLY ─────────────────────────────────────────────────
export function createChestArmor(materials: RobotMaterialPalette): ChestArmorNodes & {
  ledMeshes: THREE.Mesh[];
} {
  const group = new THREE.Group();
  group.name = 'ChestArmor';

  const ledMeshes: THREE.Mesh[] = [];

  // Central Pectoral Shell
  const { mesh: centerPanel } = createCentralChestPlate(materials);
  group.add(centerPanel);

  // Purple Logo "A"
  const logo = createChestLogo(materials);
  logo.position.set(0, -0.016, 0.036);
  logo.rotation.x = -0.04;
  centerPanel.add(logo);
  ledMeshes.push(logo);

  // Left & Right Pectoral Panels with Diagonal Light Strips
  const leftSide = createChestSidePanel(-1, materials);
  const rightSide = createChestSidePanel(1, materials);
  group.add(leftSide.panel);
  group.add(rightSide.panel);
  group.add(leftSide.lightStrip);
  group.add(rightSide.lightStrip);
  ledMeshes.push(leftSide.lightStrip, rightSide.lightStrip);

  // Flank Rib Armor Wings
  const flankLeft = createChestFlankArmor(-1, materials);
  const flankRight = createChestFlankArmor(1, materials);
  group.add(flankLeft);
  group.add(flankRight);

  return {
    group,
    centerPanel,
    leftPanel: leftSide.panel,
    rightPanel: rightSide.panel,
    logo,
    leftLightStrip: leftSide.lightStrip,
    rightLightStrip: rightSide.lightStrip,
    flankArmorLeft: flankLeft,
    flankArmorRight: flankRight,
    ledMeshes,
  };
}

// ─── 6. UPPER TORSO FRAME & LOWER CHEST INTERFACE ───────────────────────────
/**
 * Structural dark titanium chassis carrying the chest, collar, back armor,
 * and the engineered Lower Chest Frame per Reference Image 1 & 2.
 */
export function createUpperTorsoFrame(materials: RobotMaterialPalette): UpperTorsoFrameNodes {
  const group = new THREE.Group();
  group.name = 'UpperTorsoFrame';

  const ledMeshes: THREE.Mesh[] = [];
  const frameJointGroup = new THREE.Group();

  // Central dark spinal column inside chest — sized to terminate cleanly at the sub-sternal chassis bulkhead
  const spineGeo = new THREE.CylinderGeometry(0.064, 0.052, 0.180, 24);
  const frameSpine = new THREE.Mesh(spineGeo, materials.joint);
  frameSpine.name = 'ChestFrameSpine';
  frameSpine.position.set(0, 0.032, -0.020);
  frameSpine.scale.set(1.08, 1.0, 0.88);
  frameSpine.castShadow = true;
  frameSpine.receiveShadow = true;
  frameJointGroup.add(frameSpine);

  // Transverse Clavicle Beams — wider span (0.160 → 0.200) matching expanded shoulders
  const clavicleBeamGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.200, 14);

  const frameClavicleLeft = new THREE.Mesh(clavicleBeamGeo, materials.joint);
  frameClavicleLeft.rotation.z = Math.PI / 2;
  frameClavicleLeft.position.set(-0.126, TORSO_CONFIG.chest.shoulderMountY, 0.008);
  frameJointGroup.add(frameClavicleLeft);

  const frameClavicleRight = new THREE.Mesh(clavicleBeamGeo, materials.joint);
  frameClavicleRight.rotation.z = Math.PI / 2;
  frameClavicleRight.position.set(0.126, TORSO_CONFIG.chest.shoulderMountY, 0.008);
  frameJointGroup.add(frameClavicleRight);

  // 3. Sculpted White Ceramic Collar Bezel (Mantle cupping the neck base flush)
  const collarShape = new THREE.Shape();
  const cOuterRx = 0.088;
  const cOuterRz = 0.084;
  collarShape.absellipse(0, 0, cOuterRx, cOuterRz, 0, Math.PI * 2, false, 0);

  const collarHole = new THREE.Path();
  const cInnerRx = 0.0745;
  const cInnerRz = 0.0745;
  collarHole.absellipse(0, 0, cInnerRx, cInnerRz, 0, Math.PI * 2, true, 0);
  collarShape.holes.push(collarHole);

  const collarExtrude = new THREE.ExtrudeGeometry(collarShape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.0035,
    bevelSize: 0.0030,
    bevelSegments: 4,
    curveSegments: 36,
  });
  collarExtrude.center();

  const neckCollar = new THREE.Mesh(collarExtrude, materials.armor);
  neckCollar.name = 'NeckCollar';
  neckCollar.rotation.x = Math.PI / 2;
  neckCollar.position.set(0, TORSO_CONFIG.chest.collarY, TORSO_CONFIG.chest.collarZ);
  neckCollar.castShadow = true;
  neckCollar.receiveShadow = true;
  group.add(neckCollar);

  // Stepped internal dark titanium mounting sleeve
  const collarSleeveGeo = new THREE.CylinderGeometry(0.073, 0.070, 0.024, 32);
  const neckCollarSleeve = new THREE.Mesh(collarSleeveGeo, materials.joint);
  neckCollarSleeve.position.set(0, TORSO_CONFIG.chest.collarY - 0.008, TORSO_CONFIG.chest.collarZ);
  neckCollarSleeve.castShadow = true;
  frameJointGroup.add(neckCollarSleeve);

  const mergedFrameJoint = mergeGroupMeshesByMaterial(frameJointGroup, materials.joint, 'UpperChestFrameJoint_Merged', false);
  if (mergedFrameJoint) {
    mergedFrameJoint.castShadow = true;
    mergedFrameJoint.receiveShadow = true;
    group.add(mergedFrameJoint);
  }

  // 4. Horizontal Glowing Purple Light Ring at Collar Seam
  const lightRingGeo = new THREE.TorusGeometry(0.0745, 0.0016, 10, 40);
  const neckCollarLightRing = new THREE.Mesh(lightRingGeo, materials.purpleEmissive);
  neckCollarLightRing.name = 'NeckCollarLightRing';
  neckCollarLightRing.rotation.x = Math.PI / 2;
  neckCollarLightRing.position.set(0, TORSO_CONFIG.chest.collarY + 0.008, TORSO_CONFIG.chest.collarZ);
  group.add(neckCollarLightRing);
  ledMeshes.push(neckCollarLightRing);

  // 5. Central Vertical Purple Light Slit at Suprasternal Notch
  const slitGeo = new THREE.BoxGeometry(0.0032, 0.012, 0.004);
  const neckCollarLightSlit = new THREE.Mesh(slitGeo, materials.purpleEmissive);
  neckCollarLightSlit.name = 'NeckCollarLightSlit';
  neckCollarLightSlit.position.set(0, 0.124, 0.058);
  neckCollarLightSlit.rotation.x = -0.04;
  group.add(neckCollarLightSlit);
  ledMeshes.push(neckCollarLightSlit);

  // Localized subtle purple bounce light illuminating suprasternal notch & chin
  const neckGlowLight = new THREE.PointLight(ROBOT_ACCENT, 0.65, 0.16, 2.0);
  neckGlowLight.position.set(0, TORSO_CONFIG.chest.collarY + 0.008, 0.045);
  group.add(neckGlowLight);


  // Sculpted White Upper Back Armor (Reference Blueprint: "BACK VIEW")
  const backShape = new THREE.Shape();
  backShape.moveTo(-0.120, 0.104);
  backShape.quadraticCurveTo(-0.074, 0.120, -0.066, 0.120);
  backShape.quadraticCurveTo(0, 0.106, 0.066, 0.120);
  backShape.quadraticCurveTo(0.074, 0.120, 0.120, 0.104);
  backShape.bezierCurveTo(0.130, 0.045, 0.118, -0.020, 0.082, -0.048);
  backShape.lineTo(0.036, -0.054);
  // Trapezoidal opening exposing internal spinal column
  backShape.lineTo(0.016, -0.018);
  backShape.lineTo(-0.016, -0.018);
  backShape.lineTo(-0.036, -0.054);
  backShape.lineTo(-0.082, -0.048);
  backShape.bezierCurveTo(-0.118, -0.020, -0.130, 0.045, -0.120, 0.104);
  backShape.closePath();

  const backGeo = new THREE.ExtrudeGeometry(backShape, {
    depth: 0.020,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 3,
  });
  backGeo.center();

  const backArmor = new THREE.Mesh(backGeo, materials.armor);
  backArmor.name = 'ChestBackArmor';
  backArmor.position.set(0, -0.032, -0.080);
  backArmor.rotation.x = 0.05;
  backArmor.castShadow = true;
  backArmor.receiveShadow = true;
  group.add(backArmor);

  // Horizontal Purple Emissive Scapula Light Bar
  const backLightGeo = new THREE.BoxGeometry(0.100, 0.0050, 0.006);
  const backLightBar = new THREE.Mesh(backLightGeo, materials.purpleEmissive);
  backLightBar.name = 'BackLightBar';
  backLightBar.position.set(0, 0.001, -0.094);
  group.add(backLightBar);
  ledMeshes.push(backLightBar);

  // ==============================================================
  // LOWER CHEST FRAME — SUB-STERNAL TRANSITION GIRDLE & GIMBAL BRIDGE
  // ==============================================================
  const lowerFrame = new THREE.Group();
  lowerFrame.name = 'LowerChestFrame';
  group.add(lowerFrame);

  const tempLower = new THREE.Group();
  const tempMetallic = new THREE.Group();

  // 1. Sub-Sternal Structural Girdle (Dark Titanium)
  // Engineered sub-costal arch frame that:
  // - Precisely cradles the upper abdominal transition module (Vertebra 01, width 0.148)
  // - Bridges smoothly to the bilateral actuator clevises at x = ±0.118
  // - Houses a central docking receiver collar for the spine knuckle
  // - Eliminates excessive empty gap and floating plates
  const archFrameShape = new THREE.Shape();
  archFrameShape.moveTo(0, -0.014);
  archFrameShape.lineTo(0.074, -0.014);
  archFrameShape.bezierCurveTo(0.088, -0.012, 0.102, -0.004, 0.118, 0.010);
  archFrameShape.lineTo(0.118, 0.022);
  archFrameShape.lineTo(-0.118, 0.022);
  archFrameShape.lineTo(-0.118, 0.010);
  archFrameShape.bezierCurveTo(-0.102, -0.004, -0.088, -0.012, -0.074, -0.014);
  archFrameShape.closePath();

  const archFrameGeo = new THREE.ExtrudeGeometry(archFrameShape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelThickness: 0.0028,
    bevelSize: 0.0024,
    bevelSegments: 3,
  });
  archFrameGeo.center();

  const chassisGirdle = new THREE.Mesh(archFrameGeo, materials.joint);
  chassisGirdle.name = 'SubSternalChassisGirdle';
  chassisGirdle.position.set(0, -0.066, 0.018);
  chassisGirdle.rotation.x = -0.04;
  tempLower.add(chassisGirdle);

  // 2. Sub-Costal Structural Mounting Shoulders & Gussets (Section 4 & 7)
  // Carries structural load from the chest armor flanks into the central spine
  for (const side of [-1, 1] as const) {
    const shoulderGeo = new THREE.BoxGeometry(0.028, 0.016, 0.020);
    const shoulder = new THREE.Mesh(shoulderGeo, materials.joint);
    shoulder.position.set(side * 0.082, -0.062, 0.024);
    shoulder.rotation.z = -side * 0.15;
    tempLower.add(shoulder);

    // Precision CNC metallic clamping brackets with twin cap screws
    const bracketGeo = new THREE.BoxGeometry(0.010, 0.014, 0.012);
    const bracket = new THREE.Mesh(bracketGeo, materials.metallic);
    bracket.position.set(side * 0.076, -0.063, 0.034);
    bracket.rotation.y = -side * 0.12;
    tempMetallic.add(bracket);

    for (const bOff of [-0.0035, 0.0035]) {
      const boltGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.003, 6);
      const bolt = new THREE.Mesh(boltGeo, materials.joint);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(side * 0.076, -0.063 + bOff, 0.040);
      tempLower.add(bolt);
    }
  }

  // 3. Central Sub-Xiphoid Status LED nestled in the xiphoid notch
  const xiphoidLedGeo = new THREE.BoxGeometry(0.0032, 0.007, 0.004);
  const xiphoidLed = new THREE.Mesh(xiphoidLedGeo, materials.purpleEmissive);
  xiphoidLed.name = 'SubXiphoidStatusLed';
  xiphoidLed.position.set(0, -0.066, 0.046);
  lowerFrame.add(xiphoidLed);
  ledMeshes.push(xiphoidLed);

  // 4. Central Structural Backbone Keel (Section 9)
  const keelGeo = new THREE.BoxGeometry(0.046, 0.034, 0.050);
  const centralKeel = new THREE.Mesh(keelGeo, materials.joint);
  centralKeel.position.set(0, -0.072, 0.006);
  tempLower.add(centralKeel);

  // 5. Central Vertebral Gimbal Yoke Housing (Receives SpineUpperMount)
  const socketGeo = new THREE.CylinderGeometry(0.038, 0.034, 0.018, 32);
  const socket = new THREE.Mesh(socketGeo, materials.joint);
  socket.position.set(0, -0.076, 0.008);
  tempLower.add(socket);

  // Stepped internal bearing race inside the gimbal housing
  const bearingRaceGeo = new THREE.CylinderGeometry(0.031, 0.031, 0.006, 28);
  const bearingRace = new THREE.Mesh(bearingRaceGeo, materials.metallic);
  bearingRace.position.set(0, -0.080, 0.008);
  tempMetallic.add(bearingRace);

  // 6. Bilateral Actuator Clevis Housings with Angled Reinforcement Spars
  for (const side of [-1, 1] as const) {
    const clevisGeo = new THREE.BoxGeometry(0.022, 0.024, 0.024);
    const clevis = new THREE.Mesh(clevisGeo, materials.joint);
    clevis.position.set(side * 0.118, -0.066, 0.024);
    clevis.rotation.z = side * 0.28;
    tempLower.add(clevis);

    // Hardened pivot pin with hex fastener head
    const pinGeo = new THREE.CylinderGeometry(0.0044, 0.0044, 0.028, 16);
    const pin = new THREE.Mesh(pinGeo, materials.metallic);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(side * 0.118, -0.066, 0.024);
    tempMetallic.add(pin);

    for (const pHeadSide of [-1, 1] as const) {
      const headGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.0028, 6);
      const pinHead = new THREE.Mesh(headGeo, materials.joint);
      pinHead.rotation.z = Math.PI / 2;
      pinHead.position.set(side * 0.118 + pHeadSide * 0.014, -0.066, 0.024);
      tempLower.add(pinHead);
    }

    // Angled sub-costal reinforcement truss spar linking clevis upward into chest frame
    const sparGeo = new THREE.BoxGeometry(0.036, 0.012, 0.016);
    const spar = new THREE.Mesh(sparGeo, materials.joint);
    spar.position.set(side * 0.088, -0.058, 0.020);
    spar.rotation.z = -side * 0.20;
    tempLower.add(spar);
  }

  const mergedLower = mergeGroupMeshesByMaterial(tempLower, materials.joint, 'LowerChestFrame_Merged')!;
  tempLower.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  lowerFrame.add(mergedLower);

  const mergedMetallic = mergeGroupMeshesByMaterial(tempMetallic, materials.metallic, 'LowerChestMetallic_Merged', false);
  if (mergedMetallic) {
    tempMetallic.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    });
    lowerFrame.add(mergedMetallic);
  }

  // Purple Emissive Accent Ring recessed inside the lower gimbal housing
  const lowerAccentGeo = new THREE.TorusGeometry(0.034, 0.0016, 8, 32);
  const lowerAccentRing = new THREE.Mesh(lowerAccentGeo, materials.purpleEmissive);
  lowerAccentRing.rotation.x = Math.PI / 2;
  lowerAccentRing.position.set(0, -0.080, 0.008);
  lowerFrame.add(lowerAccentRing);
  ledMeshes.push(lowerAccentRing);

  // Lateral optical indicators on clevis mounts
  for (const side of [-1, 1] as const) {
    const indGeo = new THREE.BoxGeometry(0.0024, 0.008, 0.003);
    const ind = new THREE.Mesh(indGeo, materials.purpleEmissive);
    ind.position.set(side * 0.128, -0.066, 0.024);
    lowerFrame.add(ind);
    ledMeshes.push(ind);
  }

  return {
    group,
    frameSpine,
    frameClavicleLeft,
    frameClavicleRight,
    neckCollar,
    neckCollarSleeve,
    neckCollarLightRing,
    neckCollarLightSlit,
    backArmor,
    backLightBar,
    lowerFrame,
    ledMeshes,
  };
}

// ─── 7. SHOULDER / UPPER TORSO GIRDLE ───────────────────────────────────────
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

  // A. Intermediate Transverse Clavicle Girder (Ties shoulder into chest keel)
  const girderLen = 0.064;
  const girderGeo = new THREE.BoxGeometry(girderLen, 0.024, 0.024);
  const girder = new THREE.Mesh(girderGeo, materials.joint);
  girder.position.set(-side * (girderLen * 0.5), 0, 0);
  girder.castShadow = true;
  girder.receiveShadow = true;
  group.add(girder);

  // Weight-reduction cutouts along the girder
  for (let c = 0; c < 2; c++) {
    const cutoutGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.026, 16);
    const cutoutRim = new THREE.Mesh(cutoutGeo, materials.metallic);
    cutoutRim.position.set(-side * (0.018 + c * 0.022), 0, 0);
    group.add(cutoutRim);
  }

  // B. Precision Rotary Trunnion Bearing Housing
  const housingRadius = 0.028;
  const housingGeo = new THREE.CylinderGeometry(housingRadius, housingRadius * 1.05, 0.024, 32);
  const socketHousing = new THREE.Mesh(housingGeo, materials.joint);
  socketHousing.rotation.z = Math.PI / 2;
  socketHousing.position.set(-side * 0.010, 0, 0);
  socketHousing.castShadow = true;
  socketHousing.receiveShadow = true;
  group.add(socketHousing);

  // C. Stepped Bearing Retainer Collar
  const trunnionGeo = new THREE.CylinderGeometry(housingRadius * 0.92, housingRadius * 0.92, 0.014, 32);
  const rotaryTrunnion = new THREE.Mesh(trunnionGeo, materials.metallic);
  rotaryTrunnion.rotation.z = Math.PI / 2;
  rotaryTrunnion.position.set(-side * 0.004, 0, 0);
  rotaryTrunnion.castShadow = true;
  rotaryTrunnion.receiveShadow = true;
  group.add(rotaryTrunnion);

  // D. Purple Accent Indicator Sleeve inside the shoulder trunnion bore
  const sleeveGeo = new THREE.CylinderGeometry(housingRadius * 0.78, housingRadius * 0.78, 0.012, 28);
  const purpleNeckSleeve = new THREE.Mesh(sleeveGeo, materials.purpleEmissive);
  purpleNeckSleeve.name = side === -1 ? 'ShoulderPurpleNeckSleeve_Left' : 'ShoulderPurpleNeckSleeve_Right';
  purpleNeckSleeve.rotation.z = Math.PI / 2;
  purpleNeckSleeve.position.set(-side * 0.001, 0, 0);
  group.add(purpleNeckSleeve);
  ledMeshes.push(purpleNeckSleeve);

  // Concentric metallic highlight ring
  const sleeveRingGeo = new THREE.TorusGeometry(housingRadius * 0.82, 0.0014, 8, 28);
  const sleeveRing = new THREE.Mesh(sleeveRingGeo, materials.metallic);
  sleeveRing.rotation.y = Math.PI / 2;
  sleeveRing.position.set(-side * 0.002, 0, 0);
  group.add(sleeveRing);

  // 8 Perimeter Socket Flange Fasteners
  for (let b = 0; b < 8; b++) {
    const angle = (b / 8) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.003, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(
      -side * 0.012,
      Math.sin(angle) * (housingRadius * 0.88),
      Math.cos(angle) * (housingRadius * 0.88)
    );
    group.add(bolt);
  }

  // E. Purple Emissive Core Ring
  const ringGeo = new THREE.TorusGeometry(housingRadius * 0.96, 0.0014, 8, 32);
  const accentRing = new THREE.Mesh(ringGeo, materials.purpleEmissive);
  accentRing.name = side === -1 ? 'ShoulderAccentRing_Left' : 'ShoulderAccentRing_Right';
  accentRing.rotation.y = Math.PI / 2;
  accentRing.position.set(-side * 0.012, 0, 0);
  group.add(accentRing);
  ledMeshes.push(accentRing);

  return {
    group,
    socketHousing,
    rotaryTrunnion,
    accentRing,
    ledMeshes,
  };
}

// ─── 8. MAIN CHEST ASSEMBLY ENTRY POINT ─────────────────────────────────────
export function createChestAssembly(materials: RobotMaterialPalette): ChestAssemblyNodes {
  const ledMeshes: THREE.Mesh[] = [];

  const chestArmor = createChestArmor(materials);
  ledMeshes.push(...chestArmor.ledMeshes);

  const upperTorsoFrame = createUpperTorsoFrame(materials);
  ledMeshes.push(...upperTorsoFrame.ledMeshes);

  const shoulderMountLeft = createShoulderMount(-1, materials);
  const shoulderMountRight = createShoulderMount(1, materials);
  ledMeshes.push(...shoulderMountLeft.ledMeshes, ...shoulderMountRight.ledMeshes);

  return {
    chestArmor,
    upperTorsoFrame,
    shoulderMountLeft,
    shoulderMountRight,
    ledMeshes,
  };
}
