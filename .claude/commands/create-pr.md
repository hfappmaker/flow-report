# Create Pull Request with Auto-formatting

Staging済みファイルに対してPrettierでフォーマットし、コミットメッセージとPR説明を自動生成してcommit & push & PR作成します。

## Command

Please perform the following steps:

1. **Get current branch**: Run `git branch --show-current` to get the current branch name

2. **Execute shared steps**: Follow all steps in `.claude/commands/_shared/lint-format-commit-push.md`
   - Note: For the push step, use `git push -u origin <current-branch>` instead of `git push`

3. **Generate PR description**: Analyze all commits in the current branch (compared to develop) and generate a PR description:
   - Run `git log develop..HEAD --oneline` to see all commits
   - Run `git diff develop...HEAD` to see all changes
   - Generate a comprehensive PR description including:
     - ## Summary: Brief overview of changes
     - ## Changes: Bulleted list of key changes
     - ## Technical Details: Implementation details if significant
     - ## Test Plan: Suggested testing steps
     - Add footer: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

4. **Create Pull Request**: Use GitHub MCP to create the PR:
   - Use `mcp__github__create_pull_request` tool
   - Set `owner` and `repo` from git remote
   - Set `title` as the PR summary (first line of description)
   - Set `body` as the full PR description
   - Set `head` as current branch
   - Set `base` as "develop"

5. **Report**: Display a summary including:
   - Number of files processed
   - Commit message used
   - Push status
   - PR URL

## Description

このコマンドは以下を自動化します：

1. **コード品質の保証** - Prettierで自動フォーマット
2. **効率的なコミット** - 変更内容を分析してメッセージを自動生成
3. **即座のプッシュ** - リモートリポジトリへ自動反映
4. **PR自動作成** - GitHub MCPでプルリクエストを作成

## Usage

```
/create-pr
```

## Benefits

- **完全自動化**: フォーマット→コミット→プッシュ→PR作成を一発で実行
- **品質保証**: コミット前に必ずコードフォーマットを実行
- **適切なメッセージ**: 変更内容に基づいた自動生成
- **包括的なPR説明**: ブランチ全体の変更を分析して詳細な説明を生成
- **時間短縮**: 手動操作を最小限に

## Notes

- Staging済みファイルのみが対象
- フォーマット後は自動的に再ステージング
- コミットメッセージはConventional Commits形式
- PRのベースブランチは`develop`
- GitHub MCPの権限が必要
- プッシュ前にテストは実行されません（必要に応じて事前実行を推奨）
