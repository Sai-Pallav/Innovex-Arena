/**
 * ============================================================================
 * ROBOT ARM ASSEMBLY - STANDALONE BACKUP
 * ============================================================================
 * 
 * This file contains the complete shoulder-to-hand assembly code that was
 * temporarily removed from RobotProceduralFactory.ts.
 * 
 * To restore arms to the robot:
 * 1. Uncomment the arm assembly code in RobotProceduralFactory.ts
 * 2. Remove the placeholder groups
 * 3. Restore leftArmNodes and rightArmNodes assignments
 * 
 * Last modified: 2026-09-14
 * Reason: User requested removal of shoulder-to-hands for further use
 * ============================================================================
 */

import * as THREE from 'three';
import { createRobotMaterials } from '../materials/RobotMaterials';
import { createRobotArm, RobotArmNodes } from './RobotArm';

/**
 * Creates both left and right arm assemblies with default posing.
 * Returns everything needed to attach arms to a robot torso.
 * 
 * @param shoulderMountLeft - The left shoulder mount group from torso
 * @param shoulderMountRight - The right shoulder mount group from torso
 * @param ledMeshes - Array to push LED meshes into for animation
 * @returns Object containing both arm assemblies and their component groups
 */
export function createArmAssembly(
  shoulderMountLeft: THREE.Group,
  shoulderMountRight: THREE.Group,
  ledMeshes: THREE.Mesh[]
): {
  leftArm: RobotArmNodes;
  rightArm: RobotArmNodes;
  leftShoulder: THREE.Group;
  rightShoulder: THREE.Group;
  leftUpperArm: THREE.Group;
  rightUpperArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftHand: THREE.Group;
  rightHand: THREE.Group;
} {
  const materials = createRobotMaterials();

  // ── LEFT ARM ──────────────────────────────────────────────────────────────
  const leftArm = createRobotArm(-1, materials);
  leftArm.root.position.set(0, 0, 0);
  shoulderMountLeft.add(leftArm.root);

  // ── RIGHT ARM ─────────────────────────────────────────────────────────────
  const rightArm = createRobotArm(1, materials);
  rightArm.root.position.set(0, 0, 0);
  shoulderMountRight.add(rightArm.root);

  // Collect LED meshes
  ledMeshes.push(...leftArm.ledMeshes, ...rightArm.ledMeshes);

  // ── POSED ATHLETIC HUMANOID ARM POSTURE ───────────────────────────────────
  // Natural rest pose configuration
  leftArm.shoulder.group.rotation.set(0, 0, 0);
  rightArm.shoulder.group.rotation.set(0, 0, 0);
  
  leftArm.shoulder.jointGroup.rotation.set(-0.04, 0.02, -0.03);
  rightArm.shoulder.jointGroup.rotation.set(-0.04, -0.02, 0.03);
  
  leftArm.upperArm.group.rotation.set(0, 0, 0);
  rightArm.upperArm.group.rotation.set(0, 0, 0);
  
  leftArm.elbow.group.rotation.set(0, 0, 0);
  rightArm.elbow.group.rotation.set(0, 0, 0);
  
  leftArm.elbow.forearmPivot.rotation.set(-0.44, 0.06, 0.02);
  rightArm.elbow.forearmPivot.rotation.set(-0.44, -0.06, -0.02);
  
  leftArm.wrist.group.rotation.set(0.04, -0.42, 0.02);
  rightArm.wrist.group.rotation.set(0.04, 0.42, -0.02);

  return {
    leftArm,
    rightArm,
    leftShoulder: leftArm.shoulder.group,
    rightShoulder: rightArm.shoulder.group,
    leftUpperArm: leftArm.upperArm.group,
    rightUpperArm: rightArm.upperArm.group,
    leftForearm: leftArm.elbow.forearmPivot,
    rightForearm: rightArm.elbow.forearmPivot,
    leftHand: leftArm.hand.group,
    rightHand: rightArm.hand.group,
  };
}

/**
 * ORIGINAL CODE FROM RobotProceduralFactory.ts
 * =============================================
 * This is the exact code that was removed. Paste this back into
 * RobotProceduralFactory.ts to restore arm functionality:
 * 
  // ==========================================
  // 7. MODULAR SHOULDERS, ARMS & COMPLETE ARTICULATED HANDS
  // (Mounted directly into Chest Shoulder Mounts per Section 2, 8, 9)
  // ==========================================
  const leftArm = createRobotArm(-1, materials);
  leftArm.root.position.set(0, 0, 0);
  torsoNodes.shoulderMountLeft.group.add(leftArm.root);

  const rightArm = createRobotArm(1, materials);
  rightArm.root.position.set(0, 0, 0);
  torsoNodes.shoulderMountRight.group.add(rightArm.root);

  ledMeshes.push(...leftArm.ledMeshes, ...rightArm.ledMeshes);

  // Poised athletic humanoid arm posture matching natural rest pose
  leftArm.shoulder.group.rotation.set(0, 0, 0);
  rightArm.shoulder.group.rotation.set(0, 0, 0);
  leftArm.shoulder.jointGroup.rotation.set(-0.04, 0.02, -0.03);
  rightArm.shoulder.jointGroup.rotation.set(-0.04, -0.02, 0.03);
  leftArm.upperArm.group.rotation.set(0, 0, 0);
  rightArm.upperArm.group.rotation.set(0, 0, 0);
  leftArm.elbow.group.rotation.set(0, 0, 0);
  rightArm.elbow.group.rotation.set(0, 0, 0);
  leftArm.elbow.forearmPivot.rotation.set(-0.44, 0.06, 0.02);
  rightArm.elbow.forearmPivot.rotation.set(-0.44, -0.06, -0.02);
  leftArm.wrist.group.rotation.set(0.04, -0.42, 0.02);
  rightArm.wrist.group.rotation.set(0.04, 0.42, -0.02);

  const leftShoulder = leftArm.shoulder.group;
  const rightShoulder = rightArm.shoulder.group;
  const leftUpperArm = leftArm.upperArm.group;
  const rightUpperArm = rightArm.upperArm.group;
  const leftForearm = leftArm.elbow.forearmPivot;
  const rightForearm = rightArm.elbow.forearmPivot;
  const leftHand = leftArm.hand.group;
  const rightHand = rightArm.hand.group;

  // And in the return statement:
  leftArmNodes: leftArm,
  rightArmNodes: rightArm,
 */

/**
 * ARM COMPONENT FILES REFERENCE
 * ==============================
 * These files remain unchanged and can be used when restoring arms:
 * 
 * - Shoulder.ts      → createShoulder()
 * - UpperArm.ts      → createUpperArm()
 * - Elbow.ts         → createElbow()
 * - Forearm.ts       → createForearm()
 * - Wrist.ts         → createWrist()
 * - Hand.ts          → createHand()
 * - Finger.ts        → createFinger()
 * - RobotArm.ts      → createRobotArm() (assembles all above)
 * 
 * ANIMATION CONTROLLERS:
 * - ArmAnimationController.ts
 * - ArmMechanicalFactory.ts
 * - DebugManager.ts
 */
