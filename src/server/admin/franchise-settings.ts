export const DEFAULT_FRANCHISE_TYPES = ['Retailer', 'Block Distributor', 'District Distributor'];
export const DEFAULT_INVESTMENT_CATEGORIES = [
  'Franchise Fee',
  'Security Deposit',
  'Infrastructure Investment',
  'Stock Investment',
  'Other Charges',
];

export function parseStringList(value: string, fallback: string[]): string[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === 'string')) {
    throw new Error('Stored franchise settings are invalid');
  }
  return parsed.length > 0 ? parsed : fallback;
}

export function normalizeStringList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 30) return null;
  const normalized: string[] = [];
  const seen = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== 'string') return null;
    const clean = entry.trim();
    const key = clean.toLocaleLowerCase('en-US');
    if (!clean || clean.length > 100 || seen.has(key)) return null;
    seen.add(key);
    normalized.push(clean);
  }
  return normalized.length ? normalized : null;
}
