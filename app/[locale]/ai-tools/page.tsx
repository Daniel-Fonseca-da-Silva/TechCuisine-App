import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { buildAlternates, buildOgImage } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('AiToolsPage.metadata');
  const locale = await getLocale();
  const { canonical, languages } = buildAlternates('/ai-tools', locale);

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

const TOOL_SLUGS = [
  'recipe-cost-breakdown',
  'selling-price-calculator',
  'food-cost-checker',
  'menu-matrix-analysis',
] as const;

export default async function AiToolsPage() {
  const t = await getTranslations('AiToolsPage');
  const locale = await getLocale();

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />

      <div className="fixed inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-lime-800 -z-10" />
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-lime-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl" />
      </div>

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('h1')}
          </h1>
          <p className="text-lg text-white/80 mb-12 max-w-2xl">
            {t('lead')}
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {TOOL_SLUGS.map(slug => (
              <Link
                key={slug}
                href={`${locale !== 'en' ? `/${locale}` : ''}/ai-tools/${slug}`}
                className="block backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors group"
              >
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {t(`tools.${slug}.title`)}
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  {t(`tools.${slug}.description`)}
                </p>
                <span className="inline-block mt-4 text-amber-300 text-sm font-medium">
                  {t('cta')} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
