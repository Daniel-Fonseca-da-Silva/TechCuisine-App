"use client"

import { useTranslations } from "next-intl"
import { FiZap } from "react-icons/fi"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDashboardNav } from "@/components/features/shared/dashboard-nav-context"

interface ErrorNoticeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  onRetry?: () => void
}

export function ErrorNoticeDialog({
  open,
  onOpenChange,
  title,
  description,
  onRetry,
}: ErrorNoticeDialogProps) {
  const t = useTranslations("errorDialog")
  const dashboardNav = useDashboardNav()

  const normalized = description.toLowerCase()

  const isPlanLimit = normalized.includes("plan limit exceeded")

  const isSubscriptionFeature =
    !isPlanLimit &&
    normalized.includes("not available for your subscription plan")

  const isRateLimit =
    !isPlanLimit &&
    !isSubscriptionFeature &&
    (normalized.includes("rate limit") ||
      normalized.includes("429") ||
      normalized.includes("too many"))

  if (isRateLimit) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="bg-gray-900 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {t("rateLimit.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {t("rateLimitHint")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0"
            >
              {t("ok")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (isPlanLimit) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="bg-gray-900 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <FiZap className="text-orange-400 shrink-0" />
              {t("planLimit.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70 whitespace-pre-line space-y-2">
              <span className="block">{t("planLimit.lead")}</span>
              <span className="block">{t("planLimit.resetHint")}</span>
              <span className="block">{t("planLimit.upgradeHint")}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {dashboardNav ? (
              <AlertDialogCancel
                onClick={() => {
                  dashboardNav.navigateToSection("plans")
                  onOpenChange(false)
                }}
                className="border-orange-400/50 bg-orange-400/10 text-orange-300 hover:bg-orange-400/20 hover:text-orange-200"
              >
                {t("planLimit.upgradeCta")}
              </AlertDialogCancel>
            ) : (
              <span className="text-sm text-white/50 self-center">{t("planLimit.upgradeCta")}</span>
            )}
            <AlertDialogAction
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0"
            >
              {t("ok")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (isSubscriptionFeature) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="bg-gray-900 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <FiZap className="text-orange-400 shrink-0" />
              {t("subscriptionFeature.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70 whitespace-pre-line space-y-2">
              <span className="block">{t("subscriptionFeature.lead")}</span>
              <span className="block">{t("subscriptionFeature.upgradeHint")}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {dashboardNav ? (
              <AlertDialogCancel
                onClick={() => {
                  dashboardNav.navigateToSection("plans")
                  onOpenChange(false)
                }}
                className="border-orange-400/50 bg-orange-400/10 text-orange-300 hover:bg-orange-400/20 hover:text-orange-200"
              >
                {t("subscriptionFeature.upgradeCta")}
              </AlertDialogCancel>
            ) : (
              <span className="text-sm text-white/50 self-center">{t("subscriptionFeature.upgradeCta")}</span>
            )}
            <AlertDialogAction
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0"
            >
              {t("ok")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 border-white/20 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            {title ?? t("title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/70 whitespace-pre-line">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {onRetry && (
            <AlertDialogCancel
              onClick={onRetry}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              {t("retry")}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white border-0"
          >
            {t("ok")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
