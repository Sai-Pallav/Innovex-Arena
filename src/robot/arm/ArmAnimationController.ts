import * as THREE from 'three';
import { RobotArmNodes } from './RobotArm';
import { FingerNodes, ThumbNodes } from './Finger';

export interface ArmControlOverrides {
  shoulder?: { x?: number; y?: number; z?: number };
  shoulderJoint?: { x?: number; y?: number; z?: number };
  upperArm?: { x?: number; y?: number; z?: number };
  elbowBend?: number;
  wrist?: { pitch?: number; yaw?: number; roll?: number };
  thumb?: { proxCurl?: number; distCurl?: number; splay?: number };
  fingers?: Array<{ proxCurl?: number; midCurl?: number; distCurl?: number; splay?: number }>;
}

/**
 * Kinematics and animation controller for procedural robot arms and hands.
 * Adheres to Section 5:
 * - Independent control for shoulder, upper arm, elbow, wrist, thumb, and each finger segment.
 * - Hierarchical bending where rotating a joint moves its children naturally.
 * - Organic idle kinematics with breathing coupling and cascading finger waves.
 */
export class ArmAnimationController {
  private leftArm: RobotArmNodes;
  private rightArm: RobotArmNodes;
  private time: number = 0;

  // Base resting rotations
  private baseLeftShoulderRot: THREE.Euler;
  private baseRightShoulderRot: THREE.Euler;
  private baseLeftUpperRot: THREE.Euler;
  private baseRightUpperRot: THREE.Euler;
  private baseLeftElbowRot: THREE.Euler;
  private baseRightElbowRot: THREE.Euler;
  private baseLeftWristRot: THREE.Euler;
  private baseRightWristRot: THREE.Euler;

  // Exploded View State (Technical Reference Exploded Views: Shoulder & Elbow)
  private isExploded: boolean = false;
  private explodedProgress: number = 0;

  private leftBaseShoulderArmorPos: THREE.Vector3;
  private rightBaseShoulderArmorPos: THREE.Vector3;
  private leftBaseShoulderJointPos: THREE.Vector3;
  private rightBaseShoulderJointPos: THREE.Vector3;
  private leftBaseConnectorPos: THREE.Vector3;
  private rightBaseConnectorPos: THREE.Vector3;
  private leftBaseLatDiscPos: THREE.Vector3;
  private rightBaseLatDiscPos: THREE.Vector3;
  private leftBaseMedDiscPos: THREE.Vector3;
  private rightBaseMedDiscPos: THREE.Vector3;
  private leftBasePinPos: THREE.Vector3;
  private rightBasePinPos: THREE.Vector3;
  private leftBaseForearmPivotPos: THREE.Vector3;
  private rightBaseForearmPivotPos: THREE.Vector3;
  private leftBaseDorsalPos: THREE.Vector3;
  private rightBaseDorsalPos: THREE.Vector3;

  // Manual overrides for programmatic posing
  private leftOverrides: ArmControlOverrides = {};
  private rightOverrides: ArmControlOverrides = {};

  constructor(leftArm: RobotArmNodes, rightArm: RobotArmNodes) {
    this.leftArm = leftArm;
    this.rightArm = rightArm;

    this.baseLeftShoulderRot = leftArm.shoulder.group.rotation.clone();
    this.baseRightShoulderRot = rightArm.shoulder.group.rotation.clone();
    this.baseLeftUpperRot = leftArm.upperArm.group.rotation.clone();
    this.baseRightUpperRot = rightArm.upperArm.group.rotation.clone();
    this.baseLeftElbowRot = (leftArm.elbow.forearmPivot || leftArm.elbow.group).rotation.clone();
    this.baseRightElbowRot = (rightArm.elbow.forearmPivot || rightArm.elbow.group).rotation.clone();
    this.baseLeftWristRot = leftArm.wrist.group.rotation.clone();
    this.baseRightWristRot = rightArm.wrist.group.rotation.clone();

    // Cache initial resting positions for exploded view components
    this.leftBaseShoulderArmorPos = leftArm.shoulder.armorGroup.position.clone();
    this.rightBaseShoulderArmorPos = rightArm.shoulder.armorGroup.position.clone();
    this.leftBaseShoulderJointPos = leftArm.shoulder.jointGroup.position.clone();
    this.rightBaseShoulderJointPos = rightArm.shoulder.jointGroup.position.clone();
    this.leftBaseConnectorPos = leftArm.shoulder.upperArmConnector.position.clone();
    this.rightBaseConnectorPos = rightArm.shoulder.upperArmConnector.position.clone();

    this.leftBaseLatDiscPos = leftArm.elbow.lateralDisc.position.clone();
    this.rightBaseLatDiscPos = rightArm.elbow.lateralDisc.position.clone();
    this.leftBaseMedDiscPos = leftArm.elbow.medialDisc.position.clone();
    this.rightBaseMedDiscPos = rightArm.elbow.medialDisc.position.clone();
    this.leftBasePinPos = leftArm.elbow.centralPin.position.clone();
    this.rightBasePinPos = rightArm.elbow.centralPin.position.clone();
    this.leftBaseForearmPivotPos = leftArm.elbow.forearmPivot.position.clone();
    this.rightBaseForearmPivotPos = rightArm.elbow.forearmPivot.position.clone();

    this.leftBaseDorsalPos = leftArm.hand.dorsalArmor.position.clone();
    this.rightBaseDorsalPos = rightArm.hand.dorsalArmor.position.clone();

    // Cache pad & cap Z positions
    [leftArm, rightArm].forEach((arm) => {
      arm.hand.palmarPads.forEach((pad) => {
        pad.userData.baseZ = pad.position.z;
      });
      arm.hand.knuckleCaps.forEach((cap) => {
        cap.userData.baseZ = cap.position.z;
      });
    });
  }

  // ==============================================================
  // EXPLODED VIEW CONTROLS (Technical Reference Drawings)
  // ==============================================================

  public setExplodedView(enabled: boolean): void {
    this.isExploded = enabled;
  }

  public toggleExplodedView(): boolean {
    this.isExploded = !this.isExploded;
    return this.isExploded;
  }

  public isExplodedActive(): boolean {
    return this.isExploded;
  }

  // ==============================================================
  // PROGRAMMATIC KINEMATIC CONTROLS (Section 5)
  // ==============================================================

  public setShoulderRotation(side: -1 | 1, x?: number, y?: number, z?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.shoulder = { x, y, z };
  }

  public setShoulderJointRotation(side: -1 | 1, x?: number, y?: number, z?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.shoulderJoint = { x, y, z };
  }

  public setUpperArmRotation(side: -1 | 1, x?: number, y?: number, z?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.upperArm = { x, y, z };
  }

  public setElbowBend(side: -1 | 1, bendAngle: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.elbowBend = bendAngle;
  }

  public setWristRotation(side: -1 | 1, pitch?: number, yaw?: number, roll?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.wrist = { pitch, yaw, roll };
  }

  public setThumbPose(side: -1 | 1, proxCurl?: number, distCurl?: number, splay?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.thumb = { proxCurl, distCurl, splay };
  }

  public setFingerPose(
    side: -1 | 1,
    fingerIndex: number,
    proxCurl?: number,
    midCurl?: number,
    distCurl?: number,
    splay?: number
  ): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    if (!overrides.fingers) overrides.fingers = [];
    overrides.fingers[fingerIndex] = { proxCurl, midCurl, distCurl, splay };
  }

  /**
   * Sets a unified grip amount [0, 1] across all fingers and thumb on one hand.
   */
  public setHandGrip(side: -1 | 1, gripAmount: number): void {
    const curl = THREE.MathUtils.clamp(gripAmount, 0, 1);
    for (let f = 0; f < 4; f++) {
      this.setFingerPose(
        side,
        f,
        curl * 0.85,
        curl * 1.10,
        curl * 0.75,
        0
      );
    }
    this.setThumbPose(side, curl * 0.65, curl * 0.80, curl * 0.30);
  }

  public clearOverrides(side?: -1 | 1): void {
    if (side === -1 || side === undefined) this.leftOverrides = {};
    if (side === 1 || side === undefined) this.rightOverrides = {};
  }

  // ==============================================================
  // REAL-TIME KINEMATICS UPDATE
  // ==============================================================

  public update(
    dt: number,
    breathOffset: number = 0,
    lookYaw: number = 0,
    lookPitch: number = 0
  ): void {
    this.time += dt;

    // Exploded View smooth damping interpolation
    const targetExploded = this.isExploded ? 1.0 : 0.0;
    this.explodedProgress = THREE.MathUtils.damp(this.explodedProgress, targetExploded, 6.0, dt);
    const exp = this.explodedProgress;

    // Apply exploded offsets to shoulders, elbows, and hands
    this.applyExplodedOffsets(this.leftArm, -1, exp);
    this.applyExplodedOffsets(this.rightArm, 1, exp);

    this.updateArmKinematics(
      this.leftArm,
      this.baseLeftShoulderRot,
      this.baseLeftUpperRot,
      this.baseLeftElbowRot,
      this.baseLeftWristRot,
      this.leftOverrides,
      -1,
      breathOffset,
      lookYaw,
      lookPitch
    );

    this.updateArmKinematics(
      this.rightArm,
      this.baseRightShoulderRot,
      this.baseRightUpperRot,
      this.baseRightElbowRot,
      this.baseRightWristRot,
      this.rightOverrides,
      1,
      breathOffset,
      lookYaw,
      lookPitch
    );
  }

  /**
   * Separates components along their natural engineering axes adhering strictly to
   * the provided "SHOULDER OVERVIEW -> EXPLODED VIEW" and "ELBOW OVERVIEW -> EXPLODED VIEW".
   */
  private applyExplodedOffsets(
    arm: RobotArmNodes,
    side: -1 | 1,
    exp: number
  ): void {
    const isLeft = side === -1;
    const baseShoulderArmor = isLeft ? this.leftBaseShoulderArmorPos : this.rightBaseShoulderArmorPos;
    const baseShoulderJoint = isLeft ? this.leftBaseShoulderJointPos : this.rightBaseShoulderJointPos;
    const baseConnector = isLeft ? this.leftBaseConnectorPos : this.rightBaseConnectorPos;

    const baseLatDisc = isLeft ? this.leftBaseLatDiscPos : this.rightBaseLatDiscPos;
    const baseMedDisc = isLeft ? this.leftBaseMedDiscPos : this.rightBaseMedDiscPos;
    const basePin = isLeft ? this.leftBasePinPos : this.rightBasePinPos;
    const baseForearmPivot = isLeft ? this.leftBaseForearmPivotPos : this.rightBaseForearmPivotPos;

    const baseDorsal = isLeft ? this.leftBaseDorsalPos : this.rightBaseDorsalPos;

    // 1. SHOULDER EXPLODED VIEW (Reference: SHOULDER OVERVIEW -> EXPLODED VIEW)
    // Shoulder Armor (Outer Shell) lifts +Y and separates outward
    arm.shoulder.armorGroup.position.set(
      baseShoulderArmor.x + side * exp * 0.045,
      baseShoulderArmor.y + exp * 0.055,
      baseShoulderArmor.z
    );

    // Rotational Core separates laterally along X
    arm.shoulder.jointGroup.position.set(
      baseShoulderJoint.x + side * exp * 0.035,
      baseShoulderJoint.y,
      baseShoulderJoint.z
    );

    // Upper Arm Connector separates downward in -Y
    arm.shoulder.upperArmConnector.position.set(
      baseConnector.x,
      baseConnector.y - exp * 0.030,
      baseConnector.z
    );

    // 2. ELBOW EXPLODED VIEW (Reference: ELBOW OVERVIEW -> EXPLODED VIEW)
    // Dual Side Rotational Discs separate laterally along ±X
    const latSign = side === 1 ? 1 : -1;
    arm.elbow.lateralDisc.position.set(
      baseLatDisc.x + latSign * exp * 0.042,
      baseLatDisc.y,
      baseLatDisc.z
    );
    arm.elbow.medialDisc.position.set(
      baseMedDisc.x - latSign * exp * 0.042,
      baseMedDisc.y,
      baseMedDisc.z
    );

    // Central Hinge Pin slides along X
    arm.elbow.centralPin.position.set(
      basePin.x + latSign * exp * 0.018,
      basePin.y,
      basePin.z
    );

    // Forearm Pivot separates downward along Y
    arm.elbow.forearmPivot.position.set(
      baseForearmPivot.x,
      baseForearmPivot.y - exp * 0.040,
      baseForearmPivot.z
    );

    // 3. HAND EXPLODED VIEW
    // Dorsal Armor Shield separates forward along +Z
    arm.hand.dorsalArmor.position.set(
      baseDorsal.x,
      baseDorsal.y,
      baseDorsal.z + exp * 0.024
    );

    // Segmented Palmar Friction Grip Pads separate backward along -Z
    arm.hand.palmarPads.forEach((pad) => {
      const bZ = pad.userData.baseZ !== undefined ? pad.userData.baseZ : pad.position.z;
      pad.position.z = bZ - exp * 0.012;
    });

    // MCP Knuckle Caps separate along +Z
    arm.hand.knuckleCaps.forEach((cap) => {
      const bZ = cap.userData.baseZ !== undefined ? cap.userData.baseZ : cap.position.z;
      cap.position.z = bZ + exp * 0.012;
    });
  }

  private updateArmKinematics(
    arm: RobotArmNodes,
    baseShoulder: THREE.Euler,
    baseUpper: THREE.Euler,
    baseElbow: THREE.Euler,
    baseWrist: THREE.Euler,
    overrides: ArmControlOverrides,
    side: -1 | 1,
    breathOffset: number,
    lookYaw: number,
    lookPitch: number
  ): void {
    const isLeft = side === -1;
    const timePhase = isLeft ? 0 : 2.4;

    // 1. Shoulder Kinematics
    if (overrides.shoulder) {
      if (overrides.shoulder.x !== undefined) arm.shoulder.group.rotation.x = overrides.shoulder.x;
      if (overrides.shoulder.y !== undefined) arm.shoulder.group.rotation.y = overrides.shoulder.y;
      if (overrides.shoulder.z !== undefined) arm.shoulder.group.rotation.z = overrides.shoulder.z;
    } else {
      arm.shoulder.group.rotation.set(
        baseShoulder.x,
        baseShoulder.y,
        baseShoulder.z + (isLeft ? -breathOffset * 0.04 : breathOffset * 0.04)
      );
    }

    // 1b. Shoulder Joint Rotational Mechanism (rotates independently from shoulder armor per Section 4)
    if (overrides.shoulderJoint) {
      if (overrides.shoulderJoint.x !== undefined) arm.shoulder.jointGroup.rotation.x = overrides.shoulderJoint.x;
      if (overrides.shoulderJoint.y !== undefined) arm.shoulder.jointGroup.rotation.y = overrides.shoulderJoint.y;
      if (overrides.shoulderJoint.z !== undefined) arm.shoulder.jointGroup.rotation.z = overrides.shoulderJoint.z;
    }

    // 2. Upper Arm Kinematics
    if (overrides.upperArm) {
      if (overrides.upperArm.x !== undefined) arm.upperArm.group.rotation.x = overrides.upperArm.x;
      if (overrides.upperArm.y !== undefined) arm.upperArm.group.rotation.y = overrides.upperArm.y;
      if (overrides.upperArm.z !== undefined) arm.upperArm.group.rotation.z = overrides.upperArm.z;
    } else {
      const upperSway = Math.sin(this.time * 0.40 + timePhase) * 0.015 + breathOffset * 0.05;
      arm.upperArm.group.rotation.set(
        baseUpper.x + upperSway,
        baseUpper.y,
        baseUpper.z
      );
    }

    // 3. Elbow Kinematics (articulates forearmPivot around the central horizontal hinge axis)
    const elbowPivot = arm.elbow.forearmPivot || arm.elbow.group;
    if (overrides.elbowBend !== undefined) {
      elbowPivot.rotation.set(overrides.elbowBend, baseElbow.y, baseElbow.z);
    } else {
      const elbowDelta =
        Math.sin(this.time * 0.36 + timePhase) * 0.018 +
        breathOffset * 0.06 +
        lookPitch * 0.02;
      elbowPivot.rotation.set(
        baseElbow.x + elbowDelta,
        baseElbow.y,
        baseElbow.z
      );
    }

    // 4. Wrist Kinematics (Pitch, Yaw, Roll)
    if (overrides.wrist) {
      if (overrides.wrist.pitch !== undefined) arm.wrist.group.rotation.x = overrides.wrist.pitch;
      if (overrides.wrist.roll !== undefined) arm.wrist.group.rotation.y = overrides.wrist.roll;
      if (overrides.wrist.yaw !== undefined) arm.wrist.group.rotation.z = overrides.wrist.yaw;
    } else {
      const wPitch = Math.cos(this.time * 0.55 + timePhase) * 0.022 + breathOffset * 0.08 - lookPitch * 0.02;
      const wRoll = Math.sin(this.time * 0.42 + timePhase) * 0.015 + lookYaw * 0.03;
      const wYaw = Math.cos(this.time * 0.30 + timePhase) * 0.012;
      arm.wrist.group.rotation.set(
        baseWrist.x + wPitch,
        baseWrist.y + wRoll,
        baseWrist.z + wYaw
      );
    }

    // 5. Hand Fingers Kinematics
    const fingers = [
      arm.hand.indexFinger,
      arm.hand.middleFinger,
      arm.hand.ringFinger,
      arm.hand.littleFinger,
    ];

    fingers.forEach((finger, idx) => {
      this.updateFingerKinematics(
        finger,
        idx,
        overrides.fingers ? overrides.fingers[idx] : undefined,
        side,
        timePhase,
        breathOffset
      );
    });

    // 6. Thumb Kinematics
    this.updateThumbKinematics(
      arm.hand.thumb,
      overrides.thumb,
      side,
      timePhase,
      breathOffset
    );
  }

  private updateFingerKinematics(
    finger: FingerNodes,
    idx: number,
    override: { proxCurl?: number; midCurl?: number; distCurl?: number; splay?: number } | undefined,
    side: -1 | 1,
    timePhase: number,
    breathOffset: number
  ): void {
    if (override) {
      if (override.proxCurl !== undefined) finger.proximal.group.rotation.x = -override.proxCurl;
      if (override.midCurl !== undefined) finger.middle.group.rotation.x = -override.midCurl;
      if (override.distCurl !== undefined) finger.distal.group.rotation.x = -override.distCurl;
      if (override.splay !== undefined) finger.proximal.group.rotation.z = -side * override.splay;
      return;
    }

    const isLeft = side === -1;
    // Progressive anatomical flexion angles (cascade of flexion curving naturally into palm):
    // - Index finger is most extended/relaxed
    // - Little finger is most flexed/curled
    const restingLeft = [
      { prox: 0.20, mid: 0.35, dist: 0.24, splay: 0.025 },  // Index (~11°, 20°, 14° -> 45° total)
      { prox: 0.24, mid: 0.40, dist: 0.28, splay: 0.000 },  // Middle (~14°, 23°, 16° -> 53° total)
      { prox: 0.28, mid: 0.46, dist: 0.32, splay: -0.018 }, // Ring (~16°, 26°, 18° -> 60° total)
      { prox: 0.32, mid: 0.52, dist: 0.36, splay: -0.038 }, // Little (~18°, 30°, 21° -> 69° total)
    ];
    const restingRight = [
      { prox: 0.18, mid: 0.32, dist: 0.22, splay: 0.025 },  // Index
      { prox: 0.22, mid: 0.38, dist: 0.26, splay: 0.000 },  // Middle
      { prox: 0.26, mid: 0.44, dist: 0.30, splay: -0.018 }, // Ring
      { prox: 0.30, mid: 0.50, dist: 0.34, splay: -0.038 }, // Little
    ];

    const target = isLeft ? restingLeft[idx] : restingRight[idx];

    // Procedural organic resting micro-motion:
    // Dual-harmonic subtle wave cascaded across fingers for lifelike mechanical relaxation
    const speed = 0.45 + idx * 0.06;
    const phase = idx * 0.42 + timePhase;
    const amp = 0.015 - idx * 0.002;

    const wave =
      Math.sin(this.time * speed + phase) * amp +
      Math.sin(this.time * speed * 2.0 + phase * 0.7) * (amp * 0.25) +
      breathOffset * 0.008;

    // Segmented bending: positive rotation around X axis flexes fingers naturally toward palm (-Z)
    finger.proximal.group.rotation.x = target.prox + wave * 0.3;
    finger.middle.group.rotation.x = target.mid + wave * 0.5;
    finger.distal.group.rotation.x = target.dist + wave * 0.4;

    // Subtle natural lateral splay along Z axis
    finger.proximal.group.rotation.z = -side * (target.splay + Math.sin(this.time * 0.25 + phase) * 0.004);
  }

  private updateThumbKinematics(
    thumb: ThumbNodes,
    override: { proxCurl?: number; distCurl?: number; splay?: number } | undefined,
    side: -1 | 1,
    timePhase: number,
    breathOffset: number
  ): void {
    if (override) {
      if (override.proxCurl !== undefined) thumb.proximal.group.rotation.x = override.proxCurl;
      if (override.distCurl !== undefined) {
        thumb.distal.group.rotation.x = override.distCurl;
        if (thumb.middle) thumb.middle.group.rotation.x = override.distCurl;
      }
      if (override.splay !== undefined) thumb.group.rotation.z = -side * override.splay;
      return;
    }

    const wave =
      Math.cos(this.time * 0.40 + timePhase) * 0.012 +
      Math.sin(this.time * 0.80 + timePhase) * 0.008 +
      breathOffset * 0.006;

    // Natural relaxed thumb posture angled toward palm
    thumb.group.rotation.set(0.24 + wave * 0.04, -side * 0.32, -side * 0.14);
    thumb.proximal.group.rotation.x = 0.20 + wave * 0.05;
    thumb.proximal.group.rotation.z = -side * 0.10;
    thumb.distal.group.rotation.x = 0.24 + wave * 0.05;
    if (thumb.middle) thumb.middle.group.rotation.x = 0.24 + wave * 0.05;
  }
}

