import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseeProfiles, user } from '../../../db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'franchisees.view');
    if (!ctx) return;

    const rows = await db.select({
      id: franchiseeProfiles.id,
      name: user.name,
      email: user.email,
      franchiseCode: franchiseeProfiles.franchiseCode,
      franchiseType: franchiseeProfiles.franchiseType,
      city: franchiseeProfiles.city,
      state: franchiseeProfiles.state,
      status: franchiseeProfiles.status,
      progressStage: franchiseeProfiles.progressStage,
      progressPercent: franchiseeProfiles.progressPercent,
      totalInvestment: franchiseeProfiles.totalInvestment,
      paidAmount: franchiseeProfiles.paidAmount,
      pendingAmount: franchiseeProfiles.pendingAmount,
    })
      .from(franchiseeProfiles)
      .innerJoin(user, eq(user.id, franchiseeProfiles.userId))
      .orderBy(desc(franchiseeProfiles.createdAt))
      .limit(500);

    return res.json(rows);
  } catch (error) {
    console.error('admin.franchisees.list.failed', error);
    return res.status(500).json({ error: 'Failed to load franchisees' });
  }
}
