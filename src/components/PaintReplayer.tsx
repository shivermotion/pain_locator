'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { paintOnMesh, resetMeshColors, ensureVertexColors } from '@/utils/paintMesh';
import { PainPoint } from '@/types/pain';

interface PaintReplayerProps {
  modelRef: React.RefObject<THREE.Group>;
  painPoints: PainPoint[];
  defaultRadius?: number;
}

export default function PaintReplayer({
  modelRef,
  painPoints,
  defaultRadius = 0.12,
}: PaintReplayerProps) {
  useEffect(() => {
    const group = modelRef.current;
    if (!group) return;

    const meshes: THREE.Mesh[] = [];
    group.traverse(obj => {
      if ((obj as any).isMesh) {
        const mesh = obj as THREE.Mesh;
        ensureVertexColors(mesh);
        meshes.push(mesh);
      }
    });

    // Reset to base color (white) before replaying paint
    meshes.forEach(mesh => resetMeshColors(mesh));

    // Re-apply painting for each pain point and its recorded path
    for (const point of painPoints) {
      const colorHex = point.color || '#ef4444';
      const color = new THREE.Color(colorHex);
      const strokes = point.strokes || [];
      const radius = point.paintRadius || defaultRadius;
      for (const stroke of strokes) {
        for (const world of stroke) {
          const wp = new THREE.Vector3(world[0], world[1], world[2]);
          meshes.forEach(mesh => paintOnMesh(mesh, wp, radius, color));
        }
      }
    }
  }, [modelRef, JSON.stringify(painPoints), defaultRadius]);

  return null;
}
