# Commit and Push with Auto-formatting

Staging済みファイルに対してESLint/Prettierでフォーマットし、警告修正を行い、コミットメッセージを自動生成してcommit & pushします。

## Command

Please perform the following steps:

1. **Get staged files**: Run `git diff --cached --name-only` to list all staged files

2. **ESLint auto-fix**: For each staged file with extensions `.ts`, `.tsx`, `.js`, `.jsx`:
   - Run `pnpm exec eslint --cache --cache-location .eslintcache "<file>" --fix` to auto-fix linting issues

3. **Check ESLint warnings**: For each staged file:
   - Run `pnpm exec eslint --cache --cache-location .eslintcache "<file>"` to check for remaining warnings
   - If warnings are found:
     - Analyze the warnings and propose fixes
     - Show the proposed changes to the user
     - Ask for user confirmation before applying the fixes
     - Apply fixes only if user approves

4. **Prettier formatting**: For each staged file with extensions `.ts`, `.tsx`, `.js`, `.jsx`:
   - Run `pnpm exec prettier --write "<file>"` to format the code

5. **Re-stage changes**: Run `git add <files>` to re-stage all modified files

6. **Analyze changes**: Run `git diff --cached` to see all staged changes

7. **Generate commit message**: Analyze the diff output and generate an appropriate commit message following Conventional Commits format:
   - Use prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`
   - Write a concise summary in Japanese
   - Include technical details if significant

8. **Commit**: Run `git commit -m "<generated-message>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"`

9. **Push**: Run `git push` to push to the remote repository

10. **Report**: Display a summary of what was done, including:
    - Number of files processed
    - ESLint warnings fixed (if any)
    - Commit message used
    - Push status

## Description

このコマンドは以下を自動化します：

1. **コード品質の保証** - ESLint/Prettierで自動修正・フォーマット
2. **警告の解決** - ESLint warningを検出し、修正案を提示
3. **効率的なコミット** - 変更内容を分析してメッセージを自動生成
4. **即座のプッシュ** - リモートリポジトリへ自動反映

## Usage

```
/commit-push
```

## Benefits

- **完全自動化**: フォーマット→警告修正→コミット→プッシュを一発で実行
- **品質保証**: コミット前に必ずコードフォーマットを実行
- **警告ゼロ**: ESLint warningを見逃さず、修正案を提示
- **適切なメッセージ**: 変更内容に基づいた自動生成
- **時間短縮**: 手動操作を最小限に
- **ユーザー確認**: Warning修正は必ずユーザーに確認

## Notes

- Staging済みファイルのみが対象
- ESLint warningが見つかった場合、修正案を提示してユーザーに確認を求める
- ユーザーが承認した場合のみ修正を適用
- フォーマット・修正後は自動的に再ステージング
- コミットメッセージはConventional Commits形式
- プッシュ前にテストは実行されません（必要に応じて事前実行を推奨）
