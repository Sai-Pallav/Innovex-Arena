import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// UPPER ARM MODULE — Premium Humanoid Robotic Humerus Assembly
// Reference: Images 1, 2, 3
//
// Design language:
//   - Elongated aerodynamic shell: 150mm structural humerus
//   - Wide at shoulder (r≈0.046), muscular bicep swell, tapers to elbow (r≈0.033)
//   - Anterior + posterior white ceramic armor panels with exposed dark corridor
//   - Dark titanium I-beam spar & tricep actuator visible through lateral gap
//   - Subtle anterior specular ridge, posterior tricep contour
//   - Distal arched cutout frames the elbow actuator disc cleanly
//   - Single purple LED accent strip on lateral face
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// ARMOR PANEL GEOMETRY
// Dual-layer white ceramic shell with real wall thickness.
// Anterior panel: covers ±68° around +Z (front face)
// Posterior panel: covers ±76° around -Z (rear face)
// Angular gap on lateral/medial flanks exposes the dark skeleton beneath.
// ─────────────────────────────────────────────────────────────────────────────
function createUpperArmArmorGeo(
  isAnterior: boolean,
  side: -1 | 1
): THREE.BufferGeometry {
  const radialSegs = 26;
  const heightSegs = 24;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const length = 0.150;   // 150 mm — elongated humanoid humerus
  const thickness = 0.0036;

  // Angular coverage per panel
  const baseAngle = isAnterior ? 0 : Math.PI;
  const halfAngleSpan = isAnterior ? Math.PI * 0.38 : Math.PI * 0.42;

  function getVertex(layer: 0 | 1, iy: number, ix: number): THREE.Vector3 {
    const v = iy / heightSegs;
    const u = ix / radialSegs;
    const y = -0.005 - v * length;

    // Humanoid taper profile:
    //   Proximal shoulder: r = 0.046
    //   Bicep peak (v≈0.28): r adds +0.004
    //   Distal elbow: r ≈ 0.032
    let radius = 0.0455
      + 0.0040 * Math.sin(v * Math.PI * 0.80)   // bicep swell
      - 0.0140 * v;                              // continuous taper

    const angle = baseAngle - halfAngleSpan + u * (halfAngleSpan * 2.0);
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);

    let rx = radius * 0.94;   // slightly narrower in X (medial-lateral)
    let rz = radius * 1.06;   // slightly fuller in Z (anterior-posterior)

    // Anterior specular ridge crest (centre-line highlight)
    if (isAnterior && cosA > 0.55) {
      const t = (cosA - 0.55) / 0.45;
      rz += Math.pow(t, 1.5) * 0.0030 * Math.sin(v * Math.PI);
    }

    // Posterior tricep contour
    if (!isAnterior && cosA < -0.55) {
      const t = (-cosA - 0.55) / 0.45;
      rz += Math.pow(t, 1.4) * 0.0026 * Math.sin(v * Math.PI);
    }

    // Distal arched elbow clearance cutout (v > 0.80):
    // Scallops the lip so the elbow disc sits cleanly inside the frame.
    if (v > 0.80) {
      const tCut = (v - 0.80) / 0.20;
      const cutDepth = Math.pow(tCut, 1.4) * 0.016;
      rx -= cutDepth * (isAnterior ? Math.abs(sinA) * 0.55 : Math.abs(sinA) * 0.65);
      rz -= cutDepth * 0.30;
    }

    const rBase = layer === 0 ? 1.0 : (1.0 - thickness / Math.max(rx, rz));

    return new THREE.Vector3(
      rBase * rx * sinA,
      y,
      rBase * rz * cosA
    );
  }

  const vertCount = (heightSegs + 1) * (radialSegs + 1);

  for (let layer = 0; layer < 2; layer++) {
    for (let iy = 0; iy <= heightSegs; iy++) {
      for (let ix = 0; ix <= radialSegs; ix++) {
        const v3 = getVertex(layer as 0 | 1, iy, ix);
        positions.push(v3.x, v3.y, v3.z);
        uvs.push(ix / radialSegs, iy / heightSegs);
      }
    }
  }

  const stride = radialSegs + 1;

  // Outer face
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = iy * stride + ix;
      const b = (iy + 1) * stride + ix;
      const c = (iy + 1) * stride + (ix + 1);
      const d = iy * stride + (ix + 1);
      indices.push(a, b, d, b, c, d);
    }
  }

  // Inner face (reversed winding)
  const iOff = vertCount;
  for (let iy = 0; iy < heightSegs; iy++) {
    for (let ix = 0; ix < radialSegs; ix++) {
      const a = iOff + iy * stride + ix;
      const b = iOff + (iy + 1) * stride + ix;
      const c = iOff + (iy + 1) * stride + (ix + 1);
      const d = iOff + iy * stride + (ix + 1);
      indices.push(a, d, b, b, d, c);
    }
  }

  // Edge caps — stitch outer to inner at both angular edges
  for (let iy = 0; iy < heightSegs; iy++) {
    // Left edge (ix = 0)
    const oA = iy * stride + 0;
    const oB = (iy + 1) * stride + 0;
    const iA = iOff + iy * stride + 0;
    const iB = iOff + (iy + 1) * stride + 0;
    indices.push(oA, iA, oB, iA, iB, oB);

    // Right edge (ix = radialSegs)
    const oC = iy * stride + radialSegs;
    const oD = (iy + 1) * stride + radialSegs;
    const iC = iOff + iy * stride + radialSegs;
    const iD = iOff + (iy + 1) * stride + radialSegs;
    indices.push(oD, iC, oC, iD, iC, oD);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FACTORY
// ─────────────────────────────────────────────────────────────────────────────
export function createUpperArm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): UpperArmNodes {
  const upperArmGroup = new THREE.Group();
  upperArmGroup.name = side === -1 ? 'LeftUpperArmRoot' : 'RightUpperArmRoot';

  const ledMeshes: THREE.Mesh[] = [];

  // ════════════════════════════════════════════════════════════
  // INTERNAL SKELETON — dark titanium structural chassis
  // Fully visible through the lateral/medial corridor.
  // ════════════════════════════════════════════════════════════
  const internalSkeletonGroup = new THREE.Group();
  internalSkeletonGroup.name = 'UpperArmInternalSkeleton';
  upperArmGroup.add(internalSkeletonGroup);

  // ── Shoulder Docking Collar & Interface Flange ───────────────────────────
  const collarGeo = new THREE.CylinderGeometry(0.034, 0.0368, 0.014, 30);
  const upperCollar = new THREE.Mesh(collarGeo, materials.joint);
  upperCollar.name = 'UpperArmShoulderCollar';
  upperCollar.position.set(0, -0.005, 0);
  upperCollar.castShadow = true;
  upperCollar.receiveShadow = true;
  internalSkeletonGroup.add(upperCollar);

  const topRimGeo = new THREE.TorusGeometry(0.0350, 0.0016, 8, 30);
  topRimGeo.rotateX(Math.PI / 2);
  const topSocketRim = new THREE.Mesh(topRimGeo, materials.metallic);
  topSocketRim.position.set(0, -0.001, 0);
  internalSkeletonGroup.add(topSocketRim);

  // Convex dome cap on proximal end
  const domeGeo = new THREE.SphereGeometry(0.034, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.32);
  const topDomeCap = new THREE.Mesh(domeGeo, materials.joint);
  topDomeCap.position.set(0, -0.004, 0);
  internalSkeletonGroup.add(topDomeCap);

  // ── Primary Structural I-Beam Spar ────────────────────────────────────────
  // Elongated to match the new 150 mm shell length
  const sparGeo = new THREE.BoxGeometry(0.026, 0.148, 0.038);
  const armatureCore = new THREE.Mesh(sparGeo, materials.joint);
  armatureCore.name = 'UpperArmArmatureCore';
  armatureCore.position.set(0, -0.076, 0);
  armatureCore.castShadow = true;
  armatureCore.receiveShadow = true;
  internalSkeletonGroup.add(armatureCore);

  // CNC weight-reduction pocketing on the spar faces
  for (let p = 0; p < 4; p++) {
    const pocketGeo = new THREE.BoxGeometry(0.030, 0.020, 0.022);
    const pocket = new THREE.Mesh(pocketGeo, materials.joint);
    pocket.position.set(0, -0.038 - p * 0.030, 0);
    internalSkeletonGroup.add(pocket);
  }

  // Parallel side rails visible through the lateral corridor
  for (const cSide of [-1, 1]) {
    const railGeo = new THREE.BoxGeometry(0.007, 0.138, 0.018);
    const rail = new THREE.Mesh(railGeo, materials.joint);
    rail.position.set(cSide * 0.030, -0.076, 0);
    rail.castShadow = true;
    internalSkeletonGroup.add(rail);

    // Standoff bosses (×3 per side) securing the armor panels
    for (let s = 0; s < 3; s++) {
      const bossGeo = new THREE.BoxGeometry(0.007, 0.007, 0.008);
      const boss = new THREE.Mesh(bossGeo, materials.joint);
      boss.position.set(cSide * 0.032, -0.034 - s * 0.044, 0.010);
      internalSkeletonGroup.add(boss);

      const boltGeo = new THREE.CylinderGeometry(0.0014, 0.0014, 0.0026, 6);
      boltGeo.rotateZ(Math.PI / 2);
      const bolt = new THREE.Mesh(boltGeo, materials.metallic);
      bolt.position.set(cSide * 0.036, -0.034 - s * 0.044, 0.010);
      internalSkeletonGroup.add(bolt);
    }
  }

  // ── Tricep Actuator & Chrome Piston Rod ───────────────────────────────────
  // Posterior-mounted linear actuator drives elbow flexion.
  const tricepActGeo = new THREE.CylinderGeometry(0.0060, 0.0060, 0.056, 16);
  const tricepActuator = new THREE.Mesh(tricepActGeo, materials.joint);
  tricepActuator.name = 'UpperArmTricepActuator';
  tricepActuator.position.set(0, -0.064, -0.018);
  tricepActuator.castShadow = true;
  internalSkeletonGroup.add(tricepActuator);

  // Collar rings on actuator barrel
  for (const cOff of [-0.014, 0.014]) {
    const actRingGeo = new THREE.TorusGeometry(0.0066, 0.0012, 6, 16);
    const actRing = new THREE.Mesh(actRingGeo, materials.metallic);
    actRing.position.set(0, -0.064 + cOff, -0.018);
    internalSkeletonGroup.add(actRing);
  }

  const tricepPistonGeo = new THREE.CylinderGeometry(0.0034, 0.0034, 0.052, 14);
  const tricepPiston = new THREE.Mesh(tricepPistonGeo, materials.metallic);
  tricepPiston.name = 'UpperArmTricepPiston';
  tricepPiston.position.set(0, -0.106, -0.018);
  tricepPiston.castShadow = true;
  internalSkeletonGroup.add(tricepPiston);

  // ── Distal Elbow Socket Cuff ───────────────────────────────────────────────
  // Mates with the elbow upper connector, calibrated to elbow geometry.
  const cuffGeo = new THREE.CylinderGeometry(0.030, 0.033, 0.018, 30);
  const elbowSocketCuff = new THREE.Mesh(cuffGeo, materials.joint);
  elbowSocketCuff.name = 'UpperArmElbowSocketCuff';
  elbowSocketCuff.position.set(0, -0.152, 0);
  elbowSocketCuff.castShadow = true;
  elbowSocketCuff.receiveShadow = true;
  internalSkeletonGroup.add(elbowSocketCuff);

  // Metallic cuff precision ring
  const cuffRingGeo = new THREE.TorusGeometry(0.0310, 0.0014, 6, 30);
  cuffRingGeo.rotateX(Math.PI / 2);
  const cuffRing = new THREE.Mesh(cuffRingGeo, materials.metallic);
  cuffRing.position.set(0, -0.145, 0);
  internalSkeletonGroup.add(cuffRing);

  // ════════════════════════════════════════════════════════════
  // WHITE CERAMIC EXOSKELETON ARMOR PANELS
  // Anterior + posterior cowls surrounding the dark skeleton.
  // ════════════════════════════════════════════════════════════
  const bicepSubGroup = new THREE.Group();
  bicepSubGroup.name = side === -1 ? 'LeftBicepSubGroup' : 'RightBicepSubGroup';
  upperArmGroup.add(bicepSubGroup);

  // Anterior Bicep Cowl
  const antGeo = createUpperArmArmorGeo(true, side);
  const bicepShell = new THREE.Mesh(antGeo, materials.armorDoubleSide);
  bicepShell.name = 'AnteriorBicepArmorShell';
  bicepShell.castShadow = true;
  bicepShell.receiveShadow = true;
  bicepSubGroup.add(bicepShell);

  // Posterior Tricep Cowl
  const postGeo = createUpperArmArmorGeo(false, side);
  const tricepShell = new THREE.Mesh(postGeo, materials.armorDoubleSide);
  tricepShell.name = 'PosteriorTricepArmorShell';
  tricepShell.castShadow = true;
  tricepShell.receiveShadow = true;
  bicepSubGroup.add(tricepShell);

  // ── Recessed Dark Parting Seam (lateral corridor) ─────────────────────────
  const seamGeo = new THREE.BoxGeometry(0.0024, 0.134, 0.004);
  const panelSeam = new THREE.Mesh(seamGeo, materials.joint);
  panelSeam.name = 'UpperArmPanelSeam';
  panelSeam.position.set(side * 0.038, -0.078, 0);
  bicepSubGroup.add(panelSeam);

  // Medial corridor seam (opposite side)
  const medSeamGeo = new THREE.BoxGeometry(0.0024, 0.134, 0.004);
  const medSeam = new THREE.Mesh(medSeamGeo, materials.joint);
  medSeam.position.set(-side * 0.038, -0.078, 0);
  bicepSubGroup.add(medSeam);

  // ── Purple LED Accent Strip — lateral flank ────────────────────────────────
  // Thin vertical stripe on the lateral face. Ref 2 shows a controlled accent.
  const ledStripGeo = new THREE.BoxGeometry(0.0018, 0.044, 0.0028);
  const ledStrip = new THREE.Mesh(ledStripGeo, materials.purpleEmissive);
  ledStrip.name = 'UpperArmLateralPurpleAccent';
  ledStrip.position.set(side * 0.040, -0.074, 0);
  bicepSubGroup.add(ledStrip);
  ledMeshes.push(ledStrip);

  // ── Proximal Armor-to-Shoulder Transition Band ────────────────────────────
  // Subtle dark band bridging the pauldron cowl to the upper arm shell.
  const transGeo = new THREE.CylinderGeometry(0.0385, 0.0410, 0.010, 30, 1, true);
  const transitionBand = new THREE.Mesh(transGeo, materials.joint);
  transitionBand.position.set(0, -0.008, 0);
  internalSkeletonGroup.add(transitionBand);

  // ── Distal Elbow Transition Band ──────────────────────────────────────────
  // Dark ring bridging the armor lip to the elbow mechanism.
  const distBandGeo = new THREE.CylinderGeometry(0.0310, 0.0335, 0.012, 30, 1, true);
  const distalBand = new THREE.Mesh(distBandGeo, materials.joint);
  distalBand.position.set(0, -0.156, 0);
  internalSkeletonGroup.add(distalBand);

  return {
    group: upperArmGroup,
    bicepSubGroup,
    upperCollar,
    armatureCore,
    bicepShell,
    topDomeCap,
    topSocketRim,
    elbowSocketCuff,
    panelSeam,
    ledStrip,
    ledMeshes,
    tricepActuator,
    tricepPiston,
  };
}
