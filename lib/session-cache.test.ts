/**
 * SessionCache is a singleton; we test its public behavior.
 * setInterval in the module runs in real time; we focus on get/set/delete/clear/cleanup.
 */
import { sessionCache } from './session-cache'

type SessionOverrides = Partial<{
  expiresAt: Date
  token: string
  userId: string
  user: { id: string; name: string | null; email: string }
}>

function makeSession(overrides: SessionOverrides = {}) {
  return {
    token: 'token-1',
    userId: 'user-1',
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 60_000),
    user: { id: 'user-1', name: 'Test', email: 'test@example.com' },
    ...overrides,
  }
}

describe('session-cache', () => {
  beforeEach(() => {
    sessionCache.clear()
  })

  describe('set and get', () => {
    it('returns session after set', () => {
      const session = makeSession()
      sessionCache.set('token-1', session)
      expect(sessionCache.get('token-1')).toEqual(session)
    })

    it('returns null for unknown token', () => {
      expect(sessionCache.get('unknown')).toBeNull()
    })
  })

  describe('get with expired session', () => {
    it('returns null and removes expired session', () => {
      const session = makeSession({ expiresAt: new Date(Date.now() - 1000) })
      sessionCache.set('token-expired', session)
      expect(sessionCache.get('token-expired')).toBeNull()
      expect(sessionCache.get('token-expired')).toBeNull()
    })
  })

  describe('delete', () => {
    it('removes session', () => {
      const session = makeSession()
      sessionCache.set('token-1', session)
      sessionCache.delete('token-1')
      expect(sessionCache.get('token-1')).toBeNull()
    })
  })

  describe('clear', () => {
    it('removes all sessions', () => {
      sessionCache.set('t1', makeSession())
      sessionCache.set('t2', makeSession({ userId: 'user-2', token: 't2' }))
      sessionCache.clear()
      expect(sessionCache.get('t1')).toBeNull()
      expect(sessionCache.get('t2')).toBeNull()
    })
  })

  describe('cleanup', () => {
    it('removes only expired sessions', () => {
      const valid = makeSession({ expiresAt: new Date(Date.now() + 60_000) })
      const expired = makeSession({
        token: 'token-expired',
        expiresAt: new Date(Date.now() - 1000),
      })
      sessionCache.set('valid', valid)
      sessionCache.set('token-expired', expired)
      sessionCache.cleanup()
      expect(sessionCache.get('valid')).toEqual(valid)
      expect(sessionCache.get('token-expired')).toBeNull()
    })
  })
})
