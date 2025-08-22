'use client';

import { useState, useEffect, useCallback } from 'react';
import { PainPoint, PainSummary } from '@/types/pain';
import { FileText, Copy, Download, Trash2, RefreshCw, Edit2 } from 'lucide-react';
import { usePainStore } from '@/store/painStore';

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
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pain Summary</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={generateSummary}
              disabled={isGenerating || painPoints.length === 0}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={clearAllPainPoints}
              disabled={painPoints.length === 0}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {painPoints.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pain points recorded</p>
            <p className="text-sm">Click on the body model to add pain markers</p>
          </div>
        ) : (
          <>
            {/* Pain Points List */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Your pain entries ({painPoints.length})
              </h3>
              {painPoints.map((point, index) => (
                <div
                  key={point.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => onFocusPainPoint(point)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Point {index + 1}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onEditPainPoint(point);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Edit pain point"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          // Clear painted colors on the mesh when deleting
                          // We signal via a custom event the painter can listen to (optional future improvement)
                          removePainPoint(point.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete pain point"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div>Type: {point.type}</div>
                    <div>Intensity: {point.intensity}/10</div>
                    <div>Quality: {point.quality}</div>
                    <div>Onset: {point.onset}</div>
                    <div>Duration: {point.duration}</div>
                    <div>
                      Location: {point.region || '—'} • {point.side || '—'} • {point.surface || '—'}
                    </div>
                    <div>Anatomy: {point.bodyParts.join(', ')}</div>
                    {point.aggravatingFactors.length > 0 && (
                      <div>Aggravating: {point.aggravatingFactors.join(', ')}</div>
                    )}
                    {point.relievingFactors.length > 0 && (
                      <div>Relieving: {point.relievingFactors.join(', ')}</div>
                    )}
                    {point.associatedSymptoms.length > 0 && (
                      <div>Symptoms: {point.associatedSymptoms.join(', ')}</div>
                    )}
                    {point.patientNarrative && (
                      <div className="text-gray-700 dark:text-gray-300">
                        Notes: {point.patientNarrative}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {summary && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Medical Summary</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {summary.summaryText}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={downloadSummary}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
