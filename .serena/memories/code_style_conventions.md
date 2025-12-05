# コードスタイルと規約

## 命名規則
- ディレクトリ/ファイル名: kebab-case (例: `user-info/`, `user-profile.tsx`)
- 定数: UPPER_SNAKE_CASE
- 変数/関数: camelCase
- 短く、直感的で、説明的な名前（S-I-D原則）

## TypeScript規則
- 厳格モード使用
- `any`型の使用を避ける（ライブラリで不可避な場合はコメントで説明）
- 型アサーション（`as`）を避ける
- Props型を明示的に定義
- 関数コンポーネントを優先

## オプショナル値の扱い
- **`undefined` ではなく `null` を使用**
- Zodスキーマでは `optional()` ではなく `nullable()` を使用
- react-hook-formなどのフォームフィールド値も `null` で統一
- 例: `z.string().nullable()`, `z.date().nullable()`
- データベース型とフォーム型の一貫性を保つため

## テンプレートリテラルでの型安全性
- 数値を使用する場合は `String()` で明示的に変換
- 例: `` `${String(month + 1)}月${String(day)}日` ``
- ESLint警告 `@typescript-eslint/restrict-template-expressions` を回避

## Promise処理のベストプラクティス
- イベントハンドラでPromise返却関数を使う場合は `void` 演算子を使用
- 例: `onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}`
- react-hook-formは内部で `preventDefault()` を処理するため不要
- ESLint警告 `@typescript-eslint/no-misused-promises` を回避

## react-hook-formの型定義
- `Resolver` 型を明示的にインポートして使用
- 例: `import { useForm, Resolver } from "react-hook-form"`
- 型キャスト: `resolver: zodResolver(schema) as Resolver<FormValues>`

## フォルダ構造
```
src/
  ├── app/              // ルーティング
  │   ├── api/          // API定義
  ├── assets/           // 静的ファイル
  ├── components/       // 汎用コンポーネント
  ├── config/           // グローバル設定
  ├── features/         // 機能モジュール
  │   ├── actions/      // Server Actions
  │   ├── assets/       // 機能固有の静的ファイル
  │   ├── components/   // 機能固有のコンポーネント
  │   ├── hooks/        // 機能固有のフック
  │   ├── libs/         // 機能固有のライブラリ
  │   ├── repositories/ // 機能固有のリポジトリ
  │   ├── schemas/      // Zodスキーマ
  │   ├── stores/       // 状態管理
  │   ├── testing/      // テストユーティリティ
  │   ├── types/        // 機能固有の型定義
  │   └── utils/        // 機能固有のユーティリティ
  ├── hooks/            // 汎用フック
  ├── libs/             // 汎用ライブラリ
  ├── repositories/     // 汎用リポジトリ
  ├── stores/           // 汎用状態管理
  ├── testing/          // 汎用テストユーティリティ
  ├── types/            // 汎用型定義
  └── utils/            // 汎用ユーティリティ
```

## スタイリング
- TailwindCSS使用
- カスタムCSSの代わりにTailwindクラスを使用
- `<br />`を使わない
- 再利用可能なスタイルはtailwind.configで定義

## リポジトリ層のエラーハンドリング
- すべてのリポジトリ関数は例外をスローせず `Result<T>` 型を返す
- `@/types/result` から `Result`, `ok`, `err` をインポート
- データベース操作はtry-catchでラップし、エラーメッセージを返す
- 例: `return ok(entity)` または `return err("エラーメッセージ")`

## その他
- barrel filesを避ける（tree-shakingの問題）
- 直接インポートを使用
- 環境変数は.envファイルで管理
- Prismaランタイムライブラリのインポートを避ける