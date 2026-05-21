"use client"

import { useEffect, useState } from "react"
import { normalizeIsoCurrency, resolveDefaultCurrencyFromEnv } from "@/lib/app-currency"

/**
 * Currency for monetary fields: user preferences (`/api/preferences`) when available,
 * otherwise `NEXT_PUBLIC_DEFAULT_CURRENCY`, then EUR.
 */
export function useAppCurrency(): string {
  const [currency, setCurrency] = useState(resolveDefaultCurrencyFromEnv)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch("/api/preferences", { cache: "no-store" })
        const body = (await res.json()) as { success?: boolean; data?: { currency?: string } }
        if (cancelled || !res.ok || !body?.success) return
        const fromPrefs = normalizeIsoCurrency(body.data?.currency)
        if (fromPrefs) setCurrency(fromPrefs)
      } catch {
        /* keep env default */
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return currency
}
