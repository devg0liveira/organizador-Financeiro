"use client"

import * as React from "react"
import { Moon, Sun, Sparkles, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themeOptions = [
  {
    value: "light",
    label: "Claro",
    icon: Sun,
    color: "bg-amber-200",
  },
  {
    value: "dark",
    label: "Escuro",
    icon: Moon,
    color: "bg-emerald-500",
  },
  {
    value: "purple",
    label: "Alternativo",
    icon: Sparkles,
    color: "bg-violet-500",
  },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" aria-label="Alternar tema">
        <Moon className="h-4 w-4" />
      </Button>
    )
  }

  const normalizedTheme = (theme === "purple-theme" || theme === "purple") ? "purple" : theme
  const currentTheme = themeOptions.find((t) => t.value === normalizedTheme) ?? themeOptions[1]
  const CurrentIcon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Selecionar tema"
          title="Alterar aparência"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium">{currentTheme.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themeOptions.map((option) => {
          const Icon = option.icon
          const isActive = normalizedTheme === option.value
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setTheme(option.value)}
              onClick={() => setTheme(option.value)}
              className={`flex items-center gap-3 cursor-pointer py-2 ${isActive ? "bg-accent text-accent-foreground font-medium" : ""
                }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${option.color} shrink-0`} />
              <div className="flex flex-col">
                <span className="text-sm leading-tight">{option.label}</span>
              </div>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}