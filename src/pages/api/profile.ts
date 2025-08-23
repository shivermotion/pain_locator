import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { readProfile, writeProfile } from '@/lib/profileStore';
import { PatientProfile } from '@/types/profile';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.email) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (session.role !== 'patient') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const email = session.user.email as string;

  if (req.method === 'GET') {
    const profile = readProfile(email) || ({ email } as PatientProfile);
    res.status(200).json(profile);
    return;
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body || {};
      const incoming: PatientProfile = { ...(readProfile(email) || { email }), ...body, email };
      const saved = writeProfile(incoming);
      res.status(200).json(saved);
      return;
    } catch (e) {
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end('Method Not Allowed');
}


