import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { buildAlternates, buildOgImage } from '@/lib/seo';

const TOOL_SLUGS = [
  'recipe-cost-breakdown',
  'selling-price-calculator',
  'food-cost-checker',
  'menu-matrix-analysis',
] as const;

type ToolSlug = typeof TOOL_SLUGS[number];

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export function generateStaticParams() {
  return TOOL_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!TOOL_SLUGS.includes(slug as ToolSlug)) return {};

  const t = await getTranslations('AiToolsPage');
  const locale = await getLocale();
  const { canonical, languages } = buildAlternates(`/ai-tools/${slug}`, locale);
  const title = t(`tools.${slug}.title` as Parameters<typeof t>[0]);
  const description = t(`tools.${slug}.description` as Parameters<typeof t>[0]);

  return {
    title: `${title} — Tech Cuisine`,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: `${title} — Tech Cuisine`,
      description,
      type: 'website',
      images: buildOgImage(),
    },
    twitter: {
      card: 'summary_large_image',
      images: buildOgImage().map(i => i.url),
    },
  };
}

export default async function AiToolPage({ params }: Props) {
  const { slug } = await params;
  if (!TOOL_SLUGS.includes(slug as ToolSlug)) notFound();

  const t = await getTranslations('AiToolsPage');
  const locale = await getLocale();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  const title = t(`tools.${slug}.title` as Parameters<typeof t>[0]);
  const longDescription = t(`tools.${slug}.longDescription` as Parameters<typeof t>[0]);
  const schemaDescription = t(`tools.${slug}.schemaDescription` as Parameters<typeof t>[0]);
  const cta = t(`tools.${slug}.cta` as Parameters<typeof t>[0]);
  const benefits = t.raw(`tools.${slug}.benefits`) as string[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `Tech Cuisine — ${title}`,
    description: schemaDescription,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${baseUrl}${locale !== 'en' ? `/${locale}` : ''}/ai-tools/${slug}`,
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Tech Cuisine',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: 'Free trial available',
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="fixed inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-lime-800 -z-10" />
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-lime-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl" />
      </div>

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`${locale !== 'en' ? `/${locale}` : ''}/ai-tools`}
            className="inline-block text-amber-300 text-sm mb-8 hover:underline"
          >
            ← {t('h1')}
          </Link>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            {title}
          </h1>

          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            {longDescription}
          </p>

          {benefits.length > 0 && (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-10">
              <h2 className="text-lg font-semibold text-white mb-4">
                What you get
              </h2>
              <ul className="space-y-2">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80 text-sm">
                    <span className="text-amber-300 mt-0.5 shrink-0">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href={`${locale !== 'en' ? `/${locale}` : ''}/auth/register`}
            className="inline-block bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {cta}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
