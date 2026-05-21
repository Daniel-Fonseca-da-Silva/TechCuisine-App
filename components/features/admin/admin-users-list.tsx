"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"
import { AdminUserDetailDialog, type AdminUserDetail } from "./admin-user-detail-dialog"
import { FiShield, FiUser, FiChevronLeft, FiChevronRight } from "react-icons/fi"

const PAGE_SIZE = 5

export interface AdminUserListItem {
  id: string
  name: string
  email: string
  admin: boolean
  created_at: string
  updated_at: string
}

interface AdminUsersListProps {
  onToggleAdmin: (userId: string) => Promise<void>
}

async function fetchUsers(limit: number, cursor?: string): Promise<{
  data: AdminUserListItem[]
  has_next_page: boolean
  next_cursor?: string
}> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set("cursor", cursor)
  const res = await fetch(`/api/admin/users?${params}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Failed to fetch users")
  return {
    data: json.data ?? [],
    has_next_page: json.pagination?.has_next_page ?? false,
    next_cursor: json.pagination?.next_cursor ?? undefined,
  }
}

async function fetchUserDetail(id: string): Promise<AdminUserDetail> {
  const res = await fetch(`/api/admin/users/${id}/detail`)
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Failed to fetch user detail")
  return json
}

export function AdminUsersList({ onToggleAdmin }: AdminUsersListProps) {
  const t = useTranslations("dashboard.admin")

  const [data, setData] = useState<AdminUserListItem[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  // cursorStack[i] = cursor to fetch page i (undefined = first page)
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailUser, setDetailUser] = useState<AdminUserDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadPage = useCallback(async (cursor: string | undefined) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchUsers(PAGE_SIZE, cursor)
      setData(result.data)
      setHasNextPage(result.has_next_page)
      // Push next cursor into stack if not already there for this position
      if (result.has_next_page && result.next_cursor) {
        setCursorStack((prev) => {
          const next = [...prev]
          if (next.length <= currentPage + 1) {
            next.push(result.next_cursor)
          }
          return next
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"))
    } finally {
      setLoading(false)
    }
  }, [currentPage, t])

  useEffect(() => {
    loadPage(cursorStack[currentPage])
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => {
    setCurrentPage((p) => p + 1)
  }

  const goPrev = () => {
    setCurrentPage((p) => Math.max(0, p - 1))
  }

  const openDetail = async (id: string) => {
    setLoadingDetailId(id)
    try {
      const user = await fetchUserDetail(id)
      setDetailUser(user)
      setDetailOpen(true)
    } catch {
      setError(t("error"))
    } finally {
      setLoadingDetailId(null)
    }
  }

  const handleToggleAdmin = async (userId: string) => {
    setTogglingId(userId)
    try {
      await onToggleAdmin(userId)
      await loadPage(cursorStack[currentPage])
      if (detailUser?.id === userId) {
        const updated = await fetchUserDetail(userId)
        setDetailUser(updated)
      }
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <>
      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white/90">{t("users")}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full bg-white/20" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <p className="text-white/70 text-sm">{t("users")}: 0</p>
          ) : (
            <div className="space-y-2">
              {/* Desktop header — hidden on mobile */}
              <div className="hidden md:grid md:grid-cols-12 gap-2 text-xs text-white/70 border-b border-white/20 pb-2">
                <span className="col-span-3">{t("name")}</span>
                <span className="col-span-4">{t("email")}</span>
                <span className="col-span-2">{t("admin")}</span>
                <span className="col-span-3">{t("actions")}</span>
              </div>

              {data.map((u) => (
                <div key={u.id} className="border-b border-white/10 last:border-0">
                  {/* Mobile card layout */}
                  <div className="md:hidden flex flex-col gap-2 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white font-medium truncate min-w-0">{u.name}</span>
                      {u.admin ? (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          <FiShield className="w-3 h-3" />Admin
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border border-white/20 text-white/50">
                          <FiUser className="w-3 h-3" />User
                        </span>
                      )}
                    </div>
                    <span className="text-white/60 text-xs truncate min-w-0">{u.email}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="glassGhost"
                        size="sm"
                        className="flex-1"
                        onClick={() => openDetail(u.id)}
                        disabled={loadingDetailId !== null}
                        aria-label={t("details")}
                      >
                        {loadingDetailId === u.id ? "..." : t("details")}
                      </Button>
                      <Button
                        variant="glassOutline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleAdmin(u.id)}
                        disabled={togglingId !== null}
                        aria-label={t("toggleAdmin")}
                      >
                        {togglingId === u.id ? "..." : t("toggleAdmin")}
                      </Button>
                    </div>
                  </div>

                  {/* Desktop row layout */}
                  <div className="hidden md:grid md:grid-cols-12 gap-2 items-center py-2 text-sm">
                    <span className="col-span-3 text-white truncate min-w-0">{u.name}</span>
                    <span className="col-span-4 text-white/80 truncate min-w-0">{u.email}</span>
                    <span className="col-span-2">
                      {u.admin ? (
                        <FiShield className="w-4 h-4 text-amber-400" />
                      ) : (
                        <FiUser className="w-4 h-4 text-white/50" />
                      )}
                    </span>
                    <div className="col-span-3 flex min-w-0 max-w-full flex-col gap-1">
                      <Button
                        variant="glassGhost"
                        size="sm"
                        className="h-auto min-h-8 w-full justify-center whitespace-normal px-2 py-1.5 text-center"
                        onClick={() => openDetail(u.id)}
                        disabled={loadingDetailId !== null}
                      >
                        {loadingDetailId === u.id ? "..." : t("details")}
                      </Button>
                      <Button
                        variant="glassOutline"
                        size="sm"
                        className="h-auto min-h-8 w-full justify-center whitespace-normal px-2 py-1.5 text-center"
                        onClick={() => handleToggleAdmin(u.id)}
                        disabled={togglingId !== null}
                      >
                        {togglingId === u.id ? "..." : t("toggleAdmin")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-3">
                <span className="text-white/50 text-xs">
                  {t("pageLabel", { page: currentPage + 1 })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="glassOutline"
                    size="sm"
                    onClick={goPrev}
                    disabled={currentPage === 0}
                  >
                    <FiChevronLeft className="w-4 h-4 mr-1" />
                    {t("prevPage")}
                  </Button>
                  <Button
                    variant="glassOutline"
                    size="sm"
                    onClick={goNext}
                    disabled={!hasNextPage}
                  >
                    {t("nextPage")}
                    <FiChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminUserDetailDialog
        user={detailUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  )
}
