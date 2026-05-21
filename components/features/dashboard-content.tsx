"use client"

import { useEffect, Suspense, lazy } from "react"
import { ManageRecipesSection } from "./manage-recipes/manage-recipes-section"
import { ReportsSection } from "./reports/reports-section"
import { IngredientsSection } from "./ingredients/ingredients"
import { PlatesSection } from "./plates/plates"
import { SuppliersSection } from "./suppliers/suppliers"
import { SalesRecordsSection } from "./sales-records/sales-records"
import { PriceObservationSection } from "./price-observation/price-observation"
import { ProfileSection } from "./profile/profile-section"
import { SettingsSection } from "./settings/settings-section"
import { PlansSection } from "./my-plans/plans-section"
import { AdminSection } from "./admin/admin-section"
import { DashboardCardsSkeleton } from "./dashboard-cards-skeleton"
import { useTranslations } from "next-intl"

const DashboardCards = lazy(() =>
  import("./dashboard-cards").then((m) => ({ default: m.DashboardCards }))
)

interface DashboardContentProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isAdmin?: boolean
  userRoles?: string[]
  onUserDataRefetch?: () => void
}

export function DashboardContent({ activeSection, onSectionChange, isAdmin = false, userRoles, onUserDataRefetch }: DashboardContentProps) {
  const t = useTranslations("dashboard.admin")

  useEffect(() => {
    if (activeSection === "admin" && !isAdmin) {
      onSectionChange("dashboard")
    }
  }, [activeSection, isAdmin, onSectionChange])

  const renderContent = () => {
    if (activeSection === "admin" && !isAdmin) {
      return (
        <div className="p-4 lg:p-6 flex items-center justify-center min-h-[200px]">
          <p className="text-white/80 text-center">{t("accessDenied")}</p>
        </div>
      )
    }
    switch (activeSection) {
      case "recipes":
        return <ManageRecipesSection onSectionChange={onSectionChange} />
      case "ingredients":
        return <IngredientsSection onSectionChange={onSectionChange} />
      case "plates":
        return <PlatesSection onSectionChange={onSectionChange} />
      case "suppliers":
        return <SuppliersSection onSectionChange={onSectionChange} />
      case "sales-records":
        return <SalesRecordsSection onSectionChange={onSectionChange} />
      case "price-observations":
        return <PriceObservationSection onSectionChange={onSectionChange} />
      case "reports":
        return <ReportsSection onSectionChange={onSectionChange} />
      case "profile":
        return <ProfileSection onSectionChange={onSectionChange} onUserDataRefetch={onUserDataRefetch} />
      case "settings":
        return <SettingsSection onSectionChange={onSectionChange} />
      case "plans":
        return <PlansSection onSectionChange={onSectionChange} />
      case "admin":
        return (
          <AdminSection
            onSectionChange={onSectionChange}
            onAccessDenied={() => onSectionChange("dashboard")}
          />
        )
      default:
        return (
          <Suspense fallback={<DashboardCardsSkeleton count={isAdmin ? 10 : 9} />}>
            <DashboardCards onCardClick={onSectionChange} isAdmin={isAdmin} />
          </Suspense>
        )
    }
  }

  return (
    <div>
      {renderContent()}
    </div>
  )
}
