import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/profile',
          '/settings',
          '/plans',
          '/payment-confirmation',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
