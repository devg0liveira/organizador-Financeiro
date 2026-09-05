"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  PieChart,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
  isMobile?: boolean
  showLogo?: boolean
  className?: string
}

const menuItems = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "simulation", label: "Simulador de Investimentos", icon: TrendingUp },
]

const bottomItems: Array<{ id: string; label: string; icon: any }> = []

export function Sidebar({ activeItem, onItemClick, isMobile = false, showLogo = true, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const isCollapsed = !isMobile && collapsed

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-sidebar-border transition-all duration-200 select-none",
        isMobile ? "w-full h-full border-none min-h-0" : "border-r min-h-screen",
        !isMobile && (isCollapsed ? "w-20" : "w-64"),
        className
      )}
    >
      {/* Logo */}
      {showLogo && (
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-emerald-600 text-white font-bold shrink-0 shadow-sm">
            <span className="font-mono text-sm tracking-tight">NB</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">
                NexBank
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Gestão Financeira
              </span>
            </div>
          )}
        </div>
      )}

      {/* Menu Principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={cn("px-3 mb-2", isCollapsed && "hidden")}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Módulos Principais
          </span>
        </div>
        {menuItems.map((item) => {
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-xs font-medium transition-colors text-left",
                isActive
                  ? "bg-secondary text-foreground font-semibold border border-border shadow-xs"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground border border-transparent"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-emerald-500" : "text-muted-foreground")} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Menu Inferior */}
      <div className="p-3 space-y-1 border-t border-sidebar-border shrink-0 mt-auto">
        {!isCollapsed && (
          <div className="p-3 mb-2 rounded-md bg-secondary/50 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Dados criptografados e isolados</span>
          </div>
        )}

        {bottomItems.map((item) => {
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md text-xs font-medium transition-colors text-left",
                isActive
                  ? "bg-secondary text-foreground font-semibold border border-border"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground border border-transparent"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0 text-muted-foreground" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          )
        })}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={loggingOut}
              title={isCollapsed ? "Encerrar Sessão" : undefined}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-left"
            >
              <LogOut className={cn("w-4 h-4 shrink-0", loggingOut && "animate-spin")} />
              {!isCollapsed && <span>{loggingOut ? "Encerrando..." : "Encerrar Sessão"}</span>}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deseja encerrar a sessão?</AlertDialogTitle>
              <AlertDialogDescription>
                Seus dados locais serão descarregados com segurança. Você poderá entrar novamente a qualquer momento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Permanecer</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Encerrar Acesso
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Botão de colapso para desktop */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shadow-xs z-10"
          aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      )}
    </aside>
  )
}

