import { useState, useCallback } from "react"
import {
  Recipe,
  RecipeFilter,
  PaginatedRecipeResponse,
  RecipeCreatePayload,
  RecipeUpdatePayload,
  RecipeScaleResult,
} from "@/types/recipe.types"

interface UseRecipesReturn {
  recipes: Recipe[]
  loading: boolean
  mutationLoading: boolean
  error: string | null
  loadAll: () => Promise<void>
  getFilteredRecipes: (filter: RecipeFilter) => Recipe[]
  create: (payload: RecipeCreatePayload) => Promise<{ recipe: Recipe | null; error: string | null }>
  update: (id: string, patch: RecipeUpdatePayload) => Promise<{ recipe: Recipe | null; error: string | null }>
  remove: (id: string) => Promise<{ success: boolean; error: string | null }>
  scale: (id: string, portions: number) => Promise<{ result: RecipeScaleResult | null; error: string | null }>
  reload: () => Promise<void>
}

function sortAlphabetically(items: Recipe[]): Recipe[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

export function useRecipes(): UseRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [mutationLoading, setMutationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const allItems: Recipe[] = []
      let cursor: string | undefined = undefined

      while (true) {
        const params = new URLSearchParams({ limit: '100' })
        if (cursor) params.set('cursor', cursor)

        const response = await fetch(`/api/recipes?${params}`)
        const json = (await response.json()) as {
          success: boolean
          data?: PaginatedRecipeResponse
          error?: string
        }

        if (!json.success || !json.data) {
          setError(json.error ?? 'Failed to load recipes')
          return
        }

        allItems.push(...json.data.items)

        if (!json.data.next_cursor) break
        cursor = json.data.next_cursor
      }

      setRecipes(sortAlphabetically(allItems))
    } catch {
      setError('Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }, [])

  const reload = loadAll

  const getFilteredRecipes = useCallback(
    (filter: RecipeFilter) => {
      if (filter === 'all') return recipes
      return recipes.filter((r) => r.status === filter)
    },
    [recipes]
  )

  const create = useCallback(async (payload: RecipeCreatePayload) => {
    setMutationLoading(true)
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await response.json()) as { success: boolean; data?: Recipe; error?: string }
      if (!json.success || !json.data) {
        return { recipe: null, error: json.error ?? 'Failed to create recipe' }
      }
      setRecipes((prev) => sortAlphabetically([...prev, json.data!]))
      return { recipe: json.data, error: null }
    } catch {
      return { recipe: null, error: 'Failed to create recipe' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  const update = useCallback(async (id: string, patch: RecipeUpdatePayload) => {
    setMutationLoading(true)
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = (await response.json()) as { success: boolean; data?: Recipe; error?: string }
      if (!json.success || !json.data) {
        return { recipe: null, error: json.error ?? 'Failed to update recipe' }
      }
      setRecipes((prev) => sortAlphabetically(prev.map((r) => (r.id === id ? json.data! : r))))
      return { recipe: json.data, error: null }
    } catch {
      return { recipe: null, error: 'Failed to update recipe' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    setMutationLoading(true)
    try {
      const response = await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as { success: boolean; error?: string }
      if (!json.success) {
        return { success: false, error: json.error ?? 'Failed to delete recipe' }
      }
      setRecipes((prev) => prev.filter((r) => r.id !== id))
      return { success: true, error: null }
    } catch {
      return { success: false, error: 'Failed to delete recipe' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  const scale = useCallback(async (id: string, portions: number) => {
    try {
      const response = await fetch(`/api/recipes/${id}/scale?portions=${portions}`)
      const json = (await response.json()) as { success: boolean; data?: RecipeScaleResult; error?: string }
      if (!json.success || !json.data) {
        return { result: null, error: json.error ?? 'Failed to scale recipe' }
      }
      return { result: json.data, error: null }
    } catch {
      return { result: null, error: 'Failed to scale recipe' }
    }
  }, [])

  return {
    recipes,
    loading,
    mutationLoading,
    error,
    loadAll,
    getFilteredRecipes,
    create,
    update,
    remove,
    scale,
    reload,
  }
}
