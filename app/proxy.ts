import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  if (isPublicPath) return NextResponse.next()

  const token = request.cookies.get("auth-token")?.value
  const session = token ? verifyToken(token) : null

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon).*)" ],
}