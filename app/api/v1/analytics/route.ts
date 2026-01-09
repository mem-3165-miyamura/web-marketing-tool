//app/api/v1/analytics/route.ts
import { NextResponse } from 'next/server';
import duckdb from 'duckdb';

const db = new duckdb.Database(':memory:');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const popUpId = searchParams.get('popUpId');

  if (!popUpId) {
    return NextResponse.json({ error: 'popUpId is required' }, { status: 400 });
  }

  // 接続設定（archiveと同じもの）
  const s3Endpoint = (process.env.MINIO_ENDPOINT || 'localhost:9000').replace('http://', '');
  const s3AccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
  const s3SecretKey = process.env.MINIO_SECRET_KEY || 'miniopassword';

  return new Promise((resolve) => {
    db.serialize(() => {
      db.run("INSTALL httpfs; LOAD httpfs;");
      db.run(`SET s3_endpoint='${s3Endpoint}';`);
      db.run(`SET s3_access_key_id='${s3AccessKey}';`);
      db.run(`SET s3_secret_access_key='${s3SecretKey}';`);
      db.run(`SET s3_use_ssl=false;`);
      db.run(`SET s3_url_style='path';`);

      // ABテストの集計クエリ
      // 指定したpopUpIdのParquetファイルを読み取って、パターンごとの表示・クリック・CTRを算出
      const query = `
        SELECT 
          pattern, 
          count(*) FILTER (WHERE eventType = 'view') as views,
          count(*) FILTER (WHERE eventType = 'click') as clicks,
          round(count(*) FILTER (WHERE eventType = 'click')::float / 
                NULLIF(count(*) FILTER (WHERE eventType = 'view'), 0)::float * 100, 2) as ctr
        FROM read_parquet('s3://tracking-logs/*.parquet')
        WHERE popUpId = '${popUpId}'
        GROUP BY pattern
        ORDER BY pattern;
      `;

      db.all(query, (err, rows) => {
        if (err) {
          console.error("DuckDB Query Error:", err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ data: rows }));
        }
      });
    });
  });
}