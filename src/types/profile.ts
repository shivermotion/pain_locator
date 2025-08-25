export interface PatientProfile {
  email: string;
  fullName?: string;
  dateOfBirth?: string; // ISO date
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone?: string;

  // Medical History
  pastConditions?: string[];
  surgeries?: string[];
  currentMedications?: string[];
  allergies?: string[];
  familyHistory?: string;
  smokingStatus?: string;
  alcoholUse?: string;

  notes?: string;
  updatedAt?: string; // ISO datetime
}

export type PatientProfilesFile = Record<string, PatientProfile>; // key by email


