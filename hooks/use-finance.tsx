"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  date: string
  notes?: string
  categoryId?: string
  accountId?: string
  category?: {
    id: string
    name: string
    color: string
    icon: string
  }
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  transactionType: "income" | "expense" | "both"
}

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  color: string
}

export interface DashboardData {
  period: { month: number; year: number }
  balance: {
    total: number
    accounts: Array<{ id: string; name: string; balance: number; type: string; color: string }>
  }
  income: {
    current: number
    previous: number
    change: number
  }
  expense: {
    current: number
    previous: number
    change: number
  }
  cashFlow: Array<{ name: string; receitas: number; despesas: number }>
  categoryBreakdown: Array<{ name: string; color: string; total: number }>
}

interface FinanceContextType {
  transactions: Transaction[]
  categories: Category[]
  accounts: Account[]
  dashboardData: DashboardData | null
  isLoading: boolean
  refreshData: () => Promise<void>
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<boolean>
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<boolean>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [txRes, catRes, accRes, dashRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories"),
        fetch("/api/accounts"),
        fetch("/api/dashboard"),
      ])

      if (txRes.ok && catRes.ok && accRes.ok && dashRes.ok) {
        const txData = await txRes.json()
        const catData = await catRes.json()
        const accData = await accRes.json()
        const dashData = await dashRes.json()

        setTransactions(txData.transactions || [])
        setCategories(catData || [])
        setAccounts(accData || [])
        setDashboardData(dashData)
      } else {
        console.error("Failed to fetch finance data")
      }
    } catch (error) {
      console.error("Error loading finance data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      })

      if (res.ok) {
        toast({
          title: "Transação adicionada",
          description: "Sua movimentação foi registrada com sucesso.",
        })
        await refreshData()
        return true
      } else {
        const errorData = await res.json()
        toast({
          variant: "destructive",
          title: "Erro ao adicionar",
          description: errorData.error || "Ocorreu um erro inesperado.",
        })
        return false
      }
    } catch (err) {
      console.error("Error adding transaction:", err)
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível se comunicar com o banco local.",
      })
      return false
    }
  }

  const updateTransaction = async (id: string, tx: Partial<Transaction>) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      })

      if (res.ok) {
        toast({
          title: "Transação atualizada",
          description: "Sua movimentação foi atualizada com sucesso.",
        })
        await refreshData()
        return true
      } else {
        const errorData = await res.json()
        toast({
          variant: "destructive",
          title: "Erro ao atualizar",
          description: errorData.error || "Ocorreu um erro inesperado.",
        })
        return false
      }
    } catch (err) {
      console.error("Error updating transaction:", err)
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível se comunicar com o banco local.",
      })
      return false
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Transação removida",
          description: "A movimentação foi excluída com sucesso.",
        })
        await refreshData()
        return true
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao remover",
          description: "Não foi possível deletar a transação.",
        })
        return false
      }
    } catch (err) {
      console.error("Error deleting transaction:", err)
      return false
    }
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        dashboardData,
        isLoading,
        refreshData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
