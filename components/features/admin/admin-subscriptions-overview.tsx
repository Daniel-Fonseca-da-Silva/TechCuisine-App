"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { useTranslations } from "next-intl"
import { FiCreditCard } from "react-icons/fi"
import type { AnalyticsData } from "./admin-analytics-charts"

interface AdminSubscriptionsOverviewProps {
  data: Pick<AnalyticsData, "subscriptions">
}

// Map subscription statuses to a short colour token
const STATUS_COLORS: Record<string, string> = {
  active: "#34d399",
  trialing: "#60a5fa",
  past_due: "#f59e0b",
  canceled: "#f87171",
  paused: "#a78bfa",
}

function buildChartData(subscriptions: AnalyticsData["subscriptions"]) {
  // Group by plan → { plan, [status]: count }
  const byPlan: Record<string, Record<string, number>> = {}
  const statuses = new Set<string>()
  for (const item of subscriptions) {
    byPlan[item.plan] ??= {}
    byPlan[item.plan][item.status] = (byPlan[item.plan][item.status] ?? 0) + item.count
    statuses.add(item.status)
  }
  const rows = Object.entries(byPlan).map(([plan, counts]) => ({ plan, ...counts }))
  return { rows, statuses: Array.from(statuses) }
}

export function AdminSubscriptionsOverview({ data }: AdminSubscriptionsOverviewProps) {
  const t = useTranslations("dashboard.admin")

  const { rows, statuses } = buildChartData(data.subscriptions ?? [])

  const config: ChartConfig = Object.fromEntries(
    statuses.map((s) => [s, { label: s, color: STATUS_COLORS[s] ?? "#94a3b8" }])
  )

  if (rows.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FiCreditCard className="w-4 h-4 text-lime-400" />
            <CardTitle className="text-white/90 text-base">{t("subscriptions")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/50 text-sm">—</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FiCreditCard className="w-4 h-4 text-lime-400" />
          <CardTitle className="text-white/90 text-base">{t("subscriptions")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          className="w-full [&_.recharts-cartesian-axis-tick_text]:fill-white"
          style={{ height: Math.max(160, rows.length * 48) }}
        >
          <BarChart data={rows} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="plan"
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }} />
            {statuses.map((s) => (
              <Bar
                key={s}
                dataKey={s}
                stackId="a"
                fill={STATUS_COLORS[s] ?? "#94a3b8"}
                radius={statuses.indexOf(s) === statuses.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
