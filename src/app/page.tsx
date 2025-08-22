'use client';

import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import BodyModel from '@/components/BodyModel';
import TexturePainter from '@/components/TexturePainter';
import PaintReplayer from '@/components/PaintReplayer';
import PainDescriptionModal from '@/components/PainDescriptionModal';
import SummaryPanel from '@/components/SummaryPanel';
import Header from '@/components/Header';
import { usePainStore } from '@/store/painStore';
import { PainPoint, BodyRegion, BodySide, BodySurface } from '@/types/pain';
import { modelConfig } from '@/config/modelConfig';
import { getAnatomyForPoint } from '@/utils/anatomyMapping';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const {
    painPoints,
    addPainPoint,
    updatePainPoint,
    appendPointToStroke,
    beginStroke,
    endStroke,
    undoLastStroke,
    getPainPoint,
  } = usePainStore();
  const [modelBounds, setModelBounds] = useState<{
    min: [number, number, number];
    max: [number, number, number];
  } | null>(null);
  const modelRef = useRef<THREE.Group>(null as unknown as THREE.Group);
  const controlsRef = useRef<any>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [brushSize, setBrushSize] = useState(0.12);
  const [brushColor, setBrushColor] = useState<string>('#ef4444');
  const AUTO_COLORS = [
    '#ef4444', // Red
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#ec4899', // Pink
  ];

  const handleBodyClick = (event: { point: { x: number; y: number; z: number } }) => {
    // Get the intersection point from the click event
    const point = event.point;

    // Infer anatomy if we have bounds
    let inferredBodyParts: string[] = ['Unknown'];
    let inferredRegion: BodyRegion | undefined;
    let inferredSide: BodySide | undefined;
    let inferredSurface: BodySurface | undefined;
    if (modelBounds) {
      const { bodyParts, region, side, surface } = getAnatomyForPoint(point, modelBounds);
      inferredBodyParts = bodyParts;
      inferredRegion = region as BodyRegion;
      inferredSide = side as BodySide;
      inferredSurface = surface as BodySurface;
    }

    // Create a new pain point
    const newPainPoint: PainPoint = {
      id: Date.now().toString(),
      position: [point.x, point.y, point.z],
      radius: 0.1,
      intensity: 5,
      type: 'external',
      quality: 'sharp',
      onset: 'recent',
      duration: 'intermittent',
      aggravatingFactors: [],
      relievingFactors: [],
      associatedSymptoms: [],
      bodyParts: inferredBodyParts,
      region: inferredRegion,
      side: inferredSide,
      surface: inferredSurface,
      // assign auto color per point
      // @ts-ignore store extra color field not in type for now
      color: AUTO_COLORS[painPoints.length % AUTO_COLORS.length],
      createdAt: new Date().toISOString(),
      paintRadius: brushSize,
    };

    addPainPoint(newPainPoint);
    setSelectedPainPoint(newPainPoint);
    // set brush color from point color
    // @ts-ignore
    setBrushColor(newPainPoint.color);

    // Move camera to focus the tapped area and enter painting mode
    const target = new THREE.Vector3(point.x, point.y, point.z);
    const controls = controlsRef.current;
    if (controls && controls.object) {
      const camera: THREE.PerspectiveCamera = controls.object;
      const dir = new THREE.Vector3().subVectors(camera.position, target);
      const distance = 2.5; // desired zoom distance
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
      dir.normalize().multiplyScalar(distance);
      const newPos = new THREE.Vector3().addVectors(target, dir);
      camera.position.copy(newPos);
      controls.target.copy(target);
      controls.update();
    }

    setIsPainting(true);
  };

  const handlePainPointClick = (painPoint: PainPoint) => {
    const latest = getPainPoint(painPoint.id) || painPoint;
    setSelectedPainPoint(latest);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPainPoint(null);
  };

  const handlePainPointUpdate = (updatedPainPoint: PainPoint) => {
    const current = getPainPoint(updatedPainPoint.id);
    const merged = current ? { ...current, ...updatedPainPoint } : updatedPainPoint;
    updatePainPoint(merged);
    setIsModalOpen(false);
    setSelectedPainPoint(null);
  };

  const handlePainPointResize = (id: string, newRadius: number) => {
    const painPoint = painPoints.find(p => p.id === id);
    if (painPoint) {
      updatePainPoint({ ...painPoint, radius: newRadius });
    }
  };

  // Deprecated; painting now tracked via strokes only

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex">
        {/* 3D Model Area - 80% of screen */}
        <div className="w-4/5 relative">
          <Canvas
            camera={{
              position: modelConfig.cameraSettings.position,
              fov: modelConfig.cameraSettings.fov,
            }}
            className="w-full h-full"
          >
            <Environment preset="studio" />
            <ambientLight intensity={modelConfig.lighting.ambient.intensity} />
            <directionalLight
              position={modelConfig.lighting.directional.position}
              intensity={modelConfig.lighting.directional.intensity}
            />

            <BodyModel
              onBodyClick={handleBodyClick}
              modelPath={modelConfig.modelPath}
              modelScale={modelConfig.scale}
              modelPosition={modelConfig.position}
              modelRotation={modelConfig.rotation}
              enableShadows={modelConfig.enableShadows}
              onBoundsChange={setModelBounds}
              modelRef={modelRef as any}
            />

            <TexturePainter
              enabled={isPainting}
              modelRef={modelRef as any}
              brushSize={brushSize}
              brushColor={selectedPainPoint?.color || brushColor}
              onPaintPoint={p => {
                if (!selectedPainPoint) return;
                appendPointToStroke(selectedPainPoint.id, p);
              }}
              onStrokeStart={() => {
                if (!selectedPainPoint) return;
                beginStroke(selectedPainPoint.id);
              }}
              onStrokeEnd={() => {
                if (!selectedPainPoint) return;
                endStroke(selectedPainPoint.id);
              }}
            />

            {/* Replay paints whenever pain points change (handles delete/undo) */}
            <PaintReplayer
              modelRef={modelRef as any}
              painPoints={painPoints}
              defaultRadius={brushSize}
            />

            <OrbitControls
              ref={controlsRef}
              enablePan={!isPainting}
              enableZoom={!isPainting}
              enableRotate={!isPainting}
              minDistance={modelConfig.cameraSettings.minDistance}
              maxDistance={modelConfig.cameraSettings.maxDistance}
            />
          </Canvas>

          {/* Painting toolbar */}
          {isPainting && (
            <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700 w-64 space-y-3">
              <div className="font-semibold text-gray-800 dark:text-white">Painting</div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Brush size
                </label>
                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.01}
                  value={brushSize}
                  onChange={e => setBrushSize(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {brushSize.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Paint color</span>
                <span className="inline-flex items-center">
                  <span
                    className="inline-block w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: selectedPainPoint?.color || brushColor }}
                  />
                  <span className="ml-2">This pain area's color</span>
                </span>
              </div>
              <div className="flex items-center justify-between space-x-2 pt-2">
                <button
                  onClick={() => {
                    if (!selectedPainPoint) return;
                    undoLastStroke(selectedPainPoint.id);
                  }}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
                >
                  Undo stroke
                </button>
                <button
                  onClick={() => {
                    if (selectedPainPoint) setIsModalOpen(true);
                    setIsPainting(false);
                  }}
                  className="flex-1 btn-primary"
                >
                  Finish
                </button>
                <button
                  onClick={() => {
                    setIsPainting(false);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Exit
                </button>
              </div>
            </div>
          )}

          {/* Instructions overlay */}
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 dark:text-white">How to use:</h3>
              <button
                onClick={() => {
                  if (controlsRef.current) {
                    controlsRef.current.reset();
                  }
                }}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm transition-colors"
              >
                Reset Camera
              </button>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Tap an area to focus and start painting</li>
              <li>• While painting: click and drag to color the area</li>
              <li>• When not painting: drag to rotate, scroll to zoom</li>
            </ul>
          </div>
        </div>

        {/* Summary Panel - 20% of screen */}
        <div className="w-1/5 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
          <SummaryPanel
            painPoints={painPoints}
            onEditPainPoint={handlePainPointClick}
            onFocusPainPoint={p => {
              // Snap camera to pain point location
              const controls = controlsRef.current;
              if (controls && controls.object) {
                const camera: THREE.PerspectiveCamera = controls.object;
                const target = new THREE.Vector3(...p.position);
                const dir = new THREE.Vector3().subVectors(camera.position, target);
                const distance = 2.5;
                if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
                dir.normalize().multiplyScalar(distance);
                const newPos = new THREE.Vector3().addVectors(target, dir);
                camera.position.copy(newPos);
                controls.target.copy(target);
                controls.update();
              }
            }}
          />
        </div>
      </main>

      {/* Pain Description Modal */}
      {isModalOpen && selectedPainPoint && (
        <PainDescriptionModal
          painPoint={selectedPainPoint}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handlePainPointUpdate}
        />
      )}
    </div>
  );
}
