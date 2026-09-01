# 📋 Documentação - Fluxo de Autenticação (Login e Registro)

## 📚 Índice
1. [Visão Geral](#visão-geral)
2. [Fluxo de Registro (Criar Usuário)](#fluxo-de-registro)
3. [Fluxo de Login](#fluxo-de-login)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Segurança e Autenticação](#segurança-e-autenticação)
6. [Detalhes Técnicos dos Arquivos](#detalhes-técnicos-dos-arquivos)
7. [Fluxo de Requisições Resumido](#fluxo-de-requisições-resumido)

---

## 🎯 Visão Geral

O sistema de autenticação utiliza:
- **JWT (JSON Web Tokens)** para manter sessões
- **bcryptjs** para hash seguro de senhas
- **Cookies HttpOnly** para armazenar tokens
- **Middleware Next.js** para proteção de rotas

**Dependências principais:**
```
jsonwebtoken - Criar e validar tokens JWT
bcryptjs - Hash de senhas (12 rounds de segurança)
@prisma/client - Acesso ao banco de dados PostgreSQL
next/server - Middleware e rotas da API
```

---

## 🔄 Fluxo de Registro (Criar Usuário)

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    PÁGINA DE REGISTRO                       │
│              (app/login/page.tsx - Aba Register)            │
└────────────────────────┬──────────────────────────────────┘
                         │ Usuário preenche:
                         │ - Nome
                         │ - Email
                         │ - Senha (mín. 6 caracteres)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           POST /api/auth/register (route.ts)               │
│     - Valida campos obrigatórios (name, email, password)  │
│     - Valida comprimento da senha (mín. 6 caracteres)     │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                           │
│     - Verifica se email já existe (prisma.user.findUnique) │
│     - Se existe: retorna erro 409 (Conflict)              │
│     - Se não existe: continua...                           │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              HASH DA SENHA (bcrypt)                         │
│   bcrypt.hash(password, 12 rounds)                         │
│   - Torna a senha irreversível                            │
│   - 12 rounds = segurança alta                            │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           CRIAR USUÁRIO NO BANCO (Prisma)                 │
│   prisma.user.create({                                    │
│     data: { name, email, passwordHash }                  │
│   })                                                      │
│                                                           │
│   Campos criados automaticamente:                        │
│   - id: CUID único                                       │
│   - createdAt: timestamp atual                          │
│   - updatedAt: timestamp atual                          │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            GERAR TOKEN JWT (signToken)                     │
│   Payload do token:                                       │
│   {                                                       │
│     userId: user.id,                                     │
│     email: user.email,                                   │
│     name: user.name,                                     │
│     iat: timestamp,                                      │
│     exp: timestamp + 7 dias                             │
│   }                                                       │
│                                                           │
│   Assinado com: process.env.JWT_SECRET                  │
│   Expiração: 7 dias                                      │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│        CONFIGURAR COOKIE HTTPONLY (createAuthCookie)       │
│   Atributos:                                               │
│   - Nome: auth-token                                      │
│   - HttpOnly: Não acessível por JavaScript                │
│   - SameSite: Lax (proteção CSRF)                        │
│   - Secure: Sim (apenas em HTTPS em produção)            │
│   - Max-Age: 7 dias (604800 segundos)                    │
│   - Path: / (disponível em toda aplicação)               │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          RESPOSTA HTTP (Status 201 - Created)              │
│   {                                                       │
│     "user": {                                            │
│       "id": "uuid",                                      │
│       "name": "Nome do Usuário",                         │
│       "email": "email@example.com"                       │
│     }                                                    │
│   }                                                       │
│                                                           │
│   Headers:                                               │
│   Set-Cookie: auth-token=JWT; Path=/; HttpOnly; ...    │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ✅ USUÁRIO REGISTRADO E LOGADO                │
│              Cookie salvo no navegador                     │
│              Redirecionado para dashboard (/)             │
└─────────────────────────────────────────────────────────────┘
```

### Validações de Registro

| Validação | Erro | Status | Descrição |
|-----------|------|--------|-----------|
| **Campos obrigatórios** | "Nome, email e senha são obrigatórios" | 400 | Se name, email ou password estiverem vazios |
| **Comprimento da senha** | "A senha deve ter pelo menos 6 caracteres" | 400 | Senha com menos de 6 caracteres |
| **Email duplicado** | "Já existe uma conta com este e-mail" | 409 | Email já registrado no banco |

---

## 🔐 Fluxo de Login

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    PÁGINA DE LOGIN                          │
│              (app/login/page.tsx - Aba Login)               │
└────────────────────────┬──────────────────────────────────┘
                         │ Usuário preenche:
                         │ - Email
                         │ - Senha
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            POST /api/auth/login (route.ts)                 │
│     - Valida campos obrigatórios (email, password)        │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                           │
│     Buscar usuário por email:                             │
│     prisma.user.findUnique({ where: { email } })         │
│                                                           │
│     Se não encontrar:                                    │
│     └─→ Retorna erro 401 "Email ou senha incorretos"    │
└─────────────────────────┬──────────────────────────────────┘
                         │ Usuário encontrado
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         VERIFICAR SENHA (bcrypt.compare)                   │
│   bcrypt.compare(password, user.passwordHash)             │
│                                                           │
│   Compara senha fornecida com hash armazenado            │
│   (Sem reversão do hash - operação segura)              │
│                                                           │
│   Se inválida:                                           │
│   └─→ Retorna erro 401 "Email ou senha incorretos"      │
└─────────────────────────┬──────────────────────────────────┘
                         │ Senha válida
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            GERAR TOKEN JWT (signToken)                     │
│   Payload do token:                                       │
│   {                                                       │
│     userId: user.id,                                     │
│     email: user.email,                                   │
│     name: user.name,                                     │
│     iat: timestamp,                                      │
│     exp: timestamp + 7 dias                             │
│   }                                                       │
│                                                           │
│   Assinado com: process.env.JWT_SECRET                  │
│   Expiração: 7 dias                                      │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│        CONFIGURAR COOKIE HTTPONLY (createAuthCookie)       │
│   (Mesmo formato do registro)                              │
│   - Nome: auth-token                                      │
│   - Expiração: 7 dias                                     │
│   - HttpOnly: Não acessível por JavaScript                │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          RESPOSTA HTTP (Status 200 - OK)                   │
│   {                                                       │
│     "user": {                                            │
│       "id": "uuid",                                      │
│       "name": "Nome do Usuário",                         │
│       "email": "email@example.com"                       │
│     }                                                    │
│   }                                                       │
│                                                           │
│   Headers:                                               │
│   Set-Cookie: auth-token=JWT; Path=/; HttpOnly; ...    │
└─────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ✅ USUÁRIO AUTENTICADO                         │
│              Cookie salvo no navegador                     │
│              Redirecionado para dashboard (/)             │
└─────────────────────────────────────────────────────────────┘
```

### Validações de Login

| Validação | Erro | Status | Descrição |
|-----------|------|--------|-----------|
| **Campos obrigatórios** | "Email e senha são obrigatórios" | 400 | Se email ou password estiverem vazios |
| **Email não existe** | "Email ou senha incorretos" | 401 | Email não encontrado no banco |
| **Senha incorreta** | "Email ou senha incorretos" | 401 | Senha não corresponde ao hash |

---

## 💾 Estrutura do Banco de Dados

### Modelo de Usuário (User)

```prisma
model User {
  id           String        @id @default(cuid())        // ID único gerado automaticamente
  name         String                                    // Nome do usuário
  email        String        @unique                     // Email único (chave de busca)
  passwordHash String                                    // Senha com hash bcrypt
  createdAt    DateTime      @default(now())             // Data de criação
  updatedAt    DateTime      @updatedAt                  // Atualizado automaticamente
  
  // Relações com outras tabelas (cascade delete)
  accounts     Account[]                                 // Contas bancárias do usuário
  categories   Category[]                                // Categorias de transações
  transactions Transaction[]                            // Transações do usuário
}
```

**Configuração do Banco:**
```
Provedor: PostgreSQL
Pool: Vercel (URL com pooler na porta 6543)
Direct: Conexão direta para migrações (porta 5432)
```

---

## 🔒 Segurança e Autenticação

### 1️⃣ Hash de Senha (bcryptjs)

```typescript
// Registro
const passwordHash = await bcrypt.hash(password, 12)
// 12 rounds = muito seguro, demora ~100ms

// Login
const valid = await bcrypt.compare(password, user.passwordHash)
// Compara sem desencriptar (seguro)
```

**Por que bcrypt?**
- ✅ Hash com salt automático
- ✅ Slow hash (resistente a força bruta)
- ✅ Adaptável (rounds aumentam com tempo)
- ✅ Padrão da indústria

### 2️⃣ Token JWT (JSON Web Token)

```typescript
signToken({
  userId: user.id,
  email: user.email,
  name: user.name
})
// Assinado com JWT_SECRET
// Expira em 7 dias
```

**Estrutura do JWT:**
```
Header.Payload.Signature

Header: { alg: "HS256", typ: "JWT" }
Payload: { userId, email, name, iat, exp }
Signature: HMACSHA256(header + payload, JWT_SECRET)
```

### 3️⃣ Cookie HttpOnly

```
Set-Cookie: auth-token=JWT_TOKEN; 
    Path=/; 
    HttpOnly;              // ← Não acessível por JavaScript
    SameSite=Lax;         // ← Proteção contra CSRF
    Max-Age=604800;       // ← 7 dias
    Secure (em produção)  // ← Apenas HTTPS
```

**Benefícios:**
- ✅ Imune a ataques XSS (não acessível por JS)
- ✅ Enviado automaticamente em todas as requisições
- ✅ Proteção CSRF com SameSite
- ✅ Apenas HTTPS em produção

### 4️⃣ Middleware de Proteção

```typescript
// Rotas públicas (sem autenticação)
["/login", "/api/auth/login", "/api/auth/register", "/_next/*"]

// Outras rotas
1. Verifica se há token no cookie
2. Valida token JWT
3. Se válido: continua
4. Se inválido: redireciona para /login
```

---

## 📁 Detalhes Técnicos dos Arquivos

### 📄 1. `lib/auth.ts` - Biblioteca de Autenticação

**Funções principais:**

```typescript
// Criar token JWT
signToken(payload: JwtPayload): string
// Entrada: { userId, email, name }
// Saída: Token JWT assinado
// Expiração: 7 dias

// Validar token JWT
verifyToken(token: string): JwtPayload | null
// Entrada: Token JWT
// Saída: Payload se válido, null se inválido

// Extrair sessão da requisição
getSessionFromRequest(req: NextRequest): JwtPayload | null
// Entrada: NextRequest
// Saída: Sessão do usuário do cookie

// Criar header Set-Cookie
createAuthCookie(token: string): string
// Entrada: Token JWT
// Saída: String para Set-Cookie header
// Configuração: HttpOnly, SameSite=Lax, 7 dias

// Limpar cookie de autenticação
clearAuthCookie(): string
// Saída: String para limpar o cookie
// Usado no logout
```

**Configurações:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || "nexbank-dev-secret-change-in-production"
const COOKIE_NAME = "auth-token"
const TOKEN_EXPIRY = "7d"
```

---

### 📄 2. `app/api/auth/register/route.ts` - Registro de Usuário

**Fluxo:**

```typescript
POST /api/auth/register

Entrada (JSON):
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}

Processamento:
1. Valida campos (name, email, password)
2. Valida comprimento da senha (mín. 6)
3. Verifica se email já existe
4. Faz hash da senha com bcrypt (12 rounds)
5. Cria usuário no banco de dados
6. Gera token JWT
7. Configura cookie HttpOnly

Saída (Sucesso - 201):
{
  "user": {
    "id": "cuid_unique_id",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}

Headers: Set-Cookie: auth-token=JWT_TOKEN; ...

Possíveis Erros:
- 400: Campos obrigatórios faltando
- 400: Senha muito curta (< 6 caracteres)
- 409: Email já registrado
- 500: Erro do servidor
```

---

### 📄 3. `app/api/auth/login/route.ts` - Login de Usuário

**Fluxo:**

```typescript
POST /api/auth/login

Entrada (JSON):
{
  "email": "joao@example.com",
  "password": "senha123"
}

Processamento:
1. Valida campos (email, password)
2. Busca usuário por email no banco
3. Compara senha com bcrypt
4. Gera token JWT
5. Configura cookie HttpOnly

Saída (Sucesso - 200):
{
  "user": {
    "id": "cuid_unique_id",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}

Headers: Set-Cookie: auth-token=JWT_TOKEN; ...

Possíveis Erros:
- 400: Campos obrigatórios faltando
- 401: Email ou senha incorretos
- 500: Erro do servidor
```

---

### 📄 4. `app/api/auth/logout/route.ts` - Logout

```typescript
POST /api/auth/logout

Processamento:
1. Cria header Set-Cookie com Max-Age=0
2. Isso remove o cookie do navegador

Saída: { message: "Logged out successfully" }

Headers: Set-Cookie: auth-token=; Max-Age=0; ...
```

---

### 📄 5. `app/api/auth/me/route.ts` - Obter Usuário Atual

```typescript
GET /api/auth/me

Processamento:
1. Extrai token do cookie
2. Valida token JWT
3. Retorna dados do usuário

Saída:
{
  "user": {
    "userId": "cuid_unique_id",
    "email": "joao@example.com",
    "name": "João Silva"
  }
}

Possíveis Erros:
- 401: Token inválido ou expirado
```

---

### 📄 6. `middleware.ts` - Proteção de Rotas

```typescript
Função: Proteger rotas não públicas

Rotas Públicas (sem autenticação necessária):
- /login
- /api/auth/login
- /api/auth/register
- /_next/*
- /favicon.ico
- /icon
- /apple-icon

Fluxo para outras rotas:
1. Extrai token do cookie "auth-token"
2. Valida com verifyToken()
3. Se válido: continua (NextResponse.next())
4. Se inválido: redireciona para /login

Matcher:
Aplica a todas as rotas exceto:
- /_next/static/*
- /_next/image/*
- /favicon.ico
```

---

### 📄 7. `app/login/page.tsx` - Interface de Autenticação

**Abas:**
1. **Login** - Formulário de login
2. **Register** - Formulário de registro
3. **Forgot Password** - Recuperação de senha

**Funcionalidades:**
- Envio de requisições POST para APIs
- Validação de formulários no frontend
- Toggle de visibilidade de senha
- Estados de carregamento
- Tratamento de erros
- Redirecionamento automático

---

## 📊 Fluxo de Requisições Resumido

### Sequência de Registro

```
┌──────────────┐
│   Frontend   │ Usuário preenche form
└──────┬───────┘
       │ POST /api/auth/register
       ▼
┌──────────────────────────────────┐
│ app/api/auth/register/route.ts   │
├──────────────────────────────────┤
│ 1. Valida campos                 │
│ 2. Verifica email duplicado      │
│ 3. Hash da senha (bcrypt)        │
│ 4. Cria usuário (Prisma)         │
│ 5. Gera JWT (signToken)          │
│ 6. Seta cookie (createAuthCookie)│
└──────┬───────────────────────────┘
       │ Response 201 + Set-Cookie
       ▼
┌──────────────┐
│   Frontend   │ Salva cookie + redireciona
│  (Browser)   │ Acesso ao dashboard
└──────────────┘
```

### Sequência de Login

```
┌──────────────┐
│   Frontend   │ Usuário preenche form
└──────┬───────┘
       │ POST /api/auth/login
       ▼
┌──────────────────────────────────┐
│   app/api/auth/login/route.ts    │
├──────────────────────────────────┤
│ 1. Valida campos                 │
│ 2. Busca usuário (Prisma)        │
│ 3. Compara senha (bcrypt)        │
│ 4. Gera JWT (signToken)          │
│ 5. Seta cookie (createAuthCookie)│
└──────┬───────────────────────────┘
       │ Response 200 + Set-Cookie
       ▼
┌──────────────┐
│   Frontend   │ Salva cookie + redireciona
│  (Browser)   │ Acesso ao dashboard
└──────────────┘
```

### Sequência de Requisição Protegida

```
┌──────────────┐
│   Frontend   │ Requisição a rota protegida
└──────┬───────┘
       │ (Cookie enviado automaticamente)
       ▼
┌──────────────┐
│ middleware   │
├──────────────┤
│ 1. Extrai    │
│    token     │
│ 2. Valida    │
│    JWT       │
└──────┬───────┘
       │
       ├─→ ✅ Válido → NextResponse.next()
       │
       └─→ ❌ Inválido → Redirect /login
```

---

## 🔄 Lifecycle do Cookie

```
CRIAÇÃO:
1. Backend gera JWT token
2. Coloca no header Set-Cookie
3. Browser recebe e armazena

USO:
1. Toda requisição inclui automaticamente o cookie
2. Middleware valida o token
3. Se válido, usuário pode acessar

EXPIRAÇÃO:
1. Após 7 dias, token expira
2. Middleware detecta token inválido
3. Usuário redirecionado para /login
4. Precisa fazer login novamente

REMOÇÃO:
1. Logout: Set-Cookie com Max-Age=0
2. Browser deleta o cookie
3. Próximas requisições sem autenticação
```

---

## ✅ Checklist de Segurança

- ✅ Senhas com hash bcrypt (12 rounds)
- ✅ JWT com expiração (7 dias)
- ✅ Cookie HttpOnly (imune a XSS)
- ✅ SameSite=Lax (proteção CSRF)
- ✅ Validação de entrada em todas as rotas
- ✅ Errors genéricos ("Email ou senha incorretos")
- ✅ Logs de erro no servidor
- ✅ PostgreSQL com pooler Vercel
- ✅ Variáveis de ambiente para secrets

---

## 🚀 Próximos Passos

1. **Configurar JWT_SECRET em produção**
   ```
   Usar uma chave forte e aleatória
   Armazenar como variável de ambiente
   ```

2. **Implementar Email de Confirmação**
   ```
   Verificar email antes de ativar conta
   Enviar link com token temporário
   ```

3. **Implementar Refresh Token**
   ```
   Token curto (15 min) + refresh token (7 dias)
   Melhor segurança que JWT único de 7 dias
   ```

4. **Adicionar 2FA (Autenticação Dupla)**
   ```
   TOTP (Time-based One-Time Password)
   SMS ou email com código
   ```

5. **Implementar Rate Limiting**
   ```
   Limitar tentativas de login
   Proteção contra força bruta
   ```

---

## 📞 Suporte

Para dúvidas sobre o fluxo de autenticação, verifique:
- `lib/auth.ts` - Funções principais
- `app/api/auth/*` - Rotas da API
- `middleware.ts` - Proteção de rotas
- `prisma/schema.prisma` - Modelo de dados
