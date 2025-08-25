'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { mockPatients } from '@/lib/mockPatients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DoctorPatientPage() {
  const params = useParams();
  const email = decodeURIComponent(params?.email as string);
  const { data } = useSWR('/api/doctor/sessions', fetcher);

  const live = (data || []).filter((s: any) => s.userId === email);
  const mock = mockPatients.find(p => p.email === email);

  const sessions = live.length > 0 ? live : mock?.sessions || [];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{email}</h1>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sessions.length > 0 ? (
              sessions.map((s: any) => (
                <Button asChild key={s.id} variant="secondary" className="text-sm">
                  <Link href={`/doctor/session/${mock?.id || 'live'}?sid=${s.id}`}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </Link>
                </Button>
              ))
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">No sessions</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
