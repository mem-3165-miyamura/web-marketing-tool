import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; 
import Link from "next/link";

export default async function EditMailConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. 既存設定の取得
  const config = await prisma.mailConfig.findUnique({
    where: { id },
  });

  if (!config) {
    redirect("/admin/mail-configs");
  }

  // 2. 更新用 Server Action
  async function updateMailConfig(formData: FormData) {
    "use server";
    
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("認証が必要です");
    }

    await prisma.mailConfig.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        targetStatus: formData.get("targetStatus") as any,
        triggerEvent: formData.get("triggerEvent") as string,
        subject: formData.get("subject") as string,
        content: formData.get("content") as string,
        templateType: formData.get("templateType") as string,
        imageUrl: (formData.get("imageUrl") as string) || null,
        enabled: formData.get("enabled") === "true",
      },
    });

    redirect("/admin/mail-configs");
  }

  // 3. 削除用 Server Action
  async function deleteMailConfig() {
    "use server";
    await prisma.mailConfig.delete({ where: { id } });
    redirect("/admin/mail-configs");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/mail-configs" className="text-gray-500 hover:text-gray-700">
            ← 戻る
          </Link>
          <h1 className="text-2xl font-bold">配信設定の編集</h1>
        </div>
        
        {/* 削除ボタン */}
        <form action={deleteMailConfig}>
          <button 
            type="submit" 
            className="text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50"
            onClick={(e) => {
              if (!confirm("本当にこの配信設定を削除しますか？")) e.preventDefault();
            }}
          >
            設定を削除
          </button>
        </form>
      </div>

      <form action={updateMailConfig} className="space-y-4 bg-white p-8 shadow-sm rounded-xl border border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">有効状態</label>
            <select 
              name="enabled" 
              defaultValue={String(config.enabled)}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            >
              <option value="true">有効（配信する）</option>
              <option value="false">無効（一時停止）</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">設定名</label>
            <input 
              name="name" 
              type="text" 
              defaultValue={config.name}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
              required 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">対象ステータス</label>
            <select 
              name="targetStatus" 
              defaultValue={config.targetStatus}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            >
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
              defaultValue={config.triggerEvent}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">テンプレートデザイン</label>
          <select 
            name="templateType" 
            defaultValue={config.templateType}
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
          >
            <option value="B2B">B2B (シンプル・テキスト中心)</option>
            <option value="EC">EC (リッチ・画像ボタン付き)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">メール件名</label>
          <input 
            name="subject" 
            type="text" 
            defaultValue={config.subject}
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">本文内容</label>
          <textarea 
            name="content" 
            defaultValue={config.content}
            className="w-full border p-2.5 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">画像URL (EC用)</label>
          <input 
            name="imageUrl" 
            type="text" 
            defaultValue={config.imageUrl || ""}
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
            placeholder="https://..." 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all mt-4"
        >
          変更を保存する
        </button>
      </form>
    </div>
  );
}