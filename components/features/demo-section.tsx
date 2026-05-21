'use client';

import { useTranslations } from 'next-intl';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { PrimaryButton } from '@/components/ui/primary-button';
import { motion } from 'framer-motion';
import { DemoFeature, DemoStat } from '@/types/translations';
import { Link } from '@/i18n/navigation';

export function DemoSection() {
  const t = useTranslations('HomePage.demo');

  return (
    <section
      id="demo-section"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-lime-800 to-amber-900"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Phone mockup */}
          <div className="relative flex justify-center lg:justify-start">
            <PhoneMockup placeholderMessage={t('videoPlaceholder')} />
          </div>

          {/* Right Side - Features List */}
          <div className="space-y-8">
            <div className="space-y-6">
              {(t.raw('features') as DemoFeature[]).map((feature: DemoFeature, index: number) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-lime-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-4 flex justify-center md:justify-start">
              <Link href="/auth/register">
                <PrimaryButton>
                  <span>{t('cta')}</span>
                  <FiArrowRight className="w-5 h-5" />
                </PrimaryButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Statistics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {(t.raw('stats') as DemoStat[]).map((stat: DemoStat, index: number) => (
            <div key={index} className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <div className={`text-3xl font-bold mb-2 ${stat.color}`}>
                {stat.number}
              </div>
              <div className="text-white/90 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhoneMockup({ placeholderMessage }: { placeholderMessage: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="relative w-[280px] sm:w-[300px]">
        <div className="absolute left-0 top-24 w-1 h-8 bg-gray-700/80 rounded-r -translate-x-full" />
        <div className="absolute left-0 top-36 w-1 h-12 bg-gray-700/80 rounded-r -translate-x-full" />
        <div className="absolute left-0 top-52 w-1 h-12 bg-gray-700/80 rounded-r -translate-x-full" />
        <div className="absolute right-0 top-32 w-1 h-16 bg-gray-700/80 rounded-l translate-x-full" />

        <div className="relative bg-gray-900 rounded-[3rem] p-[10px] shadow-2xl shadow-black/50 border border-gray-700/50 box-border">
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 z-10 w-28 h-6 bg-black rounded-full" />

          <div className="relative w-full rounded-[2.25rem] overflow-hidden aspect-[9/19] max-h-[560px] bg-black">
            <video
              src="/TechCuisine-Intro.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={placeholderMessage}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const video = e.currentTarget;
                video.style.display = 'none';
                const fallback = video.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 items-center justify-center bg-gradient-to-br from-amber-900 via-lime-900 to-amber-800 p-6 hidden">
              <p className="text-white/90 text-center text-sm font-medium">
                {placeholderMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
