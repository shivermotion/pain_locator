import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { createSession, listSessionsByUser } from '@/lib/sessionStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.email) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = session.user.email as string; // POC: use email as id

  if (req.method === 'GET') {
    const list = listSessionsByUser(userId);
    res.status(200).json(list);
    return;
  }

  if (req.method === 'POST') {
    const painData = req.body;
    const record = createSession({ userId, painData });
    res.status(201).json(record);
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end('Method Not Allowed');
}
