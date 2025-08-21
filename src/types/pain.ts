export type PainType = 'external' | 'internal';
export type PainQuality = 'sharp' | 'dull' | 'throbbing' | 'burning' | 'aching' | 'cramping' | 'stabbing' | 'tingling' | 'numbness';
export type PainOnset = 'sudden' | 'gradual' | 'recent' | 'chronic';
export type PainDuration = 'brief' | 'intermittent' | 'continuous' | 'waxing-waning';

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
