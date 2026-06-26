import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"

// GET /api/categories
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const categories = await prisma.category.findMany({
      where: { userId: session.userId },
      orderBy: { name: "asc" },
      include: { _count: { select: { transactions: true } } },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("[GET /api/categories]", error)
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 })
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const body = await req.json()
    const { name, color, icon, transactionType } = body

    if (!name) {
      return NextResponse.json({ error: "Campo obrigatório: name" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color ?? "#6366f1",
        icon: icon ?? "tag",
        transactionType: transactionType ?? "both",
        userId: session.userId,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("[POST /api/categories]", error)
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 })
  }
}
