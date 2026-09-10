import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

export interface ShoulderNodes {
  group: THREE.Group;                  // ShoulderPivot root
  jointGroup: THREE.Group;             // ShoulderJoint rotating assembly
  armorGroup: THREE.Group;             // ShoulderArmor assembly
  shoulderArmor: THREE.Mesh;           // White outer protective shell
  rotationalCore: THREE.Mesh;          // Central rotational disc / core hub
  outerRing: THREE.Mesh;               // Outer black ring framing joint
  innerRing: THREE.Mesh;               // Inner black ring towards torso
  innerStructure: THREE.Group;         // Segmented mechanical stator / gear ring
  upperArmConnector: THREE.Group;      // Articulated black connector
  accentRing: THREE.Mesh;              // Purple emissive accent ring
  torsoMountPlate: THREE.Mesh;         // Shoulder mounting plate
  ledMeshes: THREE.Mesh[];             // Emissive meshes for lighting
  // Backwards compatibility aliases
  rotatingHub: THREE.Mesh;
  ballJoint: THREE.Mesh;
  pauldronCowl: THREE.Mesh;
  socketApertureRim: THREE.Mesh;
}

/**
 * Creates the parametric Shoulder Armor Shell adhering strictly to Section 2, 8, & 9:
 * - Smooth dome / curved protective shell
 * - Slightly elongated vertically on the lateral flank following the upper-arm direction
 * - Real 3D wall thickness (outer surface + inner surface + continuous beveled rim)
 * - Hollow cavity underneath leaving intentional dark mechanical gap
 * - Scooped open medial side toward the torso/clavicle ensuring zero mesh collision
 * - Clean quad-like topology loops (~600 triangles)
 */
function createShoulderArmorGeometry(side: -1 | 1): THREE.BufferGeometry {
  const nu = 16; // Longitudinal segments around shell arc
  const nv = 8;  // Latitudinal segments from top crest to lower skirt
  const thickness = 0.0055; // 5.5mm physical armor shell thickness

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  interface VertData {
    x: number;
    y: number;
    z: number;
    u: number;
    v: number;
    nx: number;
    ny: number;
    nz: number;
  }

  const outerVerts: VertData[] = [];
  const innerVerts: Array<{ x: number; y: number; z: number; u: number; v: number }> = [];

  // Proportions matched tightly to reference image
  const rx = 0.076; // Lateral radius
  const ry = 0.066; // Vertical height radius
  const rz = 0.072; // Anterior/posterior depth radius

  const ox = side * 0.006;
  const oy = 0.006;
  const oz = 0.000;

  for (let iv = 0; iv <= nv; iv++) {
    const v = iv / nv;
    // phi curves from top crest down past equator to bottom skirt (~95°)
    const phi = 0.04 + v * (Math.PI * 0.50);
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    for (let iu = 0; iu <= nu; iu++) {
      const u = iu / nu;
      // theta: arc from front-medial edge through lateral apex (u=0.5) to rear-medial edge
      const theta = (u - 0.5) * (Math.PI * 1.30);
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      // Downward vertical elongation on lateral flank (following upper arm direction)
      const latFactor = Math.max(0, cosTheta);
      const yDrop = 0.018 * Math.pow(v, 1.20) * Math.pow(latFactor, 0.85);

      // Medial clearance cutout so armor shell clears chest and neck collar cleanly
      const medialFactor = Math.max(0, -cosTheta);
      const currRx = rx - medialFactor * 0.016;
      const currRz = rz * (1.0 - 0.06 * v);

      const x = ox + side * (currRx * sinPhi * cosTheta);
      const y = oy + (ry * cosPhi - yDrop);
      const z = oz + (currRz * sinPhi * sinTheta);

      // Outward surface normal vector
      const dx = (x - ox) / currRx;
      const dy = (y - oy) / ry;
      const dz = (z - oz) / currRz;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const nz = dz / len;

      outerVerts.push({ x, y, z, u, v, nx, ny, nz });

      // Inner shell vertex offset along inward normal by wall thickness
      const inX = x - nx * thickness;
      const inY = y - ny * thickness;
      const inZ = z - nz * thickness;
      innerVerts.push({ x: inX, y: inY, z: inZ, u, v });
    }
  }

  // Push outer vertices
  for (const vert of outerVerts) {
    positions.push(vert.x, vert.y, vert.z);
    uvs.push(vert.u, vert.v);
  }

  // Push inner vertices
  for (const vert of innerVerts) {
    positions.push(vert.x, vert.y, vert.z);
    uvs.push(vert.u, vert.v);
  }

  const stride = nu + 1;
  const innerOffset = outerVerts.length;

  // 1. Outer surface quads (facing outwards)
  for (let iv = 0; iv < nv; iv++) {
    for (let iu = 0; iu < nu; iu++) {
      const a = iv * stride + iu;
      const b = (iv + 1) * stride + iu;
      const c = (iv + 1) * stride + (iu + 1);
      const d = iv * stride + (iu + 1);

      if (side === 1) {
        indices.push(a, b, d);
        indices.push(b, c, d);
      } else {
        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }
  }

  // 2. Inner surface quads (reversed winding, facing into the internal mechanical hollow)
  for (let iv = 0; iv < nv; iv++) {
    for (let iu = 0; iu < nu; iu++) {
      const a = innerOffset + iv * stride + iu;
      const b = innerOffset + (iv + 1) * stride + iu;
      const c = innerOffset + (iv + 1) * stride + (iu + 1);
      const d = innerOffset + iv * stride + (iu + 1);

      if (side === 1) {
        indices.push(a, d, b);
        indices.push(b, d, c);
      } else {
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
  }

  // 3. Lower Skirt rim quads at v = nv (connecting outer skirt loop to inner skirt loop)
  const lastRow = nv * stride;
  const innerLastRow = innerOffset + nv * stride;
  for (let iu = 0; iu < nu; iu++) {
    const o1 = lastRow + iu;
    const o2 = lastRow + (iu + 1);
    const i1 = innerLastRow + iu;
    const i2 = innerLastRow + (iu + 1);

    if (side === 1) {
      indices.push(o1, o2, i1);
      indices.push(o2, i2, i1);
    } else {
      indices.push(o1, i1, o2);
      indices.push(o2, i1, i2);
    }
  }

  // 4. Top crest ridge quads at v = 0
  for (let iu = 0; iu < nu; iu++) {
    const o1 = iu;
    const o2 = iu + 1;
    const i1 = innerOffset + iu;
    const i2 = innerOffset + iu + 1;

    if (side === 1) {
      indices.push(o1, i1, o2);
      indices.push(o2, i1, i2);
    } else {
      indices.push(o1, o2, i1);
      indices.push(o2, i2, i1);
    }
  }

  // 5. Anterior medial rim at iu = 0
  for (let iv = 0; iv < nv; iv++) {
    const o1 = iv * stride;
    const o2 = (iv + 1) * stride;
    const i1 = innerOffset + iv * stride;
    const i2 = innerOffset + (iv + 1) * stride;

    if (side === 1) {
      indices.push(o1, i1, o2);
      indices.push(o2, i1, i2);
    } else {
      indices.push(o1, o2, i1);
      indices.push(o2, i2, i1);
    }
  }

  // 6. Posterior medial rim at iu = nu
  for (let iv = 0; iv < nv; iv++) {
    const o1 = iv * stride + nu;
    const o2 = (iv + 1) * stride + nu;
    const i1 = innerOffset + iv * stride + nu;
    const i2 = innerOffset + (iv + 1) * stride + nu;

    if (side === 1) {
      indices.push(o1, i1, o2);
      indices.push(o2, i1, i2);
    } else {
      indices.push(o1, o2, i1);
      indices.push(o2, i2, i1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * RECONSTRUCTED INNOVEX ARENA ROBOT SHOULDER ASSEMBLY
 * Adheres strictly to the master specification and multi-view technical reference image:
 *
 * WHITE OUTER ARMOR
 *         ↓
 * BLACK MECHANICAL GAP
 *         ↓
 * BLACK ROTATIONAL JOINT
 *         ↓
 * UPPER ARM CONNECTOR
 *         ↓
 * UPPER ARM
 */
export function createShoulder(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ShoulderNodes {
  // 1. Root ShoulderPivot
  const shoulderGroup = new THREE.Group();
  shoulderGroup.name = side === -1 ? 'LeftShoulderPivot' : 'RightShoulderPivot';

  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 2. SHOULDER ARMOR (Outer Protective Shell)
  // ==========================================
  const armorGroup = new THREE.Group();
  armorGroup.name = side === -1 ? 'LeftShoulderArmor' : 'RightShoulderArmor';
  // Ergonomic outward pauldron tilt matching reference silhouette
  armorGroup.rotation.z = -side * 0.05;
  armorGroup.rotation.y = -side * 0.04;
  shoulderGroup.add(armorGroup);

  const armorGeo = createShoulderArmorGeometry(side);
  const shoulderArmor = new THREE.Mesh(armorGeo, materials.armorDoubleSide);
  shoulderArmor.name = side === -1 ? 'LeftShoulderArmorShell' : 'RightShoulderArmorShell';
  shoulderArmor.castShadow = true;
  shoulderArmor.receiveShadow = true;
  armorGroup.add(shoulderArmor);

  // Interior mounting bracket connecting armor to top chassis with clearance
  const mountBracketGeo = new THREE.CylinderGeometry(0.044, 0.048, 0.010, 14);
  const mountBracket = new THREE.Mesh(mountBracketGeo, materials.joint);
  mountBracket.position.set(side * 0.006, 0.028, 0.000);
  mountBracket.castShadow = true;
  armorGroup.add(mountBracket);

  // Subtle purple emissive edge accent line under armor rim (Section 7: edge illumination)
  const edgeCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(side * 0.005, 0.038, 0.038),
    new THREE.Vector3(side * 0.016, 0.034, 0.000),
    new THREE.Vector3(side * 0.005, 0.030, -0.038)
  );
  const edgeStripGeo = new THREE.TubeGeometry(edgeCurve, 8, 0.0016, 5, false);
  const edgeStrip = new THREE.Mesh(edgeStripGeo, materials.purpleEmissive);
  edgeStrip.name = side === -1 ? 'LeftShoulderGapLight' : 'RightShoulderGapLight';
  armorGroup.add(edgeStrip);
  ledMeshes.push(edgeStrip);

  // ==========================================
  // 3. SHOULDER JOINT (Rotating Mechanism Assembly)
  // ==========================================
  const jointGroup = new THREE.Group();
  jointGroup.name = side === -1 ? 'LeftShoulderJoint' : 'RightShoulderJoint';
  // Forward cant (~7°) so concentric rotational face is clearly visible in front & 3/4 camera
  jointGroup.rotation.y = -side * 0.12;
  shoulderGroup.add(jointGroup);

  // A. Main Dark Titanium Cylindrical Rotary Joint Housing
  const coreHousingGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.046, 16);
  const coreHousing = new THREE.Mesh(coreHousingGeo, materials.joint);
  coreHousing.rotation.z = Math.PI / 2;
  coreHousing.position.set(side * 0.010, 0, 0);
  coreHousing.castShadow = true;
  coreHousing.receiveShadow = true;
  jointGroup.add(coreHousing);

  // B. Inner Structure: Radial Stator Ring with Segmented Teeth (Exploded View & Close-Up Detail)
  const innerStructure = new THREE.Group();
  innerStructure.name = side === -1 ? 'LeftInnerStructure' : 'RightInnerStructure';
  jointGroup.add(innerStructure);

  const statorBaseGeo = new THREE.CylinderGeometry(0.056, 0.056, 0.022, 16);
  const statorBase = new THREE.Mesh(statorBaseGeo, materials.joint);
  statorBase.rotation.z = Math.PI / 2;
  statorBase.position.set(side * 0.012, 0, 0);
  statorBase.castShadow = true;
  innerStructure.add(statorBase);

  // 10 radial mechanical teeth blocks creating the industrial stator gear texture in the gap
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(0.018, 0.0038, 0.0070);
    const tooth = new THREE.Mesh(toothGeo, materials.joint);
    tooth.position.set(
      side * 0.012,
      Math.sin(angle) * 0.0575,
      Math.cos(angle) * 0.0575
    );
    tooth.rotation.x = angle;
    innerStructure.add(tooth);
  }

  // C. Concentric Rotational Joint Layers (Lateral Face)
  // 1. Outer Ring: Beveled casing framing the outer circular perimeter
  const outerRingGeo = new THREE.TorusGeometry(0.050, 0.0038, 6, 16);
  const outerRing = new THREE.Mesh(outerRingGeo, materials.joint);
  outerRing.name = side === -1 ? 'LeftOuterRing' : 'RightOuterRing';
  outerRing.rotation.y = Math.PI / 2;
  outerRing.position.set(side * 0.046, 0, 0);
  outerRing.castShadow = true;
  jointGroup.add(outerRing);

  // 2. Stepped Recessed Disc Face
  const steppedFaceGeo = new THREE.CylinderGeometry(0.047, 0.047, 0.004, 16);
  const steppedFace = new THREE.Mesh(steppedFaceGeo, materials.joint);
  steppedFace.rotation.z = Math.PI / 2;
  steppedFace.position.set(side * 0.047, 0, 0);
  jointGroup.add(steppedFace);

  // 3. Signature Concentric Purple Emissive Accent Ring (Reference: Rotational Joint Detail)
  const accentGeo = new THREE.TorusGeometry(0.036, 0.0024, 6, 16);
  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.name = side === -1 ? 'LeftShoulderAccentRing' : 'RightShoulderAccentRing';
  accentRing.rotation.y = Math.PI / 2;
  accentRing.position.set(side * 0.0495, 0, 0);
  jointGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // 4. Inner Ring: Concentric machined stepped ring between accent groove and core
  const innerRingGeo = new THREE.TorusGeometry(0.026, 0.0028, 6, 14);
  const innerRing = new THREE.Mesh(innerRingGeo, materials.joint);
  innerRing.name = side === -1 ? 'LeftInnerRing' : 'RightInnerRing';
  innerRing.rotation.y = Math.PI / 2;
  innerRing.position.set(side * 0.0505, 0, 0);
  jointGroup.add(innerRing);

  // 5. Rotational Core: Raised central circular disc / core hub
  const coreDiscGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.005, 16);
  const rotationalCore = new THREE.Mesh(coreDiscGeo, materials.joint);
  rotationalCore.name = side === -1 ? 'LeftRotationalCore' : 'RightRotationalCore';
  rotationalCore.rotation.z = Math.PI / 2;
  rotationalCore.position.set(side * 0.052, 0, 0);
  rotationalCore.castShadow = true;
  jointGroup.add(rotationalCore);

  // 6. Central Pivot Boss Cap
  const centerPinGeo = new THREE.CylinderGeometry(0.009, 0.011, 0.004, 14);
  const centerPin = new THREE.Mesh(centerPinGeo, materials.joint);
  centerPin.rotation.z = Math.PI / 2;
  centerPin.position.set(side * 0.055, 0, 0);
  jointGroup.add(centerPin);

  // 7. Radial Detail Rivets (6 concentric circular pins around the hub)
  for (let i = 0; i < 6; i++) {
    const pinAngle = (i / 6) * Math.PI * 2;
    const pinGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.003, 6);
    const pin = new THREE.Mesh(pinGeo, materials.joint);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(
      side * 0.0545,
      Math.sin(pinAngle) * 0.016,
      Math.cos(pinAngle) * 0.016
    );
    jointGroup.add(pin);
  }

  // D. Medial Connection Face (Towards Torso Mount)
  // Shoulder Mounting Plate
  const mountPlateGeo = new THREE.CylinderGeometry(0.052, 0.050, 0.016, 16);
  const torsoMountPlate = new THREE.Mesh(mountPlateGeo, materials.joint);
  torsoMountPlate.name = side === -1 ? 'LeftTorsoMountPlate' : 'RightTorsoMountPlate';
  torsoMountPlate.rotation.z = Math.PI / 2;
  torsoMountPlate.position.set(-side * 0.024, 0, 0);
  torsoMountPlate.castShadow = true;
  jointGroup.add(torsoMountPlate);

  const inwardRimGeo = new THREE.TorusGeometry(0.052, 0.0040, 6, 14);
  const inwardRim = new THREE.Mesh(inwardRimGeo, materials.joint);
  inwardRim.rotation.y = Math.PI / 2;
  inwardRim.position.set(-side * 0.026, 0, 0);
  jointGroup.add(inwardRim);

  // ==========================================
  // 4. UPPER ARM CONNECTOR (Section 6 & Reference Exploded View)
  // Articulated dark cylindrical connector block between Shoulder Joint → Upper Arm
  // ==========================================
  const upperArmConnector = new THREE.Group();
  upperArmConnector.name = side === -1 ? 'LeftUpperArmConnector' : 'RightUpperArmConnector';
  jointGroup.add(upperArmConnector);

  // Upper clevis housing articulating with underside of rotary joint
  const clevisGeo = new THREE.CylinderGeometry(0.026, 0.028, 0.020, 14);
  const clevis = new THREE.Mesh(clevisGeo, materials.joint);
  clevis.position.set(side * 0.002, -0.026, 0);
  clevis.castShadow = true;
  upperArmConnector.add(clevis);

  // Lateral articulation pivot axis pin with beveled bolt cap
  const pivotPinGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.005, 12);
  const pivotPin = new THREE.Mesh(pivotPinGeo, materials.joint);
  pivotPin.rotation.z = Math.PI / 2;
  pivotPin.position.set(side * 0.018, -0.026, 0);
  upperArmConnector.add(pivotPin);

  // Articulated connector stem linking down to upper arm collar
  const stemGeo = new THREE.CylinderGeometry(0.033, 0.035, 0.018, 14);
  const stem = new THREE.Mesh(stemGeo, materials.joint);
  stem.position.set(side * 0.002, -0.038, 0);
  stem.castShadow = true;
  upperArmConnector.add(stem);

  // Lower flange gasket defining the clean separation line above the white bicep armor
  const flangeGeo = new THREE.TorusGeometry(0.036, 0.0024, 5, 14);
  const flange = new THREE.Mesh(flangeGeo, materials.joint);
  flange.rotation.x = Math.PI / 2;
  flange.position.set(side * 0.002, -0.044, 0);
  flange.castShadow = true;
  upperArmConnector.add(flange);

  return {
    group: shoulderGroup,
    jointGroup,
    armorGroup,
    shoulderArmor,
    rotationalCore,
    outerRing,
    innerRing,
    innerStructure,
    upperArmConnector,
    accentRing,
    torsoMountPlate,
    ledMeshes,
    // Backwards compatibility aliases
    rotatingHub: rotationalCore,
    ballJoint: coreHousing,
    pauldronCowl: shoulderArmor,
    socketApertureRim: outerRing,
  };
}
