//app/popups/[id]/edit/page.tsx
import { prisma } from "@lib/prisma";
import { auth } from "@lib/auth";
import { notFound } from "next/navigation";
import EditPopUpForm from "@components/EditPopUpForm"; // 💡 作成したフォームをインポート

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPopUpPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const popup = await prisma.popUpConfig.findUnique({
    where: { id: id },
  });
  if (!popup || popup.userId !== (session.user as any).id) notFound();

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-xl my-10 border border-gray-100">
      <h1 className="text-2xl font-bold mb-8 border-b pb-4 text-gray-800">接客編集</h1>
      {/* 💡 クライアントコンポーネントを呼び出す */}
      <EditPopUpForm popup={popup} />
    </div>
  );
}