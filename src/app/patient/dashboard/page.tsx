'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Patient Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Onboarding / Tips */}
        <div className="medical-card">
          <div className="text-lg font-medium text-gray-900 dark:text-white">Getting started</div>
          <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            <li>Tap the body to zoom in and start painting your pain areas.</li>
            <li>Use the brush size slider for smaller or larger areas.</li>
            <li>Click Finish to describe your pain in your own words.</li>
            <li>You can review or edit past logs anytime from History.</li>
          </ul>
          <div className="mt-4">
            <Link
              href="/patient/log"
              className="inline-block px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Start a New Log
            </Link>
          </div>
        </div>

        {/* Care team notifications */}
        <div className="medical-card">
          <div className="text-lg font-medium text-gray-900 dark:text-white">Care team updates</div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Messages and updates from your medical team about your care plan.
          </div>
          <div className="mt-4 space-y-3">
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
            <Link href="/patient/history" className="block text-sm text-blue-600 hover:underline">
              View all messages →
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="medical-card md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium text-gray-900 dark:text-white">Recent activity</div>
            <Link href="/patient/history" className="text-sm text-blue-600 hover:underline">
              See all
            </Link>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {recent ? (
              <div>
                Last saved session:{' '}
                <Link
                  href={`/patient/session/${recent.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {recent.id}
                </Link>
                {recent.createdAt ? (
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    ({new Date(recent.createdAt).toLocaleString()})
                  </span>
                ) : null}
              </div>
            ) : (
              <span>No recent sessions yet. Create your first log.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
