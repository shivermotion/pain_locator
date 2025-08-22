import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

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
  const { summaryText = '', points = [] } = body;

  const assessment = `Non-diagnostic assessment (POC):\n\n- Number of painted areas: ${points.length}\n- Key patient narrative/summary: ${summaryText.slice(0, 300)}\n\nClinical considerations to explore (not medical advice):\n- Correlate pain regions with history, exam, and vitals.\n- Consider imaging or labs only if red flags present.\n- Reassess after conservative measures when appropriate.`;

  res.status(200).json({ assessment });
  return;
}
