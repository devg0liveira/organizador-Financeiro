import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

// PUT /api/accounts/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { name, type, balance, color } = body

    // Verify ownership — rejeita se a conta não pertence ao usuário autenticado
    const existing = await prisma.account.findFirst({ where: { id, userId: session.userId } })
    if (!existing) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })

    const account = await prisma.account.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(balance !== undefined && { balance: parseFloat(balance) }),
        ...(color !== undefined && { color }),
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error("[PUT /api/accounts/[id]]", error)
    return NextResponse.json({ error: "Erro ao atualizar conta" }, { status: 500 })
  }
}

// DELETE /api/accounts/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params

    // Verify ownership — rejeita se a conta não pertence ao usuário autenticado
    const existing = await prisma.account.findFirst({ where: { id, userId: session.userId } })
    if (!existing) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })

    // Desvincula transações antes de deletar a conta
    await prisma.transaction.updateMany({
      where: { accountId: id },
      data: { accountId: null },
    })
    await prisma.account.delete({ where: { id } })
    return NextResponse.json({ message: "Conta removida com sucesso" })
  } catch (error) {
    console.error("[DELETE /api/accounts/[id]]", error)
    return NextResponse.json({ error: "Erro ao remover conta" }, { status: 500 })
  }
}
