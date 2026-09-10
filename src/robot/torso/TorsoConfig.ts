/**
 * Centralized dimensions, proportions, and mechanical constants for the procedural Robot Torso.
 * Adheres strictly to the Detailed Wireframe Reference Sheet & Critical Refinement Specification:
 *
 * Mechanical Spine & Articulated Taper Profile:
 * Chest Bottom -> Upper Connector (0.120) -> Segment 01 (0.116) -> Segment 02 (0.106)
 *              -> Segment 03 (0.096) -> Segment 04 (0.088 - NARROWEST WAIST REGION)
 *              -> Lower Connector (0.092) -> Upper Waist Collar (0.098)
 *              -> Waist Core (0.085) -> Lower Waist Collar (0.104) -> Hip Connectors (0.124)
 */

export interface StomachRingSpec {
  name: string;
  radiusX: number;
  radiusZ: number;
  height: number;
  thickness: number;
  yOffset: number;
  frontWidth: number;
  isNarrowest?: boolean;
}

export const TORSO_CONFIG = {
  // Proportions per Reference Image
  proportions: {
    chestPercent: 0.55,
    waistPercent: 0.45,
  },

  // Total torso coordinate bounds
  totalHeight: 0.72,
  baseY: 0.12, // Anchor position in RobotRoot

  // Chest Assembly Dimensions (~55% of height)
  chest: {
    width: 0.38,
    height: 0.36,
    depth: 0.23,
    frontPlateThickness: 0.032,
    collarRadius: 0.068,
    collarY: 0.114,
    collarZ: 0.008,
    shoulderMountX: 0.205, // Seats RobotArm pauldron & rotary joint against chest
    shoulderMountY: 0.065,
    shoulderMountZ: 0.018,
    shoulderMountRadius: 0.058,
    logoWidth: 0.054,
    logoHeight: 0.062,
    logoDepth: 0.006,
  },

  // Abdomen & Stomach Section: Central Mechanical Spine + 5 Articulated Armor Segments
  stomach: {
    height: 0.30,
    ringCount: 5,
    internalSpineRadius: 0.034,
    internalSpineHeight: 0.26,

    // Upper Connector receiving chest sternal mount
    upperConnector: {
      widthX: 0.112,
      depthZ: 0.082,
      height: 0.016,
      yOffset: -0.104,
    },

    // 5 Distinct Articulated Abdominal Segments (Progressive Taper, Articulated Joints)
    rings: [
      // Segment 01 (Top): Seated snugly into chest sternal brackets
      { name: 'segment01', radiusX: 0.116, radiusZ: 0.086, height: 0.022, thickness: 0.016, yOffset: -0.114, frontWidth: 0.138 },
      // Segment 02: Tucks under Segment 01, reveals mechanical joint in gap
      { name: 'segment02', radiusX: 0.108, radiusZ: 0.080, height: 0.021, thickness: 0.015, yOffset: -0.136, frontWidth: 0.126 },
      // Segment 03: Mid athletic contour
      { name: 'segment03', radiusX: 0.100, radiusZ: 0.075, height: 0.020, thickness: 0.015, yOffset: -0.157, frontWidth: 0.114 },
      // Segment 04: Lower athletic contour
      { name: 'segment04', radiusX: 0.092, radiusZ: 0.070, height: 0.019, thickness: 0.014, yOffset: -0.177, frontWidth: 0.102 },
      // Segment 05: Narrowest athletic segment, transitions directly into waist collar
      { name: 'segment05', radiusX: 0.085, radiusZ: 0.066, height: 0.018, thickness: 0.014, yOffset: -0.196, frontWidth: 0.092, isNarrowest: true },
    ] as StomachRingSpec[],

    // Lower Connector distributing load into waist
    lowerConnector: {
      widthX: 0.084,
      depthZ: 0.066,
      height: 0.014,
      yOffset: -0.212,
    },
    lowerAbdomen: {
      widthX: 0.084,
      depthZ: 0.066,
      height: 0.014,
      yOffset: -0.212,
    },

    // Side structural support rails flanking the abdomen
    sideRails: {
      bracketX: 0.096,
      thickness: 0.006,
      depth: 0.010,
    },
  },

  // Compact Mechanical Waist Core (Priority 3)
  waist: {
    height: 0.12,
    // 1. Primary Upper Waist Collar
    upperWaistRing: {
      radiusX: 0.084,
      radiusZ: 0.065,
      height: 0.014,
      yOffset: -0.226,
    },
    // 2. Compact Central Rotational Core
    waistCore: {
      upperRadius: 0.070,
      lowerRadius: 0.076,
      height: 0.020,
      yOffset: -0.244,
      innerBoreRadius: 0.034,
    },
    // 3. Lower Waist Collar
    lowerWaistRing: {
      radiusX: 0.086,
      radiusZ: 0.066,
      height: 0.014,
      yOffset: -0.260,
    },
    // 4. Compact Functional Hip Connectors (Priority 4)
    hipConnector: {
      mountX: 0.096,
      mountY: -0.268,
      mountZ: 0.004,
      hubRadius: 0.020,
      hubWidth: 0.016,
      accentRingRadius: 0.015,
    },
    // 5. Waist Hydraulic / Linear Stabilization Actuators
    actuator: {
      mountX: 0.058,
      mountY: -0.222,
      mountZ: 0.024,
      targetX: 0.076,
      targetY: -0.260,
      targetZ: 0.016,
      cylinderRadius: 0.0055,
      pistonRadius: 0.0034,
    },

    // Backward compatibility aliases
    upperCollarRadius: 0.098,
    rotationalRingRadius: 0.104,
    coreRadius: 0.088,
    pelvisRadius: 0.104,
    hipCowlX: 0.124,
    hipCowlY: -0.352,
    hipCowlZ: 0.005,
  },

  // Motion limits for subtle robotic articulation
  limits: {
    chestPitch: 0.045, // ±2.5 deg
    chestYaw: 0.055,   // ±3.1 deg
    chestRoll: 0.030,  // ±1.7 deg
    abdomenBend: 0.020,
    waistPitch: 0.055, // ±3.1 deg
    waistYaw: 0.075,   // ±4.3 deg
    waistRoll: 0.040,  // ±2.3 deg
  },
};
