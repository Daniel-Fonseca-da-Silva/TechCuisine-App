'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type AboutSection = {
  title: string;
  paragraphs: string[];
};

export function AboutPageContent() {
  const t = useTranslations('AboutPage');
  const sections = t.raw('sections') as AboutSection[];

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('h1'),
    headline: t('h1'),
    description: t('metadata.description'),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <article className="space-y-12">
          <header className="text-center sm:text-left space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {t('h1')}
            </h1>
            <p className="text-lg sm:text-xl text-white/85 leading-relaxed">{t('lead')}</p>
          </header>

          {sections.map((section, index) => (
            <section
              key={section.title}
              className="space-y-4"
              aria-labelledby={`about-section-${index}`}
            >
              <h2
                id={`about-section-${index}`}
                className="text-xl sm:text-2xl font-semibold text-white"
              >
                {section.title}
              </h2>
              <div className="space-y-4 text-white/80 leading-relaxed">
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={`${section.title}-${pIndex}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="text-center pt-4">
            <Link
              href={t('cta.href') as '/auth/register'}
              className="inline-block bg-gradient-to-r from-amber-500 to-lime-500 hover:from-amber-400 hover:to-lime-400 text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
            >
              {t('cta.text')}
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
