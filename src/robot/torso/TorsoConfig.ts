/**
 * Centralized dimensions, proportions, and mechanical constants for the procedural Robot Torso.
 * Adheres strictly to the Master Engineering Reference Blueprint:
 *
 * Dimensions (Reference):
 * - Chest Width: 320 mm (0.320)
 * - Torso Height: 280 mm (0.280)
 * - Abdomen Height: 140 mm (0.140)
 * - Waist Height: 80 mm (0.080)
 * - Pelvis Width: 260 mm (0.260)
 * - Torso Depth: 220 mm (0.220)
 *
 * 3-Segment Articulated Spine (Consistent cylindrical/central core width):
 * - Vertebra 01: y = -0.082, w = 0.078
 * - Vertebra 02: y = -0.118, w = 0.076
 * - Vertebra 03: y = -0.154, w = 0.074
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
  // Proportions per Reference Blueprint
  proportions: {
    chestPercent: 0.52,
    waistPercent: 0.48,
  },

  // Total torso coordinate bounds
  totalHeight: 0.72,
  baseY: 0.12, // Anchor position in RobotRoot

  // Chest Assembly Dimensions (360 mm width, 220 mm depth — expanded upper chest)
  chest: {
    width: 0.360,
    height: 0.310,
    depth: 0.220,
    frontPlateThickness: 0.026,
    collarRadius: 0.072,
    collarY: 0.080,
    collarZ: 0.008,
    shoulderMountX: 0.210, // Wider shoulder span matching expanded clavicle
    shoulderMountY: 0.052,
    shoulderMountZ: 0.015,
    shoulderMountRadius: 0.056,
    logoWidth: 0.050,
    logoHeight: 0.056,
    logoDepth: 0.006,
  },

  // Abdomen & Spine Section: 4 Articulated Vertebral Modules + Bilateral Actuators
  stomach: {
    height: 0.140, // 140 mm per blueprint
    vertebraCount: 3,
    vertebraY: [-0.100, -0.136, -0.172] as const,
    vertebraWidth: 0.088,
    vertebraHeight: 0.022,
    vertebraDepth: 0.050,
    internalSpineRadius: 0.018,
    internalSpineHeight: 0.135,

    // Upper Connector receiving chest sternal mount
    upperConnector: {
      widthX: 0.114,
      depthZ: 0.080,
      height: 0.014,
      yOffset: -0.042,
    },

    // 3 Articulated Vertebrae Specifications
    rings: [
      { name: 'vertebra01', radiusX: 0.046, radiusZ: 0.028, height: 0.022, thickness: 0.011, yOffset: -0.100, frontWidth: 0.096 },
      { name: 'vertebra02', radiusX: 0.044, radiusZ: 0.028, height: 0.022, thickness: 0.011, yOffset: -0.136, frontWidth: 0.092 },
      { name: 'vertebra03', radiusX: 0.040, radiusZ: 0.026, height: 0.022, thickness: 0.011, yOffset: -0.172, frontWidth: 0.084 },
    ] as StomachRingSpec[],

    // 3 Identical Tiered Trapezoidal Armor Plates with 10mm gaps matching reference image
    armorPlates: [
      { width: 0.118, height: 0.026, depth: 0.018, y: -0.100, z: 0.040 }, // Plate 01: Sub-sternal arch, wide trapezoid
      { width: 0.096, height: 0.026, depth: 0.017, y: -0.136, z: 0.038 }, // Plate 02: Mid-abdomen, identical trapezoid
      { width: 0.078, height: 0.026, depth: 0.016, y: -0.172, z: 0.036 }, // Plate 03: Lower abdomen, identical trapezoid
    ] as const,

    // Backward compatibility aliases
    upperArmor: {
      width: 0.118,
      height: 0.026,
      depth: 0.018,
      y: -0.082,
      z: 0.040,
    },
    lowerArmor: {
      width: 0.078,
      height: 0.026,
      depth: 0.016,
      y: -0.154,
      z: 0.036,
    },

    // Lower Connector distributing load into waist
    lowerConnector: {
      widthX: 0.080,
      depthZ: 0.052,
      height: 0.014,
      yOffset: -0.209,
    },
    lowerAbdomen: {
      widthX: 0.080,
      depthZ: 0.052,
      height: 0.014,
      yOffset: -0.209,
    },

    // Side Actuator Mounting Coordinates
    actuator: {
      upperMount: { x: 0.096, y: -0.055, z: 0.016 },
      lowerMount: { x: 0.074, y: -0.203, z: 0.010 },
      upperX: 0.096,
      upperY: -0.046,
      upperZ: 0.016,
      lowerX: 0.074,
      lowerY: -0.203,
      lowerZ: 0.010,
      cylinderRadius: 0.0106,
      pistonRadius: 0.0058,
    },

    // Dual Side Actuators per side (Outer angled hydraulic + Inner crossed stabilizer)
    dualActuators: {
      outer: {
        upperMount: { x: 0.096, y: -0.046, z: 0.016 },
        lowerMount: { x: 0.074, y: -0.203, z: 0.010 },
        cylinderRadius: 0.0106,
        pistonRadius: 0.0058,
      },
      inner: {
        upperMount: { x: 0.076, y: -0.052, z: 0.006 },
        lowerMount: { x: 0.054, y: -0.203, z: 0.014 },
        cylinderRadius: 0.0078,
        pistonRadius: 0.0048,
      },
    },

    // Multi-Column Kinematic Actuator & Stabilizer Array (Matching Reference: "WAIST INTERNAL STRUCTURE")
    actuatorArray: {
      frontLinear: {
        upperMount: { x: 0.096, y: -0.046, z: 0.016 },
        lowerMount: { x: 0.074, y: -0.203, z: 0.010 },
        cylinderRadius: 0.0106,
        pistonRadius: 0.0058,
        powerCoreLength: 0.026,
      },
      midStabilizer: {
        upperMount: { x: 0.076, y: -0.090, z: 0.002 },
        lowerMount: { x: 0.062, y: -0.205, z: 0.000 },
        columnRadius: 0.0068,
        collarRadius: 0.0092,
      },
      rearLinear: {
        upperMount: { x: 0.076, y: -0.052, z: 0.006 },
        lowerMount: { x: 0.054, y: -0.203, z: 0.014 },
        cylinderRadius: 0.0078,
        pistonRadius: 0.0048,
        powerCoreLength: 0.030,
      },
    },

    // Reference Actuator Specifications (Replicating media_1789199822492.png, media_1789199822498.png, media_1789199822501.png)
    referenceActuators: {
      outerAngled: {
        upperMount: { x: 0.106, y: -0.034, z: 0.016 },
        lowerMount: { x: 0.082, y: -0.200, z: 0.010 },
        cylinderRadius: 0.0092,
        pistonRadius: 0.0055,
        socketRadius: 0.0095,
        socketHeight: 0.012,
      },
      innerGlowing: {
        upperMount: { x: 0.052, y: -0.046, z: -0.006 },
        lowerMount: { x: 0.050, y: -0.198, z: -0.006 },
        cylinderRadius: 0.0084,
        glowingCoreRadius: 0.0076,
        glowingCoreLength: 0.042,
        pistonRadius: 0.0050,
        socketRadius: 0.0088,
        socketHeight: 0.012,
      },
      segmentedSpine: {
        discCount: 5,
        discRadius: 0.029,
        discHeight: 0.018,
        damperHeight: 0.006,
        damperRadius: 0.025,
        yStart: -0.058,
        yStep: 0.028,
      },
    },
  },

  // Rotational Waist Bearing Core (80 mm height per blueprint)
  waist: {
    height: 0.080,
    // 1. Primary Upper Waist Collar
    upperWaistRing: {
      radiusX: 0.084,
      radiusZ: 0.065,
      height: 0.014,
      yOffset: -0.221,
    },
    // 2. Rotational Bearing Turntable Core
    waistCore: {
      upperRadius: 0.070,
      lowerRadius: 0.076,
      height: 0.022,
      yOffset: -0.237,
      innerBoreRadius: 0.032,
    },
    // 3. Lower Waist Collar
    lowerWaistRing: {
      radiusX: 0.086,
      radiusZ: 0.066,
      height: 0.014,
      yOffset: -0.251,
    },
    // 4. Functional Hip Connectors & Pelvis Interface (260 mm pelvis width)
    hipConnector: {
      mountX: 0.096,
      mountY: -0.265,
      mountZ: 0.004,
      hubRadius: 0.020,
      hubWidth: 0.016,
      accentRingRadius: 0.015,
    },

    // Backward compatibility aliases
    upperCollarRadius: 0.084,
    rotationalRingRadius: 0.076,
    coreRadius: 0.070,
    pelvisRadius: 0.086,
    hipCowlX: 0.124,
    hipCowlY: -0.367,
    hipCowlZ: 0.005,
  },

  // Motion limits for robotic articulation
  limits: {
    chest: {
      pitchMin: -0.08,
      pitchMax: 0.14,
      yawMax: 0.18,
      rollMax: 0.06,
    },
    stomach: {
      pitchMin: -0.05,
      pitchMax: 0.08,
      yawMax: 0.10,
      rollMax: 0.04,
    },
    waist: {
      pitchMin: -0.06,
      pitchMax: 0.10,
      yawMax: 0.22,
      rollMax: 0.05,
    },
    // Controller property aliases
    waistPitch: 0.10,
    waistYaw: 0.22,
    waistRoll: 0.05,
  },
} as const;
