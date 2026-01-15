import cron from 'node-cron';

// アーカイブAPIを叩く関数
async function runArchiveTask() {
  console.log('--- 📦 アーカイブバッチを開始します ---');
  try {
    // 1. 現在実行中のポートを特定
    const currentPort = process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3000';
    
    // 2. 基本となるURLを取得
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://127.0.0.1:${currentPort}`;

    // 【重要】もしURLが3000番で固定されていたら、現在のポートに強制置換する
    // これにより、.env の記述ミスによる他アプリ（ECサイト）への誤爆を防ぎます
    if (baseUrl.includes(':3000') && currentPort !== '3000') {
      baseUrl = baseUrl.replace(':3000', `:${currentPort}`);
    }
    
    const secret = process.env.CRON_SECRET;
    
    console.log(`📡 接続先確定: ${baseUrl} (Detected Port: ${currentPort})`);

    const res = await fetch(`${baseUrl}/api/v1/analytics/archive?secret=${secret}`, {
      method: 'GET',
    });

    // 3. レスポンスが正常か、かつJSON形式かを確認
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      const errorDetail = await res.text();
      // エラー時にHTMLが返ってきた場合でも、解析エラーで落ちずに原因を表示する
      throw new Error(`期待しないレスポンスを受け取りました (${res.status}): ${errorDetail.substring(0, 50)}...`);
    }
    
    const data = await res.json();
    console.log('✅ バッチ完了結果:', data);
  } catch (error: unknown) {
    // TypeScriptの 'unknown' 型エラーを回避
    if (error instanceof Error) {
      console.error('❌ バッチ実行エラー:', error.message);
    } else {
      console.error('❌ 不明なエラーが発生しました:', error);
    }
  }
}

// スケジュールを登録する関数
export function initCron() {
  // 1. サーバー起動時の実行
  console.log('🚀 サーバー起動を検知：初期アーカイブチェックを実行...');
  runArchiveTask();

  // 2. 毎日午前2時の実行
  cron.schedule('0 2 * * *', () => {
    console.log('⏰ 午前2時：定期アーカイブバッチを実行します');
    runArchiveTask();
  });
}