"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { useIngredients } from "@/hooks/use-ingredients"
import {
  Recipe,
  RecipeCreatePayload,
  RecipeUpdatePayload,
  RecipeStatus,
  IngredientLine,
  PreparationCost,
} from "@/types/recipe.types"

interface RecipeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingRecipe: Recipe | null
  onSave: (payload: RecipeCreatePayload | RecipeUpdatePayload) => Promise<void>
  mutationLoading: boolean
  formError: string | null
}

interface IngredientLineForm {
  ingredient_id: string
  gross_quantity: string
  unit: string
  yield_factor: string
}

interface PrepCostForm {
  label: string
  minutes: string
  hourly_labor_rate: string
  fixed_cost: string
}

const EMPTY_INGREDIENT_LINE: IngredientLineForm = {
  ingredient_id: '',
  gross_quantity: '',
  unit: '',
  yield_factor: '1',
}

const EMPTY_PREP_COST: PrepCostForm = {
  label: '',
  minutes: '',
  hourly_labor_rate: '',
  fixed_cost: '',
}

function recipeToIngredientLines(lines: IngredientLine[] | undefined): IngredientLineForm[] {
  if (!lines || lines.length === 0) return [{ ...EMPTY_INGREDIENT_LINE }]
  return lines.map((l) => ({
    ingredient_id: l.ingredient_id,
    gross_quantity: l.gross_quantity,
    unit: l.unit,
    yield_factor: l.yield_factor,
  }))
}

function recipeToPrepCosts(costs: PreparationCost[] | undefined): PrepCostForm[] {
  if (!costs || costs.length === 0) return []
  return costs.map((c) => ({
    label: c.label,
    minutes: c.minutes,
    hourly_labor_rate: c.hourly_labor_rate ?? '',
    fixed_cost: c.fixed_cost ?? '',
  }))
}

export function RecipeFormDialog({
  open,
  onOpenChange,
  editingRecipe,
  onSave,
  mutationLoading,
  formError,
}: RecipeFormDialogProps) {
  const t = useTranslations('recipeManagement')
  const { ingredients, loadAll: loadIngredients } = useIngredients()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [referencePotions, setReferencePortions] = useState('1')
  const [status, setStatus] = useState<RecipeStatus>('pending')
  const [chefNotes, setChefNotes] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [ingredientLines, setIngredientLines] = useState<IngredientLineForm[]>([{ ...EMPTY_INGREDIENT_LINE }])
  const [prepCosts, setPrepCosts] = useState<PrepCostForm[]>([])

  useEffect(() => {
    if (open) {
      loadIngredients()
      if (editingRecipe) {
        setName(editingRecipe.name)
        setDescription(editingRecipe.description ?? '')
        setReferencePortions(String(editingRecipe.reference_portions))
        setStatus(editingRecipe.status)
        setChefNotes(editingRecipe.chef_notes ?? '')
        setSellingPrice(editingRecipe.selling_price_per_portion ?? '')
        setIngredientLines(recipeToIngredientLines(editingRecipe.ingredient_lines))
        setPrepCosts(recipeToPrepCosts(editingRecipe.preparation_costs))
      } else {
        setName('')
        setDescription('')
        setReferencePortions('1')
        setStatus('pending')
        setChefNotes('')
        setSellingPrice('')
        setIngredientLines([{ ...EMPTY_INGREDIENT_LINE }])
        setPrepCosts([])
      }
    }
  }, [open, editingRecipe, loadIngredients])

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]))

  const handleIngredientSelect = (index: number, ingredientId: string) => {
    const ingredient = ingredientMap.get(ingredientId)
    setIngredientLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              ingredient_id: ingredientId,
              unit: ingredient?.purchase_unit ?? line.unit,
            }
          : line
      )
    )
  }

  const addIngredientLine = () => {
    setIngredientLines((prev) => [...prev, { ...EMPTY_INGREDIENT_LINE }])
  }

  const removeIngredientLine = (index: number) => {
    setIngredientLines((prev) => prev.filter((_, i) => i !== index))
  }

  const updateIngredientLine = (index: number, field: keyof IngredientLineForm, value: string) => {
    setIngredientLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    )
  }

  const addPrepCost = () => {
    setPrepCosts((prev) => [...prev, { ...EMPTY_PREP_COST }])
  }

  const removePrepCost = (index: number) => {
    setPrepCosts((prev) => prev.filter((_, i) => i !== index))
  }

  const updatePrepCost = (index: number, field: keyof PrepCostForm, value: string) => {
    setPrepCosts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    )
  }

  const buildPayload = (): RecipeCreatePayload => {
    const validLines = ingredientLines
      .filter((l) => l.ingredient_id && l.gross_quantity && l.unit)
      .map((l, idx) => ({
        ingredient_id: l.ingredient_id,
        gross_quantity: l.gross_quantity,
        unit: l.unit,
        yield_factor: l.yield_factor || '1',
        sort_order: idx,
      }))

    const validPrepCosts = prepCosts
      .filter((c) => c.label && c.minutes)
      .map((c) => ({
        label: c.label,
        minutes: c.minutes,
        hourly_labor_rate: c.hourly_labor_rate || null,
        fixed_cost: c.fixed_cost || null,
      }))

    return {
      name: name.trim(),
      description: description.trim() || null,
      reference_portions: parseInt(referencePotions, 10),
      status,
      chef_notes: chefNotes.trim() || null,
      selling_price_per_portion: sellingPrice.trim() || null,
      ingredient_lines: validLines,
      preparation_costs: validPrepCosts,
    }
  }

  const handleSubmit = async () => {
    await onSave(buildPayload())
  }

  const inputClass = "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/30"
  const labelClass = "text-sm font-medium text-white/90"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-[60] max-w-2xl w-full overflow-y-auto max-h-[90dvh] p-4 sm:p-6 bg-gradient-to-b from-amber-900/95 via-amber-800/90 to-lime-900/95 backdrop-blur-xl border border-white/20 text-white shadow-xl [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]:hover]:text-white"
        aria-describedby={undefined}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/20 to-lime-400/20 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-tr from-orange-400/20 to-amber-400/20 blur-2xl" />
        </div>

        <div className="relative z-10 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-white pr-8">
              {editingRecipe ? t('editDialog.title') : t('createDialog.title')}
            </DialogTitle>
          </DialogHeader>

          {/* Base fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className={labelClass}>{t('form.name')} *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('form.namePlaceholder')}
                className={inputClass}
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className={labelClass}>{t('form.description')}</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{t('form.referencePortions')} *</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={referencePotions}
                onChange={(e) => setReferencePortions(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{t('form.status')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RecipeStatus)}
                className="w-full h-10 rounded-md border border-white/20 bg-white/10 text-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/30"
              >
                <option value="pending" className="bg-amber-900">{t('status.pending')}</option>
                <option value="completed" className="bg-amber-900">{t('status.completed')}</option>
                <option value="canceled" className="bg-amber-900">{t('status.canceled')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{t('form.sellingPricePerPortion')}</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{t('form.chefNotes')}</label>
              <Input
                value={chefNotes}
                onChange={(e) => setChefNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Ingredient lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/90">{t('form.ingredientLines')}</h3>
              <Button
                type="button"
                size="sm"
                onClick={addIngredientLine}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-7"
                variant="outline"
              >
                <Plus className="w-3 h-3 mr-1" />
                {t('form.addIngredientLine')}
              </Button>
            </div>

            {ingredientLines.map((line, idx) => {
              const selectedIngredient = ingredientMap.get(line.ingredient_id)
              const noPrice = selectedIngredient && !selectedIngredient.last_price_per_unit
              return (
                <div key={idx} className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <select
                        value={line.ingredient_id}
                        onChange={(e) => handleIngredientSelect(idx, e.target.value)}
                        className="w-full h-9 rounded-md border border-white/20 bg-white/10 text-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/30"
                      >
                        <option value="" className="bg-amber-900">{t('form.selectIngredient')}</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id} className="bg-amber-900">
                            {ing.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        value={line.gross_quantity}
                        onChange={(e) => updateIngredientLine(idx, 'gross_quantity', e.target.value)}
                        placeholder={t('form.grossQuantity')}
                        className={`${inputClass} h-9 text-sm`}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Input
                        value={line.unit}
                        onChange={(e) => updateIngredientLine(idx, 'unit', e.target.value)}
                        placeholder={t('form.unit')}
                        className={`${inputClass} h-9 text-sm flex-1`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredientLine(idx)}
                        disabled={ingredientLines.length === 1}
                        className="text-white/50 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 p-0 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/60">{t('form.yieldFactor')}:</label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={line.yield_factor}
                      onChange={(e) => updateIngredientLine(idx, 'yield_factor', e.target.value)}
                      className={`${inputClass} h-7 text-xs w-24`}
                    />
                    {noPrice && (
                      <span className="flex items-center gap-1 text-xs text-amber-300">
                        <AlertTriangle className="w-3 h-3" />
                        {t('form.noPriceWarning')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Preparation costs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/90">{t('form.preparationCosts')}</h3>
              <Button
                type="button"
                size="sm"
                onClick={addPrepCost}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-7"
                variant="outline"
              >
                <Plus className="w-3 h-3 mr-1" />
                {t('form.addPrepCost')}
              </Button>
            </div>

            {prepCosts.map((cost, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="col-span-2 sm:col-span-1">
                  <Input
                    value={cost.label}
                    onChange={(e) => updatePrepCost(idx, 'label', e.target.value)}
                    placeholder={t('form.prepCostLabel')}
                    className={`${inputClass} h-9 text-sm`}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    value={cost.minutes}
                    onChange={(e) => updatePrepCost(idx, 'minutes', e.target.value)}
                    placeholder={t('form.prepCostMinutes')}
                    className={`${inputClass} h-9 text-sm`}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost.hourly_labor_rate}
                    onChange={(e) => updatePrepCost(idx, 'hourly_labor_rate', e.target.value)}
                    placeholder={t('form.prepCostHourlyRate')}
                    className={`${inputClass} h-9 text-sm`}
                  />
                </div>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost.fixed_cost}
                    onChange={(e) => updatePrepCost(idx, 'fixed_cost', e.target.value)}
                    placeholder={t('form.prepCostFixed')}
                    className={`${inputClass} h-9 text-sm flex-1`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrepCost(idx)}
                    className="text-white/50 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 p-0 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {formError && <p className="text-red-400 text-sm">{formError}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutationLoading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {t('form.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={mutationLoading}
              className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white border-0 disabled:opacity-50"
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
  )
}
