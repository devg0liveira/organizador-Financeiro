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
  const hasData = data.some((d) => d.receitas > 0 || d.despesas > 0)

  // Totais do período exibido no gráfico
  const totalReceitas = data.reduce((acc, curr) => acc + curr.receitas, 0)
  const totalDespesas = data.reduce((acc, curr) => acc + curr.despesas, 0)
  const saldoPeriodo = totalReceitas - totalDespesas

  return (
    <div className="p-5 sm:p-6 rounded-lg bg-card border border-border flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              Demonstrativo de Fluxo de Caixa
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              Histórico 12 Meses
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comparativo entre entradas e saídas liquidadas
          </p>
        </div>

        {/* Legenda com Redundância Visual e Valores */}
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-500 shrink-0" />
            <span className="font-medium text-foreground">Receitas</span>
            <span className="font-mono text-muted-foreground">
              ({new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(totalReceitas)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-xs bg-red-600 dark:bg-red-500 shrink-0" />
            <span className="font-medium text-foreground">Despesas</span>
            <span className="font-mono text-muted-foreground">
              ({new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(totalDespesas)})
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-72 text-xs font-mono text-muted-foreground">
          Carregando série histórica...
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center h-72 border border-dashed rounded-md border-border text-center p-6">
          <p className="text-xs text-muted-foreground">
            Nenhuma movimentação registrada no histórico de 12 meses.
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            Lance receitas e despesas para visualizar a curva de fluxo de caixa.
          </p>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="currentColor"
                className="text-border"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="currentColor"
                className="text-muted-foreground text-[11px]"
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="currentColor"
                className="text-muted-foreground text-[11px] font-mono"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rec = Number(payload.find((p) => p.dataKey === "receitas")?.value || 0)
                    const desp = Number(payload.find((p) => p.dataKey === "despesas")?.value || 0)
                    const saldo = rec - desp
                    return (
                      <div className="bg-card border border-border shadow-md rounded-md p-3 text-xs min-w-[190px]">
                        <p className="font-bold text-foreground mb-2 pb-1 border-b border-border font-mono uppercase tracking-wider">
                          Mês: {label}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <span className="w-2 h-2 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
                              Receitas:
                            </span>
                            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(rec)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <span className="w-2 h-2 rounded-xs bg-red-600 dark:bg-red-500" />
                              Despesas:
                            </span>
                            <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(desp)}
                            </span>
                          </div>
                          <div className="pt-1.5 border-t border-border flex items-center justify-between gap-4">
                            <span className="font-medium text-foreground">Saldo Líquido:</span>
                            <span
                              className={`font-mono font-bold ${
                                saldo >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {saldo >= 0 ? "+" : ""}
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldo)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="receitas"
                /* ========================================
                   COR DE RECEITAS: Verde Esmeralda Escuro
                   
                   Usado em: Gráfico de fluxo de caixa, linhas indicando entrada de dinheiro
                   Associação: Verde = Positivo, ganho, receita
                   
                   Cores relacionadas:
                   - Light Mode: #059669 (verde escuro)
                   - Dark Mode: #10b981 (verde mais brilhante)
                   - Success color em globals.css
                   
                   Se mudar aqui, considerar mudar também:
                   - globals.css (--success)
                   - variation-chart.tsx (receitas positivas)
                   - lib/defaults.ts (categorias de receita)
                   
                   Sugestões de mudança:
                   - #15803d (verde mais sóbrio)
                   - #16a34a (verde mais vivo)
                   - #22c55e (verde bem brilhante)
                ======================================== */
                stroke="#059669"
                strokeWidth={2}
                fill="#059669"
                fillOpacity={0.08}
                dot={{ r: 3, fill: "#059669" }}
                activeDot={{ r: 5 }}
              />
              <Area
                type="monotone"
                dataKey="despesas"
                /* ========================================
                   COR DE DESPESAS: Vermelho Carmim
                   
                   Usado em: Gráfico de fluxo de caixa, linhas indicando saída de dinheiro
                   Associação: Vermelho = Negativo, gasto, despesa
                   
                   Cores relacionadas:
                   - Light Mode: #dc2626 (vermelho médio)
                   - Dark Mode: #ef4444 (vermelho mais brilhante)
                   - Destructive color em globals.css
                   
                   Se mudar aqui, considerar mudar também:
                   - globals.css (--destructive)
                   - variation-chart.tsx (despesas negativas)
                   
                   Sugestões de mudança:
                   - #991b1b (vermelho escuro/sério)
                   - #f87171 (vermelho mais claro)
                   - #e11d48 (rosa-vermelho/moderno)
                ======================================== */
                stroke="#dc2626"
                strokeWidth={2}
                fill="#dc2626"
                fillOpacity={0.08}
                dot={{ r: 3, fill: "#dc2626" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

