// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 4行目以降を以下のように変更します:
import SessionProviderWrapper from '@components/SessionProviderWrapper'; 
import { auth } from '@lib/auth';  // `getSession` ではなく `auth` をインポート

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Marketing Tool",
  description: "Web Marketing Tool Dashboard",
};

// サーバー側でセッションデータを取得
async function getSessionData() {
  // 🔽 修正: getServerSession(authOptions) を auth() に置き換え 🔽
  const session = await auth(); // `auth` 関数を使用してセッションを取得

  return session;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionData();
  
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* Client Component ラッパーにセッション情報を渡す */}
        <SessionProviderWrapper session={session}>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
