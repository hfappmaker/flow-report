#!/bin/bash
# git worktreeの一覧を見やすく表示するスクリプト
# Usage: ./scripts/worktree-list.sh

set -e

echo "=========================================="
echo "Git Worktree 一覧"
echo "=========================================="
echo ""

# worktreeの一覧を取得
WORKTREES=$(git worktree list --porcelain)

# worktreeが存在しない場合
if [ -z "$WORKTREES" ]; then
    echo "⚠ worktreeが見つかりませんでした"
    exit 0
fi

# カウンター
COUNT=0

# porcelain出力をパース
while IFS= read -r line; do
    if [[ $line == worktree* ]]; then
        COUNT=$((COUNT + 1))
        # パスを抽出
        WORKTREE_PATH=$(echo "$line" | awk '{print $2}')
        echo "[$COUNT] Worktree"
        echo "  パス: $WORKTREE_PATH"
    elif [[ $line == HEAD* ]]; then
        # HEADのコミットハッシュを抽出
        HEAD_HASH=$(echo "$line" | awk '{print $2}')
        echo "  HEAD: ${HEAD_HASH:0:7}"
    elif [[ $line == branch* ]]; then
        # ブランチ名を抽出（refs/heads/を除く）
        BRANCH_NAME=$(echo "$line" | sed 's|branch refs/heads/||')
        echo "  ブランチ: $BRANCH_NAME"
    elif [[ $line == detached ]]; then
        echo "  状態: detached HEAD"
    elif [[ $line == bare ]]; then
        echo "  タイプ: bare repository"
    fi

    # 空行で区切る
    if [ -z "$line" ] && [ $COUNT -gt 0 ]; then
        echo ""
    fi
done <<< "$WORKTREES"

echo "=========================================="
echo "合計: $COUNT 個のworktree"
echo "=========================================="
echo ""
