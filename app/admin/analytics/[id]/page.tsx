import ABTestChart from '@components/analytics/ABTestChart';

// params を Promise 型として定義します
export default async function AnalyticsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 🔽 ここが修正のポイント：await して中身を取り出します
  const resolvedParams = await params;
  const popUpId = resolvedParams.id;

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">詳細アナリティクス</h1>
            <p className="text-gray-500 mt-2 font-mono text-sm">対象ID: {popUpId}</p>
          </div>
          <a 
            href="/" 
            className="px-4 py-2 bg-white border rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors"
          >
            ← ポップアップ一覧に戻る
          </a>
        </header>
        
        {/* URLから取得したIDをコンポーネントに渡す */}
        <ABTestChart popUpId={popUpId} />
      </div>
    </main>
  );
}