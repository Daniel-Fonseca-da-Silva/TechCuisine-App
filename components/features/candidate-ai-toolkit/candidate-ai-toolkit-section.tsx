'use client';

import { useTranslations } from 'next-intl';
import { FiClipboard, FiDollarSign, FiPercent, FiPieChart } from 'react-icons/fi';

const features = [
  { icon: FiClipboard, key: 'recipeBreakdown' },
  { icon: FiDollarSign, key: 'sellingPrice' },
  { icon: FiPercent, key: 'foodCostCheck' },
  { icon: FiPieChart, key: 'menuMatrix' },
];

export function CandidateAiToolkitSection() {
  const t = useTranslations('HomePage.aiToolkit');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-lime-900 to-amber-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.key}
                className="group relative text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-lime-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t(`items.${feature.key}.title`)}
                </h3>
                <p className="text-white/75 text-sm leading-relaxed">
                  {t(`items.${feature.key}.description`)}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-lime-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
