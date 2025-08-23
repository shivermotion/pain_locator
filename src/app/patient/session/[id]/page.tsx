'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PatientSessionPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data, error, isLoading } = useSWR(id ? `/api/sessions/${id}` : null, fetcher);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load session');
    }
  }, [error]);

  if (!id) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Session Details</h1>
      {isLoading && (
        <div className="space-y-3">
          <Card className="medical-card">
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
          </Card>
          <Card className="medical-card">
            <CardHeader>
              <Skeleton className="h-5 w-1/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      )}
      {error && <div className="text-red-600">Failed to load</div>}
      {data && (
        <div className="space-y-3">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Created at</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 dark:text-white font-medium">
                {new Date(data.createdAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          {data.painData?.summaryText && (
            <Card className="medical-card">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {data.painData.summaryText}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
