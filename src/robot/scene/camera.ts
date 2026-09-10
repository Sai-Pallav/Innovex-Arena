import * as THREE from 'three';
import { calculateCameraFraming } from '../utils/responsiveness';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  public target: THREE.Vector3;

  constructor(aspect: number) {
    const framing = calculateCameraFraming(aspect);
    this.camera = new THREE.PerspectiveCamera(framing.fov, aspect, 0.1, 50);
    this.camera.position.set(...framing.cameraPosition);
    this.target = new THREE.Vector3(...framing.targetPosition);
    this.camera.lookAt(this.target);
  }

  public updateAspect(aspect: number): void {
    const framing = calculateCameraFraming(aspect);
    this.camera.fov = framing.fov;
    this.camera.aspect = aspect;
    this.camera.position.set(...framing.cameraPosition);
    this.target.set(...framing.targetPosition);
    this.camera.lookAt(this.target);
    this.camera.updateProjectionMatrix();
  }
}
