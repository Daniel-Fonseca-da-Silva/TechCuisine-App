"use client"

import { useTranslations } from "next-intl"
import { FiCreditCard } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/components/features/shared/subscription-context"
import { useDashboardNav } from "@/components/features/shared/dashboard-nav-context"

export function TrialSubscriptionBanner() {
  const { isPremiumActive, status, isLoading } = useSubscription()
  const t = useTranslations("subscription.trialBanner")
  const dashboardNav = useDashboardNav()

  if (isLoading || isPremiumActive || status !== 'none') return null

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-400/10 border border-blue-400/30 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <FiCreditCard className="w-5 h-5 text-blue-300 shrink-0" />
        <p className="text-blue-200 text-sm leading-relaxed">{t("message")}</p>
      </div>
      {dashboardNav && (
        <Button
          size="sm"
          onClick={() => dashboardNav.navigateToSection("plans")}
          className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white border-0 text-sm"
        >
          {t("cta")}
        </Button>
      )}
    </div>
  )
}
