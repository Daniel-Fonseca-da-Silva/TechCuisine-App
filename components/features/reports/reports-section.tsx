"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiDownload, FiPackage, FiGrid, FiList, FiTruck, FiDollarSign, FiTrendingUp } from "react-icons/fi"
import type { TenantReportData } from "@/lib/reports/generate-summary-report-pdf"

interface ReportsSectionProps {
  onSectionChange: (section: string) => void
}

const KPI_ICONS = {
  ingredients: FiPackage,
  recipes: FiGrid,
  plates: FiList,
  suppliers: FiTruck,
  sales_records: FiDollarSign,
  total_sales_line_total: FiTrendingUp,
  total_recipe_cost: FiDollarSign,
}

export function ReportsSection({ onSectionChange: _onSectionChange }: ReportsSectionProps) {
  const t = useTranslations("dashboard.reports")
  const locale = useLocale()

  const [data, setData] = useState<TenantReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch("/api/reports/tenant-summary")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          if (json.success) setData(json.data)
          else setError(json.error ?? t("error"))
        }
      })
      .catch(() => { if (!cancelled) setError(t("error")) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [t])

  const handleDownloadPdf = async () => {
    if (!data) return
    setPdfLoading(true)
    try {
      const { generateSummaryReportPdf } = await import("@/lib/reports/generate-summary-report-pdf")
      const now = new Date()
      const dateStr = now.toLocaleDateString(locale === "en" ? "en-GB" : "pt-PT", {
        day: "2-digit", month: "2-digit", year: "numeric",
      })
      const slug = now.toISOString().slice(0, 10)

      await generateSummaryReportPdf(
        data,
        {
          ingredients: t("kpis.ingredients"),
          recipes: t("kpis.recipes"),
          plates: t("kpis.plates"),
          suppliers: t("kpis.suppliers"),
          salesRecords: t("kpis.salesRecords"),
          totalSales: t("kpis.totalSales"),
          totalRecipeCost: t("kpis.totalRecipeCost"),
          countsSection: t("kpis.countsSection"),
          financialsSection: t("kpis.financialsSection"),
        },
        {
          title: t("pdf.title"),
          subtitle: t("pdf.subtitle"),
          generatedLabel: t("generatedAt"),
          date: dateStr,
        },
        `tech-cuisine-relatorio-${slug}.pdf`
      )
    } catch {
      setError(t("error"))
    } finally {
      setPdfLoading(false)
    }
  }

  const countKpis = data
    ? [
        { key: "ingredients" as const, icon: KPI_ICONS.ingredients, label: t("kpis.ingredients"), value: data.ingredients },
        { key: "recipes" as const, icon: KPI_ICONS.recipes, label: t("kpis.recipes"), value: data.recipes },
        { key: "plates" as const, icon: KPI_ICONS.plates, label: t("kpis.plates"), value: data.plates },
        { key: "suppliers" as const, icon: KPI_ICONS.suppliers, label: t("kpis.suppliers"), value: data.suppliers },
        { key: "sales_records" as const, icon: KPI_ICONS.sales_records, label: t("kpis.salesRecords"), value: data.sales_records },
      ]
    : []

  const monetaryKpis = data
    ? [
        {
          key: "totalSales" as const,
          icon: KPI_ICONS.total_sales_line_total,
          label: t("kpis.totalSales"),
          value: `€ ${parseFloat(data.total_sales_line_total || "0").toFixed(2)}`,
        },
        {
          key: "totalRecipeCost" as const,
          icon: KPI_ICONS.total_recipe_cost,
          label: t("kpis.totalRecipeCost"),
          value: `€ ${parseFloat(data.total_recipe_cost || "0").toFixed(2)}`,
        },
      ]
    : []

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{t("title")}</h2>
          <p className="text-white/60 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button
          onClick={handleDownloadPdf}
          disabled={pdfLoading || loading || !data}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          variant="outline"
        >
          <FiDownload className="w-4 h-4" />
          {pdfLoading ? t("downloading") : t("downloadPdf")}
        </Button>
      </div>

      {/* Count KPIs */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">{t("kpis.countsSection")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="backdrop-blur-xl bg-white/10 border-white/20">
                  <CardHeader><div className="h-4 w-20 bg-white/20 rounded animate-pulse" /></CardHeader>
                  <CardContent><div className="h-7 w-12 bg-white/20 rounded animate-pulse" /></CardContent>
                </Card>
              ))
            : countKpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <Card key={kpi.key} className="backdrop-blur-xl bg-white/10 border-white/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white/70 text-xs font-medium uppercase tracking-wide flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        {kpi.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-white">{kpi.value}</p>
                    </CardContent>
                  </Card>
                )
              })}
        </div>
      </div>

      {/* Monetary KPIs */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">{t("kpis.financialsSection")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="backdrop-blur-xl bg-white/10 border-white/20">
                  <CardHeader><div className="h-4 w-24 bg-white/20 rounded animate-pulse" /></CardHeader>
                  <CardContent><div className="h-7 w-20 bg-white/20 rounded animate-pulse" /></CardContent>
                </Card>
              ))
            : monetaryKpis.map((kpi) => {
                const MonetaryIcon = kpi.icon
                return (
                  <Card key={kpi.key} className="backdrop-blur-xl bg-white/10 border-white/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white/70 text-xs font-medium uppercase tracking-wide flex items-center gap-2">
                        <MonetaryIcon className="w-3.5 h-3.5" />
                        {kpi.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-emerald-400">{kpi.value}</p>
                    </CardContent>
                  </Card>
                )
              })}
        </div>
      </div>
    </div>
  )
}
