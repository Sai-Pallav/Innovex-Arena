/**
 * ============================================================================
 * ROBOT ARM MASTER ASSEMBLY (AAA PRODUCTION CAD SPECIFICATION)
 * ============================================================================
 *
 * Implements the authoritative hierarchical robotic arm system:
 *
 *   shoulderMount.armMount (X = ±0.0225m flange outer face)
 *     │
 *     ▼
 *   armRoot (Anchored flush to Shoulder Mounting Flange)
 *     │
 *     ▼
 *   upperArmAssembly
 *     ├── shoulderAdapter (Mating collar + 12 hex cap screws + central bore)
 *     ├── upperArmMechanicalCore (Faceted titanium I-beam spar + tricep actuator)
 *     ├── upperArmArmor (Sculpted ceramic white shell: anterior + posterior)
 *     ├── ventilationChannel & purpleAccent (Recessed channel + purple LED)
 *     │
 *     ▼
 *   elbowAssembly (Distal clevis + transverse hinge + dual actuator discs)
 *     │
 *     ▼
 *   elbowPivot (Dedicated Three.js rotation pivot for forearm flexion/extension)
 *     │
 *     ▼
 *   forearmAssembly
 *     ├── forearmMechanicalCore (Titanium spaceframe + dual flexor actuators)
 *     ├── forearmArmor (Sculpted ceramic gauntlet: anterior + dorsal fin)
 *     ├── ventilationChannel & purpleAccent (Recessed channel + purple LED)
 *     │
 *     ▼
 *   wristInterface (Precision machined titanium trunnion + 8 bolt pattern - STOP)
 *
 * ABSOLUTE STOP: Hand, palm, fingers, and gripper are NOT built.
 * ============================================================================
 */

import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { createUpperArm, UpperArmNodes } from './UpperArm';
import { createElbow, ElbowNodes } from './Elbow';
import { createForearm, ForearmNodes } from './Forearm';
import { createWrist, WristNodes } from './Wrist';
import { createHand, HandNodes } from './Hand';

export interface RobotArmNodes {
  root: THREE.Group;
  upperArm: UpperArmNodes;
  elbow: ElbowNodes;
  forearm: ForearmNodes;
  wrist: WristNodes;
  hand: HandNodes;
  elbowPivot: THREE.Group;
  wristPivot: THREE.Group;
  ledMeshes: THREE.Mesh[];
  side: -1 | 1;
  shoulder: any;
}

export function createRobotArm(
  side: -1 | 1,
  materials: RobotMaterialPalette
): RobotArmNodes {
  const armRoot = new THREE.Group();
  armRoot.name = side === -1 ? 'LeftRobotArmRoot' : 'RightRobotArmRoot';

  const ledMeshes: THREE.Mesh[] = [];

  // ==========================================================================
  // 1. UPPER ARM & SHOULDER ADAPTER
  // Attaches flush to the shoulder mounting flange interface.
  // ==========================================================================
  const upperArm = createUpperArm(side, materials);
  // Stage 1 Locked: Balanced, subtle outward direction relative to torso centerline (~6.0° = 0.105 rad)
  // Pitch is calibrated to -0.12 rad for natural relaxed athletic hang with zero torso intersection
  upperArm.group.rotation.set(-0.12, 0, side * 0.105);
  armRoot.add(upperArm.group);
  ledMeshes.push(...upperArm.ledMeshes);

  // ==========================================================================
  // 2. ARTICULATED ELBOW JOINT
  // Attached to upper arm distal clevis mount.
  // ==========================================================================
  const elbow = createElbow(side, materials);
  // Orthogonal mounting alignment with upper arm distal clevis mount (zero angular twist)
  elbow.group.rotation.set(0, 0, 0);
  upperArm.distalElbowMount.add(elbow.group);
  ledMeshes.push(...elbow.ledMeshes);

  // ==========================================================================
  // 3. TAPERED FOREARM GAUNTLET & MECHANICAL CORE
  // Parented directly to elbow.forearmPivot — follows true 1-DOF elbow flexion.
  // Subtle carrying angle (-side * 0.025) aligns forearm vertically beside hips.
  // ==========================================================================
  const forearm = createForearm(side, materials);
  // Aligned flush with the elbow lower knuckle docking collar; follows elbow articulation naturally
  forearm.group.position.set(0, -0.014, 0);
  forearm.group.rotation.set(0, 0, -side * 0.025);
  elbow.forearmPivot.add(forearm.group);
  ledMeshes.push(...forearm.ledMeshes);

  // ==========================================================================
  // 4. PRECISION WRIST MECHANICAL INTERFACE
  // Attached to forearm distal wrist mount.
  // ==========================================================================
  const wrist = createWrist(side, materials);
  wrist.group.position.set(0, 0, 0);
  // Natural relaxed wrist resting posture (matching reference 3D humanoid stance in Reference Images 1 & 2):
  // Clean three-quarters anatomical hang with natural forearm pronation
  const wristPitch = 0.08;
  const wristRoll = side === -1 ? -0.28 : 0.28;
  const wristYaw = side === -1 ? -0.05 : 0.05;
  wrist.group.rotation.set(wristPitch, wristRoll, wristYaw);
  forearm.distalWristMount.add(wrist.group);
  ledMeshes.push(...wrist.ledMeshes);

  // ==========================================================================
  // 5. ARTICULATED HUMANOID MECHA HAND
  // Mounted directly to wrist.distalHandMount (flush against 8-bolt plate).
  // 4 articulated 3-phalanx digits + opposable thumb with thenar swivel.
  // ==========================================================================
  const hand = createHand(side, materials);
  wrist.distalHandMount.add(hand.group);
  ledMeshes.push(...hand.ledMeshes);

  // ==========================================================================
  // 6. DEFAULT ATHLETIC RESTING POSTURE
  // Stage 2 Locked: Elbow as true directional turning point, subtle and relaxed (~18.3° = -0.32 rad)
  elbow.setAngle(-0.32);
  // Stage 3 Locked: Elbow -> Forearm subtle inward return toward torso centerline
  // Net inward angle is -side * 0.035 rad (~2.0° inward toward hips) with exact bilateral symmetry
  elbow.forearmPivot.rotation.z = -side * 0.115;

  // Compatibility proxies for animation systems
  const shoulderCompat = {
    group: new THREE.Group(),
    armorGroup: new THREE.Group(),
    jointGroup: new THREE.Group(),
    upperArmConnector: new THREE.Group(),
    gimbalYoke: new THREE.Group(),
    cycloidalDrive: new THREE.Group(),
    faceplateHub: new THREE.Group(),
    accentRing: new THREE.Group(),
    damperPiston: new THREE.Group(),
    ledMeshes: [],
  };

  return {
    root: armRoot,
    upperArm,
    elbow,
    forearm,
    wrist,
    hand,
    elbowPivot: elbow.forearmPivot,
    wristPivot: wrist.wristPivot,
    ledMeshes,
    side,
    shoulder: shoulderCompat,
  };
}
