import { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

const AI_TOOL_SLUGS = [
  'recipe-cost-breakdown',
  'selling-price-calculator',
  'food-cost-checker',
  'menu-matrix-analysis',
];

function localeUrl(locale: string, path: string): string {
  const isDefault = locale === routing.defaultLocale;
  const prefix = isDefault ? '' : `/${locale}`;
  return `${baseUrl}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home — highest priority
  for (const locale of routing.locales) {
    entries.push({
      url: localeUrl(locale, ''),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    });
  }

  // High-value marketing pages
  const marketingRoutes = ['/about', '/compare', '/ai-tools', '/contact', '/blog/recipe-cost-and-profit'];
  for (const route of marketingRoutes) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, route),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  // AI tool detail pages
  for (const slug of AI_TOOL_SLUGS) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, `/ai-tools/${slug}`),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  // Auth and legal pages (lower priority)
  const supportingRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/privacy-policy',
    '/terms-of-use',
  ];
  for (const route of supportingRoutes) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, route),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
