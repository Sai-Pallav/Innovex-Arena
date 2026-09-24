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
  // Natural relaxed resting posture:
  // Upper arm rotates forward ~3.7° (-0.065 rad) relative to torso (subtle humanoid forward bias)
  // Y-axis rotation: side * 0.010 rad (minimal twist, arms close to body)
  // Lateral Z-axis: 0 rad (zero lateral splay, hanging naturally beside torso)
  upperArm.group.rotation.set(-0.065, side * 0.010, 0);
  armRoot.add(upperArm.group);
  ledMeshes.push(...upperArm.ledMeshes);

  // ==========================================================================
  // 2. ARTICULATED ELBOW JOINT
  // Attached to upper arm distal clevis mount.
  // ==========================================================================
  const elbow = createElbow(side, materials);
  upperArm.distalElbowMount.add(elbow.group);
  ledMeshes.push(...elbow.ledMeshes);

  // ==========================================================================
  // 3. TAPERED FOREARM GAUNTLET & MECHANICAL CORE
  // Parented directly to elbow.forearmPivot — follows true 1-DOF elbow flexion.
  // Subtle carrying angle (-side * 0.025) aligns forearm vertically beside hips.
  // ==========================================================================
  const forearm = createForearm(side, materials);
  // Aligned flush with the elbow lower knuckle docking collar
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
  // Natural relaxed wrist pronation: palms face inward/backward (not forward)
  // Y-axis rotation (roll): side * 0.52 rad (~30°) pronates palm inward
  // This matches the reference image showing relaxed humanoid robot hand orientation
  wrist.group.rotation.set(0, side * 0.52, 0);
  forearm.distalWristMount.add(wrist.group);
  ledMeshes.push(...wrist.ledMeshes);

  // ==========================================================================
  // 5. ARTICULATED HUMANOID MECHA HAND
  // Mounted directly to wrist.distalHandMount (flush against 8-bolt plate).
  // 4 articulated 3-phalanx digits + opposable thumb with thenar swivel.
  // ==========================================================================
  const hand = createHand(side, materials);
  hand.group.position.set(0, 0, 0);
  wrist.distalHandMount.add(hand.group);
  ledMeshes.push(...hand.ledMeshes);

  // ==========================================================================
  // 6. DEFAULT ATHLETIC RESTING POSTURE
  // Sets natural relaxed angles for immediate hero rendering
  // ==========================================================================
  elbow.setAngle(-0.297); // ~ -17.0° natural flexion bend creating visible elbow articulation

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
