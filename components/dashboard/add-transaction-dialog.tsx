"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useFinance, Transaction } from "@/hooks/use-finance"
import { formatDateToLocalISO } from "@/lib/finance-helpers"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowDownLeft, ArrowUpRight, Check } from "lucide-react"

const transactionSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória"),
  amount: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().positive("O valor deve ser maior que zero")
  ),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, "A data é obrigatória"),
  categoryId: z.string().optional(),
  accountId: z.string().min(1, "Selecione a conta de liquidação"),
  notes: z.string().optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultType?: "income" | "expense"
  transactionToEdit?: Transaction | null
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  defaultType = "expense",
  transactionToEdit = null,
}: AddTransactionDialogProps) {
  const { categories, accounts, addTransaction, updateTransaction } = useFinance()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!transactionToEdit

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      date: formatDateToLocalISO(new Date()),
      description: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (transactionToEdit) {
      reset({
        description: transactionToEdit.description,
        amount: transactionToEdit.amount,
        type: transactionToEdit.type,
        date: typeof transactionToEdit.date === "string" 
          ? transactionToEdit.date.split("T")[0] 
          : formatDateToLocalISO(new Date(transactionToEdit.date)),
        categoryId: transactionToEdit.categoryId || undefined,
        accountId: transactionToEdit.accountId || undefined,
        notes: transactionToEdit.notes || "",
      })
    } else {
      reset({
        type: defaultType,
        date: formatDateToLocalISO(new Date()),
        description: "",
        notes: "",
        amount: undefined,
        categoryId: undefined,
        accountId: undefined,
      })
    }
  }, [transactionToEdit, open, defaultType, reset])

  const selectedType = watch("type")

  const filteredCategories = categories.filter(
    (cat) => cat.transactionType === selectedType || cat.transactionType === "both"
  )

  const onSubmit = async (values: TransactionFormValues) => {
    setIsSubmitting(true)
    let success = false

    if (isEditing && transactionToEdit) {
      success = await updateTransaction(transactionToEdit.id, {
        description: values.description,
        amount: values.amount,
        type: values.type,
        date: values.date,
        notes: values.notes,
        categoryId: values.categoryId || undefined,
        accountId: values.accountId || undefined,
      })
    } else {
      success = await addTransaction({
        description: values.description,
        amount: values.amount,
        type: values.type,
        date: values.date,
        notes: values.notes,
        categoryId: values.categoryId || undefined,
        accountId: values.accountId || undefined,
      })
    }

    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            {isEditing
              ? selectedType === "income"
                ? "Editar Receita"
                : "Editar Despesa"
              : selectedType === "income"
                ? "Novo Lançamento: Receita (+)"
                : "Novo Lançamento: Despesa (-)"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique os dados da transação para recalcular o balanço financeiro."
              : "Preencha as informações para registrar o fluxo financeiro."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
          {/* Alternador de Tipo */}
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">
              Natureza da Movimentação
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold border transition-colors ${
                  selectedType === "income"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                }`}
                onClick={() => setValue("type", "income")}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Receita (Entrada)
              </button>
              <button
                type="button"
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold border transition-colors ${
                  selectedType === "expense"
                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                }`}
                onClick={() => setValue("type", "expense")}
              >
                <ArrowUpRight className="w-4 h-4" />
                Despesa (Saída)
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-xs font-semibold text-foreground mb-1 block">
              Descrição do Lançamento
            </Label>
            <Input
              id="description"
              placeholder="Ex: Salário Mensal, Supermercado, Aluguel"
              className="text-xs h-9 bg-secondary/50"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-[11px] text-destructive mt-1 font-mono">{errors.description.message}</p>
            )}
          </div>

          {/* Grid Valor e Data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount" className="text-xs font-semibold text-foreground mb-1 block">
                Valor Nominal (R$)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                className="text-xs h-9 font-mono font-semibold bg-secondary/50"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-[11px] text-destructive mt-1 font-mono">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date" className="text-xs font-semibold text-foreground mb-1 block">
                Data do Lançamento
              </Label>
              <Input id="date" type="date" className="text-xs h-9 font-mono bg-secondary/50" {...register("date")} />
              {errors.date && (
                <p className="text-[11px] text-destructive mt-1 font-mono">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Conta Destino / Origem (Obrigatório) */}
          <div>
            <Label htmlFor="accountId" className="text-xs font-semibold text-foreground mb-1 block">
              Conta de Liquidação
            </Label>
            <Select
              value={watch("accountId") || ""}
              onValueChange={(val) => setValue("accountId", val, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full text-xs h-9 bg-secondary/50">
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id} className="text-xs">
                    {acc.name} (Saldo: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(acc.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-[11px] text-destructive mt-1 font-mono">{errors.accountId.message}</p>
            )}
          </div>


          {/* Categoria */}
          <div>
            <Label htmlFor="categoryId" className="text-xs font-semibold text-foreground mb-1 block">
              Classificação Categórica
            </Label>
            <Select
              value={watch("categoryId") || "sem-categoria"}
              onValueChange={(val) => setValue("categoryId", val === "sem-categoria" ? "" : val)}
            >
              <SelectTrigger className="w-full text-xs h-9 bg-secondary/50">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem-categoria" className="text-xs">
                  Sem categoria
                </SelectItem>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-xs font-semibold text-foreground mb-1 block">
              Observações e Notas Fiscais (Opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Número de protocolo, detalhes de parcelamento..."
              rows={2}
              className="text-xs bg-secondary/50 resize-none"
              {...register("notes")}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs h-8 bg-foreground text-background hover:opacity-90 font-semibold"
            >
              {isSubmitting ? "Processando..." : isEditing ? "Salvar Alterações" : "Efetivar Lançamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

