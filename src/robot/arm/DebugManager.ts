import * as THREE from 'three';

export interface DebugStats {
  triangleCount: number;
  armTriangleCount: number;
  vertexCount: number;
  meshCount: number;
}

/**
 * Developer Debug Mode Manager adhering to Section 9:
 * - Wireframe overlay toggle
 * - Joint pivot axes visualization (THREE.AxesHelper)
 * - Polygon / Triangle count measurement
 * - toggleDebugMode()
 */
export class DebugManager {
  private targetGroup: THREE.Group;
  private isEnabled: boolean = false;
  private axesHelpers: THREE.AxesHelper[] = [];
  private originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]> = new Map();

  constructor(targetGroup: THREE.Group) {
    this.targetGroup = targetGroup;
  }

  /**
   * Calculates total triangle, vertex, and mesh count in the robot model and per-arm.
   */
  public getStats(): DebugStats {
    let triangleCount = 0;
    let armTriangleCount = 0;
    let vertexCount = 0;
    let meshCount = 0;

    this.targetGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        meshCount++;
        const geo = mesh.geometry;
        if (geo) {
          let count = 0;
          if (geo.index) {
            count = geo.index.count / 3;
          } else if (geo.attributes.position) {
            count = geo.attributes.position.count / 3;
          }
          triangleCount += count;
          if (geo.attributes.position) {
            vertexCount += geo.attributes.position.count;
          }

          // Check if mesh is in Left Arm
          let parent: THREE.Object3D | null = mesh.parent;
          let isInLeftArm = false;
          while (parent) {
            if (parent.name === 'LeftArmRoot') {
              isInLeftArm = true;
              break;
            }
            parent = parent.parent;
          }
          if (isInLeftArm) {
            armTriangleCount += count;
          }
        }
      }
    });

    return {
      triangleCount: Math.round(triangleCount),
      armTriangleCount: Math.round(armTriangleCount),
      vertexCount,
      meshCount,
    };
  }

  /**
   * Toggles debug visuals (wireframe overlay + joint pivot axes).
   */
  public toggleDebugMode(): boolean {
    this.setDebugMode(!this.isEnabled);
    return this.isEnabled;
  }

  public setDebugMode(enabled: boolean): void {
    if (this.isEnabled === enabled) return;
    this.isEnabled = enabled;

    if (enabled) {
      this.enableWireframe();
      this.attachAxesHelpers();
    } else {
      this.disableWireframe();
      this.removeAxesHelpers();
    }
  }

  public isDebugEnabled(): boolean {
    return this.isEnabled;
  }

  private enableWireframe(): void {
    this.targetGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!this.originalMaterials.has(mesh)) {
          this.originalMaterials.set(mesh, mesh.material);
        }

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if ('wireframe' in mat) (mat as any).wireframe = true;
          });
        } else if (mesh.material && 'wireframe' in mesh.material) {
          (mesh.material as any).wireframe = true;
        }
      }
    });
  }

  private disableWireframe(): void {
    this.targetGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if ('wireframe' in mat) (mat as any).wireframe = false;
          });
        } else if (mesh.material && 'wireframe' in mesh.material) {
          (mesh.material as any).wireframe = false;
        }
      }
    });
  }

  private attachAxesHelpers(): void {
    this.removeAxesHelpers();

    // Attach small axes helper (0.04m length) to all named pivot groups
    this.targetGroup.traverse((child) => {
      if (child.type === 'Group' && child.name && !child.name.includes('Mesh')) {
        const axes = new THREE.AxesHelper(0.04);
        axes.name = `DebugAxes_${child.name}`;
        axes.renderOrder = 999;
        (axes.material as THREE.Material).depthTest = false;
        child.add(axes);
        this.axesHelpers.push(axes);
      }
    });
  }

  private removeAxesHelpers(): void {
    this.axesHelpers.forEach((axes) => {
      if (axes.parent) {
        axes.parent.remove(axes);
      }
      axes.dispose();
    });
    this.axesHelpers = [];
  }

  public dispose(): void {
    this.setDebugMode(false);
    this.originalMaterials.clear();
  }
}
