import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken, createAuthCookie } from "@/lib/auth"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { loginSchema } from "@/lib/validations"

const DUMMY_HASH = "$2a$12$e8Y6lF1KxVl5aIq.Jb2xueBv.XlX7j3P3w1dY0oH.k6pQvYf12e2y"

export async function POST(req: NextRequest) {
  const rateLimit = await checkRateLimit(req, {
    limit: 5,
    windowMs: 60 * 1000,
    actionKey: "auth:login",
  })
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset)
  }

  try {
    const rawBody = await req.json().catch(() => null)
    const parseResult = loginSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Credenciais inválidas" },
        { status: 400 }
      )
    }

    const { email, password } = parseResult.data

    const user = await prisma.user.findUnique({ where: { email } })

    const hashToCompare = user ? user.passwordHash : DUMMY_HASH
    const valid = await bcrypt.compare(password, hashToCompare)

    if (!user || !valid) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    const token = await signToken({ userId: user.id, email: user.email, name: user.name })

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      {
        status: 200,
        headers: { "Set-Cookie": createAuthCookie(token) },
      }
    )
  } catch (error) {
    console.error("[POST /api/auth/login] Erro interno:", error)
    return NextResponse.json({ error: "Erro ao autenticar usuário" }, { status: 500 })
  }
}
