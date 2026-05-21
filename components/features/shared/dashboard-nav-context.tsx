"use client"

import { createContext, useContext } from "react"

interface DashboardNavContextValue {
  navigateToSection: (id: string) => void
}

export const DashboardNavContext = createContext<DashboardNavContextValue | null>(null)

export function useDashboardNav() {
  return useContext(DashboardNavContext)
}
