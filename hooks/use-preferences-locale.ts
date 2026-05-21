"use client"

import { useEffect, useState } from "react"
import { normalizeIsoCurrency, resolveDefaultCurrencyFromEnv } from "@/lib/app-currency"
import { DecimalSeparator, normalizeDecimalSeparator } from "@/lib/format-decimal"

export interface PreferencesLocale {
  language: string[]
  currency: string
  decimalSeparator: DecimalSeparator
}

function defaultLocale(): PreferencesLocale {
  return {
    language: ["en"],
    currency: resolveDefaultCurrencyFromEnv(),
    decimalSeparator: normalizeDecimalSeparator(undefined),
  }
}

/**
 * Fetches /api/preferences once and returns language, currency, and decimal
 * separator together — avoids three separate requests for the same endpoint.
 */
export function usePreferencesLocale(): PreferencesLocale {
  const [locale, setLocale] = useState<PreferencesLocale>(defaultLocale)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch("/api/preferences", { cache: "no-store" })
        const body = (await res.json()) as {
          success?: boolean
          data?: { language?: string[]; currency?: string; decimal_separator?: string }
        }
        if (cancelled || !res.ok || !body?.success || !body.data) return
        const { language, currency, decimal_separator } = body.data
        setLocale({
          language: Array.isArray(language) && language.length > 0 ? language : ["en"],
          currency: normalizeIsoCurrency(currency) ?? resolveDefaultCurrencyFromEnv(),
          decimalSeparator: normalizeDecimalSeparator(decimal_separator),
        })
      } catch {
        /* keep defaults */
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return locale
}
