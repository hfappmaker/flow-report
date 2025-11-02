#!/bin/bash
# git worktreeを作成するスクリプト
# Usage: ./scripts/worktree-create.sh <branch-name> [base-branch]

set -e

# 引数チェック
if [ -z "$1" ]; then
    echo "Error: ブランチ名を指定してください"
    echo "Usage: $0 <branch-name> [base-branch]"
    exit 1
fi

BRANCH_NAME="$1"
BASE_BRANCH="${2:-develop}"  # デフォルトはdevelopブランチ

# ブランチ名をファイルシステムに安全な形式に変換（/ → -）
SAFE_BRANCH_NAME=$(echo "$BRANCH_NAME" | sed 's/\//-/g')

# 現在のリポジトリのルートディレクトリを取得
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")

# worktreeのディレクトリ名を生成（親ディレクトリに作成）
WORKTREE_DIR="$(dirname "$REPO_ROOT")/${REPO_NAME}-${SAFE_BRANCH_NAME}"

# worktreeディレクトリが既に存在する場合はエラー
if [ -d "$WORKTREE_DIR" ]; then
    echo "Error: ディレクトリが既に存在します: $WORKTREE_DIR"
    exit 1
fi

echo "=========================================="
echo "Git Worktree作成"
echo "=========================================="
echo "ブランチ名: $BRANCH_NAME"
echo "ベースブランチ: $BASE_BRANCH"
echo "作成先: $WORKTREE_DIR"
echo "=========================================="

# ブランチが既に存在するかチェック
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "既存のブランチ '$BRANCH_NAME' をチェックアウトします..."
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
else
    echo "新しいブランチ '$BRANCH_NAME' を作成します (ベース: $BASE_BRANCH)..."
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "$BASE_BRANCH"
fi

echo ""
echo "✓ Worktreeが作成されました: $WORKTREE_DIR"
echo ""

# .devcontainerディレクトリをworktree用にコピー・調整
if [ -d "$REPO_ROOT/.devcontainer" ]; then
    echo "🔧 DevContainer設定をworktree用に調整中..."

    # .devcontainerディレクトリをコピー
    cp -r "$REPO_ROOT/.devcontainer" "$WORKTREE_DIR/.devcontainer"

    # コンテナ内のworkspaceFolder名を設定
    WORKTREE_DIRNAME="${REPO_NAME}-${SAFE_BRANCH_NAME}"

    # devcontainer.jsonのworkspaceFolderを更新
    sed -i "s|\"workspaceFolder\": \"/WorkTimeManagementV2\"|\"workspaceFolder\": \"/${WORKTREE_DIRNAME}\"|g" \
        "$WORKTREE_DIR/.devcontainer/devcontainer.json"

    # devcontainer.jsonのボリューム名をworktree固有に変更
    sed -i "s|try-node-node_modules|try-node-node_modules-${SAFE_BRANCH_NAME}|g" \
        "$WORKTREE_DIR/.devcontainer/devcontainer.json"
    sed -i "s|try-dist|try-dist-${SAFE_BRANCH_NAME}|g" \
        "$WORKTREE_DIR/.devcontainer/devcontainer.json"

    # docker-compose.ymlのコンテナ名をworktree固有に変更
    sed -i "s|container_name: app_container|container_name: app_container_${SAFE_BRANCH_NAME}|g" \
        "$WORKTREE_DIR/.devcontainer/docker-compose.yml"

    # docker-compose.ymlのボリュームマウント先を更新
    sed -i "s|- \\.\\./:/WorkTimeManagementV2:cached|- ../:/${WORKTREE_DIRNAME}:cached|g" \
        "$WORKTREE_DIR/.devcontainer/docker-compose.yml"

    # .devcontainerをgitの追跡対象から除外（worktree固有の設定）
    echo ".devcontainer/" >> "$WORKTREE_DIR/.git/info/exclude"
    echo "✓ .devcontainerをgit追跡対象から除外しました"

    echo "✓ DevContainer設定の調整完了"
    echo ""
fi

echo "次のステップ:"
echo "1. worktreeディレクトリに移動:"
echo "   cd $WORKTREE_DIR"
echo ""
echo "2. 初期セットアップを実行:"
echo "   ./scripts/worktree-setup.sh"
echo ""
echo "3. (オプション) DevContainerで開く:"
echo "   VS Codeで $WORKTREE_DIR を開き、"
echo "   「Reopen in Container」を選択"
echo ""
