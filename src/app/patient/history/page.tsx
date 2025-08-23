'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useEffect } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PatientHistoryPage() {
  const { data, error, isLoading } = useSWR('/api/sessions', fetcher);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load history');
    }
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your History</h1>
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="medical-card">
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <div className="text-red-600">Failed to load</div>}
      <div className="space-y-3">
        {Array.isArray(data) && data.length === 0 && (
          <Card className="medical-card">
            <CardContent>
              <div className="text-gray-700 dark:text-gray-300">No sessions yet</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Your saved pain logs will appear here.
              </div>
            </CardContent>
          </Card>
        )}
        {(data || []).map((s: any) => (
          <Card key={s.id} className="medical-card">
            <CardHeader>
              <CardTitle>Session {new Date(s.createdAt).toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/patient/session/${s.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View details →
              </Link>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {(s.painData?.summaryText || '').slice(0, 120)}...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
