'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FiChevronDown } from 'react-icons/fi';
import type { FaqItem } from '@/types/translations';

interface ToolCardProps {
  title: string;
  context: string;
  focus: string;
}

function ToolCard({ title, context, focus }: ToolCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-white/80 mb-4 leading-relaxed">{context}</p>
      <p className="text-white/70 leading-relaxed border-t border-white/10 pt-4">{focus}</p>
    </div>
  );
}

export function CompareContent() {
  const t = useTranslations('ComparePage');
  const faqItems = t.raw('faq.items') as FaqItem[];
  const [openIndex, setOpenIndex] = useState<number>(0);

  const tools = ['recipeApps', 'spreadsheets', 'genericStack'] as const;
  const originParagraphs = t.raw('origin.paragraphs') as string[];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero */}
        <header className="mb-14 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            {t('h1')}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
            {t('lead')}
          </p>
        </header>

        {/* Origin */}
        <section className="mb-14 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('origin.title')}</h2>
          {originParagraphs.map((p) => (
            <p key={p} className="text-white/80 leading-relaxed mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </section>

        {/* Tool comparisons */}
        <section className="space-y-6 mb-14" aria-label={t('cardsSectionAria')}>
          {tools.map((tool) => (
            <ToolCard
              key={tool}
              title={t(`${tool}.title`)}
              context={t(`${tool}.context`)}
              focus={t(`${tool}.focus`)}
            />
          ))}
        </section>

        {/* CTA */}
        <div className="text-center mb-16">
          <Link
            href={t('cta.href') as '/auth/register'}
            className="inline-block bg-gradient-to-r from-amber-500 to-lime-500 hover:from-amber-400 hover:to-lime-400 text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
          >
            {t('cta.text')}
          </Link>
        </div>

        {/* FAQ */}
        <section aria-labelledby="compare-faq-heading">
          <h2
            id="compare-faq-heading"
            className="text-2xl sm:text-3xl font-bold text-white mb-8"
          >
            {t('faq.title')}
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              const contentId = `compare-faq-${index}`;

              return (
                <div
                  key={item.question}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-white/10 transition-colors"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                  >
                    <span className="text-sm sm:text-base font-medium text-white pr-4">
                      {item.question}
                    </span>
                    <FiChevronDown
                      className={`w-5 h-5 text-white/70 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={contentId}
                    className={`px-4 sm:px-6 pb-4 text-sm text-white/80 transition-[max-height,opacity] duration-200 ease-out ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {isOpen && <p>{item.answer}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
