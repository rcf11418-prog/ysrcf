import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function getEncryptionKey(): Buffer {
  const raw = process.env.BANK_DETAILS_ENCRYPTION_KEY;
  if (!raw) throw new Error('BANK_DETAILS_ENCRYPTION_KEY is required to access or update company payment details');

  const key = /^[\da-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('BANK_DETAILS_ENCRYPTION_KEY must encode exactly 32 bytes as 64 hex or base64 characters');
  return key;
}

export function isPaymentEncryptionConfigured(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

export function encryptPaymentDetails(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptPaymentDetails<T>(value: string): T {
  const [version, ivText, tagText, ciphertextText, extra] = value.split('.');
  if (version !== 'v1' || !ivText || !tagText || !ciphertextText || extra !== undefined) {
    throw new Error('Stored payment details have an unsupported encrypted format');
  }
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  return JSON.parse(plaintext) as T;
}
