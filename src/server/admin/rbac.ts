import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { auditLogs, staffMembers, user } from '../db/schema.js';
import { getAuth } from '../../lib/auth/auth.js';

// Super admins (user.isAdmin) hold every permission. Other staff get the
// permissions of their staff_members.role.
export const ROLE_PERMISSIONS = {
  operations: ['applications.view', 'applications.review', 'progress.update', 'franchisees.view', 'deliveries.view', 'deliveries.manage', 'inventory.view', 'inventory.manage', 'reports.export'],
  finance: ['applications.view', 'payments.view', 'payments.record', 'payments.verify', 'payments.refund', 'franchisees.view', 'reports.export'],
  support: ['franchisees.view', 'tickets.manage'],
  admin: ['applications.view', 'applications.review', 'progress.update', 'franchisees.view', 'deliveries.view', 'deliveries.manage', 'inventory.view', 'inventory.manage', 'payments.view', 'payments.record', 'tickets.manage', 'reports.export'],
  finance_manager: ['applications.view', 'payments.view', 'payments.record', 'payments.verify', 'payments.refund', 'franchisees.view', 'reports.export'],
  inventory_manager: ['inventory.view', 'inventory.manage', 'deliveries.view', 'franchisees.view', 'reports.export'],
  franchise_manager: ['applications.view', 'applications.review', 'progress.update', 'franchisees.view', 'reports.export'],
  sales_manager: ['applications.view', 'applications.review', 'franchisees.view', 'reports.export'],
  delivery_manager: ['deliveries.view', 'deliveries.manage', 'franchisees.view', 'reports.export'],
  support_staff: ['franchisees.view', 'tickets.manage'],
  accounts_staff: ['payments.view', 'payments.record', 'franchisees.view', 'reports.export'],
  viewer: ['applications.view', 'franchisees.view'],
} as const;

export const STAFF_ROLES = Object.keys(ROLE_PERMISSIONS) as Array<keyof typeof ROLE_PERMISSIONS>;
export const SUPER_ADMIN_PERMISSIONS = [
  'settings.view', 'settings.edit', 'bank.view', 'bank.edit',
] as const;

export interface StaffContext {
  userId: string;
  name: string;
  role: 'super_admin' | (typeof STAFF_ROLES)[number];
  permissions: string[];
}

export async function resolveStaff(req: Request, res: Response): Promise<StaffContext | null> {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
  if (!session?.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const [account] = await db.select({ isAdmin: user.isAdmin, name: user.name })
    .from(user).where(eq(user.id, session.user.id)).limit(1);
  if (account?.isAdmin) {
    return { userId: session.user.id, name: account.name, role: 'super_admin', permissions: ['*', ...SUPER_ADMIN_PERMISSIONS] };
  }

  const [member] = await db.select({ role: staffMembers.role }).from(staffMembers)
    .where(eq(staffMembers.userId, session.user.id)).limit(1);
  if (!member || !(member.role in ROLE_PERMISSIONS)) {
    res.status(403).json({ error: 'Staff access required' });
    return null;
  }
  const role = member.role as keyof typeof ROLE_PERMISSIONS;
  return { userId: session.user.id, name: account?.name ?? '', role, permissions: [...ROLE_PERMISSIONS[role]] };
}

export function hasPermission(ctx: StaffContext, permission: string): boolean {
  return ctx.permissions.includes('*') || ctx.permissions.includes(permission);
}

/** Resolves the caller and checks a permission. Sends 401/403 and returns null when denied. */
export async function requirePermission(req: Request, res: Response, permission: string): Promise<StaffContext | null> {
  const ctx = await resolveStaff(req, res);
  if (!ctx) return null;
  if (!hasPermission(ctx, permission)) {
    res.status(403).json({ error: 'Your role does not allow this action' });
    return null;
  }
  return ctx;
}

/** Writes an append-only audit row for an admin write action. */
export async function writeAudit(
  ctx: StaffContext,
  action: string,
  entityType: string,
  entityId: string | number | null,
  details?: Record<string, unknown>,
): Promise<void> {
  await db.insert(auditLogs).values({
    actorId: ctx.userId,
    actorName: ctx.name,
    action,
    entityType,
    entityId: entityId === null ? null : String(entityId),
    details: details ? JSON.stringify(details) : null,
  });
}
