import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken, createAuthCookie } from "@/lib/auth"
import { defaultAccounts, defaultCategories } from "@/lib/defaults"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { registerSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  // Rate Limiting: máx 5 cadastros por hora por IP
  const rateLimit = await checkRateLimit(req, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
    actionKey: "auth:register",
  })
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset)
  }

  try {
    const rawBody = await req.json().catch(() => null)
    const parseResult = registerSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados de cadastro inválidos" },
        { status: 400 }
      )
    }

    const { name, email, password } = parseResult.data

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma conta associada a este endereço de e-mail" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Transação atômica para criar usuário e seus dados padrão
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, passwordHash },
      })

      // Criar contas padrão
      for (const acc of defaultAccounts) {
        await tx.account.create({
          data: {
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            color: acc.color,
            userId: newUser.id,
          },
        })
      }

      // Criar categorias padrão
      for (const cat of defaultCategories) {
        await tx.category.create({
          data: {
            name: cat.name,
            color: cat.color,
            icon: cat.icon,
            transactionType: cat.transactionType,
            userId: newUser.id,
          },
        })
      }

      return newUser
    })

    const token = await signToken({ userId: user.id, email: user.email, name: user.name })

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      {
        status: 201,
        headers: { "Set-Cookie": createAuthCookie(token) },
      }
    )
  } catch (error) {
    console.error("[POST /api/auth/register] Erro interno:", error)
    return NextResponse.json({ error: "Erro ao criar conta de usuário" }, { status: 500 })
  }
}
