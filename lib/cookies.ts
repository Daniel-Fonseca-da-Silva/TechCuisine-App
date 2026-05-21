/**
 * Utilities to manage locale cookies
 * Implement persistence of user language preference
 */

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

export const COOKIE_CONSENT_NAME = 'cookie-consent';
export const COOKIE_PREFERENCES_NAME = 'cookie-preferences';
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const match = cookies.find(c => c.trim().startsWith(`${name}=`));
  return match ? match.trim().slice(name.length + 1) : null;
}

/**
 * Define the locale cookie
 */
export function setLocaleCookie(locale: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

/**
 * Get the locale from the cookie
 */
export function getLocaleFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${LOCALE_COOKIE_NAME}=`)
  );

  if (localeCookie) {
    return localeCookie.split('=')[1];
  }

  return null;
}

/**
 * Remove the locale cookie
 */
export function removeLocaleCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
  }
}

export function setCookieConsent(value: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_CONSENT_NAME}=${value}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

export function getCookieConsent(): string | null {
  return getCookieValue(COOKIE_CONSENT_NAME);
}

export function setCookiePreferences(preferences: object) {
  if (typeof document !== 'undefined') {
    const encoded = encodeURIComponent(JSON.stringify(preferences));
    document.cookie = `${COOKIE_PREFERENCES_NAME}=${encoded}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

export function getCookiePreferences(): string | null {
  const raw = getCookieValue(COOKIE_PREFERENCES_NAME);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}
