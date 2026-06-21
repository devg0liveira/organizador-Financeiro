"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useFinance, Transaction } from "@/hooks/use-finance"
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

const transactionSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória"),
  amount: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().positive("O valor deve ser maior que zero")
  ),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, "A data é obrigatória"),
  categoryId: z.string().optional(),
  accountId: z.string().min(1, "Selecione uma conta"),
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
      date: new Date().toISOString().split("T")[0],
      description: "",
      notes: "",
    },
  })

  // Efeito para resetar os valores quando a transação para edição mudar
  useEffect(() => {
    if (transactionToEdit) {
      reset({
        description: transactionToEdit.description,
        amount: transactionToEdit.amount,
        type: transactionToEdit.type,
        date: new Date(transactionToEdit.date).toISOString().split("T")[0],
        categoryId: transactionToEdit.categoryId || undefined,
        accountId: transactionToEdit.accountId || undefined,
        notes: transactionToEdit.notes || "",
      })
    } else {
      reset({
        type: defaultType,
        date: new Date().toISOString().split("T")[0],
        description: "",
        notes: "",
        amount: undefined,
        categoryId: undefined,
        accountId: undefined,
      })
    }
  }, [transactionToEdit, open, defaultType, reset])

  // Assistir mudanças no tipo para filtrar as categorias
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
        date: new Date(values.date).toISOString(),
        notes: values.notes,
        categoryId: values.categoryId || undefined,
        accountId: values.accountId,
      })
    } else {
      success = await addTransaction({
        description: values.description,
        amount: values.amount,
        type: values.type,
        date: new Date(values.date).toISOString(),
        notes: values.notes,
        categoryId: values.categoryId || undefined,
        accountId: values.accountId,
      })
    }

    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? selectedType === "income"
                ? "Editar Receita"
                : "Editar Despesa"
              : selectedType === "income"
                ? "Adicionar Receita"
                : "Adicionar Despesa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique os campos desejados para atualizar o lançamento no banco de dados."
              : "Preencha os campos abaixo para salvar sua movimentação no banco."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de Movimentação</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={selectedType === "income" ? "default" : "outline"}
                className={selectedType === "income" ? "bg-primary text-primary-foreground" : ""}
                onClick={() => setValue("type", "income")}
              >
                Receita
              </Button>
              <Button
                type="button"
                variant={selectedType === "expense" ? "default" : "outline"}
                className={selectedType === "expense" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                onClick={() => setValue("type", "expense")}
              >
                Despesa
              </Button>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Salário, Supermercado, Uber"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Conta */}
          <div className="space-y-2">
            <Label htmlFor="accountId">Conta / Carteira</Label>
            <Select
              value={watch("accountId") || ""}
              onValueChange={(val) => setValue("accountId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta destino" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} (Saldo: R$ {acc.balance.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-xs text-destructive">{errors.accountId.message}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoria</Label>
            <Select
              value={watch("categoryId") || "sem-categoria"}
              onValueChange={(val) => setValue("categoryId", val === "sem-categoria" ? "" : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem-categoria">Sem categoria</SelectItem>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Algum detalhe adicional..."
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
