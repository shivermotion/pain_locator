'use client';

import { useParams, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { mockPatients } from '@/lib/mockPatients';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DoctorPatientPage() {
  const params = useParams();
  const email = decodeURIComponent(params?.email as string);
  const { data } = useSWR('/api/doctor/sessions', fetcher);

  const live = (data || []).filter((s: any) => s.userId === email);
  const mock = mockPatients.find(p => p.email === email);

  const sessions = live.length > 0 ? live : mock?.sessions || [];

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{email}</h1>
      </div>
      <div className="medical-card">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sessions</div>
        <div className="flex flex-wrap gap-2">
          {sessions.length > 0 ? (
            sessions.map((s: any) => (
              <Link
                key={s.id}
                href={`/doctor/session/${mock?.id || 'live'}?sid=${s.id}`}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm"
              >
                {new Date(s.createdAt).toLocaleDateString()}
              </Link>
            ))
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">No sessions</span>
          )}
        </div>
      </div>
    </div>
  );
}
