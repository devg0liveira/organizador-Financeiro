import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"

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
    const body = await req.json()
    const { description, amount, type, date, notes, categoryId, accountId } = body

    // Verify ownership
    const existing = await prisma.transaction.findFirst({ where: { id, userId: session.userId } })
    if (!existing) return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })

    if (type && !["income", "expense"].includes(type)) {
      return NextResponse.json({ error: "type deve ser 'income' ou 'expense'" }, { status: 400 })
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
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params
    const existing = await prisma.transaction.findFirst({ where: { id, userId: session.userId } })
    if (!existing) return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })

    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ message: "Transação removida com sucesso" })
  } catch (error) {
    console.error("[DELETE /api/transactions/[id]]", error)
    return NextResponse.json({ error: "Erro ao remover transação" }, { status: 500 })
  }
}
