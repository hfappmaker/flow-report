# Commit and Push with Auto-formatting

Staging済みファイルに対してPrettierでフォーマットし、コミットメッセージを自動生成してcommit & pushします。

## Command

Please perform the following steps:

1. **Get staged files**: Run `git diff --cached --name-only` to list all staged files

2. **Prettier formatting**: Process files ONE BY ONE (do NOT batch multiple files):
   - For each staged file with extensions `.ts`, `.tsx`, `.js`, `.jsx`:
     - Run `pnpm exec prettier --write "<file>"`
     - Wait for the command to complete before processing the next file
     - IMPORTANT: Run a separate command for each file, never combine multiple files in one command

3. **Re-stage changes**: Run `git add <files>` to re-stage all modified files

4. **Analyze changes**: Run `git diff --cached` to see all staged changes

5. **Generate commit message**: Analyze the diff output and generate an appropriate commit message following Conventional Commits format:
   - Use prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`
   - Write a concise summary in Japanese
   - Include technical details if significant

6. **Commit**: Run `git commit -m "<generated-message>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"`

7. **Push**: Run `git push` to push to the remote repository

8. **Report**: Display a summary of what was done, including:
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
