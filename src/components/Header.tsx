import { Activity, Settings, HelpCircle, Sun, Moon, LogOut } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { data: session } = useSession();
  const role = (session as any)?.role as 'patient' | 'doctor' | undefined;

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
              <Link href={role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Portal
              </Link>
            </>
          ) : (
            <button onClick={() => signIn()} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
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
            <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
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
