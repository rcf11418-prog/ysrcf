import type { Request, Response } from 'express';
import { resolveStaff } from '../../../admin/rbac.js';

export default async function handler(req: Request, res: Response) {
  try {
    const ctx = await resolveStaff(req, res);
    if (!ctx) return;
    return res.json({ name: ctx.name, role: ctx.role, permissions: ctx.permissions });
  } catch (error) {
    console.error('admin.me.failed', error);
    return res.status(500).json({ error: 'Failed to load staff profile' });
  }
}
