import { useState, useEffect } from 'react'

type SubscriptionPlan = 'free' | 'tech_cuisine'

export function useSubscriptionPlan() {
  const [plan, setPlan] = useState<SubscriptionPlan>('free')
  const [isPremiumActive, setIsPremiumActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/subscriptions/me', { cache: 'no-store' })
        const payload = await response.json().catch(() => ({}))

        if (!response.ok || !payload?.success) {
          setPlan('free')
          setIsPremiumActive(false)
          return
        }

        const data = payload.data
        const rawPlan = data?.plan
        setPlan(rawPlan === 'tech_cuisine' ? 'tech_cuisine' : 'free')

        const active =
          data?.is_premium_active === true ||
          data?.status === 'active' ||
          data?.status === 'trialing'
        setIsPremiumActive(active)
      } catch {
        setPlan('free')
        setIsPremiumActive(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlan()
  }, [])

  return { plan, isPremiumActive, isLoading }
}
