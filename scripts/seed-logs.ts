// scripts/seed-logs.ts (全文)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 テスト用ログの生成を開始します...');

  // 1. 紐付けるポップアップを取得
  const popup = await prisma.popUpConfig.findFirst();
  if (!popup) {
    console.error('❌ PopUpConfigがありません。先に画面から作成するか、DBを確認してください。');
    return;
  }

  // 2. 「昨日」の日付を設定
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // 3. 10件のログを作成
  const logs = [];
  for (let i = 0; i < 10; i++) {
    logs.push(
      prisma.trackingLog.create({
        data: {
          popUpId: popup.id,
          userId: `user_${i}`,
          eventType: i % 3 === 0 ? 'click' : 'view',
          pattern: i % 2 === 0 ? 'A' : 'B',
          createdAt: yesterday,
        },
      })
    );
  }

  await Promise.all(logs);
  console.log(`✅ ${yesterday.toISOString().split('T')[0]} 分のログを10件作成しました。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });