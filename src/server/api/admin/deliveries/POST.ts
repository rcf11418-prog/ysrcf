import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { parseOptionalDate } from '../../../admin/validation.js';
import { db } from '../../../db/client.js';
import { auditLogs, deliveries, franchiseeProfiles, notifications, orders, warehouses } from '../../../db/schema.js';
import { requirePermission } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'deliveries.manage');
    if (!ctx) return;

    const { orderId, warehouseId, transporter, vehicleNumber, driverName, trackingNumber, expectedDeliveryDate } = req.body ?? {};
    const parsedExpectedDate = parseOptionalDate(expectedDeliveryDate);
    if (!Number.isSafeInteger(orderId) || orderId <= 0
      || (warehouseId !== undefined && warehouseId !== null && warehouseId !== '' && (!Number.isSafeInteger(warehouseId) || warehouseId <= 0))
      || (transporter !== undefined && typeof transporter !== 'string')
      || (vehicleNumber !== undefined && typeof vehicleNumber !== 'string')
      || (driverName !== undefined && typeof driverName !== 'string')
      || (trackingNumber !== undefined && typeof trackingNumber !== 'string')
      || (expectedDeliveryDate !== undefined && parsedExpectedDate === undefined)) {
      return res.status(400).json({ error: 'A valid order and delivery details are required' });
    }
    const expectedDate = parsedExpectedDate ?? null;

    for (const [value, max, label] of [
      [transporter, 150, 'Transporter'],
      [vehicleNumber, 30, 'Vehicle number'],
      [driverName, 100, 'Driver name'],
      [trackingNumber, 60, 'Tracking number'],
    ] as const) {
      if (value !== undefined && (value.length > max || !value.trim())) {
        return res.status(400).json({ error: `${label} must be non-empty and ${max} characters or fewer` });
      }
    }

    const result = await db.transaction(async (tx) => {
      const [order] = await tx.select({
        id: orders.id,
        orderNumber: orders.orderId,
        userId: franchiseeProfiles.userId,
      }).from(orders)
        .innerJoin(franchiseeProfiles, eq(franchiseeProfiles.id, orders.franchiseeId))
        .where(eq(orders.id, orderId))
        .limit(1)
        .for('update');
      if (!order) return { error: 'order_not_found' as const };

      const [existing] = await tx.select({ id: deliveries.id }).from(deliveries)
        .where(eq(deliveries.orderId, order.id)).limit(1);
      if (existing) return { error: 'delivery_exists' as const };

      const normalizedWarehouseId = Number.isSafeInteger(warehouseId) && warehouseId > 0 ? warehouseId : null;
      if (normalizedWarehouseId !== null) {
        const [warehouse] = await tx.select({ id: warehouses.id }).from(warehouses)
          .where(eq(warehouses.id, normalizedWarehouseId)).limit(1);
        if (!warehouse) return { error: 'warehouse_not_found' as const };
      }

      const deliveryId = `DLV-${randomBytes(7).toString('hex').toUpperCase()}`;
      await tx.insert(deliveries).values({
        deliveryId,
        orderId: order.id,
        warehouseId: normalizedWarehouseId,
        transporter: transporter?.trim() || null,
        vehicleNumber: vehicleNumber?.trim() || null,
        driverName: driverName?.trim() || null,
        trackingNumber: trackingNumber?.trim() || null,
        expectedDeliveryDate: expectedDate,
        status: 'processing',
      });
      await tx.update(orders).set({ status: 'processing' }).where(eq(orders.id, order.id));
      await tx.insert(notifications).values({
        userId: order.userId,
        title: 'Delivery processing',
        message: `Delivery ${deliveryId} for order ${order.orderNumber} is being processed.`,
        type: 'info',
        link: '/dashboard/delivery',
      });
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: 'delivery.create',
        entityType: 'delivery',
        entityId: deliveryId,
        details: JSON.stringify({ orderId: order.id, warehouseId: normalizedWarehouseId }),
      });
      return { deliveryId };
    });

    if ('error' in result) {
      if (result.error === 'order_not_found') return res.status(404).json({ error: 'Order not found' });
      if (result.error === 'warehouse_not_found') return res.status(404).json({ error: 'Warehouse not found' });
      return res.status(409).json({ error: 'A delivery already exists for this order' });
    }
    return res.status(201).json({ success: true, deliveryId: result.deliveryId });
  } catch (error) {
    console.error('admin.deliveries.create.failed', error);
    return res.status(500).json({ error: 'Failed to create delivery' });
  }
}
