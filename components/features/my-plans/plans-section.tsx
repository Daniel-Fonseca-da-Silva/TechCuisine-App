"use client"

// Set to true to re-enable the full subscription experience.
const PLANS_SECTION_ENABLED = false

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlansSkeleton } from "./plans-skeleton"
import { FiCreditCard, FiCheck, FiAward, FiArrowRight, FiZap, FiClock, FiAlertCircle } from "react-icons/fi"
import { SectionBackButton } from "@/components/features/shared/section-back-button"
import { AiUsageProfileCard } from "@/components/features/profile/profile-ai-usage-card"
import { ErrorNoticeDialog } from "@/components/features/shared/error-notice-dialog"

interface PlansSectionProps {
  onSectionChange?: (section: string) => void
}

type SubscriptionPlan = 'free' | 'simple' | 'medium' | 'ultra' | 'business'

interface SubscriptionResponse {
  plan: SubscriptionPlan | string
  status: string
  current_period_start?: string | null
  current_period_end?: string | null
  cancel_at_period_end?: boolean
}

const MOCK_PLAN_DATA = {
  recipesUsed: '—',
} as const

function PlansSectionComingSoon({ onSectionChange }: PlansSectionProps) {
  const t = useTranslations('plans')
  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
            <FiCreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-white">{t('header.title')}</h1>
            <p className="text-white/70 text-sm lg:text-base hidden sm:block">{t('header.subtitle')}</p>
          </div>
        </div>
        {onSectionChange && (
          <SectionBackButton onClick={() => onSectionChange('dashboard')} />
        )}
      </div>
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-white/70 text-center text-base">{t('comingSoon')}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function PlansSectionActive({ onSectionChange }: PlansSectionProps) {
  const t = useTranslations('plans')
  const tRef = useRef(t)
  tRef.current = t
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBackToDashboard = () => {
    if (onSectionChange) {
      onSectionChange('dashboard')
    }
  }

  const fetchSubscription = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false
    try {
      if (!silent) {
        setError(null)
        setIsLoading(true)
      }

      const response = await fetch('/api/subscriptions/me', { cache: 'no-store' })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok || !payload?.success) {
        setSubscription(null)
        if (!silent && response.status !== 401) {
          setError(tRef.current('loadSubscriptionError'))
        }
        return
      }

      setSubscription(payload.data as SubscriptionResponse)
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe') === 'success') {
      const sessionId = params.get('session_id')

      // Clean up URL immediately to prevent re-triggering on refresh.
      const cleanUrl = new URL(window.location.href)
      cleanUrl.searchParams.delete('stripe')
      cleanUrl.searchParams.delete('session_id')
      window.history.replaceState({}, '', cleanUrl.toString())

      if (sessionId) {
        const doSync = async () => {
          try {
            await fetch('/api/subscriptions/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: sessionId }),
            })
          } catch {
            // Sync failure is non-critical; fetchSubscription loads current state.
          }
          await fetchSubscription().catch((e) => {
            console.error('Failed to fetch subscription after sync:', e)
            setError(tRef.current('loadSubscriptionError'))
            setIsLoading(false)
          })
        }
        doSync()
        return
      }
    }

    fetchSubscription().catch((e) => {
      console.error('Failed to fetch subscription:', e)
      setError(tRef.current('loadSubscriptionError'))
      setIsLoading(false)
    })
  }, [fetchSubscription])

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollingStartRef = useRef<number | null>(null)
  const POLLING_INTERVAL_MS = 5000
  const POLLING_MAX_MS = 90000

  useEffect(() => {
    if (isLoading || subscription?.status !== 'incomplete') {
      if (pollingRef.current !== null) {
        clearTimeout(pollingRef.current)
        pollingRef.current = null
        pollingStartRef.current = null
      }
      return
    }

    if (pollingStartRef.current === null) {
      pollingStartRef.current = Date.now()
    }

    const scheduleNext = () => {
      pollingRef.current = setTimeout(async () => {
        if (pollingStartRef.current !== null && Date.now() - pollingStartRef.current >= POLLING_MAX_MS) {
          pollingRef.current = null
          return
        }
        await fetchSubscription({ silent: true }).catch(() => {})
        scheduleNext()
      }, POLLING_INTERVAL_MS)
    }

    scheduleNext()

    return () => {
      if (pollingRef.current !== null) {
        clearTimeout(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [isLoading, subscription?.status, fetchSubscription])

  const activePlan = useMemo<SubscriptionPlan>(() => {
    const plan = subscription?.plan
    if (plan === 'simple' || plan === 'medium' || plan === 'ultra' || plan === 'business' || plan === 'free') return plan
    return 'free'
  }, [subscription?.plan])

  const isPaid = activePlan !== 'free'

  const paidPlanDef = useMemo(() => ({
    name: t('plans.techCuisine.name'),
    price: "€ 4,00",
    period: t('common.period'),
    features: t.raw('plans.techCuisine.features') as string[],
    current: isPaid,
  }), [isPaid, t])

  const currentPlan = useMemo(() => {
    const formatDate = (raw: string | null | undefined) => {
      if (!raw) return '—'
      const date = new Date(raw)
      if (Number.isNaN(date.getTime())) return '—'
      return date.toLocaleDateString()
    }

    const periodStart = formatDate(subscription?.current_period_start)
    const periodEnd = formatDate(subscription?.current_period_end)

    if (!isPaid) {
      return {
        name: t('plans.free.name'),
        price: "€ 0,00",
        period: t('common.period'),
        features: t.raw('plans.free.features') as string[],
        status: t('currentPlan.status'),
        periodStart,
        periodEnd,
      }
    }

    return {
      name: paidPlanDef.name,
      price: paidPlanDef.price,
      period: paidPlanDef.period,
      features: paidPlanDef.features,
      status: t('currentPlan.status'),
      periodStart,
      periodEnd,
    }
  }, [isPaid, paidPlanDef, subscription?.current_period_start, subscription?.current_period_end, t])

  const periodRemainingPercent = useMemo(() => {
    const startRaw = subscription?.current_period_start
    const endRaw = subscription?.current_period_end
    if (!startRaw || !endRaw) return 100

    const start = new Date(startRaw).getTime()
    const end = new Date(endRaw).getTime()
    const now = Date.now()

    if (Number.isNaN(start) || Number.isNaN(end)) return 100
    if (end <= start) return 100

    const total = end - start
    const remaining = end - now
    const ratio = remaining / total
    const clamped = Math.max(0, Math.min(1, ratio))
    return Math.round(clamped * 100)
  }, [subscription?.current_period_start, subscription?.current_period_end])

  const daysRemainingDisplay = useMemo(() => {
    const endRaw = subscription?.current_period_end
    if (!endRaw) return '—'

    const end = new Date(endRaw).getTime()
    if (Number.isNaN(end)) return '—'

    const now = Date.now()
    const msPerDay = 24 * 60 * 60 * 1000
    const days = Math.ceil((end - now) / msPerDay)
    if (days <= 0) return '0'
    return String(days)
  }, [subscription?.current_period_end])

  const handleCheckout = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      // Strip existing query params and hash so the success URL is clean.
      // Stripe replaces {CHECKOUT_SESSION_ID} with the real session ID on redirect.
      const baseUrl = window.location.href.split('?')[0].split('#')[0]
      const successUrl = `${baseUrl}?stripe=success&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = baseUrl

      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'simple',
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok || !payload?.success) {
        setError(t('checkoutError'))
        return
      }

      const checkoutUrl = payload?.data?.checkout_url as string | undefined
      if (!checkoutUrl) {
        setError(t('checkoutError'))
        return
      }

      window.location.href = checkoutUrl
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      const returnUrl = window.location.href.split('#')[0]

      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_url: returnUrl }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload?.success) {
        setError(t('portalError'))
        return
      }

      const portalUrl = payload?.data?.portal_url as string | undefined
      if (!portalUrl) {
        setError(t('portalError'))
        return
      }

      window.location.href = portalUrl
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <PlansSkeleton showBackButton={!!onSectionChange} />
  }

  return (
    <>
    <ErrorNoticeDialog
      open={!!error}
      onOpenChange={(open) => { if (!open) setError(null) }}
      description={error ?? ''}
      onRetry={fetchSubscription}
    />
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
            <FiCreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-white">{t('header.title')}</h1>
            <p className="text-white/70 text-sm lg:text-base hidden sm:block">{t('header.subtitle')}</p>
          </div>
        </div>

        {/* Back Button */}
        {onSectionChange && (
          <SectionBackButton onClick={handleBackToDashboard} />
        )}
      </div>

      {/* Processing Payment Alert */}
      {subscription?.status === 'incomplete' && (
        <div className="flex items-start space-x-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 px-4 py-3">
          <FiClock className="w-5 h-5 text-yellow-300 mt-0.5 shrink-0" />
          <p className="text-yellow-200 text-sm leading-relaxed">{t('processingPaymentNotice')}</p>
        </div>
      )}

      {/* Expired Subscription Alert */}
      {subscription !== null && activePlan === 'free' && subscription.status !== 'none' && subscription.status !== 'incomplete' && (
        <div className="flex items-start space-x-3 rounded-xl bg-red-400/10 border border-red-400/30 px-4 py-3">
          <FiAlertCircle className="w-5 h-5 text-red-300 mt-0.5 shrink-0" />
          <p className="text-red-200 text-sm leading-relaxed">{t('subscriptionExpiredNotice')}</p>
        </div>
      )}

      {/* AI Usage & Plans */}
      <AiUsageProfileCard />

      {/* Plano Atual */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FiAward className="w-5 h-5" />
            <span>{t('currentPlan.title')}</span>
          </CardTitle>
          <CardDescription className="text-white/70">
            {t('currentPlan.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">{currentPlan.name}</h3>
              {isPaid && (
                <>
                  <p className="text-white/70">{t('currentPlan.periodStart')}: {currentPlan.periodStart}</p>
                  <p className="text-white/70">{t('currentPlan.periodEnd')}: {currentPlan.periodEnd}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{currentPlan.price}</div>
              <div className="text-white/70">/{currentPlan.period}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <FiCheck className="w-4 h-4 text-green-400" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:space-y-0 space-y-3">
            <Button
              className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white"
              onClick={handleManageSubscription}
              disabled={isProcessing || !isPaid}
            >
              <FiZap className="w-4 h-4 mr-2" />
              {t('currentPlan.manageSubscription')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg lg:text-xl font-bold text-white mb-4">{t('availablePlans.title')}</h2>
        <div className="flex justify-center">
          <Card
            className={`relative w-full max-w-sm flex flex-col backdrop-blur-xl border-white/20 shadow-2xl transition-all duration-300 ${
              paidPlanDef.current
                ? 'bg-gradient-to-br from-green-400/20 to-emerald-400/20 border-green-400/30'
                : 'bg-white/10 hover:bg-white/15 hover:scale-105'
            }`}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-white text-xl">{paidPlanDef.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white">{paidPlanDef.price}</span>
                <span className="text-white/70">/{paidPlanDef.period}</span>
              </div>
              {paidPlanDef.current && (
                <div className="inline-flex items-center space-x-1 bg-green-400/20 text-green-300 px-3 py-1 rounded-full text-sm">
                  <FiCheck className="w-3 h-3" />
                  <span>{t('availablePlans.current')}</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="flex flex-1 flex-col space-y-4">
              <div className="space-y-2 flex-1">
                {paidPlanDef.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-2">
                    <FiCheck className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-white/90 text-sm leading-relaxed break-words">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full mt-auto ${
                  paidPlanDef.current
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white'
                }`}
                disabled={paidPlanDef.current || isProcessing || isLoading}
                onClick={handleCheckout}
              >
                {paidPlanDef.current ? t('availablePlans.current') : t('availablePlans.choosePlan')}
                {!paidPlanDef.current && <FiArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage Statistics */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">{t('usage.title')}</CardTitle>
          <CardDescription className="text-white/70">
            {t('usage.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{MOCK_PLAN_DATA.recipesUsed}</div>
              <div className="text-white/70 text-sm">{t('usage.recipesUsed')}</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full" style={{width: '40%'}}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{daysRemainingDisplay}</div>
              <div className="text-white/70 text-sm">{t('usage.daysRemaining')}</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full" style={{ width: `${periodRemainingPercent}%` }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}

export function PlansSection(props: PlansSectionProps) {
  return PLANS_SECTION_ENABLED ? <PlansSectionActive {...props} /> : <PlansSectionComingSoon {...props} />
}
