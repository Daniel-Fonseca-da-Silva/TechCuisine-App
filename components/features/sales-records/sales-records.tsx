"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionBackButton } from "@/components/features/shared/section-back-button"
import { ErrorNoticeDialog } from "@/components/features/shared/error-notice-dialog"
import { SalesRecordListSkeleton } from "./sales-record-list-skeleton"
import { useSalesRecords } from "@/hooks/use-sales-records"
import { usePlates } from "@/hooks/use-plates"
import { SalesRecordCreatePayload, SalesRecordSectionProps } from "@/types/sales-record.types"
import { isSubscriptionBlockedMessage } from "@/lib/subscription-errors"
import { Search, Plus, Receipt, Calendar, Hash, Banknote, Tag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SaleFormState {
  plate_id: string
  sold_at: string
  quantity: string
  unit_price: string
  currency: string
  channel: string
}

const EMPTY_FORM: SaleFormState = {
  plate_id: '',
  sold_at: '',
  quantity: '1',
  unit_price: '',
  currency: 'EUR',
  channel: '',
}

function formatAmount(value: string, currency: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return `${value} ${currency}`
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num)
}

function formatDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(isoString))
  } catch {
    return isoString
  }
}

function toLocalDatetimeValue(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function SalesRecordsSection({ onSectionChange }: SalesRecordSectionProps) {
  const t = useTranslations('salesRecordManagement')
  const { records, loading, mutationLoading, error, loadAll, getFilteredRecords, create } = useSalesRecords()
  const { plates, loadAll: loadPlates } = usePlates()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<SaleFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
    loadPlates()
  }, [loadAll, loadPlates])

  const plateNameMap = useMemo(
    () => new Map(plates.map((p) => [p.id, p.name])),
    [plates]
  )

  const filtered = getFilteredRecords(search, plateNameMap)

  const handleBackToDashboard = () => {
    if (onSectionChange) onSectionChange('dashboard')
  }

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, sold_at: toLocalDatetimeValue(new Date().toISOString()) })
    setFormError(null)
    setFormOpen(true)
  }

  const handleFormSave = async () => {
    if (!form.plate_id) {
      setFormError(t('form.plateRequired'))
      return
    }
    if (!form.sold_at) {
      setFormError(t('form.soldAtRequired'))
      return
    }
    const qty = parseInt(form.quantity, 10)
    if (isNaN(qty) || qty <= 0) {
      setFormError(t('form.quantityRequired'))
      return
    }
    const price = parseFloat(form.unit_price)
    if (isNaN(price) || price < 0) {
      setFormError(t('form.unitPriceRequired'))
      return
    }
    if (!form.currency.trim()) {
      setFormError(t('form.currencyRequired'))
      return
    }

    setFormError(null)

    const payload: SalesRecordCreatePayload = {
      plate_id: form.plate_id,
      sold_at: new Date(form.sold_at).toISOString(),
      quantity: qty,
      unit_price: String(price),
      currency: form.currency.trim().toUpperCase(),
      channel: form.channel.trim() || null,
    }

    const { error: mutError } = await create(payload)
    if (mutError) {
      if (isSubscriptionBlockedMessage(mutError)) {
        setFormOpen(false)
        setGlobalError(mutError)
        setErrorDialogOpen(true)
      } else {
        setFormError(mutError)
      }
      return
    }

    setFormOpen(false)
  }

  const handleRetry = useCallback(async () => {
    setErrorDialogOpen(false)
    await loadAll()
  }, [loadAll])

  return (
    <>
      <ErrorNoticeDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        description={globalError ?? error ?? ''}
        onRetry={error ? handleRetry : undefined}
      />

      <section aria-labelledby="sales-records-heading" className="p-4 lg:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
              <Receipt className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div>
              <h1 id="sales-records-heading" className="text-lg lg:text-2xl font-bold text-white">{t('title')}</h1>
              <p className="text-white/70 text-sm lg:text-base hidden sm:block">{t('subtitle')}</p>
            </div>
          </div>
          {onSectionChange && (
            <SectionBackButton onClick={handleBackToDashboard} />
          )}
        </div>

        {/* Search + Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/30"
            />
          </div>
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 text-white border-0 shrink-0"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('addButton')}</span>
          </Button>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-white/60 text-lg mb-4">{t('errorState.title')}</div>
            <Button
              onClick={() => loadAll()}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {t('errorState.retry')}
            </Button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <SalesRecordListSkeleton />}

        {/* Records list */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-white/60 text-lg">
                {search.trim() ? t('emptyState.noResults') : t('emptyState.title')}
              </div>
            ) : (
              <ul role="list" className="flex flex-col gap-2">
                {filtered.map((record) => {
                  const plateName = plateNameMap.get(record.plate_id) ?? record.plate_id
                  return (
                    <li
                      key={record.id}
                      className="p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{plateName}</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 shrink-0" />
                              {formatDate(record.sold_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3 shrink-0" />
                              {record.quantity}
                            </span>
                            <span className="flex items-center gap-1">
                              <Banknote className="w-3 h-3 shrink-0" />
                              {t('unitPrice')}: {formatAmount(record.unit_price, record.currency)}
                            </span>
                            {record.channel && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3 shrink-0" />
                                {record.channel}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-bold text-white text-base">
                            {formatAmount(record.line_total, record.currency)}
                          </div>
                          <div className="text-xs text-white/50">{t('total')}</div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </section>

      {/* Create Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="z-[60] max-w-md w-full overflow-y-auto max-h-[90dvh] p-4 sm:p-6 bg-gradient-to-b from-violet-900/95 via-purple-900/90 to-fuchsia-900/95 backdrop-blur-xl border border-white/20 text-white shadow-xl [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]:hover]:text-white"
          aria-describedby={undefined}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-tr from-fuchsia-400/20 to-violet-400/20 blur-2xl" />
          </div>

          <div className="relative z-10 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-white pr-8">{t('createDialog.title')}</DialogTitle>
            </DialogHeader>

            {/* Plate */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.plate')} *</label>
              <select
                value={form.plate_id}
                onChange={(e) => setForm((p) => ({ ...p, plate_id: e.target.value }))}
                className="w-full h-10 rounded-md bg-white/10 border border-white/20 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="">{t('form.selectPlate')}</option>
                {plates.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Sold at */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.soldAt')} *</label>
              <Input
                type="datetime-local"
                value={form.sold_at}
                onChange={(e) => setForm((p) => ({ ...p, sold_at: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 [color-scheme:dark]"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.quantity')} *</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Unit price + currency */}
            <div className="flex gap-2">
              <div className="space-y-1 flex-1">
                <label className="text-sm font-medium text-white/90">{t('form.unitPrice')} *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unit_price}
                  onChange={(e) => setForm((p) => ({ ...p, unit_price: e.target.value }))}
                  placeholder="0.00"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-1 w-24">
                <label className="text-sm font-medium text-white/90">{t('form.currency')}</label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                  maxLength={3}
                  placeholder="EUR"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Channel */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.channel')}</label>
              <Input
                value={form.channel}
                onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
                placeholder={t('form.channelPlaceholder')}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Form error */}
            {formError && (
              <p className="text-red-400 text-sm">{formError}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={mutationLoading}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {t('form.cancel')}
              </Button>
              <Button
                onClick={handleFormSave}
                disabled={mutationLoading}
                className="bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 text-white border-0 disabled:opacity-50"
              >
                {mutationLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('form.saving')}
                  </>
                ) : (
                  t('form.save')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
