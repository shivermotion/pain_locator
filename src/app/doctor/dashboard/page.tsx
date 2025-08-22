'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { mockPatients } from '@/lib/mockPatients';
import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(r => r.json());
import { signOut } from 'next-auth/react';

export default function DoctorDashboard() {
  const [query, setQuery] = useState('');
  const { data } = useSWR('/api/doctor/sessions', fetcher);
  const patients = useMemo(() => {
    const byEmail = new Map<string, { email: string; sessions: any[] }>();
    (data || []).forEach((s: any) => {
      const email = s.userId as string;
      if (!byEmail.has(email)) byEmail.set(email, { email, sessions: [] });
      byEmail.get(email)!.sessions.push(s);
    });
    const live = Array.from(byEmail.values()).map(p => ({
      id: p.email,
      name: p.email,
      email: p.email,
      sessions: p.sessions,
    }));
    const emails = new Set(live.map(p => p.email));
    const extras = mockPatients
      .filter(mp => !emails.has(mp.email))
      .map(mp => ({ id: mp.email, name: mp.name, email: mp.email, sessions: mp.sessions }));
    return [...live, ...extras];
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return patients.filter(
      p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  }, [patients, query]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Doctor Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Sign out
        </button>
      </div>
      <div className="medical-card">
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Search patients
        </label>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Name or email"
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="medical-card">
            <div className="text-lg font-medium text-gray-900 dark:text-white">{p.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{p.email}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {p.sessions.length} session(s)
            </div>
            <div className="flex flex-wrap gap-2">
              {p.sessions.map((s: any) => (
                <Link
                  key={s.id}
                  href={`/doctor/patient/${encodeURIComponent(p.email)}?sid=${s.id}`}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm"
                >
                  {new Date(s.createdAt).toLocaleDateString()}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
