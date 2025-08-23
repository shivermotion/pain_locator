export interface PatientProfile {
  email: string;
  fullName?: string;
  dateOfBirth?: string; // ISO date
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
  notes?: string;
  updatedAt?: string; // ISO datetime
}

export type PatientProfilesFile = Record<string, PatientProfile>; // key by email


