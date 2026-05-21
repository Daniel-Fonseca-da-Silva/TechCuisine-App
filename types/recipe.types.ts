export type RecipeStatus = 'pending' | 'canceled' | 'completed'
export type RecipeFilter = RecipeStatus | 'all'
export type ViewMode = 'grid' | 'list'

export interface Recipe {
  id: string
  user_id: string
  name: string
  description?: string | null
  reference_portions: number
  status: RecipeStatus
  chef_notes?: string | null
  total_ingredient_cost?: string | null
  total_preparation_cost?: string | null
  total_recipe_cost?: string | null
  cost_per_portion?: string | null
  selling_price_per_portion?: string | null
}

export interface PaginatedRecipeResponse {
  items: Recipe[]
  next_cursor: string | null
}

export interface RecipeSectionProps {
  onSectionChange?: (section: string) => void
}

export interface RecipeCardProps {
  recipe: Recipe
  onView: (id: string) => void
}

export interface RecipeFiltersProps {
  filter: RecipeFilter
  viewMode: ViewMode
  onFilterChange: (filter: RecipeFilter) => void
  onViewModeChange: (viewMode: ViewMode) => void
}
