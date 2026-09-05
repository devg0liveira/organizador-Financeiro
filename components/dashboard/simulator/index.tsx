"use client"

import { useMemo, useState } from "react"
import {
  formatBRL,
  simulateInvestment,
  simulateScenarios,
  type ScenarioMeta,
  type SimulationInput,
} from "@/lib/investment"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InputPanel } from "@/components/dashboard/simulator/input-panel"
import { SummaryCards } from "@/components/dashboard/simulator/summary-cards"
import { GrowthChart } from "@/components/dashboard/simulator/growth-chart"
import { YearlyTable } from "@/components/dashboard/simulator/yearly-table"
import { PassiveIncome } from "@/components/dashboard/simulator/passive-income"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { LineChart, TrendingUp, Sparkles } from "lucide-react"

const initialValues: SimulationInput = {
  initial: 5000,
  monthly: 500,
  annualRate: 12,
  years: 15,
  inflationRate: 4.5,
  adjustInflation: true,
}

export function Simulator() {
  const [values, setValues] = useState<SimulationInput>(initialValues)
  const result = useMemo(() => simulateInvestment(values), [values])
  const scenarios = useMemo(() => simulateScenarios(values), [values])

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-primary">
          <TrendingUp className="size-5" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-wide">Simulador de investimentos</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
          Veja seu dinheiro crescer com juros compostos
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground text-pretty">
          Ajuste os aportes, a rentabilidade e o período para projetar quanto você terá acumulado
          ao longo dos anos, com visualização em <strong>poder de compra de hoje</strong> ou nominal.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr] xl:grid-cols-[400px_1fr] items-start">
        <Card className="h-fit lg:sticky lg:top-6 shadow-sm border-border/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Parâmetros</CardTitle>
            <CardDescription>Personalize sua simulação</CardDescription>
          </CardHeader>
          <CardContent>
            <InputPanel values={values} onChange={setValues} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-8 min-w-0">
          <SummaryCards result={result} years={values.years} />

          <PassiveIncome result={result} years={values.years} />

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="size-4 text-primary" aria-hidden="true" />
                  Evolução do patrimônio
                  <InfoTooltip
                    title="Por que existem 3 faixas no gráfico?"
                    content="Como o mercado financeiro passa por altos e baixos, exibimos 3 cenários (Pessimista, Realista e Otimista). O resultado real da sua carteira tende a caminhar dentro dessa área sombreada."
                  />
                </CardTitle>
                <CardDescription className="mt-1">
                  Faixa de cenários projetados ao longo do tempo — {values.adjustInflation ? "valores corrigidos pelo IPCA (poder de compra de hoje)" : "valores nominais brutos"}.
                </CardDescription>
              </div>

              {values.adjustInflation && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="size-3" />
                  IPCA {values.inflationRate}% a.a.
                </span>
              )}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="grafico">
                <TabsList>
                  <TabsTrigger value="grafico">Gráfico</TabsTrigger>
                  <TabsTrigger value="tabela">Tabela anual</TabsTrigger>
                </TabsList>
                <TabsContent value="grafico" className="pt-4">
                  <GrowthChart
                    rows={scenarios.rows}
                    scenarios={scenarios.scenarios}
                    adjustInflation={values.adjustInflation}
                  />
                  <Legend scenarios={scenarios.scenarios} adjustInflation={values.adjustInflation} />
                </TabsContent>
                <TabsContent value="tabela" className="pt-4">
                  <YearlyTable rows={result.rows} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const scenarioColors: Record<string, string> = {
  otimista: "var(--chart-3)",
  realista: "var(--chart-1)",
  pessimista: "var(--chart-2)",
}

function Legend({
  scenarios,
  adjustInflation,
}: {
  scenarios: ScenarioMeta[]
  adjustInflation: boolean
}) {
  // ordena do maior para o menor retorno para leitura de cima para baixo
  const ordered = [...scenarios].sort((a, b) => b.annualRate - a.annualRate)

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
        {ordered.map((s) => {
          const mainTotal = adjustInflation ? s.finalRealTotal : s.finalTotal
          const secTotal = adjustInflation ? s.finalTotal : s.finalRealTotal

          return (
            <div key={s.key} className="flex items-center gap-2 text-sm">
              <span
                className="size-3 rounded-[3px] shrink-0"
                style={{ backgroundColor: scenarioColors[s.key] }}
              />
              <span className="font-medium text-foreground">{s.label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {s.annualRate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% a.a. ·{" "}
                <strong className="text-foreground font-semibold">{formatBRL(mainTotal)}</strong>
                <span className="text-[11px] text-muted-foreground ml-1">
                  ({formatBRL(secTotal)} nom.)
                </span>
              </span>
            </div>
          )
        })}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-0 w-4 border-t-2 border-dashed border-muted-foreground" />
          Total investido
        </div>
      </div>
      <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">
          Retornos passados não garantem resultados futuros.
        </span>{" "}
        {adjustInflation
          ? "Os valores principais do gráfico e dos cards mostram o poder de compra de hoje deflacionado pelo fator (1 + IPCA)^anos. O valor nominal futuro é o valor bruto exibido ao lado."
          : "As faixas usam apenas referências de mercado nominais. O resultado real pode variar conforme oscilações de mercado e inflação."}
      </p>
    </div>
  )
}
