# 🧪 TESTES DE VERIFICAÇÃO

Use este arquivo para verificar se o bug foi corrigido corretamente.

---

## Teste 1: Verificação Rápida no Console (30 segundos)

1. Abrir o navegador
2. Abrir DevTools (F12)
3. Colar o código abaixo no Console:

```javascript
// === TESTE DE TIMEZONE ===
console.log("🔍 VERIFICANDO TRATAMENTO DE DATAS...")
console.log("")

const hoje = new Date()
console.log("1️⃣  Data/hora atual (local):", hoje.toLocaleString())

// Simular o que ANTES faziam
const errado = new Date(hoje.toISOString().split("T")[0])
console.log("2️⃣  Forma ERRADA (UTC):", errado.toLocaleString())
console.log("   ❌ Diferença:", Math.floor((hoje - errado) / (1000 * 60 * 60)), "horas")

// Simular o que AGORA devem fazer
const correto = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
})()
const corretoParsed = (() => {
  const [y, m, dia] = correto.split("-").map(Number)
  return new Date(y, m - 1, dia, 0, 0, 0, 0)
})()
console.log("3️⃣  Forma CORRETA (local):", corretoParsed.toLocaleString())
console.log("   ✅ Diferença:", Math.floor((hoje - corretoParsed) / (1000 * 60 * 60)), "horas")

// Resultado
console.log("")
const isDifferent = Math.floor((hoje - errado) / (1000 * 60 * 60)) !== 0
if (isDifferent) {
  console.log("⚠️  ENCONTRADO: Você está em timezone com offset!")
  console.log("🔧 AÇÃO: Aplique as correções descritas em GUIA_RAPIDO_5_MINUTOS.md")
} else {
  console.log("✅ Seu timezone é UTC, o bug pode não ser óbvio aqui")
  console.log("💡 DICA: Se mesmo assim tiver problema, veja DIAGNOSTICO_DETALHADO_DATAS.md")
}
```

**Interpretação de Resultado**:
- Se mostrar diferença de horas (ex: "-3 horas") → Você TEM o bug
- Se mostrar "0 horas" → Você está em UTC (sem problema visível)

---

## Teste 2: Criar Transação e Verificar (2 minutos)

### Passo 1: Criar Transação
1. Abrir dashboard
2. Adicionar nova transação
3. **Data**: Hoje (deve ser preenchida automaticamente)
4. **Descrição**: "Teste de Data"
5. **Valor**: Qualquer valor
6. Clicar em "Salvar"

### Passo 2: Verificar
1. Procurar a transação na lista
2. Verificar se a data exibida é HOJE
3. Ir para inspector do navegador (F12 → Network)
4. Atualizar página
5. Procurar a requisição GET para `/api/transactions`
6. Ver o JSON retornado
7. Procurar pela transação criada
8. Verificar se `date` está correta

**Resultado Esperado**:
```json
{
  "id": "...",
  "date": "2026-06-15T00:00:00Z",  // ← Deve corresponder a HOJE
  "description": "Teste de Data",
  ...
}
```

---

## Teste 3: Testar Transições de Mês (1 minuto)

Teste as datas críticas:

| Data | Esperado | Nota |
|------|----------|------|
| 1º de janeiro | Aparece como jan 1º | Início de ano |
| 31 de dezembro | Aparece como dez 31 | Fim de ano |
| 28/29 de fevereiro | Aparece correto | Ano bissexto |
| 30 de abril | Aparece como abr 30 | Mês com 30 dias |

**Como Testar**:
1. Editar uma transação existente
2. Mudar data para um desses valores
3. Salvar
4. Verificar se aparece com a data correta

---

## Teste 4: Filtro por Mês (2 minutos)

1. Abrir Dashboard
2. Selecionar "Junho" como mês
3. Verificar se todas as transações de junho aparecem
4. Testar Janeiro (1º/mês do ano)
5. Testar Dezembro (12º/mês do ano)
6. Verificar se há transações faltando ou extras

**Resultado Esperado**:
- Não deve haver "saltos" de transações entre meses
- Transações de janeiro não devem aparecer quando filtra junho
- Transações de dezembro do ano anterior não devem aparecer quando filtra janeiro

---

## Teste 5: Comparação Anterior (Dashboard) (1 minuto)

1. Ir para Dashboard
2. Verificar "Comparação com mês anterior"
3. Valores devem ser consistentes
4. Se criar transação em janeiro, a comparação com dezembro deve estar correta

---

## Teste 6: Teste Automatizado (Node.js)

Se você tem Node.js, crie um arquivo `test-dates.js`:

```javascript
// test-dates.js
function testDateHandling() {
  console.log("=== TESTE DE MANIPULAÇÃO DE DATAS ===\n")

  // Teste 1: Formato YYYY-MM-DD
  const testDate = "2026-06-15"
  console.log("✓ Teste 1: Parsing de data")
  console.log("  Input:", testDate)
  const [year, month, day] = testDate.split("-").map(Number)
  const parsed = new Date(year, month - 1, day, 0, 0, 0, 0)
  console.log("  Output:", parsed.toISOString())
  console.log("  Data local:", parsed.toLocaleString())
  console.log("")

  // Teste 2: Transição de Janeiro
  console.log("✓ Teste 2: Transição de Anos (Janeiro)")
  const jan1 = new Date(2026, 0, 1, 0, 0, 0, 0)  // 1º jan 2026
  console.log("  1º de Janeiro 2026:", jan1.toLocaleString())
  console.log("  Mês esperado: 0 (Jan), Obtido:", jan1.getMonth())
  console.log("  Ano esperado: 2026, Obtido:", jan1.getFullYear())
  console.log("")

  // Teste 3: Transição de Dezembro
  console.log("✓ Teste 3: Transição de Anos (Dezembro)")
  const dec31 = new Date(2025, 11, 31, 23, 59, 59, 999)  // 31 dez 2025
  console.log("  31 de Dezembro 2025:", dec31.toLocaleString())
  console.log("  Mês esperado: 11 (Dec), Obtido:", dec31.getMonth())
  console.log("  Ano esperado: 2025, Obtido:", dec31.getFullYear())
  console.log("")

  // Teste 4: Fevereiro (bissexto)
  console.log("✓ Teste 4: Fevereiro (Ano Bissexto)")
  const feb29 = new Date(2024, 1, 29, 0, 0, 0, 0)  // 29 fev 2024 (bissexto)
  console.log("  29 de Fevereiro 2024:", feb29.toLocaleString())
  console.log("  Dia esperado: 29, Obtido:", feb29.getDate())
  console.log("")

  // Teste 5: Mês anterior com underflow
  console.log("✓ Teste 5: Cálculo de Mês Anterior (Proteção)")
  const month = 1  // Janeiro
  const year = 2026
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  console.log("  Mês atual: Janeiro 2026")
  console.log("  Mês anterior calculado: Dezembro", prevYear)
  console.log("  Valores: prevMonth=", prevMonth, "prevYear=", prevYear)
  console.log("")

  console.log("=== TODOS OS TESTES CONCLUÍDOS ===")
}

testDateHandling()
```

**Como executar**:
```bash
node test-dates.js
```

**Resultado Esperado**:
```
=== TESTE DE MANIPULAÇÃO DE DATAS ===

✓ Teste 1: Parsing de data
  Input: 2026-06-15
  Output: 2026-06-15T03:00:00Z
  Data local: 15/6/2026 00:00:00

✓ Teste 2: Transição de Anos (Janeiro)
  1º de Janeiro 2026: 1/1/2026 00:00:00
  Mês esperado: 0 (Jan), Obtido: 0
  Ano esperado: 2026, Obtido: 2026

... etc
```

---

## Teste 7: Teste do Banco de Dados (SQL)

Se tiver acesso ao PostgreSQL:

```sql
-- Verificar se datas estão sendo armazenadas corretamente
SELECT 
  id,
  description,
  date,
  date AT TIME ZONE 'America/Sao_Paulo' as data_local,
  EXTRACT(MONTH FROM date) as mes,
  EXTRACT(DAY FROM date) as dia
FROM "Transaction"
WHERE "userId" = '...'  -- Substitua com userId
ORDER BY date DESC
LIMIT 10;
```

**Interpretação**:
- Se `date` e `data_local` forem iguais → ✅ Correto
- Se `data_local` for um dia antes → ❌ Ainda tem bug

---

## ✅ Checklist Final

- [ ] Teste 1: Console mostra diferença consistente (ou 0 se UTC)
- [ ] Teste 2: Transação criada hoje aparece com data de hoje
- [ ] Teste 3: Datas críticas (jan 1, dez 31) funcionam
- [ ] Teste 4: Filtro por mês funciona corretamente
- [ ] Teste 5: Comparação anterior está consistente
- [ ] Teste 6: Script Node.js mostra valores esperados
- [ ] Teste 7: Banco de dados mostra datas corretas

Se todos passarem ✅, o bug foi consertado!

---

## 🆘 Se Um Teste Falhar

| Teste | Falha | Ação |
|-------|-------|------|
| 1 | Mostra 0 horas mesmo em SP | Aplique a correção e teste novamente |
| 2 | Data aparece 1 dia anterior | Veja GUIA_RAPIDO_5_MINUTOS.md |
| 3 | Datas críticas dão erro | Há incompatibilidade com Prisma, veja DIAGNOSTICO_DETALHADO_DATAS.md |
| 4 | Filtro perde transações | Problema pode estar em dashboard/route.ts, veja CORRECAO_EXEMPLO_dashboard_route.ts |
| 5 | Comparação está errada | Confirme que todas as correções foram aplicadas |
| 6 | Script erro de syntax | Verifique se Node.js está instalado (`node --version`) |
| 7 | Erro de SQL | Adapte query para seu banco, pode não ter `"userId"` |

---

**Última atualização**: 2026-09-01
**Status**: Pronto para testar
