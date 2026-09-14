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
  // Central suprasternal notch dip directly below neck collar LED (jugular notch)
  shape.moveTo(0, 0.144);
  // Curve smoothly up from notch to left clavicle peak
  shape.bezierCurveTo(-0.026, 0.146, -0.054, 0.165, -0.088, 0.178);
  // Clavicle shoulder ridge sloping out toward left shoulder mount
  shape.bezierCurveTo(-0.124, 0.175, -0.152, 0.166, -0.172, 0.156);
  // Upper pectoral outer contour
  shape.quadraticCurveTo(-0.188, 0.118, -0.178, 0.072);
  // Outer flank sweeps smoothly down and arches cleanly into the lower substernal contour
  shape.bezierCurveTo(-0.165, 0.025, -0.140, -0.010, -0.105, -0.018);
  shape.bezierCurveTo(-0.085, -0.0215, -0.070, -0.0215, -0.050, -0.0215);
  // Central sternal contour framing Plate 01 with exact equal 10mm gap
  shape.lineTo(0, -0.0215);
  shape.lineTo(0.050, -0.0215);
  shape.bezierCurveTo(0.070, -0.0215, 0.085, -0.0215, 0.105, -0.018);
  shape.bezierCurveTo(0.140, -0.010, 0.165, 0.025, 0.178, 0.072);
  shape.quadraticCurveTo(0.188, 0.118, 0.172, 0.156);
  shape.bezierCurveTo(0.152, 0.166, 0.124, 0.175, 0.088, 0.178);
  shape.bezierCurveTo(0.054, 0.165, 0.026, 0.146, 0, 0.144);
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

      // 1. Clavicle crest Y position as a function of |x| in centered coordinates (shape center Y = 0.078)
      let yCrest: number;
      if (ax <= 0.088) {
        const t = ax / 0.088;
        yCrest = 0.066 + (0.100 - 0.066) * Math.sin(t * (Math.PI / 2));
      } else {
        const t = Math.min(1.0, (ax - 0.088) / (0.172 - 0.088));
        yCrest = 0.100 - (0.100 - 0.078) * t;
      }

      // 2. Clavicle bone ridge elevation (raised proud along the crest line)
      const distToCrest = y - yCrest;
      let ridgeElev = 0;
      if (Math.abs(distToCrest) < 0.024) {
        ridgeElev = Math.cos((distToCrest / 0.024) * (Math.PI / 2)) * 0.008;
      }

      // 3. Upper collar chamfer facet (sloping back towards neck socket above the crest)
      let chamferSlope = 0;
      if (y > yCrest - 0.010) {
        const chamferT = Math.min(1.0, (y - (yCrest - 0.010)) / 0.030);
        chamferSlope = -chamferT * 0.010;
      }

      // 4. Suprasternal notch triangular recessed facet (sternal depression)
      let notchRecess = 0;
      if (ax < 0.046 && y > 0.035) {
        const tX = 1.0 - ax / 0.046;
        const tY = Math.min(1.0, (y - 0.035) / 0.032);
        notchRecess = -tX * tY * 0.0065;
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
  mesh.position.set(0, 0.0278, 0.048);
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

  // Central dark spinal column inside chest — taller to match expanded chest
  const spineGeo = new THREE.CylinderGeometry(0.064, 0.055, 0.270, 24);
  const frameSpine = new THREE.Mesh(spineGeo, materials.joint);
  frameSpine.name = 'ChestFrameSpine';
  frameSpine.position.set(0, -0.037, -0.020);
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

  // 3. Engineered Dark Titanium Neck Collar Bezel & Sleeve (Recessed inside neck cavity behind notch)
  const collarRecessedZ = -0.018;
  const collarBezelGeo = new THREE.CylinderGeometry(0.048, 0.052, 0.020, 36);
  const neckCollar = new THREE.Mesh(collarBezelGeo, materials.joint);
  neckCollar.name = 'NeckCollar';
  neckCollar.position.set(0, TORSO_CONFIG.chest.collarY - 0.002, collarRecessedZ);
  neckCollar.scale.set(1.04, 1.0, 0.92);
  neckCollar.castShadow = true;
  neckCollar.receiveShadow = true;
  neckCollar.visible = true;
  frameJointGroup.add(neckCollar);

  const collarSleeveGeo = new THREE.CylinderGeometry(0.044, 0.042, 0.028, 32);
  const neckCollarSleeve = new THREE.Mesh(collarSleeveGeo, materials.joint);
  neckCollarSleeve.position.set(0, TORSO_CONFIG.chest.collarY - 0.006, collarRecessedZ);
  neckCollarSleeve.scale.set(1.0, 1.0, 0.92);
  neckCollarSleeve.castShadow = true;
  frameJointGroup.add(neckCollarSleeve);

  const mergedFrameJoint = mergeGroupMeshesByMaterial(frameJointGroup, materials.joint, 'UpperChestFrameJoint_Merged', false);
  if (mergedFrameJoint) {
    mergedFrameJoint.castShadow = true;
    mergedFrameJoint.receiveShadow = true;
    group.add(mergedFrameJoint);
  }

  // 4. Horizontal Glowing Purple Light Ring at Neck Base
  const lightRingGeo = new THREE.TorusGeometry(0.046, 0.0020, 10, 40);
  const neckCollarLightRing = new THREE.Mesh(lightRingGeo, materials.purpleEmissive);
  neckCollarLightRing.name = 'NeckCollarLightRing';
  neckCollarLightRing.rotation.x = Math.PI / 2;
  neckCollarLightRing.position.set(0, TORSO_CONFIG.chest.collarY + 0.005, collarRecessedZ + 0.002);
  neckCollarLightRing.scale.set(1.04, 0.92, 1.0);
  group.add(neckCollarLightRing);
  ledMeshes.push(neckCollarLightRing);

  // 5. Central Vertical Purple Light Slit at Neck Base (Recessed inside notch cavity)
  const slitGeo = new THREE.BoxGeometry(0.0030, 0.014, 0.003);
  const neckCollarLightSlit = new THREE.Mesh(slitGeo, materials.purpleEmissive);
  neckCollarLightSlit.name = 'NeckCollarLightSlit';
  neckCollarLightSlit.position.set(0, TORSO_CONFIG.chest.collarY + 0.008, 0.024);
  group.add(neckCollarLightSlit);
  ledMeshes.push(neckCollarLightSlit);

  // Localized subtle purple bounce light illuminating suprasternal notch & chin
  const neckGlowLight = new THREE.PointLight(ROBOT_ACCENT, 0.65, 0.16, 2.0);
  neckGlowLight.position.set(0, TORSO_CONFIG.chest.collarY + 0.008, 0.022);
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
  // LOWER CHEST FRAME (Reference: "LOWER CHEST FRAME")
  // ==============================================================
  const lowerFrame = new THREE.Group();
  lowerFrame.name = 'LowerChestFrame';
  group.add(lowerFrame);

  const tempLower = new THREE.Group();

  // 1. Sub-Sternal Structural Lip (conforms directly to the chest lower contour)
  const lipShape = new THREE.Shape();
  lipShape.moveTo(-0.060, 0.008);
  lipShape.lineTo(0.060, 0.008);
  lipShape.quadraticCurveTo(0.052, -0.008, 0.044, -0.014);
  lipShape.lineTo(-0.044, -0.014);
  lipShape.quadraticCurveTo(-0.052, -0.008, -0.060, 0.008);
  lipShape.closePath();

  const lipGeo = new THREE.ExtrudeGeometry(lipShape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
  });
  lipGeo.center();

  const chassisLip = new THREE.Mesh(lipGeo, materials.joint);
  chassisLip.name = 'SubSternalChassisLip';
  chassisLip.position.set(0, -0.075, -0.006);
  chassisLip.rotation.x = -0.04;
  tempLower.add(chassisLip);

  // 2. Central Structural Frame (trapezoidal core housing)
  const coreHousingGeo = new THREE.CylinderGeometry(0.050, 0.044, 0.018, 32);
  const coreHousing = new THREE.Mesh(coreHousingGeo, materials.joint);
  coreHousing.scale.set(1.10, 1.0, 0.84);
  coreHousing.position.set(0, -0.086, 0.002);
  tempLower.add(coreHousing);

  // 3. Bilateral Diagonal Support Struts (Reference: "LOWER CHEST FRAME")
  for (const side of [-1, 1] as const) {
    const strutGeo = new THREE.CylinderGeometry(0.0040, 0.0040, 0.034, 14);
    const strut = new THREE.Mesh(strutGeo, materials.joint);
    strut.position.set(side * 0.036, -0.082, 0.016);
    strut.rotation.z = side * 0.28;
    strut.rotation.x = -0.16;
    tempLower.add(strut);
  }

  // 4. Actuator Array Upper Mounting Clevis Blocks & Pins per side (Outer & Inner)
  for (const side of [-1, 1] as const) {
    // 1. Outer angled actuator upper clevis (tucked inside chest flank)
    const fClevisGeo = new THREE.BoxGeometry(0.014, 0.016, 0.016);
    const fClevis = new THREE.Mesh(fClevisGeo, materials.joint);
    fClevis.position.set(side * 0.112, -0.066, 0.016);
    tempLower.add(fClevis);

    const fPinGeo = new THREE.CylinderGeometry(0.0032, 0.0032, 0.018, 12);
    const fPin = new THREE.Mesh(fPinGeo, materials.joint);
    fPin.rotation.z = Math.PI / 2;
    fPin.position.set(side * 0.112, -0.066, 0.016);
    tempLower.add(fPin);

    // 2. Inner vertical actuator upper clevis
    const rClevisGeo = new THREE.BoxGeometry(0.012, 0.014, 0.014);
    const rClevis = new THREE.Mesh(rClevisGeo, materials.joint);
    rClevis.position.set(side * 0.052, -0.078, -0.006);
    tempLower.add(rClevis);

    const rPinGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.016, 12);
    const rPin = new THREE.Mesh(rPinGeo, materials.joint);
    rPin.rotation.z = Math.PI / 2;
    rPin.position.set(side * 0.052, -0.078, -0.006);
    tempLower.add(rPin);
  }

  // 5. Central Vertebral Gimbal Socket linking directly into vertebra 01
  const socketGeo = new THREE.CylinderGeometry(0.032, 0.028, 0.014, 28);
  const socket = new THREE.Mesh(socketGeo, materials.joint);
  socket.position.set(0, -0.086, -0.002);
  tempLower.add(socket);

  const mergedLower = mergeGroupMeshesByMaterial(tempLower, materials.joint, 'LowerChestFrame_Merged')!;
  tempLower.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
  });
  lowerFrame.add(mergedLower);

  // Purple Emissive Accent Ring recessed inside the lower frame collar
  const lowerAccentGeo = new THREE.TorusGeometry(0.042, 0.0012, 6, 32);
  const lowerAccentRing = new THREE.Mesh(lowerAccentGeo, materials.purpleEmissive);
  lowerAccentRing.rotation.x = Math.PI / 2;
  lowerAccentRing.position.set(0, -0.082, 0.002);
  lowerAccentRing.scale.set(1.08, 0.86, 1.0);
  lowerFrame.add(lowerAccentRing);
  ledMeshes.push(lowerAccentRing);

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

// ─── 7. SHOULDER CONNECTION SOCKET ──────────────────────────────────────────
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

  // A. Structural Clavicle Socket Housing (anchored high near upper clavicle frame)
  const housingGeo = new THREE.CylinderGeometry(0.024, 0.026, 0.018, 28);
  const socketHousing = new THREE.Mesh(housingGeo, materials.joint);
  socketHousing.rotation.z = Math.PI / 2;
  socketHousing.position.set(-side * 0.014, 0.018, 0);
  socketHousing.castShadow = true;
  socketHousing.receiveShadow = true;
  group.add(socketHousing);

  // B. Hollow Clavicle Bearing Cup Sleeve (receives shoulder trunnion collar)
  const trunnionGeo = new THREE.CylinderGeometry(0.026, 0.024, 0.012, 28);
  const rotaryTrunnion = new THREE.Mesh(trunnionGeo, materials.joint);
  rotaryTrunnion.rotation.z = Math.PI / 2;
  rotaryTrunnion.position.set(-side * 0.008, 0.018, 0);
  rotaryTrunnion.castShadow = true;
  rotaryTrunnion.receiveShadow = true;
  group.add(rotaryTrunnion);

  // C. Stepped Lavender / Metallic Purple Shoulder Neck Sleeve (Matching Reference Image 2)
  const sleeveGeo = new THREE.CylinderGeometry(0.020, 0.022, 0.012, 28);
  const purpleNeckSleeve = new THREE.Mesh(sleeveGeo, materials.purpleEmissive);
  purpleNeckSleeve.name = side === -1 ? 'ShoulderPurpleNeckSleeve_Left' : 'ShoulderPurpleNeckSleeve_Right';
  purpleNeckSleeve.rotation.z = Math.PI / 2;
  purpleNeckSleeve.position.set(-side * 0.002, 0.018, 0);
  purpleNeckSleeve.castShadow = true;
  purpleNeckSleeve.receiveShadow = true;
  group.add(purpleNeckSleeve);
  ledMeshes.push(purpleNeckSleeve);

  // Stepped accent ring on lavender sleeve
  const sleeveRingGeo = new THREE.TorusGeometry(0.022, 0.0014, 8, 28);
  const sleeveRing = new THREE.Mesh(sleeveRingGeo, materials.metallic);
  sleeveRing.rotation.y = Math.PI / 2;
  sleeveRing.position.set(-side * 0.004, 0.018, 0);
  group.add(sleeveRing);

  // 6 Perimeter Clavicle Fasteners securing socket cup to chest frame
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.0025, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(-side * 0.014, 0.018 + Math.sin(angle) * 0.022, Math.cos(angle) * 0.022);
    group.add(bolt);
  }

  // D. Purple Accent LED Ring recessed inside the clavicle socket housing bore
  const ringGeo = new THREE.TorusGeometry(0.025, 0.0012, 8, 32);
  const accentRing = new THREE.Mesh(ringGeo, materials.purpleEmissive);
  accentRing.name = side === -1 ? 'ShoulderAccentRing_Left' : 'ShoulderAccentRing_Right';
  accentRing.rotation.y = Math.PI / 2;
  accentRing.position.set(-side * 0.014, 0.018, 0);
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
