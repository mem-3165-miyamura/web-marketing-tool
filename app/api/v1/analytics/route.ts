import { NextResponse } from 'next/server';
import duckdb from 'duckdb';

const db = new duckdb.Database(':memory:');

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const popUpId = searchParams.get('popUpId');

  if (!popUpId) {
    return NextResponse.json({ error: 'popUpId is required' }, { status: 400 });
  }

  // Docker環境に合わせてホスト名を解決
  const s3Endpoint = (process.env.MINIO_ENDPOINT || 'localhost:9000').replace('http://', '');
  const s3AccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
  const s3SecretKey = process.env.MINIO_SECRET_KEY || 'miniopassword';

  return new Promise<NextResponse>((resolve) => {
    db.serialize(() => {
      // DuckDBのS3接続設定
      db.run("INSTALL httpfs; LOAD httpfs;");
      db.run(`SET s3_endpoint='${s3Endpoint}';`);
      db.run(`SET s3_access_key_id='${s3AccessKey}';`);
      db.run(`SET s3_secret_access_key='${s3SecretKey}';`);
      db.run(`SET s3_use_ssl=false;`);
      db.run(`SET s3_url_style='path';`);

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
          // エラー時もフロントエンドが落ちないよう summary を空で返すか、エラーを明示
          resolve(NextResponse.json({ error: err.message, summary: [] }, { status: 500 }));
        } else {
          // 修正ポイント：フロントエンドが期待する 'summary' キーで返す
          resolve(NextResponse.json({ summary: rows }));
        }
      });
    });
  });
}