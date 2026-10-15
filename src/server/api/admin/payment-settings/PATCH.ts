import type { Request, Response } from 'express';
import { encryptPaymentDetails } from '../../../admin/payment-encryption.js';
import { DEFAULT_FRANCHISE_TYPES, DEFAULT_INVESTMENT_CATEGORIES } from '../../../admin/franchise-settings.js';
import { requirePermission } from '../../../admin/rbac.js';
import { db } from '../../../db/client.js';
import { auditLogs, franchiseSettings } from '../../../db/schema.js';
import { EMPTY_PAYMENT_DETAILS } from './GET.js';

const FIELDS = ['bankName', 'accountName', 'accountNumber', 'ifsc', 'branch', 'upiId', 'instructions'] as const;
type DetailField = (typeof FIELDS)[number];
const LIMITS: Record<DetailField, number> = {
  bankName: 150, accountName: 255, accountNumber: 34, ifsc: 11, branch: 150, upiId: 256, instructions: 4000,
};

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'bank.edit');
    if (!ctx) return;
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)
      || typeof body.published !== 'boolean'
      || !body.details || typeof body.details !== 'object' || Array.isArray(body.details)) {
      return res.status(400).json({ error: 'Payment details and published status are required' });
    }
    const details = { ...EMPTY_PAYMENT_DETAILS };
    for (const field of FIELDS) {
      const value = (body.details as Record<string, unknown>)[field];
      if (typeof value !== 'string' || value.trim().length > LIMITS[field]) {
        return res.status(400).json({ error: `Invalid payment setting: ${field}` });
      }
      details[field] = value.trim();
    }
    if (details.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(details.ifsc.toUpperCase())) {
      return res.status(400).json({ error: 'IFSC format is invalid' });
    }
    if (details.accountNumber && !/^[A-Z0-9-]{5,34}$/i.test(details.accountNumber)) {
      return res.status(400).json({ error: 'Account number format is invalid' });
    }
    if (details.upiId && !/^[\w.-]{2,128}@[A-Za-z0-9.-]{2,64}$/.test(details.upiId)) {
      return res.status(400).json({ error: 'UPI ID format is invalid' });
    }
    if (body.published && (!details.instructions || (!details.upiId && !(details.bankName && details.accountName && details.accountNumber && details.ifsc)))) {
      return res.status(400).json({ error: 'To publish instructions, add payment instructions and complete bank transfer or UPI details' });
    }

    let paymentDetailsCiphertext: string;
    try {
      paymentDetailsCiphertext = encryptPaymentDetails(details);
    } catch (error) {
      console.error('admin.payment-settings.encryption.failed', error);
      return res.status(503).json({ error: 'Secure payment storage is unavailable; configure BANK_DETAILS_ENCRYPTION_KEY' });
    }
    await db.transaction(async (tx) => {
      await tx.insert(franchiseSettings).values({
        id: 1,
        franchiseTypes: JSON.stringify(DEFAULT_FRANCHISE_TYPES),
        investmentCategories: JSON.stringify(DEFAULT_INVESTMENT_CATEGORIES),
        paymentDetailsCiphertext,
        paymentDetailsPublished: body.published,
        updatedBy: ctx.userId,
      }).onDuplicateKeyUpdate({
        set: {
          paymentDetailsCiphertext,
          paymentDetailsPublished: body.published,
          updatedBy: ctx.userId,
        },
      });
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: 'settings.payment.update',
        entityType: 'settings',
        entityId: 'payment',
        details: JSON.stringify({
          published: body.published,
          changedFields: FIELDS.filter((field) => details[field] !== ''),
        }),
      });
    });
    return res.json({ success: true, published: body.published });
  } catch (error) {
    console.error('admin.payment-settings.update.failed', error);
    return res.status(503).json({ error: 'Could not save company payment settings' });
  }
}
