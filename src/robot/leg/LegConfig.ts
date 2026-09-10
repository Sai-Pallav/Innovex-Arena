import * as THREE from 'three';

/**
 * Master Geometric & Kinematic Configuration for the Procedural Robot Legs & Feet Assembly.
 * Proportioned for an athletic, heroic humanoid mecha aesthetic matching the torso, head, and arms.
 */
export const LEG_CONFIG = {
  // =========================================================================
  // 1. ANATOMICAL SEGMENT LENGTHS & RADII
  // =========================================================================
  hip: {
    // Offset from hip connection pivot down to the thigh rotation center
    yOffset: -0.038,
    gimbalRadius: 0.024,
    collarRadius: 0.027,
    collarHeight: 0.018,
    accentRingRadius: 0.021,
    actuator: {
      mountX: 0.028,
      mountY: 0.016,
      mountZ: 0.014,
      cylinderRadius: 0.0055,
      pistonRadius: 0.0034,
      length: 0.052,
    },
  },

  thigh: {
    // Upper leg length from hip joint to knee joint center
    length: 0.320,
    upperRadius: 0.046,
    lowerRadius: 0.038,
    // Armor plate contours
    anteriorArmor: {
      widthTop: 0.076,
      widthBottom: 0.058,
      thickness: 0.016,
      creaseAngle: 0.14,
    },
    lateralArmor: {
      width: 0.048,
      thickness: 0.014,
      cowlLength: 0.220,
    },
    skeletonRadius: 0.018,
    ledStrip: {
      width: 0.0032,
      depth: 0.003,
      length: 0.240,
    },
    rearDamper: {
      cylinderRadius: 0.006,
      pistonRadius: 0.0038,
      mountY: -0.070,
      mountZ: -0.032,
      targetY: -0.270,
      targetZ: -0.024,
    },
  },

  knee: {
    // Rotary hinge condyle discs
    discRadius: 0.026,
    discWidth: 0.014,
    outerDiscSpacing: 0.072,
    accentRingRadius: 0.020,
    centerCapRadius: 0.017,
    centralAxleRadius: 0.0075,
    centralAxleLength: 0.076,
    // Floating patellar knee cap shield
    patella: {
      width: 0.046,
      height: 0.058,
      thickness: 0.014,
      offsetZ: 0.034,
      yOffset: 0.004,
    },
  },

  shin: {
    // Lower leg length from knee joint to ankle joint center
    length: 0.330,
    upperRadius: 0.042,
    lowerRadius: 0.030,
    anteriorKeel: {
      widthTop: 0.056,
      widthBottom: 0.036,
      thickness: 0.022,
      keelProtrusion: 0.018,
    },
    posteriorCalf: {
      width: 0.058,
      height: 0.170,
      depth: 0.042,
      ventCount: 4,
      ventWidth: 0.034,
      ventHeight: 0.0045,
    },
    skeletonRadius: 0.015,
    ledStrip: {
      width: 0.0028,
      depth: 0.0025,
      length: 0.260,
    },
  },

  ankle: {
    // Multi-axis spherical gimbal ankle
    housingRadius: 0.020,
    malleolusDiscRadius: 0.018,
    malleolusDiscWidth: 0.006,
    accentRingRadius: 0.014,
    achillesDamper: {
      cylinderRadius: 0.005,
      pistonRadius: 0.0032,
      mountY: 0.060,
      mountZ: -0.028,
      targetY: -0.015,
      targetZ: -0.048,
    },
  },

  foot: {
    // Athletic robotic foot dimensions
    length: 0.160,
    width: 0.064,
    height: 0.055,
    heelOffset: -0.048,
    toeOffset: 0.112,
    soleThickness: 0.014,
    treadPadsCount: 5,
    underglow: {
      width: 0.0035,
      height: 0.003,
      inset: 0.004,
    },
    dorsalPlate: {
      width: 0.052,
      length: 0.090,
      thickness: 0.012,
    },
    toeCap: {
      width: 0.056,
      length: 0.042,
      height: 0.028,
    },
    heelThruster: {
      radius: 0.010,
      depth: 0.012,
    },
  },

  // =========================================================================
  // 2. KINEMATIC ROTATION LIMITS (Radians)
  // =========================================================================
  limits: {
    hip: {
      pitchMin: -0.70, // Kick forward (~40°)
      pitchMax: 0.35,  // Extend backward (~20°)
      yawMin: -0.25,   // Inward rotation
      yawMax: 0.35,    // Outward rotation
      rollMin: -0.20,  // Adduction
      rollMax: 0.40,   // Abduction (~23°)
    },
    knee: {
      pitchMin: 0.0,   // Full extension
      pitchMax: 2.10,  // Deep flexion (~120°)
    },
    ankle: {
      pitchMin: -0.45, // Dorsiflexion (toes up ~25°)
      pitchMax: 0.60,  // Plantarflexion (toes down ~35°)
      rollMin: -0.22,  // Inversion
      rollMax: 0.22,   // Eversion
    },
    toe: {
      pitchMin: -0.05,
      pitchMax: 0.50,  // Toe hinge flex
    },
  },

  // =========================================================================
  // 3. DEFAULT REST / HEROIC STANDING STANCE
  // =========================================================================
  stance: {
    // Natural heroic standing stance: slight outward hip flare, soft knee flex, level feet
    hipPitch: -0.04,
    hipRoll: 0.05,     // Slight lateral stance (~3°)
    hipYaw: 0.03,      // Slight outward toe flare
    kneePitch: 0.08,   // Subtle organic knee flex (~4.5°)
    anklePitch: -0.04, // Compensates knee flex to keep sole parallel with ground
    ankleRoll: -0.05,  // Compensates hip roll for flush ground contact
  },
};
