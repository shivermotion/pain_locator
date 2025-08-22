import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getSession } from '@/lib/sessionStore';

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

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  const record = getSession(id);
  if (!record) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  res.status(200).json(record);
}
