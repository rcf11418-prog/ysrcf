import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { decryptPaymentDetails } from '../../admin/payment-encryption.js';
import { DEFAULT_FRANCHISE_TYPES, parseStringList } from '../../admin/franchise-settings.js';
import { db } from '../../db/client.js';
import { franchiseSettings } from '../../db/schema.js';

interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  instructions: string;
}

export default async function handler(_req: Request, res: Response) {
  try {
    const [settings] = await db.select().from(franchiseSettings).where(eq(franchiseSettings.id, 1)).limit(1);
    const response: Record<string, unknown> = {
      franchiseTypes: settings ? parseStringList(settings.franchiseTypes, DEFAULT_FRANCHISE_TYPES) : DEFAULT_FRANCHISE_TYPES,
      company: settings?.paymentDetailsPublished ? {
        legalName: settings.legalName,
        gstin: settings.gstin,
        registeredAddress: settings.registeredAddress,
        state: settings.state,
      } : null,
      paymentInstructionsPublished: Boolean(settings?.paymentDetailsPublished),
      paymentInstructions: null,
    };
    if (settings?.paymentDetailsPublished && settings.paymentDetailsCiphertext) {
      response.paymentInstructions = decryptPaymentDetails<PaymentDetails>(settings.paymentDetailsCiphertext);
    }
    return res.set('Cache-Control', 'no-store').json(response);
  } catch (error) {
    console.error('franchise.settings.public.failed', error);
    return res.status(503).json({ error: 'Public company settings are temporarily unavailable' });
  }
}
