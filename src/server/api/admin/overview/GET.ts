import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { deliveries, franchiseApplications, franchiseeProfiles, franchiseeStock, payments, products, supportTickets } from '../../../db/schema.js';
import { count, eq, inArray, sql } from 'drizzle-orm';
import { hasPermission, requirePermission } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'franchisees.view');
    if (!ctx) return;

    const [franchisees] = await db.select({ n: count() }).from(franchiseeProfiles);
    const [activeFranchisees] = await db.select({ n: count() }).from(franchiseeProfiles)
      .where(eq(franchiseeProfiles.status, 'active'));
    const [allApplications] = await db.select({ n: count() }).from(franchiseApplications);
    const [pendingApps] = await db.select({ n: count() }).from(franchiseApplications)
      .where(inArray(franchiseApplications.status, [
        'submitted', 'under_review', 'documents_required', 'agreement_pending', 'payment_pending', 'on_hold',
      ]));
    const [openTickets] = await db.select({ n: count() }).from(supportTickets)
      .where(inArray(supportTickets.status, ['open', 'in_progress']));
    const canViewPayments = hasPermission(ctx, 'payments.view');
    const canViewInventory = hasPermission(ctx, 'inventory.view');
    const canViewDeliveries = hasPermission(ctx, 'deliveries.view');
    const [paymentTotals] = canViewPayments
      ? await db.select({
        collected: sql<string>`COALESCE(SUM(CASE WHEN ${payments.status} = 'completed' THEN ${payments.amount} ELSE 0 END), 0)`,
        outstanding: sql<string>`COALESCE(SUM(CASE WHEN ${payments.status} = 'pending' THEN ${payments.amount} ELSE 0 END), 0)`,
        pendingCount: sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'pending' THEN 1 ELSE 0 END), 0)`,
      }).from(payments)
      : [null];
    const [investmentTotals] = canViewPayments
      ? await db.select({
        total: sql<string>`COALESCE(SUM(${franchiseeProfiles.totalInvestment}), 0)`,
        pending: sql<string>`COALESCE(SUM(${franchiseeProfiles.pendingAmount}), 0)`,
      }).from(franchiseeProfiles)
      : [null];
    const [stockTotals] = canViewInventory
      ? await db.select({
        quantity: sql<number>`COALESCE(SUM(${franchiseeStock.quantity}), 0)`,
        value: sql<string>`COALESCE(SUM(${franchiseeStock.quantity} * ${products.salePrice}), 0)`,
      }).from(franchiseeStock)
        .innerJoin(products, eq(products.id, franchiseeStock.productId))
      : [null];
    const lowStockRows = canViewInventory
      ? await db.select({
        quantity: sql<number>`COALESCE(SUM(${franchiseeStock.quantity}), 0)`,
        minimum: products.minStockLevel,
      }).from(products)
        .leftJoin(franchiseeStock, eq(franchiseeStock.productId, products.id))
        .groupBy(products.id, products.minStockLevel)
      : [];
    const [deliveryTotals] = canViewDeliveries
      ? await db.select({
        pending: sql<number>`COALESCE(SUM(CASE WHEN ${deliveries.status} NOT IN ('delivered', 'returned') THEN 1 ELSE 0 END), 0)`,
        completed: sql<number>`COALESCE(SUM(CASE WHEN ${deliveries.status} = 'delivered' THEN 1 ELSE 0 END), 0)`,
      }).from(deliveries)
      : [null];

    return res.json({
      franchisees: franchisees?.n ?? 0,
      activeFranchisees: activeFranchisees?.n ?? 0,
      totalApplications: allApplications?.n ?? 0,
      pendingApplications: pendingApps?.n ?? 0,
      openTickets: openTickets?.n ?? 0,
      ...(paymentTotals ? {
        totalCollected: Number(Number(paymentTotals.collected ?? 0).toFixed(2)),
        unverifiedAmount: Number(Number(paymentTotals.outstanding ?? 0).toFixed(2)),
        unverifiedPayments: Number(paymentTotals.pendingCount ?? 0),
        totalInvestment: Number(Number(investmentTotals?.total ?? 0).toFixed(2)),
        profileOutstanding: Number(Number(investmentTotals?.pending ?? 0).toFixed(2)),
      } : {}),
      ...(stockTotals ? {
        allocatedStockQuantity: Number(stockTotals.quantity ?? 0),
        allocatedStockValue: Number(Number(stockTotals.value ?? 0).toFixed(2)),
        lowStockProducts: lowStockRows.filter((row) => Number(row.quantity) > 0 && Number(row.quantity) <= Number(row.minimum)).length,
        outOfStockProducts: lowStockRows.filter((row) => Number(row.quantity) === 0).length,
      } : {}),
      ...(deliveryTotals ? {
        pendingDeliveries: Number(deliveryTotals.pending ?? 0),
        completedDeliveries: Number(deliveryTotals.completed ?? 0),
      } : {}),
    });
  } catch (error) {
    console.error('admin.overview.failed', error);
    return res.status(500).json({ error: 'Failed to load overview' });
  }
}
