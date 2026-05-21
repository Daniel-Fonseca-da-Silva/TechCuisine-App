"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { useTranslations } from "next-intl"
import { FiGlobe, FiMapPin } from "react-icons/fi"

export interface AnalyticsData {
  employed_count: number
  not_employed_count: number
  user_role_count: number
  business_role_count: number
  top_countries: { label: string; count: number }[]
  top_states: { label: string; count: number }[]
  subscriptions: { plan: string; status: string; count: number }[]
}

interface AdminAnalyticsChartsProps {
  data: AnalyticsData
}

const countryConfig: ChartConfig = {
  count: { label: "Users", color: "hsl(217, 91%, 60%)" },
}
const stateConfig: ChartConfig = {
  count: { label: "Users", color: "#a78bfa" },
}

function HorizontalBarChart({
  data,
  config,
  dataKey = "count",
  labelKey = "label",
}: {
  data: { label: string; count: number; fill?: string }[]
  config: ChartConfig
  dataKey?: string
  labelKey?: string
}) {
  return (
    <ChartContainer
      config={config}
      className="w-full [&_.recharts-cartesian-axis-tick_text]:fill-white"
      style={{ height: Math.max(120, data.length * 32) }}
    >
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey={labelKey}
          tick={{ fill: "#ffffff", fontSize: 11 }}
          width={90}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey={dataKey} radius={4} fill={`var(--color-${dataKey})`} />
      </BarChart>
    </ChartContainer>
  )
}

export function AdminAnalyticsCharts({ data }: AdminAnalyticsChartsProps) {
  const t = useTranslations("dashboard.admin")

  const countriesData = (data.top_countries ?? []).map((c) => ({
    label: c.label === "__unknown__" ? t("unknown") : c.label,
    count: c.count,
  }))

  const statesData = (data.top_states ?? []).map((s) => ({
    label: s.label === "__unknown__" ? t("unknown") : s.label,
    count: s.count,
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FiGlobe className="w-4 h-4 text-lime-400" />
            <CardTitle className="text-white/90 text-base">{t("topCountries")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {countriesData.length === 0 ? (
            <p className="text-white/50 text-sm">—</p>
          ) : (
            <HorizontalBarChart data={countriesData} config={countryConfig} />
          )}
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FiMapPin className="w-4 h-4 text-amber-400" />
            <CardTitle className="text-white/90 text-base">{t("topStates")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {statesData.length === 0 ? (
            <p className="text-white/50 text-sm">—</p>
          ) : (
            <HorizontalBarChart data={statesData} config={stateConfig} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
