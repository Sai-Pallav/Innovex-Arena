import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { mergeGroupMeshesByMaterial } from '../utils/geometryMerger';

export interface NeckNodes {
  group: THREE.Group;
  cervicalPivot: THREE.Group;
  baseCollar: THREE.Mesh;
  rings: THREE.Mesh[];
  centralShaft: THREE.Mesh;
  cervicalConnector: THREE.Mesh;
  ledMeshes?: THREE.Mesh[];
}

/**
 * Precision Robotic Cervical Mechanism matching Reference Blueprint (Image 2):
 * - Segmented horizontal cervical vertebrae plates (4 tiers) with disciplined ~36-38mm radius
 *   eliminating hollow mid-neck voids and preventing awkward conical flares.
 * - Glowing purple horizontal seams (emissive LED rings) between every plate tier.
 * - Dual gleaming mirror-chrome anterior hydraulic actuators anchored to a horizontal
 *   stabilizer crossbar across the suprasternal collar notch.
 * - Lateral and posterior stabilizing hydraulic struts providing 360° muscular mechanical depth.
 * - Inverted spherical cup support bracing the skull base on the cervical pivot.
 */
export function createRobotNeck(materials: RobotMaterialPalette): NeckNodes {
  const group = new THREE.Group();
  group.name = 'Neck';

  const ledMeshes: THREE.Mesh[] = [];
  const neckJointGroup = new THREE.Group();
  const neckMetallicGroup = new THREE.Group();

  // 1. Lower Neck Base Collar & Bearing Pedestal
  // Compact pedestal seated cleanly inside the chest collar socket cavity
  const baseCollarGeo = new THREE.CylinderGeometry(0.042, 0.044, 0.014, 36);
  const baseCollar = new THREE.Mesh(baseCollarGeo, materials.joint);
  baseCollar.name = 'NeckBaseCollar';
  baseCollar.position.set(0, 0.007, 0);
  baseCollar.castShadow = true;
  baseCollar.receiveShadow = true;
  neckJointGroup.add(baseCollar);

  const baseRimGeo = new THREE.TorusGeometry(0.043, 0.0016, 8, 36);
  const baseRim = new THREE.Mesh(baseRimGeo, materials.joint);
  baseRim.rotation.x = Math.PI / 2;
  baseRim.position.set(0, 0.014, 0);
  neckJointGroup.add(baseRim);

  // 2. Central Structural Cervical Core Column
  const shaftGeo = new THREE.CylinderGeometry(0.033, 0.035, 0.076, 32);
  const centralShaft = new THREE.Mesh(shaftGeo, materials.joint);
  centralShaft.name = 'NeckCentralShaft';
  centralShaft.position.set(0, 0.044, 0);
  centralShaft.castShadow = true;
  neckJointGroup.add(centralShaft);

  // 3. Segmented Horizontal Cervical Vertebrae Plates (Matching Reference Image 2)
  // 4 distinct horizontal tiers with disciplined radii, beveled rims, and glowing purple seams
  const rings: THREE.Mesh[] = [];
  const plateSpecs = [
    { name: 'NeckPlateTier1', radius: 0.0385, height: 0.012, y: 0.012 },
    { name: 'NeckPlateTier2', radius: 0.0370, height: 0.013, y: 0.029 },
    { name: 'NeckPlateTier3', radius: 0.0360, height: 0.013, y: 0.047 },
    { name: 'NeckPlateTier4', radius: 0.0360, height: 0.013, y: 0.064 },
  ];

  for (let i = 0; i < plateSpecs.length; i++) {
    const spec = plateSpecs[i];

    // Main horizontal plate cylinder
    const plateGeo = new THREE.CylinderGeometry(spec.radius * 0.98, spec.radius, spec.height, 36);
    const plateMesh = new THREE.Mesh(plateGeo, materials.joint);
    plateMesh.name = spec.name;
    plateMesh.position.set(0, spec.y, 0);
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    neckJointGroup.add(plateMesh);
    rings.push(plateMesh);

    // Beveled highlight rim around the upper lip of each plate
    const rimGeo = new THREE.TorusGeometry(spec.radius, 0.0016, 8, 36);
    const rimMesh = new THREE.Mesh(rimGeo, materials.joint);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(0, spec.y + spec.height * 0.44, 0);
    neckJointGroup.add(rimMesh);

    // Glowing Purple Emissive Seam between plates (per Reference Image 2)
    if (i < plateSpecs.length - 1) {
      const seamY = (spec.y + spec.height * 0.5 + plateSpecs[i + 1].y - plateSpecs[i + 1].height * 0.5) * 0.5;
      const seamRadius = (spec.radius + plateSpecs[i + 1].radius) * 0.5;
      
      const seamGeo = new THREE.TorusGeometry(seamRadius + 0.0004, 0.0012, 8, 36);
      const seamMesh = new THREE.Mesh(seamGeo, materials.purpleEmissive);
      seamMesh.name = `NeckPlateSeam0${i + 1}`;
      seamMesh.rotation.x = Math.PI / 2;
      seamMesh.position.set(0, seamY, 0);
      group.add(seamMesh);
      ledMeshes.push(seamMesh);
    }
  }

  // 4. Horizontal Stabilizer Crossbar across Suprasternal Collar Notch (Image 2)
  const crossbarZ = 0.026;
  const crossbarY = 0.012;
  const crossbarGeo = new THREE.CylinderGeometry(0.0034, 0.0034, 0.054, 16);
  const crossbar = new THREE.Mesh(crossbarGeo, materials.joint);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, crossbarY, crossbarZ);
  crossbar.castShadow = true;
  neckJointGroup.add(crossbar);

  // Center set-pin dot on crossbar
  const pinGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.004, 12);
  const pinMesh = new THREE.Mesh(pinGeo, materials.metallic);
  pinMesh.rotation.x = Math.PI / 2;
  pinMesh.position.set(0, crossbarY, crossbarZ + 0.0025);
  neckMetallicGroup.add(pinMesh);

  // Knuckle mount bearings on crossbar
  for (const side of [-1, 1]) {
    const knuckleGeo = new THREE.SphereGeometry(0.0050, 14, 10);
    const knuckle = new THREE.Mesh(knuckleGeo, materials.metallic);
    knuckle.position.set(side * 0.025, crossbarY, crossbarZ);
    neckMetallicGroup.add(knuckle);
  }

  // 5. Reference-Accurate Hydraulic Actuator Array
  // Dual anterior chrome struts flanking the central plates (Image 2) + lateral/posterior struts
  const actuatorSpecs = [
    // Dual anterior pair (flanking central cervical plates per Reference Image 2)
    { x: -0.025, z: 0.026, tiltZ: 0.05, tiltX: 0.04, isFront: true, name: 'AntLeft' },
    { x: 0.025, z: 0.026, tiltZ: -0.05, tiltX: 0.04, isFront: true, name: 'AntRight' },
    // Mid-lateral pair (providing profile muscular depth)
    { x: -0.038, z: -0.004, tiltZ: 0.10, tiltX: -0.01, isFront: false, name: 'MidLeft' },
    { x: 0.038, z: -0.004, tiltZ: -0.10, tiltX: -0.01, isFront: false, name: 'MidRight' },
    // Posterior-lateral pair
    { x: -0.026, z: -0.026, tiltZ: 0.04, tiltX: -0.06, isFront: false, name: 'PostLeft' },
    { x: 0.026, z: -0.026, tiltZ: -0.04, tiltX: -0.06, isFront: false, name: 'PostRight' },
  ];

  for (const act of actuatorSpecs) {
    // Lower Clevis / Base Mount
    const clevisGeo = new THREE.BoxGeometry(0.007, 0.008, 0.008);
    const clevis = new THREE.Mesh(clevisGeo, materials.joint);
    clevis.position.set(act.x, 0.012, act.z);
    clevis.rotation.z = act.tiltZ;
    clevis.rotation.x = act.tiltX;
    neckJointGroup.add(clevis);

    // Polished Metallic Hydraulic Cylinder Barrel (Mirror Chrome)
    const barrelGeo = new THREE.CylinderGeometry(0.0058, 0.0064, 0.030, 16);
    const barrel = new THREE.Mesh(barrelGeo, materials.metallic);
    barrel.position.set(act.x * 0.98, 0.029, act.z * 0.98);
    barrel.rotation.z = act.tiltZ;
    barrel.rotation.x = act.tiltX;
    barrel.castShadow = true;
    neckMetallicGroup.add(barrel);

    // Anodized Violet Sensor Accent Ring on Cylinder Barrel
    const sensorRingGeo = new THREE.TorusGeometry(0.0068, 0.0009, 8, 16);
    const sensorRing = new THREE.Mesh(sensorRingGeo, materials.purpleEmissive);
    sensorRing.rotation.x = Math.PI / 2;
    sensorRing.position.set(act.x * 0.98, 0.036, act.z * 0.98);
    sensorRing.rotation.z = act.tiltZ;
    group.add(sensorRing);
    ledMeshes.push(sensorRing);

    // Solid Mirror-Chrome Telescopic Pushrod Shaft
    const rodGeo = new THREE.CylinderGeometry(0.0034, 0.0034, 0.032, 14);
    const rod = new THREE.Mesh(rodGeo, materials.metallic);
    rod.position.set(act.x * 0.94, 0.052, act.z * 0.94);
    rod.rotation.z = act.tiltZ;
    rod.rotation.x = act.tiltX;
    rod.castShadow = true;
    neckMetallicGroup.add(rod);

    // Upper Swivel Ball Mount (Anchoring into Skull Cervical Socket)
    const upperMountGeo = new THREE.SphereGeometry(0.0045, 12, 8);
    const upperMount = new THREE.Mesh(upperMountGeo, materials.joint);
    upperMount.position.set(act.x * 0.92, 0.068, act.z * 0.92);
    neckJointGroup.add(upperMount);
  }

  // 6. Upper Rotating Cervical Turntable Connector (Skull Trunnion Hub)
  const cervicalGeo = new THREE.CylinderGeometry(0.038, 0.036, 0.016, 32);
  const cervicalConnector = new THREE.Mesh(cervicalGeo, materials.joint);
  cervicalConnector.name = 'NeckCervicalConnector';
  cervicalConnector.position.set(0, 0.076, 0.000);
  cervicalConnector.castShadow = true;
  neckJointGroup.add(cervicalConnector);

  const rotRaceGeo = new THREE.TorusGeometry(0.038, 0.0016, 8, 32);
  const rotRace = new THREE.Mesh(rotRaceGeo, materials.joint);
  rotRace.rotation.x = Math.PI / 2;
  rotRace.position.set(0, 0.082, 0.000);
  neckJointGroup.add(rotRace);

  // Inverted spherical cup support bracing the inner skull core
  const cupGeo = new THREE.SphereGeometry(0.036, 20, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
  const cupMesh = new THREE.Mesh(cupGeo, materials.joint);
  cupMesh.position.set(0, 0.084, 0.000);
  neckJointGroup.add(cupMesh);

  // Cervical articulation pivot where head mounts
  const cervicalPivot = new THREE.Group();
  cervicalPivot.name = 'CervicalPivot';
  cervicalPivot.position.set(0, 0.084, 0.000);
  group.add(cervicalPivot);

  // Merge static neck structures (dark titanium)
  const mergedNeckJoint = mergeGroupMeshesByMaterial(neckJointGroup, materials.joint, 'NeckStructure_Merged', false);
  if (mergedNeckJoint) {
    mergedNeckJoint.castShadow = true;
    mergedNeckJoint.receiveShadow = true;
    group.add(mergedNeckJoint);
  }

  // Merge chrome hydraulic actuators and metal fittings (materials.metallic)
  const mergedMetallic = mergeGroupMeshesByMaterial(neckMetallicGroup, materials.metallic, 'NeckActuatorsMetallic_Merged', false);
  if (mergedMetallic) {
    mergedMetallic.castShadow = true;
    mergedMetallic.receiveShadow = true;
    group.add(mergedMetallic);
  }

  return {
    group,
    cervicalPivot,
    baseCollar,
    rings,
    centralShaft,
    cervicalConnector,
    ledMeshes,
  };
}
