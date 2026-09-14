import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

// ─────────────────────────────────────────────────────────────────────────────
// FOREARM MODULE — Premium Humanoid Robotic Forearm Assembly
// Reference: Images 1, 2, 3
//
// Design language:
//   - 152 mm structural gauntlet (matches proportional humanoid radius/ulna)
//   - Wide proximal cradle near elbow (r≈0.040), brachioradialis swell at ~22%,
//     smooth continuous taper to wrist (r≈0.026)
//   - Anterior + posterior white ceramic armor panels, open lateral corridor
//   - Iconic posterior dorsal spine/fin (Reference Images 1 & 3)
//   - Dark titanium internal spaceframe + dual flexor actuators visible
//   - Natural wrist-emergence — no abrupt ring at distal end
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// FOREARM ARMOR PANEL GEOMETRY
// Dual-layer white ceramic shell.
// Anterior: ±72° coverage centred on +Z
// Posterior: ±76° coverage centred on -Z — carries the dorsal spine
// ─────────────────────────────────────────────────────────────────────────────
function createForearmArmorGeo(
  isAnterior: boolean,
  side: -1 | 1
): THREE.BufferGeometry {
  const radialSegs = 26;
  const heightSegs = 26;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const length    = 0.152;   // 152 mm humanoid forearm
  const thickness = 0.0036;

  const baseAngle    = isAnterior ? 0 : Math.PI;
  const halfAngleSpan = isAnterior ? Math.PI * 0.40 : Math.PI * 0.43;

  function getVertex(layer: 0 | 1, iy: number, ix: number): THREE.Vector3 {
    const v = iy / heightSegs;
    const u = ix / radialSegs;
    const y = -0.005 - v * length;

    // Radius profile:
    //   Proximal (elbow): r ≈ 0.040
    //   Brachioradialis swell at v ≈ 0.22: + 0.0026
    //   Smooth taper to wrist (v = 1): r ≈ 0.025
    let radius = 0.0398
      + 0.0026 * Math.sin(v * Math.PI * 0.68)   // brachioradialis swell
      - 0.0148 * v;                              // continuous taper to wrist

    const angle = baseAngle - halfAngleSpan + u * halfAngleSpan * 2.0;
    const sinA  = Math.sin(angle);
    const cosA  = Math.cos(angle);

    let rx = radius * 0.935;
    let rz = radius * 1.055;

    // Anterior subtle highlight ridge
    if (isAnterior && cosA > 0.52) {
      const t = (cosA - 0.52) / 0.48;
      rz += Math.pow(t, 1.4) * 0.0026 * Math.sin(v * Math.PI);
    }

    // Posterior dorsal spine / fin (signature form — Ref 1 & 3)
    if (!isAnterior && cosA < -0.52) {
      const t = (-cosA - 0.52) / 0.48;
      // Fin grows from v=0.10, peaks at v=0.55, fades toward wrist
      const finEnvelope = Math.sin(Math.max(0, v - 0.10) * Math.PI / 0.90);
      rz += Math.pow(t, 1.6) * 0.0060 * finEnvelope;
    }

    // Distal wrist-emergence taper — natural narrowing (v > 0.84)
    if (v > 0.84) {
      const tNarrow = (v - 0.84) / 0.16;
      rx -= tNarrow * 0.0040;
      rz -= tNarrow * 0.0050;
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

  // Edge caps — stitch outer to inner at angular edges
  for (let iy = 0; iy < heightSegs; iy++) {
    const oA = iy * stride,               oB = (iy + 1) * stride;
    const iA = iOff + iy * stride,        iB = iOff + (iy + 1) * stride;
    indices.push(oA, iA, oB, iA, iB, oB);

    const oC = iy * stride + radialSegs,  oD = (iy + 1) * stride + radialSegs;
    const iC = iOff + iy * stride + radialSegs;
    const iD = iOff + (iy + 1) * stride + radialSegs;
    indices.push(oD, iC, oC, iD, iC, oD);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FACTORY
// ─────────────────────────────────────────────────────────────────────────────
export function createForearm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ForearmNodes {
  const forearmGroup = new THREE.Group();
  forearmGroup.name = side === -1 ? 'LeftForearmRoot' : 'RightForearmRoot';

  const ledMeshes: THREE.Mesh[] = [];

  // ════════════════════════════════════════════════════════════
  // INTERNAL SPACEFRAME — dark titanium structural chassis
  // ════════════════════════════════════════════════════════════
  const internalChassisGroup = new THREE.Group();
  internalChassisGroup.name = 'ForearmInternalChassis';
  forearmGroup.add(internalChassisGroup);

  // ── Proximal Elbow Socket Collar & Interface Flange ──────────────────────
  // Receives the articulating lower clevis knuckle from Elbow.
  const collarGeo = new THREE.CylinderGeometry(0.028, 0.031, 0.016, 30);
  const elbowSocketCollar = new THREE.Mesh(collarGeo, materials.joint);
  elbowSocketCollar.name = 'ForearmElbowSocketCollar';
  elbowSocketCollar.position.set(0, -0.010, 0);
  elbowSocketCollar.castShadow = true;
  elbowSocketCollar.receiveShadow = true;
  internalChassisGroup.add(elbowSocketCollar);

  const socketRimGeo = new THREE.TorusGeometry(0.0295, 0.0016, 8, 30);
  socketRimGeo.rotateX(Math.PI / 2);
  const socketRim = new THREE.Mesh(socketRimGeo, materials.metallic);
  socketRim.position.set(0, -0.006, 0);
  internalChassisGroup.add(socketRim);

  // ── Central Structural Spine ──────────────────────────────────────────────
  const spineGeo = new THREE.BoxGeometry(0.022, 0.144, 0.032);
  const innerSleeve = new THREE.Mesh(spineGeo, materials.joint);
  innerSleeve.name = 'ForearmStructuralSpine';
  innerSleeve.position.set(0, -0.082, 0);
  innerSleeve.castShadow = true;
  innerSleeve.receiveShadow = true;
  internalChassisGroup.add(innerSleeve);

  // CNC weight-reduction cavities on spine
  for (let c = 0; c < 4; c++) {
    const cavGeo = new THREE.BoxGeometry(0.026, 0.020, 0.020);
    const cav = new THREE.Mesh(cavGeo, materials.joint);
    cav.position.set(0, -0.042 - c * 0.030, 0);
    internalChassisGroup.add(cav);
  }

  // ── Dual Internal Flexor Actuators ───────────────────────────────────────
  // Simulates tendon-driven or hydraulic finger/wrist actuator cables.
  for (const aSide of [-1, 1]) {
    const actCylGeo = new THREE.CylinderGeometry(0.0050, 0.0050, 0.054, 14);
    const actCyl = new THREE.Mesh(actCylGeo, materials.joint);
    actCyl.position.set(aSide * 0.013, -0.062, 0.009);
    actCyl.castShadow = true;
    internalChassisGroup.add(actCyl);

    const pistonGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.050, 12);
    const piston = new THREE.Mesh(pistonGeo, materials.metallic);
    piston.position.set(aSide * 0.013, -0.102, 0.009);
    piston.castShadow = true;
    internalChassisGroup.add(piston);
  }

  // ── Distal Wrist Interface Cuff & Flange ─────────────────────────────────
  // Transitions smoothly into the Wrist module.
  const cuffGeo = new THREE.CylinderGeometry(0.0236, 0.0268, 0.016, 28);
  const wristCuff = new THREE.Mesh(cuffGeo, materials.joint);
  wristCuff.name = 'ForearmWristCuff';
  wristCuff.position.set(0, -0.156, 0);
  wristCuff.castShadow = true;
  wristCuff.receiveShadow = true;
  internalChassisGroup.add(wristCuff);

  const cuffRimGeo = new THREE.TorusGeometry(0.0248, 0.0014, 8, 28);
  cuffRimGeo.rotateX(Math.PI / 2);
  const cuffRim = new THREE.Mesh(cuffRimGeo, materials.metallic);
  cuffRim.position.set(0, -0.149, 0);
  internalChassisGroup.add(cuffRim);

  // Proximal to distal transition bands (bridge armor to dark structure)
  const proxBandGeo = new THREE.CylinderGeometry(0.0365, 0.0400, 0.012, 28, 1, true);
  const proxBand = new THREE.Mesh(proxBandGeo, materials.joint);
  proxBand.position.set(0, -0.012, 0);
  internalChassisGroup.add(proxBand);

  const distBandGeo = new THREE.CylinderGeometry(0.0228, 0.0258, 0.014, 28, 1, true);
  const distBand = new THREE.Mesh(distBandGeo, materials.joint);
  distBand.position.set(0, -0.161, 0);
  internalChassisGroup.add(distBand);

  // ════════════════════════════════════════════════════════════
  // WHITE CERAMIC GAUNTLET EXOSKELETON ARMOR
  // ════════════════════════════════════════════════════════════
  const armorGroup = new THREE.Group();
  armorGroup.name = side === -1 ? 'LeftForearmArmorGroup' : 'RightForearmArmorGroup';
  forearmGroup.add(armorGroup);

  // Anterior Gauntlet Shell
  const antGeo = createForearmArmorGeo(true, side);
  const gauntletBody = new THREE.Mesh(antGeo, materials.armorDoubleSide);
  gauntletBody.name = 'AnteriorForearmArmorShell';
  gauntletBody.castShadow = true;
  gauntletBody.receiveShadow = true;
  armorGroup.add(gauntletBody);

  // Posterior Gauntlet Shell (carries the dorsal fin)
  const postGeo = createForearmArmorGeo(false, side);
  const posteriorShell = new THREE.Mesh(postGeo, materials.armorDoubleSide);
  posteriorShell.name = 'PosteriorForearmArmorShell';
  posteriorShell.castShadow = true;
  posteriorShell.receiveShadow = true;
  armorGroup.add(posteriorShell);

  // ── Recessed Lateral Parting Seam (exposes internal chassis) ─────────────
  const seamGeo = new THREE.BoxGeometry(0.0024, 0.140, 0.004);
  const panelSeam = new THREE.Mesh(seamGeo, materials.joint);
  panelSeam.name = 'ForearmPanelSeam';
  panelSeam.position.set(side * 0.037, -0.082, 0);
  armorGroup.add(panelSeam);

  const medSeamGeo = new THREE.BoxGeometry(0.0024, 0.140, 0.004);
  const medSeam = new THREE.Mesh(medSeamGeo, materials.joint);
  medSeam.position.set(-side * 0.037, -0.082, 0);
  armorGroup.add(medSeam);

  // ── Lateral Brachioradialis Accent Plate ──────────────────────────────────
  // Subtle panel accent on the lateral flank of the anterior shell.
  const brachioGeo = new THREE.BoxGeometry(0.004, 0.050, 0.018);
  const brachioradialis = new THREE.Mesh(brachioGeo, materials.armor);
  brachioradialis.name = 'ForearmBrachioradialisPlate';
  brachioradialis.position.set(side * 0.036, -0.050, 0.007);
  brachioradialis.rotation.z = -side * 0.06;
  brachioradialis.castShadow = true;
  armorGroup.add(brachioradialis);

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
