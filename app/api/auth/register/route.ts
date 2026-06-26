import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken, createAuthCookie } from "@/lib/auth"
import { defaultAccounts, defaultCategories } from "@/lib/defaults"

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
    
    // Transação para criar usuário e seus dados padrão
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
    console.error("[POST /api/auth/register]", error)
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
