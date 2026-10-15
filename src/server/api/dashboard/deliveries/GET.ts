import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { deliveries, franchiseeProfiles, orderItems, orders, products, warehouses } from '../../../db/schema.js';
import { eq, desc, inArray } from 'drizzle-orm';
import { getAuth } from '../../../../lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const [profile] = await db.select({ id: franchiseeProfiles.id }).from(franchiseeProfiles)
      .where(eq(franchiseeProfiles.userId, session.user.id)).limit(1);
    if (!profile) return res.json({ orders: [], deliveries: [], products: [] });

    const [orderRows, catalog] = await Promise.all([
      db.select().from(orders)
        .where(eq(orders.franchiseeId, profile.id))
        .orderBy(desc(orders.createdAt))
        .limit(100),
      db.select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        unit: products.unit,
        rate: products.salePrice,
      }).from(products).orderBy(products.name).limit(500),
    ]);
    if (orderRows.length === 0) return res.json({ orders: [], deliveries: [], products: catalog });

    const orderIds = orderRows.map((o) => o.id);

    const items = await db.select({
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
      rate: orderItems.rate,
      sku: products.sku,
      productName: products.name,
      unit: products.unit,
    })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(inArray(orderItems.orderId, orderIds));

    const deliveryRows = await db.select({
      id: deliveries.id,
      deliveryId: deliveries.deliveryId,
      orderId: deliveries.orderId,
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
    })
      .from(deliveries)
      .leftJoin(warehouses, eq(warehouses.id, deliveries.warehouseId))
      .where(inArray(deliveries.orderId, orderIds))
      .orderBy(desc(deliveries.createdAt));

    const ordersOut = orderRows.map((o) => ({
      id: o.id,
      orderId: o.orderId,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
      items: items.filter((i) => i.orderId === o.id).map((i) => ({
        sku: i.sku,
        productName: i.productName,
        unit: i.unit,
        quantity: i.quantity,
        rate: Number(i.rate),
      })),
    }));

    return res.set('Cache-Control', 'no-store').json({ orders: ordersOut, deliveries: deliveryRows, products: catalog });
  } catch (error) {
    console.error('dashboard.deliveries.failed', error);
    return res.status(500).json({ error: 'Failed to load deliveries' });
  }
}
