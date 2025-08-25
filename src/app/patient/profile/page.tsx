'use client';

import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PatientProfilePage() {
  const { data, isLoading, mutate } = useSWR('/api/profile', fetcher);
  const [saving, setSaving] = useState(false);
  const [gender, setGender] = useState('');

  const profile = data || {};

  useEffect(() => {
    setGender(profile.gender || '');
  }, [profile.gender]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Profile saved');
        mutate();
      } else {
        toast.error('Failed to save profile');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your personal information and medical history
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Patient Information */}
        <div className="medical-card">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Patient Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <Label className="mb-2 block">Full name</Label>
              <Input
                name="fullName"
                defaultValue={profile.fullName || ''}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label className="mb-2 block">Date of birth</Label>
              <Input name="dateOfBirth" type="date" defaultValue={profile.dateOfBirth || ''} />
            </div>
            <div>
              <Label className="mb-2 block">Gender</Label>
              <input type="hidden" name="gender" value={gender} />
              <Select defaultValue={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Phone (optional)</Label>
              <Input
                name="phone"
                type="tel"
                defaultValue={profile.phone || ''}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="medical-card">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Medical History</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Past conditions</Label>
              <Textarea
                name="pastConditions"
                rows={3}
                placeholder="e.g., diabetes, arthritis, hypertension (one per line or comma-separated)"
                defaultValue={(profile.pastConditions || []).join(', ')}
              />
            </div>
            <div>
              <Label className="mb-2 block">Surgeries & hospitalizations</Label>
              <Textarea
                name="surgeries"
                rows={3}
                placeholder="e.g., appendectomy 2020, knee surgery 2018 (one per line or comma-separated)"
                defaultValue={(profile.surgeries || []).join(', ')}
              />
            </div>
            <div>
              <Label className="mb-2 block">Current medications</Label>
              <Textarea
                name="currentMedications"
                rows={3}
                placeholder="e.g., Lisinopril 10mg daily, Metformin 500mg twice daily (one per line or comma-separated)"
                defaultValue={(profile.currentMedications || []).join(', ')}
              />
            </div>
            <div>
              <Label className="mb-2 block">Allergies</Label>
              <Textarea
                name="allergies"
                rows={3}
                placeholder="e.g., penicillin, peanuts, latex (one per line or comma-separated)"
                defaultValue={(profile.allergies || []).join(', ')}
              />
            </div>
            <div>
              <Label className="mb-2 block">Family history</Label>
              <Textarea
                name="familyHistory"
                rows={3}
                placeholder="e.g., father had heart disease, mother has diabetes"
                defaultValue={profile.familyHistory || ''}
              />
            </div>
            <div>
              <Label className="mb-2 block">Social history</Label>
              <Textarea
                name="socialHistory"
                rows={3}
                placeholder="e.g., smokes 1 pack/day, drinks occasionally, exercises 3x/week"
                defaultValue={profile.socialHistory || ''}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="medical-card">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Additional Notes
            </h2>
          </div>
          <Textarea
            name="notes"
            rows={4}
            placeholder="Any additional information you'd like to share with your care team..."
            defaultValue={profile.notes || ''}
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
            {profile.updatedAt && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated {new Date(profile.updatedAt).toLocaleDateString()} at{' '}
                {new Date(profile.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
