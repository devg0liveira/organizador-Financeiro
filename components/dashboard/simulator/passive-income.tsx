"use client"

import type { SimulationResult } from "@/lib/investment"
import { formatBRLPrecise } from "@/lib/investment"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { PiggyBank, Sparkles } from "lucide-react"

interface PassiveIncomeProps {
  result: SimulationResult
  years: number
}

export function PassiveIncome({ result, years }: PassiveIncomeProps) {
  const isAdjusted = result.adjustInflation

  // renda mensal potencial ao final de cada ano (vivendo só dos juros)
  const data = result.rows
    .filter((row) => row.year > 0)
    .map((row) => ({
      year: `${row.year}º`,
      realIncome: row.realMonthlyIncome,
      nominalIncome: row.monthlyIncome,
      income: isAdjusted ? row.realMonthlyIncome : row.monthlyIncome,
    }))

  return (
    <Card className="gap-0 p-0 border border-border/80 shadow-sm overflow-visible">
      <div className="grid gap-0 md:grid-cols-[380px_1fr] lg:grid-cols-[420px_1fr] rounded-xl overflow-hidden">
        <div className="flex flex-col justify-between gap-4 bg-primary p-6 sm:p-7 text-primary-foreground">
          <div className="flex items-center gap-2">
            <PiggyBank className="size-5 text-primary-foreground/90 shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/90 flex items-center gap-1.5">
              Renda passiva mensal
              <InfoTooltip
                title="O que é Renda Passiva?"
                content="É como se fosse um 'salário mensal' pago pelos seus investimentos. O seu patrimônio total fica rendendo, e você pode sacar apenas esses juros mensalmente sem diminuir seu dinheiro guardado."
                iconClassName="text-primary-foreground/80 hover:text-primary-foreground"
              />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-mono text-3xl sm:text-4xl lg:text-[2.5rem] font-bold tabular-nums tracking-tight leading-none">
                {formatBRLPrecise(isAdjusted ? result.realMonthlyIncome : result.monthlyIncome)}
              </p>
              {isAdjusted && (
                <span className="rounded-md bg-primary-foreground/20 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                  Hoje
                </span>
              )}
            </div>

            {/* Número nominal exibido lado a lado */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 rounded-xl bg-foreground/10 px-3.5 py-2.5 text-xs text-primary-foreground">
              <span className="text-primary-foreground/85 flex items-center gap-1 shrink-0">
                {isAdjusted ? "Nominal futuro recebido:" : "Poder de compra:"}
                <InfoTooltip
                  title={isAdjusted ? "Nominal na conta bancária" : "Valor em poder de compra"}
                  content={
                    isAdjusted
                      ? "Este é o valor exato em cédulas/números que cairia na sua conta bancária no futuro. Porém, devido ao aumento dos preços com a inflação ao longo dos anos, ele corresponderá ao valor em destaque acima no mercado."
                      : "Valor ajustado ao poder de compra atual do seu bolso."
                  }
                  iconClassName="text-primary-foreground/80 hover:text-primary-foreground"
                />
              </span>
              <span className="font-mono font-bold tabular-nums">
                {formatBRLPrecise(isAdjusted ? result.monthlyIncome : result.realMonthlyIncome)}/mês
              </span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-primary-foreground/85 text-pretty">
            {isAdjusted ? (
              <>
                Equivale a receber hoje <strong className="font-semibold">{formatBRLPrecise(result.realMonthlyIncome)}/mês</strong> em poder de compra real, após {years} {years === 1 ? "ano" : "anos"}, mantendo o patrimônio intacto.
              </>
            ) : (
              <>
                É quanto seu patrimônio renderia por mês ao final de {years} {years === 1 ? "ano" : "anos"}, vivendo apenas dos juros.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col justify-between gap-3 p-6 sm:p-7 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Evolução da renda mensal {isAdjusted ? "(Poder de Compra de Hoje)" : "(Nominal)"}
              <InfoTooltip
                title="Crescimento da sua Renda Mensal"
                content="Veja como a cada ano que passa, os juros compostos fazem sua 'aposentadoria mensal' crescer de forma cada vez mais acelerada."
              />
            </span>
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              IPCA: {result.inflationRate}% a.a.
            </span>
          </div>

          <ChartContainer
            config={{
              income: {
                label: isAdjusted ? "Renda real (hoje)" : "Renda nominal",
                color: "var(--chart-1)",
              },
            }}
            className="h-[200px] w-full"
          >
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const item = payload[0]?.payload
                  return (
                    <div className="rounded-lg border border-border bg-popover p-3 text-xs shadow-xl space-y-1.5 min-w-[210px] text-popover-foreground">
                      <p className="font-semibold text-foreground">Ano {label}</p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-primary font-medium flex items-center gap-1">
                          <Sparkles className="size-3" />
                          Poder de compra (hoje):
                        </span>
                        <span className="font-mono font-bold tabular-nums text-foreground">
                          {formatBRLPrecise(item.realIncome)}/mês
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-1 text-muted-foreground">
                        <span>Nominal futuro:</span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatBRLPrecise(item.nominalIncome)}/mês
                        </span>
                      </div>
                    </div>
                  )
                }}
              />
              <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </Card>
  )
}
