'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/ui/logo';
import { FiSettings } from 'react-icons/fi';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { CookieSettingsModal } from '@/components/cookie/cookie-settings-modal';

export function Footer() {
  const t = useTranslations('HomePage.footer');
  const n = useTranslations('HomePage.navigation');

  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-gradient-to-b from-lime-800 to-amber-900 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2 text-center md:text-left">
              <div className="mb-4 flex justify-center md:justify-start">
                <Logo size="md" textClassName="text-white" href="/" />
              </div>
              <p className="text-white/80 max-w-md leading-relaxed mx-auto md:mx-0">
                {t('description')}
              </p>
            </div>

            {/* Company */}
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold mb-4">{t('company')}</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                    {t('about')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/80 hover:text-white transition-colors">
                    {n('contact')}
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="text-white/80 hover:text-white transition-colors">
                    {t('compareTools')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold mb-4">{t('legal')}</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-white/80 hover:text-white transition-colors">
                    {t('privacy')}
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-use" className="text-white/80 hover:text-white transition-colors">
                    {t('terms')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold mb-4">{t('information')}</h4>
              <div className="space-y-3 text-white/80">
                <p>{t('location')}</p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <a
                    href="https://instagram.com/techcuisine"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Tech Cuisine Instagram"
                    className="inline-flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <FaInstagram className="w-4 h-4" />
                    <span>TechCuisine</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/techcuisine"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Tech Cuisine LinkedIn"
                    className="inline-flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <FaLinkedin className="w-4 h-4" />
                    <span>TechCuisine</span>
                  </a>
                </div>
              </div>
            </div>

            {/* News */}
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold mb-4">{t('news')}</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog/recipe-cost-and-profit" className="text-white/80 hover:text-white transition-colors">
                    {t('blogRecipeCost')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-8 pt-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
              <p className="text-white/60 text-center sm:text-left">
                © {new Date().getFullYear()} {t('copyright')}
              </p>
              
              {/* Cookie Settings Card */}
              <button
                onClick={() => setIsCookieModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 cursor-pointer"
              >
                <FiSettings className="w-4 h-4" />
                <span className="text-sm font-medium">{t('cookies')}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Settings Modal */}
      <CookieSettingsModal 
        open={isCookieModalOpen} 
        onOpenChange={setIsCookieModalOpen} 
      />
    </>
  );
}
