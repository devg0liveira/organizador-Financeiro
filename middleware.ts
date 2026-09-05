import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  const method = request.method.toUpperCase()
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const origin = request.headers.get("origin")
    const host = request.headers.get("host")
    if (origin && host) {
      try {
        const originHost = new URL(origin).host
        if (originHost !== host) {
          return NextResponse.json(
            { error: "Requisição não autorizada" },
            { status: 403 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: "Requisição inválida" },
          { status: 400 }
        )
      }
    }
  }

  const token = request.cookies.get("auth-token")?.value
  const session = token ? await verifyToken(token) : null

  // Se o usuário já estiver autenticado e tentar acessar /login, redireciona para o dashboard
  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Libera acesso a rotas públicas (login, forgot-password, assets)
  if (isPublic) {
    return NextResponse.next()
  }

  // Se não houver sessão válida em rotas protegidas:
  if (!session) {
    // Requisições de API devem retornar 401 JSON, nunca redirecionar para HTML de login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}