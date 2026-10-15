import type { Request, Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { auditLogs, franchiseeProfiles, franchiseeStock, notifications, products, stockMovements } from '../../../db/schema.js';
import { requirePermission } from '../../../admin/rbac.js';

const MOVEMENT_TYPES = ['stock_in', 'stock_out', 'adjustment', 'damaged', 'returned'] as const;
type MovementType = (typeof MOVEMENT_TYPES)[number];

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'inventory.manage');
    if (!ctx) return;

    const { productId, franchiseeId, batchNumber, movementType, quantity, referenceNumber, remarks } = req.body ?? {};
    const batch = batchNumber === undefined ? '' : batchNumber;
    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(franchiseeId) || franchiseeId <= 0
      || typeof batch !== 'string' || batch.length > 64
      || typeof movementType !== 'string' || !MOVEMENT_TYPES.includes(movementType as MovementType)
      || !Number.isSafeInteger(quantity) || quantity < 0
      || (movementType === 'adjustment' ? quantity < 0 : quantity <= 0)
      || (referenceNumber !== undefined && typeof referenceNumber !== 'string')
      || (remarks !== undefined && typeof remarks !== 'string')) {
      return res.status(400).json({ error: 'Valid product, franchisee, movement type and quantity are required' });
    }
    if (referenceNumber && referenceNumber.length > 50) {
      return res.status(400).json({ error: 'Reference number must be 50 characters or fewer' });
    }

    const result = await db.transaction(async (tx) => {
      // Serializing movements on the product row prevents concurrent first-time
      // allocations from creating duplicate product/batch rows.
      const [product] = await tx.select({ id: products.id, name: products.name, sku: products.sku })
        .from(products).where(eq(products.id, productId)).limit(1).for('update');
      if (!product) return { error: 'product_not_found' as const };

      const [profile] = await tx.select({ id: franchiseeProfiles.id, userId: franchiseeProfiles.userId })
        .from(franchiseeProfiles).where(eq(franchiseeProfiles.id, franchiseeId)).limit(1);
      if (!profile) return { error: 'franchisee_not_found' as const };

      const [existing] = await tx.select({
        id: franchiseeStock.id,
        quantity: franchiseeStock.quantity,
        reserved: franchiseeStock.reserved,
      }).from(franchiseeStock).where(and(
        eq(franchiseeStock.franchiseeId, franchiseeId),
        eq(franchiseeStock.productId, productId),
        eq(franchiseeStock.batchNumber, batch),
      )).limit(1);

      const currentQuantity = existing?.quantity ?? 0;
      const reservedQuantity = existing?.reserved ?? 0;
      const targetQuantity = movementType === 'adjustment' ? quantity : currentQuantity +
        (movementType === 'stock_in' || movementType === 'returned' ? quantity : -quantity);
      const delta = targetQuantity - currentQuantity;
      if (delta === 0) return { error: 'no_change' as const };
      if (targetQuantity > 2147483647) return { error: 'quantity_limit' as const };
      if (targetQuantity < 0) return { error: 'insufficient_stock' as const };
      if (targetQuantity < reservedQuantity) return { error: 'below_reserved' as const };

      if (existing) {
        await tx.update(franchiseeStock).set({ quantity: targetQuantity })
          .where(eq(franchiseeStock.id, existing.id));
      } else {
        await tx.insert(franchiseeStock).values({
          franchiseeId,
          productId,
          batchNumber: batch,
          quantity: targetQuantity,
          reserved: 0,
        });
      }

      const movementId = await tx.insert(stockMovements).values({
        productId,
        franchiseeId,
        batchNumber: batch,
        movementType,
        quantity: delta,
        referenceNumber: referenceNumber ? referenceNumber.slice(0, 50) : null,
        remarks: remarks ? remarks.slice(0, 2000) : null,
        performedBy: ctx.name || ctx.userId,
      });
      await tx.insert(notifications).values({
        userId: profile.userId,
        title: 'Stock updated',
        message: `${product.name} (${product.sku}) stock has been updated.`,
        type: delta < 0 ? 'warning' : 'info',
        link: '/dashboard/stock',
      });
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: `inventory.${movementType}`,
        entityType: 'stock',
        entityId: String(movementId[0].insertId),
        details: JSON.stringify({
          franchiseeId,
          productId,
          batchNumber: batch,
          quantityDelta: delta,
          movementType,
          referenceNumber: referenceNumber ?? null,
        }),
      });
      return { movementType, quantity: delta, productName: product.name };
    });

    if ('error' in result) {
      if (result.error === 'product_not_found' || result.error === 'franchisee_not_found') {
        return res.status(404).json({ error: result.error === 'product_not_found' ? 'Product not found' : 'Franchisee not found' });
      }
      if (result.error === 'no_change') return res.status(400).json({ error: 'The adjustment does not change stock' });
      if (result.error === 'quantity_limit') return res.status(400).json({ error: 'Stock quantity exceeds the supported limit' });
      if (result.error === 'below_reserved') return res.status(409).json({ error: 'Stock cannot be adjusted below the reserved quantity' });
      return res.status(409).json({ error: 'Insufficient available stock for this movement' });
    }

    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('admin.inventory.update.failed', error);
    return res.status(500).json({ error: 'Failed to update inventory' });
  }
}
