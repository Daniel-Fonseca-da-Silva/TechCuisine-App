'use client'

import { useSessionCheck } from '@/hooks/use-session-check'

/**
 * Component that automatically checks the session
 * Use this component in pages that need session verification
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  // Enable automatic session check
  useSessionCheck()
  
  return <>{children}</>
}
