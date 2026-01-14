import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function VisitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visitor = await prisma.visitor.findUnique({
    where: { id },
    include: { logs: { orderBy: { createdAt: "desc" }, include: { popUpConfig: true } } },
  });

  if (!visitor) notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/admin/visitors" className="text-sm text-blue-600 mb-4 block">← 一覧に戻る</Link>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 bg-white p-6 rounded-xl border">
          <h1 className="text-xl font-bold">{visitor.name || "名前なし"}</h1>
          <p className="text-gray-500 text-sm mb-4">{visitor.email}</p>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{visitor.status}</span>
        </div>
        <div className="col-span-2">
          <h2 className="font-bold mb-4">アクティビティ履歴</h2>
          <div className="space-y-4 border-l-2 ml-2">
            {visitor.logs.map(log => (
              <div key={log.id} className="pl-6 relative">
                <div className={`absolute -left-1.5 w-3 h-3 rounded-full ${log.eventType === 'mail_sent' ? 'bg-pink-500' : 'bg-blue-500'}`} />
                <div className="bg-white p-3 rounded border text-sm">
                  <div className="flex justify-between font-bold">
                    <span>{log.eventType === 'mail_sent' ? '📧 メール送信' : `🖱️ ${log.eventType}`}</span>
                    <span className="text-gray-400 font-normal">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{log.popUpConfig.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}