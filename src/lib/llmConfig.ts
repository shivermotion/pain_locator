// LLM Configuration for Pain Locator (Groq-only)
interface PainPointLite {
  bodyParts?: string[];
  intensity?: number;
  quality?: string;
  onset?: string;
  duration?: string;
}

export const LLM_CONFIG = {
  // Groq API configuration
  groq: {
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-8b-8192', // Fast, reliable model
    apiKey: process.env.GROQ_API_KEY,
  },
  
  // Generation parameters
  generationParams: {
    max_tokens: 300,
    temperature: 0.2,
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
} as const;

// Debug: Log the API key on module load
console.log('[LLM] Config loaded with Groq key:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.slice(0, 8)}...` : 'missing');

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

// Helper function to call Groq API
export async function callLLM(promptText: string): Promise<string> {
  console.log('[LLM] 🚀 Starting LLM request...');
  console.log('[LLM] 📝 Prompt length:', promptText.length, 'characters');
  console.log('[LLM] 📝 Prompt preview:', promptText.slice(0, 200) + '...');
  
  // Try Groq first
  const groqKey = LLM_CONFIG.groq.apiKey;
  if (groqKey) {
    console.log('[LLM] 🔄 Trying Groq API with model:', LLM_CONFIG.groq.model);
    try {
      const requestBody = {
        model: LLM_CONFIG.groq.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical assistant generating preliminary assessments for clinicians.'
          },
          {
            role: 'user',
            content: promptText
          }
        ],
        max_tokens: LLM_CONFIG.generationParams.max_tokens,
        temperature: LLM_CONFIG.generationParams.temperature,
      };
      
      console.log('[LLM] 📤 Sending request to Groq...');
      const response = await fetch(LLM_CONFIG.groq.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.choices[0]?.message?.content || 'No response generated';
        console.log('[LLM] ✅ Groq success!');
        console.log('[LLM] 📥 Response length:', responseText.length, 'characters');
        console.log('[LLM] 📥 Response preview:', responseText.slice(0, 300) + '...');
        return responseText;
      } else {
        const errorText = await response.text();
        console.error('[LLM] ❌ Groq failed:', response.status, errorText.slice(0, 200));
      }
    } catch (error) {
      console.error('[LLM] ❌ Groq error:', error);
    }
  }
  
  // If all fail, throw error
  console.error('[LLM] 💥 All LLM services failed to respond');
  throw new Error('All LLM services failed to respond');
}
