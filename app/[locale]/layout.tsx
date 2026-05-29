import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, getLocale } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { CookieConsentBanner } from "@/components/cookie/cookie-consent-banner";
import { SetDocumentLocale } from "@/components/layout/set-document-locale";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { buildAlternates, buildOgImage } from '@/lib/seo';
import Script from "next/script";

interface Props {
  children: React.ReactNode;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  const locale = await getLocale();
  const { canonical, languages } = buildAlternates('', locale);

  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: [
        { url: '/techcuisine-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/techcuisine-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/techcuisine-64x64.png', sizes: '64x64', type: 'image/png' },
        { url: '/techcuisine-128x128.png', sizes: '128x128', type: 'image/png' },
        { url: '/techcuisine-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/techcuisine-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: {
        url: '/techcuisine-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    },
    alternates: { canonical, languages },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      images: buildOgImage(),
    },
    twitter: {
      card: 'summary_large_image',
      images: buildOgImage().map(i => i.url),
    },
  };
}

const GTM_ID = 'GTM-WJ5GDM43';

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Tech Cuisine',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/techcuisine-512x512.png`,
        width: 512,
        height: 512,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Tech Cuisine',
      publisher: { '@id': `${baseUrl}/#organization` },
    },
  ],
};

export default async function LocaleLayout({ children }: Props) {
  const allMessages = await getMessages();
  const messages: AbstractIntlMessages = allMessages;
  const locale = await getLocale();

  return (
    <>
      <SetDocumentLocale locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      <NextIntlClientProvider messages={messages}>
        {children}
        <CookieConsentBanner />
      </NextIntlClientProvider>
      <SpeedInsights />
      <RegisterServiceWorker />
    </>
  );
}
