export interface PainSession {
  id: string;
  userId: string;
  createdAt: string;
  painData: any; // JSON blob from PainLocator (strokes, meta, summary)
}

import fs from 'fs';
import path from 'path';

const store = new Map<string, PainSession>();
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'sessions.json');

function ensureLoaded() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const arr: PainSession[] = JSON.parse(raw || '[]');
      store.clear();
      arr.forEach(r => store.set(r.id, r));
    }
  } catch {
    // ignore POC
  }
}

function persist() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    const arr = Array.from(store.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
  } catch {
    // ignore POC
  }
}

ensureLoaded();

export function createSession(session: Omit<PainSession, 'id' | 'createdAt'> & { id?: string }) {
  const id = session.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  const record: PainSession = { id, createdAt, userId: session.userId, painData: session.painData };
  store.set(id, record);
  persist();
  return record;
}

export function getSession(id: string) {
  return store.get(id) || null;
}

export function listSessionsByUser(userId: string) {
  return Array.from(store.values())
    .filter(s => s.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteSession(id: string) {
  const ok = store.delete(id);
  if (ok) persist();
  return ok;
}

export function listAllSessions() {
  return Array.from(store.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
