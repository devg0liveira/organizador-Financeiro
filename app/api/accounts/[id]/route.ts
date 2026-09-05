import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"
import { accountUpdateSchema } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

// PUT /api/accounts/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params
    const rawBody = await req.json().catch(() => null)
    const parseResult = accountUpdateSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados de conta inválidos" },
        { status: 400 }
      )
    }

    // Verifica se a conta pertence ao usuário
    const existing = await prisma.account.findFirst({
      where: { id, userId: session.userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    const { name, type, balance, color } = parseResult.data

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (balance !== undefined) updateData.balance = balance
    if (color !== undefined) updateData.color = color

    const account = await prisma.account.update({
      where: { id },
      data: updateData,
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

    // Verifica se a conta pertence ao usuário
    const existing = await prisma.account.findFirst({
      where: { id, userId: session.userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    // Desvincula transações antes de deletar a conta
    await prisma.transaction.updateMany({
      where: { accountId: id, userId: session.userId },
      data: { accountId: null },
    })

    await prisma.account.delete({ where: { id } })
    return NextResponse.json({ message: "Conta removida com sucesso" })
  } catch (error) {
    console.error("[DELETE /api/accounts/[id]]", error)
    return NextResponse.json({ error: "Erro ao remover conta" }, { status: 500 })
  }
}
