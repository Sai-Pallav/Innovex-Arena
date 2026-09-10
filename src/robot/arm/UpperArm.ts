import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

export interface UpperArmNodes {
  group: THREE.Group;
  upperCollar: THREE.Mesh;
  armatureCore: THREE.Mesh;
  bicepShell: THREE.Mesh;
  topDomeCap: THREE.Mesh;
  topSocketRim: THREE.Mesh;
  elbowSocketCuff: THREE.Mesh;
  panelSeam: THREE.Mesh;
  tricepActuator: THREE.Mesh;
  tricepPiston: THREE.Mesh;
}

/**
 * RECONSTRUCTED UPPER ARM (BICEP / TRICEP) ASSEMBLY
 * Adheres strictly to the reference image and Section 6:
 * - Clean separation line from Shoulder Joint Upper Arm Connector
 * - Open, sculpted top socket collar seating the articulated connector stem
 * - Ergonomically contoured white ceramic bicep armor shell with athletic humanoid proportions
 * - Bottom scooped elbow socket cuff seating the circular elbow hinge barrel
 * - Structural dark titanium internal bone core
 * - Precision longitudinal panel seam with metallic underlayer
 * - Posterior tricep actuator rod and chrome piston shaft
 */
export function createUpperArm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): UpperArmNodes {
  const upperArmGroup = new THREE.Group();
  upperArmGroup.name = side === -1 ? 'LeftUpperArmPivot' : 'RightUpperArmPivot';

  // 1. Upper Rotary Connector Collar under Shoulder Ball Joint
  const collarGeo = new THREE.CylinderGeometry(0.044, 0.042, 0.020, 24);
  const upperCollar = new THREE.Mesh(collarGeo, materials.joint);
  upperCollar.position.set(side * 0.003, -0.010, 0);
  upperCollar.castShadow = true;
  upperArmGroup.add(upperCollar);

  // 2. Structural Dark Titanium Armature Core / Bone
  const boneGeo = new THREE.CylinderGeometry(0.038, 0.034, 0.20, 20);
  const armatureCore = new THREE.Mesh(boneGeo, materials.joint);
  armatureCore.position.set(side * 0.003, -0.105, 0);
  armatureCore.castShadow = true;
  upperArmGroup.add(armatureCore);

  // 3. Sculpted White Ceramic Bicep Shell
  // Contoured athletic humanoid silhouette tapering toward the elbow
  function createBicepGeometry(): THREE.BufferGeometry {
    const radialSegments = 32;
    const heightSegments = 20;
    const length = 0.180;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy <= heightSegments; iy++) {
      const v = iy / heightSegments; // 0 = top, 1 = bottom
      const y = 0.090 - v * length;

      // Base taper: wider at deltoid/bicep peak, narrower at elbow
      const baseR = 0.053 - 0.012 * v;

      for (let ix = 0; ix <= radialSegments; ix++) {
        const u = ix / radialSegments;
        const angle = u * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        let rx = baseR * 0.94;
        let rz = baseR * 1.02;

        // Anterior (+Z, cosA > 0) bicep bulge in upper-mid section
        const anteriorFactor = Math.max(0, cosA);
        if (anteriorFactor > 0 && v > 0.15 && v < 0.75) {
          const bulge = Math.sin(((v - 0.15) / 0.60) * Math.PI);
          rz += anteriorFactor * 0.0065 * bulge;
        }

        // Lateral flare (sinA * side > 0)
        const lateralFactor = Math.max(0, sinA * side);
        if (lateralFactor > 0 && v < 0.60) {
          rx += lateralFactor * 0.004 * Math.sin((v / 0.60) * Math.PI);
        }

        // Scalloped arch cutout at elbow connection (Reference: ELBOW OVERVIEW -> Armor Connection)
        // Arches upward on lateral and medial flanks (where abs(sinA) is high) to cleanly frame
        // the circular Side Rotational Discs with an even, continuous ~3.5mm radial clearance gap
        let localY = y;
        if (v > 0.65) {
          const bottomBlend = Math.pow((v - 0.65) / 0.35, 1.4);
          const archHeight = 0.021 * Math.pow(Math.abs(sinA), 1.30) * bottomBlend;
          localY += archHeight;
        }

        const x = rx * sinA;
        const z = rz * cosA;

        positions.push(x, localY, z);
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

  const bicepSubGroup = new THREE.Group();
  bicepSubGroup.position.set(side * 0.003, -0.105, 0.003);
  upperArmGroup.add(bicepSubGroup);

  const bicepGeo = createBicepGeometry();
  const bicepShell = new THREE.Mesh(bicepGeo, materials.armorDoubleSide);
  bicepShell.name = 'BicepArmorShell';
  bicepShell.castShadow = true;
  bicepShell.receiveShadow = true;
  bicepSubGroup.add(bicepShell);

  // Open Scooped Top Socket Rim (Section 6: Clear separation line under connector)
  const topRimGeo = new THREE.TorusGeometry(0.048, 0.0032, 10, 32);
  const topSocketRim = new THREE.Mesh(topRimGeo, materials.joint);
  topSocketRim.rotation.x = Math.PI / 2;
  topSocketRim.position.set(0, 0.088, 0);
  topSocketRim.castShadow = true;
  bicepSubGroup.add(topSocketRim);

  // Inner socket sleeve collar accepting connector spigot
  const topSleeveGeo = new THREE.CylinderGeometry(0.043, 0.046, 0.014, 24);
  const topSleeve = new THREE.Mesh(topSleeveGeo, materials.joint);
  topSleeve.position.set(0, 0.082, 0);
  bicepSubGroup.add(topSleeve);

  // Bottom Elbow Socket Cuff (Dark titanium cuff nesting inside bicep armor above elbow hinge)
  const socketCuffGeo = new THREE.CylinderGeometry(0.038, 0.035, 0.018, 28);
  const elbowSocketCuff = new THREE.Mesh(socketCuffGeo, materials.joint);
  elbowSocketCuff.position.set(0, -0.076, 0);
  elbowSocketCuff.castShadow = true;
  bicepSubGroup.add(elbowSocketCuff);

  // Longitudinal Panel Seam Ridge
  const seamGeo = new THREE.BoxGeometry(0.003, 0.150, 0.005);
  const panelSeam = new THREE.Mesh(seamGeo, materials.joint);
  panelSeam.position.set(side * 0.024, 0, 0.052);
  bicepSubGroup.add(panelSeam);

  // 4. Tricep Posterior Mechanical Actuator Rod
  const actGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.14, 12);
  const tricepActuator = new THREE.Mesh(actGeo, materials.joint);
  tricepActuator.position.set(side * 0.003, -0.105, -0.036);
  tricepActuator.castShadow = true;
  upperArmGroup.add(tricepActuator);

  // Polished Piston Shaft inside Tricep Actuator
  const pistonGeo = new THREE.CylinderGeometry(0.0042, 0.0042, 0.11, 10);
  const tricepPiston = new THREE.Mesh(pistonGeo, materials.armor);
  tricepPiston.position.set(side * 0.003, -0.125, -0.036);
  upperArmGroup.add(tricepPiston);

  return {
    group: upperArmGroup,
    upperCollar,
    armatureCore,
    bicepShell,
    topDomeCap: topSocketRim, // Backwards-compatible alias
    topSocketRim,
    elbowSocketCuff,
    panelSeam,
    tricepActuator,
    tricepPiston,
  };
}
