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

## フォルダ構造
```
src/
  ├── app/              // ルーティング
  ├── components/       // 汎用コンポーネント
  ├── features/         // 機能モジュール
  │   ├── assets/       // 機能固有の静的ファイル
  │   ├── components/   // 機能固有のコンポーネント
  │   ├── hooks/        // 機能固有のフック
  │   ├── repositories/ // 機能固有のリポジトリ
  │   └── types/        // 機能固有の型定義
  └── utils/            // 汎用ユーティリティ
```

## スタイリング
- TailwindCSS使用
- カスタムCSSの代わりにTailwindクラスを使用
- `<br />`を使わない
- 再利用可能なスタイルはtailwind.configで定義

## その他
- barrel filesを避ける（tree-shakingの問題）
- 直接インポートを使用
- 環境変数は.envファイルで管理
- Prismaランタイムライブラリのインポートを避ける