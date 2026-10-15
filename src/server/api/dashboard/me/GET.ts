import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseeProfiles, notifications, supportTickets } from '../../../db/schema.js';
import { eq, count, and } from 'drizzle-orm';
import { getAuth } from '../../../../lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const [profile] = await db.select().from(franchiseeProfiles)
      .where(eq(franchiseeProfiles.userId, session.user.id)).limit(1);

    if (!profile) {
      // Return basic user info without profile
      return res.json({ user: session.user, profile: null });
    }

    const [unreadCount] = await db.select({ count: count() }).from(notifications)
      .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));

    const [openTickets] = await db.select({ count: count() }).from(supportTickets)
      .where(and(eq(supportTickets.franchiseeId, profile.id), eq(supportTickets.status, 'open')));

    return res.json({
      user: session.user,
      profile,
      stats: {
        unreadNotifications: unreadCount?.count ?? 0,
        openTickets: openTickets?.count ?? 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed', message: String(error) });
  }
}
