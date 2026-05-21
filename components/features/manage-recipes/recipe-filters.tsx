"use client"

import { Button } from "@/components/ui/button"
import { FiGrid, FiList } from "react-icons/fi"
import { useTranslations } from "next-intl"
import { RecipeFiltersProps, RecipeFilter } from "@/types/recipe.types"

const FILTERS: RecipeFilter[] = ['all', 'pending', 'completed', 'canceled']

export function RecipeFilters({ filter, viewMode, onFilterChange, onViewModeChange }: RecipeFiltersProps) {
  const t = useTranslations('recipeManagement')

  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Button
            key={f}
            onClick={() => onFilterChange(f)}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            className={
              filter === f
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }
          >
            {t(`filters.${f}`)}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onViewModeChange('grid')}
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          className={
            viewMode === 'grid'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          }
        >
          <FiGrid className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onViewModeChange('list')}
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          className={
            viewMode === 'list'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          }
        >
          <FiList className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
