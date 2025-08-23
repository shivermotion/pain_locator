'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { SessionProvider } from 'next-auth/react';
import { DarkModeProvider } from '@/contexts/DarkModeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DarkModeProvider>
        {children}
        <Toaster richColors position="top-center" closeButton expand={true} />
      </DarkModeProvider>
    </SessionProvider>
  );
}
