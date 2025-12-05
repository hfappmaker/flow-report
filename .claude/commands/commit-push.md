# Commit and Push with Auto-formatting

Staging済みファイルに対してPrettierでフォーマットし、コミットメッセージを自動生成してcommit & pushします。

## Command

Please perform the following steps:

1. **Execute shared steps**: Follow all steps in `.claude/commands/_shared/lint-format-commit-push.md`

2. **Report**: Display a summary of what was done, including:
   - Number of files processed
   - Commit message used
   - Push status

## Description

このコマンドは以下を自動化します：

1. **コード品質の保証** - Prettierで自動フォーマット
2. **効率的なコミット** - 変更内容を分析してメッセージを自動生成
3. **即座のプッシュ** - リモートリポジトリへ自動反映

## Usage

```
/commit-push
```

## Benefits

- **完全自動化**: フォーマット→コミット→プッシュを一発で実行
- **品質保証**: コミット前に必ずコードフォーマットを実行
- **適切なメッセージ**: 変更内容に基づいた自動生成
- **時間短縮**: 手動操作を最小限に

## Notes

- Staging済みファイルのみが対象
- フォーマット後は自動的に再ステージング
- コミットメッセージはConventional Commits形式
- プッシュ前にテストは実行されません（必要に応じて事前実行を推奨）
