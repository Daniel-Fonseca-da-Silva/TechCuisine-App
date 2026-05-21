export interface SalesRecord {
  id: string
  user_id: string
  plate_id: string
  sold_at: string
  quantity: number
  unit_price: string
  line_total: string
  currency: string
  channel: string | null
}

export interface PaginatedSalesRecordResponse {
  items: SalesRecord[]
  next_cursor: string | null
}

export interface SalesRecordCreatePayload {
  plate_id: string
  sold_at: string
  quantity: number
  unit_price: string
  currency?: string
  channel?: string | null
}

export interface SalesRecordSectionProps {
  onSectionChange?: (section: string) => void
}
