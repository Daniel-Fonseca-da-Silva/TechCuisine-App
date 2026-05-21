import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tech Cuisine',
    short_name: 'Tech Cuisine',
    description:
      'Precision costing, menu engineering, and AI analysis for professional kitchens.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#31313a',
    background_color: '#ffffff',
    icons: [
      {
        src: '/techcuisine-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/techcuisine-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/techcuisine-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
