'use client'

import { useState, useCallback, useEffect } from 'react'

export interface AiUsage {
  plan: string
  used: number
  limit: number
  remaining: number
  period: string
}

export interface AiUsageState {
  usage: AiUsage | null
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useAiUsage(skip = false): AiUsageState {
  const [usage, setUsage] = useState<AiUsage | null>(null)
  const [isLoading, setIsLoading] = useState(!skip)
  const [isError, setIsError] = useState(false)

  const fetchUsage = useCallback(async () => {
    if (skip) return
    setIsLoading(true)
    setIsError(false)
    try {
      const response = await fetch('/api/ai-usage', { cache: 'no-store' })
      if (!response.ok) {
        setIsError(true)
        return
      }
      const data: AiUsage = await response.json()
      setUsage(data)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [skip])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return { usage, isLoading, isError, refetch: fetchUsage }
}
