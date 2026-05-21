import { formatDecimalForPreference, normalizeDecimalSeparator } from './format-decimal'

describe('format-decimal', () => {
  describe('normalizeDecimalSeparator', () => {
    it('keeps comma when valid', () => {
      expect(normalizeDecimalSeparator(',')).toBe(',')
    })

    it('keeps dot when valid', () => {
      expect(normalizeDecimalSeparator('.')).toBe('.')
    })

    it('falls back to comma for unknown values', () => {
      expect(normalizeDecimalSeparator(undefined)).toBe(',')
      expect(normalizeDecimalSeparator(null)).toBe(',')
      expect(normalizeDecimalSeparator('')).toBe(',')
      expect(normalizeDecimalSeparator(';')).toBe(',')
    })
  })

  describe('formatDecimalForPreference', () => {
    it('returns empty string for nullish inputs', () => {
      expect(formatDecimalForPreference(null)).toBe('')
      expect(formatDecimalForPreference(undefined)).toBe('')
      expect(formatDecimalForPreference('')).toBe('')
      expect(formatDecimalForPreference('   ')).toBe('')
    })

    it('formats numbers with comma separator', () => {
      expect(formatDecimalForPreference(1.5, ',')).toBe('1,5')
      expect(formatDecimalForPreference(1234.56, ',')).toBe('1234,56')
    })

    it('formats numbers with dot separator', () => {
      expect(formatDecimalForPreference(1.5, '.')).toBe('1.5')
      expect(formatDecimalForPreference(1234.56, '.')).toBe('1234.56')
    })

    it('parses numeric strings before formatting', () => {
      expect(formatDecimalForPreference('1.5', ',')).toBe('1,5')
      expect(formatDecimalForPreference('1.5', '.')).toBe('1.5')
    })

    it('preserves integer values without trailing separator', () => {
      expect(formatDecimalForPreference(42, ',')).toBe('42')
      expect(formatDecimalForPreference(42, '.')).toBe('42')
    })

    it('falls back to comma when separator is invalid', () => {
      expect(formatDecimalForPreference(1.5, ';')).toBe('1,5')
    })

    it('returns raw stringified value for non-finite inputs', () => {
      expect(formatDecimalForPreference('not a number', ',')).toBe('not a number')
    })
  })
})
