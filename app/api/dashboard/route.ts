import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentMonthRange, groupByMonth, sumByCategory, calcBalance } from "@/lib/finance-helpers"
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

    // Período do mês selecionado
    const { start, end } = getCurrentMonthRange()
    const selectedStart = new Date(year, month - 1, 1)
    const selectedEnd = new Date(year, month, 0, 23, 59, 59, 999)

    // Mês anterior para comparação
    const prevStart = new Date(year, month - 2, 1)
    const prevEnd = new Date(year, month - 1, 0, 23, 59, 59, 999)

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
            gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
            lte: end,
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

    // Saldo total das contas
    const totalBalance = accountsWithCalculatedBalance.reduce((s, a) => s + a.balance, 0)

    // Breakdown por categoria (apenas despesas do mês)
    const expenseTxs = currentTxs.filter((tx) => tx.type === "expense")
    const categoryBreakdown = sumByCategory(expenseTxs)

    // Fluxo de caixa dos últimos 12 meses
    const cashFlow = groupByMonth(allTxs, 12)

    return NextResponse.json({
      period: { month, year },
      balance: {
        total: totalBalance,
        accounts: accountsWithCalculatedBalance,
      },
      income: {
        current: currentIncome,
        previous: prevIncome,
        change: parseFloat(incomeChange.toFixed(1)),
      },
      expense: {
        current: currentExpense,
        previous: prevExpense,
        change: parseFloat(expenseChange.toFixed(1)),
      },
      cashFlow,
      categoryBreakdown,
      transactionCount: {
        current: currentTxs.length,
      },
    })
  } catch (error) {
    console.error("[GET /api/dashboard]", error)
    return NextResponse.json({ error: "Erro ao calcular dados do dashboard" }, { status: 500 })
  }
}
