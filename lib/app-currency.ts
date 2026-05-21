const FALLBACK_CURRENCY = 'EUR'

/**
 * Returns a valid ISO 4217 alphabetic code (3 Latin letters) or null.
 */
export function normalizeIsoCurrency(raw: string | undefined | null): string | null {
  const c = raw?.trim().toUpperCase()
  if (!c || c.length !== 3 || !/^[A-Z]{3}$/.test(c)) return null
  return c
}

/**
 * Build-time default from env; used before preferences load and when API fails.
 */
export function resolveDefaultCurrencyFromEnv(): string {
  return normalizeIsoCurrency(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY) ?? FALLBACK_CURRENCY
}
