/**
 * Normalizes phone to E.164 for react-phone-number-input (+ and digits only).
 * Handles values stored without "+" or with spaces/dashes (e.g. "35195678-9012" → "+351956789012").
 */
export function toE164(phone: string | undefined): string | undefined {
  if (!phone?.trim()) return undefined
  const digits = phone.replace(/\D/g, "")
  return digits ? `+${digits}` : undefined
}
