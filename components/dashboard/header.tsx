"use client"

import { Bell, Search, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  onOpenMobileSidebar?: () => void
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileSidebar}
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </Button>

        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar transações..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full max-w-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
        </Button>

        <ThemeToggle />

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              GO
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Gabriel Oliveira</span>
            <span className="text-xs text-muted-foreground">Conta Premium</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}
