import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"
import { defaultAccounts } from "@/lib/defaults"
import { accountCreateSchema } from "@/lib/validations"

// GET /api/accounts
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    let accounts = await prisma.account.findMany({
      where: { userId: session.userId },
      orderBy: { name: "asc" },
      include: {
        transactions: {
          where: { userId: session.userId },
        },
        _count: {
          select: {
            transactions: {
              where: { userId: session.userId },
            },
          },
        },
      },
    })

    // Fallback se o usuário não tiver contas (ex: usuários recém-criados ou migrados)
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
          transactions: {
            where: { userId: session.userId },
          },
          _count: {
            select: {
              transactions: {
                where: { userId: session.userId },
              },
            },
          },
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
    const rawBody = await req.json().catch(() => null)
    const parseResult = accountCreateSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados de conta inválidos" },
        { status: 400 }
      )
    }

    const { name, type, balance, color } = parseResult.data

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance,
        color,
        userId: session.userId,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error("[POST /api/accounts]", error)
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
