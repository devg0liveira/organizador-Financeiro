import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

type Params = { params: Promise<{ id: string }> }

// GET /api/transactions/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const transaction = await prisma.transaction.findUnique({
      where: { id },
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
  try {
    const { id } = await params
    const body = await req.json()
    const { description, amount, type, date, notes, categoryId, accountId } = body

    if (type && !["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "type deve ser 'income' ou 'expense'" },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: Math.abs(parseFloat(amount)) }),
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
        ...(categoryId !== undefined && { categoryId }),
        ...(accountId !== undefined && { accountId }),
      },
      include: { category: true, account: true },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("[PUT /api/transactions/[id]]", error)
    return NextResponse.json({ error: "Erro ao atualizar transação" }, { status: 500 })
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ message: "Transação removida com sucesso" })
  } catch (error) {
    console.error("[DELETE /api/transactions/[id]]", error)
    return NextResponse.json({ error: "Erro ao remover transação" }, { status: 500 })
  }
}
