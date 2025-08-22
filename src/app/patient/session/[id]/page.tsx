'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PatientSessionPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data, error, isLoading } = useSWR(id ? `/api/sessions/${id}` : null, fetcher);

  if (!id) return null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Session Details</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-600">Failed to load</div>}
      {data && (
        <div className="space-y-3">
          <div className="medical-card">
            <div className="text-sm text-gray-600 dark:text-gray-400">Created at</div>
            <div className="text-gray-900 dark:text-white font-medium">
              {new Date(data.createdAt).toLocaleString()}
            </div>
          </div>
          {data.painData?.summaryText && (
            <div className="medical-card">
              <div className="text-sm text-gray-600 dark:text-gray-400">Summary</div>
              <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {data.painData.summaryText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
