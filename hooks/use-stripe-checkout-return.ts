"use client"

import { useEffect, useRef } from 'react'

interface Options {
  onSyncComplete?: () => void
}

/**
 * Detects ?stripe=success&session_id=cs_... on mount, runs the sync call, and
 * cleans up the URL — regardless of which dashboard section is active.
 */
export function useStripeCheckoutReturn({ onSyncComplete }: Options = {}) {
  const onSyncCompleteRef = useRef(onSyncComplete)
  useEffect(() => { onSyncCompleteRef.current = onSyncComplete }, [onSyncComplete])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe') !== 'success') return

    const sessionId = params.get('session_id')

    const cleanUrl = new URL(window.location.href)
    cleanUrl.searchParams.delete('stripe')
    cleanUrl.searchParams.delete('session_id')
    window.history.replaceState({}, '', cleanUrl.toString())

    if (!sessionId) return

    fetch('/api/subscriptions/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .catch(() => {})
      .finally(() => {
        onSyncCompleteRef.current?.()
      })
  }, [])
}
