"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

interface SubscriptionState {
  isPremiumActive: boolean
  status: string
  isLoading: boolean
  refetch: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionState | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPremiumActive, setIsPremiumActive] = useState(false)
  const [status, setStatus] = useState<string>('none')
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch('/api/subscriptions/me', { cache: 'no-store' })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok || !payload?.success) {
        setIsPremiumActive(false)
        setStatus('none')
        return
      }

      const data = payload.data
      const active =
        data?.is_premium_active === true ||
        data?.status === 'active' ||
        data?.status === 'trialing'
      setIsPremiumActive(active)
      setStatus(data?.status ?? 'none')
    } catch {
      setIsPremiumActive(false)
      setStatus('none')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return (
    <SubscriptionContext.Provider value={{ isPremiumActive, status, isLoading, refetch: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription(): SubscriptionState {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) {
    return { isPremiumActive: false, status: 'none', isLoading: false, refetch: async () => {} }
  }
  return ctx
}
