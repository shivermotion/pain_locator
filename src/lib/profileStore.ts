import fs from 'fs';
import path from 'path';
import { PatientProfile, PatientProfilesFile } from '@/types/profile';

const dataDir = path.join(process.cwd(), '.data');
const filePath = path.join(dataDir, 'profiles.json');

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2), 'utf-8');
}

export function readAllProfiles(): PatientProfilesFile {
  ensureStore();
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as PatientProfilesFile;
    return parsed || {};
  } catch {
    return {} as PatientProfilesFile;
  }
}

export function readProfile(email: string): PatientProfile | null {
  const all = readAllProfiles();
  return all[email] || null;
}

export function writeProfile(profile: PatientProfile): PatientProfile {
  const all = readAllProfiles();
  const updated: PatientProfile = { ...profile, updatedAt: new Date().toISOString() };
  all[profile.email] = updated;
  fs.writeFileSync(filePath, JSON.stringify(all, null, 2), 'utf-8');
  return updated;
}


