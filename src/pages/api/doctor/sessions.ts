import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { listAllSessions } from '@/lib/sessionStore';
import { users } from '@/lib/authOptions';

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

  if (req.method === 'GET') {
    const all = listAllSessions();
    res.status(200).json(all);
    return;
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end('Method Not Allowed');
}
