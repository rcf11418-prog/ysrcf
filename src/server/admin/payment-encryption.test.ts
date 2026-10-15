import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_FRANCHISE_TYPES, normalizeStringList, parseStringList } from './franchise-settings.js';
import { decryptPaymentDetails, encryptPaymentDetails } from './payment-encryption.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('payment detail encryption', () => {
  it('round-trips payment details with a 32-byte key', () => {
    vi.stubEnv('BANK_DETAILS_ENCRYPTION_KEY', 'a'.repeat(64));
    const details = { bankName: 'Example Bank', accountNumber: '1234567890' };

    expect(decryptPaymentDetails(encryptPaymentDetails(details))).toEqual(details);
  });

  it('rejects tampered ciphertext', () => {
    vi.stubEnv('BANK_DETAILS_ENCRYPTION_KEY', 'a'.repeat(64));
    const encrypted = encryptPaymentDetails({ accountNumber: '1234567890' });
    const [version, iv, tag, ciphertext] = encrypted.split('.');
    const tamperedTag = `${tag?.[0] === 'A' ? 'B' : 'A'}${tag?.slice(1)}`;

    expect(() => decryptPaymentDetails(`${version}.${iv}.${tamperedTag}.${ciphertext}`)).toThrow();
  });

  it('rejects missing and incorrectly sized keys', () => {
    vi.stubEnv('BANK_DETAILS_ENCRYPTION_KEY', '');
    expect(() => encryptPaymentDetails({})).toThrow('BANK_DETAILS_ENCRYPTION_KEY is required');

    vi.stubEnv('BANK_DETAILS_ENCRYPTION_KEY', 'too-short');
    expect(() => encryptPaymentDetails({})).toThrow('must encode exactly 32 bytes');
  });
});

describe('franchise setting validation helpers', () => {
  it('normalizes unique labels while rejecting duplicates and empty lists', () => {
    expect(normalizeStringList([' Retailer ', 'Distributor'])).toEqual(['Retailer', 'Distributor']);
    expect(normalizeStringList(['Retailer', ' retailer '])).toBeNull();
    expect(normalizeStringList([])).toBeNull();
  });

  it('uses defaults for an empty saved list and rejects malformed JSON', () => {
    expect(parseStringList('[]', DEFAULT_FRANCHISE_TYPES)).toEqual(DEFAULT_FRANCHISE_TYPES);
    expect(() => parseStringList('{', DEFAULT_FRANCHISE_TYPES)).toThrow();
  });
});
