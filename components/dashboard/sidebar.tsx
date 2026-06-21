"use client"

import { cn } from "@/lib/utils"
import {
  Home,
  ArrowUpDown,
  CreditCard,
  PieChart,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
}

const menuItems = [
  { id: "overview", label: "Visão Geral", icon: Home },
  { id: "transactions", label: "Transações", icon: ArrowUpDown },
  { id: "cards", label: "Cartões", icon: CreditCard },
  { id: "analytics", label: "Análises", icon: PieChart },
]

const bottomItems = [
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "help", label: "Ajuda", icon: HelpCircle },
]

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border min-h-screen transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
          <Wallet className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-sidebar-foreground">
            NexBank
          </span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200",
              activeItem === item.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 space-y-2 border-t border-sidebar-border">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200",
              activeItem === item.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
        <button
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-24 -right-3 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  )
}
