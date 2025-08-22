'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { PainPoint, PainType, PainQuality, PainOnset, PainDuration } from '@/types/pain';

interface PainDescriptionModalProps {
  painPoint: PainPoint;
  isOpen: boolean;
  onClose: () => void;
  onSave: (painPoint: PainPoint) => void;
}

const PAIN_QUALITIES: PainQuality[] = [
  'sharp',
  'dull',
  'throbbing',
  'burning',
  'aching',
  'cramping',
  'stabbing',
  'tingling',
  'numbness',
];

const PAIN_ONSETS: PainOnset[] = ['sudden', 'gradual', 'recent', 'chronic'];
const PAIN_DURATIONS: PainDuration[] = ['brief', 'intermittent', 'continuous', 'waxing-waning'];

const COMMON_FACTORS = [
  'Movement',
  'Rest',
  'Pressure',
  'Heat',
  'Cold',
  'Stress',
  'Exercise',
  'Sleep',
  'Eating',
  'Breathing',
  'Coughing',
];

const COMMON_SYMPTOMS = [
  'Nausea',
  'Vomiting',
  'Dizziness',
  'Swelling',
  'Redness',
  'Warmth',
  'Stiffness',
  'Weakness',
  'Numbness',
  'Tingling',
];

export default function PainDescriptionModal({
  painPoint,
  isOpen,
  onClose,
  onSave,
}: PainDescriptionModalProps) {
  const [formData, setFormData] = useState<PainPoint>(painPoint);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof PainPoint, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleFactorToggle = (factor: string, type: 'aggravating' | 'relieving') => {
    const field = type === 'aggravating' ? 'aggravatingFactors' : 'relievingFactors';
    const currentFactors = formData[field];

    if (currentFactors.includes(factor)) {
      handleInputChange(
        field,
        currentFactors.filter(f => f !== factor)
      );
    } else {
      handleInputChange(field, [...currentFactors, factor]);
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    const currentSymptoms = formData.associatedSymptoms;

    if (currentSymptoms.includes(symptom)) {
      handleInputChange(
        'associatedSymptoms',
        currentSymptoms.filter(s => s !== symptom)
      );
    } else {
      handleInputChange('associatedSymptoms', [...currentSymptoms, symptom]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Describe Your Pain
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Auto-detected anatomy */}
          <div className="medical-card">
            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
              Detected Location
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Region: {formData.region || '—'}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Side: {formData.side || '—'}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Surface: {formData.surface || '—'}
              </span>
            </div>
            {formData.bodyParts?.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Likely anatomy:</div>
                <div className="flex flex-wrap gap-1">
                  {formData.bodyParts.map(part => (
                    <span
                      key={part}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs border border-blue-200 dark:border-blue-800"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type of pain
              </label>
              <select
                value={formData.type}
                onChange={e => handleInputChange('type', e.target.value as PainType)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="external">External (skin/muscle)</option>
                <option value="internal">Internal (organ/deep tissue)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How intense is it? (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.intensity}
                onChange={e => handleInputChange('intensity', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formData.intensity}/10
              </div>
            </div>
          </div>

          {/* Pain Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How does it feel?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAIN_QUALITIES.map(quality => (
                <button
                  key={quality}
                  onClick={() => handleInputChange('quality', quality)}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    formData.quality === quality
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Onset and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                When did it start?
              </label>
              <select
                value={formData.onset}
                onChange={e => handleInputChange('onset', e.target.value as PainOnset)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {PAIN_ONSETS.map(onset => (
                  <option key={onset} value={onset}>
                    {onset.charAt(0).toUpperCase() + onset.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How often/How long?
              </label>
              <select
                value={formData.duration}
                onChange={e => handleInputChange('duration', e.target.value as PainDuration)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {PAIN_DURATIONS.map(duration => (
                  <option key={duration} value={duration}>
                    {duration.charAt(0).toUpperCase() + duration.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Aggravating Factors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What makes the pain worse?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_FACTORS.map(factor => (
                <button
                  key={factor}
                  onClick={() => handleFactorToggle(factor, 'aggravating')}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    formData.aggravatingFactors.includes(factor)
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>

          {/* Relieving Factors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What helps the pain?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_FACTORS.map(factor => (
                <button
                  key={factor}
                  onClick={() => handleFactorToggle(factor, 'relieving')}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    formData.relievingFactors.includes(factor)
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>

          {/* Associated Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Other symptoms</label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_SYMPTOMS.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    formData.associatedSymptoms.includes(symptom)
                      ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Narrative for LLM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tell us more (optional)
            </label>
            <textarea
              value={formData.patientNarrative || ''}
              onChange={e => handleInputChange('patientNarrative', e.target.value)}
              placeholder="Share anything you think matters: when it happens, what you were doing, past injuries, medicines, triggers, and concerns."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will be included in your summary to help your care team.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
