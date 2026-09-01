// VERSÃO CORRIGIDA: app/api/dashboard/route.ts
// Principais correções:
// 1. Remover código morto (getCurrentMonthRange não usado)
// 2. Usar getMonthRange para todos os períodos
// 3. Adicionar proteção para transições de ano

import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getMonthRange, groupByMonth, sumByCategory, calcBalance } from "@/lib/finance-helpers"
import { getSessionFromRequest } from "@/lib/auth"

// GET /api/dashboard
// Query params: ?month=6&year=2026
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { searchParams } = req.nextUrl
    const now = new Date()
    const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1))
    const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()))

    // VALIDAÇÃO: Mês deve estar entre 1-12
    if (month < 1 || month > 12 || year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: "Parâmetros inválidos: month 1-12, year válido" },
        { status: 400 }
      )
    }

    // FIX: Usar getMonthRange() para período selecionado
    const selectedRange = getMonthRange(year, month)
    const selectedStart = selectedRange.start
    const selectedEnd = selectedRange.end

    // FIX: Calcular mês anterior de forma segura (sem underflow)
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevRange = getMonthRange(prevYear, prevMonth)
    const prevStart = prevRange.start
    const prevEnd = prevRange.end

    // FIX: Para gráficos, pegar últimos 12 meses
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0)

    // Busca em paralelo: todas as transações do mês atual, anterior e para os gráficos
    const [currentTxs, prevTxs, allTxs, accounts] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: session.userId,
          date: { gte: selectedStart, lte: selectedEnd },
        },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: {
          userId: session.userId,
          date: { gte: prevStart, lte: prevEnd },
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId: session.userId,
          date: {
            gte: twelveMonthsAgo,
            lte: selectedEnd,
          },
        },
        include: { category: true },
      }),
      prisma.account.findMany({
        where: { userId: session.userId },
        include: {
          transactions: {
            where: { userId: session.userId },
          },
        },
      }),
    ])

    // Receitas e despesas do mês atual
    const currentIncome = currentTxs
      .filter((tx) => tx.type === "income")
      .reduce((s, tx) => s + tx.amount, 0)
    const currentExpense = currentTxs
      .filter((tx) => tx.type === "expense")
      .reduce((s, tx) => s + tx.amount, 0)

    // Receitas e despesas do mês anterior
    const prevIncome = prevTxs
      .filter((tx) => tx.type === "income")
      .reduce((s, tx) => s + tx.amount, 0)
    const prevExpense = prevTxs
      .filter((tx) => tx.type === "expense")
      .reduce((s, tx) => s + tx.amount, 0)

    // Variação percentual
    const incomeChange =
      prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0
    const expenseChange =
      prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0

    // Calcular saldo dinâmico para cada conta
    const accountsWithCalculatedBalance = accounts.map((a) => {
      const txSum = a.transactions.reduce((sum, tx) => {
        return tx.type === "income" ? sum + tx.amount : sum - tx.amount
      }, 0)
      return {
        id: a.id,
        name: a.name,
        balance: a.balance + txSum,
        type: a.type,
        color: a.color,
      }
    })

    // Calcular totais por categoria
    const categoryTotals = sumByCategory(currentTxs)

    // Agrupar por mês para gráfico
    const monthlyData = groupByMonth(allTxs, 12)

    return NextResponse.json({
      month,
      year,
      currentIncome,
      currentExpense,
      incomeChange,
      expenseChange,
      accounts: accountsWithCalculatedBalance,
      categoryTotals,
      monthlyData,
      transactionCount: currentTxs.length,
    })
  } catch (error) {
    console.error("[GET /api/dashboard]", error)
    return NextResponse.json({ error: "Erro ao buscar dashboard" }, { status: 500 })
  }
}
