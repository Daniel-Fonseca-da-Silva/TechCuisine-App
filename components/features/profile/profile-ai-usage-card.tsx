"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { FiZap } from "react-icons/fi"
import { useAiUsage, type AiUsage } from "@/hooks/use-ai-usage"
import { ErrorNoticeDialog } from "@/components/features/shared/error-notice-dialog"


export function toPercent(used: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min(Math.round((used / limit) * 100), 100)
}

export function buildRadialData(usage: AiUsage) {
  const pct = toPercent(usage.used, usage.limit)
  return [{ name: "used", value: pct, fill: "var(--color-used)" }]
}

export function buildBarData(usage: AiUsage) {
  return [
    { name: "used", value: usage.used, fill: "var(--color-used)" },
    { name: "remaining", value: usage.remaining, fill: "var(--color-remaining)" },
  ]
}

export function formatPeriod(period: string): string {
  // period arrives as e.g. "2024-03" — format as "Mar 2024"
  const parts = period.split("-")
  if (parts.length === 2) {
    const [year, month] = parts
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
  }
  return period
}

// --- Skeleton ---

function UsageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-1/3 rounded bg-white/10" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-[220px] rounded-xl bg-white/10" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
      <p className="text-xs text-white/50 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

const radialConfig: ChartConfig = {
  used: { label: "Used", color: "#a78bfa" },
}

const barConfig: ChartConfig = {
  used: { label: "Used", color: "#a78bfa" },
  remaining: { label: "Remaining", color: "#34d399" },
}

function NormalUsageContent({
  usage,
  t,
  plansT,
}: {
  usage: AiUsage
  t: ReturnType<typeof useTranslations>
  plansT: ReturnType<typeof useTranslations>
}) {
  const pct = toPercent(usage.used, usage.limit)
  const radialData = buildRadialData(usage)
  const barData = buildBarData(usage)
  const translatedPlanName = (() => {
    try {
      const key = `${usage.plan}.name`
      const result = plansT(key)
      return result === key ? usage.plan : result
    } catch {
      return usage.plan
    }
  })()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radial gauge */}
        <div className="flex flex-col items-center justify-center">
          <ChartContainer config={radialConfig} className="h-[220px] w-full">
            <RadialBarChart
              data={radialData}
              innerRadius={60}
              outerRadius={100}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                formatter={(value: number | string) => [`${value}%`, t("usedLabel")]}
              />
            </RadialBarChart>
          </ChartContainer>
          <p className="text-2xl font-bold text-white -mt-10">{pct}%</p>
          <p className="text-xs text-white/50 mt-1">{t("usedLabel")}</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-2 content-start">
          <MetricCard label={t("usedLabel")} value={usage.used} />
          <MetricCard label={t("remainingLabel")} value={usage.remaining} />
          <MetricCard label={t("limitLabel")} value={usage.limit} />
          <MetricCard label={t("periodLabel")} value={formatPeriod(usage.period)} />
          <div className="col-span-2">
            <MetricCard label={t("planLabel")} value={translatedPlanName} />
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <ChartContainer
        config={barConfig}
        className="h-[100px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-white"
      >
        <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tickFormatter={(v: string) => (v === "used" ? t("usedLabel") : t("remainingLabel"))}
            tick={{ fill: "#ffffff", fontSize: 11 }}
            width={70}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

// --- Main card ---

export function AiUsageProfileCard() {
  const t = useTranslations("profileAiUsage")
  const plansT = useTranslations("plans.plans")
  const { usage, isLoading, isError, refetch } = useAiUsage()

  return (
    <>
    <ErrorNoticeDialog
      open={!isLoading && isError}
      onOpenChange={() => {}}
      description={t("error")}
      onRetry={refetch}
    />
    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FiZap className="w-4 h-4 text-amber-400" />
          <CardTitle className="text-white">{t("title")}</CardTitle>
        </div>
        <CardDescription className="text-white/60">{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <UsageSkeleton />}

        {!isLoading && !isError && usage && usage.limit < 0 && (
          <div className="flex items-center gap-2 py-4">
            <FiZap className="text-yellow-400 shrink-0" />
            <span className="text-white/80 text-sm">{t("unlimited")}</span>
          </div>
        )}

        {!isLoading && !isError && usage && usage.limit === 0 && (
          <div className="flex items-center gap-2 py-4">
            <FiZap className="text-white/30 shrink-0" />
            <span className="text-white/60 text-sm">{t("noPlan")}</span>
          </div>
        )}

        {!isLoading && !isError && usage && usage.limit > 0 && (
          <NormalUsageContent usage={usage} t={t} plansT={plansT} />
        )}
      </CardContent>
    </Card>
    </>
  )
}
