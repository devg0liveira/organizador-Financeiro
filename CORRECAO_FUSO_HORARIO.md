# 🕒 Documentação de Tratamento de Datas e Fuso Horário (Timezone)

Este documento descreve o padrão adotado no **NexBank** para lidar com datas de transações, filtros mensais e comunicação frontend-backend sem divergência de fuso horário.

---

## 🎯 O Problema Resolvido

Anteriormente, transações criadas no fuso horário do Brasil (UTC-3 / Brasília) sofriam recuo de **1 dia para trás**:
* **Exemplo**: Usuário selecionava dia **15/06/2026**.
* O frontend enviava `"2026-06-15"`.
* Ao instanciar `new Date("2026-06-15")`, o JavaScript interpretava como `15/06/2026 00:00:00 UTC`.
* Em UTC-3 (São Paulo/Brasília), isso equivale a **`14/06/2026 21:00:00`**.
* **Resultado**: A transação era gravada e exibida como **14 de junho**.

---

## 🛡️ Solução Implementada: Estratégia *UTC Noon* (Meio-dia UTC)

Para garantir que a data de calendário nunca oscile entre dias — independentemente de o usuário estar em qualquer fuso do mundo (UTC-12 a UTC+14) —, adotamos a convenção de **gravar a data no meio-dia UTC (`12:00:00 UTC`)**.

```
Fuso Extremo UTC-11: 15/06 às 01:00 (Mesmo dia ✅)
Fuso Brasil UTC-3:   15/06 às 09:00 (Mesmo dia ✅)
Fuso UTC 0:          15/06 às 12:00 (Mesmo dia ✅)
Fuso Japão UTC+9:    15/06 às 21:00 (Mesmo dia ✅)
Fuso Extremo UTC+12: 16/06 às 00:00
```

---

## 📁 Arquitetura e Utilitários (`lib/finance-helpers.ts`)

| Função | Finalidade |
|---|---|
| `parseLocalDateToUTCNoon(dateStr)` | Converte `"YYYY-MM-DD"` para `Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0))` |
| `formatDateToLocalISO(date)` | Extrai a data visível no browser como `"YYYY-MM-DD"` |
| `formatTransactionDate(dateStr)` | Formata data com `.toLocaleDateString("pt-BR", { timeZone: "UTC" })` |
| `getMonthRangeUTC(year, month)` | Gera range `{ start, end }` em UTC para queries precisas no banco |
| `getPreviousMonth(year, month)` | Calcula mês anterior de forma segura (sem erros em transição Jan → Dez) |

---

## 🔄 Fluxo de Dados

### 1. Criação / Edição de Transação
1. **Frontend (`add-transaction-dialog.tsx`)**:
   - Inicializa com a data local do navegador: `formatDateToLocalISO(new Date())`.
   - Envia a string simples `"YYYY-MM-DD"` via payload JSON.
2. **Backend API (`app/api/transactions/route.ts` & `[id]/route.ts`)**:
   - Recebe a string e processa via `parseLocalDateToUTCNoon(date)`.
   - Grava no banco via Prisma com timestamp seguro.

### 2. Exibição de Listagens e Gráficos
1. **Listagem (`recent-transactions.tsx`)**:
   - Formata a exibição usando `formatTransactionDate(tx.date)`.
   - Filtros de mês/ano utilizam `getUTCMonth()` e `getUTCFullYear()`.
2. **Gráfico de Despesas (`expense-breakdown.tsx`)**:
   - Filtros de ano e mês utilizam métodos UTC para evitar que transações do dia 1º caiam no mês anterior.
3. **Dashboard API (`app/api/dashboard/route.ts`)**:
   - Consultas de mês atual, mês anterior e histórico de 12 meses utilizam `getMonthRangeUTC()`.

---

## 📌 Boas Práticas para Novos Desenvolvimentos

* ❌ **Evite**: `new Date(dateStr)` ao receber strings `"YYYY-MM-DD"`.
* ❌ **Evite**: `.toISOString().split("T")[0]` no navegador em horários noturnos (pode adiantar o dia).
* ❌ **Evite**: `.getMonth()` ou `.getFullYear()` em datas vindas do banco de dados (prefira `.getUTCMonth()` e `.getUTCFullYear()`).
* ✅ **Use sempre**: Os helpers centralizados em `lib/finance-helpers.ts`.
