"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Eye, EyeOff, Loader2, BarChart3, Database, Lock, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" })
  const [forgotForm, setForgotForm] = useState({ email: "" })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Credenciais inválidas. Verifique seu e-mail e senha.")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("Falha de conexão com o servidor. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao registrar conta.")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("Falha de conexão com o servidor. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotForm),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Não foi possível processar a solicitação.")
      } else {
        setSuccessMessage(data.message || "Instruções enviadas para o e-mail informado.")
      }
    } catch {
      setError("Falha de conexão com o servidor. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Painel Esquerdo — Identidade Institucional NexBank */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 border-r border-slate-800 text-slate-100 flex-col justify-between p-12 select-none relative">
        {/* Header da Marca */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-emerald-600 text-white font-bold font-mono text-sm shadow-sm">
            NB
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">
              NexBank
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Sistema de Controle Financeiro
            </span>
          </div>
        </div>

        {/* Proposta de Valor Concreta */}
        <div className="space-y-8 my-auto py-8">
          <div>
            <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded mb-4">
              Plataforma Consolidada
            </span>
            <h1 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Gestão orçamentária rigorosa com dados auditáveis.
            </h1>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Monitore fluxo de caixa, alocação por categorias com diferenciação visual acessível e conciliação bancária completa em um único painel.
            </p>
          </div>

          <div className="space-y-3.5 border-t border-slate-800/80 pt-6">
            {[
              {
                icon: BarChart3,
                title: "Visualização Categórica Neutra",
                desc: "Gráficos com paleta de alto contraste testada para acessibilidade.",
              },
              {
                icon: Database,
                title: "Segregação e Histórico Contínuo",
                desc: "Série histórica de 12 meses com cálculo em tempo real.",
              },
              {
                icon: Lock,
                title: "Isolamento Estrito por Titular",
                desc: "Autenticação criptografada com sessões seguras e protegidas.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">{title}</span>
                  <span className="text-xs text-slate-400 block leading-tight">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé Institucional */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6 font-mono">
          <span>NexBank Core • v2.4</span>
          <span>Criptografia AES-256</span>
        </div>
      </div>

      {/* Painel Direito — Formulários com Estilo Sólido */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-emerald-600 text-white font-bold font-mono text-sm">
              NB
            </div>
            <div>
              <span className="text-lg font-bold text-foreground block">
                NexBank
              </span>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Gestão Financeira
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {tab === "login"
                ? "Acessar Plataforma"
                : tab === "register"
                ? "Cadastro de Nova Conta"
                : "Recuperação de Acesso"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {tab === "login"
                ? "Informe suas credenciais para entrar no painel financeiro"
                : tab === "register"
                ? "Crie sua conta para iniciar o controle patrimonial"
                : "Digite seu e-mail cadastrado para receber instruções"}
            </p>
          </div>

          {/* Abas de Navegação */}
          <div className="grid grid-cols-3 rounded-md bg-secondary p-1 mb-6 border border-border">
            <button
              type="button"
              id="tab-login"
              onClick={() => { setTab("login"); setError(""); setSuccessMessage("") }}
              className={`py-2 px-2 rounded text-xs font-semibold transition-all ${
                tab === "login"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              id="tab-register"
              onClick={() => { setTab("register"); setError(""); setSuccessMessage("") }}
              className={`py-2 px-2 rounded text-xs font-semibold transition-all ${
                tab === "register"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              id="tab-forgot"
              onClick={() => { setTab("forgot"); setError(""); setSuccessMessage("") }}
              className={`py-2 px-2 rounded text-xs font-semibold transition-all ${
                tab === "forgot"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              Recuperar
            </button>
          </div>

          {/* Mensagens de Feedback */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulário de Login */}
          {tab === "login" && (
            <form id="form-login" onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  E-mail Profissional ou Pessoal
                </label>
                <input
                  id="input-email-login"
                  type="email"
                  required
                  placeholder="usuario@dominio.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-foreground">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => { setTab("forgot"); setError(""); setSuccessMessage("") }}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="input-password-login"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-md bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                  <button
                    type="button"
                    id="toggle-password-login"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-md bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-xs"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isLoading ? "Validando credenciais..." : "Entrar no NexBank"}
              </button>
            </form>
          )}

          {/* Formulário de Recuperação de Senha */}
          {tab === "forgot" && (
            <form id="form-forgot" onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  E-mail Cadastrado
                </label>
                <input
                  id="input-email-forgot"
                  type="email"
                  required
                  placeholder="usuario@dominio.com"
                  value={forgotForm.email}
                  onChange={(e) => setForgotForm({ email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                id="btn-forgot"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-md bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-xs"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isLoading ? "Enviando solicitação..." : "Enviar Instruções de Recuperação"}
              </button>
            </form>
          )}

          {/* Formulário de Cadastro */}
          {tab === "register" && (
            <form id="form-register" onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nome Completo
                </label>
                <input
                  id="input-name-register"
                  type="text"
                  required
                  placeholder="Nome do Titular"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  E-mail de Acesso
                </label>
                <input
                  id="input-email-register"
                  type="email"
                  required
                  placeholder="usuario@dominio.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Senha (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <input
                    id="input-password-register"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-md bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                  <button
                    type="button"
                    id="toggle-password-register"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                id="btn-register"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-md bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-xs"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isLoading ? "Registrando conta..." : "Criar Conta no NexBank"}
              </button>
              <p className="text-[11px] text-muted-foreground text-center pt-1">
                Ao criar a conta, você concorda com os protocolos de segurança do NexBank.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

