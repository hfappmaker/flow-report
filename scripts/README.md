# Git Worktree管理スクリプト

このディレクトリには、git worktreeを使ってClaude Codeを並列実行するための管理スクリプトが含まれています。

## 概要

git worktreeを使用すると、同じリポジトリの異なるブランチを同時に複数のディレクトリでチェックアウトできます。これにより、以下のことが可能になります：

- 複数のClaude Codeセッションを異なるブランチで同時に実行
- 機能開発中に緊急のバグ修正が必要になった場合でも、作業を切り替えずに対応可能
- 複数のPRを並行してレビュー・テスト可能

## 使用方法

### 1. 新しいworktreeを作成してセットアップ

**worktree-init**を使用すると、作成・セットアップ・VSCode起動を一発で実行できます：

```bash
# pnpmコマンドで実行
pnpm run worktree:init <ブランチ名> [ベースブランチ]

# または直接スクリプトを実行
./scripts/worktree-init.sh <ブランチ名> [ベースブランチ]

# Claude Code内で実行
/worktree-init <ブランチ名> [ベースブランチ]
```

**例:**

```bash
# 新しいfeature/auth-improvementブランチを作成してセットアップ（developから）
pnpm run worktree:init feature/auth-improvement

# 既存のfix/bug-123ブランチをチェックアウトしてセットアップ
pnpm run worktree:init fix/bug-123

# mainブランチをベースに新しいブランチを作成
pnpm run worktree:init feature/new-feature main
```

このコマンドは以下を自動実行します：
1. 親ディレクトリに `WorkTimeManagementV2-<ブランチ名>` を作成
2. 依存関係のインストール (`pnpm install`)
3. `.env`ファイルと`.env.development.local`のコピー
4. Prisma Clientの生成
5. `.next`ディレクトリのクリーンアップ
6. **VSCodeで自動的に開く**

完了後、すぐに開発を開始できます！

### 2. worktreeの一覧表示

```bash
pnpm run worktree:list
```

現在のすべてのworktreeとそのブランチ、パスを表示します。

### 3. worktreeの削除

```bash
pnpm run worktree:remove <worktreeパスまたはブランチ名>
```

**例:**

```bash
# ブランチ名で削除
pnpm run worktree:remove feature/auth-improvement

# パスで削除
pnpm run worktree:remove ../WorkTimeManagementV2-feature-auth-improvement
```

削除前に確認プロンプトが表示されます。

## ワークフロー例

### シナリオ1: 機能開発中に緊急バグ修正

1. 現在feature/new-featureで開発中
2. 緊急のバグ修正が必要になった

```bash
# メインworktreeで緊急修正用のworktreeを一括セットアップ
cd /WorkTimeManagementV2
pnpm run worktree:init hotfix/urgent-bug

# → VSCodeが自動的に開かれる
# → すぐにバグ修正を実施

# 修正完了後、元のworktreeに戻る
cd ../WorkTimeManagementV2

# 不要になったworktreeを削除
pnpm run worktree:remove hotfix/urgent-bug
```

### シナリオ2: 複数のClaude Codeセッションを並列実行

```bash
# 3つの異なる機能を並行開発（各コマンドでVSCodeが自動的に開かれる）
pnpm run worktree:init feature/user-auth
pnpm run worktree:init feature/payment-integration
pnpm run worktree:init feature/analytics

# → 3つのVSCodeウィンドウが開かれ、すぐに開発開始可能
# → それぞれでClaude Codeセッションを実行できる
```

## DevContainerの使用

各worktreeでDevContainerを使用できます。

### DevContainerで開く方法

1. `pnpm run worktree:init <ブランチ名>` でworktreeを作成（VSCodeが自動的に開かれる）
2. コマンドパレット（Ctrl+Shift+P / Cmd+Shift+P）を開く
3. 「Dev Containers: Reopen in Container」を選択
4. コンテナのビルドと起動を待つ

### DevContainerの特徴

- **独立したコンテナ**: 各worktreeは独自のDockerコンテナを持ちます
- **独立したボリューム**: `node_modules`や`dist`は各worktree専用のDockerボリュームに保存されます
- **コンテナ名**: 自動的にブランチ名が付加されます（例: `app_container_feature-new-auth`）
- **同時実行可能**: 複数worktreeで同時にDevContainerを起動できます

### DevContainerでの開発サーバー起動

各worktreeのコンテナ内で異なるポートを使用してください：

```bash
# worktree 1のコンテナ内
pnpm run dev  # http://localhost:3000

# worktree 2のコンテナ内（別VS Codeウィンドウ）
PORT=3001 pnpm run dev  # http://localhost:3001

# worktree 3のコンテナ内（別VS Codeウィンドウ）
PORT=3002 pnpm run dev  # http://localhost:3002
```

### DevContainerのディスク使用量

各worktreeで以下のDockerリソースが作成されます：
- コンテナイメージ（共有）
- 実行中のコンテナ
- 名前付きボリューム（`node_modules`、`dist`）

不要なworktreeを削除する際は、対応するDockerボリュームも削除することをお勧めします：

```bash
# worktreeを削除
./scripts/worktree-remove.sh feature/old-feature

# 対応するDockerボリュームを削除
docker volume rm try-node-node_modules-feature-old-feature
docker volume rm try-dist-feature-old-feature

# または、未使用のボリュームをすべて削除
docker volume prune
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
pnpm run dev  # デフォルト: http://localhost:3000

# worktree 2（別ターミナル）
PORT=3001 pnpm run dev  # http://localhost:3001

# worktree 3（別ターミナル）
PORT=3002 pnpm run dev  # http://localhost:3002
```

### node_modules

- 各worktreeは独立した`node_modules`を持ちます
- ディスク容量に注意してください
- 不要になったworktreeは削除することをお勧めします

### .next ビルドキャッシュ

- 各worktreeは独立した`.next`ディレクトリを持ちます
- ビルドキャッシュの問題が発生した場合は、`rm -rf .next`で削除してください

## トラブルシューティング

### worktree-initが失敗する

**ブランチ関連:**
- ブランチ名が既に存在する場合、既存のブランチがチェックアウトされます
- ディレクトリが既に存在する場合はエラーになります

**セットアップ関連:**
- メインworktreeに`.env.development.local`が存在することを確認してください
- `pnpm install`が失敗する場合は、`pnpm-lock.yaml`を削除して再試行してください

**VSCode起動関連:**
- `code`コマンドが見つからない場合は、手動でVSCodeを開いてください

### worktreeの削除ができない

- worktreeディレクトリ内でプロセスが実行中の場合、削除できません
- 開発サーバーやその他のプロセスを停止してから削除してください

## 参考情報

- [Git Worktree公式ドキュメント](https://git-scm.com/docs/git-worktree)
- プロジェクトルールについては`CLAUDE.md`を参照してください
