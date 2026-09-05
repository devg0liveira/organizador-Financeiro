"use client"

import { ArrowDownLeft, ArrowUpRight, Plus, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  onActionClick: (type: "income" | "expense") => void
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="p-4 sm:p-5 rounded-lg bg-card border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase tracking-wider">
            Operações Rápidas
          </h2>
          <p className="text-xs text-muted-foreground">
            Lançamento imediato de receitas ou despesas com conciliação automática
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onActionClick("income")}
          className="flex items-center gap-3.5 p-3.5 rounded-md bg-secondary/70 hover:bg-secondary border border-border transition-colors text-left group"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-foreground">
              Registrar Receita
            </span>
            <span className="block text-[11px] text-muted-foreground truncate">
              Salário, comissões, rendimentos ou entradas avulsas
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onActionClick("expense")}
          className="flex items-center gap-3.5 p-3.5 rounded-md bg-secondary/70 hover:bg-secondary border border-border transition-colors text-left group"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 group-hover:bg-red-500/20 transition-colors shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-foreground">
              Registrar Despesa
            </span>
            <span className="block text-[11px] text-muted-foreground truncate">
              Custos fixos, contas, compras ou parcelas
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}

