'use client';

import { Activity, Settings, HelpCircle, Sun, Moon, LogOut, Menu, User } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { data: session } = useSession();

  type AppSession = Session & { role?: 'patient' | 'doctor' };
  const appSession = session as AppSession | null;
  const role = appSession?.role;
  const pathname = usePathname();

  const base =
    'px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50';
  const active =
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
  const tabClass = (href: string) => `${base} ${pathname?.startsWith(href) ? active : ''}`;

  return (
    <header className="glass-panel px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pain Locator</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Visual Pain Assessment Tool</p>
          </div>
        </div>

        <nav aria-label="Primary" className="hidden md:flex items-center space-x-6">
          {session ? (
            <>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <User className="w-4 h-4 text-blue-700 dark:text-blue-300" />
              </div>
              <div className="flex items-center space-x-2">
                {role === 'patient' && (
                  <>
                    <Link href="/patient/dashboard" className={tabClass('/patient/dashboard')}>
                      Dashboard
                    </Link>
                    <Link href="/patient/profile" className={tabClass('/patient/profile')}>
                      My Medical History
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

        <div className="flex items-center space-x-3">
          {!session ? (
            <Button variant="outline" size="sm" aria-label="Sign in" onClick={() => signIn()}>
              Sign in
            </Button>
          ) : null}

          {/* Desktop action buttons - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    aria-label="Help"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Help</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    aria-label="Settings"
                    asChild
                  >
                    <Link href="/patient/settings">
                      <Settings className="w-4 h-4" />
                    </Link>
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
                    className="hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    aria-label="Toggle dark mode"
                    onClick={toggleDarkMode}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
                      className="hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      aria-label="Sign out"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sign out</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800/50"
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-2" aria-label="Mobile">
                {session ? (
                  role === 'patient' ? (
                    <>
                      <Link href="/patient/dashboard" className={tabClass('/patient/dashboard')}>
                        Dashboard
                      </Link>
                      <Link href="/patient/profile" className={tabClass('/patient/profile')}>
                        My Medical History
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

                {/* Mobile action buttons */}
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start">
                      <HelpCircle className="w-4 h-4 mr-3" />
                      Help
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/patient/settings">
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" onClick={toggleDarkMode}>
                      {isDarkMode ? (
                        <Sun className="w-4 h-4 mr-3" />
                      ) : (
                        <Moon className="w-4 h-4 mr-3" />
                      )}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </Button>
                    {session && (
                      <Button
                        variant="ghost"
                        className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </Button>
                    )}
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
