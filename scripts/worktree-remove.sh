#!/bin/bash
# git worktreeを削除するスクリプト
# Usage: ./scripts/worktree-remove.sh
# 現在のディレクトリのworktreeを削除し、VSCodeウィンドウを自動的に閉じます

set -e

# カレントディレクトリがgitリポジトリかチェック
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: このディレクトリはgitリポジトリではありません"
    exit 1
fi

# 現在のディレクトリを取得
CURRENT_DIR=$(pwd)

# メインのworktreeかどうかを判定
MAIN_WORKTREE=$(git worktree list --porcelain | grep "^worktree " | head -n 1 | cut -d' ' -f2)

if [ "$CURRENT_DIR" = "$MAIN_WORKTREE" ]; then
    echo "Error: メインのworktreeでは実行できません"
    echo ""
    echo "このスクリプトはworktreeのVSCodeから実行してください。"
    echo ""
    echo "現在のworktree一覧:"
    git worktree list
    exit 1
fi

# 現在のディレクトリがworktreeのリストに含まれているか確認
if ! git worktree list --porcelain | grep -q "^worktree $CURRENT_DIR$"; then
    echo "Error: 現在のディレクトリはworktreeではありません"
    echo ""
    echo "現在のworktree一覧:"
    git worktree list
    exit 1
fi

WORKTREE_PATH="$CURRENT_DIR"

echo "=========================================="
echo "Git Worktree削除"
echo "=========================================="
echo "削除対象: $WORKTREE_PATH"
echo "=========================================="
echo ""

# 実行コンテキストを検出（このworktreeのVSCodeから実行されているか）
IN_TARGET_VSCODE=false

if [[ "$CURRENT_DIR" == "$WORKTREE_PATH"* ]]; then
    IN_TARGET_VSCODE=true
    echo "ℹ️  削除後、VSCodeウィンドウは自動的に閉じられます。"
    echo ""
fi

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

# VSCodeウィンドウを自動的に閉じる
if [ "$IN_TARGET_VSCODE" = true ]; then
    echo ""
    echo "🔄 VSCodeウィンドウを閉じています..."

    # VSCodeのウィンドウを閉じるコマンドをバックグラウンドで実行
    # エラーが発生しても無視する（codeコマンドが利用できない環境でも動作するように）
    (code --command "workbench.action.closeWindow" 2>/dev/null || true) &

    # 少し待機してからスクリプトを終了（VSCodeコマンドが実行される時間を確保）
    sleep 1
    exit 0
fi
