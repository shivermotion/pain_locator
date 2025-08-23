'use client';

import { Activity, Settings, HelpCircle, Sun, Moon, LogOut } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { data: session } = useSession();

  type AppSession = Session & { role?: 'patient' | 'doctor' };
  const appSession = session as AppSession | null;
  const role = appSession?.role;
  const pathname = usePathname();

  const base =
    'px-3 py-2 text-sm rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800';
  const active = 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white';
  const tabClass = (href: string) => `${base} ${pathname?.startsWith(href) ? active : ''}`;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pain Locator</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visual Pain Assessment Tool</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {role || 'user'}
              </span>
              <div className="flex items-center space-x-1">
                {role === 'patient' && (
                  <>
                    <Link href="/patient/dashboard" className={tabClass('/patient/dashboard')}>
                      Dashboard
                    </Link>
                    <Link href="/patient/profile" className={tabClass('/patient/profile')}>
                      Profile
                    </Link>
                    <Link href="/patient/log" className={tabClass('/patient/log')}>
                      New Log
                    </Link>
                    <Link href="/patient/history" className={tabClass('/patient/history')}>
                      History
                    </Link>
                  </>
                )}
                {role === 'doctor' && (
                  <>
                    <Link href="/doctor/dashboard" className={tabClass('/doctor/dashboard')}>
                      Dashboard
                    </Link>
                    <Link href="/doctor/patients" className={tabClass('/doctor/patients')}>
                      Patients
                    </Link>
                  </>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Sign in
            </button>
          )}
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
