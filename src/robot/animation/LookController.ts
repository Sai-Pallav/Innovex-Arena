import * as THREE from 'three';
import { NormalizedInputState, HierarchicalGazeAngles } from './AnimationTypes';
import { ANIMATION_CONFIG } from './AnimationConfig';

export class LookController {
  private currentYaw: number = 0;
  private currentPitch: number = 0;
  private currentRoll: number = 0;

  private currentVelocityYaw: number = 0;
  private currentVelocityPitch: number = 0;
  private currentVelocityRoll: number = 0;

  public update(input: NormalizedInputState, dt: number): HierarchicalGazeAngles {
    const cfg = ANIMATION_CONFIG.look;
    const motionScale = input.reducedMotion ? ANIMATION_CONFIG.reducedMotion.scale : 1.0;

    // 1. Calculate Cursor Speed Anticipation Boost (smooth, clamped)
    let speedBoost = 0;
    if (input.speed > cfg.speedThreshold && !input.reducedMotion) {
      speedBoost = Math.min((input.speed - cfg.speedThreshold) * cfg.speedAnticipation, 0.08);
    }

    // 2. Desired Target Angles (Clamped to strict mechanical limits)
    const desiredYaw = input.targetX * (cfg.headYawLimit * motionScale + speedBoost);
    const desiredPitch = -input.targetY * (cfg.headPitchLimit * motionScale);
    const desiredRoll = input.targetX * (cfg.headRollLimit * motionScale);

    // 3. Critically Damped Smoothing (Eliminates jitter and sudden transitions)
    const damp = cfg.headDamping;
    const dampFactor = 1.0 - Math.exp(-damp * dt);

    this.currentYaw += (desiredYaw - this.currentYaw) * dampFactor;
    this.currentPitch += (desiredPitch - this.currentPitch) * dampFactor;
    this.currentRoll += (desiredRoll - this.currentRoll) * dampFactor;

    // Base gaze offset (+0.04 rad) keeps head comfortably in heroic 3/4 orientation
    const baseGazeOffset = 0.04;

    // 4. Exact Hierarchical Look Distribution:
    // Head leads (100%), Neck follows (28%), Shoulders react (12%), Chest follows (5.5%), Waist barely reacts (2.0%)
    return {
      headYaw: (baseGazeOffset * 0.65) + (this.currentYaw * 0.72),
      headPitch: this.currentPitch * 0.78,
      headRoll: this.currentRoll * 0.35,
      neckYaw: (baseGazeOffset * 0.35) + (this.currentYaw * cfg.neckRatio),
      neckPitch: this.currentPitch * 0.25,
      shouldersYaw: this.currentYaw * cfg.shouldersRatio,
      chestYaw: this.currentYaw * cfg.chestRatio,
      chestPitch: this.currentPitch * cfg.chestRatio * 0.85,
      waistYaw: this.currentYaw * cfg.waistRatio,
      waistPitch: this.currentPitch * cfg.waistRatio * 0.75,
    };
  }

  public getCurrentHeadYaw(): number {
    return this.currentYaw;
  }

  public getCurrentHeadPitch(): number {
    return this.currentPitch;
  }
}
