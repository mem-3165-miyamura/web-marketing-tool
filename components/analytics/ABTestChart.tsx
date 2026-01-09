'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

type Period = 'today' | 'yesterday' | 'week' | 'month' | 'all';

interface ABTestData {
  pattern: string;
  views: number;
  clicks: number;
  ctr: number;
  nonClicks: number;
}

export default function ABTestChart({ popUpId }: { popUpId: string }) {
  const [data, setData] = useState<ABTestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('today');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchData() {
      if (!popUpId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/analytics/ab-test?popUpId=${popUpId}&period=${period}`, { 
          cache: 'no-store' 
        });
        const result = await res.json();
        if (result.summary) {
          const formattedData = result.summary.map((item: any) => ({
            ...item,
            ctr: Number(item.ctr),
            nonClicks: Math.max(0, Number(item.views) - Number(item.clicks))
          }));
          setData(formattedData);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [popUpId, period]);

  if (!isMounted) return null;

  const periods: { label: string; value: Period }[] = [
    { label: '今日 (リアルタイム)', value: 'today' },
    { label: '昨日', value: 'yesterday' },
    { label: '1週間', value: 'week' },
    { label: '1ヶ月', value: 'month' },
    { label: '全期間', value: 'all' },
  ];

  return (
    <div className="space-y-6">
      {/* 期間選択 */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200 shadow-sm">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              period === p.value 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* グラフエリア */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-8 text-center">パフォーマンス比較 (100%固定)</h3>
        
        {loading ? (
          <div className="h-[400px] flex items-center justify-center italic text-gray-400 font-medium">データを集計中...</div>
        ) : data.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">データがありません</div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="pattern" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontWeight: 'bold', fill: '#475569', fontSize: 16 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: any, name: any) => {
                    const label = name === "clicks" ? "クリック (成功)" : "未クリック";
                    return [`${value.toLocaleString()} 件`, label];
                  }}
                />
                
                {/* 🔽 クリック部分：Cellを使ってパターンごとに色分け */}
                <Bar dataKey="clicks" stackId="s" barSize={80}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-click-${index}`} 
                      fill={entry.pattern === 'A' ? '#3b82f6' : '#10b981'} 
                    />
                  ))}
                </Bar>
                
                {/* 🔽 未クリック部分：薄いグレーで背景のように表示 */}
                <Bar dataKey="nonClicks" stackId="s" fill="#f1f5f9" barSize={80} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 詳細テーブル */}
      {!loading && data.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-6 text-sm font-bold text-gray-500 uppercase">パターン</th>
                <th className="p-6 text-right text-sm font-bold text-gray-500 uppercase">表示数</th>
                <th className="p-6 text-right text-sm font-bold text-gray-500 uppercase">クリック数</th>
                <th className="p-6 text-right text-sm font-bold text-blue-600 uppercase">CTR (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((row) => (
                <tr key={row.pattern} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6 font-bold flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${row.pattern === 'A' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                    パターン {row.pattern}
                  </td>
                  <td className="p-6 text-right text-gray-600 font-medium">{row.views.toLocaleString()}</td>
                  <td className="p-6 text-right text-gray-600 font-medium">{row.clicks.toLocaleString()}</td>
                  <td className="p-6 text-right font-black text-blue-600 text-xl">{row.ctr.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}