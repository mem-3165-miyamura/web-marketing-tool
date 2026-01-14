import React from "react";
import Link from "next/link";

export default function AdminDashboard() {
  // 表示用の静的データ
  const stats = [
    { name: "総ビジター数", value: "0", icon: "👥", bgColor: "bg-blue-50" },
    { name: "ポップアップ表示数", value: "0", icon: "🖱️", bgColor: "bg-purple-50" },
    { name: "送信済みメール", value: "0", icon: "✉️", bgColor: "bg-green-50" },
  ];

  const menuItems = [
    { title: "ポップアップ管理", href: "/admin/popups", description: "表示ルールやABテストの設定", icon: "🛠️" },
    { title: "ビジター一覧", href: "/admin/visitors", description: "顧客ステータスと行動履歴の確認", icon: "🔍" },
    { title: "メール配信設定", href: "/admin/mail-configs", description: "自動送信メールのシナリオ作成", icon: "📧" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          📊 管理者ダッシュボード
        </h1>
        <p className="text-gray-500 mt-2">MAツールの運用状況を把握しましょう</p>
      </header>

      {/* 統計セクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-hover hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className={`${stat.bgColor} p-4 rounded-lg text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* クイックメニュー */}
      <h2 className="text-xl font-semibold mb-6">クイックアクセス</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group block p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-4">{item.icon}</div>
            <h3 className="font-bold text-lg group-hover:text-blue-600 mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}