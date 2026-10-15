import type { Request, Response } from 'express';
import { requirePermission } from '../../../admin/rbac.js';
import { normalizeStringList } from '../../../admin/franchise-settings.js';
import { db } from '../../../db/client.js';
import { auditLogs, franchiseSettings } from '../../../db/schema.js';

const COMPANY_FIELDS = ['legalName', 'gstin', 'pan', 'registeredAddress', 'state', 'stateCode'] as const;
type CompanyField = (typeof COMPANY_FIELDS)[number];
type CompanyValues = Record<CompanyField, string | null>;

function optionalText(value: unknown, max: number): string | null | undefined {
  if (value === undefined) return null;
  if (typeof value !== 'string' || value.trim().length > max) return undefined;
  return value.trim() || null;
}

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'settings.edit');
    if (!ctx) return;
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Settings object is required' });
    }
    const franchiseTypes = normalizeStringList(body.franchiseTypes);
    const investmentCategories = normalizeStringList(body.investmentCategories);
    if (!franchiseTypes || !investmentCategories) {
      return res.status(400).json({ error: 'Add 1–30 unique franchise types and investment categories (100 characters maximum each)' });
    }
    const limits: Record<CompanyField, number> = {
      legalName: 255, gstin: 15, pan: 10, registeredAddress: 4000, state: 100, stateCode: 2,
    };
    const company = {} as CompanyValues;
    for (const field of COMPANY_FIELDS) {
      const value = optionalText(body.company?.[field], limits[field]);
      if (value === undefined) return res.status(400).json({ error: `Invalid company setting: ${field}` });
      company[field] = value;
    }
    if (company.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(company.gstin.toUpperCase())) {
      return res.status(400).json({ error: 'GSTIN format is invalid' });
    }
    if (company.pan && !/^[A-Z]{5}\d{4}[A-Z]$/.test(company.pan.toUpperCase())) {
      return res.status(400).json({ error: 'PAN format is invalid' });
    }
    if (company.stateCode && !/^\d{2}$/.test(company.stateCode)) {
      return res.status(400).json({ error: 'State code must be two digits' });
    }
    if (company.gstin) company.gstin = company.gstin.toUpperCase();
    if (company.pan) company.pan = company.pan.toUpperCase();

    const settingsValues = {
      id: 1,
      franchiseTypes: JSON.stringify(franchiseTypes),
      investmentCategories: JSON.stringify(investmentCategories),
      ...company,
      paymentDetailsCiphertext: null,
      paymentDetailsPublished: false,
      updatedBy: ctx.userId,
    };
    await db.transaction(async (tx) => {
      await tx.insert(franchiseSettings).values(settingsValues).onDuplicateKeyUpdate({
        set: {
          franchiseTypes: settingsValues.franchiseTypes,
          investmentCategories: settingsValues.investmentCategories,
          ...company,
          updatedBy: ctx.userId,
        },
      });
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: 'settings.franchise.update',
        entityType: 'settings',
        entityId: 'franchise',
        details: JSON.stringify({ franchiseTypes, investmentCategories, companyFieldsUpdated: COMPANY_FIELDS }),
      });
    });
    return res.json({ success: true });
  } catch (error) {
    console.error('admin.settings.update.failed', error);
    return res.status(500).json({ error: 'Failed to save franchise settings' });
  }
}
