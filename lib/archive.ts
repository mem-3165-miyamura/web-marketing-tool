import duckdb from 'duckdb';
const db = new duckdb.Database(':memory:'); // メモリ上で高速実行

export const exportToParquet = async () => {
  // PostgreSQLの接続情報（環境変数から取得）
  const pgConn = `dbname=${process.env.DB_NAME} user=${process.env.DB_USER} password=${process.env.DB_PASS} host=${process.env.DB_HOST}`;

  return new Promise((resolve, reject) => {
    // 1. PostgreSQL拡張機能をロード
    db.run("INSTALL postgres; LOAD postgres;");

    // 2. PostgreSQLから直接データを読み込み、Parquetファイルとして保存する
    // ここでは直近8日より古いものをアーカイブする想定
    const query = `
      COPY (
        SELECT * FROM postgres_scan('${pgConn}', 'public', 'TrackingLog')
        WHERE "createdAt" < now() - INTERVAL '7 days'
      ) TO 'data/archive/logs_backup.parquet' (FORMAT 'PARQUET', COMPRESSION 'ZSTD');
    `;

    db.run(query, (err) => {
      if (err) reject(err);
      else resolve("Parquet作成成功！");
    });
  });
};