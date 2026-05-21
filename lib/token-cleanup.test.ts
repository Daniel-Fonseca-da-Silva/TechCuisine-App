import {
  cleanupExpiredTokens,
  cleanupUserExpiredTokens,
  cleanupSpecificToken,
  startTokenCleanupScheduler,
  immediateCleanup,
} from './token-cleanup'

describe('token-cleanup (no-op; legacy Prisma sessions removed)', () => {
  it('cleanupExpiredTokens returns 0', async () => {
    expect(await cleanupExpiredTokens()).toBe(0)
  })

  it('cleanupUserExpiredTokens returns 0', async () => {
    expect(await cleanupUserExpiredTokens('user-123')).toBe(0)
  })

  it('cleanupSpecificToken returns false', async () => {
    expect(await cleanupSpecificToken('any')).toBe(false)
  })

  it('startTokenCleanupScheduler does not throw', () => {
    expect(() => startTokenCleanupScheduler()).not.toThrow()
  })

  it('immediateCleanup returns 0', async () => {
    expect(await immediateCleanup()).toBe(0)
  })
})
