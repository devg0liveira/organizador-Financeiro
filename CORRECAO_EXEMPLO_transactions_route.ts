// VERSÃO CORRIGIDA: app/api/transactions/route.ts
// Principais correções:
// 1. Timezone: Interpreta data como local, não UTC
// 2. Validação: Adiciona validação de entrada

import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"

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
    const skip = (page - 1) * limit

    // VALIDAÇÃO: Garantir que page e limit são válidos
    if (page < 1 || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: "Parâmetros inválidos: page >= 1, 1 <= limit <= 1000" },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = { userId: session.userId }

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return NextResponse.json({ error: "type inválido" }, { status: 400 })
      }
      where.type = type
    }
    if (categoryId) where.categoryId = categoryId
    if (accountId) where.accountId = accountId
    if (search) where.description = { contains: search }

    // CORRIGIDO: Usar getMonthRange helper para consistência
    if (month && year) {
      const m = parseInt(month)
      const y = parseInt(year)

      // VALIDAÇÃO: Mês deve ser 1-12
      if (m < 1 || m > 12 || y < 1900 || y > 2100) {
        return NextResponse.json(
          { error: "Parâmetros inválidos: month 1-12, year válido" },
          { status: 400 }
        )
      }

      // FIX: Usar new Date com 3 argumentos para criar meia-noite local
      const start = new Date(y, m - 1, 1, 0, 0, 0, 0)
      const end = new Date(y, m, 0, 23, 59, 59, 999)

      where.date = {
        gte: start,
        lte: end,
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
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

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

    // FIX: Corrigir interpretação de timezone
    // date vem como "YYYY-MM-DD" do frontend
    // Interpretamos como meia-noite na timezone LOCAL do servidor
    let parsedDate: Date
    try {
      if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split("-").map(Number)
        // Criar Date como meia-noite local (não UTC!)
        parsedDate = new Date(year, month - 1, day, 0, 0, 0, 0)
      } else {
        parsedDate = new Date(date)
      }

      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Data inválida" }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: "Erro ao processar data" }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: Math.abs(parseFloat(amount)),
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
