import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createChestAssembly } from '../src/robot/torso/ChestAssembly';

const mats = createRobotMaterials();
const chest = createChestAssembly(mats);

console.log('=== CHEST SIDE PANEL EDGE VERTICES ===');

const sidePanel = chest.chestArmor.leftPanel;
sidePanel.updateMatrixWorld(true);

const geo = sidePanel.geometry;
const pos = geo.attributes.position;
const v = new THREE.Vector3();

// Sample vertices on the outer edge (most negative X in world space)
const vertices: { x: number; y: number; z: number }[] = [];
for (let i = 0; i < pos.count; i++) {
  v.fromBufferAttribute(pos, i).applyMatrix4(sidePanel.matrixWorld);
  vertices.push({ x: v.x, y: v.y, z: v.z });
}

// Sort by Y to trace the outer profile from top (Y max) to bottom (Y min)
vertices.sort((a, b) => b.y - a.y);

console.log(`Total vertices in side panel: ${vertices.length}`);
const yBands = [0.15, 0.12, 0.09, 0.06, 0.03, 0.00, -0.03, -0.06];
for (const yTarget of yBands) {
  const inBand = vertices.filter(p => Math.abs(p.y - yTarget) < 0.015);
  if (inBand.length > 0) {
    // find point with min X (outer edge for left side)
    inBand.sort((a, b) => a.x - b.x);
    const outer = inBand[0];
    console.log(`Y ~ ${yTarget.toFixed(2)}: outer X = ${outer.x.toFixed(4)}, Y = ${outer.y.toFixed(4)}, Z = ${outer.z.toFixed(4)}`);
  }
}
