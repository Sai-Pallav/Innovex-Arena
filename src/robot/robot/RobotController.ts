import * as THREE from 'three';
import { RobotNodes } from './RobotProceduralFactory';
import { RobotAnimationController } from '../animation/RobotAnimationController';

export class RobotController {
  public nodes: RobotNodes;
  private animController: RobotAnimationController;

  // Normalized cursor coordinates [-1, 1]
  private targetLookX: number = 0;
  private targetLookY: number = 0;
  private cursorSpeed: number = 0;
  private isInteracting: boolean = false;
  private reducedMotion: boolean = false;

  constructor(nodes: RobotNodes) {
    this.nodes = nodes;
    this.animController = new RobotAnimationController(nodes);
  }

  public setLookTarget(x: number, y: number, speed: number = 0): void {
    this.targetLookX = Math.max(-1, Math.min(1, x));
    this.targetLookY = Math.max(-1, Math.min(1, y));
    this.cursorSpeed = speed;
    this.isInteracting = true;
    this.animController.setLookTarget(this.targetLookX, this.targetLookY, speed);
  }

  public setIdleState(): void {
    this.targetLookX = 0;
    this.targetLookY = 0;
    this.cursorSpeed = 0;
    this.isInteracting = false;
    this.animController.setIdleState();
  }

  public setInteractionState(active: boolean): void {
    this.isInteracting = active;
    if (!active) {
      this.animController.setIdleState();
    }
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    this.animController.setReducedMotion(reduced);
  }

  /**
   * Updates robot kinematics, hierarchical look-at tracking, mechanical arm posture,
   * elbow/wrist articulation, waist suspension, idle floating, and emissive feedback.
   * Frame-rate independent using deltaTime.
   */
  public update(deltaTime: number): void {
    this.animController.update(
      deltaTime,
      this.targetLookX,
      this.targetLookY,
      this.cursorSpeed
    );
  }

  public getAnimationController(): RobotAnimationController {
    return this.animController;
  }

  public getAnimationSystem(): RobotAnimationController {
    return this.animController;
  }

  public getArmController() {
    return this.animController.getArmController();
  }

  public getTorsoController() {
    return this.animController.getTorsoController();
  }

  public getLegController() {
    return this.animController.getLegController();
  }

  public dispose(): void {
    // Clean up controller resources
  }
}
