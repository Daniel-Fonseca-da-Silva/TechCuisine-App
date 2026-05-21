"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"

export interface AdminUserDetail {
  id: string
  name: string
  email: string
  admin: boolean
  created_at: string
  updated_at: string
}

interface AdminUserDetailDialogProps {
  user: AdminUserDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function AdminUserDetailDialog({ user, open, onOpenChange }: AdminUserDetailDialogProps) {
  const t = useTranslations("dashboard.admin")

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20 text-foreground">
        <DialogHeader>
          <DialogTitle>{t("userDetail")}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">{t("id")}</dt>
            <dd className="font-mono">{user.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("name")}</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("email")}</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("admin")}</dt>
            <dd>{user.admin ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("createdAt")}</dt>
            <dd>{formatDate(user.created_at)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("updatedAt")}</dt>
            <dd>{formatDate(user.updated_at)}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  )
}
