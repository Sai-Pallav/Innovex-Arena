import * as THREE from 'three';
import { CameraManager } from './camera';
import { createStudioLighting, SceneLights } from './lighting';
import { loadRobotModel, LoadRobotResult } from '../robot/RobotLoader';
import { RobotController } from '../robot/RobotController';
import { RobotInteraction } from '../robot/RobotInteraction';
import { getOptimalPixelRatio, deepDispose } from '../utils/performance';
import { getViewportDimensions } from '../utils/responsiveness';
import { ROBOT_CONFIG } from '../config';

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
  private interaction: RobotInteraction;
  private mixer?: THREE.AnimationMixer;

  private isRunning: boolean = false;
  private isVisible: boolean = true;
  private animFrameId: number | null = null;
  private lastTime: number = performance.now();
  private resizeObserver: ResizeObserver | null = null;
  private boundVisibilityChange: () => void;

  public isReady: boolean = false;
  public modelSource: 'glb' | 'procedural' = 'procedural';

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
    this.renderer.setPixelRatio(getOptimalPixelRatio(ROBOT_CONFIG.maxPixelRatio));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

      // Initialize kinematics controller
      this.controller = new RobotController(result.nodes);

      this.isReady = true;
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

      if (interactionState.isHovered) {
        this.controller.setLookTarget(
          interactionState.targetX,
          interactionState.targetY,
          interactionState.speed
        );
      } else {
        this.controller.setIdleState();
      }

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
   * Diagnostic / Feature Controls
   */
  public setWireframe(enabled: boolean): void {
    this.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => ((m as THREE.MeshStandardMaterial).wireframe = enabled));
        } else if (mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).wireframe = enabled;
        }
      }
    });
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

    deepDispose(this.scene);

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
