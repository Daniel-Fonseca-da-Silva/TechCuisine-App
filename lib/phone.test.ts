import { toE164 } from './phone'

describe('phone', () => {
  describe('toE164', () => {
    it('returns undefined for undefined', () => {
      expect(toE164(undefined)).toBeUndefined()
    })

    it('returns undefined for empty string', () => {
      expect(toE164('')).toBeUndefined()
    })

    it('returns undefined for whitespace-only string', () => {
      expect(toE164('   ')).toBeUndefined()
    })

    it('normalizes digits with spaces and dashes to E.164', () => {
      expect(toE164('35195678-9012')).toBe('+351956789012')
    })

    it('adds + when only digits are provided', () => {
      expect(toE164('351956789012')).toBe('+351956789012')
    })

    it('strips non-digit characters', () => {
      expect(toE164('+35 (195) 678-9012')).toBe('+351956789012')
    })

    it('returns undefined when no digits present', () => {
      expect(toE164('abc')).toBeUndefined()
    })
  })
})
