import { PrismaClient } from "@prisma/client"
import { defaultCategories, defaultAccounts } from "../lib/defaults"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  // Cria categorias padrão (ignora se já existirem)
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { id: cat.name }, // usa name como id temporariamente
      update: {},
      create: cat,
    }).catch(async () => {
      // Se falhar (id não existe), cria normalmente
      const exists = await prisma.category.findFirst({ where: { name: cat.name } })
      if (!exists) {
        await prisma.category.create({ data: cat })
        console.log(`  ✅ Categoria criada: ${cat.name}`)
      } else {
        console.log(`  ⏩ Categoria já existe: ${cat.name}`)
      }
    })
  }

  // Cria contas padrão
  for (const acc of defaultAccounts) {
    const exists = await prisma.account.findFirst({ where: { name: acc.name } })
    if (!exists) {
      await prisma.account.create({ data: acc })
      console.log(`  ✅ Conta criada: ${acc.name}`)
    } else {
      console.log(`  ⏩ Conta já existe: ${acc.name}`)
    }
  }

  console.log("✅ Seed concluído!")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
