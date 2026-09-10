import * as THREE from 'three';
import { RobotNodes } from './RobotProceduralFactory';
import { RobotAnimationSystem } from './RobotAnimation';
import { ROBOT_CONFIG, HEAD_ROTATION_LIMIT, SHOULDER_RESPONSE, TORSO_RESPONSE } from '../config';

export class RobotController {
  public nodes: RobotNodes;
  private animationSystem: RobotAnimationSystem;

  // Target coordinates (normalized [-1, 1])
  private targetLookX: number = 0;
  private targetLookY: number = 0;
  private cursorSpeed: number = 0;
  private isInteracting: boolean = false;
  private reducedMotion: boolean = false;

  // Current smoothed kinematic states
  private currentHeadYaw: number = 0;
  private currentHeadPitch: number = 0;
  private currentHeadRoll: number = 0;

  private currentEyeX: number = 0;
  private currentEyeY: number = 0;

  private currentNeckYaw: number = 0;
  private currentNeckPitch: number = 0;

  private currentTorsoYaw: number = 0;
  private currentTorsoPitch: number = 0;

  // Reusable math objects to prevent per-frame garbage collection
  private _targetQuat = new THREE.Quaternion();
  private _euler = new THREE.Euler(0, 0, 0, 'YXZ');

  constructor(nodes: RobotNodes) {
    this.nodes = nodes;
    this.animationSystem = new RobotAnimationSystem(nodes);
  }

  public setLookTarget(x: number, y: number, speed: number = 0): void {
    this.targetLookX = Math.max(-1, Math.min(1, x));
    this.targetLookY = Math.max(-1, Math.min(1, y));
    this.cursorSpeed = speed;
    this.isInteracting = true;
  }

  public setIdleState(): void {
    this.targetLookX = 0;
    this.targetLookY = 0;
    this.cursorSpeed = 0;
    this.isInteracting = false;
  }

  public setInteractionState(active: boolean): void {
    this.isInteracting = active;
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  /**
   * Updates robot kinematics, gaze tracking, layered follow-through, and secondary animation.
   * Frame-rate independent using deltaTime.
   */
  public update(deltaTime: number): void {
    const dt = Math.min(deltaTime, 0.1); // Clamp against frame drops
    const cfg = ROBOT_CONFIG;

    // Determine motion scale based on accessibility preferences
    const motionScale = this.reducedMotion ? 0.25 : 1.0;

    // 1. Calculate Cursor Speed Anticipation
    let speedBoost = 0;
    if (this.cursorSpeed > cfg.cursorSpeedThreshold && !this.reducedMotion) {
      speedBoost = Math.min(
        (this.cursorSpeed - cfg.cursorSpeedThreshold) * cfg.cursorSpeedAnticipation,
        0.18
      );
    }

    // 2. Desired Target Angles (Clamped to mechanical limits)
    // Left cursor -> negative Y yaw (turns left); Right cursor -> positive Y yaw (turns right)
    const desiredHeadYaw = this.targetLookX * (HEAD_ROTATION_LIMIT.yaw * motionScale + speedBoost);
    // Up cursor (targetLookY > 0) -> negative X pitch (looks up); Down cursor -> positive X pitch (looks down)
    const desiredHeadPitch = -this.targetLookY * (HEAD_ROTATION_LIMIT.pitch * motionScale);
    const desiredHeadRoll = this.targetLookX * (HEAD_ROTATION_LIMIT.roll * motionScale);

    // 3. Smooth Damping (Critically damped exponential interpolation)
    const headDampFactor = 1.0 - Math.exp(-cfg.headDamping * dt);

    this.currentHeadYaw += (desiredHeadYaw - this.currentHeadYaw) * headDampFactor;
    this.currentHeadPitch += (desiredHeadPitch - this.currentHeadPitch) * headDampFactor;
    this.currentHeadRoll += (desiredHeadRoll - this.currentHeadRoll) * headDampFactor;

    // Distribute yaw and pitch across the kinematic hierarchy without compounding.
    // Root has base orientation towards screen-left (~-12°).
    // Subtle gaze compensation (+0.04 rad) keeps head comfortably in heroic 3/4 alignment.
    const baseGazeOffset = 0.04;

    // Strict P5 Hierarchy:
    // HEAD: primary response (~72% yaw, ~78% pitch)
    // NECK: smooth transition (~22% yaw, ~20% pitch)
    // SHOULDERS: subtle response (~3% yaw)
    // TORSO: almost imperceptible response (~2% yaw, ~1.5% pitch)
    const torsoYaw = this.currentHeadYaw * TORSO_RESPONSE.yawFactor;
    const torsoPitch = this.currentHeadPitch * TORSO_RESPONSE.pitchFactor;

    const neckYaw = (baseGazeOffset * 0.35) + (this.currentHeadYaw * 0.22);
    const neckPitch = this.currentHeadPitch * 0.20;

    const headLocalYaw = (baseGazeOffset * 0.65) + (this.currentHeadYaw * 0.74);
    const headLocalPitch = this.currentHeadPitch * 0.78;
    const headLocalRoll = this.currentHeadRoll * 0.35;

    // Apply rotation to Head (natural forward eye level gaze)
    this.nodes.head.rotation.set(
      headLocalPitch,
      headLocalYaw,
      -0.01 + headLocalRoll,
      'YXZ'
    );

    // Apply rotation to Neck (upright alignment)
    this.nodes.neck.rotation.set(
      neckPitch,
      neckYaw,
      0,
      'YXZ'
    );

    // Apply rotation to Torso (upright athletic posture)
    this.nodes.torso.rotation.set(
      torsoPitch,
      torsoYaw,
      -torsoYaw * 0.08,
      'YXZ'
    );

    // Keep eyeTrackingGroup centered on the curved visor glass
    this.nodes.eyeTrackingGroup.position.set(0, 0, 0);

    // Shoulders subtle dynamic response
    const shoulderReaction = this.currentHeadYaw * SHOULDER_RESPONSE.yawFactor;
    this.nodes.leftShoulder.rotation.z = -0.02 - shoulderReaction * SHOULDER_RESPONSE.zReaction;
    this.nodes.leftShoulder.rotation.y = shoulderReaction * SHOULDER_RESPONSE.pitchFactor;
    this.nodes.rightShoulder.rotation.z = 0.02 - shoulderReaction * SHOULDER_RESPONSE.zReaction;
    this.nodes.rightShoulder.rotation.y = shoulderReaction * SHOULDER_RESPONSE.pitchFactor;

    // Arms secondary follow-through (minimal)
    const armFollow = this.currentHeadYaw * 0.02;
    this.nodes.leftUpperArm.rotation.y = armFollow * 0.5;
    this.nodes.rightUpperArm.rotation.y = armFollow * 0.5;

    // 7. Update Secondary Animations (Breathing, Eye Blink, LED Pulse, Hand Kinematics)
    this.animationSystem.update(dt, this.reducedMotion, this.currentHeadYaw, this.currentHeadPitch);
  }

  public getAnimationSystem(): RobotAnimationSystem {
    return this.animationSystem;
  }

  public getArmController() {
    return this.animationSystem.getArmController();
  }

  public getTorsoController() {
    return this.animationSystem.getTorsoController();
  }

  public getLegController() {
    return this.animationSystem.getLegController();
  }

  public dispose(): void {
    // Controller cleanup
  }
}
