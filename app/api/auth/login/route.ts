import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"

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

    console.log("Login aprovado")
    console.log("Token:", token)

    const response = NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 200 }
    )

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    })

    console.log("Cookie setado com sucesso")

    return response

  } catch (error) {
    console.error("[POST /api/auth/login]", error)
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 })
  }
}