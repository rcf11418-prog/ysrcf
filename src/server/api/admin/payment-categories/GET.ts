import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';
import { DEFAULT_INVESTMENT_CATEGORIES, parseStringList } from '../../../admin/franchise-settings.js';
import { db } from '../../../db/client.js';
import { franchiseSettings } from '../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'payments.view');
    if (!ctx) return;
    const [settings] = await db.select({ investmentCategories: franchiseSettings.investmentCategories })
      .from(franchiseSettings).where(eq(franchiseSettings.id, 1)).limit(1);
    return res.set('Cache-Control', 'no-store').json({
      categories: settings
        ? parseStringList(settings.investmentCategories, DEFAULT_INVESTMENT_CATEGORIES)
        : DEFAULT_INVESTMENT_CATEGORIES,
    });
  } catch (error) {
    console.error('admin.payment-categories.read.failed', error);
    return res.status(500).json({ error: 'Unable to load configured payment categories' });
  }
}
