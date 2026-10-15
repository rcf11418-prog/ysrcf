import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseeProfiles, supportTickets, supportMessages } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { getAuth } from '../../../../lib/auth/auth.js';
import { randomBytes } from 'crypto';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const [profile] = await db.select({ id: franchiseeProfiles.id }).from(franchiseeProfiles)
      .where(eq(franchiseeProfiles.userId, session.user.id)).limit(1);
    if (!profile) return res.status(400).json({ error: 'Profile not found' });

    const { subject, description, category, priority } = req.body;
    if (!subject || !description) return res.status(400).json({ error: 'Subject and description required' });

    const ticketNumber = 'TKT-' + Date.now().toString().slice(-6) + '-' + randomBytes(2).toString('hex').toUpperCase();
    const result = await db.insert(supportTickets).values({
      franchiseeId: profile.id,
      ticketNumber,
      subject,
      description,
      category: category || 'General',
      priority: priority || 'medium',
      status: 'open',
    });
    const insertId = Number(result[0].insertId);

    // Add first message
    await db.insert(supportMessages).values({
      ticketId: insertId,
      senderType: 'franchisee',
      senderName: session.user.name,
      message: description,
    });

    return res.status(201).json({ success: true, ticketNumber });
  } catch (error) {
    return res.status(500).json({ error: 'Failed', message: String(error) });
  }
}
