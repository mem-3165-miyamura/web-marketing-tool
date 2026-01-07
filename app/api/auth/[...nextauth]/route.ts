// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
// 修正点: lib/auth からインポート
import { authOptions } from "@lib/auth"; 

// Auth.jsの認証オプションをエクスポートする標準的な実装
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };