import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { franchiseeProfiles, franchiseProgress, notifications } from '../../../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { requirePermission, writeAudit } from '../../../admin/rbac.js';

const STATUSES = ['pending', 'in_progress', 'completed', 'rejected'];

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await requirePermission(req, res, 'progress.update');
    if (!ctx) return;

    const { franchiseeId, stage, stageName, status, remarks, progressPercent } = req.body ?? {};
    const stageNum = Number(stage);
    const progressValue = Number(progressPercent);
    if (!Number.isInteger(franchiseeId) || !Number.isInteger(stageNum) || stageNum < 0 || stageNum >= 13
      || typeof stageName !== 'string' || !stageName.trim() || typeof status !== 'string' || !STATUSES.includes(status)
      || !Number.isInteger(progressValue) || progressValue < 0 || progressValue > 100
      || (remarks !== undefined && typeof remarks !== 'string')) {
      return res.status(400).json({ error: 'franchiseeId, stage (0-12), stageName, progressPercent (0-100) and a valid status are required' });
    }
    const cleanRemarks = typeof remarks === 'string' ? remarks.slice(0, 2000) : null;
    const cleanStageName = stageName.trim().slice(0, 100);
    const percent = progressValue;

    const [profile] = await db.select({ id: franchiseeProfiles.id, userId: franchiseeProfiles.userId })
      .from(franchiseeProfiles).where(eq(franchiseeProfiles.id, franchiseeId)).limit(1);
    if (!profile) return res.status(404).json({ error: 'Franchisee not found' });

    const completedAt = status === 'completed' ? new Date() : null;
    const [existing] = await db.select({ id: franchiseProgress.id }).from(franchiseProgress)
      .where(and(eq(franchiseProgress.franchiseeId, franchiseeId), eq(franchiseProgress.stage, stageNum))).limit(1);

    if (existing) {
      await db.update(franchiseProgress)
        .set({ status, stageName: cleanStageName, remarks: cleanRemarks, completedAt, updatedBy: ctx.name || ctx.userId })
        .where(eq(franchiseProgress.id, existing.id));
    } else {
      await db.insert(franchiseProgress).values({
        franchiseeId, stage: stageNum, stageName: cleanStageName, status,
        remarks: cleanRemarks, completedAt, updatedBy: ctx.name || ctx.userId,
      });
    }

    await db.update(franchiseeProfiles)
      .set({ progressStage: stageNum, progressPercent: percent })
      .where(eq(franchiseeProfiles.id, franchiseeId));

    await db.insert(notifications).values({
      userId: profile.userId,
      title: 'Progress update',
      message: `${cleanStageName}: ${status.replace('_', ' ')}${cleanRemarks ? ` - ${cleanRemarks}` : ''}`,
      type: status === 'completed' ? 'success' : status === 'rejected' ? 'alert' : 'info',
      link: '/dashboard/progress',
    });

    await writeAudit(ctx, 'progress.update', 'franchisee', franchiseeId, { stage: stageNum, status, progressPercent: percent });
    return res.json({ success: true });
  } catch (error) {
    console.error('admin.progress.update.failed', error);
    return res.status(500).json({ error: 'Failed to update progress' });
  }
}
