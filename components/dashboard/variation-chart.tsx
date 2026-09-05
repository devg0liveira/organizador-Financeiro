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
  ReferenceLine,
} from "recharts"

export function VariationChart() {
  const { dashboardData, isLoading } = useFinance()

  const rawData = dashboardData?.cashFlow || []

  // Calcular variação líquida para cada mês (receitas - despesas)
  const data = rawData.map((d) => ({
    name: d.name,
    variacao: d.receitas - d.despesas,
    receitas: d.receitas,
    despesas: d.despesas,
  }))

  const hasData = rawData.some((d) => d.receitas > 0 || d.despesas > 0)

  // Contagem de meses com superávit vs déficit
  const superavitCount = data.filter((d) => d.variacao > 0).length
  const deficitCount = data.filter((d) => d.variacao < 0).length

  return (
    <div className="p-5 sm:p-6 rounded-lg bg-card border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              Balanço Líquido Mensal
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              Superávit vs Déficit
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Resultado líquido apurado mês a mês (Receitas menos Despesas)
          </p>
        </div>

        {/* Indicadores de Status */}
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-500 shrink-0" />
            <span className="font-medium text-foreground">Superávit</span>
            <span className="font-mono text-muted-foreground">({superavitCount} meses)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-xs bg-red-600 dark:bg-red-500 shrink-0" />
            <span className="font-medium text-foreground">Déficit</span>
            <span className="font-mono text-muted-foreground">({deficitCount} meses)</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-xs font-mono text-muted-foreground">
          Carregando variações...
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-md border-border text-center p-6">
          <span className="text-xs text-muted-foreground">
            Sem histórico suficiente para apuração de balanço líquido.
          </span>
          <span className="text-[11px] text-muted-foreground/70 mt-1">
            Lance movimentações financeiras para gerar a série de variações.
          </span>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="currentColor"
                className="text-border"
                vertical={false}
              />
              <ReferenceLine y={0} stroke="currentColor" className="text-muted-foreground" strokeWidth={1} />
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
                tickFormatter={(value) => `R$${value >= 1000 || value <= -1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload
                    const isPositive = item.variacao >= 0
                    return (
                      <div className="bg-card border border-border shadow-md rounded-md p-3 text-xs min-w-[200px]">
                        <p className="font-bold text-foreground mb-2 pb-1 border-b border-border font-mono uppercase tracking-wider">
                          Mês: {label}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Total Receitas:</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.receitas)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Total Despesas:</span>
                            <span className="font-mono text-red-600 dark:text-red-400 font-medium">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.despesas)}
                            </span>
                          </div>
                          <div className="pt-2 mt-1 border-t border-border flex items-center justify-between">
                            <span className="font-bold text-foreground">Resultado Líquido:</span>
                            <span
                              className={`font-mono font-bold ${
                                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {isPositive ? "+" : ""}
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.variacao)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="variacao" radius={[2, 2, 2, 2]} maxBarSize={38}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    /* ========================================
                       COR CONDICIONAL: Verde para positivo, Vermelho para negativo
                       
                       Lógica: entry.variacao >= 0 ? Verde : Vermelho
                       
                       Verde (#059669): Variação positiva = aumento de receita / redução de despesa
                       Vermelho (#dc2626): Variação negativa = redução de receita / aumento de despesa
                       
                       Cores relacionadas:
                       - Verde (receitas/positivo):
                         * Light: #059669 (verde escuro)
                         * Dark: #10b981 (verde brilhante)
                       
                       - Vermelho (despesas/negativo):
                         * Light: #dc2626 (vermelho médio)
                         * Dark: #ef4444 (vermelho brilhante)
                       
                       Paleta também usada em:
                       - cash-flow-chart.tsx (receitas vs despesas)
                       - globals.css (--success, --destructive)
                       
                       Sugestões de mudança para verde positivo:
                       - #16a34a (verde um pouco menos intenso)
                       - #22c55e (verde bem vibrante)
                       - #15803d (verde mais sóbrio/corporativo)
                       
                       Sugestões de mudança para vermelho negativo:
                       - #ef4444 (vermelho mais brilhante/alerta)
                       - #b91c1c (vermelho escuro/sério)
                       - #f87171 (vermelho claro/suave)
                    ======================================== */
                    fill={entry.variacao >= 0 ? "#059669" : "#dc2626"}
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

