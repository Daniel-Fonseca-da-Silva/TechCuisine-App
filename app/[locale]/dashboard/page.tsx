"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardContent } from "@/components/features/dashboard-content"
import { useUserData } from "@/hooks/use-user-data"
import { DashboardNavContext } from "@/components/features/shared/dashboard-nav-context"
import { SubscriptionProvider } from "@/components/features/shared/subscription-context"
import { useLocale } from "@/hooks/use-locale"
import { primaryLocaleFromPreferences } from "@/lib/shared/user-locale"
import { useStripeCheckoutReturn } from "@/hooks/use-stripe-checkout-return"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const { userData, preferencesLanguage, isInitialLoading, error, refetch } = useUserData()
  const { locale, changeLocale } = useLocale()
  const [localeReady, setLocaleReady] = useState(false)
  const changeLocaleRef = useRef(changeLocale)
  useEffect(() => { changeLocaleRef.current = changeLocale }, [changeLocale])

  useEffect(() => {
    if (isInitialLoading) return
    if (preferencesLanguage === null) {
      // preferences unavailable — proceed with current locale
      setLocaleReady(true)
      return
    }
    const primary = primaryLocaleFromPreferences(preferencesLanguage)
    if (primary !== locale) {
      changeLocaleRef.current(primary)
      // page will remount with the correct locale; stay in spinner
    } else {
      setLocaleReady(true)
    }
  }, [isInitialLoading, preferencesLanguage, locale])

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  useStripeCheckoutReturn({
    onSyncComplete: () => handleSectionChange('plans'),
  })

  if (isInitialLoading || !localeReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Erro: {error}</div>
      </div>
    )
  }

  return (
    <DashboardNavContext.Provider value={{ navigateToSection: handleSectionChange }}>
      <SubscriptionProvider>
      <DashboardLayout
        userData={userData}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      >
        <DashboardContent
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isAdmin={userData?.admin === true}
          userRoles={userData?.roles}
          onUserDataRefetch={refetch}
        />
      </DashboardLayout>
      </SubscriptionProvider>
    </DashboardNavContext.Provider>
  )
}
