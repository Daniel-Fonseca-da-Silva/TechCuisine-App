import { routing } from '@/i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

export function buildAlternates(path: string, currentLocale: string) {
  const isDefault = currentLocale === routing.defaultLocale;
  const localePrefix = isDefault ? '' : `/${currentLocale}`;
  const canonical = `${baseUrl}${localePrefix}${path}`;

  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    const lIsDefault = locale === routing.defaultLocale;
    const lPrefix = lIsDefault ? '' : `/${locale}`;
    languages[locale] = `${baseUrl}${lPrefix}${path}`;
  }
  // x-default points to the default-locale URL
  languages['x-default'] = `${baseUrl}${path}`;

  return { canonical, languages };
}

export function buildOgImage(path = '/open-graph.png') {
  return [{ url: `${baseUrl}${path}`, width: 1200, height: 630 }];
}
