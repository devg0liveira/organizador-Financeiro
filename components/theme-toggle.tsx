"use client"

import * as React from "react"
import { Moon, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evita erro de hidratação: só renderiza após montar no cliente
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Alternar tema">
        <Moon className="h-5 w-5" />
      </Button>
    )
  }

  const isPurple = theme === "purple-theme"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isPurple ? "dark" : "purple-theme")}
      aria-label={isPurple ? "Mudar para tema escuro" : "Mudar para tema roxo"}
    >
      {isPurple ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sparkles className="h-5 w-5" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}