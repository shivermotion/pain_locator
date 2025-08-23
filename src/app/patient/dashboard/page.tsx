'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';

type SessionItem = {
  id: string;
  createdAt?: string;
  summary?: string;
};

export default function PatientDashboard() {
  const [recent, setRecent] = useState<SessionItem | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/sessions');
        if (!res.ok) return;
        const data = (await res.json()) as SessionItem[];
        if (Array.isArray(data) && data.length && active) {
          const last = data[data.length - 1];
          setRecent(last);
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Button asChild>
          <Link href="/patient/log">
            Record Pain
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Getting Started */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>Tap the body to zoom in and start painting your pain areas.</li>
              <li>Use the brush size slider for smaller or larger areas.</li>
              <li>Click Finish to describe your pain in your own words.</li>
              <li>You can review past logs anytime.</li>
            </ul>
            <div className="mt-4">
              <Button asChild>
                <Link href="/patient/log">Record Pain</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Care team updates */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Care team updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Dr. Smith - 2 hours ago
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Reviewed your latest pain log. Consider scheduling a follow-up appointment to
                discuss treatment options.
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-900 dark:text-green-100">
                Nurse Johnson - Yesterday
              </div>
              <div className="text-sm text-green-800 dark:text-green-200 mt-1">
                Your medication refill has been approved. Please pick up from your pharmacy.
              </div>
            </div>
            <Button asChild variant="link" className="px-0">
              <Link href="/patient/history">View all messages →</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="medical-card md:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent activity</CardTitle>
            <Button asChild variant="link" className="px-0">
              <Link href="/patient/history">See all</Link>
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400">
            {recent ? (
              <div>
                Last saved session:{' '}
                <Button asChild variant="link" className="px-0">
                  <Link href={`/patient/session/${recent.id}`}>{recent.id}</Link>
                </Button>
                {recent.createdAt ? (
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    ({new Date(recent.createdAt).toLocaleString()})
                  </span>
                ) : null}
              </div>
            ) : (
              <span>No recent sessions yet. Create your first log.</span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
