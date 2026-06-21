"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useFinance, Transaction } from "@/hooks/use-finance"
import {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Briefcase,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Tag,
  Laptop,
  TrendingUp,
  PlusCircle,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Shirt,
  Tv,
  Ellipsis,
  Info,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Mapeamento de ícones para exibição dinâmica
const iconMap: Record<string, React.ComponentType<any>> = {
  utensils: Utensils,
  home: Home,
  car: Car,
  briefcase: Briefcase,
  shopping: ShoppingCart,
  laptop: Laptop,
  "trending-up": TrendingUp,
  "plus-circle": PlusCircle,
  "gamepad-2": Gamepad2,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  shirt: Shirt,
  tv: Tv,
  ellipsis: Ellipsis,
}

export function RecentTransactions() {
  const { transactions, deleteTransaction, isLoading } = useFinance()
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [toDelete, setToDelete] = useState<{ id: string; description?: string } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreateDummy = async () => {
    // Apenas um helper se o usuário quiser gerar rapidamente
  }

  const showNoteDialog = (note?: string) => {
    if (!note) {
      return
    }

    setSelectedNote(note)
    setIsNoteDialogOpen(true)
  }

  const ALL_OPTION = "all"
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_OPTION)
  const [selectedYear, setSelectedYear] = useState<string>(ALL_OPTION)

  const MONTH_OPTIONS = [
    { key: "01", label: "Janeiro" },
    { key: "02", label: "Fevereiro" },
    { key: "03", label: "Março" },
    { key: "04", label: "Abril" },
    { key: "05", label: "Maio" },
    { key: "06", label: "Junho" },
    { key: "07", label: "Julho" },
    { key: "08", label: "Agosto" },
    { key: "09", label: "Setembro" },
    { key: "10", label: "Outubro" },
    { key: "11", label: "Novembro" },
    { key: "12", label: "Dezembro" },
  ]

  const yearOptions = Array.from(
    new Set(transactions.map((transaction) => new Date(transaction.date).getFullYear()))
  )
    .sort((a, b) => b - a)
    .map(String)

  const filteredTransactions = [...transactions]
    .filter((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = String(date.getMonth() + 1).padStart(2, "0")
      const yearKey = String(date.getFullYear())

      if (selectedYear !== ALL_OPTION && yearKey !== selectedYear) {
        return false
      }

      if (selectedMonth !== ALL_OPTION && monthKey !== selectedMonth) {
        return false
      }

      return true
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Transações Recentes
          </h3>
          <p className="text-sm text-muted-foreground">
            Últimas movimentações salvas
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          Carregando transações...
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg border-border">
          <p className="text-sm text-muted-foreground">Nenhuma transação cadastrada ainda.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Use a seção de "Ações Rápidas" para registrar sua primeira movimentação.</p>
        </div>
      ) : (
        <>
          {/* Opções de filtro por mês e ano */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-muted-foreground">Ano</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-muted-foreground">Mês</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos</SelectItem>
                  {MONTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-1" style={{ backgroundColor: "oklch(0.75 0.15 160)" }} />
              <span className="text-sm text-muted-foreground">Positivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-5" style={{ backgroundColor: "oklch(0.6 0.2 25)" }} />
              <span className="text-sm text-muted-foreground">Negativo</span>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg border-border">
              <p className="text-sm text-muted-foreground">Nenhuma transação nesse mês.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Altere o mês para ver outras movimentações.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[520px] overflow-y-auto">
              {filteredTransactions.map((transaction) => {
                const IconComponent =
                  (transaction.category?.icon && iconMap[transaction.category.icon]) || Tag

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg",
                          transaction.type === "income"
                            ? "bg-primary/10"
                            : "bg-destructive/10"
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "w-5 h-5",
                            transaction.type === "income"
                              ? "text-primary"
                              : "text-destructive"
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name || "Sem categoria"} • {new Date(transaction.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {transaction.type === "income" ? (
                          <ArrowDownLeft className="w-4 h-4 text-primary" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-destructive" />
                        )}
                        <span
                          className={cn(
                            "font-semibold",
                            transaction.type === "income"
                              ? "text-primary"
                              : "text-destructive"
                          )}
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(transaction.amount)}
                        </span>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => showNoteDialog(transaction.notes)}
                            disabled={!transaction.notes}
                            className={cn(
                              "p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors",
                              !transaction.notes && "cursor-not-allowed opacity-50"
                            )}
                            title={transaction.notes ? "Ver observação" : "Sem observação"}
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {transaction.notes ? "Ver observação" : "Sem observação"}
                        </TooltipContent>
                      </Tooltip>

                      <button
                        onClick={() => {
                          setToDelete({ id: transaction.id, description: transaction.description })
                          setIsDeleteDialogOpen(true)
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir transação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <Dialog
            open={isNoteDialogOpen}
            onOpenChange={(open) => {
              setIsNoteDialogOpen(open)
              if (!open) {
                setSelectedNote(null)
              }
            }}
          >
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Observação</DialogTitle>
                <DialogDescription>
                  {selectedNote || "Nenhuma observação registrada para esta transação."}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
              setIsDeleteDialogOpen(open)
              if (!open) setToDelete(null)
            }}
          >
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Excluir transação</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir "{toDelete?.description}"? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!toDelete) return
                    setIsDeleting(true)
                    await deleteTransaction(toDelete.id)
                    setIsDeleting(false)
                    setIsDeleteDialogOpen(false)
                    setToDelete(null)
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
