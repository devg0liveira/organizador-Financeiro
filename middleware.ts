import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/register",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  const token = request.cookies.get("auth-token")?.value
  const session = token ? await verifyToken(token) : null

  // Se o usuário já estiver autenticado e tentar acessar /login, redireciona para o dashboard
  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Libera acesso a rotas públicas (incluindo favicons e assets)
  if (isPublic) {
    return NextResponse.next()
  }

  // Se não houver sessão válida em rota privada, redireciona para /login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}