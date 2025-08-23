'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { mockPatients } from '@/lib/mockPatients';
import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(r => r.json());
import { signOut } from 'next-auth/react';
import { Search, User, Calendar, Activity } from 'lucide-react';

export default function DoctorPatientsPage() {
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Patient Management</h1>
      </div>

      {/* Search */}
      <div className="medical-card">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-gray-500" />
          <label className="text-sm text-gray-700 dark:text-gray-300">Search patients</label>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="medical-card text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {patients.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Patients</div>
        </div>
        <div className="medical-card text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {patients.filter(p => p.sessions.length > 0).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Patients</div>
        </div>
        <div className="medical-card text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {patients.reduce((sum, p) => sum + p.sessions.length, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Assessments</div>
        </div>
      </div>

      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="medical-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{p.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span>{p.sessions.length} sessions</span>
              </div>
              {p.sessions.length > 0 && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(p.sessions[p.sessions.length - 1].createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {p.sessions.length > 0 ? (
                p.sessions.slice(-3).map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/doctor/patient/${encodeURIComponent(p.email)}?sid=${s.id}`}
                    className="block p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {s.painData?.points?.length || 0} pain areas
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No assessments yet
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/doctor/patient/${encodeURIComponent(p.email)}`}
                className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Patient
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No patients found
          </div>
          <div className="text-gray-600 dark:text-gray-400">Try adjusting your search terms</div>
        </div>
      )}
    </div>
  );
}
