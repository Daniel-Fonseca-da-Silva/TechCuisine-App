"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SectionBackButton } from "@/components/features/shared/section-back-button"
import { useTranslations } from "next-intl"
import { RecipeSectionProps, RecipeFilter, ViewMode, Recipe } from "@/types/recipe.types"
import { RecipeCard } from "./recipe-card"
import { RecipeFilters } from "./recipe-filters"
import { RecipeSkeleton } from "./manage-recipes-skeleton"
import { useRecipes } from "@/hooks/use-recipes"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ScrollText,
  BadgeCheck,
  Users,
  CircleDollarSign,
  Receipt,
  ChefHat,
} from "lucide-react"

export function ManageRecipesSection({ onSectionChange }: RecipeSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState<RecipeFilter>('all')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { loading, error, fetchRecipes, nextCursor, getFilteredRecipes } = useRecipes()
  const t = useTranslations('recipeManagement')

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const filteredRecipes = getFilteredRecipes(filter)

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

  const handleLoadMore = () => {
    if (nextCursor) fetchRecipes(nextCursor)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <SectionBackButton onClick={handleBackToDashboard} />
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
            onClick={() => fetchRecipes()}
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
            onClick={() => setFilter('all')}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {t('emptyState.action')}
          </Button>
        </div>
      )}

      {/* Load more */}
      {!loading && nextCursor && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {t('loadMore')}
          </Button>
        </div>
      )}

      {/* Recipe detail modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent
          className="z-[60] max-w-lg w-full overflow-hidden p-4 sm:p-6 bg-gradient-to-b from-amber-900/95 via-amber-800/90 to-lime-900/95 backdrop-blur-xl border border-white/20 text-white shadow-xl [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]:hover]:text-white"
          aria-describedby={undefined}
          onKeyDown={(e) => { if (e.key === 'Escape') handleCloseDetail() }}
        >
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/20 to-lime-400/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-tr from-orange-400/20 to-amber-400/20 blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400/5 to-lime-400/10 blur-3xl" />
          </div>

          {selectedRecipe && (
            <div className="relative z-10">
              <DialogHeader>
                <DialogTitle className="text-white pr-8">{selectedRecipe.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm text-white/80">
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
              <div className="flex justify-end pt-2">
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
    </div>
  )
}
