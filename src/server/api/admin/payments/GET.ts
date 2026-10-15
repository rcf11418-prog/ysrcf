import type { Request, Response } from 'express';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { franchiseeProfiles, payments, user } from '../../../db/schema.js';
import { requirePermission } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'payments.view');
    if (!ctx) return;

    const rows = await db.select({
      id: payments.id,
      transactionId: payments.transactionId,
      franchiseeId: payments.franchiseeId,
      franchiseeName: user.name,
      franchiseCode: franchiseeProfiles.franchiseCode,
      amount: payments.amount,
      paymentDate: payments.paymentDate,
      paymentMode: payments.paymentMode,
      referenceNumber: payments.referenceNumber,
      purpose: payments.purpose,
      status: payments.status,
      remarks: payments.remarks,
    })
      .from(payments)
      .innerJoin(franchiseeProfiles, eq(franchiseeProfiles.id, payments.franchiseeId))
      .innerJoin(user, eq(user.id, franchiseeProfiles.userId))
      .orderBy(desc(payments.paymentDate))
      .limit(500);

    return res.set('Cache-Control', 'no-store').json(rows);
  } catch (error) {
    console.error('admin.payments.list.failed', error);
    return res.status(500).json({ error: 'Failed to load payments' });
  }
}
