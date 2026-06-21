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

export function middleware(request: NextRequest) {
  console.log("MIDDLEWARE EXECUTOU:", request.nextUrl.pathname)

  const token = request.cookies.get("auth-token")?.value

  console.log("TOKEN:", token ? "EXISTE" : "NÃO EXISTE")

  const session = token ? verifyToken(token) : null

  console.log("SESSION:", session)

  if (!session) {
    console.log("REDIRECIONANDO PARA LOGIN")

    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}