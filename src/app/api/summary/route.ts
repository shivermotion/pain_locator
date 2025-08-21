import { NextRequest, NextResponse } from 'next/server';
import { PainPoint } from '@/types/pain';

export async function POST(request: NextRequest) {
  try {
    const { painPoints } = await request.json();

    if (!Array.isArray(painPoints)) {
      return NextResponse.json(
        { error: 'Invalid pain points data' },
        { status: 400 }
      );
    }

    // For now, generate a basic summary
    // In the future, this could integrate with Grok API or other LLM services
    const summary = generateAISummary(painPoints);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

function generateAISummary(painPoints: PainPoint[]): string {
  if (painPoints.length === 0) {
    return 'No pain points recorded.';
  }

  const regions = Array.from(new Set(painPoints.flatMap(p => p.bodyParts)));
  const avgIntensity = painPoints.reduce((sum, p) => sum + p.intensity, 0) / painPoints.length;
  const qualities = Array.from(new Set(painPoints.map(p => p.quality)));
  const aggravatingFactors = Array.from(new Set(painPoints.flatMap(p => p.aggravatingFactors)));
  const relievingFactors = Array.from(new Set(painPoints.flatMap(p => p.relievingFactors)));
  const symptoms = Array.from(new Set(painPoints.flatMap(p => p.associatedSymptoms)));

  let summary = `Patient presents with ${painPoints.length} pain location${painPoints.length > 1 ? 's' : ''}`;
  
  if (regions.length > 0 && regions[0] !== 'Unknown') {
    summary += ` in ${regions.join(', ')}`;
  }
  
  summary += `. Average pain intensity is ${Math.round(avgIntensity * 10) / 10}/10. `;
  
  if (qualities.length > 0) {
    summary += `Pain is characterized as ${qualities.join(', ')}. `;
  }
  
  if (aggravatingFactors.length > 0) {
    summary += `Pain is exacerbated by ${aggravatingFactors.join(', ')}. `;
  }
  
  if (relievingFactors.length > 0) {
    summary += `Pain is alleviated by ${relievingFactors.join(', ')}. `;
  }
  
  if (symptoms.length > 0) {
    summary += `Associated symptoms include ${symptoms.join(', ')}. `;
  }

  // Add clinical recommendations
  summary += `\n\nClinical Assessment: Consider differential diagnosis based on pain location and characteristics. `;
  
  if (avgIntensity > 7) {
    summary += 'High pain intensity warrants immediate attention. ';
  }
  
  if (symptoms.includes('Nausea') || symptoms.includes('Vomiting')) {
    summary += 'Presence of gastrointestinal symptoms may indicate systemic involvement. ';
  }

  return summary;
}
