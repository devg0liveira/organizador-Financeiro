"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: number
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  subtitle?: string
  badgeVariant?: "income" | "expense" | "neutral" | "investment"
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  subtitle,
  badgeVariant = "neutral",
}: StatCardProps) {
  const isPositive = trend === "up"
  const isNegative = trend === "down"

  return (
    <div className="p-5 rounded-lg bg-card border border-border transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-secondary text-foreground border border-border/70 shrink-0">
            <Icon className="w-4 h-4 text-foreground/80" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>

        {typeof change === "number" && change !== 0 && (
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium border",
              badgeVariant === "income" || (badgeVariant === "neutral" && isPositive)
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : badgeVariant === "expense" || (badgeVariant === "neutral" && isNegative)
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                : "bg-secondary text-muted-foreground border-border"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold font-mono tracking-tight text-foreground" data-tabular="true">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

