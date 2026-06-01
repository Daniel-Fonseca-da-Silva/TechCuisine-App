"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionBackButton } from "@/components/features/shared/section-back-button"
import { ErrorNoticeDialog } from "@/components/features/shared/error-notice-dialog"
import { PlateListSkeleton } from "./plate-list-skeleton"
import { usePlates } from "@/hooks/use-plates"
import { Plate, PlateCreatePayload, PlateSectionProps } from "@/types/plate.types"
import { isSubscriptionBlockedMessage } from "@/lib/subscription-errors"
import { Search, Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PlateFormState {
  name: string
  description: string
  menu_section: string
  selling_price: string
  currency: string
  target_food_cost_pct: string
  active: boolean
}

const EMPTY_FORM: PlateFormState = {
  name: '',
  description: '',
  menu_section: '',
  selling_price: '',
  currency: 'EUR',
  target_food_cost_pct: '',
  active: true,
}

function plateToForm(plate: Plate): PlateFormState {
  return {
    name: plate.name,
    description: plate.description ?? '',
    menu_section: plate.menu_section ?? '',
    selling_price: plate.selling_price ?? '',
    currency: plate.currency,
    target_food_cost_pct: plate.target_food_cost_pct ?? '',
    active: plate.active,
  }
}

function formToPayload(form: PlateFormState): PlateCreatePayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    menu_section: form.menu_section.trim() || null,
    selling_price: form.selling_price.trim() || null,
    currency: form.currency.trim() || 'EUR',
    target_food_cost_pct: form.target_food_cost_pct.trim() || null,
    active: form.active,
  }
}

export function PlatesSection({ onSectionChange }: PlateSectionProps) {
  const t = useTranslations('plateManagement')
  const { plates, loading, mutationLoading, error, loadAll, getFilteredPlates, create, update, remove } =
    usePlates()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingPlate, setEditingPlate] = useState<Plate | null>(null)
  const [form, setForm] = useState<PlateFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Plate | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const filtered = getFilteredPlates(search)

  const handleBackToDashboard = () => {
    if (onSectionChange) onSectionChange('dashboard')
  }

  const openCreate = () => {
    setEditingPlate(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (plate: Plate) => {
    setEditingPlate(plate)
    setForm(plateToForm(plate))
    setFormError(null)
    setFormOpen(true)
  }

  const handleFormSave = async () => {
    if (!form.name.trim()) {
      setFormError(t('form.nameRequired'))
      return
    }

    setFormError(null)
    const payload = formToPayload(form)

    if (editingPlate) {
      const { error: mutError } = await update(editingPlate.id, payload)
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
    } else {
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
    }

    setFormOpen(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const { error: mutError } = await remove(deleteTarget.id)
    setDeleteTarget(null)
    if (mutError) {
      setGlobalError(mutError)
      setErrorDialogOpen(true)
    }
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
        description={globalError ?? ''}
        onRetry={error ? handleRetry : undefined}
      />

      <div className="p-4 lg:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-white">{t('title')}</h1>
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
            className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white border-0 shrink-0"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
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
        {loading && <PlateListSkeleton />}

        {/* Plate list */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-white/60 text-lg">
                {search.trim() ? t('emptyState.noResults') : t('emptyState.title')}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((plate) => (
                  <div
                    key={plate.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white truncate">{plate.name}</span>
                        {plate.active ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0">
                            {t('active')}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/20 shrink-0">
                            {t('inactive')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 text-xs text-white/60 mt-0.5 flex-wrap">
                        {plate.menu_section && <span>{plate.menu_section}</span>}
                        {plate.selling_price && (
                          <>
                            {plate.menu_section && <span>·</span>}
                            <span>{plate.selling_price} {plate.currency}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-3 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(plate)}
                        className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                        aria-label={t('editButton')}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(plate)}
                        className="text-white/70 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        aria-label={t('deleteButton')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="z-[60] max-w-md w-full overflow-y-auto max-h-[90dvh] p-4 sm:p-6 bg-gradient-to-b from-lime-900/95 via-green-900/90 to-emerald-900/95 backdrop-blur-xl border border-white/20 text-white shadow-xl [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]:hover]:text-white"
          aria-describedby={undefined}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-lime-400/20 to-green-400/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-400/20 to-lime-400/20 blur-2xl" />
          </div>

          <div className="relative z-10 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-white pr-8">
                {editingPlate ? t('editDialog.title') : t('createDialog.title')}
              </DialogTitle>
            </DialogHeader>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.name')} *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.description')}</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Menu section */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.menuSection')}</label>
              <Input
                value={form.menu_section}
                onChange={(e) => setForm((p) => ({ ...p, menu_section: e.target.value }))}
                placeholder={t('form.menuSectionHint')}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Selling price + currency */}
            <div className="flex gap-2">
              <div className="space-y-1 flex-1">
                <label className="text-sm font-medium text-white/90">{t('form.sellingPrice')}</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.selling_price}
                  onChange={(e) => setForm((p) => ({ ...p, selling_price: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-1 w-24">
                <label className="text-sm font-medium text-white/90">{t('form.currency')}</label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                  maxLength={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Target food cost % */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.targetFoodCostPct')}</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.target_food_cost_pct}
                onChange={(e) => setForm((p) => ({ ...p, target_food_cost_pct: e.target.value }))}
                placeholder="e.g. 30"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-1">
              <label className="text-sm font-medium text-white/90">{t('form.active')}</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-lime-400 peer-checked:to-green-500" />
              </label>
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
                className="bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-white border-0 disabled:opacity-50"
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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent className="bg-gray-900 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {t('deleteDialog.description', { name: deleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={mutationLoading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              {t('deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={mutationLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {mutationLoading ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
