# 推奨コマンド

## 開発コマンド
- `npm run dev`: 開発サーバー起動
- `npm run dev:turbo`: Turboモードで開発サーバー起動
- `npm run dev:inspect`: Node.jsインスペクターで開発サーバー起動
- `npm run dev:test`: テスト環境で開発サーバー起動（ポート5000）

## ビルド・デプロイ
- `npm run build`: プロダクションビルド
- `npm start`: プロダクション起動（ポート80、マイグレーション実行）

## コード品質
- `npm run lint`: ESLintによるコード解析
- `prettier --write .`: コードフォーマット
- `npx eslint "<file>" --fix`: 特定ファイルのESLint自動修正
- `npx prettier --write "<file>"`: 特定ファイルのフォーマット

## テスト
- `npm run test:j`: Jest単体テスト
- `npm run test:p`: Playwrightテスト
- `npm run test:p:ui`: PlaywrightテストUI
- `npm run test:p:debug`: Playwrightデバッグモード
- `npm run test:p:headed`: Playwrightヘッドモード

## データベース
- `npx prisma generate`: Prismaクライアント生成
- `npx prisma migrate deploy`: マイグレーション実行
- `npm run seed:test-users`: テストユーザーデータ挿入

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