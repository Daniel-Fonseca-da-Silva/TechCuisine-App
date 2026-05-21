"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionBackButton } from "@/components/features/shared/section-back-button"
import { ErrorNoticeDialog } from "@/components/features/shared/error-notice-dialog"
import { IngredientListSkeleton } from "./ingredient-list-skeleton"
import { useIngredients } from "@/hooks/use-ingredients"
import { useSuppliers } from "@/hooks/use-suppliers"
import { usePreferencesLocale } from "@/hooks/use-preferences-locale"
import { formatDecimalForPreference } from "@/lib/format-decimal"
import { Ingredient, IngredientAiMarketResponse, IngredientCreatePayload, IngredientSectionProps, SuggestedPriceInfo } from "@/types/ingredient.types"
import { Search, Plus, Pencil, Trash2, Leaf, Sparkles, ChevronUp, ChevronDown, X } from "lucide-react"
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

interface IngredientFormState {
  name: string
  purchase_unit: string
  price_amount: string
  category: string
  density_or_pack_notes: string
  tags: string
  active: boolean
  supplier_ids: string[]
}

const EMPTY_FORM: IngredientFormState = {
  name: '',
  purchase_unit: '',
  price_amount: '',
  category: '',
  density_or_pack_notes: '',
  tags: '',
  active: true,
  supplier_ids: [],
}

function formatStoredPrice(
  value: Ingredient['last_price_per_unit'],
  separator: string,
): string {
  return formatDecimalForPreference(value, separator)
}

/** Null if price omitted; otherwise validated amount with configured ISO currency. */
function parseOptionalPrice(
  amountRaw: string,
  configuredCurrency: string,
): { ok: true; amount: number; currency: string } | { ok: false; reason: 'amount' } | null {
  const trimmed = amountRaw.trim()
  if (!trimmed) return null
  const normalized = trimmed.replace(/\s/g, '').replace(',', '.')
  const amount = Number(normalized)
  if (Number.isNaN(amount) || amount < 0) {
    return { ok: false, reason: 'amount' }
  }
  return { ok: true, amount, currency: configuredCurrency }
}

function ingredientToForm(
  ingredient: Ingredient,
  separator: string,
): IngredientFormState {
  return {
    name: ingredient.name,
    purchase_unit: ingredient.purchase_unit,
    price_amount: formatStoredPrice(ingredient.last_price_per_unit, separator),
    category: ingredient.category ?? '',
    density_or_pack_notes: ingredient.density_or_pack_notes ?? '',
    tags: ingredient.tags.join(', '),
    active: ingredient.active,
    supplier_ids: ingredient.supplier_ids ?? [],
  }
}

function parseTags(raw: string): string[] {
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

export function IngredientsSection({ onSectionChange }: IngredientSectionProps) {
  const t = useTranslations('ingredientManagement')
  const { currency: appCurrency, decimalSeparator, language } = usePreferencesLocale()
  const { ingredients, loading, mutationLoading, error, loadAll, getFilteredIngredients, create, update, remove } =
    useIngredients()
  const { suppliers, loading: suppliersLoading, loadAll: loadAllSuppliers } = useSuppliers()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [form, setForm] = useState<IngredientFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null)
  const [suggestedPrice, setSuggestedPrice] = useState<SuggestedPriceInfo | null>(null)
  const [supplierSelectValue, setSupplierSelectValue] = useState('')

  useEffect(() => {
    loadAll()
    loadAllSuppliers()
  }, [loadAll, loadAllSuppliers])

  const filtered = getFilteredIngredients(search)
  const supplierMap = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers])

  const handleBackToDashboard = () => {
    if (onSectionChange) onSectionChange('dashboard')
  }

  const openCreate = () => {
    setEditingIngredient(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setAiError(null)
    setSettingsNotice(null)
    setSuggestedPrice(null)
    setSupplierSelectValue('')
    setFormOpen(true)
  }

  const openEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setForm(ingredientToForm(ingredient, decimalSeparator))
    setFormError(null)
    setAiError(null)
    setSettingsNotice(null)
    setSuggestedPrice(null)
    setSupplierSelectValue('')
    setFormOpen(true)
  }

  const handleAiSuggest = async () => {
    if (!form.name.trim()) {
      setAiError(t('aiSuggest.nameRequired'))
      return
    }
    setAiError(null)
    setSettingsNotice(null)
    setAiLoading(true)
    try {
      const response = await fetch('/api/ingredients/ai-market-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient_name: form.name.trim(),
          language,
          currency: appCurrency,
          decimal_separator: decimalSeparator,
        }),
      })
      const json = (await response.json()) as { success: boolean; data?: IngredientAiMarketResponse; error?: string }
      if (!json.success || !json.data) {
        setAiError(json.error ?? t('aiSuggest.error'))
        return
      }
      const { suggestion: s, settings_notice } = json.data
      setForm((prev) => ({
        ...prev,
        name: s.name,
        purchase_unit: s.purchase_unit,
        category: s.category ?? prev.category,
        density_or_pack_notes: s.density_or_pack_notes ?? prev.density_or_pack_notes,
        tags: s.tags.join(', '),
        active: s.active,
        price_amount:
          s.suggested_price != null
            ? formatDecimalForPreference(s.suggested_price.price_per_unit, decimalSeparator)
            : prev.price_amount,
      }))
      setSuggestedPrice(s.suggested_price ?? null)
      setSettingsNotice(settings_notice ?? null)
    } catch {
      setAiError(t('aiSuggest.error'))
    } finally {
      setAiLoading(false)
    }
  }

  const handleFormSave = async () => {
    if (!form.name.trim()) {
      setFormError(t('form.nameRequired'))
      return
    }
    if (!form.purchase_unit.trim()) {
      setFormError(t('form.purchaseUnitRequired'))
      return
    }

    setFormError(null)

    const parsedPrice = parseOptionalPrice(form.price_amount, appCurrency)
    if (parsedPrice?.ok === false) {
      setFormError(t('form.priceInvalidAmount'))
      return
    }

    const payload: IngredientCreatePayload = {
      name: form.name.trim(),
      purchase_unit: form.purchase_unit.trim(),
      category: form.category.trim() || null,
      density_or_pack_notes: form.density_or_pack_notes.trim() || null,
      tags: parseTags(form.tags),
      active: form.active,
      supplier_ids: form.supplier_ids,
    }
    if (parsedPrice?.ok === true) {
      payload.last_price_per_unit = parsedPrice.amount
      payload.last_price_currency = parsedPrice.currency
    }

    if (editingIngredient) {
      const { error: mutError } = await update(editingIngredient.id, payload)
      if (mutError) {
        setFormError(mutError)
        return
      }
    } else {
      const { error: mutError } = await create(payload)
      if (mutError) {
        setFormError(mutError)
        return
      }
    }

    setSuggestedPrice(null)
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
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
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
            className="bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-white border-0 shrink-0"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('addButton')}</span>
          </Button>
        </div>

        {/* Error state (load error) */}
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
        {loading && <IngredientListSkeleton />}

        {/* Ingredient list */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-white/60 text-lg">
                {search.trim() ? t('emptyState.noResults') : t('emptyState.title')}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white truncate">{ingredient.name}</span>
                        {ingredient.active ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 shrink-0">
                            {t('active')}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/20 shrink-0">
                            {t('inactive')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 text-xs text-white/60 mt-0.5 flex-wrap">
                        <span>{ingredient.purchase_unit}</span>
                        {ingredient.category && (
                          <>
                            <span>·</span>
                            <span>{ingredient.category}</span>
                          </>
                        )}
                        {ingredient.supplier_ids && ingredient.supplier_ids.length > 0 && (
                          <>
                            <span>·</span>
                            <span>
                              {supplierMap.get(ingredient.supplier_ids[0]) ?? '…'}
                              {ingredient.supplier_ids.length > 1 && ` (+${ingredient.supplier_ids.length - 1})`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-3 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(ingredient)}
                        className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                        aria-label={t('editButton')}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(ingredient)}
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
                {editingIngredient ? t('editDialog.title') : t('createDialog.title')}
              </DialogTitle>
            </DialogHeader>

            {/* AI Suggestion panel (create only) */}
            {!editingIngredient && (
              <div className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-2">
                <div className="flex gap-2 items-center justify-between">
                  <p className="text-xs text-white/60">{t('aiSuggest.hint')}</p>
                  <Button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading || mutationLoading}
                    className="h-8 shrink-0 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 text-sm disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 mr-1.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('aiSuggest.loading')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        {t('aiSuggest.button')}
                      </>
                    )}
                  </Button>
                </div>
                {aiError && <p className="text-red-400 text-xs">{aiError}</p>}
                {settingsNotice && (
                  <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded p-2">
                    {t('aiSuggest.settingsNotice')}
                  </div>
                )}
                {suggestedPrice?.disclaimer ? (
                  <p className="text-xs italic text-white/60">{suggestedPrice.disclaimer}</p>
                ) : null}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.name')} *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Purchase unit */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.purchaseUnit')} *</label>
              <Input
                value={form.purchase_unit}
                onChange={(e) => setForm((p) => ({ ...p, purchase_unit: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Price (per purchase unit) */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.price')}</label>
              <p className="text-xs text-white/50">{t('form.priceHint')}</p>
              <Input
                type="text"
                inputMode="decimal"
                value={form.price_amount}
                onChange={(e) => setForm((p) => ({ ...p, price_amount: e.target.value }))}
                placeholder={t('form.pricePlaceholder')}
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/40"
                aria-label={`${t('form.price')} (${appCurrency})`}
                autoComplete="off"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.category')}</label>
              <Input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.notes')}</label>
              <Input
                value={form.density_or_pack_notes}
                onChange={(e) => setForm((p) => ({ ...p, density_or_pack_notes: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/90">{t('form.tags')}</label>
              <Input
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                placeholder={t('form.tagsHint')}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Suppliers */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/90">{t('form.suppliers')}</label>
              <p className="text-xs text-white/50">{t('form.suppliersHint')}</p>

              {suppliersLoading ? (
                <p className="text-xs text-white/50">{t('form.suppliersLoading')}</p>
              ) : suppliers.length === 0 ? (
                <p className="text-xs text-white/50">{t('form.noSuppliersYet')}</p>
              ) : (
                <div className="space-y-2">
                  {form.supplier_ids.length > 0 && (
                    <div className="space-y-1">
                      {form.supplier_ids.map((id, idx) => (
                        <div key={id} className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1">
                          <span className="flex-1 text-sm text-white/90 truncate">
                            {supplierMap.get(id) ?? id}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={idx === 0}
                            onClick={() =>
                              setForm((p) => {
                                const ids = [...p.supplier_ids]
                                ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
                                return { ...p, supplier_ids: ids }
                              })
                            }
                            className="h-6 w-6 p-0 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30"
                            aria-label={t('form.moveUp')}
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={idx === form.supplier_ids.length - 1}
                            onClick={() =>
                              setForm((p) => {
                                const ids = [...p.supplier_ids]
                                ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
                                return { ...p, supplier_ids: ids }
                              })
                            }
                            className="h-6 w-6 p-0 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30"
                            aria-label={t('form.moveDown')}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setForm((p) => ({
                                ...p,
                                supplier_ids: p.supplier_ids.filter((_, i) => i !== idx),
                              }))
                            }
                            className="h-6 w-6 p-0 text-white/50 hover:text-red-400 hover:bg-red-500/10"
                            aria-label={t('form.removeSupplier')}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {suppliers.some((s) => !form.supplier_ids.includes(s.id)) && (
                    <div className="flex gap-2">
                      <select
                        value={supplierSelectValue}
                        onChange={(e) => setSupplierSelectValue(e.target.value)}
                        className="flex-1 min-w-0 rounded-md bg-white/10 border border-white/20 text-white text-sm px-2 py-1.5"
                      >
                        <option value="" className="bg-gray-900">{t('form.supplierPlaceholder')}</option>
                        {suppliers
                          .filter((s) => !form.supplier_ids.includes(s.id))
                          .map((s) => (
                            <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                          ))}
                      </select>
                      <Button
                        type="button"
                        disabled={!supplierSelectValue}
                        onClick={() => {
                          if (!supplierSelectValue) return
                          setForm((p) => ({ ...p, supplier_ids: [...p.supplier_ids, supplierSelectValue] }))
                          setSupplierSelectValue('')
                        }}
                        className="shrink-0 h-9 bg-white/10 border border-white/20 text-white hover:bg-white/20 text-sm disabled:opacity-50"
                      >
                        {t('form.addSupplier')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
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
