import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

type Params = { params: Promise<{ id: string }> }

// PUT /api/accounts/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, type, balance, color } = body

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
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
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
