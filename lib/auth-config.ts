export const AUTH_CONFIG = {
  SESSION_CHECK_INTERVAL_MINUTES: parseInt(process.env.SESSION_CHECK_INTERVAL_MINUTES || '5'),

  // JWT cookie names
  ACCESS_COOKIE_NAME: process.env.ACCESS_COOKIE_NAME || 'tc-access',
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || 'tc-refresh',

  // Access token lifetime in minutes (should match ACCESS_TOKEN_EXPIRE_MINUTES on the Python side)
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '30'),

  // Refresh token lifetime in days (should match ACCESS_TOKEN_REFRESH_DAYS on the Python side)
  REFRESH_TOKEN_EXPIRE_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7'),

  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_SAME_SITE: 'lax' as const,
  COOKIE_HTTP_ONLY: true,
}

export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000
}

export function minutesToSeconds(minutes: number): number {
  return minutes * 60
}

export function calculateExpirationDate(minutes: number): Date {
  return new Date(Date.now() + minutesToMs(minutes))
}

export function isTokenExpired(expiresAt: Date): boolean {
  return expiresAt < new Date()
}
