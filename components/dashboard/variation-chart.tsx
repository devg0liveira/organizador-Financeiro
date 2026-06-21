"use client"

import { useFinance } from "@/hooks/use-finance"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

export function VariationChart() {
  const { dashboardData, isLoading } = useFinance()

  const rawData = dashboardData?.cashFlow || []

  // Calcular variação líquida para cada mês (receitas - despesas)
  const data = rawData.map((d) => ({
    name: d.name,
    variacao: d.receitas - d.despesas,
  }))

  const hasData = rawData.some((d) => d.receitas > 0 || d.despesas > 0)

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Variação Mensal
          </h3>
          <p className="text-sm text-muted-foreground">
            Saldo líquido por mês (Receitas - Despesas)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1" style={{ backgroundColor: "oklch(0.75 0.15 160)" }} />
            <span className="text-sm text-muted-foreground">Positivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-5" style={{ backgroundColor: "oklch(0.6 0.2 25)" }} />
            <span className="text-sm text-muted-foreground">Negativo</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
          Carregando dados...
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center h-64 border border-dashed rounded-lg border-border text-center">
          <span className="text-sm text-muted-foreground">
            Sem dados de movimentações no histórico para computar variações.
          </span>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" vertical={false} />
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
                  color: "#ffffff",
                }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#ffffff" }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value)
                }
              />
              <Bar dataKey="variacao" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.variacao >= 0 ? "oklch(0.75 0.15 160)" : "oklch(0.6 0.2 25)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
