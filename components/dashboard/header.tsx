"use client"

import { useEffect, useState } from "react"
import { Bell, Search, ChevronDown, Menu } from "lucide-react"
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
        // ignore failures; keep the header fallback
      }
    }

    loadUser()

    return () => {
      mounted = false
    }
  }, [])
  return (
    <header className="flex items-center justify-between px-3 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-border bg-card">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={onOpenMobileSidebar}
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </Button>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Dashboard</h1>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Buscar transações..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full max-w-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
        </Button>

        <ThemeToggle />

        {/* User */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-border">
          <Avatar className="w-8 h-8 sm:w-9 sm:h-9 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
              {userName ? getInitials(userName) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
              {userName ?? "Usuário"}
            </span>
            <span className="text-xs text-muted-foreground">Conta Premium</span>
          </div>
          <ChevronDown className="hidden sm:block w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}
