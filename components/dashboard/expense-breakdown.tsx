"use client"

import { useState } from "react"
import { useFinance } from "@/hooks/use-finance"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Utensils,
  Home,
  Car,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  Shirt,
  Tv,
  Ellipsis,
  Tag,
} from "lucide-react"

// Mapeamento categórico acessível com alto contraste de matiz e luminância
// =========================================================================
// IMPORTANTE: Cores duplicadas de lib/defaults.ts para compatibilidade
// Se alterar cores aqui, DEVE alterar também em:
//   - lib/defaults.ts
//   - globals.css (variáveis --chart-1 até --chart-9)
//   - components/dashboard/cash-flow-chart.tsx
//   - components/dashboard/variation-chart.tsx
//
// ACESSIBILIDADE: Paleta testada para daltônicos (cores distintas por matiz + luminância)
// Não usar cores que dependem APENAS de saturação (ex: vermelho puro vs rosa)
// =========================================================================

const CATEGORY_COLOR_MAP: Record<string, string> = {
  "Alimentação": "#d97706",   
  // Âmbar Quente: Evoca comida, calor
  // Mudança: #e8a608 (mais ouro) ou #dc8b35 (mais natural)
  
  "Moradia": "#2563eb",       
  // Azul Royal: Maior despesa, estabilidade
  // Mudança: #1e40af (mais corporativo) ou #3b82f6 (mais claro/amigável)
  
  "Transporte": "#0d9488",     
  // Teal: Mobilidade, movimento
  // Mudança: #14b8a6 (mais brilhante) ou #0f766e (mais sóbrio)
  
  "Saúde": "#dc2626",         
  // Carmim/Vermelho: Urgência médica
  // Mudança: #ef4444 (mais alerta) ou #b91c1c (mais sério)
  
  "Educação": "#7c3aed",      
  // Violeta: Conhecimento, desenvolvimento
  // Mudança: #a855f7 (mais claro) ou #6d28d9 (mais acadêmico)
  
  "Lazer": "#be185d",         
  // Framboesa/Rosa: Diversão, entretenimento
  // Mudança: #ec4899 (mais vivo) ou #831843 (mais discreto)
  
  "Vestuário": "#65a30d",     
  // Verde Oliva/Lima: Fashion, estilo
  // Mudança: #84cc16 (mais limão) ou #4d7c0f (mais sóbrio)
  
  "Assinaturas": "#475569",   
  // Slate Médio: Serviços recorrentes
  // Mudança: #64748b (mais claro) ou #1e293b (mais corporativo)
  
  "Outros Gastos": "#64748b", 
  // Cinza Grafite: Categoria genérica
  // Mudança: #94a3b8 (mais claro) ou #475569 (mais escuro)
}

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  "Alimentação": Utensils,
  "Moradia": Home,
  "Transporte": Car,
  "Saúde": HeartPulse,
  "Educação": GraduationCap,
  "Lazer": Gamepad2,
  "Vestuário": Shirt,
  "Assinaturas": Tv,
  "Outros Gastos": Ellipsis,
}

// Cores de fallback distintas se houver categorias customizadas
const FALLBACK_PALETTE = [
  "#2563eb",
  "#d97706",
  "#0d9488",
  "#7c3aed",
  "#dc2626",
  "#be185d",
  "#65a30d",
  "#475569",
  "#64748b",
]

export function ExpenseBreakdown() {
  const { transactions, dashboardData, isLoading } = useFinance()
  const ALL_OPTION = "all"
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_OPTION)
  const [selectedYear, setSelectedYear] = useState<string>(ALL_OPTION)

  const MONTH_OPTIONS = [
    { key: "01", label: "Janeiro" },
    { key: "02", label: "Fevereiro" },
    { key: "03", label: "Março" },
    { key: "04", label: "Abril" },
    { key: "05", label: "Maio" },
    { key: "06", label: "Junho" },
    { key: "07", label: "Julho" },
    { key: "08", label: "Agosto" },
    { key: "09", label: "Setembro" },
    { key: "10", label: "Outubro" },
    { key: "11", label: "Novembro" },
    { key: "12", label: "Dezembro" },
  ]

  const yearOptions = Array.from(
    new Set(transactions.map((transaction) => new Date(transaction.date).getUTCFullYear()))
  )
    .sort((a, b) => b - a)
    .map(String)

  // Filtrar despesas por mês/ano selecionado
  const filteredExpenses = transactions
    .filter((transaction) => {
      if (transaction.type !== "expense") return false

      const date = new Date(transaction.date)
      const monthKey = String(date.getUTCMonth() + 1).padStart(2, "0")
      const yearKey = String(date.getUTCFullYear())

      if (selectedYear !== ALL_OPTION && yearKey !== selectedYear) {
        return false
      }

      if (selectedMonth !== ALL_OPTION && monthKey !== selectedMonth) {
        return false
      }

      return true
    })

  // Agrupar por categoria
  const categoryMap = new Map<string, { name: string; total: number; color: string }>()

  // Preencher com as categorias conhecidas do dashboard
  dashboardData?.categoryBreakdown.forEach((cat, index) => {
    const assignedColor = CATEGORY_COLOR_MAP[cat.name] || cat.color || FALLBACK_PALETTE[index % FALLBACK_PALETTE.length]
    categoryMap.set(cat.name, { name: cat.name, total: 0, color: assignedColor })
  })

  // Somar as despesas filtradas
  filteredExpenses.forEach((transaction) => {
    const catName = transaction.category?.name || "Sem categoria"
    const assignedColor = CATEGORY_COLOR_MAP[catName] || transaction.category?.color || "#64748b"

    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, { name: catName, total: 0, color: assignedColor })
    }

    const cat = categoryMap.get(catName)!
    cat.total += transaction.amount
  })

  const rawBreakdown = Array.from(categoryMap.values())
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)

  const totalAmount = rawBreakdown.reduce((sum, item) => sum + item.total, 0)

  // Converter valores absolutos em percentuais para o gráfico de pizza
  const chartData = rawBreakdown.map((item, index) => {
    const percentage = totalAmount > 0 ? (item.total / totalAmount) * 100 : 0
    return {
      name: item.name,
      value: percentage,
      percentageFormatted: percentage.toFixed(1),
      amount: item.total,
      color: item.color || FALLBACK_PALETTE[index % FALLBACK_PALETTE.length],
    }
  })

  return (
    <div className="p-5 sm:p-6 rounded-lg bg-card border border-border h-full flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-foreground">
              Despesas por Categoria
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              {totalAmount > 0 ? `${chartData.length} categorias` : "0 categorias"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Composição percentual e monetária
          </p>

          {/* Filtros de mês e ano */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">
                Ano Base
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full h-8 text-xs bg-secondary/50">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos os Anos</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">
                Mês Base
              </label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full h-8 text-xs bg-secondary/50">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos os Meses</SelectItem>
                  {MONTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-xs font-mono text-muted-foreground">
            Calculando distribuição...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-md border-border text-center p-4">
            <span className="text-xs text-muted-foreground">
              Nenhuma despesa registrada para o período selecionado.
            </span>
            <span className="text-[10px] text-muted-foreground/70 mt-1">
              Ajuste os filtros de ano e mês ou lance novos gastos.
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center h-44 relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="bg-card border border-border shadow-md rounded-md p-2.5 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-foreground mb-1">
                              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </div>
                            <div className="font-mono text-muted-foreground flex items-center justify-between gap-3">
                              <span>Participação:</span>
                              <span className="font-semibold text-foreground">{item.percentageFormatted}%</span>
                            </div>
                            <div className="font-mono text-muted-foreground flex items-center justify-between gap-3">
                              <span>Total Gasto:</span>
                              <span className="font-semibold text-foreground">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.amount)}
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centro do Donut com Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Total Despesas</span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(totalAmount)}
                </span>
              </div>
            </div>

            {/* Lista Auditável e Acessível com Rótulo, Barra de Proporção e Valor */}
            <div className="space-y-2 mt-3 max-h-[180px] sm:max-h-[220px] lg:max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar">
              {chartData.map((item) => {
                const IconComponent = CATEGORY_ICON_MAP[item.name] || Tag
                return (
                  <div
                    key={item.name}
                    className="p-2 rounded-md bg-secondary/40 hover:bg-secondary/70 border border-border/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-5 h-5 rounded-xs flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.color}20`, color: item.color }}
                        >
                          <IconComponent className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium text-foreground truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-card border border-border text-muted-foreground">
                          {item.percentageFormatted}%
                        </span>
                        <span className="text-xs font-mono font-semibold text-foreground">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.amount)}
                        </span>
                      </div>
                    </div>
                    {/* Barra de Proporção Visual */}
                    <div className="w-full bg-border/60 rounded-full h-1 mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(2, item.value))}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

