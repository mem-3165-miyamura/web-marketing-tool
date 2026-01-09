# A/B Test Analytics System

PostgreSQL（リアルタイム）と S3/MinIO（アーカイブ）を組み合わせた、高速で堅牢なポップアップ分析システム。

## 🚀 システム概要

データの鮮度とスケーラビリティを両立させる「ハイブリッド・データレイク・アーキテクチャ」を採用。

- **リアルタイム解析**: 直近のログは PostgreSQL で管理し、管理画面に即座に反映。
- **長期保存・高速集計**: 過去のログは Parquet 形式で S3 (MinIO) へ保存。DuckDB を使用してこれらを高速に統合集計します。

## ⚙️ アーカイブバッチ (Daily Batch Processing)

データの肥大化を防ぎ、パフォーマンスを維持するための自動リカバリ型バッチ処理。
毎日深夜（午前2時）に `api/v1/analytics/archive` を実行します。

1. **キャッチアップ (救出)**: S3 にファイルがない過去日を自動検知し、DBから救出して Parquet 化。
2. **7日間保持ポリシー**: 直近7日間は PostgreSQL に残し、分析の高速化とバックアップを兼ねる。
3. **安全なパージ**: S3 への保存完了を確認できた 8日以上前のデータのみ DB から削除。

## 🛠️ セットアップ

### 1. 依存関係のインストール

```bash
git clone https://github.com/mem-3165-miyamura/web-marketing-tool.git
cd web-marketing-tool
npm install