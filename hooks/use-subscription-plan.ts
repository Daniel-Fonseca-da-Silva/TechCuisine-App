import { useState, useEffect } from 'react'

type SubscriptionPlan = 'free' | 'simple' | 'medium' | 'ultra' | 'business'

export function useSubscriptionPlan() {
  const [activePlan, setActivePlan] = useState<SubscriptionPlan>('free')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/subscriptions/me', { cache: 'no-store' })
        const payload = await response.json().catch(() => ({}))

        if (!response.ok || !payload?.success) {
          setActivePlan('free')
          return
        }

        const plan = payload.data?.plan
        if (plan === 'simple' || plan === 'medium' || plan === 'ultra' || plan === 'business' || plan === 'free') {
          setActivePlan(plan)
        } else {
          setActivePlan('free')
        }
      } catch {
        setActivePlan('free')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlan()
  }, [])

  const isPaid = activePlan !== 'free'

  return { activePlan, isLoading, isPaid }
}
