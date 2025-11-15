#!/bin/bash
# git worktreeを削除するスクリプト
# Usage: ./scripts/worktree-remove.sh <worktree-path or branch-name>

set -e

# 引数チェック
if [ -z "$1" ]; then
    echo "Error: worktreeのパスまたはブランチ名を指定してください"
    echo "Usage: $0 <worktree-path or branch-name>"
    echo ""
    echo "現在のworktree一覧:"
    git worktree list
    exit 1
fi

WORKTREE_INPUT="$1"

# カレントディレクトリがgitリポジトリかチェック
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: このディレクトリはgitリポジトリではありません"
    exit 1
fi

# 入力がパスかブランチ名かを判定
if [ -d "$WORKTREE_INPUT" ]; then
    # パスとして存在する場合
    WORKTREE_PATH="$WORKTREE_INPUT"
else
    # ブランチ名として扱う
    # ブランチ名をファイルシステムに安全な形式に変換（/ → -）
    SAFE_BRANCH_NAME=$(echo "$WORKTREE_INPUT" | sed 's/\//-/g')
    REPO_ROOT=$(git rev-parse --show-toplevel)
    REPO_NAME=$(basename "$REPO_ROOT")
    WORKTREE_PATH="$(dirname "$REPO_ROOT")/${REPO_NAME}-${SAFE_BRANCH_NAME}"

    if [ ! -d "$WORKTREE_PATH" ]; then
        echo "Error: worktreeが見つかりません: $WORKTREE_PATH"
        echo ""
        echo "現在のworktree一覧:"
        git worktree list
        exit 1
    fi
fi

echo "=========================================="
echo "Git Worktree削除"
echo "=========================================="
echo "削除対象: $WORKTREE_PATH"
echo "=========================================="
echo ""

# 確認プロンプト
read -p "このworktreeを削除してもよろしいですか？ (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "キャンセルしました"
    exit 0
fi

# worktreeを削除
echo "🗑️  Worktreeを削除中..."
git worktree remove "$WORKTREE_PATH"

# ディレクトリが残っている場合は削除
if [ -d "$WORKTREE_PATH" ]; then
    echo "🗑️  ディレクトリを削除中..."
    rm -rf "$WORKTREE_PATH"
fi

echo ""
echo "✓ Worktreeが削除されました: $WORKTREE_PATH"
echo ""
echo "残りのworktree:"
git worktree list
