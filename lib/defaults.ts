export const defaultCategories = [
  // Despesas
  { name: "Alimentação", color: "#f97316", icon: "utensils", transactionType: "expense" },
  { name: "Moradia", color: "#8b5cf6", icon: "home", transactionType: "expense" },
  { name: "Transporte", color: "#3b82f6", icon: "car", transactionType: "expense" },
  { name: "Saúde", color: "#ef4444", icon: "heart-pulse", transactionType: "expense" },
  { name: "Educação", color: "#06b6d4", icon: "graduation-cap", transactionType: "expense" },
  { name: "Lazer", color: "#ec4899", icon: "gamepad-2", transactionType: "expense" },
  { name: "Vestuário", color: "#a855f7", icon: "shirt", transactionType: "expense" },
  { name: "Assinaturas", color: "#64748b", icon: "tv", transactionType: "expense" },
  { name: "Outros Gastos", color: "#94a3b8", icon: "ellipsis", transactionType: "expense" },
  // Receitas
  { name: "Salário", color: "#22c55e", icon: "briefcase", transactionType: "income" },
  { name: "Freelance", color: "#10b981", icon: "laptop", transactionType: "income" },
  { name: "Investimentos", color: "#f59e0b", icon: "trending-up", transactionType: "income" },
  { name: "Outras Receitas", color: "#84cc16", icon: "plus-circle", transactionType: "income" },
]

export const defaultAccounts = [
  { name: "Conta Corrente", type: "checking", balance: 0, color: "#6366f1" },
  { name: "Poupança", type: "savings", balance: 0, color: "#22c55e" },
]
