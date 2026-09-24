/**
 * Centralized Configuration Constants for the Production-Grade Robot Animation System.
 * Adheres strictly to Master Animation Specification:
 * - Damped spring interpolation constants
 * - Exact hierarchical look-at distribution ratios (Head 100% -> Neck 28% -> Shoulders 12% -> Chest 5.5% -> Waist 2%)
 * - Asymmetric mechanical shoulder response factors
 * - Partial-fold arm resting postures (Poses A, B, C)
 * - Coordinated finger curling & thumb thenar kinematics
 * - 8-Layer asynchronous idle frequencies & environmental floating
 * - Reduced-motion accessibility limits
 */

export const ANIMATION_CONFIG = {
  // ==========================================
  // 1. CURSOR TRACKING & HIERARCHICAL LOOK
  // ==========================================
  look: {
    // Physical joint limits (in radians) - wide natural humanoid range
    headYawLimit: (38 * Math.PI) / 180,       // ~±38° total local turn
    headPitchLimit: (26 * Math.PI) / 180,     // ~±26° downward pitch
    headPitchUpLimit: (18 * Math.PI) / 180,   // ~±18° upward pitch
    headRollLimit: (5 * Math.PI) / 180,       // ~±5° organic lateral tilt

    // Soft-knee linear thresholds (100% 1:1 direct tracking up to knee, smooth tanh compression beyond)
    yawKnee: (26 * Math.PI) / 180,            // 26° linear zone
    pitchDownKnee: (16 * Math.PI) / 180,      // 16° linear zone downward
    pitchUpKnee: (12 * Math.PI) / 180,        // 12° linear zone upward

    // Hierarchical response ratios (Head leads 72%, Neck follows 22%, Chest follows 6% -> Exact 100% sum)
    headRatio: 0.72,                          // 72%
    neckRatio: 0.22,                          // 22%
    chestRatio: 0.06,                         // 6%
    shouldersRatio: 0.10,                     // 10%
    waistRatio: 0.02,                         // 2%

    // Damping and spring smoothing (responsive, fluid, critically damped, zero jitter)
    headDamping: 8.5,
    neckDamping: 6.8,
    bodyDamping: 4.8,
    speedThreshold: 1.0,
    speedAnticipation: 0.08,
  },

  // ==========================================
  // 2. ASYMMETRIC MECHANICAL SHOULDER RESPONSE
  // ==========================================
  shoulder: {
    yawFactor: 0.028,                         // Subtle mechanical yaw reaction
    pitchFactor: 0.020,                       // Asymmetric pitch reaction (opposite side tilts)
    zReaction: 0.025,                         // Longitudinal shift (backward / forward)
    maxTravel: 0.035,                         // Mechanical hard limit
    smoothing: 4.5,
  },

  // ==========================================
  // 3. ARM POSTURES & PARTIAL FOLD
  // ==========================================
  arm: {
    // Poses with natural resting subtle flexion matching reference image:
    // Upper arms slope forward ~7.5 deg with natural lateral clearing roll (-0.038 / +0.038 rad)
    // and subtle natural elbow flexion bend of ~ -16.0 deg (-0.28 rad, 10°–20° spec)
    poses: {
      poseA: {
        name: 'PoseA_RightDominant',
        leftElbow: -0.28,                     // ~ -16.0 deg subtle flexion bend (10°–20° spec)
        rightElbow: -0.28,
        leftUpperPitch: -0.13,                // ~ -7.45 deg forward pitch (0°–10° spec)
        rightUpperPitch: -0.13,
        leftUpperRoll: -0.038,                // natural lateral clearing angle (outward)
        rightUpperRoll: 0.038,
      },
      poseB: {
        name: 'PoseB_LeftDominant',
        leftElbow: -0.30,                     // subtle organic variation (-17.2 deg)
        rightElbow: -0.26,                     // subtle organic variation (-14.9 deg)
        leftUpperPitch: -0.14,
        rightUpperPitch: -0.12,
        leftUpperRoll: -0.035,
        rightUpperRoll: 0.040,
      },
      poseC: {
        name: 'PoseC_Balanced',
        leftElbow: -0.28,
        rightElbow: -0.28,
        leftUpperPitch: -0.13,
        rightUpperPitch: -0.13,
        leftUpperRoll: -0.038,
        rightUpperRoll: 0.038,
      },
    },
    poseIntervalMin: 14.0,                    // Infrequent pose transitions (seconds)
    poseIntervalMax: 22.0,
    transitionDuration: 4.5,                  // Extremely slow and smooth S-curve blend
  },

  // ==========================================
  // 4. WRIST STABILIZATION & MICRO-REACTION
  // ==========================================
  wrist: {
    pitchLimit: (4.0 * Math.PI) / 180,        // +/- 4 deg
    rollLimit: (3.0 * Math.PI) / 180,         // +/- 3 deg
    yawLimit: (2.5 * Math.PI) / 180,          // +/- 2.5 deg
    cursorReactFactor: 0.015,
    damping: 5.0,
  },

  // ==========================================
  // 5. HAND & COORDINATED FINGER MICRO-ANIMATION
  // ==========================================
  hand: {
    // Subtle curl range: fingers stay relaxed and hanging straight down
    minCurl: 0.0,
    maxCurl: (2.0 * Math.PI) / 180,           // ~2.0° subtle micro-motion
    cycleSpeed: 0.28,                         // Slow periodic cycle (~22s full cycle)
    splayAmplitude: 0.004,
    // Thumb thenar subtle micro-kinematics
    thumbPitchFactor: 0.012,
    thumbYawFactor: 0.008,
  },

  // ==========================================
  // 6. ABDOMEN / WAIST MECHANICAL SUSPENSION
  // ==========================================
  waist: {
    upperSegmentPitch: (0.5 * Math.PI) / 180, // +0.5°
    middleSegmentPitch: (0.3 * Math.PI) / 180,// +0.3°
    lowerSegmentPitch: (-0.2 * Math.PI) / 180,// -0.2°
    waistRingPitch: (-0.3 * Math.PI) / 180,   // -0.3°
    cycleSpeed: 0.48,                         // Asynchronous mechanical frequency
  },

  // ==========================================
  // 7. ENVIRONMENTAL FLOATING SUSPENSION
  // ==========================================
  floating: {
    amplitude: 0.0065,                        // ±0.0065 world units (gentle, stable suspension)
    speed: 0.68,                              // Slow sine cycle (~9.2s period)
    tiltAmplitude: 0.003,                     // Micro pitch/roll tilt
  },

  // ==========================================
  // 8. VISOR & EMISSIVE INTERACTION RESPONSE
  // ==========================================
  emissive: {
    baseIntensity: 2.2,
    activeIntensity: 2.65,
    responseSpeed: 3.5,
    pulseSpeed: 1.6,
    pulseAmplitude: 0.25,
  },

  // ==========================================
  // 9. BLINK SYSTEM
  // ==========================================
  blink: {
    intervalMin: 4.0,
    intervalMax: 8.5,
    duration: 0.16,
  },

  // ==========================================
  // 10. REDUCED MOTION LIMITS
  // ==========================================
  reducedMotion: {
    scale: 0.20,
    disableFloating: true,
  },
};
