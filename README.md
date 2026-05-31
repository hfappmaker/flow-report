# flow-report

フリーランスエンジニア向けの勤怠管理・作業報告書作成 Web アプリケーションです。契約、月次の勤怠、作業報告書、メールテンプレート、サブスクリプション、freee 連携をまとめて管理できます。

## 技術スタック

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS / Radix UI / Material UI
- Prisma / PostgreSQL
- NextAuth.js v5 / Google OAuth / 2要素認証
- Stripe / Resend / freee API
- OpenAI / Ollama
- Vitest / Playwright / ESLint / Prettier
- pnpm / DevContainer

## 主な機能

- Google OAuth とメールアドレス認証によるログイン、2要素認証、パスワードリセット
- クライアント、契約、月次勤怠、作業報告書の管理
- 複数の精算方式、税込・税抜、端数処理への対応
- 作業報告書の Excel 出力
- メールテンプレート管理と mailto 起動
- Stripe によるサブスクリプション管理
- freee OAuth 連携、取引先取得、請求書作成
- OpenAI / Ollama を使った勤怠入力支援
- Prisma 拡張による監査ログ記録
- 祝日管理、レート制限、Bot 対策

## セットアップ

### 前提条件

- Node.js 22 推奨
- pnpm
- Docker と Docker Compose（DevContainer を使う場合）
- PostgreSQL（DevContainer 外で起動する場合）

### DevContainer で起動する

1. リポジトリをクローンします。

```bash
git clone <repository-url>
cd flow-report
```

2. VS Code で開き、`Dev Containers: Reopen in Container` を実行します。

3. 環境変数を用意します。

```bash
# Vercel から development 環境の変数を取得する場合
vercel login
vercel link
vercel env pull .env.development.local --environment=development

# 手動で用意する場合
cp .env.example .env.development.local
```

必要に応じて `.env` や `.env.local` もローカル実行環境に合わせて設定してください。DevContainer は `.env` を読み込みます。

4. 依存関係をインストールします。

```bash
pnpm install
```

5. データベースをセットアップします。

```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

6. 開発サーバーを起動します。

```bash
pnpm dev
```

http://localhost:3000 を開きます。

### ローカルで起動する

DevContainer を使わない場合は PostgreSQL を別途用意し、`DATABASE_URL` と `PRISMA_DATABASE_URL` を設定してください。

```bash
pnpm install
cp .env.example .env.local
pnpm prisma migrate dev
pnpm dev
```

## よく使うコマンド

```bash
# 開発サーバー
pnpm dev
pnpm dev:turbo

# Prisma
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma studio

# テスト
pnpm test
pnpm test:run
pnpm test:coverage
pnpm test:p
pnpm test:p:ui

# 静的チェック
pnpm exec eslint .
pnpm exec tsc --noEmit
pnpm exec prettier --check .

# ビルド
pnpm build
pnpm analyze
```

## プロジェクト構成

```text
src/
  app/          Next.js App Router と API Routes
  components/   共通 UI コンポーネント
  contexts/     React Context
  features/     機能単位のモジュール
  hooks/        共通 hooks
  libs/         共通ライブラリ
  repositories/ 共通データアクセス層
  types/        共通型定義
  utils/        共通ユーティリティ
```

主な feature は以下です。

- `auth` - 認証、2要素認証、パスワードリセット
- `contract` - 契約管理
- `work-report` - 勤怠、作業報告書、Excel 出力
- `email` - メールテンプレート
- `subscription` - Stripe サブスクリプション
- `freee` - freee OAuth、取引先取得、請求書作成
- `ai` - OpenAI / Ollama 連携
- `admin` - 管理者向け処理
- `user-info` - ユーザー情報
- `holidays` - 祝日管理

各 feature は必要に応じて `actions/`, `components/`, `hooks/`, `libs/`, `repositories/`, `schemas/`, `types/`, `utils/` などを持ちます。

## 開発ルール

- TypeScript strict mode を前提にします。
- データベースアクセスは repository 層に集約し、Server Actions から直接 Prisma を呼びません。
- repository 関数は例外を投げず、`Result<T>` を返します。
- フォームは `react-hook-form` と Zod schema を組み合わせます。
- ファイルとディレクトリは kebab-case、変数と関数は camelCase、定数は UPPER_SNAKE_CASE を使います。
- 詳細なルールは [CLAUDE.md](CLAUDE.md) を参照してください。

## デプロイ

Vercel へのデプロイを前提にしています。

```bash
vercel
vercel --prod
```

環境変数は Vercel のダッシュボードで設定するか、`vercel env pull` で取得します。

## Worktree 補助スクリプト

複数ブランチを並行して扱うための git worktree 管理スクリプトがあります。

```bash
pnpm run worktree:init <branch-name> [base-branch]
pnpm run worktree:list
pnpm run worktree:remove <worktree-path-or-branch-name>
```

詳しくは [scripts/README.md](scripts/README.md) を参照してください。
