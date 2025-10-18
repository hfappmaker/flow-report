# Lint Active File

アクティブファイルに対してESLintチェックと自動修正、Prettierフォーマットを実行します。

## Command

Please run ESLint and Prettier on the file I'm currently viewing. Execute these commands:

1. Run `npx eslint <file-path> --fix` to check and auto-fix linting issues
2. Run `npx prettier --write <file-path>` to format the code
3. Report the results

Where `<file-path>` is the file path shown in the system reminder about the opened file.

## Description

このコマンドは以下の処理を順次実行します：

1. **システムリマインダーからファイルパスを取得** - Claudeが自動認識
2. **ESLintによる自動修正** - 修正可能なlintエラーを自動修正
3. **Prettierによるフォーマット** - コードスタイルの統一
4. **実行結果の報告** - 各ステップの成功/失敗を表示

## Usage

ファイルをエディタで開いた状態で、チャットで以下を入力：

```
/lint-active
```

## Target Files

- TypeScript (.ts, .tsx)
- JavaScript (.js, .jsx)
- その他ESLint設定で対象となるファイル

## Benefits

- **一括処理**: lintチェック + 自動修正 + フォーマットを一度に実行
- **即座の品質向上**: 修正可能な問題を瞬時に解決
- **一貫性の確保**: プロジェクトのコーディング規約に準拠
- **効率的な開発**: 手動でのlint実行が不要