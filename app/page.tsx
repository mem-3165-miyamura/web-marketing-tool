import { auth } from "@lib/auth"; 
import Link from "next/link";
import { prisma } from "@lib/prisma";
import DeletePopupButton from "@components/DeletePopupButton";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>マーケティングツール</h1>
        <p>サービスを利用するにはサインインが必要です。</p>
        <Link href="/auth/signin" style={primaryButtonStyle}>
          サインイン画面へ
        </Link>
      </div>
    );
  }

  const userId = (session.user as any).id;

  // 1. ポップアップ基本情報を取得
  const popups = await prisma.popUpConfig.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' }
  });

  // 2. TrackingLogからABテストの統計を簡易集計（一覧表示用）
  const statsLogs = await prisma.trackingLog.groupBy({
    by: ['popUpId', 'pattern', 'eventType'],
    where: {
      popUpId: { in: popups.map(p => p.id) }
    },
    _count: true
  });

  const statsMap = statsLogs.reduce((acc: any, log) => {
    if (!acc[log.popUpId]) {
      acc[log.popUpId] = { A: { view: 0, click: 0 }, B: { view: 0, click: 0 } };
    }
    const p = log.pattern as 'A' | 'B';
    const e = log.eventType as 'view' | 'click';
    acc[log.popUpId][p][e] = log._count;
    return acc;
  }, {});

  // 3. 全体統計
  const totalViews = popups.reduce((acc, curr) => acc + curr.views, 0);
  const totalClicks = popups.reduce((acc, curr) => acc + curr.clicks, 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>ダッシュボード</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>こんにちは、{session.user.name || session.user.email} さん</p>
        </div>
        <Link href="/api/auth/signout" style={secondaryButtonStyle}>
          サインアウト
        </Link>
      </header>

      {/* 全体統計カード */}
      <h3 style={{ fontSize: '16px', color: '#444', marginBottom: '15px' }}>全体パフォーマンス (Total)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '50px' }}>
        <div style={cardStyle}>
          <span style={labelStyle}>合計表示回数</span>
          <div style={valueStyle}>{totalViews.toLocaleString()}<span style={unitStyle}>回</span></div>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>合計クリック数</span>
          <div style={valueStyle}>{totalClicks.toLocaleString()}<span style={unitStyle}>回</span></div>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>平均クリック率 (CTR)</span>
          <div style={{...valueStyle, color: '#0070f3'}}>{avgCtr}<span style={unitStyle}>%</span></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px' }}>施策別レポート (ABテスト詳細)</h2>
        <Link href="/popups/new" style={primaryButtonStyle}>
          + 新規接客を作成
        </Link>
      </div>

      <div style={tableWrapperStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={thStyle}>キャンペーン名 / ID</th>
              <th style={thStyle}>ABテスト状況</th>
              <th style={thStyle}>パターンA (View/Click)</th>
              <th style={thStyle}>パターンB (View/Click)</th>
              <th style={thStyle}>作成日</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {popups.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  設定がまだありません。
                </td>
              </tr>
            ) : (
              popups.map((popup) => {
                const s = statsMap[popup.id] || { A: { view: 0, click: 0 }, B: { view: 0, click: 0 } };
                const ctrA = s.A.view > 0 ? ((s.A.click / s.A.view) * 100).toFixed(1) : "0.0";
                const ctrB = s.B.view > 0 ? ((s.B.click / s.B.view) * 100).toFixed(1) : "0.0";
                const hasB = !!popup.titleB;

                return (
                  <tr key={popup.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 'bold' }}>{popup.name}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{popup.id}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                        backgroundColor: hasB ? '#ebf8ff' : '#f7fafc',
                        color: hasB ? '#2b6cb0' : '#a0aec0'
                      }}>
                        {hasB ? 'ABテスト実施中' : '通常配信'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '12px' }}>📊 {s.A.view} / {s.A.click}</div>
                      <div style={{ fontWeight: 'bold', color: '#4a5568' }}>CTR: {ctrA}%</div>
                    </td>
                    <td style={tdStyle}>
                      {hasB ? (
                        <>
                          <div style={{ fontSize: '12px' }}>📊 {s.B.view} / {s.B.click}</div>
                          <div style={{ fontWeight: 'bold', color: Number(ctrB) > Number(ctrA) ? '#38a169' : '#4a5568' }}>
                            CTR: {ctrB}% {Number(ctrB) > Number(ctrA) ? '🏆' : ''}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: '#ccc', fontSize: '12px' }}>設定なし</div>
                      )}
                    </td>
                    <td style={tdStyle}>{new Date(popup.createdAt).toLocaleDateString('ja-JP')}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {/* 🔽 統計レポート（DuckDBページ）へのリンクを追加 */}
                        <Link 
                          href={`/admin/analytics/${popup.id}`} 
                          style={analyticsButtonStyle}
                          title="詳細レポートを表示"
                        >
                          📈 レポート
                        </Link>
                        <Link href={`/popups/${popup.id}/edit`} style={editButtonStyle}>編集</Link>
                        <DeletePopupButton popupId={popup.id} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// スタイル定義
const primaryButtonStyle = { display: 'inline-block', backgroundColor: '#0070f3', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' };
const secondaryButtonStyle = { padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: '#333', fontSize: '14px', backgroundColor: '#fff' };
const editButtonStyle = { fontSize: '13px', color: '#666', textDecoration: 'none', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' };

// 🔽 分析ボタン用の新スタイル
const analyticsButtonStyle = { 
  fontSize: '13px', 
  color: '#2b6cb0', 
  textDecoration: 'none', 
  border: '1px solid #2b6cb0', 
  backgroundColor: '#ebf8ff',
  padding: '4px 8px', 
  borderRadius: '4px',
  fontWeight: 'bold'
};

const cardStyle = { padding: '24px', border: '1px solid #eee', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const labelStyle = { fontSize: '13px', color: '#666', display: 'block', marginBottom: '10px' };
const valueStyle = { fontSize: '28px', fontWeight: 'bold' as const, display: 'flex', alignItems: 'baseline' };
const unitStyle = { fontSize: '14px', fontWeight: 'normal', color: '#999', marginLeft: '4px' };
const tableWrapperStyle = { border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const thStyle = { padding: '16px', fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase' as const };
const tdStyle = { padding: '16px', fontSize: '14px', verticalAlign: 'middle' as const };