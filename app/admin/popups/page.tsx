import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeletePopupButton from "@/components/DeletePopupButton";

export default async function PopupsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const userId = session.user.id;

  // ポップアップを取得
  const popups = await prisma.popUpConfig.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  // 統計ログを集計
  const statsLogs = await prisma.trackingLog.groupBy({
    by: ['popUpId', 'pattern', 'eventType'],
    where: { 
      popUpId: { in: popups.map(p => p.id) },
      NOT: { popUpId: null } 
    },
    _count: true
  });

  // 統計マップの作成
  const statsMap = statsLogs.reduce((acc: any, log) => {
    const pid = log.popUpId;
    if (!pid) return acc;
    if (!acc[pid]) acc[pid] = { A: { view: 0, click: 0 }, B: { view: 0, click: 0 } };
    
    const pattern = (log.pattern || "A") as 'A' | 'B';
    const type = log.eventType as 'view' | 'click';
    acc[pid][pattern][type] = log._count;
    return acc;
  }, {});

  const totalViews = popups.reduce((acc, curr) => acc + curr.views, 0);
  const totalClicks = popups.reduce((acc, curr) => acc + curr.clicks, 0);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">施策パフォーマンス・ダッシュボード</h1>
        <p className="text-gray-500">各Web接客施策のエンゲージメントとコンバージョン推移</p>
      </header>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase">ポップアップ表示</span>
          <p className="text-3xl font-black mt-1">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase">ポップアップクリック</span>
          <p className="text-3xl font-black mt-1">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <span className="text-xs font-bold text-gray-400 uppercase">リード獲得数</span>
          <p className="text-3xl font-black mt-1 text-blue-600">
            {await prisma.visitor.count({ where: { userId } })} <span className="text-sm font-normal text-gray-400">名</span>
          </p>
        </div>
      </div>

      {/* 施策一覧テーブル */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-bold">アクティブな接客施策</h2>
          <Link href="/admin/popups/new" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
            + 新規作成
          </Link>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
            <tr>
              <th className="p-4">施策名</th>
              <th className="p-4">ABテスト</th>
              <th className="p-4">パターンA CTR</th>
              <th className="p-4">パターンB CTR</th>
              <th className="p-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {popups.map((popup) => {
              const s = statsMap[popup.id] || { A: { view: 0, click: 0 }, B: { view: 0, click: 0 } };
              const ctrA = s.A.view > 0 ? ((s.A.click / s.A.view) * 100).toFixed(1) : "0.0";
              const ctrB = s.B.view > 0 ? ((s.B.click / s.B.view) * 100).toFixed(1) : "0.0";
              return (
                <tr key={popup.id} className="text-sm hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-800">{popup.name}</td>
                  <td className="p-4">{!!popup.titleB ? '実施中' : 'なし'}</td>
                  <td className="p-4 font-mono">{ctrA}%</td>
                  <td className="p-4 font-mono">{!!popup.titleB ? `${ctrB}%` : '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-4">
                      {/* シンプルなテキストリンク */}
                      <Link 
                        href={`/admin/analytics/${popup.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-bold underline"
                      >
                        分析
                      </Link>
                      
                      <Link 
                        href={`/admin/popups/${popup.id}/edit`} 
                        className="text-gray-500 hover:text-gray-800"
                      >
                        編集
                      </Link>
                      
                      <DeletePopupButton popupId={popup.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}