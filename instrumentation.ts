export async function register() {
    // サーバーサイド（Node.js）の起動時のみ実行
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      const { initCron } = await import('./lib/cron-handler');
      initCron();
    }
  }