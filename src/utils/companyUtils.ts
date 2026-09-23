/**
 * Company utilities for dynamic branding, document numbering prefixes, and text formatting.
 */

export function getCompanyPrefix(companyName?: string): string {
  if (!companyName || !companyName.trim()) return 'NK';
  const clean = companyName.trim();

  // If already like an acronym (2-4 uppercase letters)
  if (/^[A-Z0-9]{2,4}$/.test(clean)) {
    return clean;
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    // E.g. "Apex Industrial Solutions" -> "AIS", "NK Quality" -> "NK"
    const acronym = words
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    if (acronym.length >= 2 && acronym.length <= 4) {
      return acronym;
    }
  }

  // Single word: use first 2 to 4 chars
  const firstWord = clean.replace(/[^a-zA-Z0-9]/g, '');
  if (firstWord.length <= 4) {
    return firstWord.toUpperCase();
  }
  return firstWord.slice(0, 4).toUpperCase();
}

/**
 * Format document numbers so any existing prefix (e.g. NK-, AIS-, etc.)
 * is dynamically replaced with the active company's prefix.
 */
export function formatDocNumber(docNumber?: string, companyName?: string): string {
  if (!docNumber) return '';
  const prefix = getCompanyPrefix(companyName);
  // Match prefix before the first hyphen if it looks like an acronym or code
  return docNumber.replace(/^[A-Za-z0-9]{2,6}-/, `${prefix}-`);
}

/**
 * Get URL-safe company slug
 */
export function getCompanySlug(companyName?: string): string {
  if (!companyName || !companyName.trim()) return 'nk';
  return (
    companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'company'
  );
}

/**
 * Dynamically replace old organization names in document text or policy statements
 * with the active company's name.
 */
export function formatCompanyText(text: string, currentCompanyName: string): string {
  if (!text || !currentCompanyName) return text;
  // Replace references like "nk", "NK Quality Systems", "NK Quality Systems Ltd", etc.
  return text
    .replace(/NK Quality Systems Ltd/gi, currentCompanyName)
    .replace(/NK Quality Systems/gi, currentCompanyName)
    .replace(/\bTop Management of nk\b/gi, `Top Management of ${currentCompanyName}`)
    .replace(/\bnk operates\b/gi, `${currentCompanyName} operates`)
    .replace(/\bnk prioritizes\b/gi, `${currentCompanyName} prioritizes`)
    .replace(/\bnk is committed\b/gi, `${currentCompanyName} is committed`)
    .replace(/\bnk monitors\b/gi, `${currentCompanyName} monitors`);
}
