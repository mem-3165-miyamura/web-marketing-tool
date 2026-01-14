import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MailConfigsPage() {
  const configs = await prisma.mailConfig.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">メール配信設定 (MA)</h1>
          <p className="text-gray-500 text-sm">顧客ステータスと行動に基づいた自動メールを設定します</p>
        </div>
        <Link
          href="/admin/mail-configs/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
        >
          + 新規作成
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">設定名</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">条件</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">テンプレート</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">状態</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {configs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  配信設定がまだありません。「新規作成」から最初のルールを追加しましょう。
                </td>
              </tr>
            ) : (
              configs.map((config) => (
                <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-700">{config.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                        {config.targetStatus}
                      </span>
                      <span className="text-sm text-gray-500">
                        行動: {config.triggerEvent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-md border ${config.templateType === 'EC' ? 'border-pink-200 text-pink-600 bg-pink-50' : 'border-gray-200 text-gray-600 bg-gray-50'}`}>
                      {config.templateType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {config.enabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        稼働中
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                        停止中
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/mail-configs/${config.id}/edit`} 
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}