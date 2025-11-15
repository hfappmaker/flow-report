# Worktree Init - Complete Setup with VSCode

新しいgit worktreeを作成し、セットアップを実行し、VSCodeで開くまでを一括で行います。

## Command

Please perform the following steps:

1. **Get branch name from user**:
   - Ask the user for the branch name if not provided as an argument
   - Optionally ask for base branch (default: develop)

2. **Execute worktree-init script**:
   - Run `bash scripts/worktree-init.sh <branch-name> [base-branch]`
   - This script will:
     - Create a new git worktree in the parent directory
     - Install dependencies with `pnpm install`
     - Copy `.env` files from the main worktree
     - Generate Prisma Client
     - Clean up `.next` directory
     - Open the worktree in VSCode

3. **Monitor progress**:
   - Display the script output to the user
   - Show completion status

4. **Report results**:
   - Display the worktree directory path
   - Confirm VSCode has been opened
   - Provide next steps (e.g., "Reopen in Container", start dev server)

## Description

このコマンドは並列開発のための完全なworktree環境を一発でセットアップします：

1. **Worktree作成** - 新規ブランチまたは既存ブランチをチェックアウト
2. **依存関係インストール** - pnpm install実行
3. **環境変数コピー** - メインworktreeから.envファイルをコピー
4. **Prisma生成** - Prisma Clientを生成
5. **VSCode起動** - 新しいworktreeを自動的にVSCodeで開く

## Usage

```
/worktree-init <branch-name> [base-branch]
```

### Examples

```
# 新しいfeatureブランチを作成（ベース: develop）
/worktree-init feature/new-feature

# 既存のブランチをチェックアウト
/worktree-init bugfix/fix-123

# カスタムベースブランチを指定
/worktree-init feature/experimental main
```

## Benefits

- **完全自動化**: 作成→セットアップ→VSCode起動を一発で実行
- **並列開発**: 複数の機能を同時に開発可能
- **環境分離**: 各worktreeで独立したnode_modulesと.nextキャッシュ
- **即座に開発開始**: セットアップ完了後すぐにコーディング可能
- **時間短縮**: 手動セットアップの手間を完全に削減

## What Gets Created

作成されるディレクトリ構造:

```
parent-directory/
├── WorkTimeManagementV2/              # メインworktree (develop)
└── WorkTimeManagementV2-feature-new-feature/  # 新しいworktree
    ├── node_modules/                  # 独立した依存関係
    ├── .next/                         # 独立したビルドキャッシュ
    ├── .env.development.local         # コピーされた環境変数
    └── ... (すべてのプロジェクトファイル)
```

## Notes

- ブランチ名の `/` は自動的に `-` に変換されます（例: `feature/auth` → `WorkTimeManagementV2-feature-auth`）
- 新規ブランチの場合、デフォルトで`develop`ブランチをベースに作成されます
- 環境変数ファイル（`.env`、`.env.development.local`）はメインworktreeからコピーされます
- データベースは全worktreeで共有されます（同じDATABASE_URL）
- VSCodeが複数ウィンドウで開かれます（各worktreeごと）
- DevContainerを使用する場合は、VSCodeで "Reopen in Container" を選択してください
- 開発サーバー起動時はポート番号の競合に注意（`PORT`環境変数で変更可能）

## Cleanup

Worktreeが不要になった場合:

```
/worktree-remove <branch-name>
```

または直接:

```
pnpm run worktree:remove <branch-name>
```

## Related Commands

- `pnpm run worktree:create` - Worktree作成のみ
- `pnpm run worktree:setup` - セットアップのみ（worktree内で実行）
- `pnpm run worktree:list` - 既存worktree一覧
- `pnpm run worktree:remove` - Worktree削除
