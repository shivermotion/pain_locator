'use client';

import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PatientHistoryPage() {
  const { data, error, isLoading } = useSWR('/api/sessions', fetcher);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your History</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-600">Failed to load</div>}
      <div className="space-y-3">
        {(data || []).map((s: any) => (
          <Link key={s.id} href={`/patient/session/${s.id}`} className="medical-card block">
            <div className="text-gray-900 dark:text-white font-medium">
              Session {new Date(s.createdAt).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {(s.painData?.summaryText || '').slice(0, 120)}...
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
