import type { Request, Response } from 'express';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import {
  auditLogs, deliveries, franchiseApplications, franchiseeProfiles, franchiseeStock,
  orders, payments, products, stockMovements, user, warehouses,
} from '../../../db/schema.js';
import { hasPermission, requirePermission, writeAudit } from '../../../admin/rbac.js';

const REPORT_PERMISSIONS = {
  applications: 'applications.view',
  franchises: 'franchisees.view',
  payments: 'payments.view',
  inventory: 'inventory.view',
  movements: 'inventory.view',
  deliveries: 'deliveries.view',
  investment: 'franchisees.view',
  outstanding: 'payments.view',
  statewise: 'franchisees.view',
  'staff-activity': 'audit.view',
} as const;

type ReportName = keyof typeof REPORT_PERMISSIONS;
type Cell = string | number | null;

function csvCell(value: Cell): string {
  let text = String(value ?? '');
  if (/^[\t\r ]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function sendCsv(res: Response, name: ReportName, headers: string[], rows: Cell[][]) {
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  return res.status(200)
    .set('Cache-Control', 'no-store')
    .set('Content-Disposition', `attachment; filename="rcf-${name}-report.csv"`)
    .type('text/csv; charset=utf-8')
    .send(`\uFEFF${csv}`);
}

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'reports.export');
    if (!ctx) return;
    const report = req.query.report;
    if (typeof report !== 'string' || !Object.hasOwn(REPORT_PERMISSIONS, report)) {
      return res.status(400).json({ error: 'Choose a supported report type' });
    }
    const name = report as ReportName;
    if (!hasPermission(ctx, REPORT_PERMISSIONS[name])) {
      return res.status(403).json({ error: 'Your role cannot export this report' });
    }

    if (name === 'applications') {
      const rows = await db.select({
        applicationId: franchiseApplications.applicationId,
        fullName: franchiseApplications.fullName,
        status: franchiseApplications.status,
        franchiseType: franchiseApplications.franchiseType,
        preferredLocation: franchiseApplications.preferredLocation,
        district: franchiseApplications.district,
        state: franchiseApplications.state,
        createdAt: franchiseApplications.createdAt,
      }).from(franchiseApplications).orderBy(desc(franchiseApplications.createdAt)).limit(5000);
      await writeAudit(ctx, 'report.export', 'report', name);
      return sendCsv(res, name,
        ['Application ID', 'Applicant', 'Status', 'Franchise type', 'Preferred location', 'District', 'State', 'Submitted'],
        rows.map((row) => [row.applicationId, row.fullName, row.status, row.franchiseType, row.preferredLocation, row.district, row.state, row.createdAt?.toISOString() ?? '']),
      );
    }

    if (name === 'franchises') {
      const rows = await db.select({
        code: franchiseeProfiles.franchiseCode,
        name: user.name,
        city: franchiseeProfiles.city,
        state: franchiseeProfiles.state,
        status: franchiseeProfiles.status,
        totalInvestment: franchiseeProfiles.totalInvestment,
        paidAmount: franchiseeProfiles.paidAmount,
        pendingAmount: franchiseeProfiles.pendingAmount,
        progressPercent: franchiseeProfiles.progressPercent,
      }).from(franchiseeProfiles)
        .innerJoin(user, eq(user.id, franchiseeProfiles.userId))
        .orderBy(asc(user.name)).limit(5000);
      await writeAudit(ctx, 'report.export', 'report', name);
      return sendCsv(res, name,
        ['Franchise code', 'Franchisee', 'City', 'State', 'Status', 'Total investment', 'Paid', 'Pending', 'Progress percent'],
        rows.map((row) => [row.code, row.name, row.city, row.state, row.status, row.totalInvestment, row.paidAmount, row.pendingAmount, row.progressPercent]),
      );
    }

    if (name === 'payments') {
      const rows = await db.select({
        transactionId: payments.transactionId,
        franchiseCode: franchiseeProfiles.franchiseCode,
        franchiseeName: user.name,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMode: payments.paymentMode,
        referenceNumber: payments.referenceNumber,
        status: payments.status,
      }).from(payments)
        .innerJoin(franchiseeProfiles, eq(franchiseeProfiles.id, payments.franchiseeId))
        .innerJoin(user, eq(user.id, franchiseeProfiles.userId))
        .orderBy(desc(payments.paymentDate)).limit(5000);
      await writeAudit(ctx, 'report.export', 'report', name);
      return sendCsv(res, name,
        ['Transaction ID', 'Franchise code', 'Franchisee', 'Amount', 'Date', 'Mode', 'Reference', 'Status'],
        rows.map((row) => [row.transactionId, row.franchiseCode, row.franchiseeName, row.amount, row.paymentDate?.toISOString() ?? '', row.paymentMode, row.referenceNumber, row.status]),
      );
    }

    if (name === 'deliveries') {
      const rows = await db.select({
        deliveryId: deliveries.deliveryId,
        orderNumber: orders.orderId,
        franchiseCode: franchiseeProfiles.franchiseCode,
        franchiseeName: user.name,
        warehouse: warehouses.name,
        transporter: deliveries.transporter,
        vehicleNumber: deliveries.vehicleNumber,
        trackingNumber: deliveries.trackingNumber,
        status: deliveries.status,
        dispatchDate: deliveries.dispatchDate,
        expectedDate: deliveries.expectedDeliveryDate,
        actualDate: deliveries.actualDeliveryDate,
      }).from(deliveries)
        .innerJoin(orders, eq(orders.id, deliveries.orderId))
        .innerJoin(franchiseeProfiles, eq(franchiseeProfiles.id, orders.franchiseeId))
        .innerJoin(user, eq(user.id, franchiseeProfiles.userId))
        .leftJoin(warehouses, eq(warehouses.id, deliveries.warehouseId))
        .orderBy(desc(deliveries.createdAt)).limit(5000);
      await writeAudit(ctx, 'report.export', 'report', name);
      return sendCsv(res, name,
        ['Delivery ID', 'Order ID', 'Franchise code', 'Franchisee', 'Warehouse', 'Transporter', 'Vehicle', 'Tracking number', 'Status', 'Dispatch date', 'Expected date', 'Delivered date'],
        rows.map((row) => [row.deliveryId, row.orderNumber, row.franchiseCode, row.franchiseeName, row.warehouse, row.transporter, row.vehicleNumber, row.trackingNumber, row.status, row.dispatchDate?.toISOString() ?? '', row.expectedDate?.toISOString() ?? '', row.actualDate?.toISOString() ?? '']),
      );
    }

    if (name === 'movements') {
      const rows = await db.select({
        createdAt: stockMovements.createdAt,
        sku: products.sku,
        productName: products.name,
        batchNumber: stockMovements.batchNumber,
        movementType: stockMovements.movementType,
        quantity: stockMovements.quantity,
        franchiseCode: franchiseeProfiles.franchiseCode,
        warehouse: warehouses.name,
        referenceNumber: stockMovements.referenceNumber,
        performedBy: stockMovements.performedBy,
      }).from(stockMovements)
        .innerJoin(products, eq(products.id, stockMovements.productId))
        .leftJoin(franchiseeProfiles, eq(franchiseeProfiles.id, stockMovements.franchiseeId))
        .leftJoin(warehouses, eq(warehouses.id, stockMovements.warehouseId))
        .orderBy(desc(stockMovements.createdAt)).limit(5000);
      await writeAudit(ctx, 'report.export', 'report', name);
      return sendCsv(res, name,
        ['Date', 'SKU', 'Product', 'Batch', 'Movement', 'Quantity', 'Franchise code', 'Warehouse', 'Reference', 'Performed by'],
        rows.map((row) => [row.createdAt.toISOString(), row.sku, row.productName, row.batchNumber, row.movementType, row.quantity, row.franchiseCode, row.warehouse, row.referenceNumber, row.performedBy]),
      );
    }

    if (name === 'investment' || name === 'outstanding') {
      const rows = await db.select({
        franchiseCode: franchiseeProfiles.franchiseCode,
        franchiseeName: user.name,
        city: franchiseeProfiles.city,
        state: franchiseeProfiles.state,
        totalInvestment: franchiseeProfiles.totalInvestment,
        paidAmount: franchiseeProfiles.paidAmount,
        pendingAmount: franchiseeProfiles.pendingAmount,
      }).from(franchiseeProfiles)
        .innerJoin(user, eq(user.id, franchiseeProfiles.userId))
        .orderBy(asc(user.name)).limit(5000);
      await writeAudit(ctx, 'report.export', 'report', name);
      return sendCsv(res, name,
        ['Franchise code', 'Franchisee', 'City', 'State', 'Total investment', 'Paid amount', 'Outstanding amount'],
        rows.map((row) => [row.franchiseCode, row.franchiseeName, row.city, row.state, row.totalInvestment, row.paidAmount, row.pendingAmount]),
      );
    }

    if (name === 'statewise') {
      const rows = await db.select({
        state: franchiseeProfiles.state,
        franchises: sql<number>`COUNT(*)`,
        activeFranchises: sql<number>`SUM(CASE WHEN ${franchiseeProfiles.status} = 'active' THEN 1 ELSE 0 END)`,
      }).from(franchiseeProfiles)
        .groupBy(franchiseeProfiles.state)
        .orderBy(asc(franchiseeProfiles.state)).limit(5000);
      await writeAudit(ctx, 'report.export', 'report', name);
      return sendCsv(res, name,
        ['State', 'Franchises', 'Active franchises'],
        rows.map((row) => [row.state, Number(row.franchises), Number(row.activeFranchises)]),
      );
    }

    if (name === 'staff-activity') {
      const rows = await db.select({
        createdAt: auditLogs.createdAt,
        actorName: auditLogs.actorName,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
      }).from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(5000);
      await writeAudit(ctx, 'report.export', 'report', name);
      return sendCsv(res, name,
        ['Date', 'Staff member', 'Action', 'Module', 'Record', 'Details'],
        rows.map((row) => [row.createdAt.toISOString(), row.actorName, row.action, row.entityType, row.entityId, row.details]),
      );
    }

    const [items, stock] = await Promise.all([
      db.select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        category: products.category,
        unit: products.unit,
        salePrice: products.salePrice,
        gstRate: products.gstRate,
      }).from(products).orderBy(asc(products.name)).limit(5000),
      db.select({
        productId: franchiseeStock.productId,
        quantity: sql<number>`COALESCE(SUM(${franchiseeStock.quantity}), 0)`,
        reserved: sql<number>`COALESCE(SUM(${franchiseeStock.reserved}), 0)`,
      }).from(franchiseeStock).groupBy(franchiseeStock.productId),
    ]);
    const stockByProduct = new Map(stock.map((row) => [row.productId, row]));
    await writeAudit(ctx, 'report.export', 'report', name);
    return sendCsv(res, name,
      ['SKU', 'Product', 'Category', 'Unit', 'Sale price', 'GST rate', 'Allocated quantity', 'Reserved quantity'],
      items.map((item) => {
        const totals = stockByProduct.get(item.id);
        return [item.sku, item.name, item.category, item.unit, item.salePrice, item.gstRate, Number(totals?.quantity ?? 0), Number(totals?.reserved ?? 0)];
      }),
    );
  } catch (error) {
    console.error('admin.reports.export.failed', error);
    return res.status(500).json({ error: 'Failed to export report' });
  }
}
