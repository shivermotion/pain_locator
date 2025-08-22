'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';
import { mockPatients } from '@/lib/mockPatients';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as THREE from 'three';
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import BodyModel from '@/components/BodyModel';
import PaintReplayer from '@/components/PaintReplayer';
import { modelConfig } from '@/config/modelConfig';
import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DoctorSessionPage() {
  const params = useParams();
  const search = useSearchParams();
  const patientId = params?.id as string;
  const sid = search ? (search.get('sid') as string | null) : null;

  const patient = useMemo(() => mockPatients.find(p => p.id === patientId) || null, [patientId]);
  const session = useMemo(
    () =>
      patient
        ? patient.sessions.find(s => (sid ? s.id === sid : true)) || patient.sessions[0]
        : null,
    [patient, sid]
  );

  // If viewing a live session (patientId likely 'live'), fetch by sid
  const { data: liveRecord } = useSWR(
    !patient && sid ? `/api/doctor/sessions/${encodeURIComponent(sid)}` : null,
    fetcher
  );

  const modelRef = useRef<THREE.Group>(null as unknown as THREE.Group);

  // Preliminary assessment UI state (mocked for now)
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateAssessment = () => {
    setIsAssessing(true);
    setAssessment(null);
    setCopied(false);
    // Mock async generation delay
    setTimeout(() => {
      const generated = [
        'Preliminary Assessment (Mock)',
        '',
        `- Overview: ${paintPoints?.length || 0} painted region(s) noted.`,
        '- Pain characteristics: See patient notes and per-point details.',
        `- Notes: ${summaryText ? summaryText : 'No patient notes provided.'}`,
        '',
        'Disclaimer: This is an auto-generated preview for demonstration only and is not medical advice.',
      ].join('\n');
      setAssessment(generated);
      setIsAssessing(false);
    }, 900);
  };

  const handleCopyAssessment = async () => {
    if (!assessment) return;
    try {
      await navigator.clipboard.writeText(assessment);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // no-op
    }
  };

  const timelineData = useMemo(() => {
    if (patient) {
      return patient.sessions
        .map(s => {
          const pts = (s as any).painPoints as Array<{ intensity: number }> | undefined;
          const avg =
            pts && pts.length > 0
              ? pts.reduce((sum, p) => sum + (p.intensity || 0), 0) / pts.length
              : 0;
          return {
            date: new Date(s.createdAt).toISOString().slice(0, 10),
            intensity: Math.round(avg * 10) / 10,
          };
        })
        .sort((a, b) => (a.date < b.date ? -1 : 1));
    }
    if (liveRecord?.createdAt) {
      const d = new Date(liveRecord.createdAt).toISOString().slice(0, 10);
      const pts = (liveRecord as any)?.painData?.points as Array<{ intensity: number }> | undefined;
      const avg =
        pts && pts.length > 0
          ? pts.reduce((sum, p) => sum + (p.intensity || 0), 0) / pts.length
          : 0;
      return [{ date: d, intensity: Math.round(avg * 10) / 10 }];
    }
    return [] as { date: string; intensity: number }[];
  }, [patient, liveRecord]);

  // Resolve display + paint data
  const displayEmail: string | null = patient?.email || liveRecord?.userId || null;
  const displayName: string = patient?.name || displayEmail || 'Patient';
  const paintPoints = (session?.painPoints || liveRecord?.painData?.points) as any[] | undefined;
  const summaryText: string = session?.summaryText || liveRecord?.painData?.summaryText || '';

  if (!displayEmail || !paintPoints) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{displayName}</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">{displayEmail}</div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="medical-card lg:col-span-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Painted areas (selected session)
          </div>
          <div className="h-80">
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
              <group ref={modelRef as any}>
                <BodyModel
                  onBodyClick={() => {}}
                  modelPath={modelConfig.modelPath}
                  modelScale={modelConfig.scale}
                  modelPosition={modelConfig.position}
                  modelRotation={modelConfig.rotation}
                  enableShadows={false}
                  modelRef={modelRef as any}
                />
              </group>
              <PaintReplayer modelRef={modelRef as any} painPoints={paintPoints as any} />
              <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={modelConfig.cameraSettings.minDistance}
                maxDistance={modelConfig.cameraSettings.maxDistance}
              />
            </Canvas>
          </div>
        </div>
        <div className="medical-card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Average intensity over time
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ left: -20, right: 10 }}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="intensity" stroke="#3b82f6" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="medical-card">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Patient notes / summary</div>
        <div className="text-gray-900 dark:text-white whitespace-pre-wrap">{summaryText}</div>
      </div>

      {/* Preliminary Assessment (Mock) */}
      <div className="medical-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Preliminary assessment
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Generate a quick AI-style preview based on this session.
            </div>
          </div>
          <button
            onClick={handleGenerateAssessment}
            disabled={isAssessing}
            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isAssessing ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {assessment && (
          <div className="space-y-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded p-3">
              <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {assessment}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyAssessment}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleGenerateAssessment}
                className="px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
