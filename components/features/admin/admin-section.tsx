"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { FiDownload } from "react-icons/fi"
import { AdminStats } from "./admin-stats"
import { AdminUsersList } from "./admin-users-list"
import { AdminAnalyticsCharts, type AnalyticsData } from "./admin-analytics-charts"
import { AdminRolesSummary } from "./admin-roles-summary"
import { AdminSubscriptionsOverview } from "./admin-subscriptions-overview"

export interface AdminDashboardStats {
  users: number
  ingredients: number
  recipes: number
  plates: number
  suppliers: number
  sales_records: number
  total_sales_line_total: string
  total_recipe_cost: string
}

interface AdminSectionProps {
  onSectionChange: (section: string) => void
  onAccessDenied: () => void
}

async function fetchDashboard(): Promise<AdminDashboardStats> {
  const res = await fetch("/api/admin/dashboard")
  const data = await res.json()
  if (res.status === 403) throw new Error("FORBIDDEN")
  if (!res.ok) throw new Error(data?.error || "Failed to fetch dashboard")
  return {
    users: data.users ?? 0,
    ingredients: data.ingredients ?? 0,
    recipes: data.recipes ?? 0,
    plates: data.plates ?? 0,
    suppliers: data.suppliers ?? 0,
    sales_records: data.sales_records ?? 0,
    total_sales_line_total: data.total_sales_line_total ?? "0",
    total_recipe_cost: data.total_recipe_cost ?? "0",
  }
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch("/api/admin/analytics")
  const data = await res.json()
  if (res.status === 403) throw new Error("FORBIDDEN")
  if (!res.ok) throw new Error(data?.error || "Failed to fetch analytics")
  return data
}

async function toggleAdmin(userId: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  })
  const data = await res.json()
  if (res.status === 403) throw new Error("FORBIDDEN")
  if (!res.ok) throw new Error(data?.error || "Failed to toggle admin")
}

export function AdminSection({ onAccessDenied }: AdminSectionProps) {
  const t = useTranslations("dashboard.admin")
  const tReports = useTranslations("dashboard.reports")
  const locale = useLocale()

  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    setStatsLoading(true)
    setStatsError(null)
    fetchDashboard()
      .then((s) => { if (!cancelled) setStats(s) })
      .catch((e) => {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : t("error")
          if (msg === "FORBIDDEN") onAccessDenied()
          else setStatsError(msg)
        }
      })
      .finally(() => { if (!cancelled) setStatsLoading(false) })

    setAnalyticsLoading(true)
    fetchAnalytics()
      .then((a) => { if (!cancelled) setAnalytics(a) })
      .catch(() => { /* analytics is non-critical — silent fail */ })
      .finally(() => { if (!cancelled) setAnalyticsLoading(false) })

    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleAdmin = async (userId: string) => {
    await toggleAdmin(userId)
  }

  const handleExportPdf = async () => {
    if (!stats) return
    setPdfLoading(true)
    try {
      const { generateSummaryReportPdf } = await import("@/lib/reports/generate-summary-report-pdf")
      const now = new Date()
      const dateStr = now.toLocaleDateString(locale === "en" ? "en-GB" : "pt-PT", {
        day: "2-digit", month: "2-digit", year: "numeric",
      })
      const slug = now.toISOString().slice(0, 10)

      await generateSummaryReportPdf(
        stats,
        {
          users: t("usersCount"),
          ingredients: t("ingredientsCount"),
          recipes: t("recipesCount"),
          plates: t("platesCount"),
          suppliers: t("suppliersCount"),
          salesRecords: t("salesRecordsCount"),
          totalSales: t("totalSales"),
          totalRecipeCost: t("totalRecipeCost"),
          countsSection: tReports("kpis.countsSection"),
          financialsSection: tReports("kpis.financialsSection"),
        },
        {
          title: t("platformReportTitle"),
          subtitle: tReports("pdf.subtitle"),
          generatedLabel: tReports("generatedAt"),
          date: dateStr,
        },
        `tech-cuisine-platform-report-${slug}.pdf`
      )
    } catch {
      setStatsError(t("error"))
    } finally {
      setPdfLoading(false)
    }
  }

  if (statsError) {
    return (
      <div className="p-4 lg:p-6">
        <p className="text-red-400">{statsError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header row with Export PDF button */}
      <div className="flex items-center justify-between px-4 lg:px-6 pt-4">
        <h2 className="text-xl font-bold text-white">{t("title")}</h2>
        <Button
          onClick={handleExportPdf}
          disabled={pdfLoading || statsLoading || !stats}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          variant="outline"
          size="sm"
        >
          <FiDownload className="w-4 h-4" />
          {pdfLoading ? t("exportingPdf") : t("exportPdf")}
        </Button>
      </div>

      {/* KPI tiles */}
      <AdminStats stats={stats} isLoading={statsLoading} />

      {/* Analytics section */}
      {!analyticsLoading && analytics && (
        <div className="space-y-4 px-4 lg:px-6">
          <AdminRolesSummary data={analytics} />
          <AdminAnalyticsCharts data={analytics} />
          <AdminSubscriptionsOverview data={analytics} />
        </div>
      )}

      {analyticsLoading && (
        <div className="space-y-4 px-4 lg:px-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      )}

      {/* Lists */}
      <div className="px-4 lg:px-6">
        <AdminUsersList onToggleAdmin={handleToggleAdmin} />
      </div>
    </div>
  )
}
