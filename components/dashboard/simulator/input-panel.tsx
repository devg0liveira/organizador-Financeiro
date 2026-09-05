"use client"

import type { SimulationInput } from "@/lib/investment"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Sparkles } from "lucide-react"

interface InputPanelProps {
  values: SimulationInput
  onChange: (next: SimulationInput) => void
}

const ratePresets = [
  { label: "Poupança", rate: 6.5 },
  { label: "Tesouro Selic", rate: 10.5 },
  { label: "CDB / Renda Fixa", rate: 12 },
  { label: "Bolsa (Longo Prazo)", rate: 15 },
]

const inflationPresets = [
  { label: "Meta (3%)", rate: 3 },
  { label: "Focus (4,5%)", rate: 4.5 },
  { label: "Histórico (6%)", rate: 6 },
]

export function InputPanel({ values, onChange }: InputPanelProps) {
  function update<K extends keyof SimulationInput>(key: K, value: SimulationInput[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Bloco de Inflação / Poder de Compra */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="adjustInflation" className="text-sm font-semibold text-foreground cursor-pointer">
                Valores de hoje
              </Label>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                <Sparkles className="size-2.5" />
                Real
              </span>
              <InfoTooltip
                title="O que significa 'Valores de hoje'?"
                content="A inflação aumenta o preço das coisas com o tempo. Esse ajuste tira a inflação do cálculo para mostrar quanto o seu dinheiro do futuro vai realmente comprar no seu padrão de vida atual."
              />
            </div>
            <p className="text-xs text-muted-foreground leading-tight">
              Ajuste por inflação (poder de compra real)
            </p>
          </div>
          <Switch
            id="adjustInflation"
            checked={values.adjustInflation}
            onCheckedChange={(checked) => update("adjustInflation", !!checked)}
          />
        </div>

        {/* Campo de IPCA / Inflação esperada */}
        <div className="mt-4 border-t border-border/60 pt-3 flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="inflationRate" className="text-xs text-muted-foreground">
                IPCA esperado (inflação)
              </Label>
              <InfoTooltip
                title="O que é o IPCA?"
                content="É o índice oficial da inflação no Brasil. Ele mede quanto o custo de vida (comida, combustível, aluguel) sobe a cada ano. A meta histórica do Banco Central gira em torno de 3% a 4.5% ao ano."
              />
            </div>
            <span className="font-mono text-xs font-semibold text-primary tabular-nums">
              {values.inflationRate.toLocaleString("pt-BR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              % a.a.
            </span>
          </div>

          <Slider
            id="inflationRate"
            min={0}
            max={15}
            step={0.5}
            value={[values.inflationRate]}
            onValueChange={(v) => update("inflationRate", Array.isArray(v) ? v[0] : v)}
          />

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {inflationPresets.map((preset) => {
              const active = Math.abs(values.inflationRate - preset.rate) < 0.01
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => update("inflationRate", preset.rate)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <MoneyField
        id="initial"
        label="Aporte inicial"
        infoTitle="Quanto você tem hoje?"
        infoContent="É o dinheiro que você já tem guardado e vai investir logo no primeiro dia."
        value={values.initial}
        onChange={(v) => update("initial", v)}
      />

      <MoneyField
        id="monthly"
        label="Aporte mensal"
        infoTitle="Quanto você guardará por mês?"
        infoContent="É o valor que você consegue economizar do seu salário todo mês para investir continuamente."
        value={values.monthly}
        onChange={(v) => update("monthly", v)}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="annualRate">Rentabilidade anual (nominal)</Label>
            <InfoTooltip
              title="O que é Rentabilidade Nominal?"
              content="É a taxa de rendimento bruta que o investimento promete por ano. 'Nominal' significa que é o valor antes de descontar a inflação. Ex: se render 12% a.a. e a inflação for 4.5%, seu ganho real no bolso será de ~7.5% a.a."
            />
          </div>
          <span className="font-mono text-sm font-semibold text-primary tabular-nums">
            {values.annualRate.toLocaleString("pt-BR", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            % a.a.
          </span>
        </div>
        <Slider
          id="annualRate"
          min={0}
          max={25}
          step={0.5}
          value={[values.annualRate]}
          onValueChange={(v) => update("annualRate", Array.isArray(v) ? v[0] : v)}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {ratePresets.map((preset) => {
            const active = Math.abs(values.annualRate - preset.rate) < 0.01
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => update("annualRate", preset.rate)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="years">Período</Label>
            <InfoTooltip
              title="Tempo de Investimento"
              content="Quanto mais tempo o dinheiro fica investido, mais forte fica o efeito bola de neve dos juros compostos!"
            />
          </div>
          <span className="font-mono text-sm font-semibold text-primary tabular-nums">
            {values.years} {values.years === 1 ? "ano" : "anos"}
          </span>
        </div>
        <Slider
          id="years"
          min={1}
          max={40}
          step={1}
          value={[values.years]}
          onValueChange={(v) => update("years", Array.isArray(v) ? v[0] : v)}
        />
      </div>
    </div>
  )
}

function MoneyField({
  id,
  label,
  infoTitle,
  infoContent,
  value,
  onChange,
}: {
  id: string
  label: string
  infoTitle?: string
  infoContent?: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        {infoTitle && infoContent && (
          <InfoTooltip title={infoTitle} content={infoContent} />
        )}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          R$
        </span>
        <Input
          id={id}
          type="number"
          min={0}
          step={100}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="pl-9 font-mono tabular-nums"
        />
      </div>
    </div>
  )
}
