"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FiUser, FiSettings, FiCreditCard, FiGrid, FiArrowRight, FiShield, FiPackage, FiTruck, FiDollarSign, FiBarChart2, FiTag } from "react-icons/fi"
import { useTranslations } from "next-intl"

interface DashboardCardsProps {
  onCardClick: (section: string) => void
  isAdmin?: boolean
}

export function DashboardCards({ onCardClick, isAdmin = false }: DashboardCardsProps) {
  const t = useTranslations("dashboard.cards")

  const baseCards = [
    {
      id: "recipes",
      title: t("recipes.title"),
      description: t("recipes.description"),
      icon: FiGrid,
      gradient: "from-amber-400 to-amber-400",
      hoverGradient: "from-amber-500 to-amber-500"
    },
    {
      id: "ingredients",
      title: t("ingredients.title"),
      description: t("ingredients.description"),
      icon: FiPackage,
      gradient: "from-lime-400 to-green-500",
      hoverGradient: "from-lime-500 to-green-600"
    },
    {
      id: "suppliers",
      title: t("suppliers.title"),
      description: t("suppliers.description"),
      icon: FiTruck,
      gradient: "from-sky-400 to-cyan-500",
      hoverGradient: "from-sky-500 to-cyan-600"
    },
    {
      id: "sales-records",
      title: t("sales-records.title"),
      description: t("sales-records.description"),
      icon: FiDollarSign,
      gradient: "from-violet-400 to-purple-500",
      hoverGradient: "from-violet-500 to-purple-600"
    },
    {
      id: "price-observations",
      title: t("price-observations.title"),
      description: t("price-observations.description"),
      icon: FiTag,
      gradient: "from-indigo-400 to-purple-500",
      hoverGradient: "from-indigo-500 to-purple-600"
    },
    {
      id: "reports",
      title: t("reports.title"),
      description: t("reports.description"),
      icon: FiBarChart2,
      gradient: "from-teal-400 to-emerald-500",
      hoverGradient: "from-teal-500 to-emerald-600"
    },
    {
      id: "profile",
      title: t("profile.title"),
      description: t("profile.description"),
      icon: FiUser,
      gradient: "from-amber-400 to-orange-400",
      hoverGradient: "from-amber-500 to-orange-500"
    },
    {
      id: "settings",
      title: t("settings.title"),
      description: t("settings.description"),
      icon: FiSettings,
      gradient: "from-orange-400 to-red-400",
      hoverGradient: "from-orange-500 to-red-500"
    },
    {
      id: "plans",
      title: t("plans.title"),
      description: t("plans.description"),
      icon: FiCreditCard,
      gradient: "from-green-400 to-emerald-400",
      hoverGradient: "from-green-500 to-emerald-500"
    }
  ]

  const adminCard = {
    id: "admin",
    title: t("admin.title"),
    description: t("admin.description"),
    icon: FiShield,
    gradient: "from-amber-400 to-orange-500",
    hoverGradient: "from-amber-500 to-orange-600"
  }

  const cards = isAdmin ? [...baseCards, adminCard] : baseCards

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6">
      {cards.map((card) => {
        const Icon = card.icon
        
        return (
          <Card 
            key={card.id}
            className="group cursor-pointer backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 hover:scale-105"
            onClick={() => onCardClick(card.id)}
          >
            <CardHeader className="pb-3 lg:pb-4">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <FiArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2 lg:space-y-3">
              <CardTitle className="text-lg lg:text-xl font-bold text-white group-hover:text-white/90 transition-colors duration-300">
                {card.title}
              </CardTitle>
              <CardDescription className="text-white/80 text-xs lg:text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                {card.description}
              </CardDescription>
              
              <div className="pt-2">
                <div className={`h-1 w-full bg-gradient-to-r ${card.gradient} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
