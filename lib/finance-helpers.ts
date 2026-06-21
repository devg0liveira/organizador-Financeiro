/**
 * Formata um valor numérico como moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Retorna o início e o fim de um mês específico
 * @param year  Ano (ex: 2026)
 * @param month Mês 1-indexado (ex: 6 = junho)
 */
export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  return { start, end }
}

/**
 * Retorna o início e o fim do mês atual
 */
export function getCurrentMonthRange() {
  const now = new Date()
  return getMonthRange(now.getFullYear(), now.getMonth() + 1)
}

/**
 * Agrupa transações por categoria e soma os valores
 */
export function sumByCategory(
  transactions: Array<{ amount: number; categoryId: string | null; category?: { name: string; color: string } | null }>
) {
  const map = new Map<string, { name: string; color: string; total: number }>()

  for (const tx of transactions) {
    const key = tx.categoryId ?? "sem-categoria"
    const name = tx.category?.name ?? "Sem Categoria"
    const color = tx.category?.color ?? "#94a3b8"

    if (map.has(key)) {
      map.get(key)!.total += Math.abs(tx.amount)
    } else {
      map.set(key, { name, color, total: Math.abs(tx.amount) })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

/**
 * Calcula o saldo líquido de uma lista de transações
 */
export function calcBalance(
  transactions: Array<{ amount: number; type: string }>
): number {
  return transactions.reduce((acc, tx) => {
    return tx.type === "income" ? acc + tx.amount : acc - tx.amount
  }, 0)
}

/**
 * Agrupa transações por mês (para gráfico de fluxo de caixa)
 * Retorna os últimos N meses
 */
export function groupByMonth(
  transactions: Array<{ amount: number; type: string; date: Date }>,
  months = 12
) {
  const now = new Date()
  const result: Array<{ name: string; receitas: number; despesas: number }> = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString("pt-BR", { month: "short" })
    const year = d.getFullYear()
    const month = d.getMonth()

    const monthTxs = transactions.filter((tx) => {
      const txDate = new Date(tx.date)
      return txDate.getFullYear() === year && txDate.getMonth() === month
    })

    const receitas = monthTxs
      .filter((tx) => tx.type === "income")
      .reduce((s, tx) => s + tx.amount, 0)

    const despesas = monthTxs
      .filter((tx) => tx.type === "expense")
      .reduce((s, tx) => s + tx.amount, 0)

    result.push({
      name: label.charAt(0).toUpperCase() + label.slice(1).replace(".", ""),
      receitas,
      despesas,
    })
  }

  return result
}
