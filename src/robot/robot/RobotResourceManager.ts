import * as THREE from 'three';
import { ROBOT_ROTATION } from '../config';
import { createRobotMaterials, RobotMaterialPalette } from '../materials/RobotMaterials';
import { createRobotHead } from '../head/RobotHead';
import { createRobotArm } from '../arm/RobotArm';
import { createRobotTorso, RobotTorsoNodes } from '../torso/RobotTorso';
import { createChestAssembly } from '../torso/ChestAssembly';
import { createStomachAssembly } from '../torso/AbdomenAssembly';
import { createWaistAssembly } from '../torso/WaistAssembly';
import { TORSO_CONFIG } from '../torso/TorsoConfig';
import { createRobotLeg } from '../leg/RobotLeg';
import { RobotNodes } from './RobotProceduralFactory';
import { deepDispose } from '../utils/performance';

/**
 * Explicit Resource Lifecycle States (Priority 1 Solution Strategy F)
 */
export enum ResourceLifecycleState {
  NOT_STARTED = 'NOT_STARTED',
  GENERATING = 'GENERATING',
  READY = 'READY',
  DISPOSING = 'DISPOSING',
  DISPOSED = 'DISPOSED',
}

/**
 * Clones a RobotNodes hierarchy while sharing 100% of BufferGeometries and Materials.
 *
 * RESOURCE OWNERSHIP & SEPARATION:
 * - BufferGeometry (Static): Shared across all instances, owned by RobotResourceManager.
 * - Materials (Static): Shared across all instances, owned by RobotResourceManager.
 * - Object3D Nodes (Instance): Freshly cloned hierarchy for each robot instance.
 * - Controllers & Animations (Instance): Attached strictly to instance nodes.
 */
export function cloneRobotNodes(templateNodes: RobotNodes): RobotNodes {
  const cloneMap = new Map<THREE.Object3D, THREE.Object3D>();

  function cloneTree(source: THREE.Object3D): THREE.Object3D {
    const clone = source.clone(false);
    cloneMap.set(source, clone);
    for (const child of source.children) {
      clone.add(cloneTree(child));
    }
    return clone;
  }

  cloneTree(templateNodes.root);

  function mapValue(val: any): any {
    if (!val) return val;
    if (val.isObject3D) {
      const mapped = cloneMap.get(val);
      if (!mapped) {
        console.warn('[RobotResourceManager] Unmapped Object3D during clone:', val.name || val.type);
      }
      return mapped || val;
    }
    if (Array.isArray(val)) {
      return val.map(mapValue);
    }
    if (typeof val === 'object') {
      const res: any = {};
      for (const k of Object.keys(val)) {
        res[k] = mapValue(val[k]);
      }
      return res;
    }
    return val;
  }

  const clonedNodes: any = {};
  for (const key of Object.keys(templateNodes)) {
    if (key === 'materials') {
      clonedNodes.materials = templateNodes.materials;
    } else {
      clonedNodes[key] = mapValue((templateNodes as any)[key]);
    }
  }

  return clonedNodes as RobotNodes;
}

/**
 * Cooperative event-loop yielding helper.
 * Lets the browser process input, paint DOM changes, and advance CSS/RAF animations
 * between CPU-intensive procedural synthesis chunks.
 */
const yieldToMain = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

/**
 * RobotResourceManager
 *
 * Central authority for procedural robot geometry and material caching, asynchronous
 * chunked generation, in-flight promise deduplication, and safe instance lifecycle management.
 *
 * OWNERSHIP RULES:
 * - Who creates it: RobotResourceManager
 * - Who uses it: RobotScene, RobotCanvas, and runtime controllers
 * - Who owns it: RobotResourceManager
 * - Who disposes it: RobotResourceManager (shared resources) / RobotScene (instance state)
 */
export class RobotResourceManager {
  private static instance: RobotResourceManager | null = null;

  private state: ResourceLifecycleState = ResourceLifecycleState.NOT_STARTED;
  private templateNodes: RobotNodes | null = null;
  private sharedMaterials: RobotMaterialPalette | null = null;
  private generationPromise: Promise<RobotNodes> | null = null;

  private constructor() {}

  public static getInstance(): RobotResourceManager {
    if (!RobotResourceManager.instance) {
      RobotResourceManager.instance = new RobotResourceManager();
    }
    return RobotResourceManager.instance;
  }

  public getState(): ResourceLifecycleState {
    return this.state;
  }

  public isReady(): boolean {
    return this.state === ResourceLifecycleState.READY && this.templateNodes !== null;
  }

  /**
   * Deduplicated asynchronous resource pre-warming.
   * If generation is already underway, returns the existing Promise.
   * If resources are ready, resolves immediately.
   */
  public async ensureResources(): Promise<void> {
    if (this.state === ResourceLifecycleState.READY && this.templateNodes) {
      return;
    }

    if (this.state === ResourceLifecycleState.GENERATING && this.generationPromise) {
      await this.generationPromise;
      return;
    }

    await this.generateResourcesAsync();
  }

  /**
   * Acquires a fresh, lightweight robot instance asynchronously (~14ms when cached).
   * Generates shared template in yielded batches if not already generated.
   */
  public async acquireRobotInstanceAsync(): Promise<RobotNodes> {
    if (this.state !== ResourceLifecycleState.READY || !this.templateNodes) {
      if (this.state === ResourceLifecycleState.GENERATING && this.generationPromise) {
        await this.generationPromise;
      } else {
        await this.generateResourcesAsync();
      }
    }

    if (!this.templateNodes) {
      throw new Error('[RobotResourceManager] Failed to acquire robot instance: template is null');
    }

    return cloneRobotNodes(this.templateNodes);
  }

  /**
   * Synchronous fallback for legacy or headless callers.
   * Uses cached template if available; otherwise performs synchronous generation.
   */
  public acquireRobotInstanceSync(): RobotNodes {
    if (this.templateNodes) {
      return cloneRobotNodes(this.templateNodes);
    }
    const template = this.generateResourcesSync();
    return cloneRobotNodes(template);
  }

  /**
   * Asynchronously synthesizes all procedural robot geometries and materials across
   * cooperative yielded chunks to prevent blocking the browser main thread.
   */
  public generateResourcesAsync(): Promise<RobotNodes> {
    if (this.generationPromise) {
      return this.generationPromise;
    }

    this.state = ResourceLifecycleState.GENERATING;

    this.generationPromise = (async () => {
      try {
        const root = new THREE.Group();
        root.name = 'RobotRoot';
        root.rotation.y = ROBOT_ROTATION.yaw;
        root.rotation.x = ROBOT_ROTATION.pitch;
        root.rotation.z = ROBOT_ROTATION.roll;

        const ledMeshes: THREE.Mesh[] = [];

        // Batch 1: Materials & Root setup
        this.sharedMaterials = createRobotMaterials();
        const materials = this.sharedMaterials;
        await yieldToMain();

        // Batch 2: Torso Chest Assembly
        const torsoRoot = new THREE.Group();
        torsoRoot.name = 'RobotTorso';
        torsoRoot.position.set(0, TORSO_CONFIG.baseY, 0);

        const chestPivot = new THREE.Group();
        chestPivot.name = 'ChestPivot';
        torsoRoot.add(chestPivot);

        const chest = createChestAssembly(materials);
        chestPivot.add(chest.chestArmor.group);
        chestPivot.add(chest.shoulderMountLeft.group);
        chestPivot.add(chest.shoulderMountRight.group);
        chestPivot.add(chest.upperTorsoFrame.group);
        ledMeshes.push(...chest.ledMeshes);
        await yieldToMain();

        // Batch 3: Torso Stomach & Waist Assembly
        const stomachPivot = new THREE.Group();
        stomachPivot.name = 'StomachPivot';
        torsoRoot.add(stomachPivot);

        const stomach = createStomachAssembly(materials);
        stomachPivot.add(stomach.group);
        ledMeshes.push(...stomach.ledMeshes);

        const waist = createWaistAssembly(materials);
        torsoRoot.add(waist.group);
        ledMeshes.push(...waist.ledMeshes);

        const torsoNodes: RobotTorsoNodes = {
          group: torsoRoot,
          chestPivot,
          stomachPivot,
          abdomenPivot: stomachPivot,
          waistPivot: waist.group,
          chestArmor: chest.chestArmor,
          upperTorsoFrame: chest.upperTorsoFrame,
          shoulderMountLeft: chest.shoulderMountLeft,
          shoulderMountRight: chest.shoulderMountRight,
          stomach,
          abdomen: stomach,
          waist,
          ledMeshes,
        };

        root.add(torsoNodes.group);
        const torso = torsoNodes.group;
        const chestLogo = torsoNodes.chestArmor.logo;
        await yieldToMain();

        // Batch 4: Head & Telescoping Neck Assembly
        const headAssembly = createRobotHead(materials);
        torsoNodes.upperTorsoFrame.group.add(headAssembly.neck);
        headAssembly.neck.position.set(0, 0.128, 0.004);

        const head = headAssembly.head;
        const neck = headAssembly.neck;
        const faceVisor = headAssembly.visorAssembly.visorMesh;
        const eyeTrackingGroup = headAssembly.visorLight.group;
        const visorLightBar = headAssembly.visorLight.ledMesh;
        const earRingLeftMesh = headAssembly.leftSideModule.emissiveRing;
        const earRingRightMesh = headAssembly.rightSideModule.emissiveRing;

        const eyeLeft = new THREE.Group() as unknown as THREE.Mesh;
        eyeLeft.name = 'EyeLeft';
        eyeTrackingGroup.add(eyeLeft);
        const eyeRight = new THREE.Group() as unknown as THREE.Mesh;
        eyeRight.name = 'EyeRight';
        eyeTrackingGroup.add(eyeRight);

        ledMeshes.push(...headAssembly.ledMeshes);
        await yieldToMain();

        // Batch 5: Left Arm Assembly
        const leftArmNodes = createRobotArm(-1, materials);
        const leftMount = torsoNodes.shoulderMountLeft.extensionNodes?.armMount || torsoNodes.shoulderMountLeft.group;
        leftMount.add(leftArmNodes.root);
        ledMeshes.push(...leftArmNodes.ledMeshes);
        await yieldToMain();

        // Batch 6: Right Arm Assembly
        const rightArmNodes = createRobotArm(1, materials);
        const rightMount = torsoNodes.shoulderMountRight.extensionNodes?.armMount || torsoNodes.shoulderMountRight.group;
        rightMount.add(rightArmNodes.root);
        ledMeshes.push(...rightArmNodes.ledMeshes);
        await yieldToMain();

        // Batch 7: Left Leg Assembly
        const leftLeg = createRobotLeg(-1, materials);
        leftLeg.root.position.set(0, 0, 0);
        torsoNodes.waist.leftHipPivot.add(leftLeg.root);
        ledMeshes.push(...leftLeg.ledMeshes);
        await yieldToMain();

        // Batch 8: Right Leg Assembly
        const rightLeg = createRobotLeg(1, materials);
        rightLeg.root.position.set(0, 0, 0);
        torsoNodes.waist.rightHipPivot.add(rightLeg.root);
        ledMeshes.push(...rightLeg.ledMeshes);
        await yieldToMain();

        // Batch 9: Node Resolution & Template Assembly
        const leftShoulder = torsoNodes.shoulderMountLeft.group;
        const rightShoulder = torsoNodes.shoulderMountRight.group;
        const leftUpperArm = leftArmNodes.upperArm.group;
        const rightUpperArm = rightArmNodes.upperArm.group;
        const leftForearm = leftArmNodes.elbowPivot;
        const rightForearm = rightArmNodes.elbowPivot;
        const leftHand = leftArmNodes.hand?.group ?? leftArmNodes.wristPivot;
        const rightHand = rightArmNodes.hand?.group ?? rightArmNodes.wristPivot;

        const leftFoot = leftLeg.foot.group;
        const rightFoot = rightLeg.foot.group;

        const template: RobotNodes = {
          root,
          torso,
          torsoNodes,
          chestLogo,
          neck,
          head,
          faceVisor,
          eyeTrackingGroup,
          eyeLeft,
          eyeRight,
          visorLightBar,
          earRingLeft: earRingLeftMesh,
          earRingRight: earRingRightMesh,
          leftShoulder,
          rightShoulder,
          leftUpperArm,
          rightUpperArm,
          leftForearm,
          rightForearm,
          leftHand,
          rightHand,
          leftArmNodes,
          rightArmNodes,
          leftLeg: leftLeg.root,
          rightLeg: rightLeg.root,
          leftFoot,
          rightFoot,
          leftLegNodes: leftLeg,
          rightLegNodes: rightLeg,
          ledMeshes,
          materials: {
            armor: materials.armor,
            joint: materials.joint,
            visor: materials.visor,
            eyeGlow: materials.purpleEmissive,
            earRingGlow: materials.purpleEmissive,
            chestGlow: materials.purpleEmissive,
            accentGlow: materials.purpleEmissive,
          },
        };

        this.templateNodes = template;
        this.state = ResourceLifecycleState.READY;
        return template;
      } catch (err) {
        this.state = ResourceLifecycleState.NOT_STARTED;
        this.generationPromise = null;
        throw err;
      } finally {
        this.generationPromise = null;
      }
    })();

    return this.generationPromise;
  }

  /**
   * Synchronous generation implementation for fallback use.
   */
  public generateResourcesSync(): RobotNodes {
    if (this.templateNodes) return this.templateNodes;

    const root = new THREE.Group();
    root.name = 'RobotRoot';
    root.rotation.y = ROBOT_ROTATION.yaw;
    root.rotation.x = ROBOT_ROTATION.pitch;
    root.rotation.z = ROBOT_ROTATION.roll;

    const ledMeshes: THREE.Mesh[] = [];
    this.sharedMaterials = createRobotMaterials();
    const materials = this.sharedMaterials;

    const torsoNodes = createRobotTorso(materials);
    root.add(torsoNodes.group);
    const torso = torsoNodes.group;
    const chestLogo = torsoNodes.chestArmor.logo;
    ledMeshes.push(...torsoNodes.ledMeshes);

    const headAssembly = createRobotHead(materials);
    torsoNodes.upperTorsoFrame.group.add(headAssembly.neck);
    headAssembly.neck.position.set(0, 0.128, 0.004);

    const head = headAssembly.head;
    const neck = headAssembly.neck;
    const faceVisor = headAssembly.visorAssembly.visorMesh;
    const eyeTrackingGroup = headAssembly.visorLight.group;
    const visorLightBar = headAssembly.visorLight.ledMesh;
    const earRingLeftMesh = headAssembly.leftSideModule.emissiveRing;
    const earRingRightMesh = headAssembly.rightSideModule.emissiveRing;

    const eyeLeft = new THREE.Group() as unknown as THREE.Mesh;
    eyeLeft.name = 'EyeLeft';
    eyeTrackingGroup.add(eyeLeft);
    const eyeRight = new THREE.Group() as unknown as THREE.Mesh;
    eyeRight.name = 'EyeRight';
    eyeTrackingGroup.add(eyeRight);
    ledMeshes.push(...headAssembly.ledMeshes);

    const leftArmNodes = createRobotArm(-1, materials);
    const leftMount = torsoNodes.shoulderMountLeft.extensionNodes?.armMount || torsoNodes.shoulderMountLeft.group;
    leftMount.add(leftArmNodes.root);

    const rightArmNodes = createRobotArm(1, materials);
    const rightMount = torsoNodes.shoulderMountRight.extensionNodes?.armMount || torsoNodes.shoulderMountRight.group;
    rightMount.add(rightArmNodes.root);
    ledMeshes.push(...leftArmNodes.ledMeshes, ...rightArmNodes.ledMeshes);

    const leftShoulder = torsoNodes.shoulderMountLeft.group;
    const rightShoulder = torsoNodes.shoulderMountRight.group;
    const leftUpperArm = leftArmNodes.upperArm.group;
    const rightUpperArm = rightArmNodes.upperArm.group;
    const leftForearm = leftArmNodes.elbowPivot;
    const rightForearm = rightArmNodes.elbowPivot;
    const leftHand = leftArmNodes.hand?.group ?? leftArmNodes.wristPivot;
    const rightHand = rightArmNodes.hand?.group ?? rightArmNodes.wristPivot;

    const leftLeg = createRobotLeg(-1, materials);
    leftLeg.root.position.set(0, 0, 0);
    torsoNodes.waist.leftHipPivot.add(leftLeg.root);

    const rightLeg = createRobotLeg(1, materials);
    rightLeg.root.position.set(0, 0, 0);
    torsoNodes.waist.rightHipPivot.add(rightLeg.root);
    ledMeshes.push(...leftLeg.ledMeshes, ...rightLeg.ledMeshes);

    const leftFoot = leftLeg.foot.group;
    const rightFoot = rightLeg.foot.group;

    const template: RobotNodes = {
      root,
      torso,
      torsoNodes,
      chestLogo,
      neck,
      head,
      faceVisor,
      eyeTrackingGroup,
      eyeLeft,
      eyeRight,
      visorLightBar,
      earRingLeft: earRingLeftMesh,
      earRingRight: earRingRightMesh,
      leftShoulder,
      rightShoulder,
      leftUpperArm,
      rightUpperArm,
      leftForearm,
      rightForearm,
      leftHand,
      rightHand,
      leftArmNodes,
      rightArmNodes,
      leftLeg: leftLeg.root,
      rightLeg: rightLeg.root,
      leftFoot,
      rightFoot,
      leftLegNodes: leftLeg,
      rightLegNodes: rightLeg,
      ledMeshes,
      materials: {
        armor: materials.armor,
        joint: materials.joint,
        visor: materials.visor,
        eyeGlow: materials.purpleEmissive,
        earRingGlow: materials.purpleEmissive,
        chestGlow: materials.purpleEmissive,
        accentGlow: materials.purpleEmissive,
      },
    };

    this.templateNodes = template;
    this.state = ResourceLifecycleState.READY;
    return template;
  }

  /**
   * Disposes an individual robot instance without touching shared static geometries/materials.
   */
  public disposeInstance(nodes: RobotNodes | null): void {
    if (!nodes || !nodes.root) return;
    if (nodes.root.parent) {
      nodes.root.parent.remove(nodes.root);
    }
  }

  /**
   * Explicitly disposes all shared procedural geometries, textures, and materials.
   * Should only be invoked upon full application shutdown or explicit cleanup.
   */
  public disposeSharedResources(): void {
    this.state = ResourceLifecycleState.DISPOSING;

    if (this.templateNodes?.root) {
      deepDispose(this.templateNodes.root);
      this.templateNodes = null;
    }

    if (this.sharedMaterials) {
      Object.values(this.sharedMaterials).forEach((mat) => {
        if (mat && typeof (mat as any).dispose === 'function') {
          (mat as any).dispose();
        }
      });
      this.sharedMaterials = null;
    }

    this.generationPromise = null;
    this.state = ResourceLifecycleState.DISPOSED;
  }
}
