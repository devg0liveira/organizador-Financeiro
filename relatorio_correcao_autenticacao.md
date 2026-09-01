# Relatório de Correção — Autenticação NexBank

**Projeto:** organizador-Financeiro  
**Repositório:** https://github.com/devg0liveira/organizador-Financeiro  
**Data:** 25/06/2026  
**Problema:** Login com credenciais corretas não redirecionava para a tela inicial na Vercel.

---

## Diagnóstico

### Sintomas observados
- POST `/api/auth/login` retornava **200 OK** com `Set-Cookie` presente na resposta.
- Mesmo assim, o usuário era redirecionado de volta para `/login`.
- Ao substituir o `middleware.ts` por um passthrough (sem verificação), a navegação funcionava normalmente.

### Causa raiz

O `middleware.ts` do Next.js roda no **Edge Runtime** da Vercel (não no Node.js). A biblioteca `jsonwebtoken` utiliza módulos internos do Node.js (`crypto`) que **não existem no Edge Runtime**.

Por isso, ao chamar `verifyToken(token)`, a biblioteca lançava um erro internamente. O bloco `try/catch` capturava esse erro e retornava `null`, fazendo o middleware sempre enxergar a sessão como inválida e redirecionar para `/login` — independentemente do cookie estar correto.

### Solução

Substituição da biblioteca `jsonwebtoken` pela **`jose`**, que utiliza a **Web Crypto API** (compatível com Edge Runtime, Node.js e browsers).

---

## Dependência instalada

```bash
npm install jose
```

**Adicionado em:** `package.json` → `dependencies`  
**Removida a necessidade de:** `jsonwebtoken` e `@types/jsonwebtoken` (podem ser removidos futuramente)

---

## Arquivos alterados

### 1. `lib/auth.ts` — **Reescrito**

Arquivo central de autenticação. Toda a lógica JWT foi migrada de `jsonwebtoken` para `jose`.

**Antes:**
```typescript
import jwt from "jsonwebtoken"

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
```

**Depois:**
```typescript
import { SignJWT, jwtVerify } from "jose"

const getSecretKey = () => new TextEncoder().encode(JWT_SECRET)

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
```

> `createAuthCookie` e `clearAuthCookie` não foram alterados.

---

### 2. `middleware.ts` — **Atualizado**

**Mudanças:**
- `middleware` virou `async` para usar `await verifyToken()`
- Adicionado early return para rotas públicas (evita verificação desnecessária)
- Removidos `console.log` de debug expostos em produção

**Antes:**
```typescript
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
```

**Depois:**
```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  if (isPublic) return NextResponse.next()

  const token = request.cookies.get("auth-token")?.value
  const session = token ? await verifyToken(token) : null

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
```

---

### 3. `app/api/auth/login/route.ts` — **Atualizado**

- `signToken(...)` → `await signToken(...)`
- Removidos `console.log` de debug (token, cookie, "Login aprovado")

```diff
- const token = signToken({ userId: user.id, email: user.email, name: user.name })
- console.log("Login aprovado")
- console.log("Token:", token)
- console.log("Cookie:", createAuthCookie(token))
+ const token = await signToken({ userId: user.id, email: user.email, name: user.name })
```

---

### 4. `app/api/auth/register/route.ts` — **Atualizado**

- `signToken(...)` → `await signToken(...)`

```diff
- const token = signToken({ userId: user.id, email: user.email, name: user.name })
+ const token = await signToken({ userId: user.id, email: user.email, name: user.name })
```

---

### 5. `app/api/auth/me/route.ts` — **Atualizado**

- `getSessionFromRequest(req)` → `await getSessionFromRequest(req)`

```diff
- const session = getSessionFromRequest(req)
+ const session = await getSessionFromRequest(req)
```

---

### 6. `app/api/accounts/route.ts` — **Atualizado**

Dois locais alterados (handler GET e handler POST):

```diff
- const session = getSessionFromRequest(req)   // GET
+ const session = await getSessionFromRequest(req)

- const session = getSessionFromRequest(req)   // POST
+ const session = await getSessionFromRequest(req)
```

---

### 7. `app/api/transactions/route.ts` — **Atualizado**

Dois locais alterados (handler GET e handler POST):

```diff
- const session = getSessionFromRequest(req)   // GET
+ const session = await getSessionFromRequest(req)

- const session = getSessionFromRequest(req)   // POST
+ const session = await getSessionFromRequest(req)
```

---

### 8. `app/api/transactions/[id]/route.ts` — **Atualizado**

Três locais alterados (handlers GET, PUT e DELETE):

```diff
- const session = getSessionFromRequest(req)   // GET
+ const session = await getSessionFromRequest(req)

- const session = getSessionFromRequest(req)   // PUT
+ const session = await getSessionFromRequest(req)

- const session = getSessionFromRequest(req)   // DELETE
+ const session = await getSessionFromRequest(req)
```

---

### 9. `app/api/categories/route.ts` — **Atualizado**

Dois locais alterados (handler GET e handler POST):

```diff
- const session = getSessionFromRequest(req)   // GET
+ const session = await getSessionFromRequest(req)

- const session = getSessionFromRequest(req)   // POST
+ const session = await getSessionFromRequest(req)
```

---

## Resumo de impacto

| Arquivo | Tipo de mudança | Motivo |
|---|---|---|
| `lib/auth.ts` | Reescrito | Migração jsonwebtoken → jose |
| `middleware.ts` | Atualizado | async + remoção de logs |
| `app/api/auth/login/route.ts` | Atualizado | await signToken + remoção de logs |
| `app/api/auth/register/route.ts` | Atualizado | await signToken |
| `app/api/auth/me/route.ts` | Atualizado | await getSessionFromRequest |
| `app/api/accounts/route.ts` | Atualizado | await getSessionFromRequest (2x) |
| `app/api/transactions/route.ts` | Atualizado | await getSessionFromRequest (2x) |
| `app/api/transactions/[id]/route.ts` | Atualizado | await getSessionFromRequest (3x) |
| `app/api/categories/route.ts` | Atualizado | await getSessionFromRequest (2x) |
| `package.json` | Dependência adicionada | jose instalado |

**Total de arquivos:** 10  
**Total de alterações em chamadas de função:** 14 pontos + reescrita completa de `auth.ts`

---

## Verificação

- ✅ `npx tsc --noEmit` sem erros de TypeScript após as alterações
- ✅ Compatível com Edge Runtime (Vercel Middleware)
- ✅ Compatível com Node.js Runtime (rotas de API)
- ✅ Interface pública de `lib/auth.ts` preservada (mesmos nomes de função e tipos)
