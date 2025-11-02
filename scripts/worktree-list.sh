#!/bin/bash
# git worktreeの一覧を表示するスクリプト
# Usage: ./scripts/worktree-list.sh

set -e

# カレントディレクトリがgitリポジトリかチェック
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: このディレクトリはgitリポジトリではありません"
    exit 1
fi

echo "=========================================="
echo "Git Worktree一覧"
echo "=========================================="
echo ""

git worktree list

echo ""
echo "=========================================="
echo "合計: $(git worktree list | wc -l) 個のworktree"
echo "=========================================="
