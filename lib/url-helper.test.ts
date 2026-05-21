import { normalizeBaseUrl } from './url-helper'

describe('url-helper', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  describe('normalizeBaseUrl', () => {
    it('returns null for undefined', () => {
      expect(normalizeBaseUrl(undefined)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(normalizeBaseUrl('')).toBeNull()
    })

    it('removes trailing slashes', () => {
      expect(normalizeBaseUrl('https://example.com/')).toBe('https://example.com')
    })

    it('trims whitespace', () => {
      expect(normalizeBaseUrl('  https://example.com  ')).toBe('https://example.com')
    })

    it('returns valid URL unchanged when already with protocol', () => {
      expect(normalizeBaseUrl('https://example.com')).toBe('https://example.com')
    })

    it('adds https in production when no protocol', () => {
      process.env.NODE_ENV = 'production'
      expect(normalizeBaseUrl('example.com')).toBe('https://example.com')
    })

    it('adds http in development when no protocol', () => {
      process.env.NODE_ENV = 'development'
      expect(normalizeBaseUrl('example.com')).toBe('http://example.com')
    })

  })
})
