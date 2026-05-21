export type SupplierType = 'distributor' | 'producer' | 'other'

export interface Supplier {
  id: string
  user_id: string
  name: string
  supplier_type: SupplierType
  contact_phone: string | null
  contact_email: string | null
  address: string | null
  notes: string | null
  active: boolean
}

export interface PaginatedSupplierResponse {
  items: Supplier[]
  next_cursor: string | null
}

export interface SupplierCreatePayload {
  name: string
  supplier_type?: SupplierType
  contact_phone?: string | null
  contact_email?: string | null
  address?: string | null
  notes?: string | null
  active?: boolean
}

export interface SupplierUpdatePayload {
  name?: string
  supplier_type?: SupplierType
  contact_phone?: string | null
  contact_email?: string | null
  address?: string | null
  notes?: string | null
  active?: boolean
}

export interface SupplierSectionProps {
  onSectionChange?: (section: string) => void
}
