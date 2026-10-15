import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { supportMessages, supportTickets } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requirePermission, writeAudit } from '../../../admin/rbac.js';

const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'tickets.manage');
    if (!ctx) return;

    const { ticketId, status, assignedTo, reply } = req.body ?? {};
    if (!Number.isInteger(ticketId)) return res.status(400).json({ error: 'ticketId is required' });
    if (status !== undefined && !TICKET_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [ticket] = await db.select({ id: supportTickets.id }).from(supportTickets)
      .where(eq(supportTickets.id, ticketId)).limit(1);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const changes: Record<string, unknown> = {};
    if (status) {
      changes.status = status;
      changes.resolvedAt = status === 'resolved' || status === 'closed' ? new Date() : null;
    }
    if (typeof assignedTo === 'string') changes.assignedTo = assignedTo.slice(0, 100);
    if (Object.keys(changes).length > 0) {
      await db.update(supportTickets).set(changes).where(eq(supportTickets.id, ticketId));
    }

    if (typeof reply === 'string' && reply.trim()) {
      await db.insert(supportMessages).values({
        ticketId,
        senderType: 'staff',
        senderName: ctx.name || 'Support',
        message: reply.trim().slice(0, 5000),
      });
    }

    await writeAudit(ctx, 'ticket.update', 'ticket', ticketId, { status, assignedTo, replied: Boolean(reply) });
    return res.json({ success: true });
  } catch (error) {
    console.error('admin.tickets.update.failed', error);
    return res.status(500).json({ error: 'Failed to update ticket' });
  }
}
