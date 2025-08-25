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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Getting Started */}
        <Card className="medical-card bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              Ready to Record Your Pain?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-blue-800 dark:text-blue-200 mb-6 text-lg">
              Use our interactive 3D body model to precisely map and describe your pain areas
            </p>
            <Button
              asChild
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Link href="/patient/log">
                Start Recording Pain
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Care team updates */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Care Team Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Dr. Smith - 2 hours ago
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                Reviewed your latest pain log. Consider scheduling a follow-up appointment to
                discuss treatment options.
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                Nurse Johnson - Yesterday
              </div>
              <div className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                Your medication refill has been approved. Please pick up from your pharmacy.
              </div>
            </div>
            <Button
              asChild
              variant="link"
              className="px-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <Link href="/patient/history">View all messages →</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="medical-card lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
            <Button
              asChild
              variant="link"
              className="px-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <Link href="/patient/history">See all</Link>
            </Button>
          </CardHeader>
          <CardContent className="text-base text-gray-700 dark:text-gray-300">
            {recent ? (
              <div className="flex items-center space-x-2">
                <span>Last saved session:</span>
                <Button
                  asChild
                  variant="link"
                  className="px-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <Link href={`/patient/session/${recent.id}`}>{recent.id}</Link>
                </Button>
                {recent.createdAt ? (
                  <span className="text-gray-500 dark:text-gray-400">
                    ({new Date(recent.createdAt).toLocaleString()})
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No recent sessions yet.</p>
                <Button asChild variant="outline">
                  <Link href="/patient/log">Create your first log</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
