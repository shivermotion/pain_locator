import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { buildAssessmentPrompt, callHuggingFace, LLM_CONFIG } from '@/lib/llmConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.email) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (session.role !== 'doctor') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  const body = req.body || {};
  const { summaryText = '', points = [] } = body as { summaryText?: string; points?: any[] };

  // Build prompt using centralized config
  const prompt = buildAssessmentPrompt(points, summaryText);

  // Basic request log (POC)
  try {
    console.log(
      `[LLM] /api/doctor/assess request: points=${Array.isArray(points) ? points.length : 0}, summaryChars=${summaryText.length}`
    );
  } catch {}

  function buildMockAssessment(): string {
    return [
      'Non-diagnostic assessment (POC):',
      '',
      `- Number of painted areas: ${points.length}`,
      `- Key patient narrative/summary: ${summaryText.slice(0, 300)}`,
      '- Patterns: Distribution and intensity may suggest musculoskeletal contributions; correlate with exam.',
      '- Consider conservative measures and reassessment unless red flags emerge.',
      '',
      'Disclaimer: This auto-generated text is for demonstration only and is not medical advice.'
    ].join('\n');
  }

  try {
    if (!LLM_CONFIG.env.token) {
      console.log('[LLM] No HUGGINGFACE_TOKEN configured; serving fallback response');
      const assessment = buildMockAssessment();
      res.status(200).json({ assessment, fallbackUsed: true, reason: 'no_token' });
      return;
    }

    const assessment = await callHuggingFace(prompt);
    try {
      console.log(
        `[LLM] Response received (fallback=false) chars=${assessment.length} preview=` +
          assessment.slice(0, 160).replace(/\n/g, ' ')
      );
    } catch {}
    res.status(200).json({ assessment, fallbackUsed: false });
    return;
  } catch (err) {
    console.error('[LLM] Error during LLM call; serving fallback', err);
    const assessment = buildMockAssessment();
    const message = (err as Error)?.message || '';
    const reason = message.includes('404') ? 'model_access' : 'inference_error';
    res.status(200).json({ assessment, fallbackUsed: true, reason });
    return;
  }
}
