A/B Test Analytics System
PostgreSQL（リアルタイム）と S3/MinIO（アーカイブ）を組み合わせた、高速で堅牢なポップアップ分析システム。

🚀 システム概要
このシステムは、データの鮮度とスケーラビリティを両立させるために 「ハイブリッド・データレイク・アーキテクチャ」 を採用しています。

リアルタイム解析: 直近のログは PostgreSQL で管理し、即座に反映。

長期保存・高速集計: 過去のログは Parquet 形式に変換して S3 (MinIO) へ保存。DuckDB を使用してこれらを高速に統合集計します。

🏗️ 技術スタック
Frontend: Next.js (App Router), Tailwind CSS, Recharts

Database: PostgreSQL (via Prisma)

Storage: MinIO (S3 Compatible Storage)

Analytics Engine: DuckDB (via duckdb-wasm / node-duckdb)

Data Format: Apache Parquet

📊 分析画面の仕様
100%固定積み上げグラフ:

表示数（Views）に対するクリック（Clicks）の割合を視覚化。

パターンのパフォーマンス差を直感的に比較可能。

期間フィルタリング:

今日（リアルタイム）、昨日、1週間、1ヶ月、全期間に対応。

PostgreSQL と S3 のデータを UNION ALL で統合し、最新のデータを含めた分析を表示。

⚙️ アーカイブバッチ (Daily Batch Processing)
データの肥大化を防ぎ、パフォーマンスを維持するための自動バッチ処理。

アルゴリズム: 「追いかけ型スライディング・ウィンドウ」
毎日深夜（午前2時）に api/v1/analytics/archive を実行します。

キャッチアップ (救出):

S3 にファイルが存在しない過去の日付を自動検知し、PostgreSQL からデータを抽出して Parquet 化して保存。

サーバー（PC）が停止していた期間があっても、次回起動時にすべて自動リカバリされます。

7日間保持ポリシー:

直近7日間のデータは PostgreSQL に残し、分析の高速化とバックアップを兼ねます。

安全なパージ:

S3 への保存が完了していることを確認できた 8日以上前のデータのみを PostgreSQL から削除します。

📂 構成ファイル
app/api/v1/analytics/ab-test/route.ts: DuckDB を使用したハイブリッド集計 API。

app/api/v1/analytics/archive/route.ts: 自動リカバリ機能付きアーカイブバッチ。

components/analytics/ABTestChart.tsx: 100%積み上げ型グラフコンポーネント。

🛠️ セットアップ
```bash
# 依存関係のインストール
npm install

# 環境変数の設定 (.env)
DATABASE_URL="postgresql://..."
MINIO_ENDPOINT="http://localhost:9000"
CRON_SECRET="your_secure_secret"
```

# データベースマイグレーション
npx prisma migrate dev
次のステップ
この README で、チームや将来の自分が「なぜこの設計にしたのか」を一目で理解できるようになります。

コミットメッセージは feat: implement robust daily batch archive with catch-up logic and 100% stacked chart などがいかがでしょうか？

準備ができたら、次は**「バッチが成功したか失敗したかを一目で確認できるダッシュボード上のステータスパネル」**の実装に進みますか？