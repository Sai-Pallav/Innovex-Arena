import * as THREE from 'three';
import { ArmPoseAngles, WristOffset } from './AnimationTypes';
import { ANIMATION_CONFIG } from './AnimationConfig';

interface ActiveArmState {
  leftElbow: number;
  rightElbow: number;
  leftUpperPitch: number;
  rightUpperPitch: number;
  leftUpperRoll: number;
  rightUpperRoll: number;
}

export class ArmElbowController {
  private currentPoseKey: 'poseA' | 'poseB' | 'poseC' = 'poseA';
  private targetPoseKey: 'poseA' | 'poseB' | 'poseC' = 'poseB';
  private transitionTimer: number = 0;
  private nextTransitionTime: number = 16.0;
  private isTransitioning: boolean = false;
  private transitionProgress: number = 1.0;

  private currentPoseState: ActiveArmState;
  private startPoseState: ActiveArmState;

  // Smoothed output states for elbows and upper arms
  private smoothedLeftElbow: number;
  private smoothedRightElbow: number;
  private smoothedLeftUpperPitch: number;
  private smoothedRightUpperPitch: number;
  private smoothedLeftUpperRoll: number;
  private smoothedRightUpperRoll: number;

  // Wrist stabilization states
  private leftWristPitch: number = 0;
  private leftWristRoll: number = 0;
  private leftWristYaw: number = 0;
  private rightWristPitch: number = 0;
  private rightWristRoll: number = 0;
  private rightWristYaw: number = 0;

  constructor() {
    const pA = ANIMATION_CONFIG.arm.poses.poseA;
    this.currentPoseState = {
      leftElbow: pA.leftElbow,
      rightElbow: pA.rightElbow,
      leftUpperPitch: pA.leftUpperPitch,
      rightUpperPitch: pA.rightUpperPitch,
      leftUpperRoll: pA.leftUpperRoll,
      rightUpperRoll: pA.rightUpperRoll,
    };
    this.startPoseState = { ...this.currentPoseState };

    this.smoothedLeftElbow = pA.leftElbow;
    this.smoothedRightElbow = pA.rightElbow;
    this.smoothedLeftUpperPitch = pA.leftUpperPitch;
    this.smoothedRightUpperPitch = pA.rightUpperPitch;
    this.smoothedLeftUpperRoll = pA.leftUpperRoll;
    this.smoothedRightUpperRoll = pA.rightUpperRoll;

    this.scheduleNextTransition();
  }

  private scheduleNextTransition(): void {
    const cfg = ANIMATION_CONFIG.arm;
    this.nextTransitionTime =
      cfg.poseIntervalMin + Math.random() * (cfg.poseIntervalMax - cfg.poseIntervalMin);
    this.transitionTimer = 0;
  }

  private selectNextPose(): 'poseA' | 'poseB' | 'poseC' {
    const keys: Array<'poseA' | 'poseB' | 'poseC'> = ['poseA', 'poseB', 'poseC'];
    const candidates = keys.filter((k) => k !== this.currentPoseKey);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  public update(
    dt: number,
    time: number,
    breathOffset: number,
    lookYaw: number,
    lookPitch: number,
    reducedMotion: boolean
  ): {
    pose: ArmPoseAngles;
    leftWrist: WristOffset;
    rightWrist: WristOffset;
  } {
    const cfg = ANIMATION_CONFIG.arm;
    const wristCfg = ANIMATION_CONFIG.wrist;

    // 1. Manage Infrequent S-curve Pose Transitions
    if (!reducedMotion) {
      if (!this.isTransitioning) {
        this.transitionTimer += dt;
        if (this.transitionTimer >= this.nextTransitionTime) {
          this.targetPoseKey = this.selectNextPose();
          this.startPoseState = { ...this.currentPoseState };
          this.isTransitioning = true;
          this.transitionProgress = 0;
        }
      } else {
        this.transitionProgress += dt / cfg.transitionDuration;
        if (this.transitionProgress >= 1.0) {
          this.transitionProgress = 1.0;
          this.isTransitioning = false;
          this.currentPoseKey = this.targetPoseKey;
          this.scheduleNextTransition();
        }

        // Smoothstep / S-curve easing
        const t = this.transitionProgress;
        const ease = t * t * (3 - 2 * t);

        const targetPose = cfg.poses[this.targetPoseKey];
        this.currentPoseState.leftElbow =
          this.startPoseState.leftElbow + (targetPose.leftElbow - this.startPoseState.leftElbow) * ease;
        this.currentPoseState.rightElbow =
          this.startPoseState.rightElbow + (targetPose.rightElbow - this.startPoseState.rightElbow) * ease;
        this.currentPoseState.leftUpperPitch =
          this.startPoseState.leftUpperPitch +
          (targetPose.leftUpperPitch - this.startPoseState.leftUpperPitch) * ease;
        this.currentPoseState.rightUpperPitch =
          this.startPoseState.rightUpperPitch +
          (targetPose.rightUpperPitch - this.startPoseState.rightUpperPitch) * ease;
        this.currentPoseState.leftUpperRoll =
          this.startPoseState.leftUpperRoll +
          (targetPose.leftUpperRoll - this.startPoseState.leftUpperRoll) * ease;
        this.currentPoseState.rightUpperRoll =
          this.startPoseState.rightUpperRoll +
          (targetPose.rightUpperRoll - this.startPoseState.rightUpperRoll) * ease;
      }
    }

    // 2. Micro-motion and Mechanical Settling for Elbows
    // Layer 4 idle adjustment: very slow asynchronous sine offset
    const elbowIdleL = Math.sin(time * 0.32) * 0.012 + breathOffset * 0.04 - lookPitch * 0.02;
    const elbowIdleR = Math.cos(time * 0.28 + 1.2) * 0.012 + breathOffset * 0.04 - lookPitch * 0.02;

    const targetLeftElbow = THREE.MathUtils.clamp(
      this.currentPoseState.leftElbow + elbowIdleL,
      0.26, // ~15° minimum
      0.65  // ~37° maximum
    );
    const targetRightElbow = THREE.MathUtils.clamp(
      this.currentPoseState.rightElbow + elbowIdleR,
      0.26,
      0.65
    );

    // Damped interpolation for mechanical inertia
    const damp = 1.0 - Math.exp(-5.0 * dt);
    this.smoothedLeftElbow += (targetLeftElbow - this.smoothedLeftElbow) * damp;
    this.smoothedRightElbow += (targetRightElbow - this.smoothedRightElbow) * damp;

    // Upper Arm follow-through
    const armFollowYaw = lookYaw * 0.035;
    const targetLeftPitch = this.currentPoseState.leftUpperPitch + breathOffset * 0.05;
    const targetRightPitch = this.currentPoseState.rightUpperPitch + breathOffset * 0.05;
    const targetLeftRoll = this.currentPoseState.leftUpperRoll + armFollowYaw;
    const targetRightRoll = this.currentPoseState.rightUpperRoll + armFollowYaw;

    this.smoothedLeftUpperPitch += (targetLeftPitch - this.smoothedLeftUpperPitch) * damp;
    this.smoothedRightUpperPitch += (targetRightPitch - this.smoothedRightUpperPitch) * damp;
    this.smoothedLeftUpperRoll += (targetLeftRoll - this.smoothedLeftUpperRoll) * damp;
    this.smoothedRightUpperRoll += (targetRightRoll - this.smoothedRightUpperRoll) * damp;

    // 3. Wrist Stabilization & Micro-reaction (±2-5°)
    const wSmooth = 1.0 - Math.exp(-wristCfg.damping * dt);

    const targetLeftWPitch = THREE.MathUtils.clamp(
      Math.cos(time * 0.45) * 0.018 + breathOffset * 0.05 - lookPitch * wristCfg.cursorReactFactor,
      -wristCfg.pitchLimit,
      wristCfg.pitchLimit
    );
    const targetLeftWRoll = THREE.MathUtils.clamp(
      Math.sin(time * 0.38) * 0.012 + lookYaw * wristCfg.cursorReactFactor,
      -wristCfg.rollLimit,
      wristCfg.rollLimit
    );
    const targetLeftWYaw = THREE.MathUtils.clamp(
      Math.cos(time * 0.25) * 0.010,
      -wristCfg.yawLimit,
      wristCfg.yawLimit
    );

    const targetRightWPitch = THREE.MathUtils.clamp(
      Math.sin(time * 0.42 + 1.5) * 0.018 + breathOffset * 0.05 - lookPitch * wristCfg.cursorReactFactor,
      -wristCfg.pitchLimit,
      wristCfg.pitchLimit
    );
    const targetRightWRoll = THREE.MathUtils.clamp(
      Math.cos(time * 0.35 + 1.0) * 0.012 + lookYaw * wristCfg.cursorReactFactor,
      -wristCfg.rollLimit,
      wristCfg.rollLimit
    );
    const targetRightWYaw = THREE.MathUtils.clamp(
      Math.sin(time * 0.22 + 0.8) * 0.010,
      -wristCfg.yawLimit,
      wristCfg.yawLimit
    );

    this.leftWristPitch += (targetLeftWPitch - this.leftWristPitch) * wSmooth;
    this.leftWristRoll += (targetLeftWRoll - this.leftWristRoll) * wSmooth;
    this.leftWristYaw += (targetLeftWYaw - this.leftWristYaw) * wSmooth;

    this.rightWristPitch += (targetRightWPitch - this.rightWristPitch) * wSmooth;
    this.rightWristRoll += (targetRightWRoll - this.rightWristRoll) * wSmooth;
    this.rightWristYaw += (targetRightWYaw - this.rightWristYaw) * wSmooth;

    return {
      pose: {
        leftElbowBend: this.smoothedLeftElbow,
        rightElbowBend: this.smoothedRightElbow,
        leftUpperPitch: this.smoothedLeftUpperPitch,
        rightUpperPitch: this.smoothedRightUpperPitch,
        leftUpperRoll: this.smoothedLeftUpperRoll,
        rightUpperRoll: this.smoothedRightUpperRoll,
      },
      leftWrist: {
        pitch: this.leftWristPitch,
        roll: this.leftWristRoll,
        yaw: this.leftWristYaw,
      },
      rightWrist: {
        pitch: this.rightWristPitch,
        roll: this.rightWristRoll,
        yaw: this.rightWristYaw,
      },
    };
  }
}
