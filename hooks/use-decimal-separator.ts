"use client"

import { useEffect, useState } from "react"
import { DecimalSeparator, normalizeDecimalSeparator } from "@/lib/format-decimal"

/**
 * Decimal separator for numeric display: user preferences (`/api/preferences`)
 * when available, otherwise the schema default (`","`).
 */
export function useDecimalSeparator(): DecimalSeparator {
  const [separator, setSeparator] = useState<DecimalSeparator>(() =>
    normalizeDecimalSeparator(undefined),
  )

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch("/api/preferences", { cache: "no-store" })
        const body = (await res.json()) as {
          success?: boolean
          data?: { decimal_separator?: string }
        }
        if (cancelled || !res.ok || !body?.success) return
        setSeparator(normalizeDecimalSeparator(body.data?.decimal_separator))
      } catch {
        /* keep default */
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return separator
}
