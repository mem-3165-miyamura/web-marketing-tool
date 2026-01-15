# 🚀 Marketing Automation Tool (Core & Admin)

このリポジトリは、ポップアップ配信、ユーザー行動トラッキング、およびステータス連動型メール配信を管理するマーケティングツールのコアシステムです。

## 🛠 主な機能
- **施策管理ダッシュボード**: ポップアップの作成・編集・ABテストの設定。
- **リアルタイム解析**: インプレッション(view)、クリック数(click)、CTRの自動集計。
- **名寄せ (Identify)**: 匿名ユーザーとメールアドレスを紐付け、一貫した行動履歴を管理。
- **ステータス判定エンジン**: ユーザーの行動ログから「LEAD」「HOT」などのランクを自動判定。
- **シナリオメール配信**: ステータス更新や特定イベントをトリガーとした自動メール送信。

## 📦 技術スタック
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL / Prisma ORM
- **Auth**: Auth.js (NextAuth) - ※localhostでのCSRF保護対応済み
- **Mail**: Nodemailer (MailHog等のSMTPサーバーに対応)
- **UI**: Tailwind CSS / Lucide React

## 🚀 導入・起動手順
1. 環境変数の準備: .env ファイルを作成し、NEXTAUTH_URL を http://localhost:3001 に設定してください。
2. 依存関係のインストール: npm install
3. データベースの同期: npx prisma migrate dev
4. 開発サーバーの起動: npm run dev (Port: 3001)

## 📡 主要エンドポイント
- GET /api/v1/snippet: ECサイトに埋め込むためのJavaScriptスニペットを配信。
- GET /api/v1/popups/[userId]: 配信対象のポップアップ設定を返却。
- POST /api/v1/track: 表示・クリック・ページビュー等のログを収集。