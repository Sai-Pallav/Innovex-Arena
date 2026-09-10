import * as THREE from 'three';
import { RobotNodes } from './RobotProceduralFactory';
import { RobotAnimationSystem } from './RobotAnimation';
import { ROBOT_CONFIG } from '../config';

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
    const desiredHeadYaw = this.targetLookX * (cfg.headYawLimit * motionScale + speedBoost);
    // Up cursor (targetLookY > 0) -> negative X pitch (looks up); Down cursor -> positive X pitch (looks down)
    const desiredHeadPitch = -this.targetLookY * (cfg.headPitchLimit * motionScale);
    const desiredHeadRoll = this.targetLookX * (cfg.headRollLimit * motionScale);

    // 3. Smooth Damping (Critically damped exponential interpolation)
    const headDampFactor = 1.0 - Math.exp(-cfg.headDamping * dt);
    const eyeDampFactor = 1.0 - Math.exp(-cfg.eyeDamping * dt);

    this.currentHeadYaw += (desiredHeadYaw - this.currentHeadYaw) * headDampFactor;
    this.currentHeadPitch += (desiredHeadPitch - this.currentHeadPitch) * headDampFactor;
    this.currentHeadRoll += (desiredHeadRoll - this.currentHeadRoll) * headDampFactor;

    // Apply rotation to Head (incorporating base heroic gaze angle turned down and toward screen-left per reference)
    this.nodes.head.rotation.set(
      0.08 + this.currentHeadPitch,
      -0.38 + this.currentHeadYaw,
      -0.04 + this.currentHeadRoll,
      'YXZ'
    );

    // 4. Eye Saccade & Gaze System (Tracks faster than head, stays centered within visor)
    const desiredEyeX = this.targetLookX * cfg.eyeGazeRangeX * motionScale;
    const desiredEyeY = this.targetLookY * cfg.eyeGazeRangeY * motionScale;

    this.currentEyeX += (desiredEyeX - this.currentEyeX) * eyeDampFactor;
    this.currentEyeY += (desiredEyeY - this.currentEyeY) * eyeDampFactor;

    this.nodes.eyeTrackingGroup.position.x = this.currentEyeX;
    this.nodes.eyeTrackingGroup.position.y = this.currentEyeY;
    this.nodes.eyeTrackingGroup.position.z = 0;

    // 5. Neck Follow-Through (~28% of head rotation)
    const desiredNeckYaw = this.currentHeadYaw * cfg.neckFollowStrength;
    const desiredNeckPitch = this.currentHeadPitch * cfg.neckFollowStrength;
    const neckDampFactor = 1.0 - Math.exp(-(cfg.headDamping * 0.8) * dt);

    this.currentNeckYaw += (desiredNeckYaw - this.currentNeckYaw) * neckDampFactor;
    this.currentNeckPitch += (desiredNeckPitch - this.currentNeckPitch) * neckDampFactor;

    this.nodes.neck.rotation.set(
      0.05 + this.currentNeckPitch,
      -0.10 + this.currentNeckYaw,
      0,
      'YXZ'
    );

    // 6. Torso & Shoulder Reaction (Base -0.35 rad turns body ~20° toward SCREEN LEFT)
    const desiredTorsoYaw = this.currentHeadYaw * cfg.torsoFollowStrength;
    const desiredTorsoPitch = this.currentHeadPitch * cfg.torsoFollowStrength * 0.6;
    const torsoDampFactor = 1.0 - Math.exp(-(cfg.headDamping * 0.6) * dt);

    this.currentTorsoYaw += (desiredTorsoYaw - this.currentTorsoYaw) * torsoDampFactor;
    this.currentTorsoPitch += (desiredTorsoPitch - this.currentTorsoPitch) * torsoDampFactor;

    this.nodes.torso.rotation.set(
      0.02 + this.currentTorsoPitch,
      -0.35 + this.currentTorsoYaw,
      -this.currentTorsoYaw * 0.15, // subtle counter-lean
      'YXZ'
    );

    // Shoulders dynamic subtle reaction
    const shoulderReaction = this.currentHeadYaw * cfg.shoulderFollowStrength;
    this.nodes.leftShoulder.rotation.z = -0.02 - shoulderReaction * 0.08;
    this.nodes.rightShoulder.rotation.z = 0.02 - shoulderReaction * 0.08;

    // 7. Update Secondary Animations (Breathing, Eye Blink, LED Pulse, Hand Kinematics)
    this.animationSystem.update(dt, this.reducedMotion, this.currentHeadYaw, this.currentHeadPitch);
  }

  public dispose(): void {
    // Controller cleanup
  }
}
