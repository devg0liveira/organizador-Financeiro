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
    new Set(transactions.map((transaction) => new Date(transaction.date).getFullYear()))
  )
    .sort((a, b) => b - a)
    .map(String)

  // Filtrar despesas por mês/ano selecionado
  const filteredExpenses = transactions
    .filter((transaction) => {
      if (transaction.type !== "expense") return false

      const date = new Date(transaction.date)
      const monthKey = String(date.getMonth() + 1).padStart(2, "0")
      const yearKey = String(date.getFullYear())

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
  dashboardData?.categoryBreakdown.forEach((cat) => {
    categoryMap.set(cat.name, { name: cat.name, total: 0, color: cat.color })
  })

  // Somar as despesas filtradas
  filteredExpenses.forEach((transaction) => {
    const catName = transaction.category?.name || "Sem categoria"
    const color = transaction.category?.color || "#94a3b8"

    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, { name: catName, total: 0, color })
    }

    const cat = categoryMap.get(catName)!
    cat.total += transaction.amount
  })

  const rawBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)
  const totalAmount = rawBreakdown.reduce((sum, item) => sum + item.total, 0)

  // Converter valores absolutos em percentuais para o gráfico de pizza
  const chartData = rawBreakdown.map((item) => ({
    name: item.name,
    value: totalAmount > 0 ? Math.round((item.total / totalAmount) * 100) : 0,
    amount: item.total,
    color: item.color,
  }))

  return (
    <div className="p-6 rounded-xl bg-card border border-border h-full flex flex-col justify-between">
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Despesas por Categoria
          </h3>
          <p className="text-sm text-muted-foreground">
            Distribuição das despesas
          </p>

          {/* Filtros de mês e ano */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
              <span className="text-xs text-muted-foreground">Ano:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
              <span className="text-xs text-muted-foreground">Mês:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos</SelectItem>
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
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 border border-dashed rounded-lg border-border text-center p-4">
            <span className="text-sm text-muted-foreground">
              Nenhuma despesa registrada no período.
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.01 260)",
                      border: "1px solid oklch(0.25 0.01 260)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{
                      color: "oklch(0.95 0 0)",
                    }}
                    labelStyle={{
                      color: "oklch(0.95 0 0)",
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value}% (R$ ${props.payload.amount.toFixed(2)})`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-4 max-h-[160px] overflow-y-auto pr-1">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-foreground block">
                      R$ {item.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
