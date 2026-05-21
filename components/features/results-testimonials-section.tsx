'use client';

import { useTranslations } from 'next-intl';
import { FiStar } from 'react-icons/fi';
import { ResultsMetric, TestimonialItem } from '@/types/translations';

const STARS_COUNT = 5;

export function ResultsTestimonialsSection() {
  const t = useTranslations('HomePage.resultsTestimonials');
  const metrics = t.raw('metrics') as ResultsMetric[];
  const testimonials = t.raw('testimonials') as TestimonialItem[];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-lime-800 to-amber-900">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {metrics.map((metric: ResultsMetric, index: number) => (
            <div key={index} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-lime-400 mb-2">
                {metric.number}
              </div>
              <div className="text-white/70 text-lg">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial: TestimonialItem, index: number) => (
            <TestimonialCard key={index} item={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 flex flex-col">
      <div className="flex text-yellow-400 mb-4 gap-0.5">
        {Array.from({ length: STARS_COUNT }).map((_, i) => (
          <FiStar key={i} className="w-5 h-5 fill-current" aria-hidden />
        ))}
      </div>
      <span className="text-5xl text-lime-400/60 font-serif leading-none mb-2">
        &ldquo;
      </span>
      <p className="text-white/90 leading-relaxed mb-6 flex-1">
        {item.quote}
      </p>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{item.authorName}</p>
          <p className="text-sm text-white/70">{item.authorRole}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-green-400 font-semibold">{item.resultValue}</p>
          <p className="text-sm text-white/70">{item.resultLabel}</p>
        </div>
      </div>
    </div>
  );
}
