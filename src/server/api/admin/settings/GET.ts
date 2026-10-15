import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';
import { DEFAULT_FRANCHISE_TYPES, DEFAULT_INVESTMENT_CATEGORIES, parseStringList } from '../../../admin/franchise-settings.js';
import { db } from '../../../db/client.js';
import { franchiseSettings } from '../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'settings.view');
    if (!ctx) return;
    const [settings] = await db.select().from(franchiseSettings).where(eq(franchiseSettings.id, 1)).limit(1);
    return res.set('Cache-Control', 'no-store').json({
      franchiseTypes: settings ? parseStringList(settings.franchiseTypes, DEFAULT_FRANCHISE_TYPES) : DEFAULT_FRANCHISE_TYPES,
      investmentCategories: settings ? parseStringList(settings.investmentCategories, DEFAULT_INVESTMENT_CATEGORIES) : DEFAULT_INVESTMENT_CATEGORIES,
      company: {
        legalName: settings?.legalName ?? '',
        gstin: settings?.gstin ?? '',
        pan: settings?.pan ?? '',
        registeredAddress: settings?.registeredAddress ?? '',
        state: settings?.state ?? '',
        stateCode: settings?.stateCode ?? '',
      },
    });
  } catch (error) {
    console.error('admin.settings.read.failed', error);
    return res.status(500).json({ error: 'Failed to load franchise settings' });
  }
}
