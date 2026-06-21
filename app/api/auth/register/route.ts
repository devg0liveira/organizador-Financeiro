import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken, createAuthCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma conta com este e-mail" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    })

    const token = signToken({ userId: user.id, email: user.email, name: user.name })

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      {
        status: 201,
        headers: { "Set-Cookie": createAuthCookie(token) },
      }
    )
  } catch (error) {
    console.error("[POST /api/auth/register]", error)
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
