import type { SimulationResult } from "@/lib/investment"
import { formatBRL } from "@/lib/investment"
import { Card } from "@/components/ui/card"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { TrendingUp, Wallet, Coins, Percent } from "lucide-react"

interface SummaryCardsProps {
  result: SimulationResult
  years: number
}

export function SummaryCards({ result, years }: SummaryCardsProps) {
  const isAdjusted = result.adjustInflation

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-5">
      {/* Card 1: Valor Final */}
      <Card className="gap-0 p-5 sm:p-6 bg-primary text-primary-foreground relative shadow-sm border-primary/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/90 flex items-center gap-1.5">
              Valor final acumulado
              <InfoTooltip
                title="O que é o Valor Final Acumulado?"
                content="É o patrimônio total que você terá ao final do período. Ele é a soma dos seus aportes mensais mais todos os juros que renderam ao longo do tempo."
                iconClassName="text-primary-foreground/80 hover:text-primary-foreground"
              />
            </span>
            <TrendingUp className="size-4 text-primary-foreground/80 shrink-0" aria-hidden="true" />
          </div>

          <div className="mt-3.5">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-mono text-2xl sm:text-[1.65rem] 2xl:text-3xl font-bold tabular-nums tracking-tight">
                {formatBRL(isAdjusted ? result.finalRealTotal : result.finalTotal)}
              </p>
              {isAdjusted && (
                <span className="rounded-md bg-primary-foreground/20 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                  Hoje
                </span>
              )}
            </div>

            {/* Valor comparativo lado a lado */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg bg-foreground/10 px-3 py-2 text-xs text-primary-foreground">
              <span className="text-primary-foreground/85 flex items-center gap-1 shrink-0">
                {isAdjusted ? "Nominal futuro:" : "Poder de compra:"}
                <InfoTooltip
                  title={isAdjusted ? "O que é o Valor Nominal Futuro?" : "O que é o Poder de Compra Hoje?"}
                  content={
                    isAdjusted
                      ? "Nominal é o número bruto que estará escrito na tela da sua conta corrente no futuro. Como o preço das coisas terá subido com a inflação, o valor 'Hoje' ao lado é o que ele realmente valerá no seu bolso."
                      : "É quanto aquele montante futuro valeria nos dias de hoje, descontando o efeito da inflação."
                  }
                  iconClassName="text-primary-foreground/80 hover:text-primary-foreground"
                />
              </span>
              <span className="font-mono font-bold tabular-nums">
                {formatBRL(isAdjusted ? result.finalTotal : result.finalRealTotal)}
              </span>
            </div>
          </div>
        </div>

        <span className="mt-3 block text-[11px] text-primary-foreground/75 font-medium">
          em {years} {years === 1 ? "ano" : "anos"} {isAdjusted && `(IPCA ~${result.inflationRate}% a.a.)`}
        </span>
      </Card>

      {/* Card 2: Total Investido */}
      <Card className="gap-0 p-5 sm:p-6 shadow-sm border-border/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              Total investido
              <InfoTooltip
                title="Total Investido do seu Bolso"
                content="É a soma de todo o dinheiro que você tirou do próprio bolso (aporte inicial + aportes mensais), sem contar os juros recebidos."
              />
            </span>
            <Wallet className="size-4 text-primary shrink-0" aria-hidden="true" />
          </div>

          <p className="mt-3.5 font-mono text-2xl sm:text-[1.65rem] 2xl:text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {formatBRL(result.totalInvested)}
          </p>

          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <span>Aportes acumulados do seu bolso</span>
          </div>
        </div>

        <span className="mt-3 block text-[11px] text-muted-foreground">
          sem contar os rendimentos de juros
        </span>
      </Card>

      {/* Card 3: Juros / Rendimento */}
      <Card className="gap-0 p-5 sm:p-6 shadow-sm border-border/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              Juros acumulados
              <InfoTooltip
                title="O que são Juros Acumulados?"
                content="É o lucro gerado pelo seu dinheiro! É a diferença entre o valor final que você terá e o total que você tirou do próprio bolso."
              />
            </span>
            <Coins className="size-4 text-primary shrink-0" aria-hidden="true" />
          </div>

          <div className="mt-3.5">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-mono text-2xl sm:text-[1.65rem] 2xl:text-3xl font-bold tabular-nums tracking-tight text-primary">
                {formatBRL(isAdjusted ? Math.max(0, result.realTotalInterest) : result.totalInterest)}
              </p>
              {isAdjusted && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">
                  real
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 shrink-0">
                {isAdjusted ? "Nominal bruto:" : "Real hoje:"}
                <InfoTooltip
                  title={isAdjusted ? "Juros Nominais vs Reais" : "Ganho Real"}
                  content={
                    isAdjusted
                      ? "Juros Nominais mostra o ganho bruto sem descontar a inflação. Juros Reais é o lucro 'de verdade', ou seja, o ganho de riqueza acima da inflação."
                      : "Lucro limpo acima do aumento geral de preços dos produtos."
                  }
                />
              </span>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {formatBRL(isAdjusted ? result.totalInterest : Math.max(0, result.realTotalInterest))}
              </span>
            </div>
          </div>
        </div>

        <span className="mt-3 block text-[11px] text-muted-foreground">
          {isAdjusted ? "ganho real acima da inflação" : "rendimento bruto total"}
        </span>
      </Card>

      {/* Card 4: Rentabilidade */}
      <Card className="gap-0 p-5 sm:p-6 shadow-sm border-border/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              Rentabilidade
              <InfoTooltip
                title="O que significa Rentabilidade %?"
                content="Indica em porcentagem o quanto seu dinheiro se multiplicou em relação ao total investido. Ex: 100% significa que você dobrou seu dinheiro."
              />
            </span>
            <Percent className="size-4 text-primary shrink-0" aria-hidden="true" />
          </div>

          <div className="mt-3.5">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-mono text-2xl sm:text-[1.65rem] 2xl:text-3xl font-bold tabular-nums tracking-tight text-foreground">
                +{Math.round(isAdjusted ? result.realProfitabilityPct : result.profitabilityPct).toLocaleString("pt-BR")}%
              </p>
              {isAdjusted && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                  real
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <span className="shrink-0">{isAdjusted ? "Nominal:" : "Real:"}</span>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                +{Math.round(isAdjusted ? result.profitabilityPct : result.realProfitabilityPct).toLocaleString("pt-BR")}%
              </span>
            </div>
          </div>
        </div>

        <span className="mt-3 block text-[11px] text-muted-foreground">
          {isAdjusted ? "sobre o poder de compra" : "sobre o valor aportado"}
        </span>
      </Card>
    </div>
  )
}
