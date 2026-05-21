const VALID_LOCALES = ['en', 'pt'] as const
export type ValidLocale = (typeof VALID_LOCALES)[number]

export function primaryLocaleFromPreferences(language: string[]): ValidLocale {
  const raw = language[0] ?? ''
  return (VALID_LOCALES as readonly string[]).includes(raw) ? (raw as ValidLocale) : 'en'
}
