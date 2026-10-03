import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraManager } from './camera';
import { createStudioLighting, SceneLights } from './lighting';
import { loadRobotModel, loadRobotModelSync, LoadRobotResult } from '../robot/RobotLoader';
import { RobotNodes } from '../robot/RobotProceduralFactory';
import { RobotResourceManager } from '../robot/RobotResourceManager';
import { RobotController } from '../robot/RobotController';
import { RobotInteraction } from '../robot/RobotInteraction';
import { getOptimalPixelRatio, deepDispose } from '../utils/performance';
import { getViewportDimensions } from '../utils/responsiveness';
import { ROBOT_CONFIG, ROBOT_SCALE, ROBOT_POSITION, ROBOT_ROTATION } from '../config';
import { DebugManager, DebugStats } from '../arm/DebugManager';
import { RobotLODManager, RobotLODLevel, RobotLODStats } from './RobotLODManager';

export interface RobotSceneOptions {
  container: HTMLElement;
  pmremResolution?: number;
  onLoaded?: (source: 'procedural') => void;
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
  private lodManager: RobotLODManager | null = null;
  private interaction: RobotInteraction;
  private mixer?: THREE.AnimationMixer;
  private robotNodes: RobotNodes | null = null;

  private isRunning: boolean = false;
  private isVisible: boolean = true;
  private isIntersecting: boolean = true;
  private animFrameId: number | null = null;
  private lastTime: number = performance.now();
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private boundVisibilityChange: () => void;

  public isReady: boolean = false;
  public modelSource: 'procedural' = 'procedural';
  private _tempFacePos = new THREE.Vector3();
  private currentPmremResolution: number = 256;

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
    this.setEnvironmentResolution(options.pmremResolution || 256);

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

    // 6. Responsive Resize Observer & Viewport Intersection Observer
    this.setupResizeObserver();
    this.setupIntersectionObserver();

    // 7. Page Visibility Listener
    this.boundVisibilityChange = this.onVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.boundVisibilityChange);

    // 8. Load Model
    this.initModel(options);
  }

  private initModel(options: RobotSceneOptions): void {
    // Asynchronous non-blocking initialization allows React loading spinner to render immediately
    this.initModelAsync(options);
  }

  private initModelSync(options: RobotSceneOptions): void {
    try {
      const result: LoadRobotResult = loadRobotModelSync();
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

      // Initialize Section 13-17 Distance-Based Level of Detail (LOD) Manager
      this.lodManager = new RobotLODManager(result.nodes.root);

      // Pre-warm WebGL shaders for instant zero-hitch initial render
      try {
        this.renderer.compile(this.scene, this.cameraManager.camera);
      } catch (compileErr) {
        // Fallback gracefully if compile is unsupported
      }

      // Render the very first frame immediately onto the WebGL canvas
      this.renderer.render(this.scene, this.cameraManager.camera);

      this.isReady = true;
      (window as any).__robotScene = this;
      (window as any).__setHandPose = (side: any, pose: any, dur?: any) => this.controller?.setHandPose(side, pose, dur);
      if (options.onLoaded) {
        options.onLoaded(this.modelSource);
      }

      this.start();
    } catch (err: any) {
      console.error('[RobotScene] Synchronous initialization failed:', err);
      if (options.onError) {
        options.onError(err);
      }
    }
  }

  private async initModelAsync(options: RobotSceneOptions): Promise<void> {
    try {
      const result: LoadRobotResult = await loadRobotModel();
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

      // Initialize Section 13-17 Distance-Based Level of Detail (LOD) Manager
      this.lodManager = new RobotLODManager(result.nodes.root);

      // Pre-warm WebGL shaders
      try {
        this.renderer.compile(this.scene, this.cameraManager.camera);
      } catch (compileErr) {
        // Fallback gracefully
      }

      this.renderer.render(this.scene, this.cameraManager.camera);

      this.isReady = true;
      (window as any).__robotScene = this;
      (window as any).__setHandPose = (side: any, pose: any, dur?: any) => this.controller?.setHandPose(side, pose, dur);
      if (options.onLoaded) {
        options.onLoaded(this.modelSource);
      }

      this.start();
    } catch (err: any) {
      console.error('[RobotScene] Async initialization failed:', err);
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

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.isIntersecting = entry.isIntersecting;
        if (this.isIntersecting && this.isVisible && this.isRunning && !this.animFrameId) {
          this.lastTime = performance.now();
          this.loop();
        }
      },
      { threshold: 0.01 }
    );

    this.intersectionObserver.observe(this.container);
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
    if (!this.isRunning || !this.isVisible || !this.isIntersecting) return;

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

    // Update distance-based Level of Detail with hysteresis before render
    if (this.lodManager) {
      this.lodManager.update(this.cameraManager.camera);
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

  public getLODManager(): RobotLODManager | null {
    return this.lodManager;
  }

  public setLODLevel(level: RobotLODLevel | null): void {
    this.lodManager?.setForcedLevel(level);
  }

  public updateLOD(): RobotLODLevel {
    return this.lodManager ? this.lodManager.update(this.cameraManager.camera) : RobotLODLevel.LOD0;
  }

  public getLODLevel(): RobotLODLevel {
    if (this.lodManager) {
      this.lodManager.update(this.cameraManager.camera);
      return this.lodManager.getCurrentLevel();
    }
    return RobotLODLevel.LOD0;
  }

  public getLODStats(): RobotLODStats | null {
    if (this.lodManager) {
      this.lodManager.update(this.cameraManager.camera);
      return this.lodManager.getStats(this.cameraManager.camera);
    }
    return null;
  }

  public setEnvironmentResolution(size: number = 256): void {
    if (this.scene.environment) {
      this.scene.environment.dispose();
      this.scene.environment = null;
    }
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.04, 0.1, 100, { size }).texture;
    this.scene.environment = envTexture;
    roomEnv.dispose();
    pmremGenerator.dispose();
    this.currentPmremResolution = size;
  }

  public getEnvironmentResolution(): number {
    return this.currentPmremResolution;
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

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    document.removeEventListener('visibilitychange', this.boundVisibilityChange);
    this.interaction.dispose();
    this.controller?.dispose();
    this.debugManager?.dispose();
    this.lodManager?.dispose();
    this.lodManager = null;

    if (this.scene.environment) {
      this.scene.environment.dispose();
      this.scene.environment = null;
    }

    // Clean up instance-specific robot nodes without destroying shared geometries/materials
    if (this.robotNodes?.root) {
      this.scene.remove(this.robotNodes.root);
      RobotResourceManager.getInstance().disposeInstance(this.robotNodes);
      this.robotNodes = null;
    }

    if (this.lights?.group) {
      this.scene.remove(this.lights.group);
      if (this.lights.contactShadow) {
        this.lights.contactShadow.geometry?.dispose();
        if (Array.isArray(this.lights.contactShadow.material)) {
          this.lights.contactShadow.material.forEach((m) => m.dispose());
        } else {
          this.lights.contactShadow.material?.dispose();
        }
      }
    }

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
