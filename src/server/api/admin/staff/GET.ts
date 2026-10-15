import type { Request, Response } from 'express';
import { asc, eq } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';
import { db } from '../../../db/client.js';
import { staffMembers, user } from '../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'staff.manage');
    if (!ctx) return;

    const rows = await db.select({
      userId: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: staffMembers.role,
    }).from(user)
      .leftJoin(staffMembers, eq(staffMembers.userId, user.id))
      .orderBy(asc(user.name))
      .limit(1000);
    return res.set('Cache-Control', 'no-store').json({
      staff: rows.filter((row) => !row.isAdmin && row.role),
      eligibleAccounts: rows.filter((row) => !row.isAdmin && !row.role),
      roles: ['admin', 'finance_manager', 'inventory_manager', 'franchise_manager', 'sales_manager', 'delivery_manager', 'support_staff', 'accounts_staff', 'viewer'],
    });
  } catch (error) {
    console.error('admin.staff.list.failed', error);
    return res.status(500).json({ error: 'Failed to load staff accounts' });
  }
}
