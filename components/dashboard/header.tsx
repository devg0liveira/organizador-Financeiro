"use client"

import { useEffect, useState } from "react"
import { Search, Menu, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  onOpenMobileSidebar?: () => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U"
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" })
        if (!response.ok) return

        const data = await response.json()
        if (mounted && data?.name) {
          setUserName(data.name)
        }
      } catch {
        // fallback
      }
    }

    loadUser()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={onOpenMobileSidebar}
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Painel Financeiro
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono font-medium bg-secondary text-muted-foreground border border-border">
              <Building2 className="w-3 h-3" />
              NexBank Core
            </span>
          </div>
          <p className="hidden md:block text-xs text-muted-foreground">
            Visão consolidada de caixa, despesas e patrimônio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        

        <ThemeToggle />

        {/* Informações do Usuário */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-border">
          <Avatar className="w-8 h-8 rounded-md shrink-0 border border-border">
            <AvatarFallback className="bg-secondary text-foreground font-semibold text-xs rounded-md">
              {userName ? getInitials(userName) : "NB"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
              {userName ?? "Titular"}
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              Conta Pessoal
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

