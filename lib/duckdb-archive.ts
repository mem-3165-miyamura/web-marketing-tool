import duckdb from 'duckdb';

const db = new duckdb.Database(':memory:');

export interface ArchiveResult {
  success: boolean;
  message: string;
  path: string;
  timestamp: string;
}

export const archivePostgresToParquet = async (): Promise<ArchiveResult> => {
  const host = process.env.DATABASE_HOST || 'localhost';
  const user = process.env.DATABASE_USER || 'admin';
  const password = process.env.DATABASE_PASSWORD || 'password';
  const dbname = process.env.DATABASE_NAME || 'marketing_tool';
  const port = process.env.DATABASE_PORT || '5432';

  const s3Endpoint = (process.env.MINIO_ENDPOINT || 'localhost:9000').replace('http://', '');
  const s3AccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
  const s3SecretKey = process.env.MINIO_SECRET_KEY || 'miniopassword';
  const bucketName = 'tracking-logs';

  const pgConn = `host=${host} user=${user} password=${password} dbname=${dbname} port=${port}`;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  
  // 修正箇所: 階層を深くせず、バケット直下に保存するように変更
  const s3OutputPath = `s3://${bucketName}/${dateStr}.parquet`;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("INSTALL postgres; LOAD postgres;");
      db.run("INSTALL httpfs; LOAD httpfs;");

      db.run(`SET s3_endpoint='${s3Endpoint}';`);
      db.run(`SET s3_access_key_id='${s3AccessKey}';`);
      db.run(`SET s3_secret_access_key='${s3SecretKey}';`);
      db.run(`SET s3_use_ssl=false;`);
      db.run(`SET s3_url_style='path';`);
      // 念のためタイムアウトを伸ばす
      db.run(`SET s3_timeout=30000;`); 

      db.run(`ATTACH '${pgConn}' AS pg (TYPE POSTGRES);`);

      const sql = `
        COPY (
          SELECT * FROM pg.TrackingLog 
          WHERE "createdAt" >= CURRENT_DATE - INTERVAL '1 day'
            AND "createdAt" < CURRENT_DATE
        ) TO '${s3OutputPath}' (FORMAT 'PARQUET');
      `;

      console.log(`[DuckDB] アーカイブ開始: ${s3OutputPath}`);

      db.run(sql, (err) => {
        if (err) {
          console.error("[DuckDB] アーカイブ失敗:", err);
          reject(err);
        } else {
          console.log(`[DuckDB] アーカイブ成功: ${s3OutputPath}`);
          resolve({
            success: true,
            message: "MinIOへの転送が完了しました",
            path: s3OutputPath,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  });
};