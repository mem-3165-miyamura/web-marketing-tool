export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import duckdb from 'duckdb';
import { prisma } from "@lib/prisma"; // Prismaをインポート

const db = new duckdb.Database(':memory:');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const popUpId = searchParams.get('popUpId');
  const period = searchParams.get('period') || 'today';

  if (!popUpId || popUpId === 'your-popup-id-here') {
    return NextResponse.json({ summary: [] });
  }

  // --- 1. 「今日」の場合は PostgreSQL からリアルタイム取得 ---
  if (period === 'today') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const logs = await prisma.trackingLog.groupBy({
        by: ['pattern', 'eventType'],
        where: {
          popUpId: popUpId,
          createdAt: { gte: today }
        },
        _count: true
      });

      // PostgreSQLの結果をDuckDBと同じ型に変換
      const patterns = ['A', 'B'];
      const summary = patterns.map(p => {
        const views = logs.find(l => l.pattern === p && l.eventType === 'view')?._count || 0;
        const clicks = logs.find(l => l.pattern === p && l.eventType === 'click')?._count || 0;
        const ctr = views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0;
        return { pattern: p, views, clicks, ctr };
      });

      return NextResponse.json({ summary });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // --- 2. 「昨日以降」の場合は DuckDB (S3) から高速取得 ---
  let dateFilter = "";
  if (period === 'yesterday') {
    dateFilter = `AND "createdAt" >= CURRENT_DATE - INTERVAL '1 day' AND "createdAt" < CURRENT_DATE`;
  } else if (period === 'week') {
    dateFilter = `AND "createdAt" >= CURRENT_DATE - INTERVAL '7 days'`;
  } else if (period === 'month') {
    dateFilter = `AND "createdAt" >= CURRENT_DATE - INTERVAL '30 days'`;
  } else if (period === 'all') {
    dateFilter = "";
  }

  const s3Endpoint = (process.env.MINIO_ENDPOINT || 'localhost:9000').replace('http://', '');
  const s3AccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
  const s3SecretKey = process.env.MINIO_SECRET_KEY || 'miniopassword';

  return new Promise((resolve) => {
    db.serialize(() => {
      db.run("INSTALL httpfs; LOAD httpfs;");
      db.run(`SET s3_endpoint='${s3Endpoint}'; SET s3_use_ssl=false; SET s3_url_style='path';`);
      db.run(`SET s3_access_key_id='${s3AccessKey}'; SET s3_secret_access_key='${s3SecretKey}';`);

      const query = `
        SELECT 
          pattern, 
          CAST(COUNT(*) FILTER (WHERE "eventType" = 'view') AS INTEGER) as views,
          CAST(COUNT(*) FILTER (WHERE "eventType" = 'click') AS INTEGER) as clicks,
          CAST(ROUND(
            (COUNT(*) FILTER (WHERE "eventType" = 'click')::FLOAT / 
             NULLIF(COUNT(*) FILTER (WHERE "eventType" = 'view'), 0)::FLOAT) * 100, 
            2
          ) AS DECIMAL(10,2))::DOUBLE as ctr
        FROM read_parquet('s3://tracking-logs/*.parquet')
        WHERE "popUpId" = '${popUpId}' ${dateFilter}
        GROUP BY pattern
        ORDER BY pattern ASC;
      `;

      db.all(query, (err, rows) => {
        if (err) resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        else resolve(NextResponse.json({ summary: rows }));
      });
    });
  });
}