import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseeProfiles, franchiseeStock, products, stockMovements } from '../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { getAuth } from '../../../../lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const [profile] = await db.select({ id: franchiseeProfiles.id }).from(franchiseeProfiles)
      .where(eq(franchiseeProfiles.userId, session.user.id)).limit(1);
    if (!profile) return res.json({ items: [], movements: [], summary: emptySummary() });

    const holdings = await db.select({
      id: franchiseeStock.id,
      productId: products.id,
      sku: products.sku,
      name: products.name,
      category: products.category,
      unit: products.unit,
      batchNumber: franchiseeStock.batchNumber,
      quantity: franchiseeStock.quantity,
      reserved: franchiseeStock.reserved,
      salePrice: products.salePrice,
      minStockLevel: products.minStockLevel,
      expiryDate: franchiseeStock.expiryDate,
    })
      .from(franchiseeStock)
      .innerJoin(products, eq(products.id, franchiseeStock.productId))
      .where(eq(franchiseeStock.franchiseeId, profile.id));

    const movements = await db.select({
      id: stockMovements.id,
      createdAt: stockMovements.createdAt,
      sku: products.sku,
      productName: products.name,
      batchNumber: stockMovements.batchNumber,
      movementType: stockMovements.movementType,
      quantity: stockMovements.quantity,
      referenceNumber: stockMovements.referenceNumber,
      remarks: stockMovements.remarks,
    })
      .from(stockMovements)
      .innerJoin(products, eq(products.id, stockMovements.productId))
      .where(eq(stockMovements.franchiseeId, profile.id))
      .orderBy(desc(stockMovements.createdAt))
      .limit(100);

    const items = holdings.map((h) => {
      const qty = h.quantity;
      const value = qty * Number(h.salePrice);
      return {
        ...h,
        available: Math.max(0, qty - h.reserved),
        stockValue: Number(value.toFixed(2)),
        isLow: qty > 0 && qty <= h.minStockLevel,
        isOut: qty === 0,
      };
    });

    const summary = {
      totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
      availableQuantity: items.reduce((s, i) => s + i.available, 0),
      reservedQuantity: items.reduce((s, i) => s + i.reserved, 0),
      stockValue: Number(items.reduce((s, i) => s + i.stockValue, 0).toFixed(2)),
      lowStock: items.filter((i) => i.isLow).length,
      outOfStock: items.filter((i) => i.isOut).length,
    };

    return res.json({ items, movements, summary });
  } catch (error) {
    console.error('dashboard.stock.failed', error);
    return res.status(500).json({ error: 'Failed to load stock' });
  }
}

function emptySummary() {
  return { totalQuantity: 0, availableQuantity: 0, reservedQuantity: 0, stockValue: 0, lowStock: 0, outOfStock: 0 };
}
