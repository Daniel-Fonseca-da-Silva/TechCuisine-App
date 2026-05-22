import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, getLocale } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AboutPageContent } from '@/components/features/about/about-page-content';
import { routing } from '@/i18n/routing';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('AboutPage.metadata');
  const locale = await getLocale();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const ogImageUrl = `${baseUrl}/open-graph.png`;
  const isDefault = locale === routing.defaultLocale;
  const localePrefix = isDefault ? '' : `/${locale}`;
  const canonical = baseUrl ? `${baseUrl}${localePrefix}/about` : undefined;

  return {
    title: t('title'),
    description: t('description'),
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
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

export default async function AboutPage() {
  const allMessages = await getMessages();
  const messages: AbstractIntlMessages = {
    logo: allMessages.logo,
    cookie: allMessages.cookie,
    HomePage: allMessages.HomePage,
    AboutPage: allMessages.AboutPage,
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen flex flex-col relative">
        <Header />

        <div className="fixed inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-lime-800 -z-10" />

        <div className="fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-lime-400/20 rounded-full blur-xl" />
          <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl" />
        </div>

        <main className="flex-grow pt-16">
          <AboutPageContent />
        </main>

        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
