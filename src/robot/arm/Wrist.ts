import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

export interface WristNodes {
  group: THREE.Group;
  swivelCollar: THREE.Mesh;
  accentRing: THREE.Mesh;
  pivotPin: THREE.Mesh;
  distalClevis: THREE.Mesh;
  ribbedRings: THREE.Mesh[];
  styloidCaps: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];
}

/**
 * PRIORITY 6: REBUILT WRIST JOINT & PALM CONNECTION
 * Creates an engineered multi-axis robotic wrist that physically bridges the forearm to the hand:
 * - Rotational swivel collar sleeve receiving forearm gauntlet
 * - Concentric purple emissive accent ring
 * - Flexion/extension cross-axis pivot barrel with beveled end caps
 * - Distal mechanical clevis yoke mechanically locking down into the hand's carpal mount
 * - Lateral styloid armor guards eliminating visual detachment
 */
export function createWrist(
  side: -1 | 1,
  materials: RobotMaterialPalette
): WristNodes {
  const wristGroup = new THREE.Group();
  wristGroup.name = side === -1 ? 'LeftWristPivot' : 'RightWristPivot';

  const ledMeshes: THREE.Mesh[] = [];
  const ribbedRings: THREE.Mesh[] = [];
  const styloidCaps: THREE.Mesh[] = [];

  // 1. Rotary Swivel Collar Sleeve (Dark metal cylinder)
  const swivelGeo = new THREE.CylinderGeometry(0.044, 0.040, 0.022, 32);
  const swivelCollar = new THREE.Mesh(swivelGeo, materials.joint);
  swivelCollar.position.set(0, -0.004, 0);
  swivelCollar.castShadow = true;
  swivelCollar.receiveShadow = true;
  wristGroup.add(swivelCollar);

  // 2. Ribbed Mechanical Rings (Layered dark metal detailing)
  for (const wY of [-0.003, -0.010]) {
    const wRingGeo = new THREE.TorusGeometry(0.0415, 0.0028, 10, 32);
    const wRing = new THREE.Mesh(wRingGeo, materials.joint);
    wRing.rotation.x = Math.PI / 2;
    wRing.position.set(0, wY, 0);
    wRing.castShadow = true;
    wristGroup.add(wRing);
    ribbedRings.push(wRing);
  }

  // 3. Signature Purple Emissive Accent Ring (Subtle glowing band around wrist joint)
  const accentGeo = new THREE.TorusGeometry(0.0425, 0.0018, 10, 36);
  const accentRing = new THREE.Mesh(accentGeo, materials.purpleEmissive);
  accentRing.rotation.x = Math.PI / 2;
  accentRing.position.set(0, -0.0065, 0);
  wristGroup.add(accentRing);
  ledMeshes.push(accentRing);

  // 4. Flexion/Extension Cross-Axis Pivot Pin (Heavy-duty transverse hinge)
  const pinGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.046, 24);
  const pivotPin = new THREE.Mesh(pinGeo, materials.joint);
  pivotPin.rotation.z = Math.PI / 2;
  pivotPin.position.set(0, -0.014, 0);
  pivotPin.castShadow = true;
  pivotPin.receiveShadow = true;
  wristGroup.add(pivotPin);

  // 5. Distal Mechanical Clevis Yoke (Physically clasps the palm carpal stem)
  const clevisShape = new THREE.Shape();
  clevisShape.moveTo(-0.018, 0.012);
  clevisShape.lineTo(0.018, 0.012);
  clevisShape.lineTo(0.014, -0.014);
  clevisShape.lineTo(-0.014, -0.014);
  clevisShape.closePath();

  const clevisGeo = new THREE.ExtrudeGeometry(clevisShape, {
    depth: 0.034,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.0025,
    bevelSegments: 2,
  });
  clevisGeo.center();

  const distalClevis = new THREE.Mesh(clevisGeo, materials.joint);
  distalClevis.name = 'WristDistalClevis';
  distalClevis.position.set(0, -0.018, 0);
  distalClevis.castShadow = true;
  distalClevis.receiveShadow = true;
  wristGroup.add(distalClevis);

  // Distal Carpal Socket Collar (Where the palm connects)
  const socketGeo = new THREE.CylinderGeometry(0.024, 0.026, 0.008, 24);
  const distalSocket = new THREE.Mesh(socketGeo, materials.joint);
  distalSocket.position.set(0, -0.024, 0);
  distalSocket.castShadow = true;
  wristGroup.add(distalSocket);

  // 6. Lateral Styloid Process Caps & Armor Guards
  for (const s of [-1, 1]) {
    const styGeo = new THREE.CylinderGeometry(0.0085, 0.0085, 0.006, 20);
    const styMesh = new THREE.Mesh(styGeo, materials.armor);
    styMesh.rotation.z = Math.PI / 2;
    styMesh.position.set(s * 0.026, -0.014, 0);
    styMesh.castShadow = true;
    wristGroup.add(styMesh);
    styloidCaps.push(styMesh);
  }

  return {
    group: wristGroup,
    swivelCollar,
    accentRing,
    pivotPin,
    distalClevis,
    ribbedRings,
    styloidCaps,
    ledMeshes,
  };
}
