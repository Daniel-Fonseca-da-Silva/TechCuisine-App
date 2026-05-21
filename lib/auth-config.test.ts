import {
  minutesToMs,
  minutesToSeconds,
  calculateExpirationDate,
  isTokenExpired,
} from './auth-config'

describe('auth-config', () => {
  describe('minutesToMs', () => {
    it('converts 1 minute to 60000 ms', () => {
      expect(minutesToMs(1)).toBe(60_000)
    })

    it('converts 30 minutes to 1800000 ms', () => {
      expect(minutesToMs(30)).toBe(1_800_000)
    })

    it('returns 0 for 0 minutes', () => {
      expect(minutesToMs(0)).toBe(0)
    })
  })

  describe('minutesToSeconds', () => {
    it('converts 1 minute to 60 seconds', () => {
      expect(minutesToSeconds(1)).toBe(60)
    })

    it('converts 30 minutes to 1800 seconds', () => {
      expect(minutesToSeconds(30)).toBe(1800)
    })

    it('returns 0 for 0 minutes', () => {
      expect(minutesToSeconds(0)).toBe(0)
    })
  })

  describe('calculateExpirationDate', () => {
    it('returns a date in the future for positive minutes', () => {
      const before = Date.now()
      const expiration = calculateExpirationDate(5)
      const after = Date.now()
      expect(expiration.getTime()).toBeGreaterThanOrEqual(before + 5 * 60 * 1000)
      expect(expiration.getTime()).toBeLessThanOrEqual(after + 5 * 60 * 1000 + 100)
    })

    it('returns a date in the past for zero minutes', () => {
      const before = Date.now()
      const expiration = calculateExpirationDate(0)
      const after = Date.now()
      expect(expiration.getTime()).toBeGreaterThanOrEqual(before)
      expect(expiration.getTime()).toBeLessThanOrEqual(after + 100)
    })
  })

  describe('isTokenExpired', () => {
    it('returns true when expiresAt is in the past', () => {
      const past = new Date(Date.now() - 1000)
      expect(isTokenExpired(past)).toBe(true)
    })

    it('returns false when expiresAt is in the future', () => {
      const future = new Date(Date.now() + 60_000)
      expect(isTokenExpired(future)).toBe(false)
    })

    it('returns true when expiresAt is slightly in the past', () => {
      const oneMsAgo = new Date(Date.now() - 1)
      expect(isTokenExpired(oneMsAgo)).toBe(true)
    })
  })
})
