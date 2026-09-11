import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createProceduralRobot, RobotNodes } from './RobotProceduralFactory';
import { createRobotMaterials } from '../materials/RobotMaterials';

export interface LoadRobotResult {
  nodes: RobotNodes;
  source: 'glb' | 'procedural';
  mixer?: THREE.AnimationMixer;
}

/**
 * Loads the 3D robot model from `/models/robot.glb` with fuzzy node resolution,
 * or gracefully falls back to the in-engine procedural factory if unavailable.
 */
export async function loadRobotModel(url?: string): Promise<LoadRobotResult> {
  if (!url) {
    const proceduralNodes = createProceduralRobot();
    return { nodes: proceduralNodes, source: 'procedural' };
  }

  const loader = new GLTFLoader();

  try {
    const gltf = await loader.loadAsync(url);
    console.info('[RobotLoader] Successfully loaded GLB asset from:', url);

    const scene = gltf.scene;
    const ledMeshes: THREE.Mesh[] = [];

    // Helper to find nodes by regex
    const findNode = (pattern: RegExp): THREE.Object3D | null => {
      let match: THREE.Object3D | null = null;
      scene.traverse((obj) => {
        if (!match && pattern.test(obj.name)) {
          match = obj;
        }
      });
      return match;
    };

    // Find all LED / emissive meshes
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (
          /eye|glow|light|led|violet|blue|crest|logo/i.test(mesh.name) ||
          ((mesh.material as THREE.MeshStandardMaterial)?.emissive &&
            (mesh.material as THREE.MeshStandardMaterial).emissive.getHex() > 0)
        ) {
          ledMeshes.push(mesh);
        }
      }
    });

    // Ensure or proxy essential nodes
    const root = (findNode(/^RobotRoot$/i) as THREE.Group) || scene;
    const torso = (findNode(/torso|chest|body/i) as THREE.Group) || createProxyGroup('Torso', root);
    const neck = (findNode(/neck|cervical/i) as THREE.Group) || createProxyGroup('Neck', torso);
    const head = (findNode(/head|skull|cranial/i) as THREE.Group) || createProxyGroup('Head', neck);

    const faceVisor = (findNode(/visor|faceshield/i) as THREE.Mesh) || createProxyMesh('FaceVisor', head);
    const eyeTrackingGroup =
      (findNode(/eyetracking|eyesgroup/i) as THREE.Group) || createProxyGroup('EyeTrackingGroup', head);
    const eyeLeft = (findNode(/eye.*l|l.*eye/i) as THREE.Mesh) || createProxyMesh('EyeLeft', eyeTrackingGroup);
    const eyeRight = (findNode(/eye.*r|r.*eye/i) as THREE.Mesh) || createProxyMesh('EyeRight', eyeTrackingGroup);
    const visorLightBar =
      (findNode(/visorlight|lightbar/i) as THREE.Mesh) || createProxyMesh('VisorLightBar', eyeTrackingGroup);

    const earRingLeft =
      (findNode(/ear.*l|l.*ear/i) as THREE.Mesh) || createProxyMesh('EarRingLeft', head);
    const earRingRight =
      (findNode(/ear.*r|r.*ear/i) as THREE.Mesh) || createProxyMesh('EarRingRight', head);

    const chestLogo =
      (findNode(/logo|crest|chest.*a/i) as THREE.Mesh) || createProxyMesh('ChestLogoA', torso);

    const leftShoulder =
      (findNode(/shoulder.*l|l.*shoulder/i) as THREE.Group) || createProxyGroup('LeftShoulder', torso);
    const rightShoulder =
      (findNode(/shoulder.*r|r.*shoulder/i) as THREE.Group) || createProxyGroup('RightShoulder', torso);

    const leftUpperArm =
      (findNode(/upperarm.*l|arm.*l|bicep.*l/i) as THREE.Group) ||
      createProxyGroup('LeftUpperArm', leftShoulder);
    const rightUpperArm =
      (findNode(/upperarm.*r|arm.*r|bicep.*r/i) as THREE.Group) ||
      createProxyGroup('RightUpperArm', rightShoulder);

    const leftForearm =
      (findNode(/forearm.*l|elbow.*l/i) as THREE.Group) || createProxyGroup('LeftForearm', leftUpperArm);
    const rightForearm =
      (findNode(/forearm.*r|elbow.*r/i) as THREE.Group) || createProxyGroup('RightForearm', rightUpperArm);

    const leftHand = (findNode(/hand.*l|l.*hand/i) as THREE.Group) || createProxyGroup('LeftHand', leftForearm);
    const rightHand = (findNode(/hand.*r|r.*hand/i) as THREE.Group) || createProxyGroup('RightHand', rightForearm);

    const leftLeg = (findNode(/leg.*l|thigh.*l|hip.*l/i) as THREE.Group) || createProxyGroup('LeftLeg', torso);
    const rightLeg = (findNode(/leg.*r|thigh.*r|hip.*r/i) as THREE.Group) || createProxyGroup('RightLeg', torso);
    const leftFoot = (findNode(/foot.*l|l.*foot/i) as THREE.Group) || createProxyGroup('LeftFoot', leftLeg);
    const rightFoot = (findNode(/foot.*r|r.*foot/i) as THREE.Group) || createProxyGroup('RightFoot', rightLeg);

    let mixer: THREE.AnimationMixer | undefined;
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(root);
      gltf.animations.forEach((clip) => mixer?.clipAction(clip).play());
    }

    const mats = createRobotMaterials();
    const nodes: RobotNodes = {
      root,
      torso,
      chestLogo,
      neck,
      head,
      faceVisor,
      eyeTrackingGroup,
      eyeLeft,
      eyeRight,
      visorLightBar,
      earRingLeft,
      earRingRight,
      leftShoulder,
      rightShoulder,
      leftUpperArm,
      rightUpperArm,
      leftForearm,
      rightForearm,
      leftHand,
      rightHand,
      leftLeg,
      rightLeg,
      leftFoot,
      rightFoot,
      ledMeshes,
      materials: {
        armor: mats.armor,
        joint: mats.joint,
        visor: mats.visor,
        eyeGlow: mats.purpleEmissive,
        earRingGlow: mats.purpleEmissive,
        chestGlow: mats.purpleEmissive,
        accentGlow: mats.purpleEmissive,
      },
    };

    return { nodes, source: 'glb', mixer };
  } catch (err) {
    console.warn('[RobotLoader] Failed to load GLB from:', url, '- Falling back to procedural 3D model.', err);
    const proceduralNodes = createProceduralRobot();
    return { nodes: proceduralNodes, source: 'procedural' };
  }
}

function createProxyGroup(name: string, parent?: THREE.Object3D): THREE.Group {
  const g = new THREE.Group();
  g.name = name;
  if (parent) parent.add(g);
  return g;
}

function createProxyMesh(name: string, parent?: THREE.Object3D): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BufferGeometry());
  m.name = name;
  if (parent) parent.add(m);
  return m;
}
