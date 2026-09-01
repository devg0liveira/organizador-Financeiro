// VERSÃO CORRIGIDA: components/dashboard/add-transaction-dialog.tsx (trecho relevante)
// Principais correções:
// 1. Usar data local em vez de UTC
// 2. Formatar data corretamente para YYYY-MM-DD
// 3. Adicionar função auxiliar para normalização de data

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useFinance, Transaction } from "@/hooks/use-finance"
// ... outros imports ...

const transactionSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória"),
  amount: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().positive("O valor deve ser maior que zero")
  ),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, "A data é obrigatória").regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido"),
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

// FIX: Função auxiliar para formatar data como YYYY-MM-DD (data local, não UTC)
function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
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
      // FIX: Usar formatDateToISO para data local, não UTC
      date: formatDateToISO(new Date()),
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
        type: transactionToEdit.type as "income" | "expense",
        // FIX: Converter data armazenada (que pode ser timezone problem) para local
        date: formatDateToISO(new Date(transactionToEdit.date)),
        categoryId: transactionToEdit.categoryId || "",
        accountId: transactionToEdit.accountId || "",
        notes: transactionToEdit.notes || "",
      })
    } else {
      reset({
        type: defaultType,
        date: formatDateToISO(new Date()),
        description: "",
        notes: "",
      })
    }
  }, [transactionToEdit, open, reset, defaultType])

  async function onSubmit(values: TransactionFormValues) {
    setIsSubmitting(true)

    try {
      // FIX: Enviar data como string YYYY-MM-DD (será normalizada no backend)
      const payload = {
        ...values,
        date: values.date, // Já está em formato YYYY-MM-DD
      }

      if (isEditing) {
        await updateTransaction(transactionToEdit!.id, payload)
      } else {
        await addTransaction(payload)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ... resto do componente ...
  return (
    // Dialog JSX aqui
    <></>
  )
}

// ADENDA: Adicionar função de teste de timezone
// Chamar isso no console para verificar comportamento:
export function testTimezoneHandling() {
  console.log("=== TESTE DE TIMEZONE ===")
  const now = new Date()
  console.log("Hora atual (local):", now.toLocaleString())
  console.log("Hora atual (UTC):", now.toUTCString())
  
  const localDateStr = formatDateToISO(now)
  console.log("Data formatada (local):", localDateStr)
  
  // Simular o que o backend recebe
  const backendReceives = new Date(localDateStr)
  console.log("Backend recebe:", backendReceives.toLocaleString())
  
  // Verificar diferença
  const dayDiff = Math.floor((now.getTime() - backendReceives.getTime()) / (1000 * 60 * 60 * 24))
  console.log("Diferença de dias:", dayDiff)
  console.log(dayDiff === 0 ? "✅ CORRETO" : "❌ ERRO DE TIMEZONE")
}
