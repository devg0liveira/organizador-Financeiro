export const defaultCategories = [
  /* ========================================
     CATEGORIAS DE DESPESAS
     
     Cores mapeadas aqui como BACKUP das variáveis CSS em globals.css
     Importante: Se mudar cores aqui, mudar também em:
     - components/dashboard/expense-breakdown.tsx
     - components/dashboard/cash-flow-chart.tsx
     - globals.css (--chart-1 a --chart-9)
     
     Paleta: Acessível a daltônicos (cores distintas por matiz E luminância)
  ======================================== */
  
  // DESPESAS
  { name: "Alimentação", color: "#d97706", icon: "utensils", transactionType: "expense" },     
  // Âmbar Quente: 2ª maior despesa típica, evoca comida/calor
  // Mudança sugerida: #e8a608 (mais dourado) ou #dc8b35 (mais natural)
  
  { name: "Moradia", color: "#2563eb", icon: "home", transactionType: "expense" },             
  // Azul Royal: Maior despesa tipicamente, cor estável e confiável
  // Mudança sugerida: #1e40af (mais escuro) ou #3b82f6 (mais claro para mais visibilidade)
  
  { name: "Transporte", color: "#0d9488", icon: "car", transactionType: "expense" },           
  // Teal: Mobilidade, movimento - cor fresca
  // Mudança sugerida: #14b8a6 (mais brilhante) ou #0f766e (mais escuro/sóbrio)
  
  { name: "Saúde", color: "#dc2626", icon: "heart-pulse", transactionType: "expense" },         
  // Vermelho Carmim: Urgência médica, emergências de saúde
  // Mudança sugerida: #ef4444 (mais brilhante, alerta) ou #b91c1c (mais sério)
  
  { name: "Educação", color: "#7c3aed", icon: "graduation-cap", transactionType: "expense" },   
  // Roxo/Violeta: Conhecimento, desenvolvimento pessoal, aprendizado
  // Mudança sugerida: #a855f7 (mais claro) ou #6d28d9 (mais escuro/acadêmico)
  
  { name: "Lazer", color: "#be185d", icon: "gamepad-2", transactionType: "expense" },           
  // Framboesa/Rosa: Diversão, entretenimento, prazer
  // Mudança sugerida: #ec4899 (mais brilhante) ou #831843 (mais discreto)
  
  { name: "Vestuário", color: "#65a30d", icon: "shirt", transactionType: "expense" },          
  // Verde Oliva/Lima: Natureza, estilo, fashion - verde menos óbvio
  // Mudança sugerida: #84cc16 (mais brilhante) ou #4d7c0f (mais escuro/conservador)
  
  { name: "Assinaturas", color: "#475569", icon: "tv", transactionType: "expense" },           
  // Slate Médio: Serviços recorrentes, tecnologia
  // Mudança sugerida: #64748b (mais claro) ou #1e293b (mais corporativo)
  
  { name: "Outros Gastos", color: "#64748b", icon: "ellipsis", transactionType: "expense" },    
  // Cinza Grafite: Genérico, "tudo que sobra"
  // Mudança sugerida: #94a3b8 (mais claro) ou #475569 (mais escuro)
  
  /* ========================================
     CATEGORIAS DE RECEITAS
     
     Cores indicando entrada de dinheiro (tipicamente verdes/quentes positivas)
  ======================================== */
  
  { name: "Salário", color: "#059669", icon: "briefcase", transactionType: "income" },         
  // Verde Esmeralda ESCURO: Receita principal/confiável, positivo garantido
  // Mudança sugerida: #10b981 (mais brilhante) ou #047857 (mais escuro/corporativo)
  
  { name: "Freelance", color: "#0d9488", icon: "laptop", transactionType: "income" },          
  // Teal: Trabalho flexível, remoto, autônomo
  // Mudança sugerida: #14b8a6 (mais claro) ou #0f766e (mais sóbrio)
  
  { name: "Investimentos", color: "#d97706", icon: "trending-up", transactionType: "income" }, 
  // Âmbar: Retorno financeiro, rendimento
  // Mudança sugerida: #fbbf24 (mais ouro) ou #b45309 (mais terra)
  
  { name: "Outras Receitas", color: "#2563eb", icon: "plus-circle", transactionType: "income" }, 
  // Azul: Genérico positivo, "outras entradas"
  // Mudança sugerida: #3b82f6 (mais claro) ou #1e40af (mais escuro)
]

export const defaultAccounts = [
  /* ========================================
     CONTAS BANCÁRIAS COM CORES ASSOCIADAS
     
     Cores para diferenciar tipos de contas visualmente
     Se mudar aqui, afeta todos os usuários novos
  ======================================== */
  
  { name: "Conta Corrente", type: "checking", balance: 0, color: "#2563eb" },
  // Azul: Conta principal/diária - cor de confiança
  // Mudança sugerida: #3b82f6 (mais visível) ou #1e40af (mais sério)
  
  { name: "Reserva de Emergência", type: "savings", balance: 0, color: "#059669" },
  // Verde Esmeralda: Poupança/proteção, segurança
  // Mudança sugerida: #10b981 (mais brilhante) ou #047857 (mais escuro/protetor)
  
  { name: "Carteira de Investimentos", type: "investment", balance: 0, color: "#d97706" },
  // Âmbar: Crescimento, rendimento, futuro
  // Mudança sugerida: #f59e0b (mais dourado) ou #b45309 (mais terra/sólido)
]

