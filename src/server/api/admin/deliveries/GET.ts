import type { Request, Response } from 'express';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { deliveries, franchiseeProfiles, orders, user, warehouses } from '../../../db/schema.js';
import { requirePermission } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'deliveries.view');
    if (!ctx) return;

    const [rows, warehouseRows, orderRows] = await Promise.all([
      db.select({
        id: deliveries.id,
        deliveryId: deliveries.deliveryId,
        orderId: deliveries.orderId,
        orderNumber: orders.orderId,
        franchiseeName: user.name,
        franchiseCode: franchiseeProfiles.franchiseCode,
        warehouseId: deliveries.warehouseId,
        warehouseName: warehouses.name,
        transporter: deliveries.transporter,
        vehicleNumber: deliveries.vehicleNumber,
        driverName: deliveries.driverName,
        trackingNumber: deliveries.trackingNumber,
        dispatchDate: deliveries.dispatchDate,
        expectedDeliveryDate: deliveries.expectedDeliveryDate,
        actualDeliveryDate: deliveries.actualDeliveryDate,
        status: deliveries.status,
        proofOfDeliveryUrl: deliveries.proofOfDeliveryUrl,
      }).from(deliveries)
        .innerJoin(orders, eq(orders.id, deliveries.orderId))
        .innerJoin(franchiseeProfiles, eq(franchiseeProfiles.id, orders.franchiseeId))
        .innerJoin(user, eq(user.id, franchiseeProfiles.userId))
        .leftJoin(warehouses, eq(warehouses.id, deliveries.warehouseId))
        .orderBy(desc(deliveries.createdAt))
        .limit(200),
      db.select({ id: warehouses.id, name: warehouses.name, code: warehouses.code })
        .from(warehouses).orderBy(warehouses.name).limit(200),
      db.select({
        id: orders.id,
        orderNumber: orders.orderId,
        status: orders.status,
        franchiseeId: franchiseeProfiles.id,
        franchiseeName: user.name,
      }).from(orders)
        .innerJoin(franchiseeProfiles, eq(franchiseeProfiles.id, orders.franchiseeId))
        .innerJoin(user, eq(user.id, franchiseeProfiles.userId))
        .orderBy(desc(orders.createdAt))
        .limit(200),
    ]);
    const activeOrderIds = new Set(rows.map((row) => row.orderId));

    return res.set('Cache-Control', 'no-store').json({
      deliveries: rows,
      warehouses: warehouseRows,
      availableOrders: orderRows.filter((order) => !activeOrderIds.has(order.id) && !['delivered', 'returned'].includes(order.status)),
    });
  } catch (error) {
    console.error('admin.deliveries.list.failed', error);
    return res.status(500).json({ error: 'Failed to load deliveries' });
  }
}
