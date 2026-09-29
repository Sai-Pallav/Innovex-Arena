const THREE = require('three');

function createThighFlankGeometry(isLateral, length, width, thickness) {
  const shape = new THREE.Shape();
  const halfW = width * 0.5;
  const halfL = length * 0.5;

  // In 2D shape space:
  // +X is ANTERIOR (+Z in 3D world)
  // -X is POSTERIOR (-Z in 3D world)
  // +Y is SUPERIOR (+Y in 3D world)
  // -Y is INFERIOR (-Y in 3D world)
  const antZ = halfW * 0.70;
  const postZ = -halfW * 0.70;

  shape.moveTo(antZ, halfL); // Anterior top
  shape.lineTo(postZ, halfL * 0.88); // Posterior top
  shape.quadraticCurveTo(-halfW * 1.02, 0, -halfW * 0.65, -halfL * 0.85);
  shape.lineTo(-halfW * 0.50, -halfL);
  // Supracondylar arch framing rotary knee condyle
  shape.quadraticCurveTo(0, -halfL + 0.012, halfW * 0.50, -halfL);
  shape.lineTo(halfW * 0.65, -halfL * 0.85);
  shape.quadraticCurveTo(halfW * 1.02, 0, antZ, halfL);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.0032,
    bevelSize: 0.0026,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.center();

  // Rotate so 2D X (+X anterior) maps to 3D Z (+Z anterior)
  // Standard rotateY(-Math.PI/2):
  // X_3d = -Z_2d
  // Y_3d = Y_2d
  // Z_3d = X_2d
  geo.rotateY(-Math.PI / 2);
  geo.computeVertexNormals();

  return geo;
}

const geo = createThighFlankGeometry(true, 0.156, 0.042, 0.015);
geo.computeBoundingBox();
console.log('Bounds:', {
  min: geo.boundingBox.min,
  max: geo.boundingBox.max
});
