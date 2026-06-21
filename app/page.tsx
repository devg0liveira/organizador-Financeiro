"use client"

import { useState } from "react"
import { useFinance } from "@/hooks/use-finance"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { VariationChart } from "@/components/dashboard/variation-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog"
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, TrendingDown, PiggyBank, X } from "lucide-react"

export default function DashboardPage() {
  const [activeItem, setActiveItem] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { dashboardData, isLoading } = useFinance()
  
  // Controle do modal de transações
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"income" | "expense">("expense")

  const handleOpenDialog = (type: "income" | "expense") => {
    setDialogType(type)
    setDialogOpen(true)
  }

  // Obter valores reais formatados ou padrão
  const totalBalance = dashboardData?.balance.total ?? 0
  const monthlyIncome = dashboardData?.income.current ?? 0
  const monthlyExpense = dashboardData?.expense.current ?? 0
  
  // Calcular investimentos (contas tipo savings ou investment)
  const investmentsBalance = dashboardData?.balance.accounts
    .filter((acc) => acc.type === "savings" || acc.type === "investment")
    .reduce((sum, acc) => sum + acc.balance, 0) ?? 0

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      </div>

      <Drawer open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <DrawerContent className="bg-sidebar border-r border-sidebar-border">
          <div className="flex items-center justify-between gap-3 p-5 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">NexBank</span>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
          <Sidebar
            activeItem={activeItem}
            onItemClick={(item) => {
              setActiveItem(item)
              setIsSidebarOpen(false)
            }}
          />
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onOpenMobileSidebar={() => setIsSidebarOpen(true)} />

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Saldo Total"
              value={isLoading ? "Carregando..." : formatBRL(totalBalance)}
              change={0}
              icon={Wallet}
              trend="up"
            />
            <StatCard
              title="Receitas do Mês"
              value={isLoading ? "Carregando..." : formatBRL(monthlyIncome)}
              change={dashboardData?.income.change ?? 0}
              icon={TrendingUp}
              trend={(dashboardData?.income.change ?? 0) >= 0 ? "up" : "down"}
            />
            <StatCard
              title="Despesas do Mês"
              value={isLoading ? "Carregando..." : formatBRL(monthlyExpense)}
              change={dashboardData?.expense.change ?? 0}
              icon={TrendingDown}
              trend={(dashboardData?.expense.change ?? 0) <= 0 ? "up" : "down"} // Despesa caindo é bom (up/green)
            />
            <StatCard
              title="Investimentos"
              value={isLoading ? "Carregando..." : formatBRL(investmentsBalance)}
              change={0}
              icon={PiggyBank}
              trend="up"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions onActionClick={handleOpenDialog} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <CashFlowChart />
            </div>
            <ExpenseBreakdown />
          </div>

          {/* Variation Chart */}
          <div className="mb-8">
            <VariationChart />
          </div>

          {/* Recent Transactions */}
          <RecentTransactions />
        </div>
      </main>

      {/* Modal Dialog para adicionar transações */}
      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultType={dialogType}
      />
    </div>
  )
}
