import * as THREE from 'three';

export type Bounds = {
  min: [number, number, number];
  max: [number, number, number];
};

export type NormalizedPoint = {
  x: number; // left (-1) to right (1)
  y: number; // feet (-1) to head (1)
  z: number; // back (-1) to front (1)
};

export function normalizePoint(point: THREE.Vector3 | { x: number; y: number; z: number }, bounds: Bounds): NormalizedPoint {
  const min = new THREE.Vector3(...bounds.min);
  const max = new THREE.Vector3(...bounds.max);
  const size = new THREE.Vector3().subVectors(max, min);
  const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);

  // Avoid divide-by-zero
  const safe = (v: number) => (v === 0 ? 1 : v);

  const px = point.x;
  const py = point.y;
  const pz = point.z;

  // Map to [-1, 1] per axis relative to center/half-size
  return {
    x: (px - center.x) / safe(size.x / 2),
    y: (py - center.y) / safe(size.y / 2),
    // Assume +Z is front; flip if your model faces -Z
    z: (pz - center.z) / safe(size.z / 2),
  };
}

export type AnatomyMappingResult = {
  region: string;
  side: 'left' | 'right' | 'midline';
  surface: 'front' | 'back' | 'mid';
  bodyParts: string[];
};

// Heuristic mapping based on normalized coordinates
export function mapToAnatomy(norm: NormalizedPoint): AnatomyMappingResult {
  // Vertical segmentation (y)
  // Head/neck (top 20%), chest/torso (20%..55%), abdomen/pelvis (55%..70%), legs (70%..100%)
  const y = norm.y; // -1 feet, 1 head
  const x = norm.x; // -1 left, 1 right (patient's perspective)
  const z = norm.z; // -1 back, 1 front

  const side: 'left' | 'right' | 'midline' = Math.abs(x) < 0.15 ? 'midline' : x < 0 ? 'left' : 'right';
  const surface: 'front' | 'back' | 'mid' = Math.abs(z) < 0.15 ? 'mid' : z > 0 ? 'front' : 'back';

  // Regions and associated parts
  if (y > 0.8) {
    return {
      region: 'head',
      side,
      surface,
      bodyParts: surface === 'front'
        ? ['scalp', 'forehead', 'face', 'sinuses']
        : ['scalp', 'occiput', 'cervical muscles'],
    };
  }

  if (y > 0.6) {
    return {
      region: 'neck',
      side,
      surface,
      bodyParts: surface === 'front'
        ? ['throat', 'trachea', 'thyroid']
        : ['cervical spine', 'trapezius', 'paraspinal muscles'],
    };
  }

  if (y > 0.2) {
    // Upper torso / chest
    const partsFront = ['sternum', 'ribs', 'lungs', 'heart (left)', 'pectoralis'];
    const partsBack = ['thoracic spine', 'ribs', 'paraspinal muscles', 'scapula'];
    return {
      region: 'chest',
      side,
      surface,
      bodyParts: surface === 'front' ? partsFront : partsBack,
    };
  }

  if (y > -0.1) {
    // Abdomen
    const partsFront = side === 'left'
      ? ['stomach', 'spleen', 'descending colon']
      : side === 'right'
      ? ['liver', 'gallbladder', 'ascending colon']
      : ['stomach', 'small intestine', 'aorta'];
    const partsBack = ['lumbar spine', 'paraspinal muscles', 'kidneys'];
    return {
      region: 'abdomen',
      side,
      surface,
      bodyParts: surface === 'front' ? partsFront : partsBack,
    };
  }

  if (y > -0.35) {
    // Pelvis / hips
    const partsFront = ['pelvis', 'bladder', 'inguinal region'];
    const partsBack = ['sacroiliac joint', 'sacrum', 'gluteal muscles'];
    return {
      region: 'pelvis',
      side,
      surface,
      bodyParts: surface === 'front' ? partsFront : partsBack,
    };
  }

  if (y > -0.75) {
    // Thighs / knees
    const partsFront = ['quadriceps', 'patella (knee)', 'iliotibial band (lateral)'];
    const partsBack = ['hamstrings', 'popliteal fossa (posterior knee)'];
    return {
      region: 'upper leg',
      side,
      surface,
      bodyParts: surface === 'front' ? partsFront : partsBack,
    };
  }

  // Lower legs / feet
  const partsFront = ['tibia (shin)', 'anterior ankle', 'dorsum of foot'];
  const partsBack = ['calf (gastrocnemius)', 'Achilles tendon', 'heel'];
  return {
    region: 'lower leg',
    side,
    surface,
    bodyParts: surface === 'front' ? partsFront : partsBack,
  };
}

export function getAnatomyForPoint(point: { x: number; y: number; z: number }, bounds: Bounds) {
  const norm = normalizePoint(point, bounds);
  const result = mapToAnatomy(norm);
  // De-duplicate and keep a concise list
  const unique = Array.from(new Set(result.bodyParts));
  return { ...result, bodyParts: unique };
}


