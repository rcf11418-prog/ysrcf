import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';
import { db } from '../../../db/client.js';
import { auditLogs, staffMembers } from '../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'staff.manage');
    if (!ctx) return;

    const { userId } = req.body ?? {};
    if (typeof userId !== 'string' || userId.length > 36) {
      return res.status(400).json({ error: 'A valid staff account is required' });
    }

    const result = await db.transaction(async (tx) => {
      const [member] = await tx.select({ id: staffMembers.id, role: staffMembers.role })
        .from(staffMembers).where(eq(staffMembers.userId, userId)).limit(1).for('update');
      if (!member) return { error: 'not_found' as const };
      await tx.delete(staffMembers).where(eq(staffMembers.id, member.id));
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: 'staff.role.remove',
        entityType: 'staff',
        entityId: userId,
        details: JSON.stringify({ previousRole: member.role }),
      });
      return { success: true };
    });
    if ('error' in result) return res.status(404).json({ error: 'Staff assignment not found' });
    return res.json(result);
  } catch (error) {
    console.error('admin.staff.remove.failed', error);
    return res.status(500).json({ error: 'Failed to remove staff access' });
  }
}
