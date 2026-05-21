import { useState, useCallback } from "react"
import {
  Supplier,
  PaginatedSupplierResponse,
  SupplierCreatePayload,
  SupplierUpdatePayload,
} from "@/types/supplier.types"

interface UseSuppliersReturn {
  suppliers: Supplier[]
  loading: boolean
  mutationLoading: boolean
  error: string | null
  loadAll: () => Promise<void>
  getFilteredSuppliers: (search: string) => Supplier[]
  create: (payload: SupplierCreatePayload) => Promise<{ supplier: Supplier | null; error: string | null }>
  update: (id: string, patch: SupplierUpdatePayload) => Promise<{ supplier: Supplier | null; error: string | null }>
  remove: (id: string) => Promise<{ success: boolean; error: string | null }>
  reload: () => Promise<void>
}

function sortAlphabetically(items: Supplier[]): Supplier[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

export function useSuppliers(): UseSuppliersReturn {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [mutationLoading, setMutationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const allItems: Supplier[] = []
      let cursor: string | undefined = undefined

      while (true) {
        const params = new URLSearchParams({ limit: '100' })
        if (cursor) params.set('cursor', cursor)

        const response = await fetch(`/api/suppliers?${params}`)
        const json = (await response.json()) as {
          success: boolean
          data?: PaginatedSupplierResponse
          error?: string
        }

        if (!json.success || !json.data) {
          setError(json.error ?? 'Failed to load suppliers')
          return
        }

        allItems.push(...json.data.items)

        if (!json.data.next_cursor) break
        cursor = json.data.next_cursor
      }

      setSuppliers(sortAlphabetically(allItems))
    } catch {
      setError('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [])

  const reload = loadAll

  const getFilteredSuppliers = useCallback(
    (search: string) => {
      if (!search.trim()) return suppliers
      const lower = search.toLowerCase()
      return suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.supplier_type.toLowerCase().includes(lower) ||
          (s.contact_email && s.contact_email.toLowerCase().includes(lower))
      )
    },
    [suppliers]
  )

  const create = useCallback(async (payload: SupplierCreatePayload) => {
    setMutationLoading(true)
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await response.json()) as { success: boolean; data?: Supplier; error?: string }
      if (!json.success || !json.data) {
        return { supplier: null, error: json.error ?? 'Failed to create supplier' }
      }
      setSuppliers((prev) => sortAlphabetically([...prev, json.data!]))
      return { supplier: json.data, error: null }
    } catch {
      return { supplier: null, error: 'Failed to create supplier' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  const update = useCallback(async (id: string, patch: SupplierUpdatePayload) => {
    setMutationLoading(true)
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = (await response.json()) as { success: boolean; data?: Supplier; error?: string }
      if (!json.success || !json.data) {
        return { supplier: null, error: json.error ?? 'Failed to update supplier' }
      }
      setSuppliers((prev) => sortAlphabetically(prev.map((s) => (s.id === id ? json.data! : s))))
      return { supplier: json.data, error: null }
    } catch {
      return { supplier: null, error: 'Failed to update supplier' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    setMutationLoading(true)
    try {
      const response = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
      const json = (await response.json()) as { success: boolean; error?: string }
      if (!json.success) {
        return { success: false, error: json.error ?? 'Failed to delete supplier' }
      }
      setSuppliers((prev) => prev.filter((s) => s.id !== id))
      return { success: true, error: null }
    } catch {
      return { success: false, error: 'Failed to delete supplier' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  return { suppliers, loading, mutationLoading, error, loadAll, getFilteredSuppliers, create, update, remove, reload }
}
