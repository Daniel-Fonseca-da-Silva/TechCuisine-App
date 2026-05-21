"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function RecipeSkeleton() {
  return (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20">
      <CardHeader className="p-4">
        <Skeleton className="h-6 bg-white/20 rounded mb-2" />
        <Skeleton className="h-4 bg-white/20 rounded mb-3" />
        <div className="flex justify-between mb-3">
          <Skeleton className="h-3 w-20 bg-white/20 rounded" />
          <Skeleton className="h-3 w-16 bg-white/20 rounded" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-8 bg-white/20 rounded" />
      </CardContent>
    </Card>
  )
}
