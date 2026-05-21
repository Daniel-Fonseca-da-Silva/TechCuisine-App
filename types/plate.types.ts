export type BCGQuadrant = 'star' | 'plowhorse' | 'puzzle' | 'dog'

export interface Plate {
  id: string
  user_id: string
  name: string
  description?: string | null
  menu_section?: string | null
  recipe_id?: string | null
  selling_price?: string | null
  currency: string
  target_food_cost_pct?: string | null
  suggested_selling_price?: string | null
  computed_food_cost_pct?: string | null
  bcg_quadrant?: BCGQuadrant | null
  popularity_score?: string | null
  active: boolean
}

export interface PaginatedPlateResponse {
  items: Plate[]
  next_cursor: string | null
}

export interface PlateCreatePayload {
  name: string
  description?: string | null
  menu_section?: string | null
  selling_price?: string | null
  currency?: string
  target_food_cost_pct?: string | null
  active?: boolean
}

export interface PlateUpdatePayload {
  name?: string
  description?: string | null
  menu_section?: string | null
  selling_price?: string | null
  currency?: string
  target_food_cost_pct?: string | null
  active?: boolean
}

export interface PlateSectionProps {
  onSectionChange?: (section: string) => void
}
