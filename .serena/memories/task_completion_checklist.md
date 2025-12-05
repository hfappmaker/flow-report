# タスク完了時のチェックリスト

## 必須実行コマンド
1. **型チェック**: `pnpm exec tsc --noEmit`
2. **テスト**: `pnpm run test:run` (適用可能な場合)
3. **フォーマット**: `pnpm exec prettier --write .`

**注意**: ESLint (`pnpm run lint`) は直接実行しない

## コード品質チェック
- TypeScript厳格モードに準拠
- 型エラーが0件
- テストが通過
- セキュリティベストプラクティスに準拠

## コーディング規約チェック
- **undefined使用をnullに統一**
  - Zodスキーマで `nullable()` を使用
  - フォームフィールドの初期値・空値は `null`
- **テンプレートリテラルの数値は `String()` で変換**
  - 例: `` `${String(value)}` ``
- **Promise処理で `void` 演算子を適切に使用**
  - イベントハンドラでの警告回避
- react-hook-formの `Resolver` 型を明示的に使用

## Git操作
- 適切なコミットメッセージ（Conventional Commits形式）
- コミット前のlint/test実行
- 機密情報の非コミット
- `/commit-push` コマンドで自動フォーマット・コミット可能

## 注意事項
- Claude Codeを使用する場合は必ずlint/typecheckを実行
- 既存のコードスタイルとパターンを維持
- フォルダ構造に従って新しいファイルを作成
- 新しいファイル作成より既存ファイル編集を優先
- ESLint warningも0件にする（エラーだけでなく）
