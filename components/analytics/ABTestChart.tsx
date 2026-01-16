//components/analytics/ABTestChart.tsx
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
  Cell,
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
  }, []);

  useEffect(() => {
    if (!popUpId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/v1/analytics/ab-test?popUpId=${popUpId}&period=${period}`,
          { cache: 'no-store' }
        );

        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const result = await res.json();

        if (Array.isArray(result.summary)) {
          const formattedData: ABTestData[] = result.summary.map((item: any) => {
            const views = Number(item.views) || 0;
            const clicks = Number(item.clicks) || 0;
            return {
              pattern: item.pattern,
              views,
              clicks,
              ctr: Number(item.ctr) || 0,
              nonClicks: Math.max(0, views - clicks),
            };
          });
          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [popUpId, period]);

  if (!isMounted) {
    return <div className="h-[400px] w-full bg-gray-50 rounded-2xl animate-pulse" />;
  }

  const periods: { label: string; value: Period }[] = [
    { label: '今日', value: 'today' },
    { label: '昨日', value: 'yesterday' },
    { label: '1週間', value: 'week' },
    { label: '1ヶ月', value: 'month' },
    { label: '全期間', value: 'all' },
  ];

  return (
    <div className="space-y-6">
      {/* 期間切り替え */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${
              period === p.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* グラフセクション */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-xl font-black text-gray-900">パターン別コンバージョン率</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" /> パターンA
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm" /> パターンB
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-400">データを集計中...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed font-bold">
            この期間のデータはまだありません
          </div>
        ) : (
          /* 警告回避のために高さを固定 */
          <div className="h-[400px] w-full" style={{ minHeight: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="pattern" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontWeight: 900, fill: '#1e293b', fontSize: 14 }}
                  tickFormatter={(val) => `PATTERN ${val}`}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} 
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <Tooltip />
                <Bar dataKey="clicks" stackId="s" barSize={60}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.pattern === 'A' ? '#3b82f6' : '#10b981'} />
                  ))}
                </Bar>
                <Bar dataKey="nonClicks" stackId="s" fill="#f1f5f9" barSize={60} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 🟢 復活させた数値データテーブル */}
      {!loading && data.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">パターン</th>
                <th className="p-6 text-right text-xs font-black text-gray-400 uppercase tracking-widest">表示</th>
                <th className="p-6 text-right text-xs font-black text-gray-400 uppercase tracking-widest">クリック</th>
                <th className="p-6 text-right text-xs font-black text-blue-600 uppercase tracking-widest text-lg">CTR (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((row) => (
                <tr key={row.pattern} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${row.pattern === 'A' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
                      <span className="font-black text-gray-900">パターン {row.pattern}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right text-gray-600 font-bold">{row.views.toLocaleString()}</td>
                  <td className="p-6 text-right text-gray-600 font-bold">{row.clicks.toLocaleString()}</td>
                  <td className="p-6 text-right">
                    <span className="font-black text-blue-600 text-2xl tracking-tighter">{row.ctr.toFixed(2)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}