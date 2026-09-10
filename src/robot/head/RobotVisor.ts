import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';
import { ROBOT_CONFIG } from '../config';

export interface VisorAssemblyNodes {
  group: THREE.Group;
  visorMesh: THREE.Mesh;
  outerFrame: THREE.Mesh;
  getSurfacePoint: (u: number, v: number, offset?: number) => THREE.Vector3;
}

/**
 * Evaluates points on the expansive panoramic compound-curved face visor.
 * Matching the reference image:
 * - Broad panoramic visor spanning from brow arch (y ≈ +0.092) down to jaw/chin (y ≈ -0.062)
 * - Horizontal LED line at v = 0.46 corresponds exactly to y ≈ +0.020 (aligned with ear module center)
 * - Sweeps back towards the ears (z from +0.158 back to -0.010)
 * - Smooth compound spherical/cylindrical curvature with liquid reflections
 */
export function getVisorSurfacePoint(u: number, v: number, offset: number = 0): THREE.Vector3 {
  // phi spans from right ear (-halfAngle) to left ear (+halfAngle)
  const angleSpan = 1.08; // ~62 degrees each side
  const phi = (u - 0.5) * 2 * angleSpan;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  // Top brow arch (higher at center phi=0, curves down at temples)
  const topY = 0.092 - 0.038 * (1.0 - cosPhi);
  // Bottom jaw contour (tapers inward towards chin)
  const bottomY = -0.062 - 0.012 * cosPhi;

  // Vertical interpolation between top brow and bottom jaw
  const y = topY + v * (bottomY - topY);

  // Curvature dynamics: bulges forward at mid-face
  const vProfile = Math.sin(v * Math.PI);
  const rx = 0.132 + 0.008 * vProfile + offset;
  const rz = 0.156 + 0.012 * vProfile + offset;
  const zCenter = -0.010 - 0.010 * v;

  const x = rx * sinPhi;
  // Compound forward bulge creating rich liquid reflections
  const z = zCenter + rz * cosPhi + 0.008 * Math.cos(phi * 1.5) * vProfile;

  return new THREE.Vector3(x, y, z);
}

/**
 * Creates the glossy obsidian face visor and recessed dark outer frame.
 * Matches Reference Image: expansive, tall, curved face shield with mirror clearcoat.
 */
export function createRobotVisor(materials: RobotMaterialPalette): VisorAssemblyNodes {
  const group = new THREE.Group();
  group.name = 'VisorAssembly';

  const uSegments = 54;
  const vSegments = 36;

  // 1. Glossy Black Face Visor Surface (Part 4 & 5)
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= vSegments; iv++) {
    const v = iv / vSegments;
    for (let iu = 0; iu <= uSegments; iu++) {
      const u = iu / uSegments;
      const pt = getVisorSurfacePoint(u, v, 0.0);
      positions.push(pt.x, pt.y, pt.z);
      uvs.push(u, v);
    }
  }

  for (let iv = 0; iv < vSegments; iv++) {
    for (let iu = 0; iu < uSegments; iu++) {
      const a = iv * (uSegments + 1) + iu;
      const b = (iv + 1) * (uSegments + 1) + iu;
      const c = (iv + 1) * (uSegments + 1) + (iu + 1);
      const d = iv * (uSegments + 1) + (iu + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const visorGeo = new THREE.BufferGeometry();
  visorGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  visorGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  visorGeo.setIndex(indices);
  visorGeo.computeVertexNormals();

  const visorMesh = new THREE.Mesh(visorGeo, materials.visor);
  visorMesh.name = 'BlackVisor';
  visorMesh.castShadow = true;
  visorMesh.receiveShadow = true;
  group.add(visorMesh);

  // 2. Visor Outer Frame / Gasket Rim (Part 4 Layering)
  // Thin dark titanium perimeter frame sealing the visor into the white armor
  const frameCurvePoints: THREE.Vector3[] = [];
  // Top brow curve
  for (let iu = 0; iu <= 36; iu++) {
    frameCurvePoints.push(getVisorSurfacePoint(iu / 36, 0.0, -0.001));
  }
  // Left temple down
  for (let iv = 0; iv <= 18; iv++) {
    frameCurvePoints.push(getVisorSurfacePoint(1.0, iv / 18, -0.001));
  }
  // Bottom jaw rim
  for (let iu = 36; iu >= 0; iu--) {
    frameCurvePoints.push(getVisorSurfacePoint(iu / 36, 1.0, -0.001));
  }
  // Right temple up
  for (let iv = 18; iv >= 0; iv--) {
    frameCurvePoints.push(getVisorSurfacePoint(0.0, iv / 18, -0.001));
  }

  const frameCurve = new THREE.CatmullRomCurve3(frameCurvePoints, true);
  const frameGeo = new THREE.TubeGeometry(frameCurve, 80, 0.0032, 8, true);
  const outerFrame = new THREE.Mesh(frameGeo, materials.visorOuterFrame);
  outerFrame.name = 'VisorOuterFrame';
  outerFrame.castShadow = true;
  group.add(outerFrame);

  return {
    group,
    visorMesh,
    outerFrame,
    getSurfacePoint: getVisorSurfacePoint,
  };
}
