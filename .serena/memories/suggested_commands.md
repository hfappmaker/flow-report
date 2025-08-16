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

## 基本コマンド（Linux）
- `ls`: ファイル一覧
- `cd`: ディレクトリ移動
- `grep`: テキスト検索
- `find`: ファイル検索
- `git`: バージョン管理