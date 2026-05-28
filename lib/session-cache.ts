/**
 * Cache sessions in memory to reduce API/session validation calls
 */

interface CachedSession {
  token: string
  userId: string
  expiresAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
}

class SessionCache {
  private cache = new Map<string, CachedSession>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutos

  set(token: string, session: CachedSession) {
    this.cache.set(token, session)
    
    // Automatically clear after TTL
    setTimeout(() => {
      this.cache.delete(token)
    }, this.TTL)
  }

  get(token: string): CachedSession | null {
    const session = this.cache.get(token)
    
    if (!session) return null
    
    // Check if expired
    if (session.expiresAt < new Date()) {
      this.cache.delete(token)
      return null
    }
    
    return session
  }

  delete(token: string) {
    this.cache.delete(token)
  }

  clear() {
    this.cache.clear()
  }

  // Clear expired sessions
  cleanup() {
    const now = new Date()
    for (const [token, session] of this.cache.entries()) {
      if (session.expiresAt < now) {
        this.cache.delete(token)
      }
    }
  }
}

export const sessionCache = new SessionCache()

// Clear cache every 10 minutes
setInterval(() => {
  sessionCache.cleanup()
}, 10 * 60 * 1000)
