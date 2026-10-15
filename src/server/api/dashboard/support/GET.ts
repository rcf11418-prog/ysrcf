import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseeProfiles, supportTickets } from '../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { getAuth } from '../../../../lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const [profile] = await db.select({ id: franchiseeProfiles.id }).from(franchiseeProfiles)
      .where(eq(franchiseeProfiles.userId, session.user.id)).limit(1);
    if (!profile) return res.json([]);

    const tickets = await db.select().from(supportTickets)
      .where(eq(supportTickets.franchiseeId, profile.id))
      .orderBy(desc(supportTickets.createdAt));
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ error: 'Failed', message: String(error) });
  }
}
