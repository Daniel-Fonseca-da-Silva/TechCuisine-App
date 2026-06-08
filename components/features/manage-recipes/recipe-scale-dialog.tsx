"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Scale } from "lucide-react"
import { Recipe, RecipeScaleResult } from "@/types/recipe.types"

interface RecipeScaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe: Recipe | null
  ingredientNameMap: Map<string, string>
  onScale: (id: string, portions: number) => Promise<{ result: RecipeScaleResult | null; error: string | null }>
}

export function RecipeScaleDialog({
  open,
  onOpenChange,
  recipe,
  ingredientNameMap,
  onScale,
}: RecipeScaleDialogProps) {
  const t = useTranslations('recipeManagement')
  const [portions, setPortions] = useState('')
  const [result, setResult] = useState<RecipeScaleResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = (open: boolean) => {
    if (!open) {
      setPortions('')
      setResult(null)
      setError(null)
    }
    onOpenChange(open)
  }

  const handleCalculate = async () => {
    if (!recipe) return
    const n = parseInt(portions, 10)
    if (!Number.isInteger(n) || n <= 0) {
      setError(t('scaleDialog.invalidPortions'))
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    const { result: r, error: e } = await onScale(recipe.id, n)
    setLoading(false)
    if (e) {
      setError(e)
    } else {
      setResult(r)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="z-[70] max-w-lg w-full overflow-y-auto max-h-[90dvh] p-4 sm:p-6 bg-gradient-to-b from-amber-900/95 via-amber-800/90 to-lime-900/95 backdrop-blur-xl border border-white/20 text-white shadow-xl [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]:hover]:text-white"
        aria-describedby={undefined}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/20 to-lime-400/20 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-tr from-orange-400/20 to-amber-400/20 blur-2xl" />
        </div>

        <div className="relative z-10 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-white pr-8 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-300" />
              {t('scaleDialog.title')}
            </DialogTitle>
            {recipe && (
              <p className="text-white/60 text-sm mt-1">{recipe.name}</p>
            )}
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              step="1"
              value={portions}
              onChange={(e) => setPortions(e.target.value)}
              placeholder={t('scaleDialog.portionsPlaceholder')}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCalculate() }}
            />
            <Button
              onClick={handleCalculate}
              disabled={loading || !portions}
              className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white border-0 disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('scaleDialog.calculate')
              )}
            </Button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white/50 text-xs mb-1">{t('scaleDialog.factor')}</p>
                  <p className="text-white font-semibold">×{result.factor}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white/50 text-xs mb-1">{t('scaleDialog.desiredPortions')}</p>
                  <p className="text-white font-semibold">{result.desired_portions}</p>
                </div>
                {result.total_recipe_cost && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-white/50 text-xs mb-1">{t('scaleDialog.totalCost')}</p>
                    <p className="text-white font-semibold">{result.total_recipe_cost}</p>
                  </div>
                )}
                {result.cost_per_portion && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-white/50 text-xs mb-1">{t('scaleDialog.costPerPortion')}</p>
                    <p className="text-white font-semibold">{result.cost_per_portion}</p>
                  </div>
                )}
                {result.total_selling_price && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 col-span-2">
                    <p className="text-white/50 text-xs mb-1">{t('scaleDialog.totalSellingPrice')}</p>
                    <p className="text-white font-semibold">{result.total_selling_price}</p>
                  </div>
                )}
              </div>

              {result.ingredient_lines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white/90">{t('scaleDialog.ingredientLines')}</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {result.ingredient_lines.map((line, idx) => {
                      const name = ingredientNameMap.get(line.ingredient_id) ?? line.ingredient_id
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5 border border-white/10"
                        >
                          <span className="text-white/80 truncate flex-1">{name}</span>
                          <span className="text-white font-medium ml-3 shrink-0">
                            {line.gross_quantity} {line.unit}
                          </span>
                          {line.line_total_cost && (
                            <span className="text-white/50 text-xs ml-2 shrink-0">{line.line_total_cost}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {t('scaleDialog.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
