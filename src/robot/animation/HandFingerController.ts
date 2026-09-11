import * as THREE from 'three';
import { HandOffsets, HandFingerOffsets } from './AnimationTypes';
import { ANIMATION_CONFIG } from './AnimationConfig';

export class HandFingerController {
  private leftHandOffsets: HandOffsets;
  private rightHandOffsets: HandOffsets;

  constructor() {
    this.leftHandOffsets = this.createDefaultOffsets();
    this.rightHandOffsets = this.createDefaultOffsets();
  }

  private createDefaultOffsets(): HandOffsets {
    return {
      thumbPitch: 0,
      thumbYaw: 0,
      fingers: [
        { proximalCurl: 0, middleCurl: 0, distalCurl: 0, splay: 0 },
        { proximalCurl: 0, middleCurl: 0, distalCurl: 0, splay: 0 },
        { proximalCurl: 0, middleCurl: 0, distalCurl: 0, splay: 0 },
        { proximalCurl: 0, middleCurl: 0, distalCurl: 0, splay: 0 },
      ],
    };
  }

  public update(
    time: number,
    breathOffset: number,
    reducedMotion: boolean
  ): { leftHand: HandOffsets; rightHand: HandOffsets } {
    if (reducedMotion) {
      return {
        leftHand: this.leftHandOffsets,
        rightHand: this.rightHandOffsets,
      };
    }

    const cfg = ANIMATION_CONFIG.hand;

    // Coordinated Finger Micro-curl Cycle:
    // Gentle progression 0° -> 2° -> 4° -> 1° over several seconds (~18-22s period)
    const baseCycle = Math.sin(time * cfg.cycleSpeed);
    // Smooth dual harmonic shape
    const normalizedCurl = (Math.sin(time * cfg.cycleSpeed) * 0.7 + Math.sin(time * cfg.cycleSpeed * 0.5 + 1.0) * 0.3 + 1.0) * 0.5; // [0, 1]
    const baseCurl = cfg.minCurl + normalizedCurl * (cfg.maxCurl - cfg.minCurl);

    // Periodic subtle relaxation/settling pulse every ~8.5 seconds
    const relaxCycle = Math.sin(time * 0.16);
    const relaxPulse = Math.pow(Math.max(0, relaxCycle), 4) * 0.015;

    // 1. LEFT HAND FINGERS (Phase 0)
    for (let i = 0; i < 4; i++) {
      // Cascading anatomical delay across finger groups (Index -> Middle -> Ring -> Little)
      const fingerPhase = i * 0.35;
      const wave =
        Math.sin(time * 0.42 + fingerPhase) * 0.012 +
        baseCurl -
        relaxPulse +
        breathOffset * 0.04;

      const f = this.leftHandOffsets.fingers[i];
      f.proximalCurl = Math.max(0, wave);
      f.middleCurl = Math.max(0, wave * 1.15); // Middle phalanx couples slightly stronger
      f.distalCurl = Math.max(0, wave * 0.90);
      f.splay = (1.5 - i) * cfg.splayAmplitude * (1.0 + Math.sin(time * 0.2 + fingerPhase) * 0.2);
    }

    // Left Thumb Thenar Dynamics
    const leftThumbWave =
      Math.cos(time * 0.38) * cfg.thumbPitchFactor +
      Math.sin(time * 0.75) * 0.010 -
      relaxPulse * 0.5;
    this.leftHandOffsets.thumbPitch = leftThumbWave;
    this.leftHandOffsets.thumbYaw = -leftThumbWave * 0.65;

    // 2. RIGHT HAND FINGERS (Asymmetric phase offset = +2.4 rad)
    for (let i = 0; i < 4; i++) {
      const fingerPhase = i * 0.35 + 2.4;
      const wave =
        Math.sin(time * 0.38 + fingerPhase) * 0.012 +
        baseCurl * 0.92 - // Tiny asymmetry in resting tension
        relaxPulse +
        breathOffset * 0.035;

      const f = this.rightHandOffsets.fingers[i];
      f.proximalCurl = Math.max(0, wave);
      f.middleCurl = Math.max(0, wave * 1.12);
      f.distalCurl = Math.max(0, wave * 0.88);
      f.splay = (1.5 - i) * cfg.splayAmplitude * (1.0 + Math.cos(time * 0.22 + fingerPhase) * 0.2);
    }

    // Right Thumb Thenar Dynamics
    const rightThumbWave =
      Math.sin(time * 0.34 + 1.8) * cfg.thumbPitchFactor +
      Math.cos(time * 0.68 + 1.2) * 0.010 -
      relaxPulse * 0.5;
    this.rightHandOffsets.thumbPitch = rightThumbWave;
    this.rightHandOffsets.thumbYaw = rightThumbWave * 0.65;

    return {
      leftHand: this.leftHandOffsets,
      rightHand: this.rightHandOffsets,
    };
  }
}
