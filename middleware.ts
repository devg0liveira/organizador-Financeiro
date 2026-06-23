import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("MIDDLEWARE EXECUTOU:", pathname)

  // Deixa rotas públicas passarem
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  if (isPublicPath) {
    console.log("ROTA PÚBLICA:", pathname)
    return NextResponse.next()
  }

  const token = request.cookies.get("auth-token")?.value
  const session = token ? verifyToken(token) : null

  if (!session) {
    // ✅ CORREÇÃO: Se for rota de API, retorna 401 em vez de redirecionar
    if (pathname.startsWith("/api/")) {
      console.log("API SEM AUTORIZAÇÃO:", pathname)
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Para rotas de página, redireciona para login
    console.log("REDIRECIONANDO PARA LOGIN")
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!login|register|api/auth|_next/static|_next/image|favicon.ico|icon|apple-icon).*)",
  ],
}