'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { mockPatients } from '@/lib/mockPatients';
import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(r => r.json());
import { Search, User, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { toast } from 'sonner';

type SessionLite = { id: string; createdAt: string; painData?: { points?: unknown[] } };
type PatientLite = { id: string; name: string; email: string; sessions: SessionLite[] };

export default function DoctorPatientsPage() {
  const [query, setQuery] = useState('');
  const { data, error, isLoading } = useSWR('/api/doctor/sessions', fetcher);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load patients');
    }
  }, [error]);
  {
    isLoading && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="medical-card">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  {
    error && <div className="text-red-600">Failed to load patients</div>;
  }

  const patients: PatientLite[] = useMemo(() => {
    const byEmail = new Map<string, { email: string; sessions: SessionLite[] }>();
    (data || []).forEach((s: SessionLite & { userId: string }) => {
      const email = s.userId as string;
      if (!byEmail.has(email)) byEmail.set(email, { email, sessions: [] as SessionLite[] });
      byEmail.get(email)!.sessions.push(s);
    });
    const live = Array.from(byEmail.values()).map(p => ({
      id: p.email,
      name: p.email,
      email: p.email,
      sessions: p.sessions,
    }));
    const emails = new Set(live.map(p => p.email));
    const extras: PatientLite[] = mockPatients
      .filter(mp => !emails.has(mp.email))
      .map(mp => ({
        id: mp.email,
        name: mp.name,
        email: mp.email,
        sessions: mp.sessions as SessionLite[],
      }));
    return [...live, ...extras] as PatientLite[];
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return patients.filter(
      p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  }, [patients, query]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Management</h1>

      {/* Search */}
      <Card className="medical-card">
        <CardHeader className="flex-row items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <CardTitle>Search patients</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="patient-search" className="sr-only">
            Search patients
          </Label>
          <Input
            id="patient-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or email..."
          />
        </CardContent>
      </Card>

      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="medical-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {patients.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Patients</div>
          </CardContent>
        </Card>
        <Card className="medical-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {patients.filter(p => p.sessions.length > 0).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Patients</div>
          </CardContent>
        </Card>
        <Card className="medical-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {patients.reduce((sum, p) => sum + p.sessions.length, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Assessments</div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="medical-card">
            <CardContent>
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
                  p.sessions.slice(-3).map((s: SessionLite) => (
                    <Link
                      key={s.id}
                      href={`/doctor/patient/${encodeURIComponent(p.email)}?sid=${s.id}`}
                      className="block p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {(s.painData?.points?.length || 0) as number} pain areas
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
                <Button asChild className="w-full">
                  <Link href={`/doctor/patient/${encodeURIComponent(p.email)}`}>View Patient</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
