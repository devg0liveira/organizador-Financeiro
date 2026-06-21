import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "nexbank-dev-secret-change-in-production"
const COOKIE_NAME = "auth-token"
const TOKEN_EXPIRY = "7d"

export interface JwtPayload {
  userId: string
  email: string
  name: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function getSessionFromRequest(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function createAuthCookie(token: string): string {
  const maxAge = 60 * 60 * 24 * 7 // 7 days in seconds
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`
}

export function clearAuthCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}
