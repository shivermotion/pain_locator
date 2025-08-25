import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getSession, deleteSession } from '@/lib/sessionStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.email) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    const record = getSession(id);
    if (!record) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (record.userId !== session.user.email) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.status(200).json(record);
    return;
  }

  if (req.method === 'DELETE') {
    const record = getSession(id);
    if (!record) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (record.userId !== session.user.email) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    deleteSession(id);
    res.status(204).end();
    return;
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  res.status(405).end('Method Not Allowed');
}
