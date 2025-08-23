'use client';

import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PatientProfilePage() {
  const { data, isLoading, mutate } = useSWR('/api/profile', fetcher);
  const [saving, setSaving] = useState(false);

  const profile = data || {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    // Split comma-separated lists
    if (typeof payload.conditions === 'string')
      payload.conditions = payload.conditions
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    if (typeof payload.medications === 'string')
      payload.medications = payload.medications
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    if (typeof payload.allergies === 'string')
      payload.allergies = payload.allergies
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) mutate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Profile</h1>

      <form onSubmit={onSubmit} className="medical-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Full name</label>
            <input
              name="fullName"
              defaultValue={profile.fullName || ''}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Date of birth</label>
            <input
              name="dateOfBirth"
              type="date"
              defaultValue={profile.dateOfBirth || ''}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Phone</label>
            <input
              name="phone"
              defaultValue={profile.phone || ''}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">
              Emergency contact name
            </label>
            <input
              name="emergencyContactName"
              defaultValue={profile.emergencyContactName || ''}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">
              Emergency contact phone
            </label>
            <input
              name="emergencyContactPhone"
              defaultValue={profile.emergencyContactPhone || ''}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300">Address</label>
            <input
              name="address"
              defaultValue={profile.address || ''}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">
              Conditions (comma-separated)
            </label>
            <input
              name="conditions"
              defaultValue={(profile.conditions || []).join(', ')}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">
              Medications (comma-separated)
            </label>
            <input
              name="medications"
              defaultValue={(profile.medications || []).join(', ')}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">
              Allergies (comma-separated)
            </label>
            <input
              name="allergies"
              defaultValue={(profile.allergies || []).join(', ')}
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Notes</label>
          <textarea
            name="notes"
            rows={4}
            defaultValue={profile.notes || ''}
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {profile.updatedAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last updated {new Date(profile.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
