"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, Eye, EyeOff, Loader2, TrendingUp, Shield, Zap } from "lucide-react"

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
        setError(data.error || "Erro ao fazer login")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("Erro de conexão. Tente novamente.")
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
        setError(data.error || "Erro ao criar conta")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("Erro de conexão. Tente novamente.")
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
        setError(data.error || "Erro ao solicitar recuperação de senha")
      } else {
        setSuccessMessage(data.message || "Verificação enviada para o seu e-mail.")
      }
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 80% 35%) 50%, hsl(240 60% 20%) 100%)"
        }}
      >
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(-30%, 30%)" }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">NexBank</span>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Controle suas<br />finanças com<br />inteligência
            </h1>
            <p className="text-white/70 text-lg">
              Acompanhe receitas, despesas e investimentos em um só lugar.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: TrendingUp, text: "Gráficos e análises em tempo real" },
              { icon: Shield, text: "Seus dados protegidos e isolados" },
              { icon: Zap, text: "Interface rápida e intuitiva" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/40 text-sm">
          © 2024 NexBank. Todos os direitos reservados.
        </p>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">NexBank</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {tab === "login"
                ? "Bem-vindo de volta"
                : tab === "register"
                ? "Criar conta"
                : "Recuperar senha"}
            </h2>
            <p className="text-muted-foreground">
              {tab === "login"
                ? "Entre na sua conta para continuar"
                : tab === "register"
                ? "Comece a controlar suas finanças hoje"
                : "Informe seu e-mail para receber a verificação"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-secondary p-1 mb-8">
            <button
              id="tab-login"
              onClick={() => { setTab("login"); setError(""); setSuccessMessage("") }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              id="tab-register"
              onClick={() => { setTab("register"); setError(""); setSuccessMessage("") }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === "register"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Criar conta
            </button>
            <button
              id="tab-forgot"
              onClick={() => { setTab("forgot"); setError(""); setSuccessMessage("") }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === "forgot"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Recuperar senha
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
              {successMessage}
            </div>
          )}

          {/* Login Form */}
          {tab === "login" && (
            <form id="form-login" onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  E-mail
                </label>
                <input
                  id="input-email-login"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="input-password-login"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    id="toggle-password-login"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                id="btn-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          )}

          {tab === "forgot" && (
            <form id="form-forgot" onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Informe o e-mail para receber a verificação
                </label>
                <input
                  id="input-email-forgot"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={forgotForm.email}
                  onChange={(e) => setForgotForm({ email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <button
                id="btn-forgot"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Enviando..." : "Enviar verificação"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form id="form-register" onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome completo
                </label>
                <input
                  id="input-name-register"
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  E-mail
                </label>
                <input
                  id="input-email-register"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="input-password-register"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    id="toggle-password-register"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                id="btn-register"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Criando conta..." : "Criar conta grátis"}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Ao criar uma conta, você concorda com nossos termos de uso.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
