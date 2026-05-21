'use client';

import { useTranslations } from 'next-intl';
import { PrimaryButton } from '@/components/ui/primary-button';
import { FiZap, FiSmile } from 'react-icons/fi';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

/** Strips leading/trailing punctuation so "ignorado," matches highlight "ignorado". */
function tokenMatchesHighlight(token: string, highlight: string): boolean {
  const trimmed = token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  return trimmed === highlight;
}

export function HeroSection() {
  const t = useTranslations('HomePage.hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-lime-800" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -10, 0]
          }}
          transition={{
            opacity: {
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2
            },
            scale: {
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2
            },
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8 cursor-default"
        >
          <motion.span
            className="text-yellow-400"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          >
            ⭐
          </motion.span>
          <span className="text-white text-sm font-medium">{t('badge')}</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {t('headline').split(' ').map((word, index) => {
            const highlightWord = t('highlightWord');
            if (tokenMatchesHighlight(word, highlightWord)) {
              return (
                <motion.span
                  key={index}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent inline-block"
                  animate={{
                    scale: [1, 1.08, 1],
                    filter: [
                      'brightness(1)',
                      'brightness(1.2)',
                      'brightness(1)'
                    ]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.3 }
                  }}
                >
                  {word}{' '}
                </motion.span>
              );
            }
            return word + ' ';
          })}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
          {t('subheadline')}
        </p>

        {/* Free tier line */}
        <p className="text-sm text-white/70 mb-8">
          {t('freeTierLine')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register">
            <PrimaryButton>
              <FiZap className="w-5 h-5" />
              {t('ctaPrimary')} →
            </PrimaryButton>
          </Link>

          <PrimaryButton
            type="button"
            onClick={() => {
              document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <FiSmile className="w-5 h-5" />
            {t('ctaSecondary')}
          </PrimaryButton>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-lime-400/20 rounded-full blur-xl" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl" />
    </section>
  );
}
