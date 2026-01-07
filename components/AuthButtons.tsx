// components/AuthButtons.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react"; // useSessionをインポート

export default function AuthButtons() {
  // useSession フックでログイン状態とユーザー情報を取得
  const { data: session, status } = useSession(); 
  
  if (status === "loading") {
    return <div>ロード中...</div>; // セッション取得中はロード中表示
  }

  return (
    <div>
      {/* ログインしていない場合 */}
      {!session && (
        <button 
          onClick={() => signIn('google')} 
          style={{ padding: '10px 20px', border: '1px solid blue', cursor: 'pointer' }}
        >
          Googleでサインイン
        </button>
      )}

      {/* ログインしている場合 */}
      {session && (
        <>
          <p>
            **ようこそ, {session.user?.name} 様** (メール: {session.user?.email})
          </p>
          <button 
            onClick={() => signOut()}
            style={{ padding: '10px 20px', border: '1px solid red', cursor: 'pointer', marginLeft: '10px' }}
          >
            サインアウト
          </button>
        </>
      )}
    </div>
  );
}