import { useState, useCallback } from "react"
import {
  Plate,
  PaginatedPlateResponse,
  PlateCreatePayload,
  PlateUpdatePayload,
} from "@/types/plate.types"

interface UsePlatesReturn {
  plates: Plate[]
  loading: boolean
  mutationLoading: boolean
  error: string | null
  loadAll: () => Promise<void>
  getFilteredPlates: (search: string) => Plate[]
  create: (payload: PlateCreatePayload) => Promise<{ plate: Plate | null; error: string | null }>
  update: (id: string, patch: PlateUpdatePayload) => Promise<{ plate: Plate | null; error: string | null }>
  remove: (id: string) => Promise<{ success: boolean; error: string | null }>
  reload: () => Promise<void>
}

function sortAlphabetically(items: Plate[]): Plate[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

export function usePlates(): UsePlatesReturn {
  const [plates, setPlates] = useState<Plate[]>([])
  const [loading, setLoading] = useState(false)
  const [mutationLoading, setMutationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const allItems: Plate[] = []
      let cursor: string | undefined = undefined

      while (true) {
        const params = new URLSearchParams({ limit: '100' })
        if (cursor) params.set('cursor', cursor)

        const response = await fetch(`/api/plates?${params}`)
        const json = (await response.json()) as {
          success: boolean
          data?: PaginatedPlateResponse
          error?: string
        }

        if (!json.success || !json.data) {
          setError(json.error ?? 'Failed to load plates')
          return
        }

        allItems.push(...json.data.items)

        if (!json.data.next_cursor) break
        cursor = json.data.next_cursor
      }

      setPlates(sortAlphabetically(allItems))
    } catch {
      setError('Failed to load plates')
    } finally {
      setLoading(false)
    }
  }, [])

  const reload = loadAll

  const getFilteredPlates = useCallback(
    (search: string) => {
      if (!search.trim()) return plates
      const lower = search.toLowerCase()
      return plates.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          (p.menu_section?.toLowerCase().includes(lower) ?? false)
      )
    },
    [plates]
  )

  const create = useCallback(async (payload: PlateCreatePayload) => {
    setMutationLoading(true)
    try {
      const response = await fetch('/api/plates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await response.json()) as { success: boolean; data?: Plate; error?: string }
      if (!json.success || !json.data) {
        return { plate: null, error: json.error ?? 'Failed to create plate' }
      }
      setPlates((prev) => sortAlphabetically([...prev, json.data!]))
      return { plate: json.data, error: null }
    } catch {
      return { plate: null, error: 'Failed to create plate' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  const update = useCallback(async (id: string, patch: PlateUpdatePayload) => {
    setMutationLoading(true)
    try {
      const response = await fetch(`/api/plates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = (await response.json()) as { success: boolean; data?: Plate; error?: string }
      if (!json.success || !json.data) {
        return { plate: null, error: json.error ?? 'Failed to update plate' }
      }
      setPlates((prev) => sortAlphabetically(prev.map((p) => (p.id === id ? json.data! : p))))
      return { plate: json.data, error: null }
    } catch {
      return { plate: null, error: 'Failed to update plate' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    setMutationLoading(true)
    try {
      const response = await fetch(`/api/plates/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as { success: boolean; error?: string }
      if (!json.success) {
        return { success: false, error: json.error ?? 'Failed to delete plate' }
      }
      setPlates((prev) => prev.filter((p) => p.id !== id))
      return { success: true, error: null }
    } catch {
      return { success: false, error: 'Failed to delete plate' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  return { plates, loading, mutationLoading, error, loadAll, getFilteredPlates, create, update, remove, reload }
}
