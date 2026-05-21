'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { setLocaleCookie } from '@/lib/cookies';

/**
 * Custom hook to manage locale with persistence in cookie
 */
export function useLocale() {
  const currentLocale = useNextIntlLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (newLocale: string) => {
    // Save the preference in cookie
    setLocaleCookie(newLocale);
    // Navigate to the new page with the selected locale
    router.push(pathname, { locale: newLocale });
  };

  return {
    locale: currentLocale,
    changeLocale
  };
}
