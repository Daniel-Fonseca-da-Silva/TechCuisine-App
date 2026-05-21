"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function PlateListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20"
        >
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-40 bg-white/20 rounded" />
            <Skeleton className="h-3 w-28 bg-white/20 rounded" />
          </div>
          <div className="flex gap-2 ml-4">
            <Skeleton className="h-8 w-8 bg-white/20 rounded" />
            <Skeleton className="h-8 w-8 bg-white/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
