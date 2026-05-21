"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function PriceObservationSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* KPI cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/10 border border-white/20 p-5 space-y-3">
            <Skeleton className="h-3 w-24 bg-white/20 rounded" />
            <Skeleton className="h-8 w-32 bg-white/20 rounded" />
          </div>
        ))}
      </div>

      {/* Ingredient selector + best prices */}
      <div className="rounded-xl bg-white/10 border border-white/20 p-5 space-y-4">
        <Skeleton className="h-4 w-40 bg-white/20 rounded" />
        <Skeleton className="h-10 w-full bg-white/20 rounded" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <Skeleton className="h-3 w-6 bg-white/20 rounded" />
              <Skeleton className="h-4 w-24 bg-white/20 rounded" />
              <Skeleton className="h-3 w-16 bg-white/20 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* History list */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20"
          >
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-4 w-36 bg-white/20 rounded" />
              <Skeleton className="h-3 w-24 bg-white/20 rounded" />
            </div>
            <Skeleton className="h-6 w-20 bg-white/20 rounded ml-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
