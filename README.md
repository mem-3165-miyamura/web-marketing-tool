# 🚀 Web Marketing Automation Tool (MA)

ユーザーの行動をリアルタイムで追跡し、特定の条件を満たした訪問者を自動的に顧客（CUSTOMER）へ昇格させ、パーソナライズされたメールを即時配信するマーケティングオートメーション（MA）ツールです。

## 🌟 主な機能

- **リアルタイム・トラッキング**: 訪問者のページ閲覧（page_view）や特定のアクションを記録。
- **自動ステータス判定（Status Promotion）**: 蓄積された行動ログに基づき、訪問者のランク（LEAD / PROSPECT / CUSTOMER / CHURNED）を自動更新。
- **自動メール配信（MA実行）**: ステータス更新や特定イベントをトリガーに、設定済みのメールを即時送信。
- **分析アーカイブバッチ**: ログデータを定期的に集計用データベース（DuckDB）へ移行し、高速な分析を可能にします。
- **管理画面**: メール配信設定の作成・編集、ユーザーセッション管理、分析統計の可視化。
- **開発用メールテスト環境**: MailHogと連携し、送信されたメールをブラウザ上で確認可能。

## 🛠 技術スタック

- **Frontend/Backend**: Next.js 15+ (App Router / Turbopack)
- **Database**: PostgreSQL (Prisma ORM) / DuckDB (Analytics)
- **Storage**: MinIO / S3 (Pop-up Assets & Tracking Logs)
- **Authentication**: Auth.js (NextAuth) v4/v5
- **Mail Handling**: Nodemailer + MailHog (Development)
- **Styling**: Tailwind CSS 4 + Lucide React

## 🚀 セットアップ

### 1. 環境変数の設定
`.env` ファイルを作成し、以下の項目を設定してください。
※ 開発環境では、他のサービス（ECサイト等）との衝突を避けるため **Port 3001** をデフォルトとしています。

DATABASE_URL="postgresql://admin:password@localhost:5432/marketing_tool?schema=public"
NEXTAUTH_SECRET="your-secret"
CRON_SECRET="your-secure-cron-secret"
NEXT_PUBLIC_APP_URL="http://127.0.0.1:3001"
PORT=3001

### 2. インフラ（Docker）の起動
docker-compose up -d
（PostgreSQL, MinIO, MailHog が起動します）

### 3. データベースの準備
npm install
npx prisma db push

### 4. 開発サーバーの起動
npm run dev
- 本体/管理画面: http://localhost:3001
- MailHog: http://localhost:8025

## 📊 テスト・運用

### トラッキングAPIのテスト
ブラウザのコンソールから以下のスクリプトを実行してテストできます。

fetch('/api/v1/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: "YOUR_ADMIN_USER_ID",
    vid: "device_test_001",
    email: "visitor@example.com",
    event: "page_view",
    pageUrl: "/pricing"
  })
})
.then(res => res.json())
.then(data => console.log("🚀 MA結果:", data));

### 定期バッチ（アーカイブ）
node-cron により、サーバー起動時および毎日午前2時にアーカイブ処理が実行されます。
実行時、現在のポート（3001等）を自動検知して自分自身のAPIを呼び出します。

## 📂 ディレクトリ構成

- /app/admin: 管理画面（メール設定、統計など）
- /app/api/v1/track: トラッキング & MAエンジン本体
- /app/api/v1/analytics: アーカイブ・分析用API
- /lib: 共通ライブラリ（DB接続、認証、Cron設定）
- /prisma: データベーススキーマ定義