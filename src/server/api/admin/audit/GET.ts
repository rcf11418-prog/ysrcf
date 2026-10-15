import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { auditLogs } from '../../../db/schema.js';
import { desc } from 'drizzle-orm';
import { requirePermission } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    // Only super admins hold the wildcard permission, so this is super-admin only.
    const ctx = await requirePermission(req, res, 'audit.view');
    if (!ctx) return;

    const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200);
    return res.json(rows);
  } catch (error) {
    console.error('admin.audit.failed', error);
    return res.status(500).json({ error: 'Failed to load audit log' });
  }
}
