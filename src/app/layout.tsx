import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pain Locator - Visual Pain Assessment Tool',
  description:
    'Interactive 3D pain mapping tool to help patients communicate pain symptoms to healthcare providers',
  keywords: 'pain assessment, 3D body model, healthcare, medical communication',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
