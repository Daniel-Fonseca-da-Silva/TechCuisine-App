import { renderHook, act } from '@testing-library/react'
import { useLocale } from './use-locale'

const mockPush = jest.fn()
const mockSetLocaleCookie = jest.fn()

jest.mock('next-intl', () => ({
  useLocale: () => 'pt',
}))

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
}))

jest.mock('@/lib/cookies', () => ({
  setLocaleCookie: (...args: unknown[]) => mockSetLocaleCookie(...args),
}))

describe('useLocale', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns current locale from next-intl', () => {
    const { result } = renderHook(() => useLocale())
    expect(result.current.locale).toBe('pt')
  })

  it('changeLocale calls setLocaleCookie and router.push with new locale', () => {
    const { result } = renderHook(() => useLocale())

    act(() => {
      result.current.changeLocale('en')
    })

    expect(mockSetLocaleCookie).toHaveBeenCalledWith('en')
    expect(mockPush).toHaveBeenCalledWith('/dashboard', { locale: 'en' })
  })
})
