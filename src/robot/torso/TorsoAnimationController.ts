import * as THREE from 'three';
import { RobotTorsoNodes } from './RobotTorso';
import { TORSO_CONFIG } from './TorsoConfig';

export interface TorsoControlOverrides {
  chestPitch?: number;
  chestYaw?: number;
  chestRoll?: number;
  abdomenBend?: number;
  waistPitch?: number;
  waistYaw?: number;
  waistRoll?: number;
}

/**
 * Kinematics, animation controller, and developer inspection system for the Robot Torso.
 * Adheres strictly to Section 14, 15, 16 of the Master Prompt:
 * - Coordinated breathing micro-movement with hierarchical damping (Chest 100% -> Stomach 65% -> Waist 35%)
 * - Articulated cascaded flexure across the 4 mechanical stomach rings
 * - Wireframe debug mode for geometry inspection
 * - Exploded view inspection mode separating chest shell, flank panels, back armor, stomach rings, and waist
 */
export class TorsoAnimationController {
  private torso: RobotTorsoNodes;
  private time: number = 0;

  // Base transforms for interpolation and damping
  private baseChestRot: THREE.Euler;
  private baseStomachRot: THREE.Euler;
  private baseWaistRot: THREE.Euler;
  private baseRingYs: number[] = [];

  // Exploded view state
  private explodedProgress: number = 0;
  private isExploded: boolean = false;

  // Manual overrides
  private overrides: TorsoControlOverrides = {};

  // Debug wireframe state
  private isDebugWireframe: boolean = false;
  private originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

  constructor(torso: RobotTorsoNodes) {
    this.torso = torso;
    this.baseChestRot = torso.chestPivot.rotation.clone();
    this.baseStomachRot = torso.stomachPivot.rotation.clone();
    this.baseWaistRot = torso.waistPivot.rotation.clone();

    torso.stomach.rings.forEach((ring) => {
      this.baseRingYs.push(ring.group.position.y);
    });

    // Cache original materials for wireframe toggling
    torso.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        this.originalMaterials.set(mesh, mesh.material);
      }
    });
  }

  // ==============================================================
  // PROGRAMMATIC CONTROLS & OVERRIDES
  // ==============================================================

  public setChestRotation(pitch?: number, yaw?: number, roll?: number): void {
    this.overrides.chestPitch = pitch;
    this.overrides.chestYaw = yaw;
    this.overrides.chestRoll = roll;
  }

  public setAbdomenBend(bend?: number): void {
    this.overrides.abdomenBend = bend;
  }

  public setWaistRotation(pitch?: number, yaw?: number, roll?: number): void {
    this.overrides.waistPitch = pitch;
    this.overrides.waistYaw = yaw;
    this.overrides.waistRoll = roll;
  }

  public clearOverrides(): void {
    this.overrides = {};
  }

  // ==============================================================
  // DEVELOPER INSPECTION MODES
  // ==============================================================

  /**
   * Toggles development wireframe mode for all torso components.
   */
  public toggleDebug(enabled?: boolean): boolean {
    this.isDebugWireframe = enabled !== undefined ? enabled : !this.isDebugWireframe;

    this.torso.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            if ('wireframe' in m) (m as any).wireframe = this.isDebugWireframe;
          });
        } else if (mat && 'wireframe' in mat) {
          (mat as any).wireframe = this.isDebugWireframe;
        }
      }
    });

    return this.isDebugWireframe;
  }

  /**
   * Sets the exploded inspection view separating components along their natural axes.
   */
  public setExplodedView(enabled: boolean): void {
    this.isExploded = enabled;
  }

  public toggleExplodedView(): boolean {
    this.isExploded = !this.isExploded;
    return this.isExploded;
  }

  public isExplodedActive(): boolean {
    return this.isExploded;
  }

  // ==============================================================
  // REAL-TIME UPDATE
  // ==============================================================

  public update(dt: number, breathOffset: number = 0, lookYaw: number = 0, lookPitch: number = 0): void {
    this.time += dt;

    // 1. Exploded view animation interpolation
    const targetExploded = this.isExploded ? 1.0 : 0.0;
    this.explodedProgress = THREE.MathUtils.damp(this.explodedProgress, targetExploded, 6.0, dt);

    const exp = this.explodedProgress;
    // Explode offsets:
    // - Front chest plate moves +Z (forward, carrying the embedded logo cleanly)
    this.torso.chestArmor.centerPanel.position.z = 0.070 + exp * 0.12;
    // - Left & Right flank panels move ±X
    this.torso.chestArmor.leftPanel.position.x = -0.134 - exp * 0.08;
    this.torso.chestArmor.rightPanel.position.x = 0.134 + exp * 0.08;
    // - Back armor moves -Z (backward)
    this.torso.upperTorsoFrame.backArmor.position.z = -0.085 - exp * 0.10;
    this.torso.upperTorsoFrame.backLightBar.position.z = -0.100 - exp * 0.10;
    // - Stomach rings spread vertically along spine
    const ringCount = this.torso.stomach.rings.length;
    const midIdx = (ringCount - 1) / 2;
    this.torso.stomach.rings.forEach((ring, idx) => {
      const spread = (idx - midIdx) * 0.024 * exp;
      ring.group.position.y = this.baseRingYs[idx] + spread;
    });
    // - Waist and hips drop slightly in -Y
    this.torso.waist.waistPivot.position.y = -exp * 0.06;
    // - Pelvic shield and accent light move forward in +Z
    this.torso.waist.pelvicPlate.position.z = 0.046 + exp * 0.05;
    if (this.torso.waist.pelvicAccentLight) {
      this.torso.waist.pelvicAccentLight.position.z = 0.058 + exp * 0.05;
    }
    // - Left & Right Hip assemblies separate laterally along ±X
    const hipCfg = TORSO_CONFIG.waist.hipConnector;
    this.torso.waist.leftHip.group.position.x = -hipCfg.mountX - exp * 0.04;
    this.torso.waist.rightHip.group.position.x = hipCfg.mountX + exp * 0.04;

    // If fully exploded for inspection, pause kinematic rotations
    if (this.explodedProgress > 0.85) return;

    // 2. Natural Breathing & Damping Kinematics (Section 14 & 15)
    // Chest leads: 100% motion
    const chestPitchDelta =
      Math.sin(this.time * 0.42) * 0.012 + breathOffset * 0.06 + lookPitch * 0.03;
    const chestYawDelta = Math.sin(this.time * 0.30) * 0.010 + lookYaw * 0.04;
    const chestRollDelta = Math.cos(this.time * 0.36) * 0.008;

    this.torso.chestPivot.rotation.set(
      this.overrides.chestPitch ?? (this.baseChestRot.x + chestPitchDelta),
      this.overrides.chestYaw ?? (this.baseChestRot.y + chestYawDelta),
      this.overrides.chestRoll ?? (this.baseChestRot.z + chestRollDelta)
    );

    // Stomach follows with phase delay: 65% motion
    const stPitchDelta = chestPitchDelta * 0.65;
    const stYawDelta = chestYawDelta * 0.65;
    const stRollDelta = chestRollDelta * 0.65;

    this.torso.stomachPivot.rotation.set(
      this.baseStomachRot.x + stPitchDelta,
      this.baseStomachRot.y + stYawDelta,
      this.baseStomachRot.z + stRollDelta
    );

    // Subtle cascaded compression across the articulated stomach rings
    const ringBend = this.overrides.abdomenBend ?? Math.sin(this.time * 0.42 + 0.3) * 0.014;
    this.torso.stomach.rings.forEach((ring, idx) => {
      const ringWeight = (idx + 1) / ringCount;
      ring.group.rotation.x = ringBend * ringWeight * 0.4;
      ring.group.rotation.y = stYawDelta * ringWeight * 0.3;
    });

    // Waist follows with heavy mechanical damping: 35% motion
    const waistPitchDelta = chestPitchDelta * 0.35;
    const waistYawDelta = chestYawDelta * 0.35;
    const waistRollDelta = chestRollDelta * 0.35;

    const limits = TORSO_CONFIG.limits;
    this.torso.waistPivot.rotation.set(
      this.overrides.waistPitch ??
        THREE.MathUtils.clamp(this.baseWaistRot.x + waistPitchDelta, -limits.waistPitch, limits.waistPitch),
      this.overrides.waistYaw ??
        THREE.MathUtils.clamp(this.baseWaistRot.y + waistYawDelta, -limits.waistYaw, limits.waistYaw),
      this.overrides.waistRoll ??
        THREE.MathUtils.clamp(this.baseWaistRot.z + waistRollDelta, -limits.waistRoll, limits.waistRoll)
    );
  }
}
