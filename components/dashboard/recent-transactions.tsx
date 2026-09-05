"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useFinance } from "@/hooks/use-finance"
import { formatTransactionDate } from "@/lib/finance-helpers"
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
  Search,
  Filter,
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

  const ALL_OPTION = "all"
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_OPTION)
  const [selectedYear, setSelectedYear] = useState<string>(ALL_OPTION)
  const [selectedType, setSelectedType] = useState<string>(ALL_OPTION)
  const [searchTerm, setSearchTerm] = useState<string>("")

  const showNoteDialog = (note?: string) => {
    if (!note) return
    setSelectedNote(note)
    setIsNoteDialogOpen(true)
  }

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
    new Set(transactions.map((transaction) => new Date(transaction.date).getUTCFullYear()))
  )
    .sort((a, b) => b - a)
    .map(String)

  const filteredTransactions = [...transactions]
    .filter((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = String(date.getUTCMonth() + 1).padStart(2, "0")
      const yearKey = String(date.getUTCFullYear())

      if (selectedYear !== ALL_OPTION && yearKey !== selectedYear) {
        return false
      }

      if (selectedMonth !== ALL_OPTION && monthKey !== selectedMonth) {
        return false
      }

      if (selectedType !== ALL_OPTION && transaction.type !== selectedType) {
        return false
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchesDesc = transaction.description.toLowerCase().includes(term)
        const matchesCat = transaction.category?.name?.toLowerCase().includes(term)
        const matchesNotes = transaction.notes?.toLowerCase().includes(term)
        if (!matchesDesc && !matchesCat && !matchesNotes) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Cálculos do extrato filtrado
  const totalFiltradoReceitas = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalFiltradoDespesas = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="p-5 sm:p-6 rounded-lg bg-card border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              Extrato e Histórico de Transações
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              {filteredTransactions.length} lançamentos
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro cronológico detalhado com filtros multicritério
          </p>
        </div>

        {/* Resumo do extrato atual */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-2.5 py-1 rounded bg-secondary/80 border border-border flex items-center gap-1.5 font-mono">
            <span className="text-muted-foreground">Entradas:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalFiltradoReceitas)}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded bg-secondary/80 border border-border flex items-center gap-1.5 font-mono">
            <span className="text-muted-foreground">Saídas:</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              -{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalFiltradoDespesas)}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-xs font-mono text-muted-foreground">
          Carregando extrato de lançamentos...
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-md border-border p-6">
          <p className="text-xs font-medium text-foreground">Nenhuma transação cadastrada no banco de dados.</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Utilize o botão "Registrar Receita" ou "Registrar Despesa" acima para realizar seu primeiro lançamento.
          </p>
        </div>
      ) : (
        <>
          {/* Filtros em linha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-secondary/60 border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full h-8 text-xs bg-secondary/60">
                  <SelectValue placeholder="Tipo de Movimentação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos os Tipos</SelectItem>
                  <SelectItem value="income">Apenas Receitas (+)</SelectItem>
                  <SelectItem value="expense">Apenas Despesas (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full h-8 text-xs bg-secondary/60">
                  <SelectValue placeholder="Filtrar por Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos os Anos</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full h-8 text-xs bg-secondary/60">
                  <SelectValue placeholder="Filtrar por Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>Todos os Meses</SelectItem>
                  {MONTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-md border-border p-4">
              <p className="text-xs text-muted-foreground">Nenhuma transação atende aos critérios do filtro selecionado.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs h-7"
                onClick={() => {
                  setSelectedMonth(ALL_OPTION)
                  setSelectedYear(ALL_OPTION)
                  setSelectedType(ALL_OPTION)
                  setSearchTerm("")
                }}
              >
                Limpar Todos os Filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredTransactions.map((transaction) => {
                const IconComponent =
                  (transaction.category?.icon && iconMap[transaction.category.icon]) || Tag
                const isIncome = transaction.type === "income"

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-md bg-secondary/30 hover:bg-secondary/70 border border-border/60 transition-colors group gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-md shrink-0 border",
                          isIncome
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        )}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {transaction.description}
                          </span>
                          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-card border border-border text-muted-foreground truncate">
                            {transaction.category?.name || "Sem categoria"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {formatTransactionDate(transaction.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-right">
                        {isIncome ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "font-bold font-mono text-xs sm:text-sm whitespace-nowrap",
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                          data-tabular="true"
                        >
                          {isIncome ? "+" : "-"}
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
                              "p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                              !transaction.notes && "cursor-not-allowed opacity-30"
                            )}
                            title={transaction.notes ? "Ver observação" : "Sem observação"}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {transaction.notes ? "Ver observação anexada" : "Sem observação registrada"}
                        </TooltipContent>
                      </Tooltip>

                      <button
                        type="button"
                        onClick={() => {
                          setToDelete({ id: transaction.id, description: transaction.description })
                          setIsDeleteDialogOpen(true)
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Diálogo de observação */}
          <Dialog
            open={isNoteDialogOpen}
            onOpenChange={(open) => {
              setIsNoteDialogOpen(open)
              if (!open) setSelectedNote(null)
            }}
          >
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">Observações do Lançamento</DialogTitle>
                <DialogDescription className="text-xs pt-2 text-foreground">
                  {selectedNote || "Nenhuma observação informada."}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Diálogo de confirmação de exclusão */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
              setIsDeleteDialogOpen(open)
              if (!open) setToDelete(null)
            }}
          >
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold text-destructive">Confirmar Exclusão</DialogTitle>
                <DialogDescription className="text-xs pt-1">
                  Tem certeza que deseja excluir o lançamento "{toDelete?.description}"? O saldo da conta será recalculado automaticamente.
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                  className="text-xs h-8"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (!toDelete) return
                    setIsDeleting(true)
                    await deleteTransaction(toDelete.id)
                    setIsDeleting(false)
                    setIsDeleteDialogOpen(false)
                    setToDelete(null)
                  }}
                  disabled={isDeleting}
                  className="text-xs h-8"
                >
                  {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

