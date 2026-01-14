import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; 
import Link from "next/link";

export default async function NewMailConfigPage() {
  async function createMailConfig(formData: FormData) {
    "use server";
    
    // 1. セッション情報の取得
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("認証が必要です。ログインし直してください。");
    }

    // 2. フォームデータの取得とサニタイズ
    const name = formData.get("name") as string;
    const targetStatus = formData.get("targetStatus") as string;
    const triggerEvent = formData.get("triggerEvent") as string;
    const subject = formData.get("subject") as string;
    const content = formData.get("content") as string;
    const templateType = formData.get("templateType") as string;
    const imageUrl = (formData.get("imageUrl") as string) || null;

    // 3. MailConfigレコードの作成
    try {
      await prisma.mailConfig.create({
        data: {
          name,
          targetStatus: targetStatus as any, // Enum型へのキャスト
          triggerEvent,
          subject,
          content,
          templateType,
          imageUrl,
          userId: session.user.id,
          enabled: true,
        },
      });
    } catch (error: any) {
      // ターミナルに詳細なエラーを表示（これが重要）
      console.error("DEBUG: MailConfig Create Error Details:", {
        code: error.code,
        message: error.message,
        data: { name, targetStatus, triggerEvent, userId: session.user.id }
      });
      
      throw new Error(`保存に失敗しました。詳細: ${error.message}`);
    }

    // 一覧画面へ戻る
    redirect("/admin/mail-configs");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/mail-configs" className="text-gray-500 hover:text-gray-700">
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">新規メール配信設定</h1>
      </div>

      <form action={createMailConfig} className="space-y-4 bg-white p-8 shadow-sm rounded-xl border border-gray-100">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">設定名</label>
          <input 
            name="name" 
            type="text" 
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-900" 
            placeholder="例：リード獲得時サンクスメール" 
            required 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">対象ステータス</label>
            <select name="targetStatus" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-900">
              <option value="LEAD">LEAD (検討中)</option>
              <option value="PROSPECT">PROSPECT (商談中)</option>
              <option value="CUSTOMER">CUSTOMER (顧客)</option>
              <option value="CHURNED">CHURNED (解約)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">トリガーイベント</label>
            <input 
              name="triggerEvent" 
              type="text" 
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-900" 
              placeholder="page_view, identifyなど" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">テンプレートデザイン</label>
          <select name="templateType" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-900">
            <option value="B2B">B2B (シンプル・テキスト中心)</option>
            <option value="EC">EC (リッチ・画像ボタン付き)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">メール件名</label>
          <input 
            name="subject" 
            type="text" 
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-900" 
            placeholder="ご登録ありがとうございます" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">本文内容</label>
          <textarea 
            name="content" 
            className="w-full border p-2.5 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-900" 
            placeholder="メール本文を入力してください。"
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">画像URL (EC用・任意)</label>
          <input 
            name="imageUrl" 
            type="text" 
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-900" 
            placeholder="https://..." 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition-all mt-4"
        >
          配信設定を保存する
        </button>
      </form>
    </div>
  );
}