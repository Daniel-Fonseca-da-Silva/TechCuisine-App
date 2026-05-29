import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const privateRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/plans',
  '/payment-confirmation',
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ['/api/'];

  for (const route of privateRoutes) {
    disallow.push(route);
    for (const locale of routing.locales) {
      if (locale !== routing.defaultLocale) {
        disallow.push(`/${locale}${route}`);
      }
    }
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
