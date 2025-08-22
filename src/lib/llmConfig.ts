// LLM Configuration for Pain Locator
interface PainPointLite {
  bodyParts?: string[];
  intensity?: number;
  quality?: string;
  onset?: string;
  duration?: string;
}

type HFTextGenArray = Array<{ generated_text?: string }>;

export const LLM_CONFIG = {
  // Hugging Face text generation model (definitely available on free tier)
  modelId: 'gpt2',
  apiUrl: 'https://api-inference.huggingface.co/models/gpt2',
  
  // Generation parameters
  generationParams: {
    max_new_tokens: 300,
    temperature: 0.2,
    return_full_text: false,
  },
  
  // System prompts for different use cases
  prompts: {
    doctorAssessment: [
      'You are a helpful medical assistant generating a short, preliminary assessment for a clinician.',
      'Summarize likely considerations based on the patient\'s painted pain regions and notes.',
      'Do NOT provide a diagnosis. Include a brief overview, patterns, and next-step considerations.',
      '',
      'Format as 4-7 bullet points. End with a disclaimer that this is not medical advice.'
    ].join('\n'),
    
    // Future: Add more prompt types here
    // patientSummary: '...',
    // followUpQuestions: '...',
  },
  
  // Environment variables
  env: {
    token: process.env.HUGGINGFACE_TOKEN,
  },
} as const;

// Helper function to build assessment prompt
export function buildAssessmentPrompt(points: PainPointLite[], summaryText: string): string {
  const basePrompt = LLM_CONFIG.prompts.doctorAssessment;
  
  const pointsData = points
    .map((p: PainPointLite, i: number) => {
      const parts = Array.isArray(p.bodyParts) ? p.bodyParts.join(', ') : 'Unknown';
      return `#${i + 1}: intensity=${p.intensity ?? '—'}/10; quality=${p.quality ?? '—'}; location=${parts}; onset=${p.onset ?? '—'}; duration=${p.duration ?? '—'}`;
    })
    .join('\n');
  
  return [
    basePrompt,
    '',
    `Painted areas count: ${points.length}`,
    pointsData,
    '',
    `Patient summary/notes: ${summaryText || '—'}`,
    '',
    'Format as 4-7 bullet points. End with a disclaimer that this is not medical advice.'
  ].join('\n');
}

// Helper function to call Hugging Face API
export async function callHuggingFace(promptText: string): Promise<string> {
  const token = LLM_CONFIG.env.token;
  console.log('[LLM] Token check:', token ? `present (${token.slice(0, 8)}...)` : 'missing');
  console.log('[LLM] Using model:', LLM_CONFIG.modelId, 'url:', LLM_CONFIG.apiUrl);
  if (!token) {
    throw new Error('HUGGINGFACE_TOKEN not configured');
  }
  
  const response = await fetch(LLM_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: promptText,
      parameters: LLM_CONFIG.generationParams,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[LLM] HF error body:', errText.slice(0, 400));
    throw new Error(`HF error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  
  // Handle different response formats
  if (Array.isArray(data)) {
    const arr = data as HFTextGenArray;
    if (arr.length && typeof arr[0]?.generated_text === 'string') {
      return String(arr[0].generated_text);
    }
  }
  if (typeof data === 'object' && data && 'generated_text' in (data as Record<string, unknown>)) {
    const maybe = data as Record<string, unknown>;
    const val = maybe['generated_text'];
    if (typeof val === 'string') return val;
  }
  if (typeof data === 'string') {
    return data;
  }
  
  // Fallback for unexpected formats
  return JSON.stringify(data);
}
