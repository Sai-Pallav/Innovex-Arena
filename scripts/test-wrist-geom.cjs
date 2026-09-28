const THREE = require('three');

function createSquircleCuffGeometry(
  width = 0.0436,
  depth = 0.0336,
  height = 0.0120,
  power = 3.2
) {
  const radialSegments = 48;
  const a = width * 0.5;
  const b = depth * 0.5;

  // Longitudinal profile definitions (y, scale)
  const profile = [
    { y:  0.0000, scale: 0.88 }, // Top lid inner rim
    { y: -0.0008, scale: 0.98 }, // Top chamfer
    { y: -0.0020, scale: 1.00 }, // Upper flank
    { y: -0.0060, scale: 1.015 }, // Mid bulge
    { y: -0.0100, scale: 1.00 }, // Lower flank
    { y: -0.0112, scale: 0.98 }, // Bottom chamfer
    { y: -0.0120, scale: 0.90 }, // Bottom lid inner rim
  ];

  const heightSegments = profile.length - 1;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let j = 0; j <= heightSegments; j++) {
    const p = profile[j];
    const curA = a * p.scale;
    const curB = b * p.scale;
    const v = j / heightSegments;

    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments;
      const theta = u * Math.PI * 2;

      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const sX = Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / power);
      const sZ = Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / power);

      positions.push(curA * sX, p.y, curB * sZ);
      uvs.push(u, v);
    }
  }

  // Quads between profile rings
  for (let j = 0; j < heightSegments; j++) {
    for (let i = 0; i < radialSegments; i++) {
      const p1 = j * (radialSegments + 1) + i;
      const p2 = p1 + 1;
      const p3 = (j + 1) * (radialSegments + 1) + i;
      const p4 = p3 + 1;

      indices.push(p1, p3, p2);
      indices.push(p2, p3, p4);
    }
  }

  // Top cap center vertex
  const topCenterIndex = positions.length / 3;
  positions.push(0, 0, 0);
  uvs.push(0.5, 0.5);

  for (let i = 0; i < radialSegments; i++) {
    indices.push(topCenterIndex, i, i + 1);
  }

  // Bottom cap center vertex
  const botCenterIndex = positions.length / 3;
  positions.push(0, -height, 0);
  uvs.push(0.5, 0.5);

  const botRingStart = heightSegments * (radialSegments + 1);
  for (let i = 0; i < radialSegments; i++) {
    indices.push(botCenterIndex, botRingStart + i + 1, botRingStart + i);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const geo = createSquircleCuffGeometry();
geo.computeBoundingBox();
console.log('Bounding Box Min:', geo.boundingBox.min);
console.log('Bounding Box Max:', geo.boundingBox.max);
console.log('Vertex Count:', geo.attributes.position.count);
console.log('Index Count:', geo.index.count);
