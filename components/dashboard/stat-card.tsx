"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: LucideIcon
  trend: "up" | "down"
}

export function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0",
            trend === "up"
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-3 sm:mt-4 min-w-0">
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 truncate">{value}</p>
      </div>
    </div>
  )
}
