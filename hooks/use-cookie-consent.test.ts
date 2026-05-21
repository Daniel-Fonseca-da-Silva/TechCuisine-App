import { renderHook, act } from '@testing-library/react'
import { useCookieConsent } from './use-cookie-consent'

const COOKIE_CONSENT_NAME = 'cookie-consent'
const COOKIE_PREFERENCES_NAME = 'cookie-preferences'

function buildCookieJar() {
  const store: Record<string, string> = {}

  return {
    get cookie() {
      return Object.entries(store)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')
    },
    set cookie(value: string) {
      const [pair] = value.split(';')
      const eqIdx = pair.indexOf('=')
      if (eqIdx === -1) return
      const name = pair.slice(0, eqIdx).trim()
      const val = pair.slice(eqIdx + 1).trim()
      store[name] = val
    },
    store,
  }
}

describe('useCookieConsent', () => {
  let jar: ReturnType<typeof buildCookieJar>
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(document),
    'cookie'
  ) ?? Object.getOwnPropertyDescriptor(document, 'cookie')

  beforeEach(() => {
    jar = buildCookieJar()
    Object.defineProperty(document, 'cookie', {
      get: () => jar.cookie,
      set: (v: string) => { jar.cookie = v },
      configurable: true,
    })
  })

  afterEach(() => {
    if (originalDescriptor?.configurable) {
      Object.defineProperty(document, 'cookie', originalDescriptor)
    }
  })

  it('sets isLoading to false after reading from cookies', async () => {
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => { await Promise.resolve() })

    expect(result.current.isLoading).toBe(false)
  })

  it('sets consentGiven to false when no consent cookie is stored', async () => {
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => { await Promise.resolve() })

    expect(result.current.consentGiven).toBe(false)
    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    })
  })

  it('restores consentGiven from cookie', async () => {
    jar.store[COOKIE_CONSENT_NAME] = 'true'
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => { await Promise.resolve() })

    expect(result.current.consentGiven).toBe(true)
  })

  it('restores preferences from cookie when valid JSON', async () => {
    jar.store[COOKIE_CONSENT_NAME] = 'true'
    jar.store[COOKIE_PREFERENCES_NAME] = encodeURIComponent(
      JSON.stringify({ analytics: true, marketing: false, functional: true })
    )
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => { await Promise.resolve() })

    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
      functional: true,
    })
  })

  it('uses default preferences when stored preferences cookie has invalid JSON', async () => {
    jar.store[COOKIE_PREFERENCES_NAME] = encodeURIComponent('invalid-json')
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => { await Promise.resolve() })

    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    })
  })

  it('always keeps necessary true when restoring preferences from cookie', async () => {
    jar.store[COOKIE_CONSENT_NAME] = 'true'
    jar.store[COOKIE_PREFERENCES_NAME] = encodeURIComponent(
      JSON.stringify({ necessary: false, analytics: true, marketing: false, functional: false })
    )
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => { await Promise.resolve() })

    expect(result.current.preferences.necessary).toBe(true)
  })

  it('acceptAll sets consent and all preferences to true and persists to cookies', async () => {
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => { await Promise.resolve() })
    act(() => { result.current.acceptAll() })

    expect(result.current.consentGiven).toBe(true)
    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    })
    expect(jar.store[COOKIE_CONSENT_NAME]).toBe('true')
    expect(JSON.parse(decodeURIComponent(jar.store[COOKIE_PREFERENCES_NAME]))).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    })
  })

  it('rejectAll sets consentGiven true with default preferences and persists to cookies', async () => {
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => { await Promise.resolve() })
    act(() => { result.current.rejectAll() })

    expect(result.current.consentGiven).toBe(true)
    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    })
    expect(jar.store[COOKIE_CONSENT_NAME]).toBe('true')
  })

  it('savePreferences updates preferences, keeps necessary true, and persists to cookies', async () => {
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => { await Promise.resolve() })
    act(() => {
      result.current.savePreferences({
        necessary: false,
        analytics: true,
        marketing: true,
        functional: false,
      })
    })

    expect(result.current.consentGiven).toBe(true)
    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: false,
    })
    expect(jar.store[COOKIE_CONSENT_NAME]).toBe('true')
    expect(JSON.parse(decodeURIComponent(jar.store[COOKIE_PREFERENCES_NAME]))).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: false,
    })
  })
})
