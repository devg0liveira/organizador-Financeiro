export interface SimulationInput {
  /** Aporte inicial em R$ */
  initial: number
  /** Aporte mensal em R$ */
  monthly: number
  /** Taxa de juros anual em % (ex: 10 = 10% a.a.) */
  annualRate: number
  /** Período total em anos */
  years: number
  /** IPCA / Inflação anual esperada em % (ex: 4.5 = 4,5% a.a.) */
  inflationRate: number
  /** Se deve aplicar o ajuste pela inflação (valores de hoje) */
  adjustInflation: boolean
}

export interface YearRow {
  year: number
  /** Total investido acumulado (soma dos aportes) */
  invested: number
  /** Juros/rendimentos acumulados no período (nominal) */
  interest: number
  /** Valor total acumulado (nominal) */
  total: number
  /** Rendimento gerado apenas naquele ano (nominal) */
  yearGain: number
  /** Fator de deflação no ano: (1 + infl)^ano */
  deflator: number
  /** Valor total em poder de compra de hoje */
  realTotal: number
  /** Juros reais acumulados acima do poder de compra investido */
  realInterest: number
  /** Rendimento no ano em poder de compra de hoje */
  realYearGain: number
  /** Renda passiva mensal nominal ao final daquele ano */
  monthlyIncome: number
  /** Renda passiva mensal em poder de compra de hoje */
  realMonthlyIncome: number
}

export interface SimulationResult {
  rows: YearRow[]
  /** Total acumulado nominal */
  finalTotal: number
  /** Total acumulado em poder de compra de hoje (deflacionado) */
  finalRealTotal: number
  /** Total investido acumulado (soma dos aportes) */
  totalInvested: number
  /** Juros acumulados nominais */
  totalInterest: number
  /** Ganho real acumulado acima do investido */
  realTotalInterest: number
  /** Rentabilidade nominal percentual sobre o investido */
  profitabilityPct: number
  /** Rentabilidade real percentual sobre o investido */
  realProfitabilityPct: number
  /** Renda passiva mensal nominal vivendo só dos juros */
  monthlyIncome: number
  /** Renda passiva mensal em poder de compra de hoje */
  realMonthlyIncome: number
  /** Taxa mensal equivalente à taxa anual informada */
  monthlyRate: number
  /** Taxa de inflação anual configurada */
  inflationRate: number
  /** Toggle ativo para valores de hoje */
  adjustInflation: boolean
  /** Fator acumulado de inflação no final do período: (1 + infl)^anos */
  deflator: number
}

/**
 * Simula um investimento com juros compostos, aportes mensais e ajuste por inflação.
 */
export function simulateInvestment({
  initial,
  monthly,
  annualRate,
  years,
  inflationRate = 4.5,
  adjustInflation = true,
}: SimulationInput): SimulationResult {
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1
  const totalMonths = Math.round(years * 12)
  const inflDec = inflationRate / 100

  let balance = initial
  let invested = initial

  const rows: YearRow[] = [
    {
      year: 0,
      invested: initial,
      interest: 0,
      total: initial,
      yearGain: 0,
      deflator: 1,
      realTotal: initial,
      realInterest: 0,
      realYearGain: 0,
      monthlyIncome: initial * monthlyRate,
      realMonthlyIncome: initial * monthlyRate,
    },
  ]

  let prevTotal = initial
  let prevRealTotal = initial

  for (let month = 1; month <= totalMonths; month++) {
    // rende sobre o saldo e depois recebe o aporte do mês
    balance = balance * (1 + monthlyRate) + monthly
    invested += monthly

    if (month % 12 === 0) {
      const year = month / 12
      const deflator = Math.pow(1 + inflDec, year)
      const interest = balance - invested
      const realTotal = balance / deflator
      const realInterest = realTotal - invested
      const yearGain = balance - prevTotal
      const realYearGain = realTotal - prevRealTotal

      rows.push({
        year,
        invested,
        interest,
        total: balance,
        yearGain,
        deflator,
        realTotal,
        realInterest,
        realYearGain,
        monthlyIncome: balance * monthlyRate,
        realMonthlyIncome: (balance * monthlyRate) / deflator,
      })

      prevTotal = balance
      prevRealTotal = realTotal
    }
  }

  const finalDeflator = Math.pow(1 + inflDec, years)
  const finalTotal = balance
  const finalRealTotal = finalTotal / finalDeflator
  const totalInterest = finalTotal - invested
  const realTotalInterest = finalRealTotal - invested

  const profitabilityPct = invested > 0 ? (totalInterest / invested) * 100 : 0
  const realProfitabilityPct = invested > 0 ? (realTotalInterest / invested) * 100 : 0

  const monthlyIncome = finalTotal * monthlyRate
  const realMonthlyIncome = monthlyIncome / finalDeflator

  return {
    rows,
    finalTotal,
    finalRealTotal,
    totalInvested: invested,
    totalInterest,
    realTotalInterest,
    profitabilityPct,
    realProfitabilityPct,
    monthlyIncome,
    realMonthlyIncome,
    monthlyRate,
    inflationRate,
    adjustInflation,
    deflator: finalDeflator,
  }
}

export type ScenarioKey = "pessimista" | "realista" | "otimista"

export interface ScenarioMeta {
  key: ScenarioKey
  label: string
  /** Descrição da referência de mercado usada como âncora */
  reference: string
  annualRate: number
  monthlyRate: number
  finalTotal: number
  finalRealTotal: number
  monthlyIncome: number
  realMonthlyIncome: number
}

export interface ScenarioRow {
  year: number
  invested: number
  pessimista: number
  realista: number
  otimista: number
  realPessimista: number
  realRealista: number
  realOtimista: number
  /** Valores atualmente em exibição conforme o toggle */
  displayPessimista: number
  displayRealista: number
  displayOtimista: number
  /** Base invisível da banda, usada para empilhar a faixa */
  bandLow: number
  /** Altura da banda */
  bandSpan: number
}

export interface ScenariosResult {
  rows: ScenarioRow[]
  scenarios: ScenarioMeta[]
}

/** Projeta o total acumulado ao final de cada ano para uma dada taxa anual. */
function projectYearlyTotals({ initial, monthly, annualRate, years }: SimulationInput): {
  totals: number[]
  monthlyRate: number
} {
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1
  const totalMonths = Math.round(years * 12)
  let balance = initial
  const totals: number[] = [initial]
  for (let month = 1; month <= totalMonths; month++) {
    balance = balance * (1 + monthlyRate) + monthly
    if (month % 12 === 0) totals.push(balance)
  }
  return { totals, monthlyRate }
}

/**
 * Gera três projeções em torno da taxa informada para expressar a incerteza.
 */
export function simulateScenarios(input: SimulationInput): ScenariosResult {
  const base = input.annualRate
  const inflDec = (input.inflationRate ?? 4.5) / 100
  const adjust = input.adjustInflation ?? true

  const defs: Array<Omit<ScenarioMeta, "monthlyRate" | "finalTotal" | "finalRealTotal" | "monthlyIncome" | "realMonthlyIncome">> = [
    {
      key: "pessimista",
      label: "Pessimista",
      reference: "próximo à renda fixa / CDI",
      annualRate: Math.max(base - 4, 0.5),
    },
    {
      key: "realista",
      label: "Realista",
      reference: "a taxa que você definiu",
      annualRate: base,
    },
    {
      key: "otimista",
      label: "Otimista",
      reference: "próximo à média histórica do IBOV",
      annualRate: base + 3,
    },
  ]

  const projections = defs.map((d) => ({
    d,
    ...projectYearlyTotals({ ...input, annualRate: d.annualRate }),
  }))
  const years = Math.round(input.years)

  const rows: ScenarioRow[] = []
  for (let y = 0; y <= years; y++) {
    const deflator = Math.pow(1 + inflDec, y)
    const pessimista = projections[0].totals[y] ?? 0
    const realista = projections[1].totals[y] ?? 0
    const otimista = projections[2].totals[y] ?? 0

    const realPessimista = pessimista / deflator
    const realRealista = realista / deflator
    const realOtimista = otimista / deflator

    const displayPessimista = adjust ? realPessimista : pessimista
    const displayRealista = adjust ? realRealista : realista
    const displayOtimista = adjust ? realOtimista : otimista

    rows.push({
      year: y,
      invested: input.initial + input.monthly * 12 * y,
      pessimista,
      realista,
      otimista,
      realPessimista,
      realRealista,
      realOtimista,
      displayPessimista,
      displayRealista,
      displayOtimista,
      bandLow: displayPessimista,
      bandSpan: Math.max(displayOtimista - displayPessimista, 0),
    })
  }

  const finalDeflator = Math.pow(1 + inflDec, years)

  const scenarios: ScenarioMeta[] = projections.map((p) => {
    const finalTotal = p.totals[p.totals.length - 1] ?? 0
    const finalRealTotal = finalTotal / finalDeflator
    const monthlyIncome = finalTotal * p.monthlyRate
    const realMonthlyIncome = monthlyIncome / finalDeflator

    return {
      key: p.d.key,
      label: p.d.label,
      reference: p.d.reference,
      annualRate: p.d.annualRate,
      monthlyRate: p.monthlyRate,
      finalTotal,
      finalRealTotal,
      monthlyIncome,
      realMonthlyIncome,
    }
  })

  return { rows, scenarios }
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

export function formatBRLPrecise(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
