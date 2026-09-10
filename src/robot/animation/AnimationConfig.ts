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
    // Physical joint limits (in radians)
    headYawLimit: (18 * Math.PI) / 180,       // ~±18°
    headPitchLimit: (10 * Math.PI) / 180,     // ~±10°
    headRollLimit: (4 * Math.PI) / 180,       // ~±4°

    // Hierarchical response ratios (Head leads, body follows progressively less)
    headRatio: 1.0,                           // 100%
    neckRatio: 0.28,                          // 28% (range 25-35%)
    shouldersRatio: 0.12,                     // 12% (range 10-15%)
    chestRatio: 0.055,                        // 5.5% (range 4-7%)
    waistRatio: 0.020,                        // 2.0% (range 1-3%)

    // Damping and spring smoothing (critically damped, zero jitter)
    headDamping: 6.2,
    neckDamping: 5.4,
    bodyDamping: 4.2,
    speedThreshold: 1.2,
    speedAnticipation: 0.12,
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
  // 3. ARM POSTURES & PARTIAL FOLD (1/3 to 2/3 fold)
  // ==========================================
  arm: {
    // Poses with natural resting flexion (in radians):
    // Flexion is negative rotation around X-axis (-0.26 to -0.61 rad, i.e. ~ -15° to -35°)
    poses: {
      poseA: {
        name: 'PoseA_RightDominant',
        leftElbow: -0.35,                     // ~ -20° forward flexion
        rightElbow: -0.52,                    // ~ -30° forward flexion
        leftUpperPitch: -0.10,
        rightUpperPitch: -0.08,
        leftUpperRoll: -0.06,
        rightUpperRoll: 0.07,
      },
      poseB: {
        name: 'PoseB_LeftDominant',
        leftElbow: -0.52,                     // ~ -30° forward flexion
        rightElbow: -0.35,                    // ~ -20° forward flexion
        leftUpperPitch: -0.08,
        rightUpperPitch: -0.10,
        leftUpperRoll: -0.07,
        rightUpperRoll: 0.06,
      },
      poseC: {
        name: 'PoseC_Balanced',
        leftElbow: -0.44,                     // ~ -25° forward flexion
        rightElbow: -0.44,                    // ~ -25° forward flexion
        leftUpperPitch: -0.09,
        rightUpperPitch: -0.09,
        leftUpperRoll: -0.065,
        rightUpperRoll: 0.065,
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
    pitchLimit: (4.0 * Math.PI) / 180,        // ±4°
    rollLimit: (3.0 * Math.PI) / 180,         // ±3°
    yawLimit: (2.5 * Math.PI) / 180,          // ±2.5°
    cursorReactFactor: 0.015,
    damping: 5.0,
  },

  // ==========================================
  // 5. HAND & COORDINATED FINGER MICRO-ANIMATION
  // ==========================================
  hand: {
    // Subtle curl range: 0° -> 2° -> 4° -> 1° over several seconds
    minCurl: 0.0,
    maxCurl: (4.5 * Math.PI) / 180,           // ~4.5°
    cycleSpeed: 0.28,                         // Slow periodic cycle (~22s full cycle)
    splayAmplitude: 0.008,
    // Thumb thenar multi-axis kinematics
    thumbPitchFactor: 0.024,
    thumbYawFactor: 0.018,
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
