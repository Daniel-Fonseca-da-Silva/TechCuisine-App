export type PriceSource = 'manual' | 'invoice' | 'api'

export interface PriceObservation {
  id: string
  user_id: string
  ingredient_id: string
  supplier_id: string | null
  observed_at: string
  unit: string
  price_per_unit: string
  currency: string
  pack_label: string | null
  source: PriceSource
}

export interface BestPrice {
  rank: number
  supplier_id: string | null
  price_per_unit: string
  unit: string
  currency: string
  observed_at: string
  pack_label: string | null
}

export interface PriceObservationCreatePayload {
  observed_at: string
  unit: string
  price_per_unit: string
  currency: string
  pack_label?: string | null
  supplier_id?: string | null
  source?: PriceSource
}

export interface PriceHistoryFilters {
  from?: string
  to?: string
  supplier_id?: string
  limit?: number
}

export interface PriceObservationSectionProps {
  onSectionChange?: (section: string) => void
}
