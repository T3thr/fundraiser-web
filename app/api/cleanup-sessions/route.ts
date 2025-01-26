import { NextApiRequest, NextApiResponse } from 'next';
import { cleanupExpiredSessions } from '@/app/api/create-payment/route';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await cleanupExpiredSessions();
      res.status(200).json({ message: 'Sessions cleaned up successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clean up sessions' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}