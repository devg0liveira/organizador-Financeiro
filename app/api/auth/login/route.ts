import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken, createAuthCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name })

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      {
        status: 200,
        headers: { "Set-Cookie": createAuthCookie(token) },
      }
    )
  } catch (error) {
    console.error("[POST /api/auth/login]", error)
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 })
  }
}
