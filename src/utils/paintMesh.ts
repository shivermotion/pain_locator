import * as THREE from 'three';

export function ensureVertexColors(mesh: THREE.Mesh) {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  if (!geometry.attributes.color) {
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++) {
      colors[i * 3 + 0] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }
}

export function resetMeshColors(mesh: THREE.Mesh, color: THREE.Color = new THREE.Color(1, 1, 1)) {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  const position = geometry.attributes.position as THREE.BufferAttribute;
  let colors = geometry.attributes.color as THREE.BufferAttribute;
  if (!colors) {
    ensureVertexColors(mesh);
    colors = geometry.attributes.color as THREE.BufferAttribute;
  }
  for (let i = 0; i < position.count; i++) {
    colors.setXYZ(i, color.r, color.g, color.b);
  }
  colors.needsUpdate = true;
}

export function paintOnMesh(
  mesh: THREE.Mesh,
  worldPoint: THREE.Vector3,
  radius: number,
  color: THREE.Color
) {
  ensureVertexColors(mesh);
  const geometry = mesh.geometry as THREE.BufferGeometry;
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const colors = geometry.attributes.color as THREE.BufferAttribute;

  const vertex = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    mesh.localToWorld(vertex);
    const dist = vertex.distanceTo(worldPoint);
    if (dist <= radius) {
      const t = 1 - dist / radius;
      const r = colors.getX(i);
      const g = colors.getY(i);
      const b = colors.getZ(i);
      colors.setXYZ(
        i,
        THREE.MathUtils.lerp(r, color.r, t),
        THREE.MathUtils.lerp(g, color.g, t),
        THREE.MathUtils.lerp(b, color.b, t)
      );
    }
  }
  colors.needsUpdate = true;
}


