import { URL } from 'node:url';
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { parseOptionalDate } from '../../../admin/validation.js';
import { db } from '../../../db/client.js';
import { auditLogs, deliveries, franchiseeProfiles, notifications, orders, warehouses } from '../../../db/schema.js';
import { requirePermission } from '../../../admin/rbac.js';

const DELIVERY_STATUSES = [
  'order_received', 'processing', 'packed', 'dispatched', 'in_transit', 'out_for_delivery',
  'delivered', 'partially_delivered', 'returned',
] as const;
type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
const NEXT_STATUSES: Record<DeliveryStatus, DeliveryStatus[]> = {
  order_received: ['processing', 'packed', 'returned'],
  processing: ['packed', 'returned'],
  packed: ['dispatched', 'returned'],
  dispatched: ['in_transit', 'out_for_delivery', 'delivered', 'partially_delivered', 'returned'],
  in_transit: ['out_for_delivery', 'delivered', 'partially_delivered', 'returned'],
  out_for_delivery: ['delivered', 'partially_delivered', 'returned'],
  delivered: [],
  partially_delivered: ['delivered', 'returned'],
  returned: [],
};

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'deliveries.manage');
    if (!ctx) return;

    const { deliveryId, status, warehouseId, transporter, vehicleNumber, driverName, trackingNumber, expectedDeliveryDate, proofOfDeliveryUrl } = req.body ?? {};
    if (typeof deliveryId !== 'string' || !deliveryId || deliveryId.length > 20
      || (status !== undefined && (typeof status !== 'string' || !DELIVERY_STATUSES.includes(status as DeliveryStatus)))
      || (warehouseId !== undefined && warehouseId !== null && warehouseId !== '' && (!Number.isSafeInteger(warehouseId) || warehouseId <= 0))
      || (transporter !== undefined && transporter !== null && typeof transporter !== 'string')
      || (vehicleNumber !== undefined && vehicleNumber !== null && typeof vehicleNumber !== 'string')
      || (driverName !== undefined && driverName !== null && typeof driverName !== 'string')
      || (trackingNumber !== undefined && trackingNumber !== null && typeof trackingNumber !== 'string')
      || (proofOfDeliveryUrl !== undefined && proofOfDeliveryUrl !== null && typeof proofOfDeliveryUrl !== 'string')) {
      return res.status(400).json({ error: 'Valid delivery ID and update fields are required' });
    }

    const expectedDate = parseOptionalDate(expectedDeliveryDate);
    if (expectedDeliveryDate !== undefined && expectedDate === undefined) {
      return res.status(400).json({ error: 'Expected delivery date is invalid' });
    }
    const proofUrl = proofOfDeliveryUrl === undefined ? undefined : proofOfDeliveryUrl || null;
    if (typeof proofUrl === 'string') {
      try {
        if (new URL(proofUrl).protocol !== 'https:') throw new Error('not https');
      } catch {
        return res.status(400).json({ error: 'Proof of delivery must be an HTTPS URL' });
      }
      if (proofUrl.length > 2000) return res.status(400).json({ error: 'Proof of delivery URL is too long' });
    }
    for (const [value, max, label] of [
      [transporter, 150, 'Transporter'],
      [vehicleNumber, 30, 'Vehicle number'],
      [driverName, 100, 'Driver name'],
      [trackingNumber, 60, 'Tracking number'],
    ] as const) {
      if (typeof value === 'string' && value.length > max) {
        return res.status(400).json({ error: `${label} must be ${max} characters or fewer` });
      }
    }

    const result = await db.transaction(async (tx) => {
      const [row] = await tx.select({
        id: deliveries.id,
        status: deliveries.status,
        orderId: deliveries.orderId,
        deliveryId: deliveries.deliveryId,
        userId: franchiseeProfiles.userId,
      }).from(deliveries)
        .innerJoin(orders, eq(orders.id, deliveries.orderId))
        .innerJoin(franchiseeProfiles, eq(franchiseeProfiles.id, orders.franchiseeId))
        .where(eq(deliveries.deliveryId, deliveryId))
        .limit(1)
        .for('update');
      if (!row) return { error: 'not_found' as const };

      const normalizedWarehouseId = warehouseId === undefined ? undefined
        : Number.isSafeInteger(warehouseId) && warehouseId > 0 ? warehouseId : null;
      if (normalizedWarehouseId !== undefined && normalizedWarehouseId !== null) {
        const [warehouse] = await tx.select({ id: warehouses.id }).from(warehouses)
          .where(eq(warehouses.id, normalizedWarehouseId)).limit(1);
        if (!warehouse) return { error: 'warehouse_not_found' as const };
      }

      const currentStatus = row.status as DeliveryStatus;
      if (status && status !== currentStatus && !NEXT_STATUSES[currentStatus]?.includes(status as DeliveryStatus)) {
        return { error: 'invalid_transition' as const };
      }
      const nextStatus = (status ?? currentStatus) as DeliveryStatus;
      const changes: Partial<typeof deliveries.$inferInsert> = {};
      if (status !== undefined) changes.status = status;
      if (normalizedWarehouseId !== undefined) changes.warehouseId = normalizedWarehouseId;
      if (transporter !== undefined) changes.transporter = transporter?.trim() || null;
      if (vehicleNumber !== undefined) changes.vehicleNumber = vehicleNumber?.trim() || null;
      if (driverName !== undefined) changes.driverName = driverName?.trim() || null;
      if (trackingNumber !== undefined) changes.trackingNumber = trackingNumber?.trim() || null;
      if (expectedDate !== undefined) changes.expectedDeliveryDate = expectedDate;
      if (proofUrl !== undefined) changes.proofOfDeliveryUrl = proofUrl;
      if (status === 'dispatched' && currentStatus !== 'dispatched') changes.dispatchDate = new Date();
      if (status === 'delivered' && currentStatus !== 'delivered') changes.actualDeliveryDate = new Date();
      if (Object.keys(changes).length === 0) return { error: 'no_changes' as const };

      await tx.update(deliveries).set(changes).where(eq(deliveries.id, row.id));
      await tx.update(orders).set({ status: nextStatus }).where(eq(orders.id, row.orderId));
      if (status && status !== currentStatus) {
        await tx.insert(notifications).values({
          userId: row.userId,
          title: 'Delivery status updated',
          message: `Delivery ${row.deliveryId} status: ${status.replace(/_/g, ' ')}.`,
          type: status === 'delivered' ? 'success' : status === 'returned' ? 'alert' : 'info',
          link: '/dashboard/delivery',
        });
      }
      await tx.insert(auditLogs).values({
        actorId: ctx.userId,
        actorName: ctx.name,
        action: 'delivery.update',
        entityType: 'delivery',
        entityId: deliveryId,
        details: JSON.stringify({ previousStatus: currentStatus, status: nextStatus }),
      });
      return { success: true };
    });

    if ('error' in result) {
      if (result.error === 'not_found') return res.status(404).json({ error: 'Delivery not found' });
      if (result.error === 'warehouse_not_found') return res.status(404).json({ error: 'Warehouse not found' });
      if (result.error === 'invalid_transition') return res.status(409).json({ error: 'Delivery status transition is not allowed' });
      return res.status(400).json({ error: 'No delivery fields were supplied to update' });
    }
    return res.json(result);
  } catch (error) {
    console.error('admin.deliveries.update.failed', error);
    return res.status(500).json({ error: 'Failed to update delivery' });
  }
}
