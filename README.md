# 🚀 Web Marketing Automation Tool (MA)

ユーザーの行動をリアルタイムで追跡し、特定の条件を満たした訪問者を自動的に顧客（CUSTOMER）へ昇格させ、パーソナライズされたメールを即時配信するマーケティングオートメーション（MA）ツールです。

## 🌟 主な機能

- **リアルタイム・トラッキング**: 訪問者のページ閲覧（page_view）や特定のアクションを記録。
- **自動ステータス判定（Status Promotion）**: 蓄積された行動ログに基づき、訪問者のランク（LEAD / PROSPECT / CUSTOMER / CHURNED）を自動更新。
- **自動メール配信（MA実行）**: ステータス更新や特定イベントをトリガーに、設定済みのメールを即時送信。
- **管理画面**: メール配信設定の作成・編集、ユーザーセッション管理、認証機能（Auth.js）。
- **開発用メールテスト環境**: MailHogと連携し、送信されたメールをブラウザ上で確認可能。

## 🛠 技術スタック

- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: Auth.js (NextAuth) v5
- **Mail Handling**: Nodemailer + MailHog (Development)
- **Styling**: Tailwind CSS + Lucide React

## 🚀 セットアップ

### 1. 環境変数の設定
.env ファイルを作成し、以下の項目を設定してください。
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

### 2. データベースの準備
npm install
npx prisma db push

### 3. 管理者ユーザーの作成
- hash_generator.js を実行してパスワードをハッシュ化。
- Prisma Studio を起動し、User テーブルにレコードを追加。
- hashedPassword カラムに生成したハッシュを貼り付け。
- ログイン後、MailConfig を作成（targetStatus: CUSTOMER, triggerEvent: page_view 等）。

### 4. 開発サーバーの起動
npm run dev で本体を起動。
MailHog を起動すると、http://localhost:8025 でメール受信を確認できます。

## 📈 MAエンジンのテスト方法

ブラウザのコンソールから以下のスクリプトを実行してテストできます。
（YOUR_ADMIN_USER_ID は自分のIDに書き換えてください）

fetch('/api/v1/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: "YOUR_ADMIN_USER_ID",
    vid: "device_test_001",
    email: "visitor@example.com",
    event: "page_view",
    pageUrl: "/pricing",
    popUpId: "system_identify"
  })
})
.then(res => res.json())
.then(data => console.log("🚀 MA結果:", data));

## 📂 ディレクトリ構成

- /app/admin: 管理画面（メール設定、統計など）
- /app/api/v1/track: トラッキング & MAエンジン本体
- /lib: 共通ライブラリ（DB接続、認証、判定ロジック）
- /prisma: データベーススキーマ定義