import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1. 管理者ユーザーの作成
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
  console.log('✅ Admin user created:', user.email)

  // 2. 名寄せ（Identify）用ダミーレコードの作成
  // これがないとフォーム送信時の自動名寄せで外部キー制約エラーが発生します
  const systemPopup = await prisma.popUpConfig.upsert({
    where: { id: 'system_identify' },
    update: {},
    create: {
      id: 'system_identify',
      name: 'System Account',
      title: 'Auto Capture System',
      description: 'ポップアップ外でのフォーム送信を記録するためのシステム用レコードです。',
      userId: user.id, // 作成した管理者に紐付け
    },
  })
  console.log('✅ System identify record created:', systemPopup.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })