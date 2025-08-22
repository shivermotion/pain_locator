'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { paintOnMesh, ensureVertexColors } from '@/utils/paintMesh';

interface TexturePainterProps {
  enabled: boolean;
  modelRef: React.RefObject<THREE.Group>;
  brushSize: number; // world units
  brushColor?: string;
  onPaintPoint?: (point: [number, number, number]) => void;
  onStrokeStart?: () => void;
  onStrokeEnd?: () => void;
}

export default function TexturePainter({
  enabled,
  modelRef,
  brushSize,
  brushColor = '#ef4444',
  onPaintPoint,
  onStrokeStart,
  onStrokeEnd,
}: TexturePainterProps) {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const painting = useRef(false);
  const rafId = useRef<number | null>(null);
  const lastPaintPoint = useRef<THREE.Vector3 | null>(null);
  const brushColorThree = useRef(new THREE.Color(brushColor));
  const pointer = useRef(new THREE.Vector2());

  useEffect(() => {
    brushColorThree.current = new THREE.Color(brushColor);
  }, [brushColor]);

  useEffect(() => {
    if (!enabled) return;
    const dom = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      if (!enabled) return;
      painting.current = true;
      onStrokeStart?.();
      paintFromEvent(e);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!enabled) return;
      // Track pointer; actual painting occurs in RAF for smoother strokes
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerUp = () => {
      painting.current = false;
      onStrokeEnd?.();
    };

    dom.addEventListener('pointerdown', handlePointerDown);
    dom.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown);
      dom.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [enabled, gl]);

  // Paint once from a discrete event (e.g., pointerdown)
  const paintFromEvent = (e: PointerEvent) => {
    if (!modelRef.current) return;

    const rect = gl.domElement.getBoundingClientRect();
    pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    castAndPaintAtPointer();
  };

  // Continuous painting via RAF for smoother strokes
  useEffect(() => {
    if (!enabled) return;
    const loop = () => {
      if (painting.current) {
        castAndPaintAtPointer(true);
      }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      lastPaintPoint.current = null;
    };
  }, [enabled, brushSize, brushColor]);

  const castAndPaintAtPointer = (continuous = false) => {
    if (!modelRef.current) return;
    raycaster.current.setFromCamera(pointer.current, camera);
    const meshes: THREE.Object3D[] = [];
    modelRef.current.traverse(obj => {
      if ((obj as any).isMesh) meshes.push(obj);
    });
    const intersects = raycaster.current.intersectObjects(meshes as THREE.Object3D[], true);
    if (intersects.length === 0) return;

    const hit = intersects[0];
    const mesh = hit.object as THREE.Mesh;
    const worldPoint = hit.point.clone();

    // Skip overly dense samples when moving fast
    if (continuous && lastPaintPoint.current) {
      if (lastPaintPoint.current.distanceTo(worldPoint) < brushSize * 0.15) {
        return;
      }
    }
    lastPaintPoint.current = worldPoint.clone();

    ensureVertexColors(mesh);
    paintOnMesh(mesh, worldPoint, brushSize, brushColorThree.current);
    onPaintPoint?.([worldPoint.x, worldPoint.y, worldPoint.z]);
  };

  return null;
}
