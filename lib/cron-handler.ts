import cron from 'node-cron';

// アーカイブAPIを叩く関数
async function runArchiveTask() {
  console.log('--- 📦 アーカイブバッチを開始します ---');
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const secret = process.env.CRON_SECRET;
    
    const res = await fetch(`${baseUrl}/api/v1/analytics/archive?secret=${secret}`, {
      method: 'GET',
    });
    
    const data = await res.json();
    console.log('✅ バッチ完了結果:', data);
  } catch (error) {
    console.error('❌ バッチ実行エラー:', error);
  }
}

// スケジュールを登録する関数
export function initCron() {
  // 1. サーバー起動時の実行
  console.log('🚀 サーバー起動を検知：初期アーカイブチェックを実行...');
  runArchiveTask();

  // 2. 毎日午前2時の実行 ('0 2 * * *' は 0分 2時 毎日)
  cron.schedule('0 2 * * *', () => {
    console.log('⏰ 午前2時：定期アーカイブバッチを実行します');
    runArchiveTask();
  });
}