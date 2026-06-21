"use client"

import { useFinance } from "@/hooks/use-finance"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function CashFlowChart() {
  const { dashboardData, isLoading } = useFinance()

  const data = dashboardData?.cashFlow || []

  // Verifica se há dados no fluxo de caixa (pelo menos receitas ou despesas maiores que 0)
  const hasData = data.some((d) => d.receitas > 0 || d.despesas > 0)

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Fluxo de Caixa
          </h3>
          <p className="text-sm text-muted-foreground">
            Receitas vs Despesas - Últimos 12 meses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1" />
            <span className="text-sm text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2" />
            <span className="text-sm text-muted-foreground">Despesas</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-80 text-sm text-muted-foreground">
          Carregando dados do gráfico...
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center h-80 border border-dashed rounded-lg border-border text-center">
          <span className="text-sm text-muted-foreground">
            Insira transações para ver o fluxo de caixa histórico.
          </span>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.18 45)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.18 45)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
              <XAxis
                dataKey="name"
                stroke="oklch(0.6 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.6 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.01 260)",
                  border: "1px solid oklch(0.25 0.01 260)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0 0)",
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value)
                }
              />
              <Area
                type="monotone"
                dataKey="receitas"
                stroke="oklch(0.75 0.15 160)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReceitas)"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                stroke="oklch(0.65 0.18 45)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDespesas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
