"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { SectionBackButton } from "@/components/features/shared/section-back-button"
import { ErrorNoticeDialog } from "@/components/features/shared/error-notice-dialog"
import { useTranslations } from "next-intl"
import {
  RecipeSectionProps,
  RecipeFilter,
  ViewMode,
  Recipe,
  RecipeCreatePayload,
  RecipeUpdatePayload,
} from "@/types/recipe.types"
import { RecipeCard } from "./recipe-card"
import { RecipeFilters } from "./recipe-filters"
import { RecipeSkeleton } from "./manage-recipes-skeleton"
import { RecipeFormDialog } from "./recipe-form-dialog"
import { RecipeScaleDialog } from "./recipe-scale-dialog"
import { useRecipes } from "@/hooks/use-recipes"
import { useIngredients } from "@/hooks/use-ingredients"
import { isSubscriptionBlockedMessage } from "@/lib/subscription-errors"
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
import {
  ScrollText,
  BadgeCheck,
  Users,
  CircleDollarSign,
  Receipt,
  ChefHat,
  Plus,
  Scale,
} from "lucide-react"

export function ManageRecipesSection({ onSectionChange }: RecipeSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState<RecipeFilter>('all')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null)
  const [scaleTarget, setScaleTarget] = useState<Recipe | null>(null)
  const [isScaleOpen, setIsScaleOpen] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const { loading, error, mutationLoading, loadAll, getFilteredRecipes, create, update, remove, scale } = useRecipes()
  const { ingredients, loadAll: loadIngredients } = useIngredients()
  const t = useTranslations('recipeManagement')

  useEffect(() => {
    loadAll()
    loadIngredients()
  }, [loadAll, loadIngredients])

  const filteredRecipes = getFilteredRecipes(filter)

  const ingredientNameMap = new Map(ingredients.map((i) => [i.id, i.name]))

  const handleView = (id: string) => {
    const recipe = filteredRecipes.find((r) => r.id === id)
    if (!recipe) return
    setSelectedRecipe(recipe)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedRecipe(null)
  }

  const handleBackToDashboard = () => {
    if (onSectionChange) onSectionChange('dashboard')
  }

  const openCreate = () => {
    setEditingRecipe(null)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormError(null)
    setIsDetailOpen(false)
    setFormOpen(true)
  }

  const openScale = (recipe: Recipe) => {
    setScaleTarget(recipe)
    setIsScaleOpen(true)
  }

  const handleFormSave = async (payload: RecipeCreatePayload | RecipeUpdatePayload) => {
    setFormError(null)

    if (!payload.name?.trim()) {
      setFormError(t('form.nameRequired'))
      return
    }
    const portions = (payload as RecipeCreatePayload).reference_portions
    if (!portions || portions <= 0) {
      setFormError(t('form.portionsRequired'))
      return
    }

    if (editingRecipe) {
      const { error: mutError } = await update(editingRecipe.id, payload as RecipeUpdatePayload)
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
      const { error: mutError } = await create(payload as RecipeCreatePayload)
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
      if (isSubscriptionBlockedMessage(mutError)) {
        setGlobalError(mutError)
        setErrorDialogOpen(true)
      } else {
        setGlobalError(mutError)
        setErrorDialogOpen(true)
      }
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

      <RecipeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingRecipe={editingRecipe}
        onSave={handleFormSave}
        mutationLoading={mutationLoading}
        formError={formError}
      />

      <RecipeScaleDialog
        open={isScaleOpen}
        onOpenChange={setIsScaleOpen}
        recipe={scaleTarget}
        ingredientNameMap={ingredientNameMap}
        onScale={scale}
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <SectionBackButton onClick={handleBackToDashboard} />
            <Button
              onClick={openCreate}
              className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('addButton')}</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-white/70 text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Filters */}
        <RecipeFilters
          filter={filter}
          viewMode={viewMode}
          onFilterChange={setFilter}
          onViewModeChange={setViewMode}
        />

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

        {/* Recipes grid */}
        {!error && (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <RecipeSkeleton key={index} />
              ))
            ) : (
              filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onView={handleView}
                  onEdit={openEdit}
                  onDelete={(r) => setDeleteTarget(r)}
                />
              ))
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 text-lg mb-4">
              {t('emptyState.title')}
            </div>
            <Button
              onClick={openCreate}
              className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('addButton')}
            </Button>
          </div>
        )}
      </div>

      {/* Recipe detail modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent
          className="z-[60] max-w-lg w-full overflow-hidden p-4 sm:p-6 bg-gradient-to-b from-amber-900/95 via-amber-800/90 to-lime-900/95 backdrop-blur-xl border border-white/20 text-white shadow-xl [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]:hover]:text-white"
          aria-describedby={undefined}
          onKeyDown={(e) => { if (e.key === 'Escape') handleCloseDetail() }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/20 to-lime-400/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-tr from-orange-400/20 to-amber-400/20 blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400/5 to-lime-400/10 blur-3xl" />
          </div>

          {selectedRecipe && (
            <div className="relative z-10 overflow-y-auto max-h-[80dvh]">
              <DialogHeader>
                <DialogTitle className="text-white pr-8">{selectedRecipe.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm text-white/80 mt-2">
                {selectedRecipe.description && (
                  <p className="flex gap-2">
                    <ScrollText size={16} className="shrink-0 text-white/50 mt-0.5" />
                    {selectedRecipe.description}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="flex items-center gap-1 text-white/50 text-xs">
                      <BadgeCheck size={14} className="shrink-0" />
                      {t('detail.status')}
                    </span>
                    <p className="font-medium">{t(`status.${selectedRecipe.status}`)}</p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 text-white/50 text-xs">
                      <Users size={14} className="shrink-0" />
                      {t('detail.portions')}
                    </span>
                    <p className="font-medium">{selectedRecipe.reference_portions}</p>
                  </div>
                  {selectedRecipe.cost_per_portion && (
                    <div>
                      <span className="flex items-center gap-1 text-white/50 text-xs">
                        <CircleDollarSign size={14} className="shrink-0" />
                        {t('detail.costPerPortion')}
                      </span>
                      <p className="font-medium">{selectedRecipe.cost_per_portion}</p>
                    </div>
                  )}
                  {selectedRecipe.total_recipe_cost && (
                    <div>
                      <span className="flex items-center gap-1 text-white/50 text-xs">
                        <Receipt size={14} className="shrink-0" />
                        {t('detail.totalCost')}
                      </span>
                      <p className="font-medium">{selectedRecipe.total_recipe_cost}</p>
                    </div>
                  )}
                </div>

                {selectedRecipe.ingredient_lines && selectedRecipe.ingredient_lines.length > 0 && (
                  <div>
                    <span className="text-white/50 text-xs mb-2 block">{t('detail.ingredientLines')}</span>
                    <div className="space-y-1">
                      {selectedRecipe.ingredient_lines.map((line, idx) => {
                        const name = ingredientNameMap.get(line.ingredient_id) ?? line.ingredient_id
                        return (
                          <div key={idx} className="flex justify-between text-xs bg-white/5 rounded px-2 py-1.5">
                            <span className="text-white/80 truncate flex-1">{name}</span>
                            <span className="text-white ml-2 shrink-0">{line.gross_quantity} {line.unit}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {selectedRecipe.preparation_costs && selectedRecipe.preparation_costs.length > 0 && (
                  <div>
                    <span className="text-white/50 text-xs mb-2 block">{t('detail.preparationCosts')}</span>
                    <div className="space-y-1">
                      {selectedRecipe.preparation_costs.map((cost, idx) => (
                        <div key={idx} className="flex justify-between text-xs bg-white/5 rounded px-2 py-1.5">
                          <span className="text-white/80">{cost.label}</span>
                          <span className="text-white ml-2">{cost.minutes} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecipe.chef_notes && (
                  <div>
                    <span className="flex items-center gap-1 text-white/50 text-xs">
                      <ChefHat size={14} className="shrink-0" />
                      {t('detail.chefNotes')}
                    </span>
                    <p className="mt-1">{selectedRecipe.chef_notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <Button
                  onClick={() => openScale(selectedRecipe)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Scale className="w-3.5 h-3.5 mr-1.5" />
                  {t('detail.scaleButton')}
                </Button>
                <Button
                  onClick={() => openEdit(selectedRecipe)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {t('detail.editButton')}
                </Button>
                <Button
                  onClick={handleCloseDetail}
                  className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white border-0"
                >
                  {t('detail.close')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent className="bg-gray-900 border-white/20 text-white z-[70]">
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
