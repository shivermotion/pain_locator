'use client';

import { useRef, useState, useEffect } from 'react';
import { useGLTF, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';

interface BodyModelProps {
  onBodyClick: (event: { point: { x: number; y: number; z: number } }) => void;
  modelPath?: string; // Path to your 3D model file
  modelScale?: number; // Scale factor for the model
  modelPosition?: [number, number, number]; // Position of the model
  modelRotation?: [number, number, number]; // Rotation of the model
  enableShadows?: boolean; // Enable shadows for the model
  onBoundsChange?: (bounds: {
    min: [number, number, number];
    max: [number, number, number];
  }) => void;
  modelRef?: React.RefObject<THREE.Group>;
}

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="text-lg font-semibold mb-2">Loading 3D Model...</div>
        <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm">{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

// Custom 3D Model Component
function CustomModel({
  modelPath,
  onBodyClick,
  modelScale = 1,
  modelPosition = [0, 0, 0],
  modelRotation = [0, 0, 0],
  enableShadows = true,
  onBoundsChange,
  modelRef,
}: BodyModelProps) {
  const localGroupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath || '/models/default-body.glb');
  const [isDragging, setIsDragging] = useState(false);
  const [clickStartTime, setClickStartTime] = useState(0);
  const [clickStartPosition, setClickStartPosition] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    if (scene) {
      // Override all materials with a simple material to hide PBR textures
      scene.traverse(child => {
        if ((child as any).isMesh) {
          const mesh = child as THREE.Mesh;
          // Force a custom default (no original texture), flat base with vertex colors enabled
          const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff, // flat white so vertex colors show accurately
            map: null, // remove original texture map
            roughness: 0.85,
            metalness: 0.0,
            transparent: true,
            opacity: 0.98,
            vertexColors: true,
          });
          mesh.material = mat;
          (mesh.material as THREE.Material).needsUpdate = true;

          if (enableShadows) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        }
      });

      // Scale and position the model
      scene.scale.setScalar(modelScale);
      scene.position.set(...modelPosition);
      scene.rotation.set(...modelRotation);

      // Compute world-space bounding box and report it
      requestAnimationFrame(() => {
        const box = new THREE.Box3().setFromObject(scene);
        if (box.isEmpty()) return;
        const min = box.min;
        const max = box.max;
        onBoundsChange?.({
          min: [min.x, min.y, min.z],
          max: [max.x, max.y, max.z],
        });
      });
    }
  }, [scene, modelScale, modelPosition, modelRotation, enableShadows]);

  const handlePointerDown = (event: { clientX: number; clientY: number }) => {
    setClickStartTime(Date.now());
    setClickStartPosition({ x: event.clientX, y: event.clientY });
    setIsDragging(false);
  };

  const handlePointerMove = (event: { clientX: number; clientY: number }) => {
    if (clickStartPosition) {
      const deltaX = Math.abs(event.clientX - clickStartPosition.x);
      const deltaY = Math.abs(event.clientY - clickStartPosition.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > 5) {
        setIsDragging(true);
      }
    }
  };

  const handlePointerUp = (event: { point?: { x: number; y: number; z: number } }) => {
    const clickDuration = Date.now() - clickStartTime;
    const isQuickClick = clickDuration < 200 && !isDragging;

    if (isQuickClick) {
      const clickEvent = {
        point: event.point || { x: 0, y: 0, z: 0 },
        stopPropagation: () => {},
      };
      onBodyClick(clickEvent);
    }

    setClickStartPosition(null);
    setIsDragging(false);
  };

  return (
    <primitive
      object={scene}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={(node: any) => {
        // Forward to both local and external refs
        (localGroupRef as any).current = node as THREE.Group;
        if (modelRef) (modelRef as any).current = node as THREE.Group;
      }}
    />
  );
}

// Fallback Simple Body Model (current implementation)
function SimpleBodyModel({ onBodyClick, modelRef }: BodyModelProps) {
  const localRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [clickStartTime, setClickStartTime] = useState(0);
  const [clickStartPosition, setClickStartPosition] = useState<{ x: number; y: number } | null>(
    null
  );

  const createBodyGeometry = () => {
    const group = new THREE.Group();

    const torsoGeometry = new THREE.CapsuleGeometry(0.8, 1.5, 4, 8);
    const torsoMaterial = new THREE.MeshLambertMaterial({
      color: 0xf5d0c5,
      transparent: true,
      opacity: 0.9,
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 0.5;
    group.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshLambertMaterial({ color: 0xf5d0c5, transparent: true, opacity: 0.9 })
    );
    head.position.y = 2.2;
    group.add(head);

    const armGeometry = new THREE.CapsuleGeometry(0.2, 1.2, 4, 8);
    const armMaterial = new THREE.MeshLambertMaterial({
      color: 0xf5d0c5,
      transparent: true,
      opacity: 0.9,
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.2, 0.8, 0);
    leftArm.rotation.z = Math.PI / 6;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.2, 0.8, 0);
    rightArm.rotation.z = -Math.PI / 6;
    group.add(rightArm);

    const legGeometry = new THREE.CapsuleGeometry(0.3, 1.5, 4, 8);
    const legMaterial = new THREE.MeshLambertMaterial({
      color: 0xf5d0c5,
      transparent: true,
      opacity: 0.9,
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.4, -1.2, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.4, -1.2, 0);
    group.add(rightLeg);

    return group;
  };

  const handlePointerDown = (event: { clientX: number; clientY: number }) => {
    setClickStartTime(Date.now());
    setClickStartPosition({ x: event.clientX, y: event.clientY });
    setIsDragging(false);
  };

  const handlePointerMove = (event: { clientX: number; clientY: number }) => {
    if (clickStartPosition) {
      const deltaX = Math.abs(event.clientX - clickStartPosition.x);
      const deltaY = Math.abs(event.clientY - clickStartPosition.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > 5) setIsDragging(true);
    }
  };

  const handlePointerUp = (event: { point?: { x: number; y: number; z: number } }) => {
    const clickDuration = Date.now() - clickStartTime;
    const isQuickClick = clickDuration < 200 && !isDragging;

    if (isQuickClick) {
      const clickEvent = {
        point: event.point || { x: 0, y: 0, z: 0 },
        stopPropagation: () => {},
      };
      onBodyClick(clickEvent);
    }

    setClickStartPosition(null);
    setIsDragging(false);
  };

  const geometryGroup = createBodyGeometry();

  return (
    <primitive
      object={geometryGroup}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={(node: any) => {
        (localRef as any).current = node as THREE.Group;
        if (modelRef) (modelRef as any).current = node as THREE.Group;
      }}
    />
  );
}

export default function BodyModel(props: BodyModelProps) {
  const [modelError] = useState(false);

  if (!props.modelPath || modelError) {
    return (
      <group>
        <SimpleBodyModel {...props} />
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshLambertMaterial color={0xf0f0f0} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <CustomModel {...props} />
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshLambertMaterial color={0xf0f0f0} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/models/man.glb');
