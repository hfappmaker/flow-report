# 推奨コマンド

## 開発コマンド
- `pnpm run dev`: 開発サーバー起動
- `pnpm run dev:turbo`: Turboモードで開発サーバー起動
- `pnpm run dev:inspect`: Node.jsインスペクターで開発サーバー起動

## ビルド・デプロイ
- `pnpm run build`: プロダクションビルド

## コード品質
- `pnpm exec tsc --noEmit`: 型チェック
- `pnpm exec prettier --write .`: コードフォーマット
- `pnpm exec prettier --write "<file>"`: 特定ファイルのフォーマット

**注意**: ESLint (`pnpm run lint`, `pnpm exec eslint`) は直接実行しない（CLAUDE.mdで禁止）

## テスト
- `pnpm run test`: Vitestウォッチモード
- `pnpm run test:run`: Vitest単発実行
- `pnpm run test:ui`: Vitest UI
- `pnpm run test:coverage`: カバレッジレポート生成
- `pnpm run test:p`: Playwrightテスト
- `pnpm run test:p:ui`: PlaywrightテストUI
- `pnpm run test:p:debug`: Playwrightデバッグモード
- `pnpm run test:p:headed`: Playwrightヘッドモード

## データベース
- `pnpm exec prisma generate`: Prismaクライアント生成
- `pnpm exec prisma migrate deploy`: マイグレーション実行

## Git Worktree
- `pnpm run worktree:init`: Git worktree初期化
- `pnpm run worktree:list`: Git worktree一覧
- `pnpm run worktree:remove`: Git worktree削除

## 分析
- `pnpm run analyze`: バンドル分析

## Claude Codeカスタムコマンド
- `/commit-push`: Prettier自動フォーマット→コミット→プッシュの一括実行
- `/create-pr`: `/commit-push`を実行後、PRを作成
- `/refactor`: リファクタリング支援
- `/sync-serena-memories`: Serenaメモリーをコードベースと同期
