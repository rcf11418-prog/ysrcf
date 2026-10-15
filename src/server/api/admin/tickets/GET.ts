import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseeProfiles, supportTickets, user } from '../../../db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'tickets.manage');
    if (!ctx) return;

    const rows = await db.select({
      id: supportTickets.id,
      ticketNumber: supportTickets.ticketNumber,
      subject: supportTickets.subject,
      category: supportTickets.category,
      priority: supportTickets.priority,
      status: supportTickets.status,
      assignedTo: supportTickets.assignedTo,
      createdAt: supportTickets.createdAt,
      franchiseCode: franchiseeProfiles.franchiseCode,
      franchiseeName: user.name,
    })
      .from(supportTickets)
      .innerJoin(franchiseeProfiles, eq(franchiseeProfiles.id, supportTickets.franchiseeId))
      .innerJoin(user, eq(user.id, franchiseeProfiles.userId))
      .orderBy(desc(supportTickets.createdAt))
      .limit(300);

    return res.json(rows);
  } catch (error) {
    console.error('admin.tickets.list.failed', error);
    return res.status(500).json({ error: 'Failed to load tickets' });
  }
}
