'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FiChevronDown, FiArrowRight } from 'react-icons/fi';
import type { FaqItem } from '@/types/translations';

type ExampleLine = {
  label: string;
  value: string;
  type: 'revenue' | 'cost' | 'subtotal' | 'metric' | 'profit';
};

type TriggerCard = {
  title: string;
  description: string;
  href: string;
};

type ArticleSection = {
  title: string;
  paragraphs: string[];
};

function lineClassName(type: ExampleLine['type']): string {
  switch (type) {
    case 'revenue':
      return 'text-amber-300 font-semibold';
    case 'cost':
      return 'text-white/70';
    case 'subtotal':
      return 'text-white font-medium border-t border-white/20 pt-2 mt-1';
    case 'metric':
      return 'text-lime-300 font-medium';
    case 'profit':
      return 'text-lime-300 font-bold text-base';
    default:
      return 'text-white/80';
  }
}

export function RecipeCostProfitContent() {
  const t = useTranslations('BlogRecipeCostPage');
  const faqItems = t.raw('faq.items') as FaqItem[];
  const exampleLines = t.raw('exampleBox.lines') as ExampleLine[];
  const sections = t.raw('sections') as ArticleSection[];
  const triggers = t.raw('triggers') as TriggerCard[];
  const [openIndex, setOpenIndex] = useState<number>(0);

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

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: t('blogPosting.headline'),
    description: t('blogPosting.description'),
    datePublished: t('blogPosting.datePublished'),
    author: {
      '@type': 'Organization',
      name: 'Tech Cuisine',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tech Cuisine',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <article>
          {/* Hero */}
          <header className="mb-14 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
              {t('h1')}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
              {t('lead')}
            </p>
          </header>

          {/* Example box */}
          <section
            className="mb-14 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md"
            aria-label={t('exampleBox.title')}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {t('exampleBox.title')}
            </h2>
            <p className="text-white/60 text-sm mb-6">{t('exampleBox.subtitle')}</p>

            <div className="space-y-2 mb-6">
              {exampleLines.map((line) => (
                <div
                  key={line.label}
                  className={`flex justify-between items-baseline gap-4 text-sm ${lineClassName(line.type)}`}
                >
                  <span>{line.label}</span>
                  <span className="font-mono tabular-nums whitespace-nowrap">{line.value}</span>
                </div>
              ))}
            </div>

            <blockquote className="border-l-2 border-amber-400 pl-4 text-white/80 italic text-sm leading-relaxed mb-4">
              {t('exampleBox.callout')}
            </blockquote>

            <p className="text-white/55 text-xs leading-relaxed">{t('exampleBox.note')}</p>
          </section>

          {/* Narrative sections */}
          <div className="space-y-12 mb-14">
            {sections.map((section, index) => (
              <section
                key={section.title}
                className="space-y-4"
                aria-labelledby={`blog-section-${index}`}
              >
                <h2
                  id={`blog-section-${index}`}
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
          </div>

          {/* Trigger cards */}
          <section className="mb-14" aria-label="Tech Cuisine features">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {triggers.map((card) => {
                const inner = (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col gap-3 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-white">{card.title}</h3>
                      {card.href && (
                        <FiArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{card.description}</p>
                  </div>
                );

                return card.href ? (
                  <Link key={card.title} href={card.href as '/ai-tools/recipe-cost-breakdown'}>
                    {inner}
                  </Link>
                ) : (
                  <div key={card.title}>{inner}</div>
                );
              })}
            </div>
          </section>

          {/* Internal links */}
          <section className="mb-14 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <p className="text-white/80 text-sm leading-relaxed">
              <Link
                href="/ai-tools/recipe-cost-breakdown"
                className="text-amber-300 hover:text-amber-200 underline underline-offset-2"
              >
                Recipe cost breakdown
              </Link>
              {' · '}
              <Link
                href="/ai-tools/food-cost-checker"
                className="text-amber-300 hover:text-amber-200 underline underline-offset-2"
              >
                Food cost checker
              </Link>
              {' · '}
              <Link
                href="/compare"
                className="text-amber-300 hover:text-amber-200 underline underline-offset-2"
              >
                Compare Tech Cuisine
              </Link>
              {' · '}
              <Link
                href="/about"
                className="text-amber-300 hover:text-amber-200 underline underline-offset-2"
              >
                About Tech Cuisine
              </Link>
            </p>
          </section>

          {/* CTA */}
          <div className="text-center mb-16">
            <Link
              href={t('cta.href') as '/auth/register'}
              className="inline-block bg-gradient-to-r from-amber-500 to-lime-500 hover:from-amber-400 hover:to-lime-400 text-white font-semibold px-8 py-4 rounded-xl text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
            >
              {t('cta.text')}
            </Link>
            <p className="text-white/50 text-sm mt-3">{t('cta.note')}</p>
          </div>

          {/* FAQ */}
          <section aria-labelledby="blog-faq-heading">
            <h2
              id="blog-faq-heading"
              className="text-2xl sm:text-3xl font-bold text-white mb-8"
            >
              {t('faq.title')}
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;
                const contentId = `blog-faq-${index}`;

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
        </article>
      </div>
    </>
  );
}
