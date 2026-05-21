'use client'

import { useState, useEffect } from 'react'
import {
  getCookieConsent,
  getCookiePreferences,
  setCookieConsent,
  setCookiePreferences,
} from '@/lib/cookies'

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always active
  analytics: false,
  marketing: false,
  functional: false,
}

export function useCookieConsent() {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null)
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedConsent = getCookieConsent()
    const storedPreferences = getCookiePreferences()

    if (storedConsent === 'true') {
      setConsentGiven(true)
    } else {
      setConsentGiven(false)
    }

    if (storedPreferences) {
      try {
        const parsed = JSON.parse(storedPreferences)
        setPreferences({
          ...defaultPreferences,
          ...parsed,
          necessary: true,
        })
      } catch {
        setPreferences(defaultPreferences)
      }
    }

    setIsLoading(false)
  }, [])

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    setConsentGiven(true)
    setPreferences(allAccepted)
    setCookieConsent('true')
    setCookiePreferences(allAccepted)
  }

  const rejectAll = () => {
    setConsentGiven(true)
    setPreferences(defaultPreferences)
    setCookieConsent('true')
    setCookiePreferences(defaultPreferences)
  }

  const savePreferences = (newPreferences: CookiePreferences) => {
    const updated = {
      ...newPreferences,
      necessary: true,
    }
    setConsentGiven(true)
    setPreferences(updated)
    setCookieConsent('true')
    setCookiePreferences(updated)
  }

  return {
    consentGiven,
    preferences,
    isLoading,
    acceptAll,
    rejectAll,
    savePreferences,
  }
}
