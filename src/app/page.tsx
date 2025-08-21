'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import BodyModel from '@/components/BodyModel';
import PainMarker from '@/components/PainMarker';
import PainDescriptionModal from '@/components/PainDescriptionModal';
import SummaryPanel from '@/components/SummaryPanel';
import Header from '@/components/Header';
import { usePainStore } from '@/store/painStore';
import { PainPoint } from '@/types/pain';
import { modelConfig } from '@/config/modelConfig';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const { painPoints, addPainPoint, updatePainPoint } = usePainStore();

  const handleBodyClick = (event: { point: { x: number; y: number; z: number } }) => {
    // Get the intersection point from the click event
    const point = event.point;

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
      bodyParts: ['Unknown'], // Will be updated by anatomy detection
      createdAt: new Date().toISOString(),
    };

    addPainPoint(newPainPoint);
    setSelectedPainPoint(newPainPoint);
    setIsModalOpen(true);
  };

  const handlePainPointClick = (painPoint: PainPoint) => {
    setSelectedPainPoint(painPoint);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPainPoint(null);
  };

  const handlePainPointUpdate = (updatedPainPoint: PainPoint) => {
    updatePainPoint(updatedPainPoint);
    setIsModalOpen(false);
    setSelectedPainPoint(null);
  };

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
            />

            {painPoints.map(painPoint => (
              <PainMarker
                key={painPoint.id}
                painPoint={painPoint}
                onClick={() => handlePainPointClick(painPoint)}
              />
            ))}

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={modelConfig.cameraSettings.minDistance}
              maxDistance={modelConfig.cameraSettings.maxDistance}
            />
          </Canvas>

          {/* Instructions overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">How to use:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click anywhere on the body to mark pain</li>
              <li>• Drag to rotate, scroll to zoom</li>
              <li>• Click existing markers to edit</li>
            </ul>
          </div>
        </div>

        {/* Summary Panel - 20% of screen */}
        <div className="w-1/5 bg-white border-l border-gray-200">
          <SummaryPanel painPoints={painPoints} />
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
