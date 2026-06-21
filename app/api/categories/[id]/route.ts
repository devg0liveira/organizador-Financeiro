import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

type Params = { params: Promise<{ id: string }> }

// PUT /api/categories/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, color, icon, transactionType } = body

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
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
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
