"use client"

import { TrendingUp, TrendingDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  onActionClick: (type: "income" | "expense") => void
}

const actions = [
  { id: "income" as const, label: "Adicionar Receita", icon: TrendingUp },
  { id: "expense" as const, label: "Adicionar Despesa", icon: TrendingDown },
]

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Ações Rápidas</h3>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <action.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
