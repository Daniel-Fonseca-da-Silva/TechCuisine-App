"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { useTranslations } from "next-intl"
import { FiUsers } from "react-icons/fi"
import type { AnalyticsData } from "./admin-analytics-charts"

interface AdminRolesSummaryProps {
  data: Pick<AnalyticsData, "employed_count" | "not_employed_count" | "user_role_count" | "business_role_count">
}

const rolesConfig: ChartConfig = {
  count: { label: "Count", color: "#34d399" },
}

const employmentConfig: ChartConfig = {
  count: { label: "Count", color: "hsl(217, 91%, 60%)" },
}

export function AdminRolesSummary({ data }: AdminRolesSummaryProps) {
  const t = useTranslations("dashboard.admin")

  const rolesData = [
    { label: t("userRole"), count: data.user_role_count },
    { label: t("businessRole"), count: data.business_role_count },
  ]

  const employmentData = [
    { label: t("employed"), count: data.employed_count },
    { label: t("notEmployed"), count: data.not_employed_count },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FiUsers className="w-4 h-4 text-green-400" />
            <CardTitle className="text-white/90 text-base">{t("roles")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={rolesConfig}
            className="h-[120px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-white"
          >
            <BarChart data={rolesData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: "#ffffff", fontSize: 11 }}
                width={80}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={4} fill="var(--color-count)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white/90 text-base">{t("employment")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={employmentConfig}
            className="h-[120px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-white"
          >
            <BarChart data={employmentData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: "#ffffff", fontSize: 11 }}
                width={100}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={4} fill="var(--color-count)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
