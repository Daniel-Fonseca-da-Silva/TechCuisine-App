"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionBackButton } from "@/components/features/shared/section-back-button"
import { ErrorNoticeDialog } from "@/components/features/shared/error-notice-dialog"
import { PriceObservationSkeleton } from "./price-observation-skeleton"
import { usePriceObservations } from "@/hooks/use-price-observations"
import { useIngredients } from "@/hooks/use-ingredients"
import { useSuppliers } from "@/hooks/use-suppliers"
import {
  PriceObservationCreatePayload,
  PriceObservationSectionProps,
  PriceHistoryFilters,
} from "@/types/price-observation.types"
import type { TenantReportData } from "@/lib/reports/generate-summary-report-pdf"
import { isSubscriptionBlockedMessage } from "@/lib/subscription-errors"
import { useSubscription } from "@/components/features/shared/subscription-context"
import { Search, Plus, Tag, TrendingDown, FileDown, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface FormState {
  observed_at: string
  unit: string
  price_per_unit: string
  currency: string
  pack_label: string
  supplier_id: string
  source: string
}

const EMPTY_FORM: FormState = {
  observed_at: '',
  unit: '',
  price_per_unit: '',
  currency: 'EUR',
  pack_label: '',
  supplier_id: '',
  source: 'manual',
}

function toLocalDatetimeValue(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function PriceObservationSection({ onSectionChange }: PriceObservationSectionProps) {
  const t = useTranslations('priceObservationManagement')
  const { isPremiumActive } = useSubscription()

  const { bestPrices, history, loading, mutationLoading, error, loadBest, loadHistory, create } =
    usePriceObservations()
  const { ingredients, loadAll: loadIngredients } = useIngredients()
  const { suppliers, loadAll: loadSuppliers } = useSuppliers()

  const [tenantData, setTenantData] = useState<TenantReportData | null>(null)
  const [tenantLoading, setTenantLoading] = useState(false)

  const [selectedIngredientId, setSelectedIngredientId] = useState('')
  const [ingredientSearch, setIngredientSearch] = useState('')

  const [filters, setFilters] = useState<PriceHistoryFilters>({ limit: 50 })
  const [filtersFrom, setFiltersFrom] = useState('')
  const [filtersTo, setFiltersTo] = useState('')
  const [filtersSupplier, setFiltersSupplier] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const [pdfBusy, setPdfBusy] = useState(false)

  useEffect(() => {
    loadIngredients()
    loadSuppliers()
    setTenantLoading(true)
    fetch('/api/reports/tenant-summary')
      .then((r) => r.json())
      .then((j: { success: boolean; data?: TenantReportData }) => { if (j.success) setTenantData(j.data ?? null) })
      .catch(() => {})
      .finally(() => setTenantLoading(false))
  }, [loadIngredients, loadSuppliers])

  const supplierMap = useMemo(
    () => new Map(suppliers.map((s) => [s.id, s.name])),
    [suppliers]
  )

  const filteredIngredients = useMemo(() => {
    if (!ingredientSearch.trim()) return ingredients
    const lower = ingredientSearch.toLowerCase()
    return ingredients.filter((i) => i.name.toLowerCase().includes(lower))
  }, [ingredients, ingredientSearch])

  const selectedIngredient = useMemo(
    () => ingredients.find((i) => i.id === selectedIngredientId) ?? null,
    [ingredients, selectedIngredientId]
  )

  const handleSelectIngredient = useCallback(
    async (id: string) => {
      setSelectedIngredientId(id)
      await Promise.all([loadBest(id), loadHistory(id, filters)])
    },
    [loadBest, loadHistory, filters]
  )

  const handleApplyFilters = useCallback(async () => {
    if (!selectedIngredientId) return
    const newFilters: PriceHistoryFilters = {
      limit: 50,
      ...(filtersFrom && { from: new Date(filtersFrom).toISOString() }),
      ...(filtersTo && { to: new Date(filtersTo).toISOString() }),
      ...(filtersSupplier && { supplier_id: filtersSupplier }),
    }
    setFilters(newFilters)
    await loadHistory(selectedIngredientId, newFilters)
  }, [selectedIngredientId, filtersFrom, filtersTo, filtersSupplier, loadHistory])

  const handleBackToDashboard = useCallback(() => {
    onSectionChange?.('dashboard')
  }, [onSectionChange])

  const handleRetryLoad = useCallback(async () => {
    if (!selectedIngredientId) return
    await Promise.all([loadBest(selectedIngredientId), loadHistory(selectedIngredientId, filters)])
  }, [selectedIngredientId, filters, loadBest, loadHistory])

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, observed_at: toLocalDatetimeValue(new Date().toISOString()) })
    setFormError(null)
    setFormOpen(true)
  }

  const handleFormSave = async () => {
    if (!selectedIngredientId) { setFormError(t('form.ingredientRequired')); return }
    if (!form.observed_at) { setFormError(t('form.observedAtRequired')); return }
    if (!form.unit.trim()) { setFormError(t('form.unitRequired')); return }
    if (!form.price_per_unit.trim()) { setFormError(t('form.priceRequired')); return }
    if (!form.currency.trim()) { setFormError(t('form.currencyRequired')); return }

    setFormError(null)
    const payload: PriceObservationCreatePayload = {
      observed_at: new Date(form.observed_at).toISOString(),
      unit: form.unit.trim(),
      price_per_unit: form.price_per_unit.trim(),
      currency: form.currency.trim(),
      pack_label: form.pack_label.trim() || null,
      supplier_id: form.supplier_id || null,
      source: form.source as PriceObservationCreatePayload['source'],
    }

    const { error: err } = await create(selectedIngredientId, payload)
    if (err) {
      if (isSubscriptionBlockedMessage(err)) {
        setFormOpen(false)
        setGlobalError(err)
        setErrorDialogOpen(true)
      } else {
        setFormError(err)
      }
      return
    }

    setFormOpen(false)
    await loadBest(selectedIngredientId)
  }

  const handleExportPdf = async () => {
    if (!selectedIngredient) return
    if (!isPremiumActive) {
      setGlobalError('not available for your subscription plan')
      setErrorDialogOpen(true)
      return
    }
    setPdfBusy(true)
    try {
      const { generatePriceHistoryPdf } = await import('@/lib/reports/generate-price-history-pdf')
      const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'short' }).format(new Date())
      await generatePriceHistoryPdf(
        selectedIngredient.name,
        bestPrices,
        history,
        {
          title: t('pdf.title'),
          subtitle: t('pdf.subtitle'),
          generatedLabel: t('pdf.generatedLabel'),
          date,
          bestPricesSection: t('pdf.bestPricesSection'),
          historySection: t('pdf.historySection'),
          rankCol: t('pdf.rankCol'),
          supplierCol: t('pdf.supplierCol'),
          priceCol: t('pdf.priceCol'),
          unitCol: t('pdf.unitCol'),
          currencyCol: t('pdf.currencyCol'),
          observedAtCol: t('pdf.observedAtCol'),
          packLabelCol: t('pdf.packLabelCol'),
          noSupplier: t('pdf.noSupplier'),
          noPack: t('pdf.noPack'),
        },
        supplierMap,
        `price-history-${selectedIngredient.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      )
    } catch (e) {
      console.error('PDF generation error:', e)
      setGlobalError(t('errorState.pdfError'))
      setErrorDialogOpen(true)
    } finally {
      setPdfBusy(false)
    }
  }

  if (loading && !selectedIngredientId) {
    return (
      <>
        <ErrorNoticeDialog
          open={errorDialogOpen}
          onOpenChange={setErrorDialogOpen}
          description={globalError ?? ''}
        />
        <section aria-labelledby="price-obs-heading" className="p-4 lg:p-6 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shrink-0">
                <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 id="price-obs-heading" className="text-lg lg:text-2xl font-bold text-white truncate">
                  {t('title')}
                </h1>
                <p className="text-white/70 text-xs lg:text-sm hidden sm:block">{t('subtitle')}</p>
              </div>
            </div>
            {onSectionChange && <SectionBackButton onClick={handleBackToDashboard} />}
          </div>
          <PriceObservationSkeleton />
        </section>
      </>
    )
  }

  return (
    <>
      <ErrorNoticeDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        description={globalError ?? ''}
      />

      <section aria-labelledby="price-obs-heading" className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shrink-0">
            <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 id="price-obs-heading" className="text-lg lg:text-2xl font-bold text-white truncate">
              {t('title')}
            </h1>
            <p className="text-white/70 text-xs lg:text-sm hidden sm:block">{t('subtitle')}</p>
          </div>
        </div>
        {onSectionChange && <SectionBackButton onClick={handleBackToDashboard} />}
      </div>

      {/* KPI cards — tenant summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-white/60 uppercase tracking-widest">{t('kpi.salesRecords')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {tenantLoading ? '—' : (tenantData?.sales_records ?? '—')}
            </p>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-white/60 uppercase tracking-widest">{t('kpi.totalSales')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">
              {tenantLoading
                ? '—'
                : tenantData
                ? `€ ${parseFloat(tenantData.total_sales_line_total).toFixed(2)}`
                : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ingredient selector */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-sm">{t('selectIngredient')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder={t('ingredientSearchPlaceholder')}
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
            />
          </div>

          {ingredientSearch && (
            <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg bg-white/5 p-2">
              {filteredIngredients.length === 0 ? (
                <p className="text-white/50 text-sm px-2 py-1">{t('emptyState.noIngredients')}</p>
              ) : (
                filteredIngredients.map((ing) => (
                  <button
                    key={ing.id}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedIngredientId === ing.id
                        ? 'bg-indigo-500/30 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      handleSelectIngredient(ing.id)
                      setIngredientSearch('')
                    }}
                  >
                    {ing.name}
                    <span className="ml-2 text-white/40 text-xs">{ing.purchase_unit}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {selectedIngredient && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <p className="text-white font-semibold">
                {selectedIngredient.name}
                <span className="ml-2 text-white/50 text-sm font-normal">{selectedIngredient.purchase_unit}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  onClick={openCreate}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('addButton')}
                </Button>
                <Button
                  size="sm"
                  variant="glassOutline"
                  onClick={handleExportPdf}
                  disabled={pdfBusy}
                  aria-busy={pdfBusy}
                >
                  <FileDown className="w-4 h-4 mr-1" />
                  {pdfBusy ? t('pdf.generating') : t('pdf.export')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!selectedIngredient && (
        <Alert className="border-white/20 bg-white/5 text-white/80">
          <Info />
          <AlertTitle className="text-white">
            {t('hint.selectIngredient.title')}
          </AlertTitle>
          <AlertDescription className="text-white/60">
            {t('hint.selectIngredient.description')}
          </AlertDescription>
        </Alert>
      )}

      {selectedIngredient && error && !loading && (
        <div className="text-center py-10 rounded-xl bg-white/5 border border-white/20">
          <div className="text-white/70 text-lg mb-4">{t('errorState.title')}</div>
          <Button
            type="button"
            onClick={handleRetryLoad}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {t('errorState.retry')}
          </Button>
        </div>
      )}

      {selectedIngredient && !error && (
        <>
          {/* Best prices */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-400" />
              <CardTitle className="text-white text-sm">{t('bestPricesTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-white/50 text-sm">{t('loading')}</p>
              ) : bestPrices.length === 0 ? (
                <p className="text-white/50 text-sm">{t('emptyState.noBest')}</p>
              ) : (
                <div className="space-y-2">
                  {bestPrices.map((bp) => (
                    <div
                      key={`${bp.supplier_id ?? 'none'}-${bp.rank}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-white/40 text-sm font-mono w-5">#{bp.rank}</span>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {bp.supplier_id
                              ? (supplierMap.get(bp.supplier_id) ?? bp.supplier_id)
                              : t('noSupplier')}
                          </p>
                          {bp.pack_label && (
                            <p className="text-white/50 text-xs">{bp.pack_label}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">
                          {parseFloat(bp.price_per_unit).toFixed(2)} {bp.currency}
                        </p>
                        <p className="text-white/40 text-xs">/{bp.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-sm">{t('filtersTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-white/60 text-xs block mb-1">{t('filters.from')}</label>
                  <Input
                    type="datetime-local"
                    className="bg-white/10 border-white/20 text-white"
                    value={filtersFrom}
                    onChange={(e) => setFiltersFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs block mb-1">{t('filters.to')}</label>
                  <Input
                    type="datetime-local"
                    className="bg-white/10 border-white/20 text-white"
                    value={filtersTo}
                    onChange={(e) => setFiltersTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs block mb-1">{t('filters.supplier')}</label>
                  <select
                    className="w-full h-10 rounded-md bg-white/10 border border-white/20 text-white text-sm px-3"
                    value={filtersSupplier}
                    onChange={(e) => setFiltersSupplier(e.target.value)}
                  >
                    <option value="">{t('filters.allSuppliers')}</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id} className="text-black">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-3 bg-indigo-500 hover:bg-indigo-600 text-white"
                onClick={handleApplyFilters}
                disabled={loading}
              >
                {t('filters.apply')}
              </Button>
            </CardContent>
          </Card>

          {/* History */}
          <div>
            <h2 className="text-white/70 text-xs uppercase tracking-widest mb-3">{t('historyTitle')}</h2>
            {loading ? (
              <p className="text-white/50 text-sm">{t('loading')}</p>
            ) : history.length === 0 ? (
              <p className="text-white/50 text-sm">{t('emptyState.noHistory')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((obs) => (
                  <div
                    key={obs.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-white text-sm font-medium">
                        {parseFloat(obs.price_per_unit).toFixed(2)} {obs.currency}
                        <span className="text-white/50 font-normal ml-1">/{obs.unit}</span>
                      </p>
                      <p className="text-white/50 text-xs">{formatDate(obs.observed_at)}</p>
                      {obs.supplier_id && (
                        <p className="text-white/40 text-xs">
                          {supplierMap.get(obs.supplier_id) ?? obs.supplier_id}
                        </p>
                      )}
                    </div>
                    {obs.pack_label && (
                      <span className="text-white/40 text-xs border border-white/20 rounded px-2 py-0.5">
                        {obs.pack_label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="backdrop-blur-xl bg-[#1a1a2e]/95 border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{t('createDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {formError && (
              <p className="text-red-400 text-sm">{formError}</p>
            )}

            <div>
              <label className="text-white/70 text-xs block mb-1" htmlFor="obs-date">
                {t('form.observedAt')}
              </label>
              <Input
                id="obs-date"
                type="datetime-local"
                className="bg-white/10 border-white/20 text-white"
                value={form.observed_at}
                onChange={(e) => setForm((f) => ({ ...f, observed_at: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/70 text-xs block mb-1" htmlFor="obs-unit">
                  {t('form.unit')}
                </label>
                <Input
                  id="obs-unit"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  placeholder={t('form.unitPlaceholder')}
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-white/70 text-xs block mb-1" htmlFor="obs-currency">
                  {t('form.currency')}
                </label>
                <Input
                  id="obs-currency"
                  className="bg-white/10 border-white/20 text-white"
                  maxLength={3}
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-xs block mb-1" htmlFor="obs-price">
                {t('form.pricePerUnit')}
              </label>
              <Input
                id="obs-price"
                type="number"
                min="0"
                step="0.01"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                placeholder="0.00"
                value={form.price_per_unit}
                onChange={(e) => setForm((f) => ({ ...f, price_per_unit: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-white/70 text-xs block mb-1" htmlFor="obs-supplier">
                {t('form.supplier')}
              </label>
              <select
                id="obs-supplier"
                className="w-full h-10 rounded-md bg-white/10 border border-white/20 text-white text-sm px-3"
                value={form.supplier_id}
                onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))}
              >
                <option value="">{t('form.noSupplier')}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id} className="text-black">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white/70 text-xs block mb-1" htmlFor="obs-pack">
                {t('form.packLabel')}
              </label>
              <Input
                id="obs-pack"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                placeholder={t('form.packLabelPlaceholder')}
                value={form.pack_label}
                onChange={(e) => setForm((f) => ({ ...f, pack_label: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-white/70 text-xs block mb-1" htmlFor="obs-source">
                {t('form.source')}
              </label>
              <select
                id="obs-source"
                className="w-full h-10 rounded-md bg-white/10 border border-white/20 text-white text-sm px-3"
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              >
                <option value="manual" className="text-black">{t('form.sourceManual')}</option>
                <option value="invoice" className="text-black">{t('form.sourceInvoice')}</option>
                <option value="api" className="text-black">{t('form.sourceApi')}</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setFormOpen(false)}
                disabled={mutationLoading}
              >
                {t('form.cancel')}
              </Button>
              <Button
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                onClick={handleFormSave}
                disabled={mutationLoading}
              >
                {mutationLoading ? t('form.saving') : t('form.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
    </>
  )
}
