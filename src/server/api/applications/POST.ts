import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { franchiseApplications, franchiseSettings } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';
import { randomBytes } from 'crypto';
import { DEFAULT_FRANCHISE_TYPES, parseStringList } from '../../admin/franchise-settings.js';

// Uploaded identity/financial documents are stored OUTSIDE any publicly served
// folder. They are never exposed via a URL; only the server can read them.
const PRIVATE_UPLOAD_DIR = path.resolve(
  process.env.APPLICATION_UPLOAD_DIR ?? 'private-uploads/applications',
);

const MAX_DOC_BYTES = 1.5 * 1024 * 1024; // per decoded document

// MIME type of a base64 data URL -> safe extension (never taken from user input)
const ALLOWED_MIME: Record<string, { ext: string; images: boolean }> = {
  'application/pdf': { ext: 'pdf', images: false },
  'image/jpeg': { ext: 'jpg', images: true },
  'image/png': { ext: 'png', images: true },
};

// Documents required by the application form (see requiredDocs in apply.json).
const REQUIRED_DOCS = ['panDocument', 'aadhaarDocument', 'addressProof', 'passportPhoto'];
const DOC_FIELDS = ['panDocument', 'aadhaarDocument', 'gstDocument', 'addressProof', 'bankStatement', 'shopPhoto', 'passportPhoto'];
const IMAGE_ONLY_DOCS = ['shopPhoto', 'passportPhoto'];

const REQUIRED_FIELDS = ['fullName', 'mobile', 'email', 'panNumber', 'aadhaarNumber',
  'addressLine1', 'city', 'district', 'state', 'pincode',
  'franchiseType', 'preferredLocation', 'investmentCapacity'];

function validateFields(body: Record<string, string>, allowedFranchiseTypes: string[]): string[] {
  const problems: string[] = [];
  const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

  check(/^\p{L}[\p{L}\p{M} .'-]{1,254}$/u.test(body.fullName ?? ''), 'fullName');
  check(/^(\+91)?[6-9]\d{9}$/.test(body.mobile ?? ''), 'mobile');
  check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email ?? '') && body.email.length <= 255, 'email');
  check(/^[A-Z]{5}[0-9]{4}[A-Z]$/.test((body.panNumber ?? '').toUpperCase()), 'panNumber');
  check(/^[2-9]\d{11}$/.test(body.aadhaarNumber ?? ''), 'aadhaarNumber');
  check(/^\d{6}$/.test(body.pincode ?? ''), 'pincode');
  check(allowedFranchiseTypes.includes(body.franchiseType ?? ''), 'franchiseType');
  check(/^\d+(\.\d{1,2})?$/.test(body.investmentCapacity ?? ''), 'investmentCapacity');
  if (body.whatsapp) check(/^(\+91)?[6-9]\d{9}$/.test(body.whatsapp), 'whatsapp');
  if (body.gstNumber) check(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(body.gstNumber.toUpperCase()), 'gstNumber');
  if (body.dateOfBirth) check(/^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth), 'dateOfBirth');
  return problems;
}

// 64-bit random token, formatted to fit the application_id column.
function generateApplicationId(): string {
  return `RCF-${randomBytes(8).toString('hex').toUpperCase()}`;
}

interface ParsedDoc {
  buffer: Buffer;
  ext: string;
}

// Decode and verify a base64 data URL by its real content (magic bytes), not its filename.
function parseDocument(field: string, dataUrl: string): ParsedDoc | string {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return `${field}: invalid upload`;
  const mime = match[1];
  const allowed = ALLOWED_MIME[mime];
  if (!allowed) return `${field}: file type not allowed`;
  if (IMAGE_ONLY_DOCS.includes(field) && !allowed.images) return `${field}: must be a JPG or PNG image`;

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0 || buffer.length > MAX_DOC_BYTES) return `${field}: file is empty or larger than 1.5 MB`;

  const isPdf = buffer.subarray(0, 4).toString('ascii') === '%PDF';
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const signatureOk = allowed.ext === 'pdf' ? isPdf : allowed.ext === 'jpg' ? isJpeg : isPng;
  if (!signatureOk) return `${field}: file content does not match its type`;

  return { buffer, ext: allowed.ext };
}

// Writes to the private directory and returns the stored relative path (never a URL).
async function savePrivateFile(doc: ParsedDoc): Promise<string> {
  await fs.mkdir(PRIVATE_UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${randomBytes(12).toString('hex')}.${doc.ext}`;
  await fs.writeFile(path.join(PRIVATE_UPLOAD_DIR, name), doc.buffer, { mode: 0o600 });
  return path.posix.join('applications', name);
}

export default async function handler(req: Request, res: Response) {
  const savedPaths: string[] = [];
  try {
    const body = (req.body ?? {}) as Record<string, string>;
    const [franchiseConfiguration] = await db.select({ franchiseTypes: franchiseSettings.franchiseTypes })
      .from(franchiseSettings).limit(1);
    const allowedFranchiseTypes = franchiseConfiguration
      ? parseStringList(franchiseConfiguration.franchiseTypes, DEFAULT_FRANCHISE_TYPES)
      : DEFAULT_FRANCHISE_TYPES;

    const missing = REQUIRED_FIELDS.filter((f) => !body[f]);
    if (missing.length > 0) {
      return res.status(400).json({ error: 'Missing required fields', fields: missing });
    }

    const invalid = validateFields(body, allowedFranchiseTypes);
    if (invalid.length > 0) {
      return res.status(400).json({ error: 'Invalid fields', fields: invalid });
    }

    const missingDocs = REQUIRED_DOCS.filter((f) => !body[f]);
    if (missingDocs.length > 0) {
      return res.status(400).json({ error: 'Missing required documents', fields: missingDocs });
    }

    // Validate every document before writing anything to disk.
    const parsedDocs: Record<string, ParsedDoc | null> = {};
    const docErrors: string[] = [];
    for (const field of DOC_FIELDS) {
      if (!body[field]) {
        parsedDocs[field] = null;
        continue;
      }
      const result = parseDocument(field, body[field]);
      if (typeof result === 'string') docErrors.push(result);
      else parsedDocs[field] = result;
    }
    if (docErrors.length > 0) {
      return res.status(400).json({ error: 'Invalid documents', fields: docErrors });
    }

    const savedDocs: Record<string, string | null> = {};
    for (const field of DOC_FIELDS) {
      const doc = parsedDocs[field];
      if (doc) {
        const stored = await savePrivateFile(doc);
        savedPaths.push(stored);
        savedDocs[field] = stored;
      } else {
        savedDocs[field] = null;
      }
    }

    // Retry on the rare ID collision instead of failing the submission.
    let applicationId = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      applicationId = generateApplicationId();
      const existing = await db.select({ id: franchiseApplications.id })
        .from(franchiseApplications)
        .where(eq(franchiseApplications.applicationId, applicationId))
        .limit(1);
      if (existing.length === 0) break;
      applicationId = '';
    }
    if (!applicationId) throw new Error('Unable to allocate a unique application ID');

    const result = await db.insert(franchiseApplications).values({
      applicationId,
      fullName: body.fullName,
      mobile: body.mobile,
      whatsapp: body.whatsapp || null,
      email: body.email,
      dateOfBirth: body.dateOfBirth || null,
      gender: body.gender || null,
      panNumber: body.panNumber.toUpperCase(),
      aadhaarNumber: body.aadhaarNumber,
      gstNumber: body.gstNumber ? body.gstNumber.toUpperCase() : null,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2 || null,
      city: body.city,
      district: body.district,
      state: body.state,
      pincode: body.pincode,
      businessName: body.businessName || null,
      businessType: body.businessType || null,
      yearsInBusiness: body.yearsInBusiness || null,
      existingFertilizerDealer: body.existingFertilizerDealer === 'true',
      currentBrands: body.currentBrands || null,
      shopArea: body.shopArea || null,
      warehouseArea: body.warehouseArea || null,
      franchiseType: body.franchiseType,
      preferredLocation: body.preferredLocation,
      coverageArea: body.coverageArea || null,
      investmentCapacity: body.investmentCapacity as unknown as string,
      bankName: null,
      accountNumber: null,
      ifscCode: null,
      accountHolderName: null,
      panDocument: savedDocs.panDocument,
      aadhaarDocument: savedDocs.aadhaarDocument,
      gstDocument: savedDocs.gstDocument,
      addressProof: savedDocs.addressProof,
      bankStatement: savedDocs.bankStatement,
      shopPhoto: savedDocs.shopPhoto,
      passportPhoto: savedDocs.passportPhoto,
      status: 'submitted',
    });

    const insertId = Number(result[0].insertId);
    const [newApp] = await db.select({ id: franchiseApplications.id, applicationId: franchiseApplications.applicationId, status: franchiseApplications.status, createdAt: franchiseApplications.createdAt })
      .from(franchiseApplications)
      .where(eq(franchiseApplications.id, insertId))
      .limit(1);

    return res.status(201).json({ success: true, applicationId: newApp.applicationId, id: newApp.id });
  } catch (error) {
    // Remove files written for a submission that did not complete.
    await Promise.all(savedPaths.map((p) =>
      fs.unlink(path.join(PRIVATE_UPLOAD_DIR, path.basename(p))).catch(() => undefined),
    ));
    console.error('Application submission error:', error);
    return res.status(500).json({ error: 'Failed to submit application' });
  }
}
