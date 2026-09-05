import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"
import { parseLocalDateToUTCNoon, getMonthRangeUTC } from "@/lib/finance-helpers"
import { transactionCreateSchema } from "@/lib/validations"

// GET /api/transactions
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { searchParams } = req.nextUrl
    const month = searchParams.get("month")
    const year = searchParams.get("year")
    const type = searchParams.get("type")
    const categoryId = searchParams.get("categoryId")
    const accountId = searchParams.get("accountId")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "50")

    const where: Record<string, unknown> = { userId: session.userId }

    if (type) where.type = type
    if (categoryId) where.categoryId = categoryId
    if (accountId) where.accountId = accountId
    if (search) where.description = { contains: search }

    if (month && year) {
      const m = parseInt(month)
      const y = parseInt(year)

      // Validação de entrada de parâmetros de data
      if (m < 1 || m > 12 || y < 1900 || y > 2100) {
        return NextResponse.json(
          { error: "Parâmetros inválidos: month 1-12, year válido" },
          { status: 400 }
        )
      }

      // Usar ranges UTC para filtrar com precisão
      const range = getMonthRangeUTC(y, m)
      where.date = {
        gte: range.start,
        lte: range.end,
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true, account: true },
        orderBy: { date: "desc" },
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({ transactions, total, page, limit })
  } catch (error) {
    console.error("[GET /api/transactions]", error)
    return NextResponse.json({ error: "Erro ao buscar transações" }, { status: 500 })
  }
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const rawBody = await req.json().catch(() => null)
    const parseResult = transactionCreateSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados de transação inválidos" },
        { status: 400 }
      )
    }

    const { description, amount, type, date, notes, categoryId, accountId } = parseResult.data

    // Se accountId for informado, valida titularidade
    if (accountId) {
      const account = await prisma.account.findFirst({
        where: { id: accountId, userId: session.userId },
        select: { id: true },
      })
      if (!account) {
        return NextResponse.json(
          { error: "Conta especificada não existe ou não pertence ao usuário" },
          { status: 400 }
        )
      }
    }

    // Se categoryId for informado, valida titularidade
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: session.userId },
        select: { id: true },
      })
      if (!category) {
        return NextResponse.json(
          { error: "Categoria especificada não existe ou não pertence ao usuário" },
          { status: 400 }
        )
      }
    }

    const parsedDate = (() => {
      if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return parseLocalDateToUTCNoon(date)
      }
      return new Date(date)
    })()

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount,
        type,
        date: parsedDate,
        notes: notes ?? null,
        categoryId: categoryId ?? null,
        accountId: accountId ?? null,
        userId: session.userId,
      },
      include: { category: true, account: true },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("[POST /api/transactions]", error)
    return NextResponse.json({ error: "Erro ao criar transação" }, { status: 500 })
  }
}
