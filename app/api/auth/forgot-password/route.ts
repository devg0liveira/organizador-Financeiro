import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { forgotPasswordSchema } from "@/lib/validations"

const GENERIC_SUCCESS_MESSAGE =
  "Se este e-mail estiver cadastrado, você receberá instruções de verificação em breve."

export async function POST(req: NextRequest) {
  // Rate Limiting: máx 5 requisições por 15 minutos por IP
  const rateLimit = await checkRateLimit(req, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    actionKey: "auth:forgot-password",
  })
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset)
  }

  try {
    const rawBody = await req.json().catch(() => null)
    const parseResult = forgotPasswordSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Email inválido" },
        { status: 400 }
      )
    }

    const { email } = parseResult.data

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    })

    if (user) {
      // Disparo de e-mail transacional
    }

    return NextResponse.json({
      message: GENERIC_SUCCESS_MESSAGE,
    })
  } catch (error) {
    console.error("[POST /api/auth/forgot-password] Erro interno")
    return NextResponse.json(
      { error: "Erro ao processar a solicitação de recuperação de senha" },
      { status: 500 }
    )
  }
}
