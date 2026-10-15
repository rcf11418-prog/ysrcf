import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';
import { decryptPaymentDetails, isPaymentEncryptionConfigured } from '../../../admin/payment-encryption.js';
import { db } from '../../../db/client.js';
import { franchiseSettings } from '../../../db/schema.js';

export interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  instructions: string;
}

export const EMPTY_PAYMENT_DETAILS: PaymentDetails = {
  bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '', upiId: '', instructions: '',
};

export default async function handler(req: Request, res: Response) {
  const ctx = await requirePermission(req, res, 'bank.view');
  if (!ctx) return;
  let settings: typeof franchiseSettings.$inferSelect | undefined;
  try {
    [settings] = await db.select().from(franchiseSettings).where(eq(franchiseSettings.id, 1)).limit(1);
  } catch (error) {
    console.error('admin.payment-settings.read.failed', error);
    return res.status(503).json({ error: 'Unable to load company payment settings' });
  }
  let details = EMPTY_PAYMENT_DETAILS;
  if (settings?.paymentDetailsCiphertext) {
    try {
      details = decryptPaymentDetails<PaymentDetails>(settings.paymentDetailsCiphertext);
    } catch (error) {
      console.error('admin.payment-settings.decrypt.failed', error);
      return res.status(503).json({ error: 'Cannot decrypt stored payment settings; verify BANK_DETAILS_ENCRYPTION_KEY and encrypted data integrity' });
    }
  }
  return res.set('Cache-Control', 'no-store').json({
    details,
    published: Boolean(settings?.paymentDetailsPublished),
    encryptionConfigured: isPaymentEncryptionConfigured(),
  });
}
