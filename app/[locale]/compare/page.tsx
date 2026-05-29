import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, getLocale } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CompareContent } from '@/components/features/compare-content';
import { buildAlternates, buildOgImage } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ComparePage.metadata');
  const locale = await getLocale();
  const { canonical, languages } = buildAlternates('/compare', locale);

  return {
    title: t('title'),
    description: t('description'),
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

export default async function ComparePage() {
  const allMessages = await getMessages();
  const messages: AbstractIntlMessages = {
    logo: allMessages.logo,
    cookie: allMessages.cookie,
    HomePage: allMessages.HomePage,
    ComparePage: allMessages.ComparePage,
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
          <CompareContent />
        </main>

        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
