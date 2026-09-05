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
import { Simulator } from "@/components/dashboard/simulator"
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowDownLeft, ArrowUpRight, Scale, X, Building2, PiggyBank } from "lucide-react"

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
  
  // Calcular investimentos/poupança (contas tipo savings ou investment)
  const investmentsBalance = dashboardData?.balance.accounts
    .filter((acc) => acc.type === "savings" || acc.type === "investment")
    .reduce((sum, acc) => sum + acc.balance, 0) ?? 0

  const savingsAccountsCount = dashboardData?.balance.accounts
    .filter((acc) => acc.type === "savings" || acc.type === "investment").length ?? 0
  
  // Contagem de contas totais
  const accountsCount = dashboardData?.balance.accounts.length ?? 0

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      </div>

      {/* Drawer Mobile */}
      <Drawer direction="left" open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <DrawerContent className="bg-sidebar border-r border-sidebar-border w-[280px] max-w-[85vw] h-full flex flex-col p-0">
          <div className="flex items-center justify-between gap-3 p-4 border-b border-sidebar-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-emerald-600 text-white font-bold font-mono text-xs">
                NB
              </div>
              <span className="text-base font-bold text-sidebar-foreground">NexBank</span>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar
              isMobile
              showLogo={false}
              activeItem={activeItem}
              onItemClick={(item) => {
                setActiveItem(item)
                setIsSidebarOpen(false)
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onOpenMobileSidebar={() => setIsSidebarOpen(true)} />

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeItem === "simulation" ? (
            <Simulator />
          ) : (
            <>
              {/* Top KPI Metrics Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Saldo Total"
                  value={isLoading ? "Carregando..." : formatBRL(totalBalance)}
                  icon={Wallet}
                  trend="neutral"
                  subtitle={`${accountsCount} ${accountsCount === 1 ? "conta ativa" : "contas ativas"}`}
                />
                <StatCard
                  title="Receitas do Mês"
                  value={isLoading ? "Carregando..." : formatBRL(monthlyIncome)}
                  change={dashboardData?.income.change ?? 0}
                  icon={ArrowDownLeft}
                  trend={(dashboardData?.income.change ?? 0) >= 0 ? "up" : "down"}
                  badgeVariant="income"
                  subtitle="vs. mês anterior"
                />
                <StatCard
                  title="Despesas do Mês"
                  value={isLoading ? "Carregando..." : formatBRL(monthlyExpense)}
                  change={dashboardData?.expense.change ?? 0}
                  icon={ArrowUpRight}
                  trend={(dashboardData?.expense.change ?? 0) <= 0 ? "up" : "down"}
                  badgeVariant="expense"
                  subtitle="vs. mês anterior"
                />
                <StatCard
                  title="Investimentos"
                  value={isLoading ? "Carregando..." : formatBRL(investmentsBalance)}
                  icon={PiggyBank}
                  trend={investmentsBalance >= 0 ? "up" : "down"}
                  badgeVariant={investmentsBalance >= 0 ? "income" : "expense"}
                  subtitle={
                    investmentsBalance < 0
                      ? "Retirada da poupança/reserva"
                      : savingsAccountsCount > 0
                      ? `${savingsAccountsCount} ${savingsAccountsCount === 1 ? "reserva ativa" : "reservas ativas"}`
                      : "Reserva patrimonial"
                  }
                />
              </div>

              {/* Quick Actions */}
              <QuickActions onActionClick={handleOpenDialog} />

              {/* Asymmetric Analytical Grid (2:1) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <CashFlowChart />
                  <VariationChart />
                </div>
                <div className="lg:col-span-1">
                  <ExpenseBreakdown />
                </div>
              </div>

              {/* Recent Transactions / Ledger Table */}
              <RecentTransactions />
            </>
          )}
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

