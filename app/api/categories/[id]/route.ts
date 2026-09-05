import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

// PUT /api/categories/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { name, color, icon, transactionType } = body

    // Verify ownership — rejeita se a categoria não pertence ao usuário autenticado
    const existing = await prisma.category.findFirst({ where: { id, userId: session.userId } })
    if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(transactionType !== undefined && { transactionType }),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("[PUT /api/categories/[id]]", error)
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 })
  }
}

// DELETE /api/categories/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params

    // Verify ownership — rejeita se a categoria não pertence ao usuário autenticado
    const existing = await prisma.category.findFirst({ where: { id, userId: session.userId } })
    if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })

    // Desvincula transações antes de deletar
    await prisma.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    })
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ message: "Categoria removida com sucesso" })
  } catch (error) {
    console.error("[DELETE /api/categories/[id]]", error)
    return NextResponse.json({ error: "Erro ao remover categoria" }, { status: 500 })
  }
}
