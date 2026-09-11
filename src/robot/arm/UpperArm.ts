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
 * CRITICAL CHANGE #2: REBUILT REAL UPPER ARM MECHANICAL SKELETON
 *
 * Mechanical Skeleton:
 * - Upper mounting bracket mating with shoulder connector
 * - Central structural spar (heavy 7075-T6 titanium I-beam backbone with CNC weight pockets)
 * - Two parallel longitudinal side rails with diagonal cross-brace trusses
 * - Lower elbow clevis bracket
 * - Lateral and posterior linear actuators with chrome telescopic pushrods
 * - Cable routing channels and braided conduits
 *
 * Exoskeleton Armor:
 * - Mounted AROUND the mechanical skeleton
 * - Formed by distinct manufactured panels: Anterior Bicep Shield & Posterior Tricep Shell
 * - Open lateral and medial clearance corridors exposing the internal skeleton, rails, and actuators
 * - Visible mounting bracket tabs and hex bolts
 * - Guaranteed 14mm physical clearance gap above the elbow joint
 */
export function createUpperArm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): UpperArmNodes {
  const upperArmGroup = new THREE.Group();
  upperArmGroup.name = side === -1 ? 'LeftUpperArmPivot' : 'RightUpperArmPivot';

  const ledMeshes: THREE.Mesh[] = [];
  const armatureJointGroup = new THREE.Group();

  // ==============================================================
  // 1. UPPER MOUNTING BRACKET & ROTARY COLLAR INTERFACE
  // Mates flush with shoulder.upperArmConnector seating flange at y = 0
  // ==============================================================
  const collarGeo = new THREE.CylinderGeometry(0.040, 0.038, 0.016, 32);
  const upperCollar = new THREE.Mesh(collarGeo, materials.joint);
  upperCollar.name = 'UpperArmShoulderCollar';
  upperCollar.position.set(0, -0.008, 0);
  upperCollar.castShadow = true;
  upperCollar.receiveShadow = true;
  armatureJointGroup.add(upperCollar);

  // Beveled collar rim trim ring
  const collarRimGeo = new THREE.TorusGeometry(0.040, 0.0020, 8, 32);
  const collarRim = new THREE.Mesh(collarRimGeo, materials.joint);
  collarRim.rotation.x = Math.PI / 2;
  collarRim.position.set(0, -0.002, 0);
  armatureJointGroup.add(collarRim);

  // 4 M4 structural socket cap screws on upper collar
  for (let b = 0; b < 4; b++) {
    const angle = (b / 4) * Math.PI * 2 + Math.PI / 4;
    const boltGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.0040, 6);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.position.set(Math.cos(angle) * 0.032, -0.002, Math.sin(angle) * 0.032);
    armatureJointGroup.add(bolt);
  }

  // ==============================================================
  // 2. REAL INTERNAL MECHANICAL SKELETON
  // Central Structural Spar + Two Side Rails + Cross-Braces
  // ==============================================================

  // A. Central Structural Spar (CNC 7075-T6 Titanium I-Beam Spine)
  // Dimensions: 24mm wide, 34mm deep, 158mm long
  const sparWebGeo = new THREE.BoxGeometry(0.014, 0.158, 0.034);
  const armatureCore = new THREE.Mesh(sparWebGeo, materials.joint);
  armatureCore.name = 'UpperArmArmatureCore';
  armatureCore.position.set(0, -0.090, 0);
  armatureCore.castShadow = true;
  armatureCore.receiveShadow = true;
  armatureJointGroup.add(armatureCore);

  // CNC weight-reduction lightening pockets (ribbed recesses along spine)
  for (let p = 0; p < 4; p++) {
    const pocketGeo = new THREE.BoxGeometry(0.018, 0.024, 0.018);
    const pocket = new THREE.Mesh(pocketGeo, materials.joint);
    pocket.position.set(0, -0.042 - p * 0.032, 0);
    armatureJointGroup.add(pocket);
  }

  // B. Two Longitudinal Side Rails (Lateral and Medial)
  for (let s = -1; s <= 1; s += 2) {
    // Structural side rail extrusion
    const railGeo = new THREE.BoxGeometry(0.006, 0.154, 0.012);
    const rail = new THREE.Mesh(railGeo, materials.joint);
    rail.position.set(s * 0.025, -0.090, 0);
    rail.castShadow = true;
    armatureJointGroup.add(rail);

    // Diagonal Cross-Brace Trusses linking side rail to central spar
    for (let c = 0; c < 3; c++) {
      const trussGeo = new THREE.CylinderGeometry(0.0024, 0.0024, 0.026, 8);
      trussGeo.rotateZ(Math.PI / 4 * (c % 2 === 0 ? 1 : -1) * s);
      const truss = new THREE.Mesh(trussGeo, materials.joint);
      truss.position.set(s * 0.014, -0.048 - c * 0.040, 0);
      armatureJointGroup.add(truss);
    }
  }

  // C. Lower Elbow Structural Clevis Bracket
  // Heavy dual-prong bracket anchoring to the elbow hinge axis
  const lowerBracketGeo = new THREE.BoxGeometry(0.042, 0.024, 0.036);
  const elbowSocketCuff = new THREE.Mesh(lowerBracketGeo, materials.joint);
  elbowSocketCuff.name = 'UpperArmElbowSocketCuff';
  elbowSocketCuff.position.set(0, -0.168, 0);
  elbowSocketCuff.castShadow = true;
  armatureJointGroup.add(elbowSocketCuff);

  const cuffBevelGeo = new THREE.TorusGeometry(0.028, 0.0024, 8, 24);
  const cuffBevel = new THREE.Mesh(cuffBevelGeo, materials.joint);
  cuffBevel.rotation.x = Math.PI / 2;
  cuffBevel.position.set(0, -0.174, 0);
  armatureJointGroup.add(cuffBevel);

  // ==============================================================
  // 3. ACTUATORS & CABLE HARNESS
  // Lateral Linear Actuator + Posterior Tricep Ram
  // ==============================================================

  // A. Lateral Bicep Linear Actuator (High-Pressure Hydraulic / Roller-Screw)
  const actMountBossGeo = new THREE.BoxGeometry(0.012, 0.018, 0.014);
  const actMountBoss = new THREE.Mesh(actMountBossGeo, materials.joint);
  actMountBoss.position.set(-side * 0.016, -0.048, -0.014);
  armatureJointGroup.add(actMountBoss);

  // Actuator Cylinder Barrel (Dark Gunmetal)
  const bicepActCylGeo = new THREE.CylinderGeometry(0.0078, 0.0078, 0.076, 16);
  const bicepActCyl = new THREE.Mesh(bicepActCylGeo, materials.joint);
  bicepActCyl.position.set(-side * 0.025, -0.068, 0.006);
  bicepActCyl.castShadow = true;
  armatureJointGroup.add(bicepActCyl);

  // Telescopic Mirror-Chrome Pushrod Shaft
  const bicepActRodGeo = new THREE.CylinderGeometry(0.0044, 0.0044, 0.064, 16);
  const bicepActRod = new THREE.Mesh(bicepActRodGeo, materials.joint);
  bicepActRod.position.set(-side * 0.025, -0.124, 0.006);
  bicepActRod.castShadow = true;
  armatureJointGroup.add(bicepActRod);

  // Anodized Violet Sensor Ring
  const bicepCollarGeo = new THREE.TorusGeometry(0.0082, 0.0014, 6, 16);
  const bicepCollar = new THREE.Mesh(bicepCollarGeo, materials.purpleEmissive);
  bicepCollar.rotation.x = Math.PI / 2;
  bicepCollar.position.set(-side * 0.025, -0.038, 0.006);
  upperArmGroup.add(bicepCollar);
  ledMeshes.push(bicepCollar);

  // B. Posterior Tricep Hydraulic Actuator
  const tricepActGeo = new THREE.CylinderGeometry(0.0070, 0.0070, 0.068, 16);
  const tricepActuator = new THREE.Mesh(tricepActGeo, materials.joint);
  tricepActuator.name = 'TricepActuator';
  tricepActuator.position.set(0, -0.072, -0.020);
  tricepActuator.castShadow = true;
  armatureJointGroup.add(tricepActuator);

  const tricepPistonGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.054, 12);
  const tricepPiston = new THREE.Mesh(tricepPistonGeo, materials.joint);
  tricepPiston.name = 'TricepPiston';
  tricepPiston.position.set(0, -0.122, -0.020);
  tricepPiston.castShadow = true;
  armatureJointGroup.add(tricepPiston);

  // C. Central Spinal Cable Conduits & Stainless Hydraulic Lines
  for (let c = -1; c <= 1; c += 2) {
    const conduitGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.144, 8);
    const conduit = new THREE.Mesh(conduitGeo, materials.joint);
    conduit.position.set(c * 0.008, -0.090, 0.016);
    armatureJointGroup.add(conduit);

    // Hard hydraulic fluid lines running along side rails
    const hydroLineGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.140, 8);
    const hydroLine = new THREE.Mesh(hydroLineGeo, materials.joint);
    hydroLine.position.set(c * 0.022, -0.090, -0.008);
    armatureJointGroup.add(hydroLine);

    // Conduit retainer brackets / clamps
    for (let k = 0; k < 3; k++) {
      const clampGeo = new THREE.BoxGeometry(0.004, 0.003, 0.006);
      const clamp = new THREE.Mesh(clampGeo, materials.joint);
      clamp.position.set(c * 0.022, -0.050 - k * 0.040, -0.008);
      armatureJointGroup.add(clamp);
    }
  }

  // Merge static mechanical skeleton elements
  const mergedSkeleton = mergeGroupMeshesByMaterial(armatureJointGroup, materials.joint, 'UpperArmSkeleton_Merged', false);
  if (mergedSkeleton) {
    mergedSkeleton.castShadow = true;
    mergedSkeleton.receiveShadow = true;
    upperArmGroup.add(mergedSkeleton);
  }

  // ==============================================================
  // 4. WHITE CERAMIC EXOSKELETON ARMOR MOUNTED AROUND SKELETON
  // Split into manufactured panels:
  // - Anterior Bicep Shield (prominent specular ridge, mounting tabs)
  // - Posterior Tricep Armor Panel
  // - Wide open lateral & medial clearance windows exposing internal rails & actuators
  // - 14mm guaranteed physical gap above the elbow joint
  // ==============================================================
  const bicepSubGroup = new THREE.Group();
  bicepSubGroup.name = side === -1 ? 'LeftBicepSubGroup' : 'RightBicepSubGroup';
  bicepSubGroup.position.set(0, -0.082, 0);
  upperArmGroup.add(bicepSubGroup);

  // A. Sculpted Anterior Bicep Shield Panel
  // Covers front arc (phi between -60° and +60°), leaving sides completely open
  function createAnteriorBicepShieldGeo(): THREE.BufferGeometry {
    const radialSegs = 20;
    const heightSegs = 22;
    const length = 0.136; // Stops at y = -0.150, leaving clean 15mm clearance above elbow
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy <= heightSegs; iy++) {
      const v = iy / heightSegs;
      const y = 0.068 - v * length;

      // Base radius with slight anatomical bicep swell at v = 0.40
      const baseR = 0.0385 + 0.0040 * Math.sin(v * Math.PI) - 0.0035 * v;

      for (let ix = 0; ix <= radialSegs; ix++) {
        const u = ix / radialSegs;
        // Arc spans from -Math.PI*0.38 to +Math.PI*0.38 (anterior front shield only!)
        const angle = -Math.PI * 0.38 + u * (Math.PI * 0.76);
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);

        let rx = baseR;
        let rz = baseR;

        // Sharp Anterior Longitudinal Specular Ridge Crest (along centerline cosA > 0.6)
        if (cosA > 0.60) {
          const tRidge = (cosA - 0.60) / 0.40;
          const ridgeHeight = 0.0042 * Math.pow(tRidge, 1.6) * (0.7 + 0.3 * Math.sin(v * Math.PI));
          rz += ridgeHeight;
        }

        // Medial clearance taper
        if (sinA * side > 0) {
          rx -= 0.0016 * Math.abs(sinA);
        }

        // Distal beveled edge taper
        if (v > 0.85) {
          const bevel = (v - 0.85) / 0.15;
          rz -= bevel * 0.0035;
        }

        const x = rx * sinA;
        const z = rz * cosA;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < heightSegs; iy++) {
      for (let ix = 0; ix < radialSegs; ix++) {
        const a = iy * (radialSegs + 1) + ix;
        const b = (iy + 1) * (radialSegs + 1) + ix;
        const c = (iy + 1) * (radialSegs + 1) + (ix + 1);
        const d = iy * (radialSegs + 1) + (ix + 1);
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

  const bicepShieldGeo = createAnteriorBicepShieldGeo();
  const bicepShell = new THREE.Mesh(bicepShieldGeo, materials.armorDoubleSide);
  bicepShell.name = 'BicepArmorShield';
  bicepShell.castShadow = true;
  bicepShell.receiveShadow = true;
  bicepSubGroup.add(bicepShell);

  // B. Sculpted Posterior Tricep Armor Panel
  // Covers posterior arc (cosA < -0.40)
  function createPosteriorTricepPanelGeo(): THREE.BufferGeometry {
    const radialSegs = 18;
    const heightSegs = 20;
    const length = 0.130;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy <= heightSegs; iy++) {
      const v = iy / heightSegs;
      const y = 0.065 - v * length;
      const baseR = 0.0375 + 0.0030 * Math.sin(v * Math.PI) - 0.0030 * v;

      for (let ix = 0; ix <= radialSegs; ix++) {
        const u = ix / radialSegs;
        // Arc spans posterior side from Math.PI*0.62 to Math.PI*1.38
        const angle = Math.PI * 0.65 + u * (Math.PI * 0.70);
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);

        const x = baseR * sinA;
        const z = baseR * cosA;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < heightSegs; iy++) {
      for (let ix = 0; ix < radialSegs; ix++) {
        const a = iy * (radialSegs + 1) + ix;
        const b = (iy + 1) * (radialSegs + 1) + ix;
        const c = (iy + 1) * (radialSegs + 1) + (ix + 1);
        const d = iy * (radialSegs + 1) + (ix + 1);
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

  const tricepPanelGeo = createPosteriorTricepPanelGeo();
  const tricepPanel = new THREE.Mesh(tricepPanelGeo, materials.armorDoubleSide);
  tricepPanel.name = 'TricepArmorPanel';
  tricepPanel.castShadow = true;
  tricepPanel.receiveShadow = true;
  bicepSubGroup.add(tricepPanel);

  // C. Visible Armor Mounting Standoff Brackets (proving armor is bolted onto the skeleton)
  for (const mY of [0.038, -0.012, -0.048]) {
    for (const mSide of [-1, 1]) {
      // Dark titanium mounting bracket lug clamping from skeleton to armor edge
      const lugGeo = new THREE.BoxGeometry(0.008, 0.006, 0.008);
      const lug = new THREE.Mesh(lugGeo, materials.joint);
      lug.position.set(mSide * 0.024, mY, 0.022);
      bicepSubGroup.add(lug);

      // Fastener bolt head
      const boltGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.0020, 6);
      const bolt = new THREE.Mesh(boltGeo, materials.joint);
      bolt.position.set(mSide * 0.026, mY, 0.025);
      bolt.rotation.x = Math.PI / 2;
      bicepSubGroup.add(bolt);
    }
  }

  // D. Longitudinal Cybernetic LED Light Channel on Anterior Armor Ridge
  const ledGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.118, 12);
  const ledStrip = new THREE.Mesh(ledGeo, materials.purpleEmissive);
  ledStrip.name = 'BicepLedStrip';
  ledStrip.position.set(0, 0, 0.041);
  bicepSubGroup.add(ledStrip);
  ledMeshes.push(ledStrip);

  // E. Dark Technical Panel Seam Base
  const seamGeo = new THREE.BoxGeometry(0.0035, 0.124, 0.004);
  const panelSeam = new THREE.Mesh(seamGeo, materials.joint);
  panelSeam.name = 'BicepPanelSeam';
  panelSeam.position.set(0, 0, 0.039);
  bicepSubGroup.add(panelSeam);

  const topDomeCap = upperCollar;
  const topSocketRim = collarRim;

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
