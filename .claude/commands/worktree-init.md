# Worktree Init - Complete Setup with VSCode

新しいgit worktreeを作成し、セットアップを実行し、VSCodeで開くまでを一括で行います。

## Command

Please perform the following steps:

1. **Get branch name from user**:
   - Ask the user for the branch name if not provided as an argument
   - Optionally ask for base branch (default: develop)

2. **Execute worktree-init script**:
   - Run `bash scripts/worktree-init.sh <branch-name> [base-branch]`
   - Display the script output to the user

3. **Report completion**:
   - Confirm the worktree directory path
   - Confirm VSCode has been opened
   - Remind the user they can use "Reopen in Container" if needed

## Description

並列開発のための完全なworktree環境を一発でセットアップします。

**自動実行される処理:**

1. Worktree作成（新規ブランチまたは既存ブランチ）
2. 依存関係インストール（pnpm install）
3. 環境変数コピー（.envファイル）
4. Prisma Client生成
5. VSCode起動

## Usage

```
/worktree-init <branch-name> [base-branch]
```

**Examples:**

```
/worktree-init feature/new-feature
/worktree-init bugfix/fix-123
/worktree-init feature/experimental main
```

## Notes

- デフォルトベースブランチ: `develop`
- 作成先: 親ディレクトリに`WorkTimeManagementV2-<ブランチ名>`
- ブランチ名の`/`は自動的に`-`に変換
- DevContainer使用時は "Reopen in Container" を選択
- 複数worktreeで開発サーバー起動時はポート番号に注意（`PORT`環境変数で変更）

## Cleanup

```
/worktree-remove <branch-name>
```
