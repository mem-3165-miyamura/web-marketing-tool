# Web Marketing Tool

Next.js と Prisma を利用した、軽量な Web 接客・計測ツールです。
特定のサイトにスニペットを貼るだけで、ポップアップ表示と表示数・クリック数の計測、さらに AB テストが可能です。

## 🚀 現在の進捗（実装済み機能）

- **ダッシュボード**: 登録済みポップアップの一覧表示と全体統計（View/Click/CTR）の確認。
- **AB テスト機能**:
  - 1 つの接客設定内で「パターン A」と「パターン B」を作成可能。
  - 訪問者 ID（Visitor ID）に基づいて、一貫した振り分け（A/B 固定表示）を実行。
  - パターン別の詳細なパフォーマンス計測。
- **トラッキングログ**: `TrackingLog` テーブルによる詳細な行動ログ記録（本格派集計ロジック）。
- **外部サイト連携**: 外部 HTML に専用 JavaScript スニペットを貼るだけでポップアップが動作。
- **画像管理**: MinIO（S3 互換ストレージ）を利用したポップアップ用画像のアップロード機能。

## 🛠 技術スタック

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js (Auth.js)
- **Storage**: MinIO (Object Storage)
- **Styling**: Inline CSS (Customizable)

## 📦 セットアップ

### 1. リポジトリのクローン
```bash
git clone [https://github.com/mem-3165-miyamura/web-marketing-tool.git](https://github.com/mem-3165-miyamura/web-marketing-tool.git)
cd web-marketing-tool