import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"
import { parseLocalDateToUTCNoon } from "@/lib/finance-helpers"
import { transactionUpdateSchema } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

// GET /api/transactions/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: session.userId },
      include: { category: true, account: true },
    })
    if (!transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }
    return NextResponse.json(transaction)
  } catch (error) {
    console.error("[GET /api/transactions/[id]]", error)
    return NextResponse.json({ error: "Erro ao buscar transação" }, { status: 500 })
  }
}

// PUT /api/transactions/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params
    const rawBody = await req.json().catch(() => null)
    const parseResult = transactionUpdateSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados de atualização inválidos" },
        { status: 400 }
      )
    }

    // Valida titularidade da transação
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    const { description, amount, type, date, notes, categoryId, accountId } = parseResult.data

    // Se accountId for alterado, valida a conta
    if (accountId) {
      const account = await prisma.account.findFirst({
        where: { id: accountId, userId: session.userId },
        select: { id: true },
      })
      if (!account) {
        return NextResponse.json(
          { error: "Conta informada não encontrada ou não pertence ao usuário" },
          { status: 400 }
        )
      }
    }

    // Se categoryId for alterado, valida a categoria
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: session.userId },
        select: { id: true },
      })
      if (!category) {
        return NextResponse.json(
          { error: "Categoria informada não encontrada ou não pertence ao usuário" },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (description !== undefined) updateData.description = description
    if (amount !== undefined) updateData.amount = amount
    if (type !== undefined) updateData.type = type
    if (date !== undefined) {
      updateData.date =
        typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)
          ? parseLocalDateToUTCNoon(date)
          : new Date(date)
    }
    if (notes !== undefined) updateData.notes = notes
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (accountId !== undefined) updateData.accountId = accountId

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { category: true, account: true },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("[PUT /api/transactions/[id]]", error)
    return NextResponse.json({ error: "Erro ao atualizar transação" }, { status: 500 })
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ message: "Transação removida com sucesso" })
  } catch (error) {
    console.error("[DELETE /api/transactions/[id]]", error)
    return NextResponse.json({ error: "Erro ao remover transação" }, { status: 500 })
  }
}
