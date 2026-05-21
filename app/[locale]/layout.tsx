import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, getLocale } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { CookieConsentBanner } from "@/components/cookie/cookie-consent-banner";
import { SetDocumentLocale } from "@/components/layout/set-document-locale";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import Script from "next/script";

interface Props {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const ogImageUrl = `${baseUrl}/open-graph.png`;

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
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImageUrl],
    },
  };
}

const GTM_ID = 'GTM-WJ5GDM43';

export default async function LocaleLayout({ children }: Props) {
  const allMessages = await getMessages();
  const messages: AbstractIntlMessages = allMessages;
  const locale = await getLocale();

  return (
    <>
      <SetDocumentLocale locale={locale} />
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
