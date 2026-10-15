import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { auditLogs, franchiseeProfiles, notifications, orderItems, orders, products } from '../../../db/schema.js';
import { getAuth } from '../../../../lib/auth/auth.js';

interface OrderLineInput {
  productId: number;
  quantity: number;
}

function priceInCents(value: string): bigint | null {
  const match = /^(\d{1,10})(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;
  return BigInt(match[1]) * 100n + BigInt((match[2] ?? '').padEnd(2, '0') || '0');
}

function decimalFromCents(value: bigint): string {
  return `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({
      // This cast matches the existing Express-to-Better-Auth request integration.
      // eslint-disable-next-line no-undef
      headers: req.headers as unknown as Headers,
    });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const rawItems: unknown = req.body?.items;
    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
      return res.status(400).json({ error: 'Add between 1 and 50 order items' });
    }
    const items: OrderLineInput[] = [];
    const productIds = new Set<number>();
    for (const rawItem of rawItems as unknown[]) {
      if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
        return res.status(400).json({ error: 'Order items must have unique products and valid positive quantities' });
      }
      const item = rawItem as Record<string, unknown>;
      const productId = item.productId;
      const quantity = item.quantity;
      if (typeof productId !== 'number' || !Number.isSafeInteger(productId) || productId <= 0
        || typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 1_000_000
        || productIds.has(productId)) {
        return res.status(400).json({ error: 'Order items must have unique products and valid positive quantities' });
      }
      productIds.add(productId);
      items.push({ productId, quantity });
    }

    const [profile] = await db.select({ id: franchiseeProfiles.id })
      .from(franchiseeProfiles).where(eq(franchiseeProfiles.userId, session.user.id)).limit(1);
    if (!profile) return res.status(403).json({ error: 'A franchise profile is required to submit an order request' });

    const result = await db.transaction(async (tx) => {
      const catalog = await tx.select({ id: products.id, name: products.name, salePrice: products.salePrice })
        .from(products).where(inArray(products.id, [...productIds])).orderBy(products.id).for('update');
      if (catalog.length !== productIds.size) return { error: 'product_not_found' as const };

      const catalogById = new Map(catalog.map((product) => [product.id, product]));
      const lines = items.map((item) => {
        const product = catalogById.get(item.productId);
        if (!product) return null;
        const rateCents = priceInCents(String(product.salePrice));
        return rateCents === null ? null : {
          productId: product.id,
          quantity: item.quantity,
          rate: String(product.salePrice),
          lineCents: rateCents * BigInt(item.quantity),
        };
      });
      if (lines.some((line) => line === null)) return { error: 'invalid_catalog_price' as const };
      const validLines = lines.filter((line) => line !== null);
      const totalCents = validLines.reduce((sum, line) => sum + line.lineCents, 0n);
      if (totalCents > 99_999_999_999_999n) return { error: 'order_total_limit' as const };

      const orderId = `ORD-${randomBytes(8).toString('hex').toUpperCase()}`;
      const inserted = await tx.insert(orders).values({
        orderId,
        franchiseeId: profile.id,
        status: 'order_received',
        totalAmount: decimalFromCents(totalCents),
      });
      const internalOrderId = inserted[0].insertId;
      await tx.insert(orderItems).values(validLines.map((line) => ({
        orderId: internalOrderId,
        productId: line.productId,
        quantity: line.quantity,
        rate: line.rate,
      })));
      await tx.insert(notifications).values({
        userId: session.user.id,
        title: 'Order request received',
        message: `Order ${orderId} has been submitted for review. Product availability and fulfillment will be confirmed separately.`,
        type: 'info',
        link: '/dashboard/delivery',
      });
      await tx.insert(auditLogs).values({
        actorId: session.user.id,
        actorName: session.user.name,
        action: 'order.request',
        entityType: 'order',
        entityId: orderId,
        details: JSON.stringify({
          itemCount: validLines.length,
          totalAmount: decimalFromCents(totalCents),
        }),
      });
      return { orderId, totalAmount: decimalFromCents(totalCents) };
    });

    if ('error' in result) {
      if (result.error === 'product_not_found') return res.status(400).json({ error: 'One or more products are unavailable' });
      if (result.error === 'invalid_catalog_price') return res.status(409).json({ error: 'A product price is not configured for orders' });
      return res.status(400).json({ error: 'Order total exceeds the supported limit' });
    }
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('dashboard.orders.create.failed', error);
    return res.status(500).json({ error: 'Failed to submit order request' });
  }
}
