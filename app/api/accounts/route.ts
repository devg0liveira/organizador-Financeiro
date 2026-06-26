import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"
import { defaultAccounts } from "@/lib/defaults"

// GET /api/accounts
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    let accounts = await prisma.account.findMany({
      where: { userId: session.userId },
      orderBy: { name: "asc" },
      include: {
        transactions: true,
        _count: { select: { transactions: true } },
      },
    })

    // Fallback se o usuário não tiver contas (ex: usuários antigos)
    if (accounts.length === 0) {
      await prisma.$transaction(
        defaultAccounts.map((acc) =>
          prisma.account.create({
            data: {
              name: acc.name,
              type: acc.type,
              balance: acc.balance,
              color: acc.color,
              userId: session.userId,
            },
          })
        )
      )

      accounts = await prisma.account.findMany({
        where: { userId: session.userId },
        orderBy: { name: "asc" },
        include: {
          transactions: true,
          _count: { select: { transactions: true } },
        },
      })
    }

    const accountsWithCalculatedBalance = accounts.map((account) => {
      const txSum = account.transactions.reduce((sum, tx) => {
        return tx.type === "income" ? sum + tx.amount : sum - tx.amount
      }, 0)
      const { transactions, ...accountWithoutTransactions } = account
      return {
        ...accountWithoutTransactions,
        balance: account.balance + txSum,
      }
    })

    return NextResponse.json(accountsWithCalculatedBalance)
  } catch (error) {
    console.error("[GET /api/accounts]", error)
    return NextResponse.json({ error: "Erro ao buscar contas" }, { status: 500 })
  }
}

// POST /api/accounts
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const body = await req.json()
    const { name, type, balance, color } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, type" },
        { status: 400 }
      )
    }

    const validTypes = ["checking", "savings", "credit", "investment"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type deve ser um de: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: parseFloat(balance ?? "0"),
        color: color ?? "#6366f1",
        userId: session.userId,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error("[POST /api/accounts]", error)
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
