import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"
import { defaultCategories } from "@/lib/defaults"
import { categoryCreateSchema } from "@/lib/validations"

// GET /api/categories
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    let categories = await prisma.category.findMany({
      where: { userId: session.userId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            transactions: {
              where: { userId: session.userId },
            },
          },
        },
      },
    })

    // Fallback se o usuário não tiver categorias
    if (categories.length === 0) {
      await prisma.$transaction(
        defaultCategories.map((cat) =>
          prisma.category.create({
            data: {
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
              transactionType: cat.transactionType,
              userId: session.userId,
            },
          })
        )
      )

      categories = await prisma.category.findMany({
        where: { userId: session.userId },
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              transactions: {
                where: { userId: session.userId },
              },
            },
          },
        },
      })
    }

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
    const rawBody = await req.json().catch(() => null)
    const parseResult = categoryCreateSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados de categoria inválidos" },
        { status: 400 }
      )
    }

    const { name, color, icon, transactionType } = parseResult.data

    const category = await prisma.category.create({
      data: {
        name,
        color,
        icon,
        transactionType,
        userId: session.userId,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("[POST /api/categories]", error)
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 })
  }
}
