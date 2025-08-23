'use client';

import { Activity, Settings, HelpCircle, Sun, Moon, LogOut, Menu } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
    <header className="glass-panel px-6 py-4 sticky top-0 z-40">
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

        <nav aria-label="Primary" className="hidden md:flex items-center space-x-4">
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
                      Record Pain
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
          ) : null}
        </nav>

        <div className="flex items-center space-x-2">
          {!session ? (
            <Button variant="ghost" aria-label="Sign in" onClick={() => signIn()}>
              Sign in
            </Button>
          ) : null}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Help">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Settings">
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle dark mode"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {session ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Sign out"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-6 flex flex-col gap-2" aria-label="Mobile">
                {session ? (
                  role === 'patient' ? (
                    <>
                      <Link href="/patient/dashboard" className={tabClass('/patient/dashboard')}>
                        Dashboard
                      </Link>
                      <Link href="/patient/profile" className={tabClass('/patient/profile')}>
                        Profile
                      </Link>
                      <Link href="/patient/log" className={tabClass('/patient/log')}>
                        Record Pain
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/doctor/dashboard" className={tabClass('/doctor/dashboard')}>
                        Dashboard
                      </Link>
                      <Link href="/doctor/patients" className={tabClass('/doctor/patients')}>
                        Patients
                      </Link>
                    </>
                  )
                ) : (
                  <Button variant="outline" onClick={() => signIn()}>
                    Sign in
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
