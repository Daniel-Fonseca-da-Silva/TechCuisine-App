"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { AdminDashboardStats } from "./admin-section"

interface AdminStatsProps {
  stats: AdminDashboardStats | null
  isLoading?: boolean
}

const chartConfig = {
  users:        { label: "Users",        color: "hsl(217, 91%, 60%)" },
  ingredients:  { label: "Ingredients",  color: "#34d399" },
  recipes:      { label: "Recipes",      color: "#f59e0b" },
  plates:       { label: "Plates",       color: "#a78bfa" },
  suppliers:    { label: "Suppliers",    color: "#f87171" },
  sales_records:{ label: "Sales",        color: "#38bdf8" },
}

export function AdminStats({ stats, isLoading }: AdminStatsProps) {
  const t = useTranslations("dashboard.admin")

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 lg:p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader><div className="h-4 w-20 bg-white/20 rounded animate-pulse" /></CardHeader>
            <CardContent><div className="h-7 w-12 bg-white/20 rounded animate-pulse" /></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const countCards = [
    { label: t("usersCount"),        value: stats.users },
    { label: t("ingredientsCount"),  value: stats.ingredients },
    { label: t("recipesCount"),      value: stats.recipes },
    { label: t("platesCount"),       value: stats.plates },
    { label: t("suppliersCount"),    value: stats.suppliers },
    { label: t("salesRecordsCount"), value: stats.sales_records },
  ]

  const monetaryCards = [
    { label: t("totalSales"),      value: `€ ${parseFloat(stats.total_sales_line_total || "0").toFixed(2)}` },
    { label: t("totalRecipeCost"), value: `€ ${parseFloat(stats.total_recipe_cost || "0").toFixed(2)}` },
  ]

  const chartData = [
    { name: t("usersCount"),        value: stats.users,         fill: "var(--color-users)" },
    { name: t("ingredientsCount"),  value: stats.ingredients,   fill: "var(--color-ingredients)" },
    { name: t("recipesCount"),      value: stats.recipes,       fill: "var(--color-recipes)" },
    { name: t("platesCount"),       value: stats.plates,        fill: "var(--color-plates)" },
    { name: t("suppliersCount"),    value: stats.suppliers,     fill: "var(--color-suppliers)" },
    { name: t("salesRecordsCount"), value: stats.sales_records, fill: "var(--color-sales_records)" },
  ]

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Count KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {countCards.map((card) => (
          <Card key={card.label} className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white/90 text-xs uppercase tracking-wide">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monetary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {monetaryCards.map((card) => (
          <Card key={card.label} className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white/90 text-xs uppercase tracking-wide">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white/90">{t("stats")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="h-[200px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-white"
          >
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
