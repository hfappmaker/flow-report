# Git Worktree管理スクリプト

このディレクトリには、git worktreeを使ってClaude Codeを並列実行するための管理スクリプトが含まれています。

## 概要

git worktreeを使用すると、同じリポジトリの異なるブランチを同時に複数のディレクトリでチェックアウトできます。これにより、以下のことが可能になります：

- 複数のClaude Codeセッションを異なるブランチで同時に実行
- 機能開発中に緊急のバグ修正が必要になった場合でも、作業を切り替えずに対応可能
- 複数のPRを並行してレビュー・テスト可能

## 使用方法

### 1. 新しいworktreeを作成

```bash
./scripts/worktree-create.sh <ブランチ名> [ベースブランチ]
```

**例:**

```bash
# 新しいfeature/auth-improvementブランチを作成（developから）
./scripts/worktree-create.sh feature/auth-improvement

# 既存のfix/bug-123ブランチをチェックアウト
./scripts/worktree-create.sh fix/bug-123

# mainブランチをベースに新しいブランチを作成
./scripts/worktree-create.sh feature/new-feature main
```

このコマンドは、親ディレクトリに `WorkTimeManagementV2-<ブランチ名>` という名前のディレクトリを作成します。

### 2. worktreeの初期セットアップ

新しく作成したworktreeディレクトリに移動して、セットアップスクリプトを実行します：

```bash
cd ../WorkTimeManagementV2-<ブランチ名>
./scripts/worktree-setup.sh
```

このスクリプトは以下を実行します：
- 依存関係のインストール (`npm ci` または `npm install`)
- `.env`ファイルと`.env.development.local`のコピー（メインworktreeから）
- Prisma Clientの生成
- `.next`ディレクトリのクリーンアップ

### 3. worktreeの一覧表示

```bash
./scripts/worktree-list.sh
```

現在のすべてのworktreeとそのブランチ、パスを表示します。

### 4. worktreeの削除

```bash
./scripts/worktree-remove.sh <worktreeパスまたはブランチ名>
```

**例:**

```bash
# ブランチ名で削除
./scripts/worktree-remove.sh feature/auth-improvement

# パスで削除
./scripts/worktree-remove.sh ../WorkTimeManagementV2-feature-auth-improvement
```

削除前に確認プロンプトが表示されます。

## ワークフロー例

### シナリオ1: 機能開発中に緊急バグ修正

1. 現在feature/new-featureで開発中
2. 緊急のバグ修正が必要になった

```bash
# メインworktreeで緊急修正用のworktreeを作成
cd /WorkTimeManagementV2
./scripts/worktree-create.sh hotfix/urgent-bug

# 新しいworktreeに移動してセットアップ
cd ../WorkTimeManagementV2-hotfix-urgent-bug
./scripts/worktree-setup.sh

# バグ修正を実施
# ...

# 修正完了後、元のworktreeに戻る
cd ../WorkTimeManagementV2

# 不要になったworktreeを削除
./scripts/worktree-remove.sh hotfix/urgent-bug
```

### シナリオ2: 複数のClaude Codeセッションを並列実行

```bash
# 3つの異なる機能を並行開発
./scripts/worktree-create.sh feature/user-auth
./scripts/worktree-create.sh feature/payment-integration
./scripts/worktree-create.sh feature/analytics

# それぞれのworktreeでセットアップして開発開始
# ターミナルを3つ開いて、それぞれで作業可能
```

## 注意事項

### データベース

- すべてのworktreeは同じデータベースを共有します
- `.env.development.local`ファイルがメインworktreeからコピーされるため、同じデータベース接続情報を使用します
- データベーススキーマの変更を行う場合は注意が必要です

### ポート番号

- 開発サーバーを複数起動する場合、デフォルトのポート（3000）が競合します
- 各worktreeで異なるポートを使用してください：

```bash
# worktree 1
npm run dev  # デフォルト: http://localhost:3000

# worktree 2（別ターミナル）
PORT=3001 npm run dev  # http://localhost:3001

# worktree 3（別ターミナル）
PORT=3002 npm run dev  # http://localhost:3002
```

### node_modules

- 各worktreeは独立した`node_modules`を持ちます
- ディスク容量に注意してください
- 不要になったworktreeは削除することをお勧めします

### .next ビルドキャッシュ

- 各worktreeは独立した`.next`ディレクトリを持ちます
- ビルドキャッシュの問題が発生した場合は、`rm -rf .next`で削除してください

## トラブルシューティング

### worktreeの作成に失敗する

- ブランチ名が既に存在する場合、既存のブランチがチェックアウトされます
- ディレクトリが既に存在する場合はエラーになります

### セットアップスクリプトが失敗する

- メインworktreeに`.env.development.local`が存在することを確認してください
- `npm ci`が失敗する場合は、`package-lock.json`を削除して再試行してください

### worktreeの削除ができない

- worktreeディレクトリ内でプロセスが実行中の場合、削除できません
- 開発サーバーやその他のプロセスを停止してから削除してください

## 参考情報

- [Git Worktree公式ドキュメント](https://git-scm.com/docs/git-worktree)
- プロジェクトルールについては`CLAUDE.md`を参照してください
