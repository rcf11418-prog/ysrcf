import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';
import { db } from '../../../db/client.js';
import { auditLogs, staffMembers, user } from '../../../db/schema.js';

const STAFF_ROLES = [
  'admin', 'finance_manager', 'inventory_manager', 'franchise_manager',
  'sales_manager', 'delivery_manager', 'support_staff', 'accounts_staff', 'viewer',
] as const;

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'staff.manage');
    if (!ctx) return;

    const { userId, role } = req.body ?? {};
    if (typeof userId !== 'string' || userId.length > 36
      || typeof role !== 'string' || !STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number])) {
      return res.status(400).json({ error: 'An existing user and valid staff role are required' });
    }

    const result = await db.transaction(async (tx) => {
      const [account] = await tx.select({ id: user.id, isAdmin: user.isAdmin })
        .from(user).where(eq(user.id, userId)).limit(1).for('update');
      if (!account || account.isAdmin) return { error: 'account_unavailable' as const };

      const [existing] = await tx.select({ id: staffMembers.id, role: staffMembers.role })
        .from(staffMembers).where(eq(staffMembers.userId, userId)).limit(1);
      if (existing) {
        await tx.update(staffMembers).set({ role }).where(eq(staffMembers.id, existing.id));
      } else {
        await tx.insert(staffMembers).values({ userId, role });
      }
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: existing ? 'staff.role.update' : 'staff.role.assign',
        entityType: 'staff',
        entityId: userId,
        details: JSON.stringify({ previousRole: existing?.role ?? null, role }),
      });
      return { success: true };
    });
    if ('error' in result) return res.status(404).json({ error: 'Eligible user account not found' });
    return res.json(result);
  } catch (error) {
    console.error('admin.staff.assign.failed', error);
    return res.status(500).json({ error: 'Failed to assign staff role' });
  }
}
