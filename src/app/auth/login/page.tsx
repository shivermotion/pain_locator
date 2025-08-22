'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('patient@example.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      const sess = await getSession();
      const role = (sess as any)?.role as 'patient' | 'doctor' | undefined;
      if (role === 'doctor') {
        router.push('/doctor/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    } else {
      setError('Invalid login');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sign in</h1>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in…' : 'Continue'}
        </button>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setEmail('patient@example.com');
              setPassword('demo123');
            }}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
          >
            Use patient demo
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('doctor@example.com');
              setPassword('demo123');
            }}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
          >
            Use doctor demo
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Demo accounts: patient@example.com or doctor@example.com with password demo123
        </p>
      </form>
    </div>
  );
}
