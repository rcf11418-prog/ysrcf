import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { auditLogs, franchiseeProfiles, payments } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { requirePermission } from '../../../admin/rbac.js';

const MODES = ['NEFT', 'RTGS', 'Cheque', 'UPI', 'Cash'];

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'payments.record');
    if (!ctx) return;

    const { franchiseeId, amount, paymentMode, referenceNumber, purpose, remarks } = req.body ?? {};
    const amountText = String(amount ?? '').trim();
    const amountNum = Number(amountText);
    if (!Number.isInteger(franchiseeId) || !/^\d{1,10}(?:\.\d{1,2})?$/.test(amountText)
      || !Number.isSafeInteger(Math.round(amountNum * 100)) || amountNum <= 0) {
      return res.status(400).json({ error: 'franchiseeId and a positive amount are required' });
    }
    if (paymentMode !== undefined && (typeof paymentMode !== 'string' || !MODES.includes(paymentMode))) {
      return res.status(400).json({ error: 'Invalid payment mode' });
    }
    if ((referenceNumber !== undefined && typeof referenceNumber !== 'string')
      || (purpose !== undefined && typeof purpose !== 'string')
      || (remarks !== undefined && typeof remarks !== 'string')) {
      return res.status(400).json({ error: 'Payment reference, purpose and remarks must be text' });
    }

    const [profile] = await db.select().from(franchiseeProfiles)
      .where(eq(franchiseeProfiles.id, franchiseeId)).limit(1);
    if (!profile) return res.status(404).json({ error: 'Franchisee not found' });

    const transactionId = 'PAY-' + Date.now().toString(36).toUpperCase() + '-' + randomBytes(2).toString('hex').toUpperCase();
    await db.transaction(async (tx) => {
      await tx.insert(payments).values({
        franchiseeId,
        transactionId,
        amount: amountNum.toFixed(2),
        paymentDate: new Date(),
        paymentMode: paymentMode ?? null,
        referenceNumber: referenceNumber ? referenceNumber.slice(0, 100) : null,
        purpose: purpose ? purpose.slice(0, 255) : 'Franchise payment',
        status: 'pending',
        remarks: remarks ? remarks.slice(0, 2000) : null,
      });
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: 'payment.record',
        entityType: 'payment',
        entityId: transactionId,
        details: JSON.stringify({ franchiseeId, amount: amountNum, status: 'pending' }),
      });
    });

    return res.status(201).json({ success: true, transactionId, status: 'pending' });
  } catch (error) {
    console.error('admin.payments.record.failed', error);
    return res.status(500).json({ error: 'Failed to record payment' });
  }
}
