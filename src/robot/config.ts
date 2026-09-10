export interface RobotConfig {
  // Kinematic Angular Limits (in radians)
  headYawLimit: number;        // Horizontal rotation limit (~±25°)
  headPitchLimit: number;      // Vertical rotation limit (~±15°)
  headRollLimit: number;       // Subtle tilt limit (~±6°)
  
  // Damping & Inertia (larger = faster, smaller = smoother lag)
  headDamping: number;
  eyeDamping: number;
  neckFollowStrength: number;
  torsoFollowStrength: number;
  shoulderFollowStrength: number;

  // Eye Tracking System
  eyeGazeRangeX: number;       // Horizontal displacement of digital eyes
  eyeGazeRangeY: number;       // Vertical displacement of digital eyes

  // Dynamic Cursor Speed Anticipation
  cursorSpeedThreshold: number;
  cursorSpeedAnticipation: number;

  // Secondary Idle Animations
  idleBreathingSpeed: number;
  idleBreathingAmplitude: number;
  idleDriftSpeed: number;
  idleDriftAmplitude: number;
  blinkIntervalMin: number;
  blinkIntervalMax: number;
  blinkDuration: number;

  // PBR Material Visual Tunings
  colors: {
    armorWhite: number;
    jointDark: number;
    visorGlass: number;
    eyeBlue: number;
    earRingViolet: number;
    chestLogoViolet: number;
    accentSeamViolet: number;
    studioFloor: number;
  };
  materials: {
    armorRoughness: number;
    armorMetalness: number;
    armorClearcoat: number;
    armorClearcoatRoughness: number;
    jointRoughness: number;
    jointMetalness: number;
    visorTransmission: number;
    visorRoughness: number;
    visorMetalness: number;
    emissiveIntensity: number;
    emissivePulseRange: [number, number];
  };

  // Performance & Rendering
  maxPixelRatio: number;
  shadowMapSize: number;
}

export const ROBOT_CONFIG: RobotConfig = {
  headYawLimit: (22 * Math.PI) / 180,    // ±22 degrees (constrained per spec)
  headPitchLimit: (11 * Math.PI) / 180,  // ±11 degrees (subtle vertical look)
  headRollLimit: (5 * Math.PI) / 180,    // ±5 degrees (subtle mechanical tilt)

  headDamping: 5.2,                      // Smooth mechanical damping
  eyeDamping: 8.5,                       // Eyes dart and focus ahead
  neckFollowStrength: 0.32,              // Neck carries 32% of head yaw
  torsoFollowStrength: 0.14,             // Subtle follow-through on torso
  shoulderFollowStrength: 0.08,          // Subtle shoulder reaction

  eyeGazeRangeX: 0.008,                  // Clamped tightly within visor width
  eyeGazeRangeY: 0.006,                  // Clamped tightly within visor height

  cursorSpeedThreshold: 1.2,
  cursorSpeedAnticipation: 0.22,

  idleBreathingSpeed: 1.4,
  idleBreathingAmplitude: 0.018,
  idleDriftSpeed: 0.8,
  idleDriftAmplitude: 0.008,
  blinkIntervalMin: 3.5,
  blinkIntervalMax: 7.0,
  blinkDuration: 0.16,

  colors: {
    armorWhite: 0xf3f5fa,                // Premium clean automotive white
    jointDark: 0x14161c,                 // Anodized dark titanium
    visorGlass: 0x060810,                // Deep tinted glossy polycarbonate
    eyeBlue: 0x38bdf8,                   // Cyan-blue digital HUD glow
    earRingViolet: 0x8b5cf6,             // Ultraviolet circular sensor glow
    chestLogoViolet: 0xa855f7,           // Neon violet chest 'A' crest
    accentSeamViolet: 0x7c3aed,          // Subtle edge seam emissive
    studioFloor: 0x030014,               // Matches Innovex cosmos background
  },

  materials: {
    armorRoughness: 0.18,
    armorMetalness: 0.06,
    armorClearcoat: 0.95,
    armorClearcoatRoughness: 0.12,
    jointRoughness: 0.38,
    jointMetalness: 0.88,
    visorTransmission: 0.35,
    visorRoughness: 0.05,
    visorMetalness: 0.15,
    emissiveIntensity: 3.2,
    emissivePulseRange: [2.6, 3.8],
  },

  maxPixelRatio: 2.0,
  shadowMapSize: 1024,
};
