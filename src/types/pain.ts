export type PainType = 'external' | 'internal';
export type PainQuality = 'sharp' | 'dull' | 'throbbing' | 'burning' | 'aching' | 'cramping' | 'stabbing' | 'tingling' | 'numbness';
export type PainOnset = 'sudden' | 'gradual' | 'recent' | 'chronic';
export type PainDuration = 'brief' | 'intermittent' | 'continuous' | 'waxing-waning';

export type BodySide = 'left' | 'right' | 'midline';
export type BodySurface = 'front' | 'back' | 'mid';
export type BodyRegion = 'head' | 'neck' | 'chest' | 'abdomen' | 'pelvis' | 'upper leg' | 'lower leg';

export interface PainPoint {
  id: string;
  position: [number, number, number]; // [x, y, z] coordinates
  radius: number;
  intensity: number; // 1-10 scale
  type: PainType;
  quality: PainQuality;
  onset: PainOnset;
  duration: PainDuration;
  aggravatingFactors: string[];
  relievingFactors: string[];
  associatedSymptoms: string[];
  bodyParts: string[]; // Detected anatomy
  region?: BodyRegion;
  side?: BodySide;
  surface?: BodySurface;
  strokes?: [number, number, number][][]; // Array of brush strokes (each stroke is an array of points)
  color?: string; // Paint color assigned to this pain point
  paintRadius?: number; // Brush size used for this point's painting
  patientNarrative?: string; // Free-text details from the patient (for clinician/LLM)
  createdAt: string;
  updatedAt?: string;
}

export interface PainSummary {
  totalPoints: number;
  averageIntensity: number;
  mostCommonQuality: PainQuality;
  bodyRegions: string[];
  summaryText: string;
}

export interface AnatomyDetection {
  bodyPart: string;
  confidence: number;
  coordinates: [number, number, number];
}
