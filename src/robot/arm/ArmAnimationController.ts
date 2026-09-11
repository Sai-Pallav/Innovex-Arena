import * as THREE from 'three';
import { RobotArmNodes } from './RobotArm';
import { FingerNodes, ThumbNodes } from './Finger';

export interface ArmControlOverrides {
  shoulder?: { x?: number; y?: number; z?: number };
  shoulderJoint?: { x?: number; y?: number; z?: number };
  upperArm?: { x?: number; y?: number; z?: number };
  elbowBend?: number;
  wrist?: { pitch?: number; yaw?: number; roll?: number };
  thumb?: { proxCurl?: number; distCurl?: number; splay?: number };
  fingers?: Array<{ proxCurl?: number; midCurl?: number; distCurl?: number; splay?: number }>;
}

/**
 * Kinematics and animation controller for procedural robot arms and hands.
 * Adheres to Section 5:
 * - Independent control for shoulder, upper arm, elbow, wrist, thumb, and each finger segment.
 * - Hierarchical bending where rotating a joint moves its children naturally.
 * - Organic idle kinematics with breathing coupling and cascading finger waves.
 */
export class ArmAnimationController {
  private leftArm: RobotArmNodes;
  private rightArm: RobotArmNodes;
  private time: number = 0;

  // Base resting rotations
  private baseLeftShoulderRot: THREE.Euler;
  private baseRightShoulderRot: THREE.Euler;
  private baseLeftUpperRot: THREE.Euler;
  private baseRightUpperRot: THREE.Euler;
  private baseLeftElbowRot: THREE.Euler;
  private baseRightElbowRot: THREE.Euler;
  private baseLeftWristRot: THREE.Euler;
  private baseRightWristRot: THREE.Euler;

  // Exploded View State (Technical Reference Exploded Views: Shoulder & Elbow)
  private isExploded: boolean = false;
  private explodedProgress: number = 0;

  private leftBaseShoulderArmorPos: THREE.Vector3;
  private rightBaseShoulderArmorPos: THREE.Vector3;
  private leftBaseShoulderJointPos: THREE.Vector3;
  private rightBaseShoulderJointPos: THREE.Vector3;
  private leftBaseConnectorPos: THREE.Vector3;
  private rightBaseConnectorPos: THREE.Vector3;
  private leftBaseGimbalYokePos: THREE.Vector3;
  private rightBaseGimbalYokePos: THREE.Vector3;
  private leftBaseCycloidalPos: THREE.Vector3;
  private rightBaseCycloidalPos: THREE.Vector3;
  private leftBaseFaceplatePos: THREE.Vector3;
  private rightBaseFaceplatePos: THREE.Vector3;
  private leftBaseDamperPistonPos: THREE.Vector3;
  private rightBaseDamperPistonPos: THREE.Vector3;
  private leftBaseBicepSubGroupPos: THREE.Vector3;
  private rightBaseBicepSubGroupPos: THREE.Vector3;

  private leftBaseLatDiscPos: THREE.Vector3;
  private rightBaseLatDiscPos: THREE.Vector3;
  private leftBaseMedDiscPos: THREE.Vector3;
  private rightBaseMedDiscPos: THREE.Vector3;
  private leftBasePinPos: THREE.Vector3;
  private rightBasePinPos: THREE.Vector3;
  private leftBaseForearmPivotPos: THREE.Vector3;
  private rightBaseForearmPivotPos: THREE.Vector3;

  private leftBaseRamPos: THREE.Vector3;
  private rightBaseRamPos: THREE.Vector3;
  private leftBaseRamPistonPos: THREE.Vector3;
  private rightBaseRamPistonPos: THREE.Vector3;
  private leftBaseOlecranonPos: THREE.Vector3;
  private rightBaseOlecranonPos: THREE.Vector3;

  private leftBaseForearmArmorPos: THREE.Vector3;
  private rightBaseForearmArmorPos: THREE.Vector3;
  private leftBaseBrachioPos: THREE.Vector3;
  private rightBaseBrachioPos: THREE.Vector3;

  private leftBaseDorsalPos: THREE.Vector3;
  private rightBaseDorsalPos: THREE.Vector3;

  private leftBaseWristStyloidLPos: THREE.Vector3;
  private rightBaseWristStyloidLPos: THREE.Vector3;
  private leftBaseWristStyloidRPos: THREE.Vector3;
  private rightBaseWristStyloidRPos: THREE.Vector3;
  private leftBaseWristDorsalPos: THREE.Vector3;
  private rightBaseWristDorsalPos: THREE.Vector3;
  private leftBaseWristClevisPos: THREE.Vector3;
  private rightBaseWristClevisPos: THREE.Vector3;
  private leftBaseWristSwivelPos: THREE.Vector3;
  private rightBaseWristSwivelPos: THREE.Vector3;

  // Manual overrides for programmatic posing
  private leftOverrides: ArmControlOverrides = {};
  private rightOverrides: ArmControlOverrides = {};

  constructor(leftArm: RobotArmNodes, rightArm: RobotArmNodes) {
    this.leftArm = leftArm;
    this.rightArm = rightArm;

    this.baseLeftShoulderRot = leftArm.shoulder.group.rotation.clone();
    this.baseRightShoulderRot = rightArm.shoulder.group.rotation.clone();
    this.baseLeftUpperRot = leftArm.upperArm.group.rotation.clone();
    this.baseRightUpperRot = rightArm.upperArm.group.rotation.clone();
    this.baseLeftElbowRot = (leftArm.elbow.forearmPivot || leftArm.elbow.group).rotation.clone();
    this.baseRightElbowRot = (rightArm.elbow.forearmPivot || rightArm.elbow.group).rotation.clone();
    this.baseLeftWristRot = leftArm.wrist.group.rotation.clone();
    this.baseRightWristRot = rightArm.wrist.group.rotation.clone();

    // Cache initial resting positions for exploded view components
    this.leftBaseShoulderArmorPos = leftArm.shoulder.armorGroup.position.clone();
    this.rightBaseShoulderArmorPos = rightArm.shoulder.armorGroup.position.clone();
    this.leftBaseShoulderJointPos = leftArm.shoulder.jointGroup.position.clone();
    this.rightBaseShoulderJointPos = rightArm.shoulder.jointGroup.position.clone();
    this.leftBaseConnectorPos = leftArm.shoulder.upperArmConnector.position.clone();
    this.rightBaseConnectorPos = rightArm.shoulder.upperArmConnector.position.clone();

    this.leftBaseGimbalYokePos = (leftArm.shoulder.gimbalYoke || leftArm.shoulder.group).position.clone();
    this.rightBaseGimbalYokePos = (rightArm.shoulder.gimbalYoke || rightArm.shoulder.group).position.clone();
    this.leftBaseCycloidalPos = (leftArm.shoulder.cycloidalDrive || leftArm.shoulder.jointGroup).position.clone();
    this.rightBaseCycloidalPos = (rightArm.shoulder.cycloidalDrive || rightArm.shoulder.jointGroup).position.clone();
    this.leftBaseFaceplatePos = (leftArm.shoulder.faceplateHub || leftArm.shoulder.jointGroup).position.clone();
    this.rightBaseFaceplatePos = (rightArm.shoulder.faceplateHub || rightArm.shoulder.jointGroup).position.clone();
    this.leftBaseDamperPistonPos = (leftArm.shoulder.damperPiston || leftArm.shoulder.jointGroup).position.clone();
    this.rightBaseDamperPistonPos = (rightArm.shoulder.damperPiston || rightArm.shoulder.jointGroup).position.clone();
    this.leftBaseBicepSubGroupPos = leftArm.upperArm.bicepSubGroup.position.clone();
    this.rightBaseBicepSubGroupPos = rightArm.upperArm.bicepSubGroup.position.clone();

    this.leftBaseLatDiscPos = leftArm.elbow.lateralDisc.position.clone();
    this.rightBaseLatDiscPos = rightArm.elbow.lateralDisc.position.clone();
    this.leftBaseMedDiscPos = leftArm.elbow.medialDisc.position.clone();
    this.rightBaseMedDiscPos = rightArm.elbow.medialDisc.position.clone();
    this.leftBasePinPos = leftArm.elbow.centralPin.position.clone();
    this.rightBasePinPos = rightArm.elbow.centralPin.position.clone();
    this.leftBaseForearmPivotPos = leftArm.elbow.forearmPivot.position.clone();
    this.rightBaseForearmPivotPos = rightArm.elbow.forearmPivot.position.clone();

    this.leftBaseRamPos = leftArm.elbow.hydraulicRam ? leftArm.elbow.hydraulicRam.position.clone() : new THREE.Vector3();
    this.rightBaseRamPos = rightArm.elbow.hydraulicRam ? rightArm.elbow.hydraulicRam.position.clone() : new THREE.Vector3();
    this.leftBaseRamPistonPos = leftArm.elbow.ramPiston ? leftArm.elbow.ramPiston.position.clone() : new THREE.Vector3();
    this.rightBaseRamPistonPos = rightArm.elbow.ramPiston ? rightArm.elbow.ramPiston.position.clone() : new THREE.Vector3();
    this.leftBaseOlecranonPos = leftArm.elbow.olecranonMesh ? leftArm.elbow.olecranonMesh.position.clone() : new THREE.Vector3();
    this.rightBaseOlecranonPos = rightArm.elbow.olecranonMesh ? rightArm.elbow.olecranonMesh.position.clone() : new THREE.Vector3();

    this.leftBaseForearmArmorPos = leftArm.forearm.armorGroup ? leftArm.forearm.armorGroup.position.clone() : new THREE.Vector3();
    this.rightBaseForearmArmorPos = rightArm.forearm.armorGroup ? rightArm.forearm.armorGroup.position.clone() : new THREE.Vector3();
    this.leftBaseBrachioPos = leftArm.forearm.brachioradialis ? leftArm.forearm.brachioradialis.position.clone() : new THREE.Vector3();
    this.rightBaseBrachioPos = rightArm.forearm.brachioradialis ? rightArm.forearm.brachioradialis.position.clone() : new THREE.Vector3();

    this.leftBaseDorsalPos = leftArm.hand.dorsalArmor.position.clone();
    this.rightBaseDorsalPos = rightArm.hand.dorsalArmor.position.clone();

    this.leftBaseWristStyloidLPos = leftArm.wrist.styloidArmorLeft ? leftArm.wrist.styloidArmorLeft.position.clone() : new THREE.Vector3();
    this.rightBaseWristStyloidLPos = rightArm.wrist.styloidArmorLeft ? rightArm.wrist.styloidArmorLeft.position.clone() : new THREE.Vector3();
    this.leftBaseWristStyloidRPos = leftArm.wrist.styloidArmorRight ? leftArm.wrist.styloidArmorRight.position.clone() : new THREE.Vector3();
    this.rightBaseWristStyloidRPos = rightArm.wrist.styloidArmorRight ? rightArm.wrist.styloidArmorRight.position.clone() : new THREE.Vector3();
    this.leftBaseWristDorsalPos = leftArm.wrist.dorsalCowl ? leftArm.wrist.dorsalCowl.position.clone() : new THREE.Vector3();
    this.rightBaseWristDorsalPos = rightArm.wrist.dorsalCowl ? rightArm.wrist.dorsalCowl.position.clone() : new THREE.Vector3();
    this.leftBaseWristClevisPos = leftArm.wrist.distalClevis ? leftArm.wrist.distalClevis.position.clone() : new THREE.Vector3();
    this.rightBaseWristClevisPos = rightArm.wrist.distalClevis ? rightArm.wrist.distalClevis.position.clone() : new THREE.Vector3();
    this.leftBaseWristSwivelPos = leftArm.wrist.swivelCollar ? leftArm.wrist.swivelCollar.position.clone() : new THREE.Vector3();
    this.rightBaseWristSwivelPos = rightArm.wrist.swivelCollar ? rightArm.wrist.swivelCollar.position.clone() : new THREE.Vector3();

    // Cache pad & cap Z positions and disc subnode X positions
    [leftArm, rightArm].forEach((arm) => {
      arm.hand.palmarPads.forEach((pad) => {
        pad.userData.baseZ = pad.position.z;
      });
      arm.hand.knuckleCaps.forEach((cap) => {
        cap.userData.baseZ = cap.position.z;
      });

      if (arm.elbow.lateralDiscNodes) {
        const l = arm.elbow.lateralDiscNodes;
        l.bearingRace.userData.baseX = l.bearingRace.position.x;
        l.accentRing.userData.baseX = l.accentRing.position.x;
        l.outerBezel.userData.baseX = l.outerBezel.position.x;
        l.innerDisc.userData.baseX = l.innerDisc.position.x;
        l.hubCap.userData.baseX = l.hubCap.position.x;
      }
      if (arm.elbow.medialDiscNodes) {
        const m = arm.elbow.medialDiscNodes;
        m.bearingRace.userData.baseX = m.bearingRace.position.x;
        m.accentRing.userData.baseX = m.accentRing.position.x;
        m.outerBezel.userData.baseX = m.outerBezel.position.x;
        m.innerDisc.userData.baseX = m.innerDisc.position.x;
        m.hubCap.userData.baseX = m.hubCap.position.x;
      }
    });
  }

  // ==============================================================
  // EXPLODED VIEW CONTROLS (Technical Reference Drawings)
  // ==============================================================

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
  // PROGRAMMATIC KINEMATIC CONTROLS (Section 5)
  // ==============================================================

  public setShoulderRotation(side: -1 | 1, x?: number, y?: number, z?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.shoulder = { x, y, z };
  }

  public setShoulderJointRotation(side: -1 | 1, x?: number, y?: number, z?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.shoulderJoint = { x, y, z };
  }

  public setUpperArmRotation(side: -1 | 1, x?: number, y?: number, z?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.upperArm = { x, y, z };
  }

  public setElbowBend(side: -1 | 1, bendAngle: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.elbowBend = bendAngle;
  }

  public setWristRotation(side: -1 | 1, pitch?: number, yaw?: number, roll?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.wrist = { pitch, yaw, roll };
  }

  public setThumbPose(side: -1 | 1, proxCurl?: number, distCurl?: number, splay?: number): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    overrides.thumb = { proxCurl, distCurl, splay };
  }

  public setFingerPose(
    side: -1 | 1,
    fingerIndex: number,
    proxCurl?: number,
    midCurl?: number,
    distCurl?: number,
    splay?: number
  ): void {
    const overrides = side === -1 ? this.leftOverrides : this.rightOverrides;
    if (!overrides.fingers) overrides.fingers = [];
    overrides.fingers[fingerIndex] = { proxCurl, midCurl, distCurl, splay };
  }

  /**
   * Sets a unified grip amount [0, 1] across all fingers and thumb on one hand.
   */
  public setHandGrip(side: -1 | 1, gripAmount: number): void {
    const curl = THREE.MathUtils.clamp(gripAmount, 0, 1);
    for (let f = 0; f < 4; f++) {
      this.setFingerPose(
        side,
        f,
        curl * 0.85,
        curl * 1.10,
        curl * 0.75,
        0
      );
    }
    this.setThumbPose(side, curl * 0.65, curl * 0.80, curl * 0.30);
  }

  public setPoseOverrides(side: 'left' | 'right' | -1 | 1, overrides: ArmControlOverrides): void {
    const isLeft = side === 'left' || side === -1;
    if (isLeft) {
      this.leftOverrides = { ...this.leftOverrides, ...overrides };
    } else {
      this.rightOverrides = { ...this.rightOverrides, ...overrides };
    }
  }

  public clearOverrides(side?: -1 | 1): void {
    if (side === -1 || side === undefined) this.leftOverrides = {};
    if (side === 1 || side === undefined) this.rightOverrides = {};
  }

  // ==============================================================
  // REAL-TIME KINEMATICS UPDATE
  // ==============================================================

  public update(
    dt: number,
    breathOffset: number = 0,
    lookYaw: number = 0,
    lookPitch: number = 0
  ): void {
    this.time += dt;

    // Exploded View smooth damping interpolation
    const targetExploded = this.isExploded ? 1.0 : 0.0;
    this.explodedProgress = THREE.MathUtils.damp(this.explodedProgress, targetExploded, 6.0, dt);
    const exp = this.explodedProgress;

    // Apply exploded offsets to shoulders, elbows, and hands
    this.applyExplodedOffsets(this.leftArm, -1, exp);
    this.applyExplodedOffsets(this.rightArm, 1, exp);

    this.updateArmKinematics(
      this.leftArm,
      this.baseLeftShoulderRot,
      this.baseLeftUpperRot,
      this.baseLeftElbowRot,
      this.baseLeftWristRot,
      this.leftOverrides,
      -1,
      breathOffset,
      lookYaw,
      lookPitch
    );

    this.updateArmKinematics(
      this.rightArm,
      this.baseRightShoulderRot,
      this.baseRightUpperRot,
      this.baseRightElbowRot,
      this.baseRightWristRot,
      this.rightOverrides,
      1,
      breathOffset,
      lookYaw,
      lookPitch
    );
  }

  /**
   * Separates components along their natural engineering axes adhering strictly to
   * the provided "SHOULDER OVERVIEW -> EXPLODED VIEW" and "ELBOW OVERVIEW -> EXPLODED VIEW".
   */
  private applyExplodedOffsets(
    arm: RobotArmNodes,
    side: -1 | 1,
    exp: number
  ): void {
    const isLeft = side === -1;
    const baseShoulderArmor = isLeft ? this.leftBaseShoulderArmorPos : this.rightBaseShoulderArmorPos;
    const baseShoulderJoint = isLeft ? this.leftBaseShoulderJointPos : this.rightBaseShoulderJointPos;
    const baseConnector = isLeft ? this.leftBaseConnectorPos : this.rightBaseConnectorPos;

    const baseLatDisc = isLeft ? this.leftBaseLatDiscPos : this.rightBaseLatDiscPos;
    const baseMedDisc = isLeft ? this.leftBaseMedDiscPos : this.rightBaseMedDiscPos;
    const basePin = isLeft ? this.leftBasePinPos : this.rightBasePinPos;
    const baseForearmPivot = isLeft ? this.leftBaseForearmPivotPos : this.rightBaseForearmPivotPos;

    const baseDorsal = isLeft ? this.leftBaseDorsalPos : this.rightBaseDorsalPos;

    // 1. SHOULDER & BICEP MULTI-STAGE MECHANICAL OPEN VIEW (CAD Hierarchy)
    // Stage A: Structural Gimbal Yoke lifts upward and separates outward
    if (arm.shoulder.gimbalYoke) {
      const baseYoke = isLeft ? this.leftBaseGimbalYokePos : this.rightBaseGimbalYokePos;
      arm.shoulder.gimbalYoke.position.set(
        baseYoke.x + side * exp * 0.024,
        baseYoke.y + exp * 0.038,
        baseYoke.z + exp * 0.018
      );
    }

    // Stage B: Hydraulic Damper Actuator extends chrome piston rod
    if (arm.shoulder.damperPiston) {
      const basePiston = isLeft ? this.leftBaseDamperPistonPos : this.rightBaseDamperPistonPos;
      arm.shoulder.damperPiston.position.y = basePiston.y - exp * 0.024;
    }

    // Stage C: Rotational Joint Core separates along X axis
    arm.shoulder.jointGroup.position.set(
      baseShoulderJoint.x + side * exp * 0.025,
      baseShoulderJoint.y,
      baseShoulderJoint.z
    );

    // Stage D: Cycloidal Planetary Drive Ring separates further along X (Concentric Layer 2)
    if (arm.shoulder.cycloidalDrive) {
      const baseCyclo = isLeft ? this.leftBaseCycloidalPos : this.rightBaseCycloidalPos;
      arm.shoulder.cycloidalDrive.position.x = baseCyclo.x + side * exp * 0.040;
    }

    // Stage E: Purple Reactor Accent Ring separates further along X (Concentric Layer 3)
    if (arm.shoulder.accentRing) {
      arm.shoulder.accentRing.position.x = side * (0.034 + exp * 0.060);
    }

    // Stage F: Precision Billet Faceplate & Fasteners separates farthest along X (Concentric Layer 4)
    if (arm.shoulder.faceplateHub) {
      const baseFace = isLeft ? this.leftBaseFaceplatePos : this.rightBaseFaceplatePos;
      arm.shoulder.faceplateHub.position.x = baseFace.x + side * exp * 0.082;
    }

    // Stage G: Articulated Clevis & Trunnion drops downward along -Y
    arm.shoulder.upperArmConnector.position.set(
      baseConnector.x,
      baseConnector.y - exp * 0.038,
      baseConnector.z
    );

    // Stage H: Bicep Armor Shell slides downward and outward along -Y and +Z,
    // uncovering the internal dark titanium bone armature core!
    if (arm.upperArm.bicepSubGroup) {
      const baseBicep = isLeft ? this.leftBaseBicepSubGroupPos : this.rightBaseBicepSubGroupPos;
      arm.upperArm.bicepSubGroup.position.set(
        baseBicep.x + side * exp * 0.015,
        baseBicep.y - exp * 0.046,
        baseBicep.z + exp * 0.028
      );
    }

    // 2. ELBOW & FOREARM MULTI-STAGE MECHANICAL OPEN VIEW (CAD Engineering Hierarchy)
    // Stage A: Central Hinge Axle Pin slides outward along transverse X axis
    const latSign = side === 1 ? 1 : -1;
    arm.elbow.centralPin.position.set(
      basePin.x + latSign * exp * 0.032,
      basePin.y,
      basePin.z
    );

    // Stage B: Dual Rotational Side Discs slide laterally along ±X
    arm.elbow.lateralDisc.position.set(
      baseLatDisc.x + latSign * exp * 0.038,
      baseLatDisc.y,
      baseLatDisc.z
    );
    arm.elbow.medialDisc.position.set(
      baseMedDisc.x - latSign * exp * 0.038,
      baseMedDisc.y,
      baseMedDisc.z
    );

    // Stage C: Concentric Disassembly of the Lateral & Medial Rotational Discs
    // Bearing Race -> Purple LED Halo -> Outer Bezel with Hex Screws -> Hub Cap
    if (arm.elbow.lateralDiscNodes) {
      const l = arm.elbow.lateralDiscNodes;
      const bRace = l.bearingRace.userData.baseX ?? l.bearingRace.position.x;
      const bAccent = l.accentRing.userData.baseX ?? l.accentRing.position.x;
      const bBezel = l.outerBezel.userData.baseX ?? l.outerBezel.position.x;
      const bHub = l.hubCap.userData.baseX ?? l.hubCap.position.x;

      l.bearingRace.position.x = bRace + latSign * exp * 0.014;
      l.accentRing.position.x = bAccent + latSign * exp * 0.026;
      l.outerBezel.position.x = bBezel + latSign * exp * 0.040;
      l.hubCap.position.x = bHub + latSign * exp * 0.055;
    }

    if (arm.elbow.medialDiscNodes) {
      const m = arm.elbow.medialDiscNodes;
      const medSign = -latSign;
      const bRace = m.bearingRace.userData.baseX ?? m.bearingRace.position.x;
      const bAccent = m.accentRing.userData.baseX ?? m.accentRing.position.x;
      const bBezel = m.outerBezel.userData.baseX ?? m.outerBezel.position.x;
      const bHub = m.hubCap.userData.baseX ?? m.hubCap.position.x;

      m.bearingRace.position.x = bRace + medSign * exp * 0.014;
      m.accentRing.position.x = bAccent + medSign * exp * 0.026;
      m.outerBezel.position.x = bBezel + medSign * exp * 0.040;
      m.hubCap.position.x = bHub + medSign * exp * 0.055;
    }

    // Stage D: Posterior Hydraulic Flexion Ram extends piston rod & pivots back
    if (arm.elbow.hydraulicRam) {
      const baseRam = isLeft ? this.leftBaseRamPos : this.rightBaseRamPos;
      arm.elbow.hydraulicRam.position.set(
        baseRam.x,
        baseRam.y + exp * 0.014,
        baseRam.z - exp * 0.022
      );
    }
    if (arm.elbow.ramPiston) {
      const basePiston = isLeft ? this.leftBaseRamPistonPos : this.rightBaseRamPistonPos;
      arm.elbow.ramPiston.position.y = basePiston.y - exp * 0.018;
    }

    // Stage E: Posterior Olecranon Armor Shield separates backward along -Z & +Y
    if (arm.elbow.olecranonMesh) {
      const baseOle = isLeft ? this.leftBaseOlecranonPos : this.rightBaseOlecranonPos;
      arm.elbow.olecranonMesh.position.set(
        baseOle.x,
        baseOle.y + exp * 0.018,
        baseOle.z - exp * 0.038
      );
    }

    // Stage F: Lower Clevis Housing & Forearm Pivot drops downward along -Y
    arm.elbow.forearmPivot.position.set(
      baseForearmPivot.x,
      baseForearmPivot.y - exp * 0.048,
      baseForearmPivot.z
    );

    // Stage G: Forearm Outer Armor Shell slides downward and forward along -Y and +Z,
    // uncovering the internal dark titanium bone armature sleeve!
    if (arm.forearm.armorGroup) {
      const baseForearmArmor = isLeft ? this.leftBaseForearmArmorPos : this.rightBaseForearmArmorPos;
      arm.forearm.armorGroup.position.set(
        baseForearmArmor.x,
        baseForearmArmor.y - exp * 0.036,
        baseForearmArmor.z + exp * 0.022
      );
    }

    // Stage H: Contoured Brachioradialis Accent Plate slides laterally outward
    if (arm.forearm.brachioradialis) {
      const baseBrachio = isLeft ? this.leftBaseBrachioPos : this.rightBaseBrachioPos;
      arm.forearm.brachioradialis.position.x = baseBrachio.x + side * exp * 0.026;
    }

    // 2.5 WRIST EXPLODED VIEW (Open view exposing internal harmonic drive, trunnion hinge pin & bearing)
    if (arm.wrist.styloidArmorLeft && arm.wrist.styloidArmorRight) {
      const baseStyL = isLeft ? this.leftBaseWristStyloidLPos : this.rightBaseWristStyloidLPos;
      const baseStyR = isLeft ? this.leftBaseWristStyloidRPos : this.rightBaseWristStyloidRPos;
      // White ceramic lateral styloid armor cowls separate laterally outward
      arm.wrist.styloidArmorLeft.position.x = baseStyL.x - exp * 0.024;
      arm.wrist.styloidArmorRight.position.x = baseStyR.x + exp * 0.024;
    }

    if (arm.wrist.dorsalCowl) {
      const baseDorsalW = isLeft ? this.leftBaseWristDorsalPos : this.rightBaseWristDorsalPos;
      // White ceramic dorsal bridge cowl moves forward in +Z
      arm.wrist.dorsalCowl.position.z = baseDorsalW.z + exp * 0.022;
    }

    if (arm.wrist.distalClevis) {
      const baseClevis = isLeft ? this.leftBaseWristClevisPos : this.rightBaseWristClevisPos;
      // Machined dark titanium dual-fork clevis yoke slides downward in -Y towards hand
      arm.wrist.distalClevis.position.y = baseClevis.y - exp * 0.016;
    }

    if (arm.wrist.swivelCollar) {
      const baseSwivel = isLeft ? this.leftBaseWristSwivelPos : this.rightBaseWristSwivelPos;
      // Swivel collar sleeve moves slightly upward in +Y towards forearm
      arm.wrist.swivelCollar.position.y = baseSwivel.y + exp * 0.008;
    }

    // 3. HAND EXPLODED VIEW
    // Dorsal Armor Shield separates forward along +Z
    arm.hand.dorsalArmor.position.set(
      baseDorsal.x,
      baseDorsal.y,
      baseDorsal.z + exp * 0.024
    );

    // Segmented Palmar Friction Grip Pads separate backward along -Z
    arm.hand.palmarPads.forEach((pad) => {
      const bZ = pad.userData.baseZ !== undefined ? pad.userData.baseZ : pad.position.z;
      pad.position.z = bZ - exp * 0.012;
    });

    // MCP Knuckle Caps separate along +Z
    arm.hand.knuckleCaps.forEach((cap) => {
      const bZ = cap.userData.baseZ !== undefined ? cap.userData.baseZ : cap.position.z;
      cap.position.z = bZ + exp * 0.012;
    });
  }

  private updateArmKinematics(
    arm: RobotArmNodes,
    baseShoulder: THREE.Euler,
    baseUpper: THREE.Euler,
    baseElbow: THREE.Euler,
    baseWrist: THREE.Euler,
    overrides: ArmControlOverrides,
    side: -1 | 1,
    breathOffset: number,
    lookYaw: number,
    lookPitch: number
  ): void {
    const isLeft = side === -1;
    const timePhase = isLeft ? 0 : 2.4;

    // 1. Shoulder Kinematics
    if (overrides.shoulder) {
      if (overrides.shoulder.x !== undefined) arm.shoulder.group.rotation.x = overrides.shoulder.x;
      if (overrides.shoulder.y !== undefined) arm.shoulder.group.rotation.y = overrides.shoulder.y;
      if (overrides.shoulder.z !== undefined) arm.shoulder.group.rotation.z = overrides.shoulder.z;
    } else {
      arm.shoulder.group.rotation.set(
        baseShoulder.x,
        baseShoulder.y,
        baseShoulder.z + (isLeft ? -breathOffset * 0.04 : breathOffset * 0.04)
      );
    }

    // 1b. Shoulder Joint Rotational Mechanism (rotates independently from shoulder armor per Section 4)
    if (overrides.shoulderJoint) {
      if (overrides.shoulderJoint.x !== undefined) arm.shoulder.jointGroup.rotation.x = overrides.shoulderJoint.x;
      if (overrides.shoulderJoint.y !== undefined) arm.shoulder.jointGroup.rotation.y = overrides.shoulderJoint.y;
      if (overrides.shoulderJoint.z !== undefined) arm.shoulder.jointGroup.rotation.z = overrides.shoulderJoint.z;
    }

    // 2. Upper Arm Kinematics
    if (overrides.upperArm) {
      if (overrides.upperArm.x !== undefined) arm.upperArm.group.rotation.x = overrides.upperArm.x;
      if (overrides.upperArm.y !== undefined) arm.upperArm.group.rotation.y = overrides.upperArm.y;
      if (overrides.upperArm.z !== undefined) arm.upperArm.group.rotation.z = overrides.upperArm.z;
    } else {
      const upperSway = Math.sin(this.time * 0.40 + timePhase) * 0.015 + breathOffset * 0.05;
      arm.upperArm.group.rotation.set(
        baseUpper.x + upperSway,
        baseUpper.y,
        baseUpper.z
      );
    }

    // 3. Elbow Kinematics (articulates forearmPivot around the central horizontal hinge axis)
    const elbowPivot = arm.elbow.forearmPivot || arm.elbow.group;
    if (overrides.elbowBend !== undefined) {
      elbowPivot.rotation.set(overrides.elbowBend, baseElbow.y, baseElbow.z);
    } else {
      const elbowDelta =
        Math.sin(this.time * 0.36 + timePhase) * 0.018 +
        breathOffset * 0.06 +
        lookPitch * 0.02;
      elbowPivot.rotation.set(
        baseElbow.x + elbowDelta,
        baseElbow.y,
        baseElbow.z
      );
    }

    // 4. Wrist Kinematics (Pitch, Yaw, Roll)
    if (overrides.wrist) {
      if (overrides.wrist.pitch !== undefined) arm.wrist.group.rotation.x = baseWrist.x + overrides.wrist.pitch;
      if (overrides.wrist.roll !== undefined) arm.wrist.group.rotation.y = baseWrist.y + overrides.wrist.roll;
      if (overrides.wrist.yaw !== undefined) arm.wrist.group.rotation.z = baseWrist.z + overrides.wrist.yaw;
    } else {
      const wPitch = Math.cos(this.time * 0.55 + timePhase) * 0.022 + breathOffset * 0.08 - lookPitch * 0.02;
      const wRoll = Math.sin(this.time * 0.42 + timePhase) * 0.015 + lookYaw * 0.03;
      const wYaw = Math.cos(this.time * 0.30 + timePhase) * 0.012;
      arm.wrist.group.rotation.set(
        baseWrist.x + wPitch,
        baseWrist.y + wRoll,
        baseWrist.z + wYaw
      );
    }

    // 5. Hand Fingers Kinematics
    const fingers = [
      arm.hand.indexFinger,
      arm.hand.middleFinger,
      arm.hand.ringFinger,
      arm.hand.littleFinger,
    ];

    fingers.forEach((finger, idx) => {
      this.updateFingerKinematics(
        finger,
        idx,
        overrides.fingers ? overrides.fingers[idx] : undefined,
        side,
        timePhase,
        breathOffset
      );
    });

    // 6. Thumb Kinematics
    this.updateThumbKinematics(
      arm.hand.thumb,
      overrides.thumb,
      side,
      timePhase,
      breathOffset
    );
  }

  private updateFingerKinematics(
    finger: FingerNodes,
    idx: number,
    override: { proxCurl?: number; midCurl?: number; distCurl?: number; splay?: number } | undefined,
    side: -1 | 1,
    timePhase: number,
    breathOffset: number
  ): void {
    const isLeft = side === -1;
    // Progressive anatomical flexion angles (cascade of flexion curving naturally into palm):
    // - Index finger is most extended/relaxed (~68° total curl)
    // - Little finger is most flexed/curled (~103° total curl)
    const restingLeft = [
      { prox: 0.32, mid: 0.46, dist: 0.28, splay: 0.042 },  // Index (~18°, 26°, 16° = ~60° total curl)
      { prox: 0.40, mid: 0.54, dist: 0.32, splay: 0.012 },  // Middle (~23°, 31°, 18° = ~72° total curl)
      { prox: 0.48, mid: 0.62, dist: 0.36, splay: -0.018 }, // Ring (~27°, 35°, 21° = ~83° total curl)
      { prox: 0.56, mid: 0.70, dist: 0.42, splay: -0.048 }, // Little (~32°, 40°, 24° = ~96° total curl)
    ];
    const restingRight = [
      { prox: 0.32, mid: 0.46, dist: 0.28, splay: 0.042 },  // Index
      { prox: 0.40, mid: 0.54, dist: 0.32, splay: 0.012 },  // Middle
      { prox: 0.48, mid: 0.62, dist: 0.36, splay: -0.018 }, // Ring
      { prox: 0.56, mid: 0.70, dist: 0.42, splay: -0.048 }, // Little
    ];

    const target = isLeft ? restingLeft[idx] : restingRight[idx];

    // Procedural organic resting micro-motion:
    // Dual-harmonic subtle wave cascaded across fingers for lifelike mechanical relaxation
    const speed = 0.45 + idx * 0.06;
    const phase = idx * 0.42 + timePhase;
    const amp = 0.015 - idx * 0.002;

    const wave =
      Math.sin(this.time * speed + phase) * amp +
      Math.sin(this.time * speed * 2.0 + phase * 0.7) * (amp * 0.25) +
      breathOffset * 0.008;

    // Overrides are additive deltas on top of resting posture (or user grip command)
    const addProx = override?.proxCurl !== undefined ? override.proxCurl : wave * 0.3;
    const addMid = override?.midCurl !== undefined ? override.midCurl : wave * 0.5;
    const addDist = override?.distCurl !== undefined ? override.distCurl : wave * 0.4;
    const addSplay = override?.splay !== undefined ? override.splay : Math.sin(this.time * 0.25 + phase) * 0.004;

    // Segmented bending: positive rotation around X axis flexes fingers naturally toward palm (-Z)
    finger.proximal.group.rotation.x = target.prox + addProx;
    finger.middle.group.rotation.x = target.mid + addMid;
    finger.distal.group.rotation.x = target.dist + addDist;

    // Subtle natural lateral splay along Z axis
    finger.proximal.group.rotation.z = -side * (target.splay + addSplay);
  }

  private updateThumbKinematics(
    thumb: ThumbNodes,
    override: { proxCurl?: number; distCurl?: number; splay?: number } | undefined,
    side: -1 | 1,
    timePhase: number,
    breathOffset: number
  ): void {
    const wave =
      Math.cos(this.time * 0.40 + timePhase) * 0.012 +
      Math.sin(this.time * 0.80 + timePhase) * 0.008 +
      breathOffset * 0.006;

    const addProx = override?.proxCurl !== undefined ? override.proxCurl : wave * 0.05;
    const addDist = override?.distCurl !== undefined ? override.distCurl : wave * 0.05;
    const addSplay = override?.splay !== undefined ? override.splay : 0;

    // Natural relaxed thumb posture angled forward (+Z) and medially toward index/palm in ready opposition
    thumb.group.rotation.set(0.30 + wave * 0.04, -side * 0.32, -side * (0.24 + addSplay));
    thumb.proximal.group.rotation.x = 0.28 + addProx;
    thumb.proximal.group.rotation.z = -side * 0.08;
    thumb.distal.group.rotation.x = 0.32 + addDist;
    if (thumb.middle) thumb.middle.group.rotation.x = 0.32 + addDist;
  }
}

