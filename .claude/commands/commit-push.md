# Commit and Push

Staging済みファイルに対してコミットメッセージを自動生成してcommit & pushします。
Prettierフォーマットはhusky+lint-stagedのpre-commitフックで自動適用されるため、ここでは実行しません。

## Command

Please perform the following steps:

1. **Analyze changes**: Run `git diff --cached` to see all staged changes
   - If there are no staged changes, abort with a message asking the user to stage files first

2. **Generate commit message**: Analyze the diff output and generate an appropriate commit message following Conventional Commits format:
   - Use prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`
   - Write a concise summary in Japanese
   - Include technical details if significant

3. **Commit**: Run `git commit -m "<generated-message>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"`
   - The pre-commit hook will run lint-staged and auto-format files. If formatting modifies files, lint-staged will re-stage them automatically.
   - If the hook fails (e.g. Prettier error on an unsupported file), report the failure to the user and stop. Do NOT bypass the hook with `--no-verify`.

4. **Push**: Run `git push` to push to the remote repository

5. **Report**: Display a summary of what was done, including:
   - Commit hash and message used
   - Push status

## Description

このコマンドは以下を自動化します：

1. **効率的なコミット** - 変更内容を分析してコミットメッセージを自動生成
2. **即座のプッシュ** - リモートリポジトリへ自動反映

フォーマット処理はpre-commitフック(husky+lint-staged)に委譲しています。

## Usage

```
/commit-push
```

## Notes

- Staging済みファイルのみが対象
- Prettierフォーマットはpre-commitフックで自動適用される
- コミットメッセージはConventional Commits形式
- プッシュ前にテストは実行されません（必要に応じて事前実行を推奨）
- フックを`--no-verify`で回避することはしない
