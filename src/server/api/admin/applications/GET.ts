import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseApplications } from '../../../db/schema.js';
import { desc } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'applications.view');
    if (!ctx) return;

    const rows = await db.select({
      applicationId: franchiseApplications.applicationId,
      fullName: franchiseApplications.fullName,
      mobile: franchiseApplications.mobile,
      email: franchiseApplications.email,
      city: franchiseApplications.city,
      state: franchiseApplications.state,
      franchiseType: franchiseApplications.franchiseType,
      preferredLocation: franchiseApplications.preferredLocation,
      investmentCapacity: franchiseApplications.investmentCapacity,
      status: franchiseApplications.status,
      remarks: franchiseApplications.remarks,
      reviewedBy: franchiseApplications.reviewedBy,
      reviewedAt: franchiseApplications.reviewedAt,
      createdAt: franchiseApplications.createdAt,
    })
      .from(franchiseApplications)
      .orderBy(desc(franchiseApplications.createdAt))
      .limit(200);

    return res.json(rows);
  } catch (error) {
    console.error('admin.applications.list.failed', error);
    return res.status(500).json({ error: 'Failed to load applications' });
  }
}
