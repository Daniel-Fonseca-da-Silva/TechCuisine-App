import { useState, useCallback } from "react"
import { Recipe, RecipeFilter, PaginatedRecipeResponse } from "@/types/recipe.types"

interface UseRecipesReturn {
  recipes: Recipe[]
  loading: boolean
  error: string | null
  nextCursor: string | null
  fetchRecipes: (cursor?: string) => Promise<void>
  getFilteredRecipes: (filter: RecipeFilter) => Recipe[]
}

export function useRecipes(): UseRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const fetchRecipes = useCallback(async (cursor?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '20' })
      if (cursor) params.set('cursor', cursor)
      const response = await fetch(`/api/recipes?${params}`)
      const json = await response.json() as { success: boolean; data?: PaginatedRecipeResponse; error?: string }
      if (!json.success || !json.data) {
        setError(json.error ?? 'Failed to load recipes')
        return
      }
      setRecipes((prev) => cursor ? [...prev, ...json.data!.items] : json.data!.items)
      setNextCursor(json.data.next_cursor)
    } catch {
      setError('Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }, [])

  const getFilteredRecipes = useCallback(
    (filter: RecipeFilter) => {
      if (filter === 'all') return recipes
      return recipes.filter((r) => r.status === filter)
    },
    [recipes]
  )

  return { recipes, loading, error, nextCursor, fetchRecipes, getFilteredRecipes }
}
