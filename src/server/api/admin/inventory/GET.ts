import type { Request, Response } from 'express';
import { asc, sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { franchiseeStock, products } from '../../../db/schema.js';
import { requirePermission } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'inventory.view');
    if (!ctx) return;

    const [items, stockTotals] = await Promise.all([
      db.select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        category: products.category,
        unit: products.unit,
        salePrice: products.salePrice,
        gstRate: products.gstRate,
        minStockLevel: products.minStockLevel,
      }).from(products).orderBy(asc(products.name)).limit(500),
      db.select({
        productId: franchiseeStock.productId,
        quantity: sql<number>`COALESCE(SUM(${franchiseeStock.quantity}), 0)`,
        reserved: sql<number>`COALESCE(SUM(${franchiseeStock.reserved}), 0)`,
      }).from(franchiseeStock).groupBy(franchiseeStock.productId),
    ]);
    const totals = new Map(stockTotals.map((row) => [row.productId, {
      quantity: Number(row.quantity),
      reserved: Number(row.reserved),
    }]));

    const inventory = items.map((item) => {
      const stock = totals.get(item.id) ?? { quantity: 0, reserved: 0 };
      return {
        ...item,
        quantity: stock.quantity,
        reserved: stock.reserved,
        available: Math.max(0, stock.quantity - stock.reserved),
        stockValue: Number((stock.quantity * Number(item.salePrice)).toFixed(2)),
        isLow: stock.quantity > 0 && stock.quantity <= item.minStockLevel,
        isOut: stock.quantity === 0,
      };
    });

    return res.set('Cache-Control', 'no-store').json(inventory);
  } catch (error) {
    console.error('admin.inventory.list.failed', error);
    return res.status(500).json({ error: 'Failed to load inventory' });
  }
}
