"use client"

import type { ScenarioKey, ScenarioMeta, ScenarioRow } from "@/lib/investment"
import { formatBRL, formatBRLPrecise } from "@/lib/investment"
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Sparkles } from "lucide-react"

const chartConfig = {
  otimista: { label: "Otimista", color: "var(--chart-3)" },
  realista: { label: "Realista", color: "var(--chart-1)" },
  pessimista: { label: "Pessimista", color: "var(--chart-2)" },
  invested: { label: "Investido", color: "var(--muted-foreground)" },
} satisfies ChartConfig

export function GrowthChart({
  rows,
  scenarios,
  adjustInflation,
}: {
  rows: ScenarioRow[]
  scenarios: ScenarioMeta[]
  adjustInflation: boolean
}) {
  const rateByKey = Object.fromEntries(
    scenarios.map((s) => [s.key, s.monthlyRate]),
  ) as Record<ScenarioKey, number>

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[380px] w-full">
      <ComposedChart data={rows} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(v) => (v === 0 ? "Hoje" : `${v}a`)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) =>
            v >= 1000
              ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`
              : `${v}`
          }
        />
        <ChartTooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={<ScenarioTooltip rateByKey={rateByKey} adjustInflation={adjustInflation} />}
        />
        {/* Faixa sombreada entre pessimista e otimista */}
        <Area
          dataKey="bandLow"
          stackId="band"
          stroke="none"
          fill="transparent"
          isAnimationActive={false}
        />
        <Area
          dataKey="bandSpan"
          stackId="band"
          stroke="none"
          fill="url(#fillBand)"
          isAnimationActive={false}
        />
        {/* Referência: total investido (sem juros) */}
        <Line
          dataKey="invested"
          type="monotone"
          stroke="var(--color-invested)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="displayPessimista"
          type="monotone"
          stroke="var(--color-pessimista)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="displayOtimista"
          type="monotone"
          stroke="var(--color-otimista)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="displayRealista"
          type="monotone"
          stroke="var(--color-realista)"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  )
}

function ScenarioTooltip({
  active,
  payload,
  rateByKey,
  adjustInflation,
}: {
  active?: boolean
  payload?: Array<{ payload: ScenarioRow }>
  rateByKey: Record<ScenarioKey, number>
  adjustInflation: boolean
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null

  const order: Array<{
    key: ScenarioKey
    label: string
    color: string
    nominalValue: number
    realValue: number
  }> = [
    {
      key: "otimista",
      label: "Otimista",
      color: "var(--chart-3)",
      nominalValue: row.otimista,
      realValue: row.realOtimista,
    },
    {
      key: "realista",
      label: "Realista",
      color: "var(--chart-1)",
      nominalValue: row.realista,
      realValue: row.realRealista,
    },
    {
      key: "pessimista",
      label: "Pessimista",
      color: "var(--chart-2)",
      nominalValue: row.pessimista,
      realValue: row.realPessimista,
    },
  ]

  return (
    <div className="min-w-[260px] rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs shadow-lg">
      <div className="mb-2 flex items-center justify-between border-b pb-1.5 font-medium text-foreground">
        <span>{row.year === 0 ? "Momento Inicial" : `Ano ${row.year}`}</span>
        {adjustInflation && (
          <span className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            <Sparkles className="size-2.5" /> Valores de hoje
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {order.map((o) => {
          const rate = rateByKey[o.key] ?? 0
          const primaryVal = adjustInflation ? o.realValue : o.nominalValue
          const secondaryVal = adjustInflation ? o.nominalValue : o.realValue
          const monthlyIncome = primaryVal * rate

          return (
            <div key={o.key} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="size-2 rounded-[2px]" style={{ backgroundColor: o.color }} />
                  {o.label}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono font-bold tabular-nums text-foreground">
                    {formatBRL(primaryVal)}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    ({formatBRL(secondaryVal)} nom.)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end text-[10px] text-muted-foreground font-mono">
                renda: ~{formatBRLPrecise(monthlyIncome)}/mês
              </div>
            </div>
          )
        })}

        <div className="mt-1 flex items-center justify-between gap-4 border-t border-border pt-1.5 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-[2px] border border-dashed border-muted-foreground"
              style={{ backgroundColor: "transparent" }}
            />
            Total Investido (aportes)
          </span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatBRL(row.invested)}
          </span>
        </div>
      </div>
    </div>
  )
}
