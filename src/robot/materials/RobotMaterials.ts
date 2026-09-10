import * as THREE from 'three';
import { ROBOT_CONFIG, ROBOT_ACCENT } from '../config';

export interface RobotMaterialPalette {
  armor: THREE.MeshPhysicalMaterial;
  armorDoubleSide: THREE.MeshPhysicalMaterial;
  visor: THREE.MeshPhysicalMaterial;
  joint: THREE.MeshPhysicalMaterial;
  jointDoubleSide: THREE.MeshPhysicalMaterial;
  visorOuterFrame: THREE.MeshPhysicalMaterial;
  purpleEmissive: THREE.MeshBasicMaterial;
  whiteCoreEmissive: THREE.MeshBasicMaterial;
  purpleBloom: THREE.MeshBasicMaterial;
}

/**
 * Creates unified PBR materials adhering to P3:
 * - White Ceramic Armor: dimensional gradient shading, realistic specular roll-off, satiny sheen, no pure #ffffff clipping
 * - Black Mechanical Components: gunmetal titanium with controlled reflections, specular highlights, and ambient depth
 * - Obsidian Visor: deep obsidian black with mirror clearcoat
 * - Purple Emissive: subtle and controlled brand accent
 */
export function createRobotMaterials(): RobotMaterialPalette {
  const cfg = ROBOT_CONFIG;

  const armor = new THREE.MeshPhysicalMaterial({
    color: cfg.colors.armorWhite,
    roughness: cfg.materials.armorRoughness,
    metalness: cfg.materials.armorMetalness,
    clearcoat: cfg.materials.armorClearcoat,
    clearcoatRoughness: cfg.materials.armorClearcoatRoughness,
    sheen: 0.32,
    sheenColor: new THREE.Color(0x9ca8c8),
    sheenRoughness: 0.35,
    reflectivity: 0.88,
    name: 'RobotWhiteArmorMaterial',
  });

  const armorDoubleSide = armor.clone();
  armorDoubleSide.side = THREE.DoubleSide;
  armorDoubleSide.name = 'RobotWhiteArmorDoubleSideMaterial';

  const visor = new THREE.MeshPhysicalMaterial({
    color: cfg.colors.visorGlass,
    roughness: cfg.materials.visorRoughness,
    metalness: cfg.materials.visorMetalness,
    clearcoat: cfg.materials.visorClearcoat,
    clearcoatRoughness: cfg.materials.visorClearcoatRoughness,
    reflectivity: 0.99,
    ior: 1.58,
    name: 'RobotObsidianVisorMaterial',
  });

  const joint = new THREE.MeshPhysicalMaterial({
    color: cfg.colors.jointDark,
    roughness: cfg.materials.jointRoughness,
    metalness: cfg.materials.jointMetalness,
    clearcoat: 0.45,
    clearcoatRoughness: 0.18,
    reflectivity: 0.92,
    name: 'RobotDarkTitaniumMaterial',
  });

  const jointDoubleSide = joint.clone();
  jointDoubleSide.side = THREE.DoubleSide;
  jointDoubleSide.name = 'RobotDarkTitaniumDoubleSideMaterial';

  const visorOuterFrame = new THREE.MeshPhysicalMaterial({
    color: 0x101218,
    roughness: 0.32,
    metalness: 0.88,
    clearcoat: 0.35,
    clearcoatRoughness: 0.22,
    name: 'RobotVisorOuterFrameMaterial',
  });

  const purpleEmissive = new THREE.MeshBasicMaterial({
    color: ROBOT_ACCENT,
    toneMapped: false,
    name: 'RobotPurpleEmissiveMaterial',
  });

  const whiteCoreEmissive = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
    name: 'RobotWhiteCoreEmissiveMaterial',
  });

  const purpleBloom = new THREE.MeshBasicMaterial({
    color: ROBOT_ACCENT,
    transparent: true,
    opacity: 0.18,
    toneMapped: false,
    name: 'RobotPurpleBloomMaterial',
  });

  return {
    armor,
    armorDoubleSide,
    visor,
    joint,
    jointDoubleSide,
    visorOuterFrame,
    purpleEmissive,
    whiteCoreEmissive,
    purpleBloom,
  };
}
