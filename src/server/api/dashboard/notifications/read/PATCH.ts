import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { notifications } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { getAuth } from '../../../../../lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    await db.update(notifications).set({ isRead: true })
      .where(eq(notifications.userId, session.user.id));
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed', message: String(error) });
  }
}
