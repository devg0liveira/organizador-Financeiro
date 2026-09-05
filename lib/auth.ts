import { SignJWT, jwtVerify } from "jose"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || ""
const COOKIE_NAME = "auth-token"
const TOKEN_EXPIRY = "7d"

const getSecretKey = () => {
  const secret = JWT_SECRET || "nexbank-internal-default-key-32chars"
  return new TextEncoder().encode(secret)
}

export interface JwtPayload {
  userId: string
  email: string
  name: string
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecretKey())
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    }
  } catch {
    return null
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<JwtPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function createAuthCookie(token: string): string {
  const maxAge = 60 * 60 * 24 * 7 // 7 days in seconds
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`
}

export function clearAuthCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
}

