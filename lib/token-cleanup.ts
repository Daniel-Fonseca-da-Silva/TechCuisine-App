/**
 * Legacy session-token cleanup (Prisma `sessions` collection) was removed when
 * auth moved to JWT + API. These functions remain as no-ops for callers that
 * still import them (e.g. admin cleanup route).
 */

export async function cleanupExpiredTokens(): Promise<number> {
  return 0
}

export async function cleanupUserExpiredTokens(_userId: string): Promise<number> {
  return 0
}

export async function cleanupSpecificToken(_token: string): Promise<boolean> {
  return false
}

export function startTokenCleanupScheduler(): void {
  // No database-backed sessions to prune in the Next app.
}

export async function immediateCleanup(): Promise<number> {
  return 0
}
