export type RecipeStatus = 'pending' | 'canceled' | 'completed'
export type RecipeFilter = RecipeStatus | 'all'
export type ViewMode = 'grid' | 'list'

export interface IngredientLine {
  ingredient_id: string
  gross_quantity: string
  unit: string
  yield_factor: string
  sort_order?: number
}

export interface PreparationCost {
  label: string
  minutes: string
  hourly_labor_rate?: string | null
  fixed_cost?: string | null
}

export interface ScaledIngredientLine {
  ingredient_id: string
  gross_quantity: string
  net_quantity: string | null
  unit: string
  sort_order: number
  unit_cost_applied: string | null
  line_total_cost: string | null
}

export interface RecipeScaleResult {
  recipe_id: string
  reference_portions: number
  desired_portions: number
  factor: string
  ingredient_lines: ScaledIngredientLine[]
  total_ingredient_cost: string | null
  total_preparation_cost: string | null
  total_recipe_cost: string | null
  cost_per_portion: string | null
  selling_price_per_portion: string | null
  total_selling_price: string | null
}

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
  ingredient_lines?: IngredientLine[]
  preparation_costs?: PreparationCost[]
}

export interface RecipeCreatePayload {
  name: string
  description?: string | null
  reference_portions: number
  status?: RecipeStatus
  chef_notes?: string | null
  selling_price_per_portion?: string | null
  ingredient_lines?: IngredientLine[]
  preparation_costs?: PreparationCost[]
}

export interface RecipeUpdatePayload {
  name?: string
  description?: string | null
  reference_portions?: number
  status?: RecipeStatus
  chef_notes?: string | null
  selling_price_per_portion?: string | null
  ingredient_lines?: IngredientLine[]
  preparation_costs?: PreparationCost[]
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
  onEdit: (recipe: Recipe) => void
  onDelete: (recipe: Recipe) => void
}

export interface RecipeFiltersProps {
  filter: RecipeFilter
  viewMode: ViewMode
  onFilterChange: (filter: RecipeFilter) => void
  onViewModeChange: (viewMode: ViewMode) => void
}
