#!/bin/bash
# git worktreeの作成、セットアップ、VSCode起動を一括で行うスクリプト
# Usage: ./scripts/worktree-init.sh <branch-name> [base-branch]

set -e

# 引数チェック
if [ -z "$1" ]; then
    echo "Error: ブランチ名を指定してください"
    echo "Usage: $0 <branch-name> [base-branch]"
    exit 1
fi

BRANCH_NAME="$1"
BASE_BRANCH="${2:-develop}"

# ブランチ名をファイルシステムに安全な形式に変換（/ → -）
SAFE_BRANCH_NAME=$(echo "$BRANCH_NAME" | sed 's/\//-/g')

# 現在のリポジトリのルートディレクトリを取得
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")

# worktreeのディレクトリ名を生成（親ディレクトリに作成）
WORKTREE_DIR="$(dirname "$REPO_ROOT")/${REPO_NAME}-${SAFE_BRANCH_NAME}"

echo "=========================================="
echo "Git Worktree 統合セットアップ"
echo "=========================================="
echo "ブランチ名: $BRANCH_NAME"
echo "ベースブランチ: $BASE_BRANCH"
echo "作成先: $WORKTREE_DIR"
echo "=========================================="
echo ""

# Step 1: Worktreeの作成
echo "Step 1/3: Worktreeを作成中..."
echo "----------------------------------------"

# worktreeディレクトリが既に存在する場合はエラー
if [ -d "$WORKTREE_DIR" ]; then
    echo "Error: ディレクトリが既に存在します: $WORKTREE_DIR"
    exit 1
fi

# ブランチが既に存在するかチェック
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "既存のブランチ '$BRANCH_NAME' をチェックアウトします..."
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
else
    echo "新しいブランチ '$BRANCH_NAME' を作成します (ベース: $BASE_BRANCH)..."
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "$BASE_BRANCH"
fi

echo "✓ Worktree作成完了"
echo ""

# Step 2: 初期セットアップ
echo "Step 2/3: 初期セットアップを実行中..."
echo "----------------------------------------"
cd "$WORKTREE_DIR"

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile
else
    pnpm install
fi
echo "✓ 依存関係のインストール完了"
echo ""

# .envファイルのコピー（存在しない場合のみ）
MAIN_WORKTREE=$(git worktree list | head -n 1 | awk '{print $1}')

if [ ! -f ".env.development.local" ] && [ -f "$MAIN_WORKTREE/.env.development.local" ]; then
    echo "📄 .env.development.localをコピー中..."
    cp "$MAIN_WORKTREE/.env.development.local" .env.development.local
    echo "✓ .env.development.localをコピーしました"
    echo ""
fi

if [ ! -f ".env" ] && [ -f "$MAIN_WORKTREE/.env" ]; then
    echo "📄 .envをコピー中..."
    cp "$MAIN_WORKTREE/.env" .env
    echo "✓ .envをコピーしました"
    echo ""
fi

# Prisma Clientの生成
echo "🔧 Prisma Clientを生成中..."
pnpm exec prisma generate
echo "✓ Prisma Client生成完了"
echo ""

# .nextディレクトリのクリーンアップ
if [ -d ".next" ]; then
    echo "🧹 .nextディレクトリをクリーンアップ中..."
    rm -rf .next
    echo "✓ .nextディレクトリをクリーンアップしました"
    echo ""
fi

echo "✓ セットアップ完了"
echo ""

# Step 3: VSCodeを起動
echo "Step 3/3: VSCodeを起動中..."
echo "----------------------------------------"

# codeコマンドが利用可能かチェック
if command -v code &> /dev/null; then
    code "$WORKTREE_DIR"
    echo "✓ VSCodeを起動しました"
else
    echo "⚠ 'code'コマンドが見つかりません"
    echo "  VSCodeを手動で開いてください: $WORKTREE_DIR"
fi

echo ""
echo "=========================================="
echo "✓ すべての処理が完了しました！"
echo "=========================================="
echo ""
echo "Worktreeディレクトリ: $WORKTREE_DIR"
echo ""
echo "次のステップ:"
echo "1. VSCodeでworktreeが開かれます"
echo "2. (オプション) DevContainerで開く:"
echo "   「Reopen in Container」を選択"
echo "3. 開発サーバーを起動:"
echo "   pnpm run dev"
echo ""
