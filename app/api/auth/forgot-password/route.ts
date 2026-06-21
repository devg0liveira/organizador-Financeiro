import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Retornar mensagem genérica para não revelar existência de conta
      return NextResponse.json({
        message: "Se este e-mail estiver cadastrado, você receberá instruções de verificação em breve.",
      })
    }

    // Aqui você pode integrar envio de e-mail real com token de recuperação.
    console.log(`[RECUPERAÇÃO DE SENHA] Solicitação para ${email}`)

    return NextResponse.json({
      message: "Instruções de verificação enviadas. Verifique seu e-mail.",
    })
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error)
    return NextResponse.json(
      { error: "Erro ao processar a recuperação de senha" },
      { status: 500 }
    )
  }
}
