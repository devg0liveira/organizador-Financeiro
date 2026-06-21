import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function POST() {
  return NextResponse.json(
    { message: "Sessão encerrada com sucesso" },
    { headers: { "Set-Cookie": clearAuthCookie() } }
  )
}
