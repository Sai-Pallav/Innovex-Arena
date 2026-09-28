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
  // Posture: Shoulders to elbow OUTWARD (~10.6° = 0.185 rad outward roll)
  // Subtle internal yaw (side * 0.075 rad) aligns elbow flexion forward & inward
  // ==========================================================================
  const upperArm = createUpperArm(side, materials);
  upperArm.group.rotation.set(-0.14, -side * 0.14, side * 0.185);
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
  // Posture: Elbow to hands INWARD (-side * 0.095 rad = ~5.4° inward return)
  // Creates authentic athletic chevron posture with elbows as outermost lateral point.
  // ==========================================================================
  const forearm = createForearm(side, materials);
  forearm.group.position.set(0, -0.014, 0);
  forearm.group.rotation.set(0, 0, -side * 0.095);
  elbow.forearmPivot.add(forearm.group);
  ledMeshes.push(...forearm.ledMeshes);

  // ==========================================================================
  // 4. PRECISION WRIST MECHANICAL INTERFACE
  // Attached to forearm distal wrist mount.
  // Wrist collar sits flush against forearm transition collar (0 air gap)
  // and remains strictly coaxial with forearm cylinder (rotation.x = 0, rotation.z = 0).
  // Flexion/pitch and yaw pivot on the internal transverse axle pin via trunnionPivot.
  // ==========================================================================
  const wrist = createWrist(side, materials);
  wrist.group.position.set(0, 0.0010, 0);
  // Natural relaxed wrist resting posture (matching reference 3D humanoid stance in Reference Images 1 & 2):
  // Clean three-quarters anatomical hang with natural forearm pronation (dorsal LED visible)
  const wristRoll = side === -1 ? -0.48 : 0.48;
  wrist.group.rotation.set(0, wristRoll, 0);

  const wristPitch = 0.08;
  const wristYaw = side === -1 ? 0.02 : -0.02;
  wrist.trunnionPivot.rotation.set(wristPitch, 0, wristYaw);

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
  // Elbow as true directional turning point, natural relaxed flexion (~36.7° = -0.64 rad)
  // Strict 1-DOF orthogonal transverse hinge — zero internal knuckle shearing
  elbow.setAngle(-0.64);

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
