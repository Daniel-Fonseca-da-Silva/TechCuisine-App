import { useState, useCallback } from "react"
import {
  SalesRecord,
  PaginatedSalesRecordResponse,
  SalesRecordCreatePayload,
} from "@/types/sales-record.types"

interface UseSalesRecordsReturn {
  records: SalesRecord[]
  loading: boolean
  mutationLoading: boolean
  error: string | null
  loadAll: () => Promise<void>
  getFilteredRecords: (search: string, plateNameMap?: Map<string, string>) => SalesRecord[]
  create: (payload: SalesRecordCreatePayload) => Promise<{ record: SalesRecord | null; error: string | null }>
  reload: () => Promise<void>
}

function sortByDateDesc(items: SalesRecord[]): SalesRecord[] {
  return [...items].sort((a, b) => new Date(b.sold_at).getTime() - new Date(a.sold_at).getTime())
}

export function useSalesRecords(): UseSalesRecordsReturn {
  const [records, setRecords] = useState<SalesRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [mutationLoading, setMutationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const allItems: SalesRecord[] = []
      let cursor: string | undefined = undefined

      while (true) {
        const params = new URLSearchParams({ limit: '100' })
        if (cursor) params.set('cursor', cursor)

        const response = await fetch(`/api/sales-records?${params}`)
        const json = (await response.json()) as {
          success: boolean
          data?: PaginatedSalesRecordResponse
          error?: string
        }

        if (!json.success || !json.data) {
          setError(json.error ?? 'Failed to load sales records')
          return
        }

        allItems.push(...json.data.items)

        if (!json.data.next_cursor) break
        cursor = json.data.next_cursor
      }

      setRecords(sortByDateDesc(allItems))
    } catch {
      setError('Failed to load sales records')
    } finally {
      setLoading(false)
    }
  }, [])

  const reload = loadAll

  const getFilteredRecords = useCallback(
    (search: string, plateNameMap?: Map<string, string>) => {
      if (!search.trim()) return records
      const lower = search.toLowerCase()
      return records.filter((r) => {
        if (r.channel?.toLowerCase().includes(lower)) return true
        if (r.plate_id.toLowerCase().includes(lower)) return true
        const plateName = plateNameMap?.get(r.plate_id)
        if (plateName?.toLowerCase().includes(lower)) return true
        return false
      })
    },
    [records]
  )

  const create = useCallback(async (payload: SalesRecordCreatePayload) => {
    setMutationLoading(true)
    try {
      const response = await fetch('/api/sales-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await response.json()) as { success: boolean; data?: SalesRecord; error?: string }
      if (!json.success || !json.data) {
        return { record: null, error: json.error ?? 'Failed to create sales record' }
      }
      setRecords((prev) => sortByDateDesc([...prev, json.data!]))
      return { record: json.data, error: null }
    } catch {
      return { record: null, error: 'Failed to create sales record' }
    } finally {
      setMutationLoading(false)
    }
  }, [])

  return { records, loading, mutationLoading, error, loadAll, getFilteredRecords, create, reload }
}
