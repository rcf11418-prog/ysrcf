import type { Request, Response } from 'express';
import { auditLogs, products } from '../../../db/schema.js';
import { db } from '../../../db/client.js';
import { requirePermission } from '../../../admin/rbac.js';

function decimalText(value: unknown, maxWholeDigits: number): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value).trim();
  if (!new RegExp(`^\\d{1,${maxWholeDigits}}(?:\\.\\d{1,2})?$`).test(text)) return null;
  return text;
}

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'inventory.manage');
    if (!ctx) return;

    const body = req.body ?? {};
    const sku = typeof body.sku === 'string' ? body.sku.trim().toUpperCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const unit = typeof body.unit === 'string' ? body.unit.trim() : '';
    const salePrice = decimalText(body.salePrice, 10);
    const gstRate = decimalText(body.gstRate, 3);
    const minStockLevel = body.minStockLevel;

    if (!/^[A-Z0-9][A-Z0-9._-]{0,63}$/.test(sku) || !name || name.length > 255
      || category.length > 100 || !unit || unit.length > 30 || !salePrice || !gstRate
      || Number(gstRate) > 100 || !Number.isSafeInteger(minStockLevel) || minStockLevel < 0
      || minStockLevel > 2147483647) {
      return res.status(400).json({ error: 'Provide a valid SKU, name, unit, non-negative price, GST rate (0-100) and stock threshold' });
    }

    const created = await db.transaction(async (tx) => {
      const result = await tx.insert(products).values({
        sku,
        name,
        category: category || null,
        unit,
        salePrice,
        gstRate,
        minStockLevel,
      });
      const id = Number(result[0].insertId);
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: 'product.create',
        entityType: 'product',
        entityId: String(id),
        details: JSON.stringify({ sku, name, salePrice, gstRate, minStockLevel }),
      });
      return { id };
    });

    return res.status(201).json({ success: true, ...created });
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
    if (code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A product with this SKU already exists' });
    console.error('admin.products.create.failed', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
}
