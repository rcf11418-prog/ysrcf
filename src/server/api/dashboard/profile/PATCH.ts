import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseeProfiles } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { getAuth } from '../../../../lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const { mobile, address, city, state, gstNumber } = req.body;

    const [existing] = await db.select({ id: franchiseeProfiles.id }).from(franchiseeProfiles)
      .where(eq(franchiseeProfiles.userId, session.user.id)).limit(1);

    if (existing) {
      await db.update(franchiseeProfiles)
        .set({ mobile, address, city, state, gstNumber })
        .where(eq(franchiseeProfiles.userId, session.user.id));
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed', message: String(error) });
  }
}
