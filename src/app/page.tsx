'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = (session as any)?.role as 'patient' | 'doctor' | undefined;

  useEffect(() => {
    if (role === 'patient') router.replace('/patient/dashboard');
    if (role === 'doctor') router.replace('/doctor/dashboard');
  }, [role, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/patient/dashboard" className="medical-card block">
            <div className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              I'm a patient
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Paint where it hurts and describe your pain. Save and view history.
            </div>
          </Link>
          <Link href="/doctor/dashboard" className="medical-card block">
            <div className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              I'm a doctor
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Review patient sessions and generate AI-assisted assessments.
            </div>
          </Link>
          <div className="md:col-span-2 text-xs text-gray-500 dark:text-gray-400">
            Non-diagnostic demo. Not for clinical use.
          </div>
        </div>
      </main>
    </div>
  );
}
