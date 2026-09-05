import { z } from "zod"

// Validações de Autenticação
export const loginSchema = z
  .object({
    email: z
      .string({ required_error: "Email é obrigatório" })
      .trim()
      .email("Formato de e-mail inválido")
      .max(255, "Email muito longo"),
    password: z
      .string({ required_error: "Senha é obrigatória" })
      .min(1, "Senha não pode estar vazia")
      .max(128, "Senha muito longa"),
  })
  .strict()

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Nome é obrigatório" })
      .trim()
      .min(2, "Nome deve ter no mínimo 2 caracteres")
      .max(100, "Nome muito longo"),
    email: z
      .string({ required_error: "Email é obrigatório" })
      .trim()
      .email("Formato de e-mail inválido")
      .max(255, "Email muito longo"),
    password: z
      .string({ required_error: "Senha é obrigatória" })
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .max(128, "Senha muito longa"),
  })
  .strict()

export const forgotPasswordSchema = z
  .object({
    email: z
      .string({ required_error: "Email é obrigatório" })
      .trim()
      .email("Formato de e-mail inválido")
      .max(255, "Email muito longo"),
  })
  .strict()

// Validações de Contas Bancárias
export const accountCreateSchema = z
  .object({
    name: z
      .string({ required_error: "Nome da conta é obrigatório" })
      .trim()
      .min(1, "Nome não pode estar vazio")
      .max(100, "Nome muito longo"),
    type: z.enum(["checking", "savings", "credit", "investment"], {
      errorMap: () => ({ message: "Tipo deve ser checking, savings, credit ou investment" }),
    }),
    balance: z
      .union([z.number(), z.string()])
      .optional()
      .default(0)
      .transform((val) => {
        const parsed = typeof val === "string" ? parseFloat(val) : val
        return isNaN(parsed) ? 0 : parsed
      }),
    color: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor hexadecimal inválida")
      .optional()
      .default("#6366f1"),
  })
  .strict()

export const accountUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    type: z.enum(["checking", "savings", "credit", "investment"]).optional(),
    balance: z
      .union([z.number(), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined) return undefined
        const parsed = typeof val === "string" ? parseFloat(val) : val
        return isNaN(parsed) ? 0 : parsed
      }),
    color: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor hexadecimal inválida")
      .optional(),
  })
  .strict()

// Validações de Categorias
export const categoryCreateSchema = z
  .object({
    name: z
      .string({ required_error: "Nome da categoria é obrigatório" })
      .trim()
      .min(1, "Nome não pode estar vazio")
      .max(100, "Nome muito longo"),
    color: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor hexadecimal inválida")
      .optional()
      .default("#6366f1"),
    icon: z.string().trim().min(1).max(50).optional().default("tag"),
    transactionType: z.enum(["income", "expense", "both"]).optional().default("both"),
  })
  .strict()

export const categoryUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    color: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor hexadecimal inválida")
      .optional(),
    icon: z.string().trim().min(1).max(50).optional(),
    transactionType: z.enum(["income", "expense", "both"]).optional(),
  })
  .strict()

// Validações de Transações
export const transactionCreateSchema = z
  .object({
    description: z
      .string({ required_error: "Descrição é obrigatória" })
      .trim()
      .min(1, "Descrição não pode estar vazia")
      .max(255, "Descrição muito longa"),
    amount: z
      .union([z.number(), z.string()], { required_error: "Valor é obrigatório" })
      .transform((val) => {
        const parsed = typeof val === "string" ? parseFloat(val) : val
        return Math.abs(parsed)
      })
      .refine((val) => !isNaN(val) && val >= 0, {
        message: "Valor deve ser um número válido",
      }),
    type: z.enum(["income", "expense"], {
      errorMap: () => ({ message: "Tipo deve ser 'income' ou 'expense'" }),
    }),
    date: z.union([z.string(), z.date()], { required_error: "Data é obrigatória" }),
    notes: z.string().trim().max(1000, "Observações muito longas").nullable().optional(),
    categoryId: z.string().trim().nullable().optional(),
    accountId: z.string().trim().nullable().optional(),
  })
  .strict()

export const transactionUpdateSchema = z
  .object({
    description: z.string().trim().min(1).max(255).optional(),
    amount: z
      .union([z.number(), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined) return undefined
        const parsed = typeof val === "string" ? parseFloat(val) : val
        return Math.abs(parsed)
      })
      .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
        message: "Valor deve ser um número válido",
      }),
    type: z.enum(["income", "expense"]).optional(),
    date: z.union([z.string(), z.date()]).optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    categoryId: z.string().trim().nullable().optional(),
    accountId: z.string().trim().nullable().optional(),
  })
  .strict()
