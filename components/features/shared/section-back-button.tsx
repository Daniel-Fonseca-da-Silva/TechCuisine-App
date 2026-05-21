"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { FiArrowLeft } from "react-icons/fi"

interface SectionBackButtonProps {
  onClick: () => void
  className?: string
}

export function SectionBackButton({ onClick, className }: SectionBackButtonProps) {
  const t = useTranslations("navigation")

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`text-white/80 hover:text-white hover:bg-white/10 border border-white/20${className ? ` ${className}` : ""}`}
      data-testid="section-back-button"
    >
      <FiArrowLeft className="size-4" aria-hidden />
      {t("sectionBack")}
    </Button>
  )
}
