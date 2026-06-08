"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiEye } from "react-icons/fi"
import { Pencil, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { RecipeCardProps } from "@/types/recipe.types"

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
  completed: 'bg-green-400/20 text-green-300 border border-green-400/30',
  canceled: 'bg-red-400/20 text-red-300 border border-red-400/30',
}

export function RecipeCard({ recipe, onView, onEdit, onDelete }: RecipeCardProps) {
  const t = useTranslations('recipeManagement')

  return (
    <Card className="group hover:scale-105 transition-all duration-300 backdrop-blur-xl bg-white/10 border-white/20 shadow-xl hover:shadow-2xl">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-white text-lg font-semibold leading-tight">
            {recipe.name}
          </CardTitle>
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[recipe.status] ?? ''}`}>
            {t(`status.${recipe.status}`)}
          </span>
        </div>
        {recipe.description && (
          <CardDescription className="text-white/70 text-sm mt-1 line-clamp-2">
            {recipe.description}
          </CardDescription>
        )}
        <div className="flex items-center gap-4 text-xs text-white/60 mt-2">
          <span>{t('portions', { count: recipe.reference_portions })}</span>
          {recipe.cost_per_portion && (
            <span>{t('costPerPortion', { cost: recipe.cost_per_portion })}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex gap-1">
          <Button
            onClick={() => onView(recipe.id)}
            variant="outline"
            size="sm"
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 text-xs"
          >
            <FiEye className="w-3 h-3 mr-1" />
            {t('actions.view')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(recipe)}
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            aria-label={t('actions.edit')}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(recipe)}
            className="text-white/70 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
            aria-label={t('actions.delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
