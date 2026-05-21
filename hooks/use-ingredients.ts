import { useState, useCallback } from "react"
import {
  Ingredient,
  PaginatedIngredientResponse,
  IngredientCreatePayload,
  IngredientUpdatePayload,
} from "@/types/ingredient.types"

interface UseIngredientsReturn {
  ingredients: Ingredient[]
  loading: boolean
  mutationLoading: boolean
  error: string | null
  loadAll: () => Promise<void>
  getFilteredIngredients: (search: string) => Ingredient[]
  create: (payload: IngredientCreatePayload) => Promise<{ ingredient: Ingredient | null; error: string | null }>
  update: (id: string, patch: IngredientUpdatePayload) => Promise<{ ingredient: Ingredient | null; error: string | null }>
  remove: (id: string) => Promise<{ success: boolean; error: string | null }>
  reload: () => Promise<void>
}

function sortAlphabetically(items: Ingredient[]): Ingredient[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

export function useIngredients(): UseIngredientsReturn {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [mutationLoading, setMutationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const allItems: Ingredient[] = []
      let cursor: string | undefined = undefined

      while (true) {
        const params = new URLSearchParams({ limit: '100' })
        if (cursor) params.set('cursor', cursor)

        const response = await fetch(`/api/ingredients?${params}`)
        const json = (await response.json()) as {
          success: boolean
          data?: PaginatedIngredientResponse
          error?: string
        }

        if (!json.success || !json.data) {
          setError(json.error ?? 'Failed to load ingredients')
          return
        }

        allItems.push(...json.data.items)

        if (!json.data.next_cursor) break
        cursor = json.data.next_cursor
      }

      setIngredients(sortAlphabetically(allItems))
    } catch {
      setError('Failed to load ingredients')
    } finally {
      setLoading(false)
    }
  }, [])

  const reload = loadAll

  const getFilteredIngredients = useCallback(
    (search: string) => {
      if (!search.trim()) return ingredients
      const lower = search.toLowerCase()
      return ingredients.filter((i) => i.name.toLowerCase().includes(lower))
    },
    [ingredients]
  )

  const create = useCallback(
    async (payload: IngredientCreatePayload) => {
      setMutationLoading(true)
      try {
        const response = await fetch('/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = (await response.json()) as { success: boolean; data?: Ingredient; error?: string }
        if (!json.success || !json.data) {
          return { ingredient: null, error: json.error ?? 'Failed to create ingredient' }
        }
        setIngredients((prev) => sortAlphabetically([...prev, json.data!]))
        return { ingredient: json.data, error: null }
      } catch {
        return { ingredient: null, error: 'Failed to create ingredient' }
      } finally {
        setMutationLoading(false)
      }
    },
    []
  )

  const update = useCallback(
    async (id: string, patch: IngredientUpdatePayload) => {
      setMutationLoading(true)
      try {
        const response = await fetch(`/api/ingredients/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
        const json = (await response.json()) as { success: boolean; data?: Ingredient; error?: string }
        if (!json.success || !json.data) {
          return { ingredient: null, error: json.error ?? 'Failed to update ingredient' }
        }
        setIngredients((prev) => sortAlphabetically(prev.map((i) => (i.id === id ? json.data! : i))))
        return { ingredient: json.data, error: null }
      } catch {
        return { ingredient: null, error: 'Failed to update ingredient' }
      } finally {
        setMutationLoading(false)
      }
    },
    []
  )

  const remove = useCallback(async (id: string) => {
    setMutationLoading(true)
    try {
      const response = await fetch(`/api/ingredients/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as { success: boolean; error?: string }
      if (!json.success) {
        return { success: false, error: json.error ?? 'Failed to delete ingredient' }
      }
      setIngredients((prev) => prev.filter((i) => i.id !== id))
      return { success: true, error: null }
    } catch {
      return { success: false, error: 'Failed to delete ingredient' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  return { ingredients, loading, mutationLoading, error, loadAll, getFilteredIngredients, create, update, remove, reload }
}
