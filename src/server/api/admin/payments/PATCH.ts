import type { Request, Response } from 'express';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { auditLogs, franchiseeProfiles, notifications, payments } from '../../../db/schema.js';
import { hasPermission, requirePermission } from '../../../admin/rbac.js';

const TARGET_PERMISSIONS: Record<string, string> = {
  completed: 'payments.verify',
  failed: 'payments.verify',
  refunded: 'payments.refund',
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['completed', 'failed'],
  completed: ['refunded'],
};

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'payments.view');
    if (!ctx) return;

    const { paymentId, status } = req.body ?? {};
    if (!Number.isInteger(paymentId) || typeof status !== 'string' || !TARGET_PERMISSIONS[status]) {
      return res.status(400).json({ error: 'paymentId and a valid target status are required' });
    }
    if (!hasPermission(ctx, TARGET_PERMISSIONS[status])) {
      return res.status(403).json({ error: 'Your role does not allow this payment action' });
    }

    const changed = await db.transaction(async (tx) => {
      const [payment] = await tx.select({
        id: payments.id,
        franchiseeId: payments.franchiseeId,
        transactionId: payments.transactionId,
        amount: payments.amount,
        status: payments.status,
      }).from(payments).where(eq(payments.id, paymentId)).limit(1);
      if (!payment) return { error: 'not_found' as const };

      if (!(ALLOWED_TRANSITIONS[payment.status ?? ''] ?? []).includes(status)) {
        return { error: 'invalid_transition' as const };
      }

      const [profile] = await tx.select({
        id: franchiseeProfiles.id,
        userId: franchiseeProfiles.userId,
      }).from(franchiseeProfiles).where(eq(franchiseeProfiles.id, payment.franchiseeId)).limit(1);
      if (!profile) return { error: 'not_found' as const };

      const [updated] = await tx.update(payments).set({ status })
        .where(and(eq(payments.id, payment.id), eq(payments.status, payment.status!)));
      if (updated.affectedRows !== 1) return { error: 'conflict' as const };

      if (status === 'completed' || status === 'refunded') {
        const delta = status === 'completed' ? Number(payment.amount) : -Number(payment.amount);
        const paidAfterChange = sql`GREATEST(COALESCE(${franchiseeProfiles.paidAmount}, 0) + ${delta}, 0)`;
        await tx.update(franchiseeProfiles).set({
          pendingAmount: sql`GREATEST(COALESCE(${franchiseeProfiles.totalInvestment}, 0) - ${paidAfterChange}, 0)`,
          paidAmount: paidAfterChange,
        }).where(eq(franchiseeProfiles.id, profile.id));
      }

      await tx.insert(notifications).values({
        userId: profile.userId,
        title: status === 'completed' ? 'Payment verified' : status === 'refunded' ? 'Payment refunded' : 'Payment update',
        message: `Payment ${payment.transactionId} has been marked ${status}.`,
        type: status === 'completed' ? 'success' : status === 'failed' ? 'alert' : 'info',
        link: '/dashboard/payments',
      });
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: `payment.${status}`,
        entityType: 'payment',
        entityId: payment.transactionId,
        details: JSON.stringify({
          franchiseeId: profile.id,
          amount: payment.amount,
          previousStatus: payment.status,
          status,
        }),
      });
      return { transactionId: payment.transactionId, franchiseeId: profile.id, previousStatus: payment.status, amount: payment.amount };
    });

    if ('error' in changed) {
      if (changed.error === 'not_found') return res.status(404).json({ error: 'Payment or franchisee not found' });
      if (changed.error === 'invalid_transition') return res.status(409).json({ error: 'Payment status transition is not allowed' });
      return res.status(409).json({ error: 'Payment was changed by another request; reload and try again' });
    }

    return res.json({ success: true, transactionId: changed.transactionId, status });
  } catch (error) {
    console.error('admin.payments.update.failed', error);
    return res.status(500).json({ error: 'Failed to update payment' });
  }
}
