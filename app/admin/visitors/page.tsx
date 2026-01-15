import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma, VisitorStatus } from "@prisma/client";

/* --------------------
 * 型定義
 * ------------------ */

type FilterStatus = VisitorStatus | "ALL";

type VisitorWithLogs = Prisma.VisitorGetPayload<{
  include: {
    logs: {
      include: {
        popUpConfig: true;
      };
    };
  };
}>;

const isVisitorStatus = (v: any): v is VisitorStatus =>
  Object.values(VisitorStatus).includes(v);

/* --------------------
 * Page Component
 * ------------------ */

export default async function VisitorsPage(props: {
  // Next.js 15+ では searchParams は Promise になります
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  /* ---------- Auth ---------- */
  const session = await auth();
  if (!session) redirect("/api/auth/signin");

  /* ---------- Params ---------- */
  // searchParams を await して中身を取り出します
  const searchParams = await props.searchParams;
  
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;

  const currentStatus: FilterStatus =
    searchParams.status && isVisitorStatus(searchParams.status)
      ? (searchParams.status as FilterStatus)
      : "ALL";

  /* ---------- Prisma where ---------- */
  const whereCondition: Prisma.VisitorWhereInput = {};
  if (currentStatus !== "ALL") {
    whereCondition.status = currentStatus;
  }

  /* ---------- Data fetch ---------- */
  const totalCount = await prisma.visitor.count({ where: whereCondition });
  const totalPages = Math.ceil(totalCount / pageSize);

  const visitors: VisitorWithLogs[] = await prisma.visitor.findMany({
    where: whereCondition,
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: { updatedAt: "desc" },
    include: {
      logs: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          popUpConfig: true,
        },
      },
    },
  });

  /* ---------- UI constants ---------- */
  const tabs: { label: string; value: FilterStatus }[] = [
    { label: "すべて", value: "ALL" },
    { label: "検討中", value: "LEAD" },
    { label: "商談中", value: "PROSPECT" },
    { label: "顧客", value: "CUSTOMER" },
    { label: "解約", value: "CHURNED" },
  ];

  const statusStyles: Record<VisitorStatus, string> = {
    LEAD: "bg-blue-50 text-blue-600 border-blue-100",
    PROSPECT: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100",
    CUSTOMER: "bg-emerald-50 text-emerald-600 border-emerald-200",
    CHURNED: "bg-rose-50 text-rose-600 border-rose-100",
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-1">
              <span className="bg-blue-100 px-2 py-0.5 rounded tracking-tighter uppercase font-black text-[10px]">
                Segment CRM
              </span>
              <span>対象: {totalCount} 名</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              リード管理 & 顧客育成
            </h1>
          </div>
          <Link
            href="/admin"
            className="text-sm font-bold text-gray-500 hover:text-gray-900 border px-4 py-2 rounded-xl bg-white shadow-sm transition-all hover:shadow-md"
          >
            ← ダッシュボードへ
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto w-full md:w-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={`/admin/visitors?status=${tab.value}`}
                className={`px-5 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
                  currentStatus === tab.value
                    ? "bg-gray-900 text-white shadow-lg"
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {currentStatus !== "ALL" && totalCount > 0 && (
            <button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest group">
              <span className="text-lg group-hover:rotate-12 transition-transform">⚡️</span>
              {tabs.find((t) => t.value === currentStatus)?.label}セグメントにMAを実行
            </button>
          )}
        </div>

        {/* Visitor List */}
        <div className="space-y-6">
          {visitors.length > 0 ? (
            visitors.map((visitor) => (
              <div
                key={visitor.id}
                className={`bg-white rounded-[32px] shadow-sm border-2 transition-all ${
                  visitor.status === "CUSTOMER"
                    ? "border-emerald-200 shadow-emerald-50"
                    : "border-gray-100"
                }`}
              >
                <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border bg-gray-50 border-gray-100">
                      {visitor.status === "CUSTOMER" ? "👑" : "👤"}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">
                        {visitor.email}
                      </h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                        LAST ACTIVITY: {format(new Date(visitor.updatedAt), "yyyy/MM/dd HH:mm")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border-2 ${
                      statusStyles[visitor.status]
                    }`}
                  >
                    {tabs.find((t) => t.value === visitor.status)?.label}
                  </span>
                </div>

                <div className="px-8 pb-8 overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-bold text-gray-500">
                    <thead className="text-[9px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50">
                      <tr>
                        <th className="pb-4 px-2">Timestamp</th>
                        <th className="pb-4 px-2">Action</th>
                        <th className="pb-4 px-2">Campaign / Page Path</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {visitor.logs.map((log) => (
                        <tr key={log.id}>
                          <td className="py-4 px-2 text-gray-400">
                            {format(new Date(log.createdAt), "MM/dd HH:mm:ss")}
                          </td>
                          <td className="py-4 px-2">{log.eventType}</td>
                          <td className="py-4 px-2">
                            <div className="font-black text-gray-700">
                              {log.popUpConfig?.name ?? "Global Tracking"}
                            </div>
                            <div className="text-[10px] text-gray-300 truncate max-w-sm">
                              {log.pageUrl || "/"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[48px] py-40 text-center shadow-inner">
              <p className="text-gray-300 font-black text-2xl uppercase tracking-[0.3em] italic">No Leads Found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <Link
              href={`/admin/visitors?page=${Math.max(1, page - 1)}&status=${currentStatus}`}
              className={`px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black ${
                page <= 1 ? "opacity-20 pointer-events-none" : "hover:bg-gray-900 hover:text-white"
              }`}
            >
              PREV
            </Link>
            <div className="bg-white border-2 border-gray-100 px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] text-gray-400">
              PAGE <span className="text-blue-600">{page}</span> /{totalPages}
            </div>
            <Link
              href={`/admin/visitors?page=${Math.min(totalPages, page + 1)}&status=${currentStatus}`}
              className={`px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black ${
                page >= totalPages ? "opacity-20 pointer-events-none" : "hover:bg-gray-900 hover:text-white"
              }`}
            >
              NEXT
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}