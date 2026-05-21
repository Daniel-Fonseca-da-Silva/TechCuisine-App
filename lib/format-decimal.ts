/**
 * Decimal-formatting helpers driven by the user's `decimal_separator` preference.
 *
 * The preference is stored as a single character (`","` or `"."`) and only the
 * decimal mark is swapped here. Thousand grouping is intentionally left out so
 * the produced string round-trips with the existing input parser, which strips
 * spaces and converts comma to dot before `Number(...)`.
 */

export type DecimalSeparator = ',' | '.'

const DEFAULT_SEPARATOR: DecimalSeparator = ','
const VALID_SEPARATORS: ReadonlyArray<DecimalSeparator> = [',', '.']

export function normalizeDecimalSeparator(
  raw: string | undefined | null,
): DecimalSeparator {
  if (raw && (VALID_SEPARATORS as ReadonlyArray<string>).includes(raw)) {
    return raw as DecimalSeparator
  }
  return DEFAULT_SEPARATOR
}

/**
 * Formats a numeric value (or numeric string) using the given decimal separator.
 *
 * Returns `''` for nullish/empty inputs and the raw stringified value when it
 * cannot be parsed as a finite number.
 */
export function formatDecimalForPreference(
  value: number | string | null | undefined,
  separator: string = DEFAULT_SEPARATOR,
): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' && value.trim() === '') return ''

  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return String(value)

  const normalized = numeric.toString()
  const target = normalizeDecimalSeparator(separator)
  if (target === '.') return normalized
  return normalized.replace('.', target)
}
