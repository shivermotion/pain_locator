'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PainPoint } from '@/types/pain';

interface PainMarkerProps {
  painPoint: PainPoint;
  onClick: () => void;
}

export default function PainMarker({ painPoint, onClick }: PainMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Color based on intensity (1-10 scale)
  const getColor = (intensity: number) => {
    if (intensity <= 3) return '#4ade80'; // Green for mild
    if (intensity <= 6) return '#fbbf24'; // Yellow for moderate
    if (intensity <= 8) return '#f97316'; // Orange for severe
    return '#ef4444'; // Red for very severe
  };

  // Size based on radius
  const size = painPoint.radius * 2;

  useFrame(state => {
    if (meshRef.current) {
      // Add a subtle pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  return (
    <mesh
      ref={meshRef}
      position={painPoint.position}
      onClick={onClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={getColor(painPoint.intensity)}
        transparent
        opacity={hovered ? 0.8 : 0.6}
        emissive={hovered ? getColor(painPoint.intensity) : '#000000'}
        emissiveIntensity={hovered ? 0.2 : 0}
      />

      {/* Add a ring around the marker */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[size * 1.2, size * 1.4, 16]} />
        <meshBasicMaterial color={getColor(painPoint.intensity)} transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
}
