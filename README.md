# フリーランスエンジニア向け勤怠管理システム

フリーランスエンジニアの勤怠管理・報告書作成を効率化する Web アプリケーションです。

## 技術スタック

### フロントエンド

- **Next.js** v16.0.1 (App Router)
- **React** v19.2.0
- **TypeScript** v5.9.3
- **TailwindCSS** v3.4.18
- **Radix UI / Material-UI** - UIコンポーネント
- **React Hook Form** + **Zod** - フォーム管理とバリデーション
- **Jotai** - 状態管理

### バックエンド

- **Prisma** v6.18.0 (ORM)
- **PostgreSQL** - データベース
- **NextAuth.js** v5 - 認証
- **Stripe** - サブスクリプション決済
- **ExcelJS** - Excel生成
- **Resend** - メール送信

### テスト・開発ツール

- **Vitest** - ユニットテスト
- **Playwright** - E2Eテスト
- **ESLint** + **Prettier** - コード品質管理
- **pnpm** - パッケージマネージャー
- **DevContainer** - 開発環境

### 外部サービス連携

- **Google OAuth 2.0** - 認証
- **Stripe API** - サブスクリプション管理
- **freee API** - 会計連携
- **OpenAI / Ollama** - AI機能

## 主な機能

### 認証・ユーザー管理

- OAuth2.0を用いたGoogle認証によるログイン
- 2要素認証対応
- パスワードリセット機能
- ユーザーロール管理（管理者/一般ユーザー）

### 契約・勤怠管理

- クライアント・契約の作成、編集、削除
- 月次勤怠表の作成、編集、削除
- 勤怠の一括入力機能
- 複数の精算方式対応（上下割、中間割、固定精算、時間単価）
- 税込・税抜設定と端数処理

### レポート・メール機能

- ExcelJSを使用した作業報告書の自動生成
- メールテンプレート管理
- mailtoスキームでのメーラー起動

### サブスクリプション機能

- Stripe統合によるサブスクリプション管理
- トライアル期間管理
- サブスクリプション状態管理

### その他

- DBへのCRUD操作を記録する監査ログ機能
- freee API連携
- 祝日管理
- AI機能（OpenAI、Ollama統合）

## セットアップ

### 前提条件

- Node.js 18以上
- pnpm
- Docker & Docker Compose（DevContainer使用時）

### DevContainerでの起動（推奨）

1. リポジトリをクローン

```bash
git clone <repository-url>
cd flow-report
```

2. VS Codeで開き、DevContainerで再度開く
   - コマンドパレット（Ctrl+Shift+P / Cmd+Shift+P）から `Dev Containers: Reopen in Container` を選択

3. 環境変数を設定

```bash
# Vercelから自動取得（推奨）
vercel env pull .env.local

# または手動で設定
cp .env.example .env.local
# .env.localを編集して必要な環境変数を設定
```

4. 依存関係のインストール

```bash
pnpm install
```

5. データベースのセットアップ

```bash
# マイグレーション実行
pnpm prisma migrate dev

# シードデータ投入（オプション）
pnpm prisma db seed
```

6. 開発サーバー起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開く

### ローカル環境での起動

DevContainerを使用しない場合は、PostgreSQLを別途用意してください。

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local
# DATABASE_URLなどを編集

# データベースのセットアップ
pnpm prisma migrate dev

# 開発サーバー起動
pnpm dev
```

## 開発ガイド

### プロジェクト構造

```
src/
  ├── app/              # Next.js App Router
  │   └── api/          # API Routes
  ├── components/       # 共通UIコンポーネント
  ├── features/         # 機能モジュール
  │   ├── auth/         # 認証機能
  │   ├── contract/     # 契約管理
  │   ├── work-report/  # 勤怠・報告書
  │   ├── subscription/ # サブスクリプション
  │   └── ...           # その他の機能
  ├── libs/             # 共通ライブラリ
  ├── hooks/            # カスタムフック
  └── utils/            # ユーティリティ関数
```

各featureモジュールは以下のサブフォルダで構成されます：

- `actions/` - Server Actions
- `components/` - UIコンポーネント
- `hooks/` - カスタムフック
- `libs/` - ビジネスロジック
- `repositories/` - データアクセス層
- `schemas/` - バリデーションスキーマ
- `types/` - 型定義
- `utils/` - ユーティリティ関数

### コーディング規約

- **TypeScript strict mode** を使用
- **関数型プログラミング原則** を採用
  - `let` の代わりに `const` を使用
  - 配列・オブジェクトは immutable に操作
  - mutable なメソッド（`push`, `splice` など）は禁止
- **ESLint** と **Prettier** による自動チェック
- **kebab-case** でファイル・ディレクトリ命名
- **camelCase** で変数・関数命名
- **UPPER_SNAKE_CASE** で定数命名

詳細は [CLAUDE.md](CLAUDE.md) を参照してください。

### テスト

```bash
# ユニットテスト（Vitest）
pnpm test
pnpm test:watch

# E2Eテスト（Playwright）
pnpm test:e2e
pnpm test:e2e:ui  # UIモード

# カバレッジ
pnpm test:coverage
```

### リント・フォーマット

```bash
# リント
pnpm lint
pnpm lint:fix

# 型チェック
pnpm type-check

# フォーマット
pnpm format
```

### ビルド

```bash
# 本番ビルド
pnpm build

# ビルドサイズ分析
pnpm analyze
```

## デプロイ

このプロジェクトは **Vercel** にデプロイされています。

```bash
# Vercel CLIでデプロイ
vercel

# 本番環境へデプロイ
vercel --prod
```

環境変数は Vercel のダッシュボードで設定するか、`vercel env pull` で取得できます。

## アピールポイント

- 最新の技術スタック（TypeScript、React v19、Next.js v16 App Router、Prisma、PostgreSQL）を採用
- DevContainerを活用した一貫した開発環境により、チーム全体での生産性が向上
- 関数型プログラミング原則に基づいた保守性の高いコードベース
- VitestとPlaywrightによる包括的なテスト体制
- Vercelによる高速なCI/CDパイプライン
