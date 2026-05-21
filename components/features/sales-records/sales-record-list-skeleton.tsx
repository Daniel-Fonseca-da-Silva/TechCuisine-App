"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function SalesRecordListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-white/10 border border-white/20"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-36 bg-white/20 rounded" />
              <Skeleton className="h-3 w-24 bg-white/20 rounded" />
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Skeleton className="h-4 w-20 bg-white/20 rounded" />
              <Skeleton className="h-3 w-16 bg-white/20 rounded sm:hidden" />
            </div>
          </div>
          <div className="hidden sm:flex gap-4 mt-2">
            <Skeleton className="h-3 w-28 bg-white/20 rounded" />
            <Skeleton className="h-3 w-16 bg-white/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
