import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"
import { categoryUpdateSchema } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

// PUT /api/categories/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const { id } = await params
    const rawBody = await req.json().catch(() => null)
    const parseResult = categoryUpdateSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados de categoria inválidos" },
        { status: 400 }
      )
    }

    // Verifica se a categoria pertence ao usuário
    const existing = await prisma.category.findFirst({
      where: { id, userId: session.userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    const { name, color, icon, transactionType } = parseResult.data

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (color !== undefined) updateData.color = color
    if (icon !== undefined) updateData.icon = icon
    if (transactionType !== undefined) updateData.transactionType = transactionType

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
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

    // Verifica se a categoria pertence ao usuário
    const existing = await prisma.category.findFirst({
      where: { id, userId: session.userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    // Desvincula transações antes de deletar a categoria
    await prisma.transaction.updateMany({
      where: { categoryId: id, userId: session.userId },
      data: { categoryId: null },
    })

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ message: "Categoria removida com sucesso" })
  } catch (error) {
    console.error("[DELETE /api/categories/[id]]", error)
    return NextResponse.json({ error: "Erro ao remover categoria" }, { status: 500 })
  }
}
