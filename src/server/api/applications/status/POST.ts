import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { franchiseApplications } from '../../../db/schema.js';

const APPLICATION_ID_PATTERN = /^RCF-(?:[A-F0-9]{16}|\d{8}-[A-F0-9]{4})$/;

export default async function handler(req: Request, res: Response) {
  res.set('Cache-Control', 'no-store');
  try {
    const { applicationId } = req.body ?? {};
    if (typeof applicationId !== 'string' || !APPLICATION_ID_PATTERN.test(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    const [application] = await db.select({
      applicationId: franchiseApplications.applicationId,
      status: franchiseApplications.status,
      createdAt: franchiseApplications.createdAt,
    })
      .from(franchiseApplications)
      .where(eq(franchiseApplications.applicationId, applicationId))
      .limit(1);

    if (!application) return res.status(404).json({ error: 'Application not found' });
    return res.json(application);
  } catch (error) {
    console.error('applications.status.failed', error);
    return res.status(500).json({ error: 'Failed to fetch application status' });
  }
}
