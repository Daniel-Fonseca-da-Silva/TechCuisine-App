const SUBSCRIPTION_BLOCKED_PATTERNS = [
  "not available for your subscription plan",
  "subscription required",
  "premium required",
]

export function isSubscriptionBlockedMessage(msg: string): boolean {
  const lower = msg.toLowerCase()
  return SUBSCRIPTION_BLOCKED_PATTERNS.some((p) => lower.includes(p))
}
