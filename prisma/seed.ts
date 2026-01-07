import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '管理者',
      hashedPassword: hashedPassword,
    },
  })
  console.log({ user })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())