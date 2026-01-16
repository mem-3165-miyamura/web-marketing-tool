import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // セッションチェック
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  // メニュー項目に「商品マスター (CMS)」を追加
  const menuItems = [
    { name: "ダッシュボード", href: "/admin", icon: "📊" },
    { name: "ポップアップ設定", href: "/admin/popups", icon: "🪟" },
    { name: "顧客一覧 (Visitors)", href: "/admin/visitors", icon: "👥" },
    { name: "メール配信設定 (MA)", href: "/admin/mail-configs", icon: "📧" },
    { name: "商品マスター (CMS)", href: "/admin/products", icon: "📦" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* サイドバー */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 relative">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Marketing Tool</h1>
          <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600 truncate px-1">
            {session.user?.email}
          </div>
          <Link
            href="/api/auth/signout"
            className="text-xs text-red-500 hover:underline mt-2 block"
          >
            ログアウト
          </Link>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-end items-center">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>環境: ローカル開発 (MailHog連携中)</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </header>
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>
    </div>
  );
}