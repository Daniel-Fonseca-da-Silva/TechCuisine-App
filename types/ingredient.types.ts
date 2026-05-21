export interface Ingredient {
  id: string
  user_id: string
  name: string
  category?: string | null
  purchase_unit: string
  density_or_pack_notes?: string | null
  tags: string[]
  active: boolean
  last_price_per_unit?: number | string | null
  last_price_currency?: string | null
  supplier_ids?: string[]
}

export interface PaginatedIngredientResponse {
  items: Ingredient[]
  next_cursor: string | null
}

export interface IngredientCreatePayload {
  name: string
  purchase_unit: string
  category?: string | null
  density_or_pack_notes?: string | null
  tags?: string[]
  active?: boolean
  last_price_per_unit?: number | null
  last_price_currency?: string | null
  supplier_ids?: string[]
}

export interface IngredientUpdatePayload {
  name?: string
  purchase_unit?: string
  category?: string | null
  density_or_pack_notes?: string | null
  tags?: string[]
  active?: boolean
  last_price_per_unit?: number | null
  last_price_currency?: string | null
  supplier_ids?: string[]
}

export interface IngredientSectionProps {
  onSectionChange?: (section: string) => void
}

export interface SuggestedPriceInfo {
  price_per_unit: number
  currency: string
  unit: string
  pack_label?: string | null
  disclaimer: string
}

export interface IngredientAiSuggestion {
  name: string
  purchase_unit: string
  category?: string | null
  density_or_pack_notes?: string | null
  tags: string[]
  active: boolean
  suggested_price?: SuggestedPriceInfo | null
}

export interface IngredientAiSuggestionRequest {
  ingredient_name: string
  language?: string[]
  currency?: string
  decimal_separator?: ',' | '.'
}

export interface IngredientAiMarketResponse {
  suggestion: IngredientAiSuggestion
  settings_notice: string | null
}
