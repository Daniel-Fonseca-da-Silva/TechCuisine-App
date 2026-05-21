'use client';

/**
 * Locale 404 page. Rendered when the path is under a valid [locale] but the
 * page does not exist (e.g. /en/unknown-page). Uses the locale layout (Header,
 * Footer, next-intl). For paths that do not match a locale, app/not-found.tsx
 * is used instead.
 */
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  const t = useTranslations('NotFoundPage');
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />

      <div className="fixed inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-lime-800 -z-10" />

      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-lime-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl" />
      </div>

      <main className="flex-grow pt-16 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <span className="text-3xl font-bold text-white">{t('errorCode')}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <h2 className="text-lg text-white/90 mb-4">{t('subtitle')}</h2>
          <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            {t('description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              onClick={handleGoBack}
            >
              <FiArrowLeft className="size-4" />
              {t('goBack')}
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href="/">
                {t('goHome')}
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
