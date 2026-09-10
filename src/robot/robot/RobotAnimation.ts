import * as THREE from 'three';
import { RobotNodes } from './RobotProceduralFactory';
import { ROBOT_CONFIG } from '../config';

interface FingerJoints {
  baseRot: THREE.Euler;
  group: THREE.Group;
  midGroup?: THREE.Group;
  baseMidRotZ: number;
  dipGroup?: THREE.Group;
  baseDipRotZ: number;
  phase: number;
  speed: number;
  amplitude: number;
}

interface HandAnimationData {
  hand: THREE.Group;
  baseHandRot: THREE.Euler;
  thumb?: THREE.Group;
  baseThumbRot: THREE.Euler;
  fingers: FingerJoints[];
}

export class RobotAnimationSystem {
  private nodes: RobotNodes;
  private time: number = 0;

  // Blink state
  private nextBlinkTime: number = 3.5;
  private blinkProgress: number = 1.0;
  private isBlinking: boolean = false;

  private baseTorsoY: number;
  private baseHeadY: number;

  // Base shoulder & arm resting transforms
  private baseLeftShoulderY: number;
  private baseRightShoulderY: number;
  private baseLeftUpperArmRot: THREE.Euler;
  private baseRightUpperArmRot: THREE.Euler;
  private baseLeftForearmRot: THREE.Euler;
  private baseRightForearmRot: THREE.Euler;

  // Hand & Finger Articulation Data
  private leftHandData: HandAnimationData;
  private rightHandData: HandAnimationData;

  constructor(nodes: RobotNodes) {
    this.nodes = nodes;
    this.baseTorsoY = nodes.torso.position.y;
    this.baseHeadY = nodes.head.position.y;

    this.baseLeftShoulderY = nodes.leftShoulder.position.y;
    this.baseRightShoulderY = nodes.rightShoulder.position.y;
    this.baseLeftUpperArmRot = nodes.leftUpperArm.rotation.clone();
    this.baseRightUpperArmRot = nodes.rightUpperArm.rotation.clone();
    this.baseLeftForearmRot = nodes.leftForearm.rotation.clone();
    this.baseRightForearmRot = nodes.rightForearm.rotation.clone();

    const initHandData = (hand: THREE.Group, sideName: 'L' | 'R', isLeft: boolean): HandAnimationData => {
      const fingers: FingerJoints[] = [];
      const fingerNames = ['Index', 'Middle', 'Ring', 'Pinky'];
      fingerNames.forEach((fName, idx) => {
        const fingerGroup = hand.getObjectByName(`${fName}Finger_${sideName}`) as THREE.Group;
        if (fingerGroup) {
          const midGroup = hand.getObjectByName(`${fName}FingerMid_${sideName}`) as THREE.Group;
          const dipGroup = hand.getObjectByName(`${fName}FingerDip_${sideName}`) as THREE.Group;
          fingers.push({
            group: fingerGroup,
            baseRot: fingerGroup.rotation.clone(),
            midGroup,
            baseMidRotZ: midGroup ? midGroup.rotation.z : 0,
            dipGroup,
            baseDipRotZ: dipGroup ? dipGroup.rotation.z : 0,
            // Cascading anatomical phase delays across the 4 fingers for lifelike wave flex
            phase: idx * 0.50 + (isLeft ? 0 : 2.2),
            speed: 0.55 + idx * 0.08,
            amplitude: 0.12 - idx * 0.010, // Subtle, organic resting finger flex
          });
        }
      });

      const thumb = hand.getObjectByName(isLeft ? 'ThumbLeft' : 'ThumbRight') as THREE.Group;
      return {
        hand,
        baseHandRot: hand.rotation.clone(),
        thumb,
        baseThumbRot: thumb ? thumb.rotation.clone() : new THREE.Euler(),
        fingers,
      };
    };

    this.leftHandData = initHandData(nodes.leftHand, 'L', true);
    this.rightHandData = initHandData(nodes.rightHand, 'R', false);

    this.scheduleNextBlink();
  }

  private scheduleNextBlink(): void {
    const cfg = ROBOT_CONFIG;
    this.nextBlinkTime =
      this.time + cfg.blinkIntervalMin + Math.random() * (cfg.blinkIntervalMax - cfg.blinkIntervalMin);
  }

  private animateHandFingers(
    data: HandAnimationData,
    time: number,
    breathOffset: number,
    globalPhase: number,
    isLeft: boolean
  ): void {
    // Subtle natural periodic tension/settling cycle (gentle micro-stretch every ~8.5 seconds)
    const stretchCycle = Math.sin(time * 0.14 + globalPhase);
    const stretchPulse = Math.pow(Math.max(0, stretchCycle), 4) * 0.08;

    data.fingers.forEach((finger) => {
      // Dual-harmonic organic wave for natural, non-monotonous finger curling
      const wave =
        Math.sin(time * finger.speed + finger.phase) * finger.amplitude +
        Math.sin(time * finger.speed * 2.1 + finger.phase * 0.75) * (finger.amplitude * 0.30) -
        stretchPulse +
        breathOffset * 0.08;

      // Inward curl toward medial palm (Z rotation)
      const curlDelta = (isLeft ? 1 : -1) * wave;
      finger.group.rotation.z = finger.baseRot.z + curlDelta;

      // Subtle lateral splay (X rotation)
      const splayDelta = wave < 0 ? -wave * 0.03 : wave * 0.01;
      finger.group.rotation.x = finger.baseRot.x + splayDelta;

      // Intermediate phalanx (PIP) anatomical coupling
      if (finger.midGroup) {
        finger.midGroup.rotation.z = finger.baseMidRotZ + curlDelta * 1.05;
      }

      // Distal phalanx (DIP) fingertip curl
      if (finger.dipGroup) {
        finger.dipGroup.rotation.z = finger.baseDipRotZ + curlDelta * 0.85;
      }
    });

    // Opposable Thumb Multi-Axis Thenar Movement
    if (data.thumb) {
      const thumbWave =
        Math.cos(time * 0.44 + globalPhase) * 0.06 +
        Math.sin(time * 0.88 + globalPhase * 1.2) * 0.025 -
        stretchPulse * 0.5;

      data.thumb.rotation.x = data.baseThumbRot.x + thumbWave * 0.4;
      data.thumb.rotation.z = data.baseThumbRot.z + (isLeft ? thumbWave : -thumbWave) * 0.6;
    }
  }

  public update(
    deltaTime: number,
    reducedMotion: boolean = false,
    lookYaw: number = 0,
    lookPitch: number = 0
  ): void {
    this.time += deltaTime;
    const cfg = ROBOT_CONFIG;

    if (reducedMotion) {
      // In reduced motion mode, maintain baseline without sway
      return;
    }

    // 1. Idle Breathing on Torso & Shoulders (Anchored at waist, no floating in Y)
    const breathCycle = Math.sin(this.time * cfg.idleBreathingSpeed);
    const breathOffset = breathCycle * cfg.idleBreathingAmplitude;
    // Grounded firmly at baseTorsoY to eliminate floating
    this.nodes.torso.position.y = this.baseTorsoY;
    this.nodes.torso.scale.set(1.0 + breathOffset * 0.15, 1.0, 1.0 + breathOffset * 0.15);

    // Subtle shoulder breathing expansion
    this.nodes.leftShoulder.position.y = this.baseLeftShoulderY + breathOffset * 0.18;
    this.nodes.rightShoulder.position.y = this.baseRightShoulderY + breathOffset * 0.16;

    // 2. Idle Micro-Drift on Head
    const driftYaw = Math.sin(this.time * cfg.idleDriftSpeed * 0.7) * cfg.idleDriftAmplitude;
    this.nodes.head.position.x = driftYaw * 0.2;
    this.nodes.head.position.y = this.baseHeadY + breathOffset * 0.25;

    // 3. Natural Multi-Axis Arm, Wrist & Hand Movement
    // Left and right arms are independent and asymmetric with rich organic micro-motion

    // --- LEFT ARM & HAND ---
    const tL1 = this.time * 0.38;
    const tL2 = this.time * 0.58 + 0.6;
    const tL3 = this.time * 0.28 + 1.2;

    // Upper arm subtle respiratory sway
    this.nodes.leftUpperArm.rotation.x = this.baseLeftUpperArmRot.x + breathOffset * 0.05;

    // Forearm / elbow natural oscillation with breathing coupling
    const leftElbowDelta = Math.sin(tL1) * 0.016 + breathOffset * 0.06 + lookPitch * 0.02;
    this.nodes.leftForearm.rotation.x = this.baseLeftForearmRot.x + leftElbowDelta;

    // Wrist 3-axis natural articulation (pitch, roll, yaw) with respiratory coupling & gaze follow-through
    const leftWristPitch = Math.cos(tL2) * 0.022 + breathOffset * 0.08 - lookPitch * 0.02;
    const leftWristRoll = Math.sin(tL1 * 0.85) * 0.015 + lookYaw * 0.03;
    const leftWristYaw = Math.cos(tL3 * 0.90) * 0.012;
    this.nodes.leftHand.rotation.set(
      this.leftHandData.baseHandRot.x + leftWristPitch,
      this.leftHandData.baseHandRot.y + leftWristRoll,
      this.leftHandData.baseHandRot.z + leftWristYaw
    );

    // Organic cascading finger and thumb flexing
    this.animateHandFingers(this.leftHandData, this.time, breathOffset, 0, true);

    // --- RIGHT ARM & HAND ---
    const tR1 = this.time * 0.34 + 1.4;
    const tR2 = this.time * 0.50 + 2.2;
    const tR3 = this.time * 0.25 + 0.8;

    // Upper arm subtle respiratory sway
    this.nodes.rightUpperArm.rotation.x = this.baseRightUpperArmRot.x + breathOffset * 0.05;

    const rightElbowDelta = Math.cos(tR1) * 0.016 + breathOffset * 0.05 + lookPitch * 0.02;
    this.nodes.rightForearm.rotation.x = this.baseRightForearmRot.x + rightElbowDelta;

    const rightWristPitch = Math.sin(tR2) * 0.020 + breathOffset * 0.07 - lookPitch * 0.02;
    const rightWristRoll = Math.cos(tR1 * 0.80) * 0.014 + lookYaw * 0.03;
    const rightWristYaw = Math.sin(tR3 * 0.85) * 0.010;
    this.nodes.rightHand.rotation.set(
      this.rightHandData.baseHandRot.x + rightWristPitch,
      this.rightHandData.baseHandRot.y + rightWristRoll,
      this.rightHandData.baseHandRot.z + rightWristYaw
    );

    // Organic cascading finger and thumb flexing
    this.animateHandFingers(this.rightHandData, this.time, breathOffset, 2.8, false);

    // 4. Eye Blink System
    if (this.time >= this.nextBlinkTime && !this.isBlinking) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += deltaTime / cfg.blinkDuration;
      if (this.blinkProgress >= 1.0) {
        this.blinkProgress = 1.0;
        this.isBlinking = false;
        this.scheduleNextBlink();
      }

      // Smooth blink dip curve
      const eyeScaleY = Math.max(0.08, Math.sin(this.blinkProgress * Math.PI));
      const scaleValue = 1.0 - (1.0 - 0.08) * (1.0 - Math.abs(this.blinkProgress * 2 - 1));
      this.nodes.eyeLeft.scale.y = scaleValue;
      this.nodes.eyeRight.scale.y = scaleValue;
      this.nodes.visorLightBar.scale.y = Math.max(0.2, scaleValue);
    } else {
      this.nodes.eyeLeft.scale.y = 1.0;
      this.nodes.eyeRight.scale.y = 1.0;
      this.nodes.visorLightBar.scale.y = 1.0;
    }

    // 4. Subtle LED Pulse
    const pulseT = (Math.sin(this.time * 1.8) + 1) * 0.5; // [0, 1]
    const [minInt, maxInt] = cfg.materials.emissivePulseRange;
    const currentIntensity = minInt + pulseT * (maxInt - minInt);

    if (this.nodes.materials) {
      const mats = this.nodes.materials as any;
      if (mats.chestGlow && 'emissiveIntensity' in mats.chestGlow) {
        mats.chestGlow.emissiveIntensity = currentIntensity * 1.25;
      }
      if (mats.earRingGlow && 'emissiveIntensity' in mats.earRingGlow) {
        mats.earRingGlow.emissiveIntensity = currentIntensity * 1.1;
      }
      if (mats.eyeGlow && 'emissiveIntensity' in mats.eyeGlow) {
        mats.eyeGlow.emissiveIntensity = currentIntensity;
      }
      if (mats.accentGlow && 'emissiveIntensity' in mats.accentGlow) {
        mats.accentGlow.emissiveIntensity = currentIntensity * 0.9;
      }
    }
  }
}
