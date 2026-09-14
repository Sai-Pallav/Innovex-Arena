/**
 * ============================================================================
 * CHEST SHOULDER MOUNT — LATERAL EDGE EXTENSION
 * ============================================================================
 * 
 * Creates a structural extension that grows directly from the chest's lateral
 * edges to form the shoulder mounting foundation.
 * 
 * This is NOT a separate structure attached to the chest.
 * This is the CHEST ITSELF extending outward to create the shoulder mount.
 * 
 * Architecture:
 * 
 *   EXISTING CHEST EDGE (at x = ±172-186mm, curved outward)
 *             ↓
 *   CHEST EDGE EXTENSION (continues chest geometry laterally)
 *             ↓
 *   REINFORCED MOUNTING PLATFORM (integrated shoulder mount)
 *             ↓
 *   [FUTURE: Shoulder joint will attach here]
 * 
 * Key principle: The mount looks like it was MANUFACTURED AS PART OF THE CHEST,
 * not added later.
 * ============================================================================
 */

import * as THREE from 'three';
import { RobotMaterialPalette } from '../materials/RobotMaterials';

export interface ChestShoulderMountNodes {
  group: THREE.Group;
  edgeExtension: THREE.Mesh;
  reinforcementGussets: THREE.Group;
  mountingPlatform: THREE.Mesh;
  ledMeshes: THREE.Mesh[];
}

/**
 * Creates a chest edge extension that forms the shoulder mounting foundation.
 * 
 * The geometry follows the chest's existing design language:
 * - Continues chest curvature
 * - Matches chest bevels
 * - Uses chest material (white armor)
 * - Integrates seamlessly with chest edge
 * 
 * @param side -1 for left, 1 for right
 * @param materials Robot material palette
 */
export function createChestShoulderMount(
  side: -1 | 1,
  materials: RobotMaterialPalette
): ChestShoulderMountNodes {
  const group = new THREE.Group();
  group.name = side === -1 ? 'LeftChestShoulderMount' : 'RightChestShoulderMount';

  const ledMeshes: THREE.Mesh[] = [];

  // ══════════════════════════════════════════════════════════════════════════
  // 1. CHEST EDGE EXTENSION
  // ══════════════════════════════════════════════════════════════════════════
  // This extends the chest's lateral edge outward, following its natural curve.
  // 
  // The existing chest side panel is at x = ±128mm, outer edge at x = ±178-186mm.
  // This extension continues from that edge to x = ±230mm, creating a smooth
  // structural transition.

  const extensionShape = new THREE.Shape();
  
  // Upper edge: continues from chest clavicle region (y ≈ 0.154-0.156)
  // Lower edge: continues from chest lower flank (y ≈ -0.058)
  // Creates a trapezoidal profile that tapers as it extends laterally
  
  // Start at inner edge (connecting to chest)
  extensionShape.moveTo(0, 0.145);
  
  // Curve outward following chest's angular design
  extensionShape.bezierCurveTo(0.015, 0.148, 0.028, 0.145, 0.040, 0.138);
  
  // Upper outer corner
  extensionShape.lineTo(0.050, 0.125);
  
  // Descend along outer edge with slight taper
  extensionShape.bezierCurveTo(0.052, 0.065, 0.050, 0.000, 0.046, -0.050);
  
  // Lower outer corner
  extensionShape.lineTo(0.042, -0.055);
  
  // Curve back toward inner edge
  extensionShape.bezierCurveTo(0.032, -0.058, 0.018, -0.058, 0, -0.055);
  
  // Inner lower corner
  extensionShape.lineTo(0, -0.040);
  
  // Curve back up along inner edge
  extensionShape.bezierCurveTo(-0.002, 0.020, 0, 0.090, 0, 0.145);
  
  extensionShape.closePath();

  const extensionGeo = new THREE.ExtrudeGeometry(extensionShape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelThickness: 0.0055,
    bevelSize: 0.0045,
    bevelSegments: 5,
    curveSegments: 32,
  });
  
  // Center and sculpt the geometry to match chest curvature
  const extPos = extensionGeo.attributes.position;
  for (let i = 0; i < extPos.count; i++) {
    const x = extPos.getX(i);
    const y = extPos.getY(i);
    const z = extPos.getZ(i);
    
    if (z > 0) {
      // Add subtle forward curvature matching chest
      const xNorm = Math.min(1.0, x / 0.050);
      const forwardCurve = Math.sin(xNorm * Math.PI / 2) * 0.008;
      
      // Add slight downward taper
      const yNorm = (y + 0.055) / (0.145 + 0.055);
      const taper = 1.0 - yNorm * 0.06;
      
      extPos.setZ(i, z + forwardCurve);
      extPos.setX(i, x * (1.0 + (1.0 - xNorm) * 0.02));
    }
  }
  extensionGeo.computeVertexNormals();

  const edgeExtension = new THREE.Mesh(extensionGeo, materials.armor);
  edgeExtension.name = 'ChestEdgeExtension';
  // Position to connect with chest outer edge at x = ±186mm
  edgeExtension.position.set(side * 0.186, 0.003, 0.038);
  edgeExtension.rotation.y = side * 0.05; // Slight outward angle
  edgeExtension.rotation.x = -0.04; // Match chest tilt
  edgeExtension.castShadow = true;
  edgeExtension.receiveShadow = true;
  group.add(edgeExtension);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. STRUCTURAL REINFORCEMENT GUSSETS
  // ══════════════════════════════════════════════════════════════════════════
  // Triangular gussets connecting chest edge to mounting platform.
  // These create the visual structural continuity.

  const reinforcementGussets = new THREE.Group();
  reinforcementGussets.name = 'ReinforcementGussets';
  group.add(reinforcementGussets);

  // Upper gusset (connects upper chest edge to mount)
  const upperGussetShape = new THREE.Shape();
  upperGussetShape.moveTo(0, 0);
  upperGussetShape.lineTo(0.032, 0);
  upperGussetShape.bezierCurveTo(0.028, -0.018, 0.018, -0.032, 0, -0.038);
  upperGussetShape.closePath();
  
  const upperGussetGeo = new THREE.ExtrudeGeometry(upperGussetShape, {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.0020,
    bevelSegments: 2,
  });
  
  const upperGusset = new THREE.Mesh(upperGussetGeo, materials.joint);
  upperGusset.position.set(side * 0.198, 0.120, 0.052);
  upperGusset.rotation.y = side * Math.PI / 2;
  upperGusset.rotation.x = side * 0.25;
  upperGusset.castShadow = true;
  reinforcementGussets.add(upperGusset);

  // Lower gusset (connects lower chest edge to mount)
  const lowerGussetShape = new THREE.Shape();
  lowerGussetShape.moveTo(0, 0);
  lowerGussetShape.lineTo(0.028, 0);
  lowerGussetShape.bezierCurveTo(0.024, 0.016, 0.014, 0.028, 0, 0.032);
  lowerGussetShape.closePath();
  
  const lowerGussetGeo = new THREE.ExtrudeGeometry(lowerGussetShape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.0020,
    bevelSegments: 2,
  });
  
  const lowerGusset = new THREE.Mesh(lowerGussetGeo, materials.joint);
  lowerGusset.position.set(side * 0.198, -0.040, 0.048);
  lowerGusset.rotation.y = side * Math.PI / 2;
  lowerGusset.rotation.x = -side * 0.20;
  lowerGusset.castShadow = true;
  reinforcementGussets.add(lowerGusset);

  // Middle reinforcement rib
  const ribGeo = new THREE.BoxGeometry(0.028, 0.006, 0.028);
  const middleRib = new THREE.Mesh(ribGeo, materials.joint);
  middleRib.position.set(side * 0.212, 0.042, 0.050);
  middleRib.rotation.z = side * 0.15;
  middleRib.castShadow = true;
  reinforcementGussets.add(middleRib);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. MOUNTING PLATFORM
  // ══════════════════════════════════════════════════════════════════════════
  // The mounting surface where the future shoulder joint will attach.
  // This follows the chest's material language (white armor outer, dark joint inner).

  const platformShape = new THREE.Shape();
  const platformR = 0.045;
  platformShape.absellipse(0, 0, platformR, platformR, 0, Math.PI * 2, false, 0);
  
  const platformGeo = new THREE.ExtrudeGeometry(platformShape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.0045,
    bevelSize: 0.0035,
    bevelSegments: 4,
    curveSegments: 32,
  });
  platformGeo.center();
  
  // Add subtle sculptural detail
  const platPos = platformGeo.attributes.position;
  for (let i = 0; i < platPos.count; i++) {
    const x = platPos.getX(i);
    const y = platPos.getY(i);
    const z = platPos.getZ(i);
    
    if (z > 0.008) {
      // Slight outer rim raise
      const r = Math.sqrt(x * x + y * y);
      if (r > 0.038) {
        const rimRaise = (r - 0.038) / 0.007;
        platPos.setZ(i, z + rimRaise * 0.003);
      }
    }
  }
  platformGeo.computeVertexNormals();

  const mountingPlatform = new THREE.Mesh(platformGeo, materials.armor);
  mountingPlatform.name = 'MountingPlatform';
  mountingPlatform.rotation.y = Math.PI / 2;
  mountingPlatform.position.set(side * 0.228, 0.042, 0.050);
  mountingPlatform.castShadow = true;
  mountingPlatform.receiveShadow = true;
  group.add(mountingPlatform);

  // Central joint interface (dark internal mechanism showing through)
  const jointInterfaceGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.020, 32);
  const jointInterface = new THREE.Mesh(jointInterfaceGeo, materials.joint);
  jointInterface.rotation.z = Math.PI / 2;
  jointInterface.position.set(side * 0.228, 0.042, 0.050);
  jointInterface.castShadow = true;
  group.add(jointInterface);

  // Inner bearing ring (metallic precision surface)
  const bearingRingGeo = new THREE.TorusGeometry(0.028, 0.0025, 12, 32);
  const bearingRing = new THREE.Mesh(bearingRingGeo, materials.metallic);
  bearingRing.rotation.y = Math.PI / 2;
  bearingRing.position.set(side * 0.228, 0.042, 0.050);
  group.add(bearingRing);

  // Mounting bolt pattern (8 bolts securing future joint)
  for (let b = 0; b < 8; b++) {
    const angle = (b / 8) * Math.PI * 2;
    const boltR = 0.038;
    
    const boltGeo = new THREE.CylinderGeometry(0.0020, 0.0020, 0.012, 8);
    const bolt = new THREE.Mesh(boltGeo, materials.joint);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(
      side * 0.228,
      0.042 + Math.sin(angle) * boltR,
      0.050 + Math.cos(angle) * boltR
    );
    group.add(bolt);
    
    // Bolt socket (recessed hex)
    const socketGeo = new THREE.CylinderGeometry(0.0028, 0.0028, 0.0025, 6);
    const socket = new THREE.Mesh(socketGeo, materials.joint);
    socket.rotation.z = Math.PI / 2;
    socket.position.set(
      side * (0.228 + 0.010),
      0.042 + Math.sin(angle) * boltR,
      0.050 + Math.cos(angle) * boltR
    );
    group.add(socket);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. INTEGRATED PURPLE ACCENT
  // ══════════════════════════════════════════════════════════════════════════
  // Subtle purple LED indicator integrated into the mounting platform,
  // matching the chest's diagonal purple accent lights.

  const accentSlitGeo = new THREE.BoxGeometry(0.0025, 0.016, 0.003);
  const accentSlit = new THREE.Mesh(accentSlitGeo, materials.purpleEmissive);
  accentSlit.name = 'MountAccentSlit';
  accentSlit.position.set(side * 0.238, 0.042, 0.050);
  accentSlit.rotation.y = side * 0.18;
  group.add(accentSlit);
  ledMeshes.push(accentSlit);

  return {
    group,
    edgeExtension,
    reinforcementGussets,
    mountingPlatform,
    ledMeshes,
  };
}
