import { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  // Pages static main (Home)
  // We explicitly define the main pages with the highest priority
  const staticPages: MetadataRoute.Sitemap = routing.locales.map(locale => {
    // Logic for 'localePrefix: as-needed':
    // If it is the default locale (en), the root URL does not take a prefix (ex: https://site.com)
    // If it is another locale (pt), it takes a prefix (ex: https://site.com/pt)
    const isDefault = locale === routing.defaultLocale;
    const path = isDefault ? '' : `/${locale}`;
    
    return {
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    };
  });

  // Other public routes
  const routes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/about',
    '/contact',
    '/compare',
    '/privacy-policy',
    '/terms-of-use'
  ];

  const dynamicPages: MetadataRoute.Sitemap = [];

  routes.forEach(route => {
    routing.locales.forEach(locale => {
      // Same logic for internal routes
      const isDefault = locale === routing.defaultLocale;
      const localePrefix = isDefault ? '' : `/${locale}`;
      
      dynamicPages.push({
        url: `${baseUrl}${localePrefix}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  return [...staticPages, ...dynamicPages];
}
