import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraManager } from './camera';
import { createStudioLighting, SceneLights } from './lighting';
import { loadRobotModel, LoadRobotResult } from '../robot/RobotLoader';
import { RobotNodes } from '../robot/RobotProceduralFactory';
import { RobotController } from '../robot/RobotController';
import { RobotInteraction } from '../robot/RobotInteraction';
import { getOptimalPixelRatio, deepDispose } from '../utils/performance';
import { getViewportDimensions } from '../utils/responsiveness';
import { ROBOT_CONFIG, ROBOT_SCALE, ROBOT_POSITION, ROBOT_ROTATION } from '../config';
import { DebugManager, DebugStats } from '../arm/DebugManager';

export interface RobotSceneOptions {
  container: HTMLElement;
  modelUrl?: string;
  onLoaded?: (source: 'glb' | 'procedural') => void;
  onError?: (err: Error) => void;
}

export class RobotScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private cameraManager: CameraManager;
  private lights: SceneLights;
  private controller: RobotController | null = null;
  private debugManager: DebugManager | null = null;
  private interaction: RobotInteraction;
  private mixer?: THREE.AnimationMixer;
  private robotNodes: RobotNodes | null = null;

  private isRunning: boolean = false;
  private isVisible: boolean = true;
  private animFrameId: number | null = null;
  private lastTime: number = performance.now();
  private resizeObserver: ResizeObserver | null = null;
  private boundVisibilityChange: () => void;

  public isReady: boolean = false;
  public modelSource: 'glb' | 'procedural' = 'procedural';
  private _tempFacePos = new THREE.Vector3();

  constructor(options: RobotSceneOptions) {
    this.container = options.container;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent to blend seamlessly with cosmos CSS theme

    // 2. Camera setup
    const dims = getViewportDimensions(this.container);
    this.cameraManager = new CameraManager(dims.aspect);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(dims.width, dims.height);
    this.renderer.setPixelRatio(Math.min(getOptimalPixelRatio(ROBOT_CONFIG.maxPixelRatio), 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = false;

    // Procedural Studio Environment for realistic PBR visor reflections (Part 5 & 16)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTexture;
    pmremGenerator.dispose();

    // Append canvas
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    // 4. Lighting setup
    this.lights = createStudioLighting();
    this.scene.add(this.lights.group);

    // 5. Interaction setup
    this.interaction = new RobotInteraction(this.container);

    // 6. Responsive Resize Observer
    this.setupResizeObserver();

    // 7. Page Visibility Listener
    this.boundVisibilityChange = this.onVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.boundVisibilityChange);

    // 8. Load Model
    this.initModel(options);
  }

  private async initModel(options: RobotSceneOptions): Promise<void> {
    try {
      const result: LoadRobotResult = await loadRobotModel(options.modelUrl);
      this.modelSource = result.source;
      this.mixer = result.mixer;

      // Add to scene
      this.scene.add(result.nodes.root);

      // Store nodes & apply responsive heroic scaling & bottom-anchored positioning
      this.robotNodes = result.nodes;
      this.updateRobotTransform();

      // Initialize kinematics controller
      this.controller = new RobotController(result.nodes);
      this.controller.setCameraContext(this.cameraManager.camera, this.container);

      // Initialize Section 9 Developer Debug Mode Manager
      this.debugManager = new DebugManager(result.nodes.root);

      this.isReady = true;
      (window as any).__robotScene = this;
      if (options.onLoaded) {
        options.onLoaded(this.modelSource);
      }

      this.start();
    } catch (err: any) {
      console.error('[RobotScene] Initialization failed:', err);
      if (options.onError) {
        options.onError(err);
      }
    }
  }

  private updateRobotTransform(): void {
    if (!this.robotNodes?.root) return;
    const width = this.container.clientWidth;

    // Priority 1: Grounded, prominent hero character scale (~1.22x–1.28x)
    // Anchored toward bottom of hero so lower torso naturally emerges from bottom stage,
    // head remains comfortably below top navigation, and both shoulders & hands are fully visible.
    let scale = ROBOT_SCALE.desktop;
    let pos = ROBOT_POSITION.desktop;

    if (width < 640) {
      scale = ROBOT_SCALE.mobile;
      pos = ROBOT_POSITION.mobile;
    } else if (width < 1024) {
      scale = ROBOT_SCALE.tablet;
      pos = ROBOT_POSITION.tablet;
    } else if (width > 1600) {
      scale = ROBOT_SCALE.desktopWide;
      pos = ROBOT_POSITION.desktopWide;
    }

    this.robotNodes.root.scale.setScalar(scale);
    this.robotNodes.root.position.set(pos.x, pos.y, pos.z);

    // Subtle 3/4 orientation toward screen-left and slight ground perspective
    this.robotNodes.root.rotation.y = ROBOT_ROTATION.yaw;
    this.robotNodes.root.rotation.x = ROBOT_ROTATION.pitch;
    this.robotNodes.root.rotation.z = ROBOT_ROTATION.roll;

    // Dynamically project the robot face center to calibrate cursor gaze origin
    // When cursor is placed directly on the face, the robot looks completely straight ahead
    this.robotNodes.root.updateMatrixWorld(true);
    const faceTarget = this.robotNodes.faceVisor || this.robotNodes.head;
    if (faceTarget) {
      faceTarget.getWorldPosition(this._tempFacePos);
      this._tempFacePos.project(this.cameraManager.camera);
      const relX = this._tempFacePos.x * 0.5 + 0.5;
      const relY = (1 - this._tempFacePos.y) * 0.5;
      this.interaction.setFacePosition(relX, relY);
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.container) {
          const width = Math.max(entry.contentRect.width, 1);
          const height = Math.max(entry.contentRect.height, 1);
          const aspect = width / height;

          this.renderer.setSize(width, height);
          this.cameraManager.updateAspect(aspect);
          this.updateRobotTransform();
        }
      }
    });

    this.resizeObserver.observe(this.container);
  }

  private onVisibilityChange(): void {
    this.isVisible = document.visibilityState === 'visible';
    if (this.isVisible) {
      this.lastTime = performance.now();
      if (this.isRunning && !this.animFrameId) {
        this.loop();
      }
    } else {
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = (): void => {
    if (!this.isRunning || !this.isVisible) return;

    const now = performance.now();
    const dt = Math.max((now - this.lastTime) / 1000, 0.001);
    this.lastTime = now;

    // 1. Process Interaction State
    const interactionState = this.interaction.getState();

    if (this.controller) {
      this.controller.setReducedMotion(interactionState.reducedMotion);

      // High-precision 3D raycast tracking across viewport
      this.controller.setPointerTarget(
        interactionState.clientX,
        interactionState.clientY,
        interactionState.isHovered,
        interactionState.speed
      );

      // Symmetrical 2D normalized target
      this.controller.setLookTarget(
        interactionState.targetX,
        interactionState.targetY,
        interactionState.speed
      );
      // isHovered=false means cursor left browser window; mark interacting=false for idle breathing
      this.controller.setInteractionState(interactionState.isHovered);

      this.controller.update(dt);
    }

    // 2. Update AnimationMixer if present
    if (this.mixer) {
      this.mixer.update(dt);
    }

    // 3. Render
    this.renderer.render(this.scene, this.cameraManager.camera);

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Diagnostic / Feature Controls (Section 9)
   */
  public toggleDebugMode(): boolean {
    if (!this.debugManager) return false;
    return this.debugManager.toggleDebugMode();
  }

  public setDebugMode(enabled: boolean): void {
    this.debugManager?.setDebugMode(enabled);
  }

  public isDebugMode(): boolean {
    return this.debugManager ? this.debugManager.isDebugEnabled() : false;
  }

  public getDebugStats(): DebugStats | null {
    return this.debugManager ? this.debugManager.getStats() : null;
  }

  public getController(): RobotController | null {
    return this.controller;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.cameraManager.camera;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public setWireframe(enabled: boolean): void {
    this.debugManager?.setDebugMode(enabled);
  }

  public toggleExplodedView(): boolean {
    const torsoCtrl = this.controller?.getTorsoController();
    const armCtrl = this.controller?.getArmController();
    const legCtrl = this.controller?.getLegController();
    let active = false;
    if (torsoCtrl) {
      active = torsoCtrl.toggleExplodedView();
    }
    if (armCtrl) {
      armCtrl.setExplodedView(active);
    }
    if (legCtrl) {
      legCtrl.setExplodedProgress(active ? 1 : 0);
    }
    return active;
  }

  public isExplodedView(): boolean {
    const torsoCtrl = this.controller?.getTorsoController();
    return torsoCtrl ? torsoCtrl.isExplodedActive() : false;
  }

  public resetGaze(): void {
    this.interaction.setLookTarget(0, 0);
    this.controller?.setIdleState();
  }

  public dispose(): void {
    this.stop();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    document.removeEventListener('visibilitychange', this.boundVisibilityChange);
    this.interaction.dispose();
    this.controller?.dispose();
    this.debugManager?.dispose();

    if (this.scene.environment) {
      this.scene.environment.dispose();
      this.scene.environment = null;
    }

    deepDispose(this.scene);

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
