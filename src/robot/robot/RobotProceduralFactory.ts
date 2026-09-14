import * as THREE from 'three';
import { ROBOT_ROTATION } from '../config';
import { createRobotMaterials } from '../materials/RobotMaterials';
import { createRobotHead } from '../head/RobotHead';
import { createRobotArm, RobotArmNodes } from '../arm/RobotArm';
import { createChestShoulderMount, ChestShoulderMountNodes } from '../shoulder/ChestShoulderMount';
import { createRobotTorso, RobotTorsoNodes } from '../torso/RobotTorso';
import { createRobotLeg, RobotLegNodes } from '../leg/RobotLeg';

export interface RobotNodes {
  root: THREE.Group;
  torso: THREE.Group;
  torsoNodes?: RobotTorsoNodes;
  chestLogo: THREE.Mesh;
  neck: THREE.Group;
  head: THREE.Group;
  faceVisor: THREE.Mesh;
  eyeTrackingGroup: THREE.Group;
  eyeLeft: THREE.Mesh;
  eyeRight: THREE.Mesh;
  visorLightBar: THREE.Mesh;
  earRingLeft: THREE.Mesh;
  earRingRight: THREE.Mesh;
  leftShoulder: THREE.Group;
  rightShoulder: THREE.Group;
  leftUpperArm: THREE.Group;
  rightUpperArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftHand: THREE.Group;
  rightHand: THREE.Group;
  leftArmNodes?: RobotArmNodes;
  rightArmNodes?: RobotArmNodes;
  leftChestShoulderMount?: ChestShoulderMountNodes;
  rightChestShoulderMount?: ChestShoulderMountNodes;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftFoot: THREE.Group;
  rightFoot: THREE.Group;
  leftLegNodes?: RobotLegNodes;
  rightLegNodes?: RobotLegNodes;
  ledMeshes: THREE.Mesh[];
  materials: {
    armor: THREE.MeshPhysicalMaterial;
    joint: THREE.MeshPhysicalMaterial;
    visor: THREE.MeshPhysicalMaterial;
    eyeGlow: THREE.Material;
    earRingGlow: THREE.Material;
    chestGlow: THREE.Material;
    accentGlow: THREE.Material;
  };
}

/**
 * Creates the high-fidelity procedural 3D Robot model matching the uploaded reference image.
 * Sculpted with accurate anatomical proportions, glossy ceramic armor, dark titanium skeleton,
 * and illuminated neon violet/blue LED systems.
 */
export function createProceduralRobot(): RobotNodes {
  const root = new THREE.Group();
  root.name = 'RobotRoot';

  // Base orientation (3/4 heroic angle per Priority 6)
  root.rotation.y = ROBOT_ROTATION.yaw;
  root.rotation.x = ROBOT_ROTATION.pitch;
  root.rotation.z = ROBOT_ROTATION.roll;

  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================
  // 1. UNIFIED PBR MATERIALS (Part 5, 13, 14, 15)
  // ==========================================
  const materials = createRobotMaterials();

  // ==========================================
  // 2. MODULAR PROCEDURAL ROBOT TORSO
  // (Adhering strictly to Master Torso Specification & Reference Image)
  // ==========================================
  const torsoNodes = createRobotTorso(materials);
  root.add(torsoNodes.group);
  const torso = torsoNodes.group;
  const chestLogo = torsoNodes.chestArmor.logo;
  ledMeshes.push(...torsoNodes.ledMeshes);

  // ==========================================
  // 3. MODULAR PROCEDURAL ROBOT HEAD & TELESCOPING NECK
  // (Precision sculpted per Reference Image, seated firmly in Chest Neck Collar per Section 2 & 9)
  // ==========================================
  const headAssembly = createRobotHead(materials);
  torsoNodes.upperTorsoFrame.group.add(headAssembly.neck);
  headAssembly.neck.position.set(0, 0.128, 0.004);

  const head = headAssembly.head;
  const neck = headAssembly.neck;
  const faceVisor = headAssembly.visorAssembly.visorMesh;
  const eyeTrackingGroup = headAssembly.visorLight.group;
  const visorLightBar = headAssembly.visorLight.ledMesh;
  const earRingLeftMesh = headAssembly.leftSideModule.emissiveRing;
  const earRingRightMesh = headAssembly.rightSideModule.emissiveRing;

  // Reference eye nodes for controller
  const eyeLeft = new THREE.Group() as unknown as THREE.Mesh;
  eyeLeft.name = 'EyeLeft';
  eyeTrackingGroup.add(eyeLeft);
  const eyeRight = new THREE.Group() as unknown as THREE.Mesh;
  eyeRight.name = 'EyeRight';
  eyeTrackingGroup.add(eyeRight);

  // Collect all head LED meshes for pulsing & animation
  ledMeshes.push(...headAssembly.ledMeshes);

  // ==========================================
  // 7. CHEST SHOULDER MOUNT — LATERAL EDGE EXTENSIONS
  // ==========================================
  // Extends the chest's lateral edges outward to form integrated shoulder
  // mounting foundations.
  //
  // This is NOT a separate structure attached to the chest.
  // This is the CHEST ITSELF extending to create shoulder mounts.
  //
  // The extensions:
  // - Follow the chest's existing curvature and design language
  // - Use the chest's white armor material
  // - Create structural transition from chest edge to mounting platform
  // - Provide mounting surface for future shoulder joint
  //
  // Arms are temporarily removed (see RobotArmAssembly_Standalone.ts).

  const leftChestShoulderMount = createChestShoulderMount(-1, materials);
  leftChestShoulderMount.group.position.set(0, 0, 0);
  torsoNodes.shoulderMountLeft.group.add(leftChestShoulderMount.group);

  const rightChestShoulderMount = createChestShoulderMount(1, materials);
  rightChestShoulderMount.group.position.set(0, 0, 0);
  torsoNodes.shoulderMountRight.group.add(rightChestShoulderMount.group);

  ledMeshes.push(...leftChestShoulderMount.ledMeshes, ...rightChestShoulderMount.ledMeshes);

  // Placeholder groups for arms (maintain interface compatibility)
  const leftShoulder = new THREE.Group();
  leftShoulder.name = 'LeftShoulderPlaceholder';
  const rightShoulder = new THREE.Group();
  rightShoulder.name = 'RightShoulderPlaceholder';
  const leftUpperArm = new THREE.Group();
  leftUpperArm.name = 'LeftUpperArmPlaceholder';
  const rightUpperArm = new THREE.Group();
  rightUpperArm.name = 'RightUpperArmPlaceholder';
  const leftForearm = new THREE.Group();
  leftForearm.name = 'LeftForearmPlaceholder';
  const rightForearm = new THREE.Group();
  rightForearm.name = 'RightForearmPlaceholder';
  const leftHand = new THREE.Group();
  leftHand.name = 'LeftHandPlaceholder';
  const rightHand = new THREE.Group();
  rightHand.name = 'RightHandPlaceholder';

  // Arm nodes undefined (arms removed, chest edge extensions in place)
  const leftArmNodes = undefined;
  const rightArmNodes = undefined;

  // ==========================================
  // 8. MODULAR ARTICULATED ROBOT LEGS & FEET
  // (Mounted directly into Waist Hip Pivots)
  // ==========================================
  const leftLeg = createRobotLeg(-1, materials);
  leftLeg.root.position.set(0, 0, 0);
  torsoNodes.waist.leftHipPivot.add(leftLeg.root);

  const rightLeg = createRobotLeg(1, materials);
  rightLeg.root.position.set(0, 0, 0);
  torsoNodes.waist.rightHipPivot.add(rightLeg.root);

  ledMeshes.push(...leftLeg.ledMeshes, ...rightLeg.ledMeshes);

  const leftFoot = leftLeg.foot.group;
  const rightFoot = rightLeg.foot.group;

  return {
    root,
    torso,
    torsoNodes,
    chestLogo,
    neck,
    head,
    faceVisor,
    eyeTrackingGroup,
    eyeLeft,
    eyeRight,
    visorLightBar,
    earRingLeft: earRingLeftMesh,
    earRingRight: earRingRightMesh,
    leftShoulder,
    rightShoulder,
    leftUpperArm,
    rightUpperArm,
    leftForearm,
    rightForearm,
    leftHand,
    rightHand,
    leftArmNodes,
    rightArmNodes,
    leftChestShoulderMount,
    rightChestShoulderMount,
    leftLeg: leftLeg.root,
    rightLeg: rightLeg.root,
    leftFoot,
    rightFoot,
    leftLegNodes: leftLeg,
    rightLegNodes: rightLeg,
    ledMeshes,
    materials: {
      armor: materials.armor,
      joint: materials.joint,
      visor: materials.visor,
      eyeGlow: materials.purpleEmissive,
      earRingGlow: materials.purpleEmissive,
      chestGlow: materials.purpleEmissive,
      accentGlow: materials.purpleEmissive,
    },
  };
}
