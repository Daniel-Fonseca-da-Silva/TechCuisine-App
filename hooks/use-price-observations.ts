import { useState, useCallback } from 'react'
import {
  BestPrice,
  PriceObservation,
  PriceObservationCreatePayload,
  PriceHistoryFilters,
} from '@/types/price-observation.types'

interface UsePriceObservationsReturn {
  bestPrices: BestPrice[]
  history: PriceObservation[]
  loading: boolean
  mutationLoading: boolean
  error: string | null
  loadBest: (ingredientId: string) => Promise<void>
  loadHistory: (ingredientId: string, filters?: PriceHistoryFilters) => Promise<void>
  create: (
    ingredientId: string,
    payload: PriceObservationCreatePayload
  ) => Promise<{ observation: PriceObservation | null; error: string | null }>
}

export function usePriceObservations(): UsePriceObservationsReturn {
  const [bestPrices, setBestPrices] = useState<BestPrice[]>([])
  const [history, setHistory] = useState<PriceObservation[]>([])
  const [loading, setLoading] = useState(false)
  const [mutationLoading, setMutationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBest = useCallback(async (ingredientId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/ingredients/${ingredientId}/prices/best`)
      const json = (await response.json()) as { success: boolean; data?: BestPrice[]; error?: string }
      if (!json.success || !json.data) {
        setError(json.error ?? 'Failed to load best prices')
        return
      }
      setBestPrices(json.data)
    } catch {
      setError('Failed to load best prices')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadHistory = useCallback(async (ingredientId: string, filters: PriceHistoryFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)
      if (filters.supplier_id) params.set('supplier_id', filters.supplier_id)
      if (filters.limit != null) params.set('limit', String(filters.limit))

      const qs = params.toString()
      const response = await fetch(`/api/ingredients/${ingredientId}/prices${qs ? `?${qs}` : ''}`)
      const json = (await response.json()) as { success: boolean; data?: PriceObservation[]; error?: string }
      if (!json.success || !json.data) {
        setError(json.error ?? 'Failed to load price history')
        return
      }
      setHistory(json.data)
    } catch {
      setError('Failed to load price history')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(
    async (ingredientId: string, payload: PriceObservationCreatePayload) => {
      setMutationLoading(true)
      try {
        const response = await fetch(`/api/ingredients/${ingredientId}/prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = (await response.json()) as {
          success: boolean
          data?: PriceObservation
          error?: string
        }
        if (!json.success || !json.data) {
          return { observation: null, error: json.error ?? 'Failed to create price observation' }
        }
        setHistory((prev) => [json.data!, ...prev])
        return { observation: json.data, error: null }
      } catch {
        return { observation: null, error: 'Failed to create price observation' }
      } finally {
        setMutationLoading(false)
      }
    },
    []
  )

  return { bestPrices, history, loading, mutationLoading, error, loadBest, loadHistory, create }
}
