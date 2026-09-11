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
 * Assembles the complete hierarchical robot arm assembly adhering strictly to Section 4:
 *
 * Robot
 *  └── Torso
 *       └── LeftShoulder (ShoulderPivot)
 *            ├── ShoulderArmor (Outer Shell)
 *            └── ShoulderJoint (Rotary Mechanism)
 *                 ├── OuterRing
 *                 ├── InnerRing
 *                 ├── RotationCore
 *                 └── UpperArmConnector
 *                      └── UpperArm (UpperArmPivot)
 *                           ├── UpperArmArmor & Skeleton
 *                           └── ElbowPivot
 *                                ├── ElbowJoint
 *                                └── ForearmGauntlet
 *                                     └── WristPivot
 *                                          ├── WristJoint
 *                                          └── HandGroup
 */
export function createRobotArm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): RobotArmNodes {
  const armRoot = new THREE.Group();
  armRoot.name = side === -1 ? 'LeftArmRoot' : 'RightArmRoot';

  const ledMeshes: THREE.Mesh[] = [];

  // 1. Shoulder Pivot
  const shoulder = createShoulder(side, materials);
  armRoot.add(shoulder.group);
  ledMeshes.push(...shoulder.ledMeshes);

  // 2. Upper Arm Pivot (attached hierarchically inside UpperArmConnector)
  const upperArm = createUpperArm(side, materials);
  upperArm.group.position.set(side * 0.002, -0.028, 0);
  shoulder.upperArmConnector.add(upperArm.group);
  ledMeshes.push(...upperArm.ledMeshes);

  // 3. Elbow Pivot (attached hierarchically at bottom of upperArm)
  const elbow = createElbow(side, materials);
  elbow.group.position.set(0, -0.185, 0);
  upperArm.group.add(elbow.group);
  ledMeshes.push(...elbow.ledMeshes);

  // 4. Forearm Gauntlet (attached hierarchically to forearmPivot so it rotates with the hinge axis)
  const forearm = createForearm(side, materials);
  forearm.group.position.set(0, 0, 0);
  elbow.forearmPivot.add(forearm.group);
  ledMeshes.push(...forearm.ledMeshes);

  // 5. Wrist Pivot (attached hierarchically at distal end of forearm)
  const wrist = createWrist(side, materials);
  wrist.group.position.set(0, -0.184, 0);
  forearm.group.add(wrist.group);
  ledMeshes.push(...wrist.ledMeshes);

  // 6. Hand Assembly (attached hierarchically to wristPivot)
  const hand = createHand(side, materials);
  hand.group.position.set(0, -0.024, 0);
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
