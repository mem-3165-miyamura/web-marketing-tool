import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  // 未ログインならサインインへ
  if (!session) {
    redirect("/api/auth/signin");
  }

  // ログイン済みなら、サイドバーのある管理画面トップへリダイレクト
  redirect("/admin");
}