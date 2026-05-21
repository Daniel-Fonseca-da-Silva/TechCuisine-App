import {
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  setLocaleCookie,
  getLocaleFromCookie,
  removeLocaleCookie,
  COOKIE_CONSENT_NAME,
  COOKIE_PREFERENCES_NAME,
  CONSENT_COOKIE_MAX_AGE,
  setCookieConsent,
  getCookieConsent,
  setCookiePreferences,
  getCookiePreferences,
} from './cookies'

describe('cookies', () => {
  const originalCookieDescriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(document),
    'cookie'
  ) ?? Object.getOwnPropertyDescriptor(document, 'cookie')

  beforeEach(() => {
    document.cookie = ''
  })

  afterEach(() => {
    if (originalCookieDescriptor && originalCookieDescriptor.configurable) {
      Object.defineProperty(document, 'cookie', originalCookieDescriptor)
    }
  })

  describe('constants', () => {
    it('LOCALE_COOKIE_NAME is NEXT_LOCALE', () => {
      expect(LOCALE_COOKIE_NAME).toBe('NEXT_LOCALE')
    })

    it('LOCALE_COOKIE_MAX_AGE is one year in seconds', () => {
      expect(LOCALE_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 365)
    })
  })

  describe('setLocaleCookie', () => {
    it('sets document.cookie with locale when document is defined', () => {
      setLocaleCookie('pt')
      expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=pt`)
    })
  })

  describe('getLocaleFromCookie', () => {
    it('returns locale when cookie is present', () => {
      document.cookie = `${LOCALE_COOKIE_NAME}=en; path=/`
      expect(getLocaleFromCookie()).toBe('en')
    })

    it('returns locale when multiple cookies exist', () => {
      document.cookie = 'other=value; path=/'
      document.cookie = `${LOCALE_COOKIE_NAME}=pt; path=/`
      expect(getLocaleFromCookie()).toBe('pt')
    })

    it('returns null when locale cookie is absent', () => {
      try {
        Object.defineProperty(document, 'cookie', {
          get: () => 'other=value',
          set: () => {},
          configurable: true,
        })
        expect(getLocaleFromCookie()).toBeNull()
      } finally {
        if (originalCookieDescriptor && originalCookieDescriptor.configurable) {
          Object.defineProperty(document, 'cookie', originalCookieDescriptor)
        }
      }
    })

    it('returns null when document.cookie is empty', () => {
      try {
        Object.defineProperty(document, 'cookie', {
          get: () => '',
          set: () => {},
          configurable: true,
        })
        expect(getLocaleFromCookie()).toBeNull()
      } finally {
        if (originalCookieDescriptor && originalCookieDescriptor.configurable) {
          Object.defineProperty(document, 'cookie', originalCookieDescriptor)
        }
      }
    })
  })

  describe('removeLocaleCookie', () => {
    it('sets cookie with max-age=0 to clear it', () => {
      let cookieValue = ''
      try {
        Object.defineProperty(document, 'cookie', {
          get: () => cookieValue,
          set: (v: string) => { cookieValue = v },
          configurable: true,
        })
        removeLocaleCookie()
        expect(cookieValue).toContain(`${LOCALE_COOKIE_NAME}=`)
        expect(cookieValue).toContain('max-age=0')
      } finally {
        if (originalCookieDescriptor && originalCookieDescriptor.configurable) {
          Object.defineProperty(document, 'cookie', originalCookieDescriptor)
        }
      }
    })
  })

  describe('consent cookie constants', () => {
    it('COOKIE_CONSENT_NAME is cookie-consent', () => {
      expect(COOKIE_CONSENT_NAME).toBe('cookie-consent')
    })

    it('COOKIE_PREFERENCES_NAME is cookie-preferences', () => {
      expect(COOKIE_PREFERENCES_NAME).toBe('cookie-preferences')
    })

    it('CONSENT_COOKIE_MAX_AGE is one year in seconds', () => {
      expect(CONSENT_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 365)
    })
  })

  describe('setCookieConsent / getCookieConsent', () => {
    it('sets and retrieves consent cookie value', () => {
      setCookieConsent('true')
      expect(getCookieConsent()).toBe('true')
    })

    it('returns null when consent cookie is absent', () => {
      try {
        Object.defineProperty(document, 'cookie', {
          get: () => 'other=value',
          set: () => {},
          configurable: true,
        })
        expect(getCookieConsent()).toBeNull()
      } finally {
        if (originalCookieDescriptor?.configurable) {
          Object.defineProperty(document, 'cookie', originalCookieDescriptor)
        }
      }
    })
  })

  describe('setCookiePreferences / getCookiePreferences', () => {
    it('sets and retrieves preferences as JSON string', () => {
      const prefs = { necessary: true, analytics: true, marketing: false, functional: false }
      setCookiePreferences(prefs)
      const raw = getCookiePreferences()
      expect(JSON.parse(raw!)).toEqual(prefs)
    })

    it('returns null when preferences cookie is absent', () => {
      try {
        Object.defineProperty(document, 'cookie', {
          get: () => 'other=value',
          set: () => {},
          configurable: true,
        })
        expect(getCookiePreferences()).toBeNull()
      } finally {
        if (originalCookieDescriptor?.configurable) {
          Object.defineProperty(document, 'cookie', originalCookieDescriptor)
        }
      }
    })

    it('returns null when cookie value is malformed URI encoding', () => {
      try {
        Object.defineProperty(document, 'cookie', {
          get: () => `${COOKIE_PREFERENCES_NAME}=%E0%A4%A`,
          set: () => {},
          configurable: true,
        })
        expect(getCookiePreferences()).toBeNull()
      } finally {
        if (originalCookieDescriptor?.configurable) {
          Object.defineProperty(document, 'cookie', originalCookieDescriptor)
        }
      }
    })
  })
})
