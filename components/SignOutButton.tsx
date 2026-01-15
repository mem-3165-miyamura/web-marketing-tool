"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function SignOutButton() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignOut = async () => {
    setIsProcessing(true);
    await signOut({
      callbackUrl: "/auth/signin",
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isProcessing}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium"
    >
      {isProcessing ? "サインアウト中..." : "サインアウト"}
    </button>
  );
}
