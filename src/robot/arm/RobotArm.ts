import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { createShoulder, ShoulderNodes } from './Shoulder';
import { createUpperArm, UpperArmNodes } from './UpperArm';
import { createElbow, ElbowNodes } from './Elbow';
import { createForearm, ForearmNodes } from './Forearm';
import { createWrist, WristNodes } from './Wrist';
import { createHand, HandNodes } from './Hand';

export interface RobotArmNodes {
  root: THREE.Group;
  shoulder: ShoulderNodes;
  upperArm: UpperArmNodes;
  elbow: ElbowNodes;
  forearm: ForearmNodes;
  wrist: WristNodes;
  hand: HandNodes;
  ledMeshes: THREE.Mesh[];
  side: -1 | 1;
}

/**
 * Assembles the complete hierarchical robot arm.
 *
 * Hierarchy (each → indented is a child of the line above):
 *
 *   ArmRoot
 *    └─ Shoulder.group  (ShoulderRoot)
 *        └─ [shoulder.jointGroup]
 *            └─ shoulder.upperArmConnector  (y offset = -0.026 inside jointGroup)
 *                └─ UpperArm.group           (local offset y = -0.005)
 *                    └─ [UpperArm.group]
 *                        └─ Elbow.group      (local offset y = -0.178)
 *                            └─ elbow.forearmPivot  (rotation.x = elbow bend)
 *                                └─ Forearm.group   (local offset y = 0)
 *                                    └─ [forearm.group]
 *                                        └─ Wrist.group  (local offset y = -0.160)
 *                                            └─ [wrist.group]
 *                                                └─ Hand.group  (local offset y = -0.028)
 *
 * Offset derivation:
 *   Elbow y = -(upperCollar top y + upperArm shell length)
 *           = -(0.034 + 0.152) = -0.186  but we account for collar overlap → -0.178
 *   Wrist y = -(forearm shell length + collar gap)
 *           = -(0.152 + 0.008) = -0.160
 *   Hand  y = -(wrist distal plate y) = -0.028
 */
export function createRobotArm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): RobotArmNodes {
  const armRoot = new THREE.Group();
  armRoot.name = side === -1 ? 'LeftArmRoot' : 'RightArmRoot';

  const ledMeshes: THREE.Mesh[] = [];

  // ── 1. Shoulder ────────────────────────────────────────────────────────────
  const shoulder = createShoulder(side, materials);
  armRoot.add(shoulder.group);
  ledMeshes.push(...shoulder.ledMeshes);

  // ── 2. Upper Arm ───────────────────────────────────────────────────────────
  // Parented to shoulder.upperArmConnector so it follows shoulder rotation.
  const upperArm = createUpperArm(side, materials);
  upperArm.group.position.set(0, -0.005, 0);
  shoulder.upperArmConnector.add(upperArm.group);
  ledMeshes.push(...upperArm.ledMeshes);

  // ── 3. Elbow ───────────────────────────────────────────────────────────────
  // Positioned at the distal end of the upper arm shell.
  // UpperArm shell is 150 mm.  elbowSocketCuff is at y = -0.152 within the group.
  // shoulder.upperArmConnector sits at y = -0.026 inside jointGroup.
  // upperArm.group offset = -0.005.
  // Net drop from upperArm.group origin to elbow centre ≈ 0.178 m.
  const elbow = createElbow(side, materials);
  elbow.group.position.set(0, -0.178, 0);
  upperArm.group.add(elbow.group);
  ledMeshes.push(...elbow.ledMeshes);

  // ── 4. Forearm ─────────────────────────────────────────────────────────────
  // Parented to elbow.forearmPivot — rotates with elbow bend.
  // forearmPivot is at (0,0,0) in elbowRoot, lowerHousing drops to y=-0.026.
  // Forearm proximal collar starts at y=-0.010 in its local group.
  // Offset 0 aligns the proximal collar mouth with elbow lower docking collar.
  const forearm = createForearm(side, materials);
  forearm.group.position.set(0, -0.030, 0);
  elbow.forearmPivot.add(forearm.group);
  ledMeshes.push(...forearm.ledMeshes);

  // ── 5. Wrist ───────────────────────────────────────────────────────────────
  // Forearm shell is 152 mm, wristCuff at y = -0.156 in forearm.group.
  // Position wrist so its swivelCollar (y = -0.005) meets forearm cuff.
  const wrist = createWrist(side, materials);
  wrist.group.position.set(0, -0.160, 0);
  forearm.group.add(wrist.group);
  ledMeshes.push(...wrist.ledMeshes);

  // ── 6. Hand ────────────────────────────────────────────────────────────────
  // Wrist distal plate is at y = -0.026 in wrist.group.
  // Hand carpalCuff sits at y = -0.004 in hand.group.
  const hand = createHand(side, materials);
  hand.group.position.set(0, -0.028, 0);
  wrist.group.add(hand.group);
  ledMeshes.push(...hand.ledMeshes);

  return {
    root: armRoot,
    shoulder,
    upperArm,
    elbow,
    forearm,
    wrist,
    hand,
    ledMeshes,
    side,
  };
}
