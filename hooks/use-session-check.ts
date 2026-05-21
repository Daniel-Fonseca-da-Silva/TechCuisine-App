'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './use-auth'

/**
 * Hook that automatically checks the session on route changes
 * and browser events
 */
export function useSessionCheck() {
  const { authenticated, checkSession } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check session whenever the route changes
    checkSession()
  }, [pathname, checkSession])

  useEffect(() => {
    // Check session when the page gains focus
    const handleFocus = () => {
      checkSession()
    }

    // Check session when the page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSession()
      }
    }

    // Check session when the user interacts with the page
    const handleUserInteraction = () => {
      checkSession()
    }

    // Add listeners
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [checkSession])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      router.push('/auth/login')
    }
  }, [authenticated, router])
}
