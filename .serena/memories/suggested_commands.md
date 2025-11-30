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
- `pnpm run seed:test-users`: テストユーザーデータ挿入

## Claude Codeカスタムコマンド
- `/commit-push`: ESLint/Prettier自動フォーマット→警告修正→コミット→プッシュの一括実行
