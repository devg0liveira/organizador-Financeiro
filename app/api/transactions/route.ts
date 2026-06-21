import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/transactions
// Query params: ?month=6&year=2026&type=income&categoryId=xxx&search=texto&page=1&limit=20
export async function GET(req: NextRequest) {
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
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (type) where.type = type
    if (categoryId) where.categoryId = categoryId
    if (accountId) where.accountId = accountId
    if (search) {
      where.description = { contains: search }
    }

    if (month && year) {
      const m = parseInt(month)
      const y = parseInt(year)
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0, 23, 59, 59, 999),
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true, account: true },
        orderBy: { date: "desc" },
        skip,
        take: limit,
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
  try {
    const body = await req.json()
    const { description, amount, type, date, notes, categoryId, accountId } = body

    if (!description || amount === undefined || !type || !date) {
      return NextResponse.json(
        { error: "Campos obrigatórios: description, amount, type, date" },
        { status: 400 }
      )
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "type deve ser 'income' ou 'expense'" },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: Math.abs(parseFloat(amount)),
        type,
        date: new Date(date),
        notes: notes ?? null,
        categoryId: categoryId ?? null,
        accountId: accountId ?? null,
      },
      include: { category: true, account: true },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("[POST /api/transactions]", error)
    return NextResponse.json({ error: "Erro ao criar transação" }, { status: 500 })
  }
}
