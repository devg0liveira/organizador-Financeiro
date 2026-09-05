import { NextRequest, NextResponse } from "next/server"

interface RateLimitRecord {
  timestamps: number[]
}

// Armazenamento em memória com limpeza periódica de chaves expiradas
const memoryStore = new Map<string, RateLimitRecord>()

// Limpeza a cada 5 minutos para prevenir vazamento de memória
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of memoryStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60 * 60 * 1000)
      if (record.timestamps.length === 0) {
        memoryStore.delete(key)
      }
    }
  }, 5 * 60 * 1000).unref?.()
}

/**
 * Obtém o IP do cliente de forma resiliente a proxies/CDNs (Vercel, Cloudflare, etc)
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim())
    if (ips[0]) return ips[0]
  }

  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp.trim()

  const cfConnectingIp = req.headers.get("cf-connecting-ip")
  if (cfConnectingIp) return cfConnectingIp.trim()

  return "127.0.0.1"
}

export interface RateLimitOptions {
  limit: number // Quantidade máxima de requisições
  windowMs: number // Janela em milissegundos
  actionKey: string // Prefixo identificador da ação (ex: "auth:login")
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number // Tempo em milissegundos até expirar a janela mais antiga
}

/**
 * Verifica se a requisição atual excede o limite configurado (Sliding Window)
 */
export async function checkRateLimit(
  req: NextRequest,
  options: { limit: number; windowMs: number; actionKey: string }
): Promise<RateLimitResult> {
  const ip = getClientIp(req)
  const key = `${options.actionKey}:${ip}`
  const now = Date.now()
  const windowStart = now - options.windowMs

  // 1. Suporte a Upstash Redis caso configurado no ambiente
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (upstashUrl && upstashToken) {
    try {
      // Pipeline simples no Upstash Redis via REST API
      const pipelineUrl = `${upstashUrl}/pipeline`
      const res = await fetch(pipelineUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["ZREMRANGEBYSCORE", key, "0", windowStart],
          ["ZCARD", key],
          ["ZADD", key, now, `${now}-${Math.random()}`],
          ["EXPIRE", key, Math.ceil(options.windowMs / 1000)],
        ]),
      })

      if (res.ok) {
        const results = await res.json()
        const count = (results[1]?.result as number) || 0
        const success = count < options.limit
        const remaining = Math.max(0, options.limit - count - 1)
        return {
          success,
          limit: options.limit,
          remaining,
          reset: options.windowMs,
        }
      }
    } catch {
      // Fallback gracioso para armazenamento em memória se o Redis falhar
    }
  }

  // 2. Fallback / Armazenamento em Memória (Sliding Window Log)
  let record = memoryStore.get(key)
  if (!record) {
    record = { timestamps: [] }
    memoryStore.set(key, record)
  }

  // Filtra apenas requisições dentro da janela ativa
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

  if (record.timestamps.length >= options.limit) {
    const oldestTimestamp = record.timestamps[0]
    const reset = Math.max(0, oldestTimestamp + options.windowMs - now)
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset,
    }
  }

  // Adiciona a requisição atual
  record.timestamps.push(now)
  const remaining = options.limit - record.timestamps.length

  return {
    success: true,
    limit: options.limit,
    remaining,
    reset: options.windowMs,
  }
}

/**
 * Cria uma resposta HTTP 429 padronizada com cabeçalho Retry-After
 */
export function rateLimitResponse(resetMs: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil(resetMs / 1000))
  return NextResponse.json(
    {
      error: "Muitas tentativas. Por favor, aguarde alguns instantes antes de tentar novamente.",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    }
  )
}
