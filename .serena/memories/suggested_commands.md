# 推奨コマンド

## 開発コマンド
- `pnpm run dev`: 開発サーバー起動
- `pnpm run dev:turbo`: Turboモードで開発サーバー起動
- `pnpm run dev:inspect`: Node.jsインスペクターで開発サーバー起動

## ビルド・デプロイ
- `pnpm run build`: プロダクションビルド
- `pnpm start`: プロダクション起動（ポート80、マイグレーション実行）

## コード品質
- `pnpm run lint`: ESLintによるコード解析
- `pnpm exec prettier --write .`: コードフォーマット
- `pnpm exec eslint "<file>" --fix`: 特定ファイルのESLint自動修正
- `pnpm exec prettier --write "<file>"`: 特定ファイルのフォーマット

## テスト
- `pnpm run test:j`: Jest単体テスト
- `pnpm run test:p`: Playwrightテスト
- `pnpm run test:p:ui`: PlaywrightテストUI
- `pnpm run test:p:debug`: Playwrightデバッグモード
- `pnpm run test:p:headed`: Playwrightヘッドモード

## データベース
- `pnpm exec prisma generate`: Prismaクライアント生成
- `pnpm exec prisma migrate deploy`: マイグレーション実行
- `pnpm run seed:test-users`: テストユーザーデータ挿入

## Claude Codeカスタムコマンド
- `/commit-push`: ESLint/Prettier自動フォーマット→警告修正→コミット→プッシュの一括実行
  - Staging済みファイルに対して実行
  - 警告が見つかった場合は修正案を提示
  - コミットメッセージを自動生成
  - リモートリポジトリへ自動プッシュ

## 基本コマンド（Linux）
- `ls`: ファイル一覧
- `cd`: ディレクトリ移動
- `grep`: テキスト検索
- `find`: ファイル検索
- `git`: バージョン管理