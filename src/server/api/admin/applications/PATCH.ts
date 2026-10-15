import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseApplications } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requirePermission, writeAudit } from '../../../admin/rbac.js';

const REVIEW_STATUSES = [
  'submitted', 'under_review', 'documents_required', 'approved',
  'rejected', 'agreement_pending', 'payment_pending', 'franchise_active', 'on_hold',
];

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'applications.review');
    if (!ctx) return;

    const { applicationId, status, remarks } = req.body ?? {};
    if (typeof applicationId !== 'string' || !REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'applicationId and a valid status are required' });
    }
    const cleanRemarks = typeof remarks === 'string' ? remarks.slice(0, 2000) : null;

    const result = await db.update(franchiseApplications)
      .set({ status, remarks: cleanRemarks, reviewedBy: ctx.name || ctx.userId, reviewedAt: new Date() })
      .where(eq(franchiseApplications.applicationId, applicationId));
    if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Application not found' });

    await writeAudit(ctx, 'application.review', 'application', applicationId, { status });
    return res.json({ success: true });
  } catch (error) {
    console.error('admin.applications.review.failed', error);
    return res.status(500).json({ error: 'Failed to update application' });
  }
}
