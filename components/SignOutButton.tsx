// components/SignOutButton.tsx
"use client";

import { useState } from "react";

// サーバーアクションをインポート
import { signOutAction } from "@/actions/signOutAction";

export default function SignOutButton() {
  const [isProcessing, setIsProcessing] = useState(false);

  // サインアウトボタンがクリックされたらサーバーアクションを呼び出す
  const handleSignOut = async () => {
    setIsProcessing(true);
    await signOutAction();
    setIsProcessing(false);
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        padding: '10px 20px',
        backgroundColor: '#e53e3e',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
      disabled={isProcessing}
    >
      {isProcessing ? "サインアウト中..." : "サインアウト"}
    </button>
  );
}
