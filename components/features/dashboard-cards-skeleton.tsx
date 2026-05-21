"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardCardsSkeletonProps {
  count?: number
}

export function DashboardCardsSkeleton({ count = 8 }: DashboardCardsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl"
        >
          <CardHeader className="pb-3 lg:pb-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/20" />
              <Skeleton className="w-4 h-4 lg:w-5 lg:h-5 bg-white/20 rounded-sm" />
            </div>
          </CardHeader>

          <CardContent className="space-y-2 lg:space-y-3">
            <Skeleton className="h-6 w-36 bg-white/20 rounded-md" />
            <Skeleton className="h-4 w-full bg-white/20 rounded-md" />
            <Skeleton className="h-3 w-4/5 bg-white/20 rounded-md" />

            <div className="pt-2">
              <Skeleton className="h-1 w-full bg-white/20 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
