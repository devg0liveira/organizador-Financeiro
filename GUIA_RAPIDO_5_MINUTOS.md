# 🔧 GUIA RÁPIDO DE CORREÇÃO (5 minutos)

## ⚠️ AVISO IMPORTANTE
Faça um backup antes! (ou use Git: `git commit -m "backup antes de corrigir datas"`)

---

## ✅ PASSO 1: Corrigir Frontend (2 minutos)

**Arquivo**: `components/dashboard/add-transaction-dialog.tsx`

**Ação**: Encontre a linha com `defaultValues` (próximo a linha 74)

**Procure por**:
```typescript
defaultValues: {
  type: defaultType,
  date: new Date().toISOString().split("T")[0],
  description: "",
  notes: "",
},
```

**Substitua por**:
```typescript
defaultValues: {
  type: defaultType,
  date: (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })(),
  description: "",
  notes: "",
},
```

**✔️ Pronto!** Arquivo 1 corrigido.

---

## ✅ PASSO 2: Corrigir Backend (2 minutos)

**Arquivo**: `app/api/transactions/route.ts`

**Ação**: Encontre a função `POST` e procure pela linha `date: new Date(date)` (próximo a linha 83)

**Procure por**:
```typescript
const transaction = await prisma.transaction.create({
  data: {
    description,
    amount: Math.abs(parseFloat(amount)),
    type,
    date: new Date(date),  // ← ESTA LINHA
    notes: notes ?? null,
    categoryId: categoryId ?? null,
    accountId: accountId ?? null,
    userId: session.userId,
  },
  // ...
})
```

**Substitua por**:
```typescript
const transaction = await prisma.transaction.create({
  data: {
    description,
    amount: Math.abs(parseFloat(amount)),
    type,
    date: (() => {
      if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split("-").map(Number)
        return new Date(year, month - 1, day, 0, 0, 0, 0)
      }
      return new Date(date)
    })(),
    notes: notes ?? null,
    categoryId: categoryId ?? null,
    accountId: accountId ?? null,
    userId: session.userId,
  },
  // ...
})
```

**✔️ Pronto!** Arquivo 2 corrigido.

---

## ✅ PASSO 3: Testar (1 minuto)

1. **Salvar os arquivos** (Ctrl+S)
2. **Recarregar a página** (F5)
3. **Criar uma transação teste hoje**
4. **Verificar se a data está correta**

### Teste no Console Browser (F12):
```javascript
// Colar no console:
const d = new Date()
console.log("Data hoje (local):", d.toLocaleString())
const ano = d.getFullYear()
const mes = String(d.getMonth() + 1).padStart(2, "0")
const dia = String(d.getDate()).padStart(2, "0")
const dataEnviada = `${ano}-${mes}-${dia}`
console.log("Será enviado para API:", dataEnviada)
console.log("✅ Se as datas baterem, está correto!")
```

---

## 🎯 Resultado Esperado

**ANTES da correção**:
- Cria transação em 15 de junho
- Aparece como 14 de junho ❌

**DEPOIS da correção**:
- Cria transação em 15 de junho
- Aparece como 15 de junho ✅

---

## 🚨 Se Algo Deu Errado

### Erro 1: "Arquivo não encontrado"
→ Verifique o caminho exato do arquivo

### Erro 2: "Syntaxe Error"
→ Certifique-se de que copiou todo o código entre as chaves `{}`

### Erro 3: "As datas ainda estão erradas"
→ Limpe o cache do navegador (Ctrl+Shift+Delete)
→ Se persistir, veja "DIAGNOSTICO_DETALHADO_DATAS.md"

---

## 📊 Checklist

- [ ] Arquivo `add-transaction-dialog.tsx` salvo com nova lógica de data
- [ ] Arquivo `transactions/route.ts` salvo com novo parsing de data
- [ ] Página recarregada no navegador
- [ ] Teste manual: criada transação teste
- [ ] Data exibida está correta
- [ ] Banco de dados mostra a mesma data

---

## 🎉 Pronto!

Você acabou de consertar o bug de datas em 5 minutos! 🚀

Se quiser fazer correções mais completas, veja:
- `DIAGNOSTICO_DETALHADO_DATAS.md` - Análise profunda
- `CORRECAO_EXEMPLO_*.ts` - Códigos completos

---

**Próximo Passo Opcional**: Implementar testes para evitar regressão
