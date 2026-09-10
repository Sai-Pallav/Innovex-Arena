import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { createRobotArm, RobotArmNodes } from './RobotArm';

export interface RobotUpperBodyNodes {
  group: THREE.Group;
  leftArm: RobotArmNodes;
  rightArm: RobotArmNodes;
  chestPlate: THREE.Mesh;
  backPlate: THREE.Mesh;
  collarRim: THREE.Mesh;
  collarSleeve: THREE.Mesh;
  clavicleStraps: THREE.Mesh[];
  armSockets: THREE.Mesh[];
  ledMeshes: THREE.Mesh[];
}

/**
 * Creates the entire Robotic Upper Body Assembly matching the Reference Image:
 * - Front: Sleek white ceramic cuirass, curved neck cutout, pectoral contouring
 * - Back: Dark metallic trapezoidal spine/back chassis with white shoulder harness straps
 * - Collar: White collar gorget rim & dark inner neck chassis
 * - Arms: Mounts Left and Right articulated arms in the shoulder sockets
 */
export function createRobotUpperBody(
  materials: RobotMaterialPalette
): RobotUpperBodyNodes {
  const upperBody = new THREE.Group();
  upperBody.name = 'RobotUpperBody';

  const ledMeshes: THREE.Mesh[] = [];
  const clavicleStraps: THREE.Mesh[] = [];
  const armSockets: THREE.Mesh[] = [];

  // ==========================================
  // 1. CHEST CUIRASS & BREASTPLATE (Front View in Reference)
  // ==========================================
  const chestPlateShape = new THREE.Shape();
  // Scooped anatomical collar line
  chestPlateShape.moveTo(-0.065, 0.125);
  chestPlateShape.quadraticCurveTo(0, 0.110, 0.065, 0.125);
  // Clavicle shoulder line
  chestPlateShape.lineTo(0.138, 0.115);
  // Upper outer pectoral curve
  chestPlateShape.bezierCurveTo(0.148, 0.06, 0.148, 0.01, 0.144, -0.035);
  // Angled diagonal thoracic seam tapering inward to lower ribcage
  chestPlateShape.lineTo(0.068, -0.165);
  // Lower athletic rounded tongue apex
  chestPlateShape.bezierCurveTo(0.046, -0.215, 0.024, -0.245, 0, -0.245);
  chestPlateShape.bezierCurveTo(-0.024, -0.245, -0.046, -0.215, -0.068, -0.165);
  // Symmetrical return
  chestPlateShape.lineTo(-0.144, -0.035);
  chestPlateShape.bezierCurveTo(-0.148, 0.01, -0.148, 0.06, -0.138, 0.115);
  chestPlateShape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 2,
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.010,
    bevelSegments: 4,
  };

  const chestPlateGeo = new THREE.ExtrudeGeometry(chestPlateShape, extrudeSettings);
  chestPlateGeo.center();
  const chestPlate = new THREE.Mesh(chestPlateGeo, materials.armor);
  chestPlate.position.set(0, -0.010, 0.070);
  chestPlate.rotation.x = -0.06;
  chestPlate.castShadow = true;
  chestPlate.receiveShadow = true;
  chestPlate.name = 'ChestArmorPlate';
  upperBody.add(chestPlate);

  // Pectoral Contours on Breastplate
  for (const side of [-1, 1]) {
    const pecShape = new THREE.Shape();
    pecShape.moveTo(side * 0.03, 0.01);
    pecShape.lineTo(side * 0.15, 0.01);
    pecShape.bezierCurveTo(side * 0.14, -0.06, side * 0.11, -0.10, side * 0.03, -0.11);
    pecShape.closePath();

    const pecGeo = new THREE.ExtrudeGeometry(pecShape, {
      depth: 0.010,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.006,
      bevelSegments: 3,
    });
    const pecMesh = new THREE.Mesh(pecGeo, materials.armor);
    pecMesh.position.set(0, 0.01, 0.082);
    pecMesh.rotation.x = -0.08;
    pecMesh.rotation.y = side * 0.06;
    upperBody.add(pecMesh);
  }

  // ==========================================
  // 2. NECK COLLAR OPENING & GORGET RIM
  // ==========================================
  // White Armor Neck Collar Gorget Rim
  const collarGeo = new THREE.TorusGeometry(0.095, 0.014, 16, 32);
  const collarRim = new THREE.Mesh(collarGeo, materials.armor);
  collarRim.rotation.x = Math.PI / 2 + 0.08;
  collarRim.position.set(0, 0.14, 0.01);
  collarRim.scale.set(1.12, 0.88, 1.0);
  upperBody.add(collarRim);

  // Dark Titanium Inner Neck Collar Sleeve
  const sleeveGeo = new THREE.CylinderGeometry(0.078, 0.084, 0.045, 24);
  const collarSleeve = new THREE.Mesh(sleeveGeo, materials.joint);
  collarSleeve.position.set(0, 0.12, 0.005);
  upperBody.add(collarSleeve);

  // Clavicle Collarbone Armor Trim
  const clavicleGeo = new THREE.TorusGeometry(0.185, 0.018, 16, 32, Math.PI * 0.9);
  const clavicle = new THREE.Mesh(clavicleGeo, materials.armor);
  clavicle.rotation.x = Math.PI / 2 + 0.08;
  clavicle.rotation.z = Math.PI * 0.95;
  clavicle.position.set(0, 0.13, 0.01);
  clavicle.scale.set(1.15, 0.75, 1.0);
  upperBody.add(clavicle);

  // ==========================================
  // 3. SHOULDER HARNESS STRAPS & SOCKET RIMS
  // ==========================================
  for (const side of [-1, 1]) {
    // Arching Clavicle Shoulder Strap
    const archCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side * 0.12, 0.14, 0.05),
      new THREE.Vector3(side * 0.20, 0.13, 0.02),
      new THREE.Vector3(side * 0.255, 0.07, -0.02)
    );
    const archGeo = new THREE.TubeGeometry(archCurve, 16, 0.022, 12, false);
    const arch = new THREE.Mesh(archGeo, materials.armor);
    arch.castShadow = true;
    upperBody.add(arch);
    clavicleStraps.push(arch);

    // Dark Titanium Crescent Arm-Socket Rim
    const socketGeo = new THREE.TorusGeometry(0.082, 0.012, 16, 32, Math.PI * 0.95);
    const socketRim = new THREE.Mesh(socketGeo, materials.joint);
    socketRim.rotation.y = side * (Math.PI / 2);
    socketRim.rotation.x = 0.25;
    socketRim.position.set(side * 0.225, 0.045, 0.01);
    upperBody.add(socketRim);
    armSockets.push(socketRim);
  }

  // ==========================================
  // 4. BACK CHASSIS (Back View in Reference)
  // Dark metallic central trapezoid + white upper back harness
  // ==========================================
  const backShape = new THREE.Shape();
  backShape.moveTo(-0.10, 0.12);
  backShape.lineTo(0.10, 0.12);
  backShape.lineTo(0.075, -0.15);
  backShape.lineTo(-0.075, -0.15);
  backShape.closePath();

  const backGeo = new THREE.ExtrudeGeometry(backShape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 3,
  });
  backGeo.center();
  const backPlate = new THREE.Mesh(backGeo, materials.joint);
  backPlate.position.set(0, -0.015, -0.085);
  backPlate.rotation.x = 0.05;
  backPlate.castShadow = true;
  backPlate.receiveShadow = true;
  upperBody.add(backPlate);

  // White Upper Back Harness Flank Plates (flanking dark center plate)
  for (const side of [-1, 1]) {
    const scapulaShape = new THREE.Shape();
    scapulaShape.moveTo(side * 0.08, 0.11);
    scapulaShape.lineTo(side * 0.21, 0.08);
    scapulaShape.lineTo(side * 0.18, -0.08);
    scapulaShape.lineTo(side * 0.07, -0.06);
    scapulaShape.closePath();

    const scapulaGeo = new THREE.ExtrudeGeometry(scapulaShape, {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.005,
      bevelSegments: 3,
    });
    const scapulaMesh = new THREE.Mesh(scapulaGeo, materials.armor);
    scapulaMesh.position.set(0, 0.01, -0.080);
    scapulaMesh.rotation.y = side * -0.12;
    upperBody.add(scapulaMesh);
  }

  // ==========================================
  // 5. MOUNT ARMS (Left & Right)
  // Attached at left and right shoulder sockets
  // ==========================================
  const leftArm = createRobotArm(-1, materials);
  leftArm.root.position.set(-0.245, 0.045, 0.008);
  upperBody.add(leftArm.root);
  ledMeshes.push(...leftArm.ledMeshes);

  const rightArm = createRobotArm(1, materials);
  rightArm.root.position.set(0.245, 0.045, 0.008);
  upperBody.add(rightArm.root);
  ledMeshes.push(...rightArm.ledMeshes);

  // Set natural resting posture matching Reference Image
  // Shoulders:
  leftArm.shoulder.group.rotation.set(0.01, 0.02, -0.03);
  rightArm.shoulder.group.rotation.set(0.01, -0.02, 0.03);

  // Upper arms: slight outward & forward angle
  leftArm.upperArm.group.rotation.set(-0.10, 0.04, -0.07);
  rightArm.upperArm.group.rotation.set(-0.10, -0.04, 0.07);

  // Elbows: folded forward around dedicated horizontal hinge axis
  leftArm.elbow.group.rotation.set(0, 0, 0);
  rightArm.elbow.group.rotation.set(0, 0, 0);
  leftArm.elbow.forearmPivot.rotation.set(-0.48, 0.08, 0.04);
  rightArm.elbow.forearmPivot.rotation.set(-0.48, -0.08, -0.04);

  // Wrists: natural forward alignment
  leftArm.wrist.group.rotation.set(0.12, 0.05, -0.02);
  rightArm.wrist.group.rotation.set(0.12, -0.05, 0.02);

  return {
    group: upperBody,
    leftArm,
    rightArm,
    chestPlate,
    backPlate,
    collarRim,
    collarSleeve,
    clavicleStraps,
    armSockets,
    ledMeshes,
  };
}
