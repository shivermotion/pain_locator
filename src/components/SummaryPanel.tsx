'use client';

import { useState, useEffect, useCallback } from 'react';
import { PainPoint, PainSummary } from '@/types/pain';
import {
  FileText,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Edit2,
  Save,
  AlertCircle,
} from 'lucide-react';
import { usePainStore } from '@/store/painStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface SummaryPanelProps {
  painPoints: PainPoint[];
  onEditPainPoint: (painPoint: PainPoint) => void;
  onFocusPainPoint: (painPoint: PainPoint) => void;
}

export default function SummaryPanel({
  painPoints,
  onEditPainPoint,
  onFocusPainPoint,
}: SummaryPanelProps) {
  const [summary, setSummary] = useState<PainSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { removePainPoint, clearAllPainPoints } = usePainStore();

  const generateSummary = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Calculate basic statistics
      const totalPoints = painPoints.length;
      const averageIntensity =
        painPoints.reduce((sum, point) => sum + point.intensity, 0) / totalPoints;

      // Find most common quality
      const qualityCounts = painPoints.reduce((acc, point) => {
        acc[point.quality] = (acc[point.quality] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonQuality = Object.entries(qualityCounts).sort(
        ([, a], [, b]) => b - a
      )[0][0] as PainPoint['quality'];

      // Get unique body regions
      const bodyRegions = Array.from(new Set(painPoints.flatMap(point => point.bodyParts)));

      // Generate summary text
      const summaryText = generateSummaryText(painPoints);

      setSummary({
        totalPoints,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        mostCommonQuality,
        bodyRegions,
        summaryText,
      });
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [painPoints]);

  // Generate summary when pain points change
  useEffect(() => {
    if (painPoints.length > 0) {
      generateSummary();
    } else {
      setSummary(null);
    }
  }, [painPoints, generateSummary]);

  const generateSummaryText = (points: PainPoint[]): string => {
    if (points.length === 0) return 'No pain points recorded.';

    const regions = Array.from(new Set(points.flatMap(p => p.bodyParts)));
    const avgIntensity = points.reduce((sum, p) => sum + p.intensity, 0) / points.length;

    let text = `Patient reports ${points.length} pain location${points.length > 1 ? 's' : ''}`;

    if (regions.length > 0 && regions[0] !== 'Unknown') {
      text += ` in ${regions.join(', ')}`;
    }

    text += `. Average pain intensity is ${Math.round(avgIntensity * 10) / 10}/10. `;

    // Add details about pain characteristics
    const qualities = Array.from(new Set(points.map(p => p.quality)));
    if (qualities.length > 0) {
      text += `Pain is described as ${qualities.join(', ')}. `;
    }

    // Add aggravating factors
    const aggravatingFactors = Array.from(new Set(points.flatMap(p => p.aggravatingFactors)));
    if (aggravatingFactors.length > 0) {
      text += `Pain is aggravated by ${aggravatingFactors.join(', ')}. `;
    }

    // Add relieving factors
    const relievingFactors = Array.from(new Set(points.flatMap(p => p.relievingFactors)));
    if (relievingFactors.length > 0) {
      text += `Pain is relieved by ${relievingFactors.join(', ')}. `;
    }

    // Add associated symptoms
    const symptoms = Array.from(new Set(points.flatMap(p => p.associatedSymptoms)));
    if (symptoms.length > 0) {
      text += `Associated symptoms include ${symptoms.join(', ')}.`;
    }

    return text;
  };

  const copyToClipboard = async () => {
    if (summary?.summaryText) {
      try {
        await navigator.clipboard.writeText(summary.summaryText);
        toast.success('Summary copied to clipboard');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  const downloadSummary = () => {
    if (!summary) return;

    const content = `
PAIN ASSESSMENT SUMMARY
Generated: ${new Date().toLocaleString()}

${summary.summaryText}

DETAILED BREAKDOWN:
- Total pain points: ${summary.totalPoints}
- Average intensity: ${summary.averageIntensity}/10
- Most common quality: ${summary.mostCommonQuality}
- Body regions affected: ${summary.bodyRegions.join(', ')}

INDIVIDUAL PAIN POINTS:
${painPoints
  .map(
    (point, index) => `
${index + 1}. Location: ${point.bodyParts.join(', ')}
   Intensity: ${point.intensity}/10
   Quality: ${point.quality}
   Type: ${point.type}
   Onset: ${point.onset}
   Duration: ${point.duration}
   Aggravating factors: ${point.aggravatingFactors.join(', ') || 'None'}
   Relieving factors: ${point.relievingFactors.join(', ') || 'None'}
   Associated symptoms: ${point.associatedSymptoms.join(', ') || 'None'}
   Patient notes: ${point.patientNarrative || '—'}
`
  )
  .join('')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pain-assessment-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveSession = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: painPoints,
          summaryText: summary?.summaryText || '',
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSaveMessage('Saved! Your session is now available for your doctor.');
      // Auto-hide after 3s
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      console.error('Failed to save session', e);
      setSaveMessage('Something went wrong while saving. Please try again.');
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pain Summary</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={generateSummary}
              disabled={isGenerating || painPoints.length === 0}
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllPainPoints}
              disabled={painPoints.length === 0}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Patient feedback banner */}
      {saveMessage && (
        <div className="px-6 pt-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 text-sm px-4 py-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            {saveMessage}{' '}
            <a href="/patient/history" className="underline ml-1">
              View history
            </a>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {painPoints.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No pain points recorded
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Click on the body model to add pain markers
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pain Points List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pain Entries
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  {painPoints.length}
                </Badge>
              </div>
              {painPoints.map((point, index) => (
                <Card
                  key={point.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-700"
                  onClick={() => onFocusPainPoint(point)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Pain Point {index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {point.intensity}/10
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            onEditPainPoint(point);
                          }}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit pain point"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            // Clear painted colors on the mesh when deleting
                            // We signal via a custom event the painter can listen to (optional future improvement)
                            removePainPoint(point.id);
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete pain point"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {point.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Quality:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {point.quality}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Onset:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {point.onset}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {point.duration}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Location:</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {point.region || '—'} • {point.side || '—'} • {point.surface || '—'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {point.bodyParts.join(', ')}
                      </div>
                    </div>

                    {(point.aggravatingFactors.length > 0 ||
                      point.relievingFactors.length > 0 ||
                      point.associatedSymptoms.length > 0) && (
                      <div className="mt-3 space-y-2">
                        {point.aggravatingFactors.length > 0 && (
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                              Aggravating factors:
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {point.aggravatingFactors.join(', ')}
                            </div>
                          </div>
                        )}
                        {point.relievingFactors.length > 0 && (
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                              Relieving factors:
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {point.relievingFactors.join(', ')}
                            </div>
                          </div>
                        )}
                        {point.associatedSymptoms.length > 0 && (
                          <div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                              Associated symptoms:
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {point.associatedSymptoms.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {point.patientNarrative && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                          Patient notes:
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 italic">
                          {point.patientNarrative}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            {summary && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Medical Summary
                </h3>
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      {summary.summaryText}
                    </p>
                  </CardContent>
                </Card>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={saveSession}
                    disabled={!summary || isSaving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    <span>{isSaving ? 'Saving…' : 'Save Session'}</span>
                  </Button>
                  <Button variant="outline" onClick={copyToClipboard} className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    <span>Copy</span>
                  </Button>
                  <Button variant="outline" onClick={downloadSummary} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
